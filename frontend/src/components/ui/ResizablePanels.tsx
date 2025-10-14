"use client";

import React, { useState, useRef, useCallback } from "react";
import { GripVertical } from "lucide-react";

interface ResizablePanelsProps {
  children: [React.ReactNode, React.ReactNode];
  initialSizes?: [number, number]; // percentages
  minSize?: number; // minimum percentage for each panel
}

export function ResizablePanels({ 
  children, 
  initialSizes = [50, 50], 
  minSize = 20 
}: ResizablePanelsProps) {
  const [sizes, setSizes] = useState<[number, number]>(initialSizes);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;
    
  // Account for the grip width (16px) and gap (4px) = 20px total
  const availableWidth = containerWidth - 20;
  const leftWidth = mouseX - 10; // Half of grip + gap
    const rightWidth = availableWidth - leftWidth;
    
    const leftPercentage = (leftWidth / availableWidth) * 100;
    const rightPercentage = (rightWidth / availableWidth) * 100;

    // Apply minimum size constraints
    if (leftPercentage >= minSize && rightPercentage >= minSize) {
      setSizes([leftPercentage, rightPercentage]);
    }
  }, [isResizing, minSize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add global event listeners when resizing
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="flex h-full w-full gap-1">
      <div 
        className="min-w-0 h-full"
        style={{ flexBasis: `${sizes[0]}%`, minWidth: '400px' }}
      >
        {children[0]}
      </div>
      
      <div
        className={`w-4 flex items-center justify-center cursor-col-resize flex-shrink-0 transition-colors ${
          isResizing ? 'bg-black-700' : 'hover:bg-black-900'
        } rounded-lg`}
        onMouseDown={handleMouseDown}
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      
      <div 
        className="min-w-0 h-full"
        style={{ flexBasis: `${sizes[1]}%`, minWidth: '400px' }}
      >
        {children[1]}
      </div>
    </div>
  );
}
