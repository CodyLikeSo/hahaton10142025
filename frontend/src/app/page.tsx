"use client";

import { useState } from "react";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatInput } from "@/components/chat/ChatInput";
import { HintsPanel } from "@/components/hints/HintsPanel";
import { ResizablePanels } from "@/components/ui/ResizablePanels";
import { mockChatData, Message } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Home() {
  const [clientMessages, setClientMessages] = useState<Message[]>(mockChatData.messages);
  const [operatorMessages, setOperatorMessages] = useState<Message[]>(mockChatData.messages);
  const [operatorInput, setOperatorInput] = useState("");
  const [isClientCollapsed, setIsClientCollapsed] = useState(false);

  const handleClientMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "client",
      timestamp: new Date(),
    };
    setClientMessages(prev => [...prev, newMessage]);
    
    // Add operator's response to operator messages
    const operatorResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: "I understand your concern. Let me help you with that.",
      sender: "operator",
      timestamp: new Date(),
    };
    setOperatorMessages(prev => [...prev, newMessage, operatorResponse]);
  };

  const handleOperatorMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "operator",
      timestamp: new Date(),
    };
    setOperatorMessages(prev => [...prev, newMessage]);
    
    // Add client's response to client messages
    const clientResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: "Thank you for your help!",
      sender: "client",
      timestamp: new Date(),
    };
    setClientMessages(prev => [...prev, newMessage, clientResponse]);
  };

  const handleHintSelect = (text: string) => {
    setOperatorInput(text);
  };

  if (isClientCollapsed) {
    return (
      <div className="h-screen w-screen bg-black dark overflow-hidden p-6">
        <div className="h-full w-full">
          {/* Operator Chat - Full Width */}
          <div className="flex flex-col bg-gray-900 rounded-xl border border-gray-700 overflow-hidden h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-white">Operator Chat</h2>
                <div className="text-xs text-gray-400 mt-1">{mockChatData.category}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsClientCollapsed(false)}
                className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <ChatContainer
              messages={operatorMessages}
              category={mockChatData.category}
              title=""
              isClientView={false}
            />
            <div className="flex-shrink-0">
              <HintsPanel
                hints={mockChatData.hints}
                onHintSelect={handleHintSelect}
              />
              <ChatInput
                onSendMessage={handleOperatorMessage}
                placeholder="Type your message..."
                initialValue={operatorInput}
                onValueChange={setOperatorInput}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black dark overflow-hidden p-6">
      <div className="h-full w-full">
        <ResizablePanels initialSizes={[50, 50]} minSize={20}>
          {/* Client Chat */}
          <div className="flex flex-col bg-gray-900 rounded-xl border border-gray-700 overflow-hidden h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsClientCollapsed(true)}
                  className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h2 className="text-lg font-semibold text-white">Client Chat</h2>
                  <div className="text-xs text-gray-400 mt-1">{mockChatData.category}</div>
                </div>
              </div>
            </div>
            <ChatContainer
              messages={clientMessages}
              category={mockChatData.category}
              title=""
              isClientView={true}
            />
            <div className="flex-shrink-0">
              <ChatInput
                onSendMessage={handleClientMessage}
                placeholder="Type your message..."
              />
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
              <HintsPanel
                hints={mockChatData.hints}
                onHintSelect={handleHintSelect}
              />
              <ChatInput
                onSendMessage={handleOperatorMessage}
                placeholder="Type your message..."
                initialValue={operatorInput}
                onValueChange={setOperatorInput}
              />
            </div>
          </div>
        </ResizablePanels>
      </div>
    </div>
  );
}