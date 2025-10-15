// app/page.tsx
"use client";

import { useState, useRef } from "react";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatInputOperator } from "@/components/chat/ChatFromOperator";
import { HintsPanel } from "@/components/hints/HintsPanel";
import { ResizablePanels } from "@/components/ui/ResizablePanels";
import { Message, Hint } from "@/lib/mockData";

// Тип для ответа API (можно вынести в отдельный файл позже)
interface ApiOption {
  id: number | string;
  score: number;
  payload: {
    "Шаблонный ответ": string;
    // остальные поля можно игнорировать
  };
}

interface ApiResponse {
  options: ApiOption[];
  model_answer: number | string;
}

export default function Home() {
  const [operatorMessages, setOperatorMessages] = useState<Message[]>([]);
  const [operatorInput, setOperatorInput] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [hints, setHints] = useState<Hint[]>([]);
  const [showHints, setShowHints] = useState(false);

  const operatorInputRef = useRef<HTMLTextAreaElement | null>(null);

  const handleQuery = async (query: string) => {
    const clientMessage: Message = {
      id: Date.now().toString(),
      text: query,
      sender: "client",
      timestamp: new Date(),
    };
    setOperatorMessages((prev) => [...prev, clientMessage]);

    try {
      const response = await fetch("http://127.0.0.1:8000/request/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as ApiResponse;

      if (!Array.isArray(data.options)) {
        throw new Error("Invalid API response: options is not an array");
      }

      const modelAnswerId = data.model_answer;

      // Находим главный ответ
      const mainOption = data.options.find(opt => opt.id === modelAnswerId);
      const otherOptions = data.options.filter(opt => opt.id !== modelAnswerId);

      // Формируем порядок: сначала главный, потом остальные
      const orderedOptions = mainOption ? [mainOption, ...otherOptions] : data.options;

      // Преобразуем в Hint[]
      const hintList: Hint[] = orderedOptions.map((opt, index) => ({
        id: `hint-${opt.id ?? index}`, // уникальный ID
        text: opt.payload["Шаблонный ответ"] || "Без текста ответа",
      }));

      setHints(hintList);
      setShowHints(true);
    } catch (error) {
      console.error("Ошибка при запросе к API:", error);
      setHints([
        {
          id: "error",
          text: "❌ Не удалось получить подсказки от сервера",
        },
      ]);
      setShowHints(true);
    }
  };

  const handleOperatorMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "operator",
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
    <div className="h-screen w-screen bg-black dark overflow-auto">
      <div className="h-full w-full p-6">
        <ResizablePanels initialSizes={[30, 70]} minSize={20}>
          {/* Left Panel - Query Panel */}
          <div className="flex flex-col bg-gray-900 rounded-xl border border-gray-700 overflow-hidden h-full">
            <div className="flex items-center justify-center p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-white">Ask a question</h2>
                <div className="text-xs text-gray-400 mt-1">Send to operator</div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="w-full">
                <ChatInputOperator
                  onSendMessage={handleQuery}
                  placeholder="Type your question..."
                  initialValue={queryInput}
                  onValueChange={setQueryInput}
                />
              </div>
            </div>
          </div>

          {/* Operator Chat */}
          <div className="flex flex-col bg-gray-900 rounded-xl border border-gray-700 overflow-hidden h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-white">Operator Chat</h2>
                <div className="text-xs text-gray-400 mt-1">Live session</div>
              </div>
            </div>
            <ChatContainer
              messages={operatorMessages}
              category="General"
              title=""
              isClientView={false}
            />
            <div className="flex-shrink-0">
              {showHints && <HintsPanel hints={hints} onHintSelect={handleHintSelect} />}
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
        </ResizablePanels>
      </div>
    </div>
  );
}