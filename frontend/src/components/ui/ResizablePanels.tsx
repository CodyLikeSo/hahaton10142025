// components/ui/ResizablePanels.tsx
"use client";

import React, { useState, useRef, useCallback } from "react";
import { GripVertical, GripHorizontal } from "lucide-react";

interface ResizablePanelsProps {
  children: [React.ReactNode, React.ReactNode];
  initialSizes?: [number, number]; // percentages
  minSize?: number; // minimum percentage for each panel
  direction?: "horizontal" | "vertical"; // ← НОВОЕ
}

export function ResizablePanels({
  children,
  initialSizes = [50, 50],
  minSize = 30,
  direction = "horizontal",
}: ResizablePanelsProps) {
  const [sizes, setSizes] = useState<[number, number]>(initialSizes);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const isHorizontal = direction === "horizontal";
      const size = isHorizontal ? containerRect.width : containerRect.height;
      const offset = isHorizontal ? e.clientX - containerRect.left : e.clientY - containerRect.top;

      // Учитываем размер "грипа" (4px gap + 16px grip = 20px)
      const availableSize = size - 20;
      const firstSize = offset - 10; // половина грипа
      const secondSize = availableSize - firstSize;

      const firstPercent = (firstSize / availableSize) * 100;
      const secondPercent = (secondSize / availableSize) * 100;

      if (firstPercent >= minSize && secondPercent >= minSize) {
        setSizes([firstPercent, secondPercent]);
      }
    },
    [isResizing, minSize, direction]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = direction === "horizontal" ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, handleMouseMove, handleMouseUp, direction]);

  const isHorizontal = direction === "horizontal";

  return (
    <div
      ref={containerRef}
      className={`flex ${isHorizontal ? "flex-row" : "flex-col"} h-full w-full gap-1`}
    >
      <div
        className="min-w-0 min-h-0"
        style={{
          ...(isHorizontal
            ? { flexBasis: `${sizes[0]}%`, minWidth: "200px" }
            : { flexBasis: `${sizes[0]}%`, minHeight: "250px" }),
        }}
      >
        {children[0]}
      </div>

      <div
        className={`flex items-center justify-center flex-shrink-0 transition-colors rounded-lg ${
          isHorizontal
            ? "w-4 cursor-col-resize"
            : "h-4 cursor-row-resize"
        } ${isResizing ? "bg-gray-700" : "hover:bg-gray-800"}`}
        onMouseDown={handleMouseDown}
      >
        {isHorizontal ? (
          <GripVertical className="h-4 w-4 text-gray-400" />
        ) : (
          <GripHorizontal className="h-4 w-4 text-gray-400" />
        )}
      </div>

      <div
        className="min-w-0 min-h-0"
        style={{
          ...(isHorizontal
            ? { flexBasis: `${sizes[1]}%`, minWidth: "200px" }
            : { flexBasis: `${sizes[1]}%`, minHeight: "100px" }),
        }}
      >
        {children[1]}
      </div>
    </div>
  );
}