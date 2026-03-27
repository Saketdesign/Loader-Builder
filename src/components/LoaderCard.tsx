import React, { createContext, useContext } from 'react';
import type { LoaderConfig } from '../types';
import { GridRenderer } from './GridRenderer';
import { useStore } from '../store';
import { cn } from '../utils/cn';
import { TextShimmerWave } from './motion-primitives/text-shimmer-wave';
import { TextEffect } from './motion-primitives/text-effect';
import { Tilt } from './motion-primitives/tilt';

interface LoaderCardContextValue {
  loader: LoaderConfig;
  index: number;
  isDragging: boolean;
  isSelected: boolean;
}

const LoaderCardContext = createContext<LoaderCardContextValue | null>(null);

function useLoaderCard() {
  const context = useContext(LoaderCardContext);
  if (!context) {
    throw new Error('LoaderCard sub-components must be used within a LoaderCard');
  }
  return context;
}

interface LoaderCardProps {
  loader: LoaderConfig;
  index: number;
  children?: React.ReactNode;
  className?: string;
}

export const LoaderCard = ({ loader, index, children, className }: LoaderCardProps) => {
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
    e.stopPropagation();
    selectLoader(loader.id);

    if (e.button === 0) {
      setIsDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      const scale = canvasTransform.scale;
      updateLoader(loader.id, {
        position: {
          x: loader.position.x + e.movementX / scale,
          y: loader.position.y + e.movementY / scale,
        },
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const yOffset = isAppearing ? 10 : 0;
  const transformStr = `translate(${loader.position.x}px, ${loader.position.y + yOffset}px)`;

  return (
    <LoaderCardContext.Provider value={{ loader, index, isDragging, isSelected }}>
      <div
        className={cn(
          'absolute z-0 transition-[opacity] duration-300 ease-out-quart',
          !isDragging && 'transition-[transform] duration-300 ease-out-quart',
          className
        )}
        style={{
          transform: transformStr,
          opacity: isAppearing ? 0 : 1,
          pointerEvents: 'auto',
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <Tilt
          disabled={!loader.effects.enable3DTilt || isDragging}
          className={cn(
            'rounded-[24px] backdrop-blur-md group flex border isolation-isolate',
            isDragging
              ? 'transition-none cursor-grabbing'
              : 'transition-[transform,scale,border-color,box-shadow,background-color] duration-200 ease-out-quart cursor-grab',
            isSelected
              ? 'border-primary ring-1 ring-primary shadow-[0_0_20px_theme(colors.primary.DEFAULT/30%)] z-10 scale-105'
              : 'border-[var(--border-hairline)] border-white/10 hover:border-white/20 hover:scale-[1.02] hover:shadow-2xl shadow-xl'
          )}
          style={{
            backgroundColor: loader.colors.background,
            minWidth: 320,
            width: 'max-content',
            maxWidth: 600,
          }}
        >
          {children || (
            <>
              <Badge />
              <div className="flex h-full w-full p-8 gap-6">
                <Grid />
                <Content>
                  <Title />
                  <Description />
                </Content>
              </div>
            </>
          )}
        </Tilt>
      </div>
    </LoaderCardContext.Provider>
  );
};

const Badge = () => {
  const { index } = useLoaderCard();
  return (
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-surface/80 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-widest uppercase border border-white/10 shadow-lg z-20 backdrop-blur-md tabular-nums">
      Loader {index + 1}
    </div>
  );
};

const Grid = ({ size = 96 }: { size?: number }) => {
  const { loader } = useLoaderCard();
  return (
    <div 
      className="self-center shrink-0 bg-black/50 rounded-lg overflow-hidden relative"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Animation illustration for ${loader.text} loader`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <GridRenderer config={loader} width={size} height={size} />
      </div>
    </div>
  );
};

const Content = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn('flex-1 flex flex-col justify-center relative', className)}>
      {children}
    </div>
  );
};

const Title = ({ className }: { className?: string }) => {
  const { loader } = useLoaderCard();
  return (
    <div
      className={cn('bg-transparent text-2xl font-bold font-sans w-full mb-1 transition-[color] break-words', className)}
      style={{ color: loader.colors.text }}
      title={loader.text}
    >
      {loader.textShimmer ? (
        <TextShimmerWave className="inline-block font-inherit" duration={1} spread={1}>
          {loader.text}
        </TextShimmerWave>
      ) : (
        <TextEffect key={loader.text} per="char" preset="fade">
          {loader.text}
        </TextEffect>
      )}
    </div>
  );
};

const Description = ({ className }: { className?: string }) => {
  const { loader } = useLoaderCard();
  if (!loader.showSubheading || !loader.subheading) return null;
  return (
    <div
      className={cn('bg-transparent text-base font-medium font-sans w-full opacity-60 transition-opacity break-words', className)}
      style={{ color: loader.colors.text }}
      title={loader.subheading}
    >
      <TextEffect key={loader.subheading} per="char" preset="fade" delay={0.15}>
        {loader.subheading}
      </TextEffect>
    </div>
  );
};

LoaderCard.Badge = Badge;
LoaderCard.Grid = Grid;
LoaderCard.Content = Content;
LoaderCard.Title = Title;
LoaderCard.Description = Description;
