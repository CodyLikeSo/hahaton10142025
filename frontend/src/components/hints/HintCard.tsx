'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Hint } from '@/interface';

interface HintCardProps {
  hint: Hint;
  onSelect: (text: string) => void;
  className?: string;
}

export function HintCard({ hint, onSelect, className }: HintCardProps) {
  const [isExpanded, setIsExpanded] = useState(hint.isExpanded || false);

  // Check if text exceeds 3 lines (approximately 150 characters)
  const fullText = hint.category + ' > ' + hint.subcategory + ': ' + hint.text; /** Добавил текст категории и подкатегории в подсказку */
  const shouldShowExpandButton = fullText.length > 150;
  const displayText = shouldShowExpandButton && !isExpanded ? fullText.substring(0, 150) + '...' : fullText;

  const handleClick = () => {
    onSelect(hint.text);
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  /** В Card накинул className для самой крутой подсказки */
  return (
    <Card
      className={cn('p-3 cursor-pointer  hover:bg-gray-700 transition-colors border border-gray-600 bg-gray-800 rounded-lg', className)}
      onClick={handleClick}
    >
      <div className="relative">
        {shouldShowExpandButton && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-0 right-0 h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg cursor-pointer"
            onClick={handleExpandToggle}
          >
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        )}
        <p className="text-sm text-gray-200 pr-8">{displayText}</p>
      </div>
    </Card>
  );
}
