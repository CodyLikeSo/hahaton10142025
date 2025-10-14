"use client";

import { useState } from "react";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatInput } from "@/components/chat/ChatInput";
import { HintsPanel } from "@/components/hints/HintsPanel";
import { ResizablePanels } from "@/components/ui/ResizablePanels";
import { mockChatData, Message } from "@/lib/mockData";
import { useRef } from "react";

export default function Home() {
  const [operatorMessages, setOperatorMessages] = useState<Message[]>([]);
  const [operatorInput, setOperatorInput] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [showHints, setShowHints] = useState(false);

  const handleQuery = (query: string) => {
    const clientMessage: Message = {
      id: Date.now().toString(),
      text: query,
      sender: "client",
      timestamp: new Date(),
    };
    setOperatorMessages(prev => [...prev, clientMessage]);
  };

  const handleOperatorMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "operator",
      timestamp: new Date(),
    };
    setOperatorMessages(prev => [...prev, newMessage]);
  };

  const handleHintSelect = (text: string) => {
    setOperatorInput(text);
    // focus the operator input textarea when a hint is selected
    if (operatorInputRef.current) {
      operatorInputRef.current.focus();
    }
  };

  const toggleHints = () => setShowHints(s => !s);
  const operatorInputRef = useRef<HTMLTextAreaElement | null>(null);

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
                <ChatInput
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
                <div className="text-xs text-gray-400 mt-1">{mockChatData.category}</div>
              </div>
            </div>
            <ChatContainer
              messages={operatorMessages}
              category={mockChatData.category}
              title=""
              isClientView={false}
            />
            <div className="flex-shrink-0">
              {showHints && (
                <HintsPanel
                  hints={mockChatData.hints}
                  onHintSelect={handleHintSelect}
                />
              )}
              <ChatInput
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