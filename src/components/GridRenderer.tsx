import React, { useRef, useEffect } from 'react';
import type { LoaderConfig } from '../types';
import { getCellState } from '../utils/patterns';

interface GridRendererProps {
  config: LoaderConfig;
  width: number;
  height: number;
}

const COLORMAPS: Record<string, { r: number; g: number; b: number }[]> = {
  ocean: [
    { r: 4, g: 31, b: 67 },
    { r: 28, g: 100, b: 153 },
    { r: 61, g: 204, b: 212 },
    { r: 240, g: 249, b: 255 },
  ],
  fire: [
    { r: 50, g: 0, b: 0 },
    { r: 200, g: 40, b: 0 },
    { r: 255, g: 150, b: 0 },
    { r: 255, g: 255, b: 150 },
  ],
  cyber: [
    { r: 20, g: 0, b: 40 },
    { r: 120, g: 20, b: 200 },
    { r: 255, g: 20, b: 147 },
    { r: 0, g: 255, b: 255 },
  ],
  neon: [
    { r: 0, g: 30, b: 10 },
    { r: 0, g: 150, b: 50 },
    { r: 150, g: 255, b: 0 },
    { r: 255, g: 255, b: 255 },
  ],
};

const NEIGHBOR_OFFSETS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [-1, 1],
];

