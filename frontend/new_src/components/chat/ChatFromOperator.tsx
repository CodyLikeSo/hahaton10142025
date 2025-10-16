'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkle } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  initialValue?: string;
  onValueChange?: (value: string) => void;
  // Controlled sparkle (optional). If provided, ChatInput will use these props
  // to toggle the global HintsPanel instead of showing its own tooltip.
  isSparkleOpen?: boolean;
  onToggleSparkle?: () => void;
  // Optional external ref to focus the textarea
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function ChatInputOperator({
  onSendMessage,
  placeholder = 'Type your message...',
  disabled = false,
  initialValue = '',
  onValueChange,
  isSparkleOpen: isSparkleOpenProp,
  onToggleSparkle,
  inputRef,
}: ChatInputProps) {
  const [message, setMessage] = useState(initialValue);
  const [isSparkleOpenLocal, setIsSparkleOpenLocal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update internal state when external value changes
  useEffect(() => {
    setMessage(initialValue);
  }, [initialValue]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (onValueChange) {
        onValueChange('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSparkle = (e: React.MouseEvent) => {
    e.preventDefault();
    // If parent provided a controlled toggle, use that. Otherwise toggle local state.
    if (typeof onToggleSparkle === 'function') {
      onToggleSparkle();
    } else {
      setIsSparkleOpenLocal((s) => !s);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    if (onValueChange) {
      onValueChange(value);
    }
  };

  // Auto-resize textarea with 4 line limit
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 4 * 20; // 4 lines * 20px per line
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [message]);

  return (
    <div className="flex gap-2 p-4 items-end">
      {/* Sparkle toggle button + tooltip */}
      <div className="relative flex-shrink-0">
        <Button
          onClick={toggleSparkle}
          type="button"
          aria-pressed={typeof isSparkleOpenProp === 'boolean' ? isSparkleOpenProp : isSparkleOpenLocal}
          aria-expanded={typeof isSparkleOpenProp === 'boolean' ? isSparkleOpenProp : isSparkleOpenLocal}
          className={`w-[40px] h-[40px] p-0 rounded-lg transition-colors ${
            (typeof isSparkleOpenProp === 'boolean' ? isSparkleOpenProp : isSparkleOpenLocal)
              ? 'bg-black text-white hover:bg-black/80 hover:text-white'
              : 'bg-white border border-gray-200 text-black hover:bg-gray-100'
          }`}
        >
          <Sparkle className="h-4 w-4" />
        </Button>

        {/* Only show the local tooltip when this component is uncontrolled for sparkle */}
        {typeof isSparkleOpenProp === 'undefined' && isSparkleOpenLocal && (
          <div className="absolute right-0 bottom-full mb-2 w-64 bg-gray-100 border border-gray-200 rounded-lg p-3 shadow-lg z-10">
            <div className="text-sm text-gray-200">Sparkle options or suggestions go here.</div>
            {/* Add interactive content here as needed */}
          </div>
        )}
      </div>

      <Textarea
        ref={(el: HTMLTextAreaElement) => {
          // wire internal ref for resize behavior
          textareaRef.current = el;
          // and wired external ref if provided
          if (inputRef) {
            try {
              (inputRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
            } catch (e) {
              // ignore if inputRef is a callback ref or otherwise
            }
          }
        }}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 min-h-[40px] max-h-[80px] resize-none bg-white! border border-gray-200 text-black placeholder-gray-400 focus:ring-gray-300! rounded-lg"
        rows={1}
      />
      <Button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        size="sm"
        className="w-[40px] h-[40px] p-0 bg-black text-white hover:bg-black/80 disabled:bg-gray-00 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg flex-shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
