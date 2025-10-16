import { Message } from '@/interface';

interface ChatMessageProps {
  message: Message;
  isClientView?: boolean; // Whether this is being viewed from client's perspective
}

export function ChatMessage({ message, isClientView = false }: ChatMessageProps) {
  const isClientMessage = message.sender === 'client';

  // Determine alignment and styling based on perspective
  // Client view: client messages on right (white), operator messages on left (gray)
  // Operator view: client messages on left (gray), operator messages on right (white)

  let shouldAlignRight: boolean;
  let isWhiteMessage: boolean;

  if (isClientView) {
    // Client's perspective: their messages on right (white), operator's on left (gray)
    shouldAlignRight = isClientMessage;
    isWhiteMessage = isClientMessage;
  } else {
    // Operator's perspective: their messages on right (white), client's on left (gray)
    shouldAlignRight = !isClientMessage;
    isWhiteMessage = !isClientMessage;
  }

  return (
    <div className={`flex ${shouldAlignRight ? 'justify-end' : 'justify-start'} mb-0`}>
      <div
        className={`max-w-[80%] rounded-xl px-4 py-2 ${
          isWhiteMessage ? 'bg-black text-white rounded-br-sm' : 'bg-gray-100 text-black rounded-bl-sm'
        }`}
      >
        <p className="text-sm">{message.text}</p>
        <p className={`text-xs mt-1 ${isWhiteMessage ? 'text-gray-400' : 'text-gray-400'}`}>
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
