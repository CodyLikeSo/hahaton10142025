'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { HintCard } from './HintCard';
import { Hint } from '@/interface';

interface HintsPanelProps {
  hints: Hint[];
  onHintSelect: (text: string) => void;
}

export function HintsPanel({ hints, onHintSelect }: HintsPanelProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedHints = showAll ? hints : hints.slice(0, 2);

  return (
    <div className="p-4 border-b border-gray-700 bg-gray-800 overflow-auto max-h-72">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-white mb-2">AI Suggestions</h3>
        {/* Добавил className Для первой подсказки */}
        {displayedHints.map((hint) => (
          <HintCard key={hint.id} hint={hint} onSelect={onHintSelect} className={hint.isBestVariant ? 'border-red-200' : ''} />
        ))}

        {hints.length > 2 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show More ({hints.length - 2} more)
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
