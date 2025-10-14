"use client";

import React, { useState, useRef, useCallback } from "react";

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
    
    const leftPercentage = (mouseX / containerWidth) * 100;
    const rightPercentage = 100 - leftPercentage;

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
    <div ref={containerRef} className="flex h-full w-full">
      <div 
        className="flex-shrink-0"
        style={{ width: `${sizes[0]}%` }}
      >
        {children[0]}
      </div>
      
      <div
        className={`w-1 bg-gray-600 hover:bg-gray-500 cursor-col-resize flex-shrink-0 transition-colors ${
          isResizing ? 'bg-gray-400' : ''
        }`}
        onMouseDown={handleMouseDown}
      />
      
      <div 
        className="flex-shrink-0"
        style={{ width: `${sizes[1]}%` }}
      >
        {children[1]}
      </div>
    </div>
  );
}
