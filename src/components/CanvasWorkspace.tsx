import React, { useRef, useState, useCallback } from 'react';
import { useStore } from '../store';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

export const CanvasWorkspace: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { canvasTransform, setCanvasTransform, selectLoader } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      // Spec says: Zoom (scroll wheel)
      // We'll use deltaY to determine zoom direction.

      const zoomSensitivity = 0.001;
      const zoomDelta = -e.deltaY * zoomSensitivity;
      const newScale = Math.min(
        Math.max(canvasTransform.scale + zoomDelta, MIN_ZOOM),
        MAX_ZOOM
      );

      // Calculate cursor position relative to the container
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      // Zoom towards cursor:
      // worldX = (cursorX - x) / scale
      // newX = cursorX - worldX * newScale

      const worldX = (cursorX - canvasTransform.x) / canvasTransform.scale;
      const worldY = (cursorY - canvasTransform.y) / canvasTransform.scale;

      const newX = cursorX - worldX * newScale;
      const newY = cursorY - worldY * newScale;

      setCanvasTransform({
        scale: newScale,
        x: newX,
        y: newY,
      });
    },
    [canvasTransform, setCanvasTransform]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    // Pan (click + drag background)
    // Ensure we are clicking the background, not a child (unless child didn't stop propagation, but we can check target)
    // For now, if default prevented, ignore.
    if (e.defaultPrevented) return;

    // Deselect if clicking background
    selectLoader(null);

    if (e.button === 0 || e.button === 1) {
      // Left or Middle
      setIsDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      setCanvasTransform({
        x: canvasTransform.x + e.movementX,
        y: canvasTransform.y + e.movementY,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-background cursor-crosshair active:cursor-grabbing touch-none select-none"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Grid Background Pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #27272a 1px, transparent 1px)',
          backgroundSize: `${24 * canvasTransform.scale}px ${24 * canvasTransform.scale}px`,
          backgroundPosition: `${canvasTransform.x}px ${canvasTransform.y}px`,
          opacity: 0.5,
        }}
      />

      <div
        className="absolute transform-gpu origin-top-left will-change-transform"
        style={{
          transform: `translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
