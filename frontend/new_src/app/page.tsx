// app/page.tsx
'use client';

import { useState, useRef } from 'react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { ChatInputOperator } from '@/components/chat/ChatFromOperator';
import { HintsPanel } from '@/components/hints/HintsPanel';
import { ResizablePanels } from '@/components/ui/ResizablePanels';
import { ChatTerminal } from '@/components/chat/ChatTerminal';
import { ApiResponse, Hint, Message, ResponseItem } from '@/interface';
import { mockDataResponse } from '@/lib/mockData';
import { Loading } from '@/components/Loading';

export default function Home() {
  const [operatorMessages, setOperatorMessages] = useState<Message[]>([]);
  const [operatorInput, setOperatorInput] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [hints, setHints] = useState<Hint[]>([]);
  const [showHints, setShowHints] = useState(false);

  /** Состояния responseData (сохраняем дату после запроса), isLoading(true во время загрузки, false после) */
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
      /** обнуляем подсказки и начинаем загрузку данных */
      setHints([]);
      setShowHints(false);
      setLoading(true);

      /** РАССКОМЕНТИРОВАТЬ загрузку данных т.к использовал моковые данные */

      // const response = await fetch('http://127.0.0.1:8000/request/', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ text: query }),
      // });

      /** получение моковыъ данных после выполнения запроса. можно удалить после получения реальных запросов */
      const getMockResponse = async () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(mockDataResponse);
          }, 3000);
        });
      };

      /** запрос за данными. можно удалить после получения реальных запросов */
      const response = await getMockResponse();
      const data = response as ApiResponse;

      /** РАССКОМЕНТИРОВАТЬ  */
      // if (!response.ok) {
      //   throw new Error(`HTTP ${response.status}`);
      // }
      // const data = (await response.json()) as ApiResponse;

      if (!Array.isArray(data.options)) {
        throw new Error('Invalid API response: options is not an array');
      }

      const modelAnswerId = data.model_answer;

      // Находим главный ответ
      const mainOption = data.options.find((opt) => opt.id === modelAnswerId);
      const otherOptions = data.options.filter((opt) => opt.id !== modelAnswerId);

      // Формируем порядок: сначала главный, потом остальные
      const orderedOptions = mainOption ? [mainOption, ...otherOptions] : data.options;

      // Преобразуем в Hint[]
      /** ДОБАВИЛ  isBestVariant чтобы пометить подсказку главной. Категории и подкатегории чтобы отобразить в иннпуте */
      const hintList: Hint[] = orderedOptions.map((opt, index) => ({
        id: `hint-${opt.id ?? index}`, // уникальный ID
        text: opt.payload['Шаблонный ответ'] || 'Без текста ответа',
        isBestVariant: opt.id === modelAnswerId,
        category: opt.payload['Основная категория'],
        subcategory: opt.payload['Подкатегория'],
      }));

      /** Создаем newItem, кидаем его в массив responseData для отображения его в терминале (data: json) */
      if (data) {
        const newItem = {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          content: data,
        };
        setResponseData((prev) => [...prev, newItem]);
      }

      setLoading(false); /** Данные получили загрузка завершена */
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
      setLoading(false); /** Данные не получили загрузка завершена */
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
    if (operatorInputRef.current) {
      operatorInputRef.current.focus();
    }
  };

  const toggleHints = () => setShowHints((s) => !s);

  return (
    <div className="h-screen w-screen bg-gray-50 dark overflow-auto">
      <div className="h-full w-full p-6">
        <ResizablePanels initialSizes={[30, 70]} minSize={20}>
          {/* Left Panel - Query Panel */}
          <div className="flex flex-col h-full gap-5">
            <div className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden flex-1 min-h-[200px]">
              <div className="flex justify-center p-4 border-b border-gray-200 bg-gray-100 flex-shrink-0">
                <div className="flex flex-col items-center">
                  <h2 className="text-lg font-semibold text-black">Ask a question</h2>
                  <div className="text-xs text-gray-400 mt-1">Send to operator</div>
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
                  />
                </div>
              </div>
            </div>

            {/* тута верстку добавил для терминала */}
            <div className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden flex-1/2">
              <div className="flex items-center justify-center p-4 border-b border-gray-200 bg-gray-100 flex-shrink-0">
                <div className="flex flex-col items-center">
                  <h2 className="text-lg font-semibold text-black">Terminal</h2>
                  <div className="text-xs text-gray-400 mt-1">Show data JSON</div>
                </div>
              </div>
              <div className="flex-1 flex flex-col overflow-auto p-4 gap-8">
                {/* добавил компоненту для отрисовки терминала */}
                <ChatTerminal responseData={responseData} />
              </div>
            </div>
          </div>

          {/* Operator Chat */}
          <div className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-black">Operator Chat</h2>
                <div className="text-xs text-gray-400 mt-1">Live session</div>
              </div>
            </div>
            <ChatContainer messages={operatorMessages} category="General" title="" isClientView={false} />
            <div className="flex-shrink-0">
              {/* тута логику добавил. если данные грузим то показываем круТелку */}
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
