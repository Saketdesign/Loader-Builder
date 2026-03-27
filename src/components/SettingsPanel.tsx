import React from 'react';
import { useStore } from '../store';
import {
  Type,
  Activity,
  Palette,
  Sparkles,
  LayoutGrid,
  Trash2,
  Info,
} from 'lucide-react';
import type {
  LoaderConfig,
  AnimationPattern,
  CellShape,
  AnimationStyle,
} from '../types';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './motion-primitives/accordion';
import { AnimatedNumber } from './motion-primitives/animated-number';

export const SettingsPanel: React.FC = () => {
  const { selectedLoaderId, loaders, updateLoader, removeLoader } = useStore();
  const selectedLoader = loaders.find((l) => l.id === selectedLoaderId);

  if (!selectedLoader) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted p-8 text-center">
        <LayoutGrid size={48} className="mb-4 opacity-20" />
        <p className="text-base font-medium text-gray-300">
          Select a loader to edit
        </p>
        <p className="text-sm mt-2 opacity-50">
          Click on any loader card in the canvas to see settings
        </p>
      </div>
    );
  }

  const handleChange = <K extends keyof LoaderConfig>(
    key: K,
    value: LoaderConfig[K]
  ) => {
    updateLoader(selectedLoader.id, { [key]: value });
  };

  const handleColorChange = (
    key: keyof LoaderConfig['colors'],
    value: string
  ) => {
    updateLoader(selectedLoader.id, {
      colors: { ...selectedLoader.colors, [key]: value },
    });
  };

  const handleEffectChange = (
    key: keyof LoaderConfig['effects'],
    value: number | boolean
  ) => {
    updateLoader(selectedLoader.id, {
      effects: { ...selectedLoader.effects, [key]: value },
    });
  };

  return (
    <div className="flex flex-col h-full bg-transparent z-10">
      {/* Header Handled by Parent now, just show ID here if needed or keep header */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {/* Settings Sections */}

        <Section title="Content" icon={<Type size={16} />}>
          <Input
            label="Heading"
            value={selectedLoader.text}
            onChange={(v) => handleChange('text', v)}
          />

          <div className="flex items-center justify-between py-2">
            <label className="text-sm text-gray-400">Show Subheading</label>
            <Switch
              checked={selectedLoader.showSubheading}
              label="Show Subheading"
              onChange={(v) => handleChange('showSubheading', v)}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <label className="text-sm text-gray-400">Text Shimmer</label>
            <Switch
              checked={!!selectedLoader.textShimmer}
              label="Text Shimmer"
              onChange={(v) => handleChange('textShimmer', v)}
            />
          </div>

          {selectedLoader.showSubheading && (
            <Input
              label="Subheading"
              value={selectedLoader.subheading || ''}
              onChange={(v) => handleChange('subheading', v)}
            />
          )}
        </Section>

        <Section title="Shape & Pattern" icon={<LayoutGrid size={16} />}>
          <Select
            label="Shape"
            value={selectedLoader.cellShape}
            options={[
              'rounded',
              'square',
              'circle',
              'diamond',
              'hexagon',
              'star',
            ]}
            onChange={(v) => handleChange('cellShape', v as CellShape)}
          />
          <Select
            label="Pattern"
            value={selectedLoader.pattern}
            options={[
              'wave',
              'radial',
              'spiral',
              'pulse',
              'fluid',
              'rain',
              'radar',
              'spinner',
              'random',
            ]}
            onChange={(v) => handleChange('pattern', v as AnimationPattern)}
          />
          {[
            'wave',
            'radial',
            'spiral',
            'pulse',
            'fluid',
            'rain',
            'radar',
            'spinner',
          ].includes(selectedLoader.pattern) && (
              <Range
                label="Pattern Length"
                value={selectedLoader.patternScale ?? 1}
                min={0.2}
                max={5}
                step={0.1}
                onChange={(v) => handleChange('patternScale', v)}
              />
            )}
          <Select
            label="Animation Style"
            value={selectedLoader.animationStyle}
            options={['fade', 'scale', 'breathe', 'glow', 'pulse-size']}
            onChange={(v) =>
              handleChange('animationStyle', v as AnimationStyle)
            }
          />
          <Range
            label="Grid Size"
            tooltip="Number of cells per row/column. High values look great with Fluid pattern and Color Maps."
            value={selectedLoader.gridSize}
            min={5}
            max={20}
            step={1}
            onChange={(v) => handleChange('gridSize', v)}
          />
          <Range
            label="Density Bias"
            tooltip="Warps grid spacing. >1 packs cells tightly in the center, <1 pushes them to edges. Best with high Grid Size and Spiral/Radial patterns."
            value={selectedLoader.densityBias ?? 1.0}
            min={0.2}
            max={4}
            step={0.1}
            onChange={(v) => handleChange('densityBias', v)}
          />
        </Section>

        <Section title="Animation" icon={<Activity size={16} />}>
          <Range
            label="Speed"
            value={selectedLoader.speed}
            min={0.1}
            max={10}
            step={0.1}
            onChange={(v) => handleChange('speed', v)}
          />
        </Section>

        <Section title="Colors" icon={<Palette size={16} />}>
          <Select
            label="Color Map (Overrides Primary)"
            value={selectedLoader.colors.colorMap || 'none'}
            options={['none', 'ocean', 'fire', 'cyber', 'neon']}
            onChange={(v) => handleColorChange('colorMap', v)}
          />
          <ColorInput
            label="Primary"
            value={selectedLoader.colors.primary}
            onChange={(v) => handleColorChange('primary', v)}
          />
          <ColorInput
            label="Inactive"
            value={selectedLoader.colors.inactive}
            onChange={(v) => handleColorChange('inactive', v)}
          />
          <ColorInput
            label="Background"
            value={selectedLoader.colors.background}
            onChange={(v) => handleColorChange('background', v)}
          />
          <ColorInput
            label="Text"
            value={selectedLoader.colors.text}
            onChange={(v) => handleColorChange('text', v)}
          />
        </Section>

        <Section title="Effects & Nodes" icon={<Sparkles size={16} />}>
          <Range
            label="Glow Intensity"
            value={selectedLoader.effects.glow}
            min={0}
            max={100}
            onChange={(v) => handleEffectChange('glow', v)}
          />
          <div className="flex items-center justify-between py-2">
            <LabelWithTooltip
              label="Bloom"
              tooltip="Adds an optical soft-focus glare. Best paired with high Glow Intensity and Neon colors."
            />
            <Switch
              checked={selectedLoader.effects.bloom}
              label="Bloom"
              onChange={(v) => handleEffectChange('bloom', v)}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <LabelWithTooltip
              label="Motion Trails"
              tooltip="Leaves fading traces behind moving cells. Incredible with fast-moving Wave or Radar patterns."
            />
            <Switch
              checked={!!selectedLoader.effects.enableTrails}
              label="Motion Trails"
              onChange={(v) => handleEffectChange('enableTrails', v)}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <LabelWithTooltip
              label="3D Parallax Tilt Hover"
              tooltip="Makes the entire loader physically tilt towards your mouse. Best for interactive showcases."
            />
            <Switch
              checked={!!selectedLoader.effects.enable3DTilt}
              label="3D Parallax Tilt Hover"
              onChange={(v) => handleEffectChange('enable3DTilt', v)}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <LabelWithTooltip
              label="Constellation Nodes"
              tooltip="Draws glowing connecting lines between active neighbor cells. Best paired with low Grid Sizes and Pulse pattern."
            />
            <Switch
              checked={selectedLoader.showNodes}
              label="Constellation Nodes"
              onChange={(v) => handleChange('showNodes', v)}
            />
          </div>
        </Section>

        <Section title="Image Mask" icon={<LayoutGrid size={16} />}>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">
              Upload Image to Generate Mask
            </label>
            <input
              type="file"
              accept="image/*"
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-secondary/80"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                  const img = new Image();
                  img.onload = () => {
                    // Process image to grid
                    const size = selectedLoader.gridSize;
                    const canvas = document.createElement('canvas');
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;

                    ctx.drawImage(img, 0, 0, size, size);
                    const data = ctx.getImageData(0, 0, size, size).data;

                    const newActiveCells: boolean[][] = [];
                    for (let y = 0; y < size; y++) {
                      const row: boolean[] = [];
                      for (let x = 0; x < size; x++) {
                        const i = (y * size + x) * 4;
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        const brightness = (r + g + b) / 3;
                        row.push(brightness > 100); // Threshold
                      }
                      newActiveCells.push(row);
                    }
                    updateLoader(selectedLoader.id, {
                      activeCells: newActiveCells,
                    });
                  };
                  img.src = event.target?.result as string;
                };
                reader.readAsDataURL(file);
              }}
            />
            <button
              onClick={() =>
                updateLoader(selectedLoader.id, { activeCells: [] })
              }
              className="text-sm text-destructive hover:underline mt-1 self-start"
            >
              Clear Mask
            </button>
          </div>
        </Section>

        <div className="p-4 text-sm text-gray-600 flex items-center justify-between">
          <span>ID: {selectedLoader.id.slice(0, 8)}</span>
          <button
            onClick={() => removeLoader(selectedLoader.id)}
            className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition-colors flex items-center gap-1 relative before:absolute before:inset-[-8px]"
            title="Delete Loader (Del)"
            aria-label="Delete Loader"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// UI Helpers (Internal)

