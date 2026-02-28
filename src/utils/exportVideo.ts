import type { LoaderConfig } from '../types';
import { getCellState } from './patterns';

/**
 * Records a WebM video of the loader animation using an offscreen canvas and MediaRecorder.
 */
export const exportWebM = async (
  config: LoaderConfig,
  width = 400,
  height = 400,
  durationMs = 4000
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Set up offscreen canvas
      const canvas = document.createElement('canvas');
      const dpr = window.devicePixelRatio || 1;
      // For recording, we might just want to stick to a fixed 1x or 2x resolution to keep video sizes manageable.
      // Let's force 2x for good quality if dpr > 1.
      const recordDpr = Math.min(2, dpr);
      canvas.width = width * recordDpr;
      canvas.height = height * recordDpr;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get 2d context');

      ctx.scale(recordDpr, recordDpr);

      // Setup MediaRecorder
      const stream = canvas.captureStream(60); // 60 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
      });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `loader-${config.id || 'export'}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        resolve();
      };

      // Start recording
      mediaRecorder.start();

      const startTime = performance.now();

      let isRecording = true;

      const render = (time: number) => {
        if (!isRecording) return;

        // --- Start Render Logic (adapted from GridRenderer) ---
        const { gridSize, colors, effects, cellShape, animationStyle } = config;

        // For offscreen export, we need to draw the background explicitly
        // so the video isn't transparent (unless we want transparent webm, but often players don't render it well).
        if (!effects.enableTrails) {
          ctx.fillStyle = colors.background;
          ctx.fillRect(0, 0, width, height);
        } else {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.fillRect(0, 0, width, height);
          ctx.globalCompositeOperation = 'source-over';
          // We need a base background layer for trails if we recorded it.
          // To keep it simple, trails over transparent might look weird in the raw webm,
          // but we'll draw it as is. Usually users expect dark background.
        }

        const cellSize = width / gridSize;
        const gap = cellSize * 0.1;
        const cellDrawSize = cellSize - gap;

        const cellStates: {
          active: boolean;
          opacity: number;
          px: number;
          py: number;
          drawSize: number;
          drawAlpha: number;
        }[][] = [];

        for (let y = 0; y < gridSize; y++) {
          const rowStates = [];
          for (let x = 0; x < gridSize; x++) {
            const hasMask = config.activeCells && config.activeCells.length > 0;
            const maskActive = hasMask
              ? config.activeCells[y] && config.activeCells[y][x]
              : true;

            if (!maskActive) {
              rowStates.push({
                active: false,
                opacity: 0,
                px: 0,
                py: 0,
                drawSize: 0,
                drawAlpha: 0,
              });
              continue;
            }

            const outState = { active: false, opacity: 0.2 };
            getCellState(
              x,
              y,
              (time - startTime) * 0.001,
              config,
              outState
            );
            const { active, opacity } = outState;

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

            let cx = x * cellSize + cellSize / 2;
            let cy = y * cellSize + cellSize / 2;

            if (densityBias !== 1.0) {
              const nx = (cx / width - 0.5) * 2;
              const ny = (cy / width - 0.5) * 2;
              const wnx = Math.sign(nx) * Math.pow(Math.abs(nx), densityBias);
              const wny = Math.sign(ny) * Math.pow(Math.abs(ny), densityBias);
              cx = (wnx / 2 + 0.5) * width;
              cy = (wny / 2 + 0.5) * width;
            }

            const px = cx - drawSize / 2;
            const py = cy - drawSize / 2;

            rowStates.push({ active, opacity, px, py, drawSize, drawAlpha });
          }
          cellStates.push(rowStates);
        }

        if (config.showNodes) {
          ctx.lineWidth = Math.max(1, cellSize * 0.05);
          ctx.lineCap = 'round';

          for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
              const current = cellStates[y][x];
              if (!current.active) continue;

              const cx1 = current.px + current.drawSize / 2;
              const cy1 = current.py + current.drawSize / 2;

              const neighbors = [
                { nx: x + 1, ny: y },
                { nx: x, ny: y + 1 },
                { nx: x + 1, ny: y + 1 },
                { nx: x - 1, ny: y + 1 },
              ];

              for (const n of neighbors) {
                if (n.nx >= 0 && n.nx < gridSize && n.ny < gridSize) {
                  const neighbor = cellStates[n.ny][n.nx];
                  if (neighbor.active) {
                    const lineOpacity =
                      Math.min(current.opacity, neighbor.opacity) * 0.5;

                    ctx.beginPath();
                    ctx.moveTo(cx1, cy1);

                    const cx2 = neighbor.px + neighbor.drawSize / 2;
                    const cy2 = neighbor.py + neighbor.drawSize / 2;
                    ctx.lineTo(cx2, cy2);

                    ctx.strokeStyle = colors.primary;
                    ctx.globalAlpha = lineOpacity;

                    if (effects.glow > 0) {
                      ctx.shadowBlur = effects.glow * 0.3;
                      ctx.shadowColor = colors.primary;
                    } else {
                      ctx.shadowBlur = 0;
                    }

                    ctx.stroke();
                  }
                }
              }
            }
          }
        }

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

            ctx.fillStyle = active ? colors.primary : colors.inactive;
            const colormaps: Record<
              string,
              { r: number; g: number; b: number }[]
            > = {
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

            let finalColor = ctx.fillStyle;
            if (
              colors.colorMap &&
              colors.colorMap !== 'none' &&
              colormaps[colors.colorMap]
            ) {
              const map = colormaps[colors.colorMap];
              const t = Math.max(0, Math.min(1, (opacity - 0.1) / 0.9));
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
              ctx.fillStyle = finalColor;

              if (animationStyle === 'glow' || animationStyle === 'fade') {
                drawAlpha = 1;
              }
            }

            ctx.globalAlpha = drawAlpha;

            if (active && effects.glow > 0) {
              ctx.shadowBlur =
                effects.glow *
                0.5 *
                (animationStyle === 'glow' &&
                  (!colors.colorMap || colors.colorMap === 'none')
                  ? opacity * 2
                  : 1);
              ctx.shadowColor = finalColor as string;
            } else {
              ctx.shadowBlur = 0;
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
              ctx.rect(px, py, drawSize, drawSize);
            }
            ctx.fill();
          }
        }
        // --- End Render Logic ---

        // Check duration
        if (time - startTime > durationMs) {
          isRecording = false;
          mediaRecorder.stop();
          // Optional: stop stream tracks
          stream.getTracks().forEach((track) => track.stop());
        } else {
          requestAnimationFrame(render);
        }
      };

      // Start animation loop
      requestAnimationFrame(render);
    } catch (error) {
      console.error('Failed to export webm:', error);
      reject(error);
    }
  });
};
