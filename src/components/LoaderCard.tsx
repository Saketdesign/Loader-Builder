import React from 'react';
import type { LoaderConfig } from '../types';
import { GridRenderer } from './GridRenderer';
import { useStore } from '../store';
import { clsx } from 'clsx';
import { TextShimmerWave } from './motion-primitives/text-shimmer-wave';
import { TextEffect } from './motion-primitives/text-effect';
import { Tilt } from './motion-primitives/tilt';

interface LoaderCardProps {
  loader: LoaderConfig;
  index: number;
}

export const LoaderCard: React.FC<LoaderCardProps> = ({ loader, index }) => {
  const { selectedLoaderId, selectLoader, updateLoader, canvasTransform } =
    useStore();
  const isSelected = selectedLoaderId === loader.id;
  const [isDragging, setIsDragging] = React.useState(false);
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
    }
  };

  const handlePointerLeave = () => {
    // No-op, Tilt component handles this
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const yOffset = isAppearing ? 10 : 0;
  const transformStr = `translate(${loader.position.x}px, ${loader.position.y + yOffset}px)`;

  return (
    <div
      className="absolute z-0"
      style={{
        transform: transformStr,
        opacity: isAppearing ? 0 : 1,
        pointerEvents: 'auto',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      <Tilt
        disabled={!loader.effects.enable3DTilt || isDragging}
        className={clsx(
          'rounded-[24px] backdrop-blur-md group flex border',
          isDragging
            ? 'transition-none cursor-grabbing'
            : 'transition-all duration-300 ease-out cursor-grab',
          isSelected
            ? 'border-primary ring-1 ring-primary shadow-[0_0_20px_theme(colors.primary.DEFAULT/30%)] z-10 scale-105'
            : 'border-white/5 hover:border-white/10 hover:scale-[1.02] hover:shadow-xl'
        )}
        style={{
          backgroundColor: loader.colors.background,
          minWidth: 320,
          width: 'max-content',
          maxWidth: 600,
        }}
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
                <TextShimmerWave className="inline-block font-inherit" duration={1} spread={1}>{loader.text}</TextShimmerWave>
              ) : (
                <TextEffect key={loader.text} per="char" preset="fade">{loader.text}</TextEffect>
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
                <TextEffect key={loader.subheading} per="char" preset="fade" delay={0.15}>{loader.subheading}</TextEffect>
              </div>
            )}
          </div>
        </div>
      </Tilt>
    </div>
  );
};
