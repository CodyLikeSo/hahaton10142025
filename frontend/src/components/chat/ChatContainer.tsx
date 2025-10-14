"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/lib/mockData";
import { ChatMessage } from "./ChatMessage";

interface ChatContainerProps {
  messages: Message[];
  category: string;
  title: string;
  isClientView?: boolean;
}

export function ChatContainer({ messages, category, title, isClientView = false }: ChatContainerProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    };

    setTimeout(scrollToBottom, 0);
  }, [messages]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 bg-gray-900">
        <div className="flex flex-col justify-end h-full p-4 space-y-2">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} isClientView={isClientView} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
