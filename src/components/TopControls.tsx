import React, { useState } from 'react';
import { useStore } from '../store';
import { motion } from 'motion/react';
import {
  Download,
  Terminal,
  FileCode,
  Check,
  Video,
  Loader2,
  Maximize,
  Globe,
} from 'lucide-react';
import { Tilt } from './motion-primitives/tilt';

import { generateReactCode } from '../utils/exportCode';
import { exportWebM } from '../utils/exportVideo';
import saketPhoto from '../assets/saket.jpeg';
import { Dialog } from './motion-primitives/dialog';

export const TopControls: React.FC = () => {
  const { loaders, selectedLoaderId, setCanvasTransform } = useStore();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handleResetView = () => {
    if (loaders.length === 0) {
      setCanvasTransform({ x: 0, y: 0, scale: 1 });
      return;
    }

    // Calculate bounding box of all loaders
    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;

    loaders.forEach((l) => {
      minX = Math.min(minX, l.position.x);
      minY = Math.min(minY, l.position.y);
      maxX = Math.max(maxX, l.position.x + 320); // Loader width
      maxY = Math.max(maxY, l.position.y + 200); // Approximate loader height
    });

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    setCanvasTransform({
      x: screenW / 2 - cx,
      y: screenH / 2 - cy,
      scale: 1,
    });
  };

  // Toggle Theme (Mock for now, as we only have dark mode)
  // But user asked for toggle.
  // We can just toggle a class on body, but currently only Dark is designed.

  const handleExportJSON = () => {
    const data = JSON.stringify(loaders, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loaders-config.json';
    a.click();
  };

  const handleGenerateCode = () => {
    // Generate React component code for the selected loader
    const loader = loaders.find((l) => l.id === selectedLoaderId) || loaders[0];
    if (!loader) return;

    const code = generateReactCode(loader);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ transform: 'translateY(-50px)', opacity: 0, filter: 'blur(10px)' }}
      animate={{ transform: 'translateY(0px)', opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.2, ease: [0.165, 0.84, 0.44, 1] }}
      className={`absolute top-4 md:top-6 z-30 flex flex-wrap justify-end gap-2 md:gap-3 pointer-events-auto max-w-[60vw] md:max-w-none transition-[right] duration-300 ease-out-quart ${loaders.length > 0 ? 'right-4 md:right-[350px]' : 'right-4 md:right-8'
        }`}
    >
      <AboutMeModal />

      <button
        onClick={handleResetView}
        disabled={loaders.length === 0}
        aria-label="Centre Align Canvas"
        className={`h-8 px-3 md:h-10 md:px-5 rounded-full bg-secondary/80 backdrop-blur-md border border-white/5 text-gray-300 transition-[transform,background-color,color,opacity] duration-150 ease-out flex items-center gap-2 font-medium text-xs md:text-sm relative ${loaders.length === 0
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95'
          } before:absolute before:inset-[-6px] md:before:inset-0`}
      >
        <Maximize size={16} className="w-4 h-4 md:w-5 md:h-5" />
        Centre Align
      </button>

      <div className="relative">
        <button
          onClick={() => setIsExportOpen(!isExportOpen)}
          disabled={!selectedLoaderId}
          aria-label="Export Loader"
          className={`h-8 px-3 md:h-10 md:px-5 rounded-[20px] bg-primary text-white transition-[transform,background-color,box-shadow,opacity] duration-150 ease-out flex items-center gap-2 font-medium text-xs md:text-sm relative ${!selectedLoaderId
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-primary/90 shadow-[0_0_15px_theme(colors.primary.DEFAULT/30%)] hover:shadow-[0_0_25px_theme(colors.primary.DEFAULT/50%)] hover:scale-105 active:scale-95'
            } before:absolute before:inset-[-6px] md:before:inset-0`}
        >
          <Download size={16} className="w-4 h-4 md:w-5 md:h-5" />
          Export
        </button>

        {isExportOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-[24px] shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
            <button
              onClick={handleExportJSON}
              className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-sm text-gray-300 hover:text-white"
            >
              <Terminal size={16} className="text-blue-400" />
              Download JSON
            </button>
            <button
              onClick={handleGenerateCode}
              disabled={!selectedLoaderId && loaders.length === 0}
              className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-sm text-gray-300 hover:text-white disabled:opacity-50"
            >
              {copied ? (
                <Check size={16} className="text-green-400" />
              ) : (
                <FileCode size={16} className="text-purple-400" />
              )}
              {copied ? 'Copied!' : 'Copy Component'}
            </button>
            <button
              onClick={async () => {
                const loader =
                  loaders.find((l) => l.id === selectedLoaderId) || loaders[0];
                if (!loader) return;
                setIsRecording(true);
                try {
                  await exportWebM(loader, 400, 400, 4000);
                } finally {
                  setIsRecording(false);
                }
              }}
              disabled={
                (!selectedLoaderId && loaders.length === 0) || isRecording
              }
              className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-sm text-gray-300 hover:text-white disabled:opacity-50"
            >
              {isRecording ? (
                <Loader2 size={16} className="text-red-400 animate-spin" />
              ) : (
                <Video size={16} className="text-red-400" />
              )}
              {isRecording ? 'Recording (4s)…' : 'Download Video'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Internal Component: About Me Modal
const AboutMeModal = () => {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <button className="h-8 px-3 md:h-10 md:px-5 rounded-[20px] bg-secondary/80 backdrop-blur-md border border-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-[transform,background-color,color] duration-150 ease-out flex items-center gap-2 font-medium text-xs md:text-sm hover:scale-105 active:scale-95">
          About Me
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Content className="w-[460px] max-w-[90vw] bg-transparent border-none shadow-none overflow-visible">
          <Tilt
            rotationFactor={5}
            className="w-full h-full bg-[#18181B] bg-opacity-90 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Header */}
            <Dialog.Header className="flex items-center justify-between px-5 py-3 border-b border-white/5 flex-row space-y-0">
              <Dialog.Title className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-2">
                About Me
              </Dialog.Title>
              <Dialog.Close className="relative top-0 right-0 p-1 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </Dialog.Close>
            </Dialog.Header>

            {/* Body */}
            <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start text-center md:text-left">
              {/* Photo */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-[16px] overflow-hidden bg-white/5 border border-white/10 shrink-0">
                <img
                  src={saketPhoto}
                  alt="Saket Joshi"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 items-center md:items-start text-left">
                <p className="text-gray-200 text-sm leading-relaxed mb-4 font-medium">
                  Yoo! I am Saket – Product designer.
                  <br />
                  <br />
                  <span className="text-gray-400 font-normal">
                    I love creating tools like this for fun – trying to see
                    possibility of AI.
                  </span>
                  <br />
                  <span className="text-gray-400 font-normal block mt-2">
                    PS - if you are hiring for a product designer role - Let’s
                    chat!
                  </span>
                </p>

                {/* Links/Buttons */}
                <div className="flex items-center gap-3 mt-auto justify-center md:justify-start">
                  <a
                    href="https://saket.works/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                  >
                    <Globe size={14} />
                  </a>

                  <a
                    href="https://x.com/saketux"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>

                  <a
                    href="https://www.linkedin.com/in/saket-joshi-design/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </Tilt>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