export const GridRenderer: React.FC<GridRendererProps> = ({
  config,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const cellStatesRef = useRef<{ states: any[][]; lastGridSize: number }>({
    states: [],
    lastGridSize: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle High DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const startTime = performance.now();

    const render = (time: number) => {
      const { gridSize, colors, effects, cellShape, animationStyle } = config;

      if (effects.enableTrails) {
        // To create trails, we fill the canvas with the background color (or transparent black)
        // but with a very low opacity, so previous frames slowly fade out.
        // We need to parse the background color or just use a dark fade. Let's assume the canvas is over a dark background.
        // A simple approach:
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = `rgba(0, 0, 0, 0.2)`;
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      const cellSize = width / gridSize;
      const gap = cellSize * 0.1; // 10% gap
      const cellDrawSize = cellSize - gap;

      // Maintain a persistent array structure to avoid GC spikes
      if (cellStatesRef.current.lastGridSize !== gridSize) {
        cellStatesRef.current.states = Array.from({ length: gridSize }, () =>
          Array.from({ length: gridSize }, () => ({
            active: false,
            opacity: 0,
            px: 0,
            py: 0,
            drawSize: 0,
            drawAlpha: 0,
          }))
        );
        cellStatesRef.current.lastGridSize = gridSize;
      }
      const cellStates = cellStatesRef.current.states;

      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const hasMask = config.activeCells && config.activeCells.length > 0;
          const maskActive = hasMask
            ? config.activeCells[y] && config.activeCells[y][x]
            : true;

          const cell = cellStates[y][x];

          if (!maskActive) {
            cell.active = false;
            cell.opacity = 0;
            cell.px = 0;
            cell.py = 0;
            cell.drawSize = 0;
            cell.drawAlpha = 0;
            continue;
          }

          getCellState(x, y, (time - startTime) * 0.001, config, cell);
          const { active, opacity } = cell;

          let drawAlpha = active ? opacity : 0.2;
          let drawSize = cellDrawSize;

          if (animationStyle === 'scale') {
            drawSize = active
              ? cellDrawSize * Math.max(0.2, opacity)
              : cellDrawSize * 0.2;
            drawAlpha = 1;
          } else if (animationStyle === 'pulse-size') {
            drawSize = active
              ? cellDrawSize * (1 + opacity * 0.3)
              : cellDrawSize;
          } else if (animationStyle === 'glow') {
            drawAlpha = active ? opacity : 0.1;
          }

          const densityBias = config.densityBias || 1.0;

          // Base center positions
          let cx = x * cellSize + cellSize / 2;
          let cy = y * cellSize + cellSize / 2;

          if (densityBias !== 1.0) {
            // Normalize to -1 to 1 relative to center
            const nx = (cx / width - 0.5) * 2;
            const ny = (cy / width - 0.5) * 2;

            // Apply power bias
            const wnx = Math.sign(nx) * Math.pow(Math.abs(nx), densityBias);
            const wny = Math.sign(ny) * Math.pow(Math.abs(ny), densityBias);

            // Map back to canvas coordinates
            cx = (wnx / 2 + 0.5) * width;
            cy = (wny / 2 + 0.5) * width;
          }

          const px = cx - drawSize / 2;
          const py = cy - drawSize / 2;

          cell.active = active;
          cell.opacity = opacity;
          cell.px = px;
          cell.py = py;
          cell.drawSize = drawSize;
          cell.drawAlpha = drawAlpha;
        }
      }

      // Second pass: Draw connecting lines (showNodes feature)
      if (config.showNodes) {
        ctx.lineWidth = Math.max(1, cellSize * 0.05);
        ctx.lineCap = 'round';
        ctx.strokeStyle = colors.primary;

        if (effects.glow > 0) {
          ctx.shadowBlur = effects.glow * 0.3;
          ctx.shadowColor = colors.primary;
        } else {
          ctx.shadowBlur = 0;
        }

        let lastLineOpacity = -1;

        for (let y = 0; y < gridSize; y++) {
          for (let x = 0; x < gridSize; x++) {
            const current = cellStates[y][x];
            if (!current.active) continue;

            const cx1 = current.px + current.drawSize / 2;
            const cy1 = current.py + current.drawSize / 2;

            // Check right and bottom neighbors
            for (let i = 0; i < NEIGHBOR_OFFSETS.length; i++) {
              const nx = x + NEIGHBOR_OFFSETS[i][0];
              const ny = y + NEIGHBOR_OFFSETS[i][1];

              if (nx >= 0 && nx < gridSize && ny < gridSize) {
                const neighbor = cellStates[ny][nx];
                if (neighbor.active) {
                  // Calculate line opacity based on minimum opacity of connected nodes
                  const lineOpacity = Math.min(current.opacity, neighbor.opacity) * 0.5;

                  if (lastLineOpacity !== lineOpacity) {
                    ctx.globalAlpha = lineOpacity;
                    lastLineOpacity = lineOpacity;
                  }

                  ctx.beginPath();
                  ctx.moveTo(cx1, cy1);

                  const cx2 = neighbor.px + neighbor.drawSize / 2;
                  const cy2 = neighbor.py + neighbor.drawSize / 2;
                  ctx.lineTo(cx2, cy2);
                  ctx.stroke();
                }
              }
            }
          }
        }
      }

      // Third pass: Draw cells
      let lastFillStyle = '';
      let lastGlobalAlpha = -1;
      let lastShadowBlur = -1;
      let lastShadowColor = '';

      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const hasMask = config.activeCells && config.activeCells.length > 0;
          const maskActive = hasMask
            ? config.activeCells[y] && config.activeCells[y][x]
            : true;
          if (!maskActive) continue;
          const { opacity, px, py, drawSize } = cellStates[y][x];
          let drawAlpha = cellStates[y][x].drawAlpha;
          const active = cellStates[y][x].active;

          let finalColor: string = active ? colors.primary : colors.inactive;

          if (
            colors.colorMap &&
            colors.colorMap !== 'none' &&
            COLORMAPS[colors.colorMap]
          ) {
            const map = COLORMAPS[colors.colorMap];
            // opacity is usually 0.1 to 1.0. Let's map it 0 to 1
            const t = Math.max(0, Math.min(1, (opacity - 0.1) / 0.9));

            // Find the appropriate segment in the colormap
            const segments = map.length - 1;
            const scaledT = t * segments;
            const index = Math.min(segments - 1, Math.floor(scaledT));
            const remainder = scaledT - index;

            const c1 = map[index];
            const c2 = map[index + 1];

            const r = Math.round(c1.r + (c2.r - c1.r) * remainder);
            const g = Math.round(c1.g + (c2.g - c1.g) * remainder);
            const b = Math.round(c1.b + (c2.b - c1.b) * remainder);

            finalColor = `rgb(${r}, ${g}, ${b})`;

            if (animationStyle === 'glow' || animationStyle === 'fade') {
              drawAlpha = 1; // Colormap handles visual intensity, keep alpha high so colors show
            }
          }

          if (lastFillStyle !== finalColor) {
            ctx.fillStyle = finalColor;
            lastFillStyle = finalColor;
          }

          if (lastGlobalAlpha !== drawAlpha) {
            ctx.globalAlpha = drawAlpha;
            lastGlobalAlpha = drawAlpha;
          }

          let targetShadowBlur = 0;
          let targetShadowColor = '';

          if (active && effects.glow > 0) {
            targetShadowBlur =
              effects.glow *
              0.5 *
              (animationStyle === 'glow' &&
                (!colors.colorMap || colors.colorMap === 'none')
                ? opacity * 2
                : 1);
            targetShadowColor = finalColor;
          }

          if (lastShadowBlur !== targetShadowBlur) {
            ctx.shadowBlur = targetShadowBlur;
            lastShadowBlur = targetShadowBlur;
          }

          if (targetShadowBlur > 0 && lastShadowColor !== targetShadowColor) {
            ctx.shadowColor = targetShadowColor;
            lastShadowColor = targetShadowColor;
          }

          ctx.beginPath();
          if (cellShape === 'circle') {
            ctx.arc(
              px + drawSize / 2,
              py + drawSize / 2,
              drawSize / 2,
              0,
              Math.PI * 2
            );
          } else if (cellShape === 'rounded') {
            ctx.roundRect(px, py, drawSize, drawSize, drawSize * 0.25);
          } else if (cellShape === 'diamond') {
            ctx.moveTo(px + drawSize / 2, py);
            ctx.lineTo(px + drawSize, py + drawSize / 2);
            ctx.lineTo(px + drawSize / 2, py + drawSize);
            ctx.lineTo(px, py + drawSize / 2);
            ctx.closePath();
          } else if (cellShape === 'hexagon') {
            const a = drawSize / 4;
            const b = Math.sqrt(3) * a;
            const cx = px + drawSize / 2;
            const cy = py + drawSize / 2;
            ctx.moveTo(cx, cy - 2 * a);
            ctx.lineTo(cx + b, cy - a);
            ctx.lineTo(cx + b, cy + a);
            ctx.lineTo(cx, cy + 2 * a);
            ctx.lineTo(cx - b, cy + a);
            ctx.lineTo(cx - b, cy - a);
            ctx.closePath();
          } else if (cellShape === 'star') {
            const cx = px + drawSize / 2;
            const cy = py + drawSize / 2;
            const outerRadius = drawSize / 2;
            const innerRadius = drawSize / 4;
            const spikes = 5;
            let rot = (Math.PI / 2) * 3;
            const step = Math.PI / spikes;

            ctx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
              ctx.lineTo(
                cx + Math.cos(rot) * outerRadius,
                cy + Math.sin(rot) * outerRadius
              );
              rot += step;
              ctx.lineTo(
                cx + Math.cos(rot) * innerRadius,
                cy + Math.sin(rot) * innerRadius
              );
              rot += step;
            }
            ctx.closePath();
          } else {
            // square
            ctx.rect(px, py, drawSize, drawSize);
          }
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [config, width, height]);

  return <canvas ref={canvasRef} />;
};
