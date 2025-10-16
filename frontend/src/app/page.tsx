// app/page.tsx
'use client';

import { useState, useRef } from 'react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { ChatInputOperator } from '@/components/chat/ChatFromOperator';
import { HintsPanel } from '@/components/hints/HintsPanel';
import { ResizablePanels } from '@/components/ui/ResizablePanels';
import { ChatTerminal } from '@/components/chat/ChatTerminal';
import { ApiResponse, Hint, Message, ResponseItem } from '@/interface';
import { Loading } from '@/components/Loading';

export default function Home() {
  const [operatorMessages, setOperatorMessages] = useState<Message[]>([]);
  const [operatorInput, setOperatorInput] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [hints, setHints] = useState<Hint[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [responseData, setResponseData] = useState<ResponseItem[]>([]);
  const [isLoading, setLoading] = useState(false);

  const operatorInputRef = useRef<HTMLTextAreaElement | null>(null);

  const handleQuery = async (query: string) => {
    const clientMessage: Message = {
      id: Date.now().toString(),
      text: query,
      sender: 'client',
      timestamp: new Date(),
    };
    setOperatorMessages((prev) => [...prev, clientMessage]);

    try {
      setHints([]);
      setShowHints(false);
      setLoading(true);

      // Реальный запрос к FastAPI
      const response = await fetch('http://127.0.0.1:8000/request/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = (await response.json()) as ApiResponse;

      if (!Array.isArray(data.options)) {
        throw new Error('Invalid API response: options is not an array');
      }

      const modelAnswerId = data.model_answer;
      const mainOption = data.options.find((opt) => opt.id === modelAnswerId);
      const otherOptions = data.options.filter((opt) => opt.id !== modelAnswerId);
      const orderedOptions = mainOption ? [mainOption, ...otherOptions] : data.options;

      const hintList: Hint[] = orderedOptions.map((opt, index) => ({
        id: `hint-${opt.id ?? index}`,
        text: opt.payload['Шаблонный ответ'] || 'Без текста ответа',
        isBestVariant: opt.id === modelAnswerId,
        category: opt.payload['Основная категория'] || '',
        subcategory: opt.payload['Подкатегория'] || '',
      }));

      const newItem: ResponseItem = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        content: data,
      };
      setResponseData((prev) => [...prev, newItem]);

      setHints(hintList);
      setShowHints(true);
    } catch (error) {
      console.error('Ошибка при запросе к API:', error);

      setHints([
        {
          id: 'error',
          text: '❌ Не удалось получить подсказки от сервера',
          isBestVariant: false,
          category: '',
          subcategory: '',
        },
      ]);
      setShowHints(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOperatorMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'operator',
      timestamp: new Date(),
    };
    setOperatorMessages((prev) => [...prev, newMessage]);
  };

  const handleHintSelect = (text: string) => {
    setOperatorInput(text);
    operatorInputRef.current?.focus();
  };

  const toggleHints = () => setShowHints((s) => !s);

  return (
    <div className="h-screen w-screen bg-gray-50 overflow-auto">
      <div className="h-full w-full p-6">
        <ResizablePanels initialSizes={[30, 70]} minSize={20}>
          {/* Left Panel - Query + Terminal */}
          <ResizablePanels initialSizes={[15, 85]} minSize={15} direction="vertical">
            {/* Ask a question */}
            <div className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden h-full">
              <div className="flex justify-center p-4 border-b border-gray-200 bg-gray-100 flex-shrink-0">
                <div className="flex flex-col items-center">
                  <h2 className="text-lg font-semibold text-black">Ask a Question</h2>
                  <div className="text-xs text-gray-400 mt-1">Send a message to Operator</div>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full p-1">
                  <ChatInputOperator
                    disabled={isLoading}
                    onSendMessage={handleQuery}
                    placeholder="Type your question..."
                    initialValue={queryInput}
                    onValueChange={setQueryInput}
                    hideLeftIcon={true}
                  />
                </div>
              </div>
            </div>

            {/* Terminal */}
            <div className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden h-full">
              <div className="flex items-center justify-center p-4 border-b border-gray-200 bg-gray-100 flex-shrink-0">
                <div className="flex flex-col items-center">
                  <h2 className="text-lg font-semibold text-black">Terminal</h2>
                  <div className="text-xs text-gray-400 mt-1">Logs</div>
                </div>
              </div>
              <div className="flex-1 flex flex-col overflow-auto p-4 gap-8">
                <ChatTerminal responseData={responseData} />
              </div>
            </div>
          </ResizablePanels>

          {/* Operator Chat */}
          <div className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-black">Operator Chat</h2>
                <div className="text-xs text-gray-400 mt-1">Live Session</div>
              </div>
            </div>
            <ChatContainer messages={operatorMessages} category="General" title="" isClientView={false} />
            <div className="flex-shrink-0">
              {isLoading ? <Loading /> : showHints && <HintsPanel hints={hints} onHintSelect={handleHintSelect} />}
              <div className="border-t border-gray-200 bg-gray-100">
                <ChatInputOperator
                  onSendMessage={handleOperatorMessage}
                  placeholder="Type your message..."
                  initialValue={operatorInput}
                  onValueChange={setOperatorInput}
                  isSparkleOpen={showHints}
                  onToggleSparkle={toggleHints}
                  inputRef={operatorInputRef}
                />
              </div>
            </div>
          </div>
        </ResizablePanels>
      </div>
    </div>
  );
}