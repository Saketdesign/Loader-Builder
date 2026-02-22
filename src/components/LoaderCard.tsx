import React from 'react';
import type { LoaderConfig } from '../types';
import { GridRenderer } from './GridRenderer';
import { useStore } from '../store';
import { clsx } from 'clsx';
import { TextShimmer } from './motion-primitives/text-shimmer';

interface LoaderCardProps {
  loader: LoaderConfig;
  index: number;
}

export const LoaderCard: React.FC<LoaderCardProps> = ({ loader, index }) => {
  const { selectedLoaderId, selectLoader, updateLoader, canvasTransform } =
    useStore();
  const isSelected = selectedLoaderId === loader.id;
  const [isDragging, setIsDragging] = React.useState(false);
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const [isAppearing, setIsAppearing] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppearing(false);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation(); // Prevent canvas pan
    selectLoader(loader.id);

    if (e.button === 0) {
      setIsDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      // Adjust movement by scale to keep 1:1 sync with cursor
      const scale = canvasTransform.scale;
      updateLoader(loader.id, {
        position: {
          x: loader.position.x + e.movementX / scale,
          y: loader.position.y + e.movementY / scale,
        },
      });
      // Reset tilt while dragging
      if (tilt.x !== 0 || tilt.y !== 0) {
        setTilt({ x: 0, y: 0 });
      }
    } else if (loader.effects.enable3DTilt) {
      // Calculate hover tilt
      const rect = e.currentTarget.getBoundingClientRect();
      // Get pointer relative to center of element
      // Since there is a transform: scale from canvas workspace, we should use clientX/clientY
      // which are viewport coordinates.
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Limit max rotation to 15 degrees
      const maxTilt = 15;
      // X-axis mouse moves affect Y-axis rotation
      const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * maxTilt;
      // Y-axis mouse moves affect X-axis rotation (inverted)
      const rotateX = -((e.clientY - centerY) / (rect.height / 2)) * maxTilt;

      // Constrain just in case
      setTilt({
        x: Math.max(-maxTilt, Math.min(maxTilt, rotateX)),
        y: Math.max(-maxTilt, Math.min(maxTilt, rotateY)),
      });
    }
  };

  const handlePointerLeave = () => {
    if (tilt.x !== 0 || tilt.y !== 0) {
      setTilt({ x: 0, y: 0 });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const yOffset = isAppearing ? 10 : 0;
  const transformStr = `translate(${loader.position.x}px, ${loader.position.y + yOffset}px)${loader.effects.enable3DTilt && !isDragging ? ` perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : ''}`;

  return (
    <div
      className={clsx(
        'absolute rounded-[24px] backdrop-blur-md group flex border',
        isDragging
          ? 'transition-none cursor-grabbing'
          : 'transition-all duration-300 ease-out cursor-grab',
        isSelected
          ? 'border-primary ring-1 ring-primary shadow-[0_0_20px_theme(colors.primary.DEFAULT/30%)] z-10 scale-105'
          : 'border-white/5 hover:border-white/10 hover:scale-[1.02] hover:shadow-xl z-0'
      )}
      style={{
        transform: transformStr,
        transformStyle: 'preserve-3d',
        backgroundColor: loader.colors.background,
        minWidth: 320,
        width: 'max-content',
        maxWidth: 600,
        opacity: isAppearing ? 0 : 1,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-surface/80 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-widest uppercase border border-white/10 shadow-lg z-20 backdrop-blur-md">
        Loader {index + 1}
      </div>

      <div className="flex h-full w-full p-8 gap-6">
        {/* Left: Animation Grid */}
        <div className="w-24 h-24 self-center shrink-0 bg-black/50 rounded-lg overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <GridRenderer config={loader} width={96} height={96} />
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex-1 flex flex-col justify-center relative">
          <div
            className="bg-transparent text-2xl font-bold font-sans w-full mb-1 transition-all break-words"
            style={
              {
                color: loader.colors.text,
              } as React.CSSProperties
            }
            title={loader.text}
          >
            {loader.textShimmer ? (
              <TextShimmer className="inline-block font-inherit">{loader.text}</TextShimmer>
            ) : (
              loader.text
            )}
          </div>

          {loader.showSubheading && loader.subheading && (
            <div
              className="bg-transparent text-base font-medium font-sans w-full opacity-60 transition-opacity break-words"
              style={
                {
                  color: loader.colors.text,
                } as React.CSSProperties
              }
              title={loader.subheading}
            >
              {loader.subheading}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
