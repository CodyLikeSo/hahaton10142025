'use client';

import { useRef, useLayoutEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { Message } from '@/interface';

interface ChatContainerProps {
  messages: Message[];
  category: string;
  title: string;
  isClientView?: boolean;
}

export function ChatContainer({ messages, category, title, isClientView = false }: ChatContainerProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useLayoutEffect(() => {
    const scrollToBottom = () => {
      // Preferred: scroll the last message into view (works well with dynamic heights)
      if (lastMessageRef.current) {
        try {
          lastMessageRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
          return;
        } catch (e) {
          // fall through to manual scroll if scrollIntoView fails
        }
      }

      // Fallback: set scrollTop on the Radix viewport
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          (scrollContainer as HTMLElement).scrollTop = (scrollContainer as HTMLElement).scrollHeight;
        }
      }
    };

    // Run synchronously after DOM mutations so initial mocked messages align bottom
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 bg-white">
        <div className="flex flex-col h-full pt-4 px-4 pb-6 gap-2">
          {messages.map((message, idx) => (
            <div key={message.id} ref={idx === messages.length - 1 ? lastMessageRef : undefined}>
              <ChatMessage message={message} isClientView={isClientView} />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
