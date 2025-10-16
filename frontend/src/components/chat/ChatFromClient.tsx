"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkle } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  initialValue?: string;
  onValueChange?: (value: string) => void;
  isSparkleOpen?: boolean;
  onToggleSparkle?: () => void;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function ChatInput({ 
  onSendMessage, 
  placeholder = "Type your message...", 
  disabled = false,
  initialValue = "",
  onValueChange,
  isSparkleOpen: isSparkleOpenProp,
  onToggleSparkle
  , inputRef
}: ChatInputProps) {
  const [message, setMessage] = useState(initialValue);
  const [isSparkleOpenLocal, setIsSparkleOpenLocal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessage(initialValue);
  }, [initialValue]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      if (onValueChange) {
        onValueChange("");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSparkle = (e: React.MouseEvent) => {
    e.preventDefault();

    if (typeof onToggleSparkle === "function") {
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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 4 * 20;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [message]);

  return (
    <div className="flex gap-2 p-4 border-t border-gray-700 items-end">
      {/* Sparkle toggle button + tooltip */}
      <div className="relative flex-shrink-0">
        <Button
          onClick={toggleSparkle}
          type="button"
          aria-pressed={
            typeof isSparkleOpenProp === "boolean" ? isSparkleOpenProp : isSparkleOpenLocal
          }
          aria-expanded={
            typeof isSparkleOpenProp === "boolean" ? isSparkleOpenProp : isSparkleOpenLocal
          }
          className={`w-[40px] h-[40px] p-0 rounded-lg transition-colors ${
            (typeof isSparkleOpenProp === "boolean" ? isSparkleOpenProp : isSparkleOpenLocal)
              ? 'bg-white text-black'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
        >
          <Sparkle className="h-4 w-4" />
        </Button>

        {typeof isSparkleOpenProp === "undefined" && isSparkleOpenLocal && (
          <div className="absolute right-0 bottom-full mb-2 w-64 bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg z-10">
            <div className="text-sm text-gray-200">Sparkle options or suggestions go here.</div>
          </div>
        )}
      </div>

      <Textarea
        ref={(el: HTMLTextAreaElement) => {
          textareaRef.current = el;
          if (inputRef) {
            try {
              (inputRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
            } catch (e) {
            }
          }
        }}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 min-h-[40px] max-h-[80px] resize-none bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-gray-500 rounded-lg"
        rows={1}
      />
      <Button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        size="sm"
        className="w-[40px] h-[40px] p-0 bg-white text-black hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg flex-shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
