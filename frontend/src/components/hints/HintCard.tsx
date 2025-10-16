'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  // Truncate only the hint text for preview; chips will show category/subcategory and score
  const textOnly = hint.text || '';
  const shouldShowExpandButton = textOnly.length > 150;
  const displayText = shouldShowExpandButton && !isExpanded ? textOnly.substring(0, 150) + '...' : textOnly;

  const handleClick = () => {
    onSelect(hint.text);
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Format score to two decimal places if numeric
  const formattedScore = (() => {
    if (typeof hint.score === 'number') return hint.score.toFixed(2);
    if (typeof hint.score === 'string') {
      const n = Number(hint.score);
      return isNaN(n) ? hint.score : n.toFixed(2);
    }
    return '';
  })();

  /** В Card накинул className для самой крутой подсказки */
  return (
    <Card
      className={cn('p-3 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200 bg-white rounded-lg', className)}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        {/* Chips row on the left */}
        <div className="flex items-center gap-2 mt-1 shrink-0">
          <Badge variant="default" className="text-xs px-2 py-0.5">{hint.category}{hint.subcategory ? ` > ${hint.subcategory}` : ''}</Badge>
          <Badge variant="default" className="text-xs px-2 py-0.5">{formattedScore}</Badge>
        </div>

        {/* Text area */}
        <div className="relative flex-1">
          {shouldShowExpandButton && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0 h-6 w-6 p-0 text-gray-400 hover:text-black hover:bg-transparent! rounded-lg cursor-pointer"
              onClick={handleExpandToggle}
            >
              {isExpanded ? <ChevronUp/> : <ChevronDown/>}
            </Button>
          )}
          <p className="text-sm text-black pr-8">{displayText}</p>
        </div>
      </div>
    </Card>
  );
}
