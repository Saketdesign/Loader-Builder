import React from 'react';
import { CanvasWorkspace } from './CanvasWorkspace';
import { useStore } from '../store';
import { Sparkles } from 'lucide-react';
import { LoaderCard } from './LoaderCard';
import { createDefaultLoader } from '../utils/defaults';
import { SettingsPanel } from './SettingsPanel';
import { TopControls } from './TopControls';
import arrowSvg from '../assets/Arrow.svg';
import { TextScramble } from './motion-primitives/text-scramble';
import { TextEffect } from './motion-primitives/text-effect';
import { motion, AnimatePresence } from 'motion/react';

export const MainLayout: React.FC = () => {
  const {
    loaders,
    addLoader,
    canvasTransform,
    selectedLoaderId,
    removeLoader,
    selectLoader,
  } = useStore();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLoaderId) {
        // Prevent deletion if user is typing in an input field
        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA'
        ) {
          return;
        }
        removeLoader(selectedLoaderId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLoaderId, removeLoader]);

  const handleAddLoader = () => {
    // Random placement within visible window area, leaving some padding
    const paddingX = 400;
    const paddingY = 300;

    const screenX =
      Math.random() * Math.max(0, window.innerWidth - paddingX) + paddingX / 2;
    const screenY =
      Math.random() * Math.max(0, window.innerHeight - paddingY) + paddingY / 2;

    const canvasX = (screenX - canvasTransform.x) / canvasTransform.scale;
    const canvasY = (screenY - canvasTransform.y) / canvasTransform.scale;

    // Offset the card so random position represents its center (assuming 300x180)
    const cardX = canvasX - 150;
    const cardY = canvasY - 90;

    const newLoader = createDefaultLoader(crypto.randomUUID(), cardX, cardY);
    addLoader(newLoader);
  };

  return (
    <div className="h-screen w-screen bg-background text-white overflow-hidden flex">
      {/* Canvas Area */}
      <div className="flex-1 relative z-0">
        {/* Header & Description */}
        <div className="absolute top-4 left-4 right-4 md:right-auto md:top-8 md:left-8 z-30 pointer-events-none">
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl md:rounded-[24px] p-4 md:p-6 shadow-xl">
            <TextScramble
              as="h1"
              className="text-xl md:text-3xl font-notch font-bold tracking-tight text-white mb-1 md:mb-2"
            >
              Loader Builder
            </TextScramble>
            <TextEffect
              as="div"
              preset="fade-in-blur"
              per="line"
              className="text-gray-400 text-xs md:text-sm max-w-[250px] md:max-w-[300px] leading-relaxed"
            >
              {`Design and customize animated AI-style grid loaders. Export as
React components or WebM videos.`}
            </TextEffect>
          </div>
        </div>

        <TopControls />

        <CanvasWorkspace>
          {loaders.map((loader, index) => (
            <LoaderCard key={loader.id} loader={loader} index={index} />
          ))}
        </CanvasWorkspace>

        {loaders.length === 0 && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-30 z-0">
            <p className="text-gray-400 font-medium tracking-widest uppercase text-xs md:text-sm">
              Drag to Pan • Scroll to Zoom
            </p>
          </div>
        )}

        {/* Add Loader FAB */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 transition-all duration-300 ${selectedLoaderId ? 'bottom-[48vh] md:bottom-8' : 'bottom-8'
            }`}
        >
          {loaders.length === 0 && (
            <div className="absolute bottom-full left-0 mb-6 flex flex-col items-center pointer-events-none -translate-x-[0%]">
              <span className="text-3xl font-caveat text-white whitespace-nowrap -rotate-[10deg] mb-2 tracking-wide">
                Click to create a loader
              </span>
              <div className="w-24 h-24 -mt-0 -ml-16">
                <img
                  src={arrowSvg}
                  alt="Arrow"
                  className="w-full h-full opacity-80 drop-shadow-lg"
                />
              </div>
            </div>
          )}
          <button
            onClick={handleAddLoader}
            className="w-14 h-14 bg-primary rounded-[22px] flex items-center justify-center shadow-glow hover:scale-105 transition-transform cursor-pointer"
          >
            <span className="text-2xl font-bold">+</span>
          </button>
        </div>
      </div>

      {/* Floating Right Panel */}
      <AnimatePresence>
        {loaders.length > 0 && (
          <motion.div
            initial={{ opacity: 0.5, x: 40, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`absolute right-0 bottom-0 left-0 transition-transform duration-300 ease-in-out md:transition-none md:translate-y-0 md:transform-none ${selectedLoaderId
              ? 'translate-y-0 h-[45vh] md:h-auto'
              : 'translate-y-full md:h-auto'
              } md:left-auto md:right-6 md:top-6 md:bottom-6 md:w-80 bg-card/95 md:bg-card/80 backdrop-blur-xl border border-border/50 rounded-t-[32px] md:rounded-b-[32px] md:rounded-[32px] flex flex-col z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] md:shadow-2xl overflow-hidden`}
          >
            <div className="p-4 border-b border-white/5 bg-black/40 md:bg-black/20 backdrop-blur z-20 flex justify-between items-center">
              <h2 className="font-semibold text-white tracking-tight flex items-center gap-2 px-2">
                <Sparkles size={16} className="text-primary" />
                Settings
              </h2>
              <button
                onClick={() => selectLoader(null)}
                className="md:hidden p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center"
                title="Close Settings"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
              </button>
            </div>
            <SettingsPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