const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  return (
    <Accordion
      className="bg-secondary/30 rounded-lg p-3 border border-[var(--border-hairline)] border-border/50 hover:border-border/80 transition-[border-color,background-color] duration-150 ease-out"
      expandedValue={isExpanded ? 'active' : null}
      onValueChange={(v) => setIsExpanded(v === 'active')}
    >
      <AccordionItem value="active">
        <AccordionTrigger className="w-full flex items-center justify-between text-gray-200 font-medium text-sm w-full outline-none">
          <div className="flex items-center gap-2 uppercase tracking-wider">
            <span className="text-primary/70">{icon}</span>
            <span>{title}</span>
          </div>
          <svg
            className={`w-4 h-4 text-muted transition-transform duration-200 ease-out-quint ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3 pt-4">{children}</div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const Input: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <div className="group">
    <label className="block text-xs text-muted font-medium mb-1.5 uppercase tracking-wide group-focus-within:text-primary transition-colors">
      {label}
    </label>
    <input
      className="w-full bg-input border border-border rounded-md px-3 py-2 text-base text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-[border-color,box-shadow,background-color] duration-150 ease-out placeholder:text-muted/50"
      value={value}
      aria-label={label}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const Select: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div className="group">
    <label className="block text-xs text-muted font-medium mb-1.5 uppercase tracking-wide group-focus-within:text-primary transition-colors">
      {label}
    </label>
    <div className="relative">
      <select
        className="w-full bg-input border border-border rounded-md px-3 py-2 text-base text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-[border-color,box-shadow,background-color] duration-150 ease-out appearance-none capitalize"
        value={value}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  </div>
);

const Range: React.FC<{
  label: string;
  tooltip?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}> = ({ label, tooltip, value, min, max, step = 1, onChange }) => {
  // Generate 5 evenly spaced decorative dots
  const dots = [1, 2, 3, 4, 5];

  // Calculate filled percentage for visual track fill
  const percentage = ((value - min) / (max - min)) * 100;

  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      el.blur();
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="group mb-2">
      <div className="flex justify-between mb-2">
        {tooltip ? (
          <LabelWithTooltip
            label={label}
            tooltip={tooltip}
            className="text-xs text-muted font-medium uppercase tracking-wide group-focus-within:text-primary transition-colors"
          />
        ) : (
          <label className="text-xs text-muted font-medium uppercase tracking-wide group-focus-within:text-primary transition-colors">
            {label}
          </label>
        )}
        <span className="text-xs text-gray-400 font-mono bg-secondary px-1.5 py-0.5 rounded flex items-center min-w-[32px] justify-center tabular-nums">
          <AnimatedNumber value={value} format={(v) => (v % 1 !== 0 ? v.toFixed(1) : v.toString())} />
        </span>
      </div>

      <div className="relative h-8 w-full flex items-center">
        {/* Visual Track Background */}
        <div className="absolute left-0 right-0 h-6 bg-secondary overflow-hidden pointer-events-none rounded-full border border-white/5">
          {/* Visual Fill */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-primary/20 transition-[width] duration-150 ease-out"
            style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
          />

          {/* Dots inside track */}
          <div className="absolute inset-0 flex justify-between items-center px-[14px]">
            {dots.map((d) => (
              <div key={d} className="w-1.5 h-1.5 rounded-full bg-white/10" />
            ))}
          </div>
        </div>

        {/* The actual input layer, fully transparent track, styled thumb */}
        <input
          ref={inputRef}
          type="range"
          className="
                        w-full absolute inset-0 h-full opacity-100 bg-transparent appearance-none cursor-grab active:cursor-grabbing outline-none
                        [&::-webkit-slider-runnable-track]:bg-transparent 
                        [&::-webkit-slider-thumb]:appearance-none 
                        [&::-webkit-slider-thumb]:w-8 
                        [&::-webkit-slider-thumb]:h-8 
                        [&::-webkit-slider-thumb]:bg-gray-100 
                        [&::-webkit-slider-thumb]:rounded-xl
                        [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(0,0,0,0.6)]
                        [&::-webkit-slider-thumb]:border
                        [&::-webkit-slider-thumb]:border-white/20
                        [&::-webkit-slider-thumb]:transition-transform
                        [&::-webkit-slider-thumb]:active:scale-95
                        [&::-moz-range-track]:bg-transparent 
                        [&::-moz-range-thumb]:appearance-none 
                        [&::-moz-range-thumb]:w-8 
                        [&::-moz-range-thumb]:h-8 
                        [&::-moz-range-thumb]:bg-gray-100 
                        [&::-moz-range-thumb]:border-none
                        [&::-moz-range-thumb]:rounded-xl
                        [&::-moz-range-thumb]:shadow-[0_0_15px_rgba(0,0,0,0.6)]
                    "
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

function hexToHsl(hex: string) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3)
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  if (hex.length !== 6) return [0, 0, 0];
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const ColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const hsl = React.useMemo(() => hexToHsl(value), [value]);
  const hue = hsl[0];
  const lightness = hsl[2];

  const handleHueChange = (h: number) => onChange(hslToHex(h, hsl[1], hsl[2]));
  const handleLightnessChange = (l: number) =>
    onChange(hslToHex(hsl[0], hsl[1], l));

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="flex items-center justify-between group p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <label className="text-xs text-gray-400 font-medium group-hover:text-gray-200 transition-colors pointer-events-none">
          {label}
        </label>
        <div className="flex items-center gap-2 pointer-events-none">
          <span className="text-[10px] text-muted font-mono uppercase hidden group-hover:block transition-all">
            {value}
          </span>
          <div className="relative w-5 h-5 rounded-full overflow-hidden border border-border shadow-sm ring-1 ring-white/5 group-hover:ring-white/20 transition-all">
            <div
              className="absolute inset-0"
              style={{ backgroundColor: value }}
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-[100] w-64 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl p-4 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150 ease-out-quint">
          <div className="flex flex-wrap gap-2">
            {[
              '#3b82f6',
              '#10b981',
              '#a855f7',
              '#ef4444',
              '#f59e0b',
              '#ec4899',
              '#ffffff',
              '#18181b',
            ].map((c) => (
              <button
                key={c}
                onClick={() => onChange(c)}
                aria-label={`Select color ${c}`}
                className="w-6 h-6 rounded-full border border-white/10 shadow-sm hover:scale-110 transition-transform relative before:absolute before:inset-[-6px]"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[11px] text-muted mb-1.5 font-medium uppercase tracking-wider">
                <span>Hue</span>
                <span>{hue}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={(e) => handleHueChange(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md cursor-grab active:cursor-grabbing"
                style={{
                  background:
                    'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
                }}
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-muted mb-1.5 font-medium uppercase tracking-wider">
                <span>Lightness</span>
                <span>{lightness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={lightness}
                onChange={(e) => handleLightnessChange(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md cursor-grab active:cursor-grabbing"
                style={{
                  background: `linear-gradient(to right, #000 0%, hsl(${hue}, ${hsl[1]}%, 50%) 50%, #fff 100%)`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Switch: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}> = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary relative before:absolute before:inset-[-12px] ${checked ? 'bg-primary' : 'bg-secondary'
      }`}
  >
    <span
      aria-hidden="true"
      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition-[transform] duration-150 ease-in-out ${checked ? 'translate-x-[18px]' : 'translate-x-[2px]'
        }`}
    />
  </button>
);

const LabelWithTooltip: React.FC<{
  label: string;
  tooltip: string;
  className?: string;
}> = ({ label, tooltip, className = 'text-sm text-gray-400' }) => (
  <div className="flex items-center gap-1.5 relative group/tooltip">
    <label className={className}>{label}</label>
    <Info size={14} className="text-muted/50 cursor-help" />
    <div className="absolute left-0 bottom-full mb-2 w-56 p-3 bg-[#18181b] border border-white/10 text-gray-300 text-xs leading-relaxed rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-[opacity,transform,visibility] duration-150 ease-out-quint translate-y-1 group-hover/tooltip:translate-y-0 z-[60] pointer-events-none normal-case tracking-normal font-sans delay-200">
      {tooltip}
    </div>
  </div>
);
