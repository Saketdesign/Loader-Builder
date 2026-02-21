import type { LoaderConfig } from '../types';

export const generateReactCode = (config: LoaderConfig): string => {
  // Generate the mask array as a JS array literal string if it exists and has active cells
  let maskArrayStr = '[]';
  if (config.activeCells && config.activeCells.length > 0) {
    // Only include if there's actually a mask (some false values)
    // If it's all true, we could theoretically skip, but let's just dump the array
    maskArrayStr = JSON.stringify(config.activeCells);
  }

  return `// npm install react

import React, { useRef, useEffect } from 'react';

/**
 * Animated Canvas Loader Component
 * Generated from configuration: ${config.id || 'Custom'}
 */
export const Loader: React.FC<{ width?: number; height?: number; className?: string }> = ({ 
  width = 300, 
  height = 300,
  className = '' 
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Loader Configuration
    const config = {
        gridSize: ${config.gridSize},
        pattern: '${config.pattern}',
        patternScale: ${config.patternScale || 1},
        speed: ${config.speed},
        animationStyle: '${config.animationStyle}',
        cellShape: '${config.cellShape}',
        colors: ${JSON.stringify(config.colors, null, 8)},
        effects: ${JSON.stringify(config.effects, null, 8)},
        densityBias: ${config.densityBias || 1.0},
        showNodes: ${config.showNodes},
        activeCells: ${maskArrayStr}
    };

    ${getCellStateTemplate()}

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
        canvas.style.width = \`\${width}px\`;
        canvas.style.height = \`\${height}px\`;

        let startTime = performance.now();
        let animationFrameId: number;

        const render = (time: number) => {
            const { gridSize, colors, effects, cellShape, animationStyle } = config;

            if (effects.enableTrails) {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.fillRect(0, 0, width, height);
                ctx.globalCompositeOperation = 'source-over';
            } else {
                ctx.clearRect(0, 0, width, height);
            }

            const cellSize = width / gridSize;
            const gap = cellSize * 0.1;
            const cellDrawSize = cellSize - gap;

            // First pass: Calculate active states and positions for all cells
            const cellStates: { active: boolean; opacity: number; px: number; py: number; drawSize: number; drawAlpha: number }[][] = [];

            for (let y = 0; y < gridSize; y++) {
                const rowStates = [];
                for (let x = 0; x < gridSize; x++) {
                    const hasMask = config.activeCells && config.activeCells.length > 0;
                    const maskActive = hasMask ? (config.activeCells[y] && config.activeCells[y][x]) : true;

                    if (!maskActive) {
                        rowStates.push({ active: false, opacity: 0, px: 0, py: 0, drawSize: 0, drawAlpha: 0 });
                        continue;
                    }

                    const { active, opacity } = getCellState(x, y, Math.max(0, time - startTime) * 0.001, config);

                    let drawAlpha = active ? opacity : 0.2;
                    let drawSize = cellDrawSize;

                    if (animationStyle === 'scale') {
                        drawSize = active ? cellDrawSize * Math.max(0.2, opacity) : cellDrawSize * 0.2;
                        drawAlpha = 1;
                    } else if (animationStyle === 'pulse-size') {
                        drawSize = active ? cellDrawSize * (1 + opacity * 0.3) : cellDrawSize;
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

            // Second pass: Draw connecting lines
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
                            { nx: x - 1, ny: y + 1 }
                        ];

                        for (const n of neighbors) {
                            if (n.nx >= 0 && n.nx < gridSize && n.ny < gridSize) {
                                const neighbor = cellStates[n.ny][n.nx];
                                if (neighbor.active) {
                                    const lineOpacity = Math.min(current.opacity, neighbor.opacity) * 0.5;

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

            // Third pass: Draw cells
            for (let y = 0; y < gridSize; y++) {
                for (let x = 0; x < gridSize; x++) {
                    const hasMask = config.activeCells && config.activeCells.length > 0;
                    const maskActive = hasMask ? (config.activeCells[y] && config.activeCells[y][x]) : true;
                    if (!maskActive) continue;

                    let { active, opacity, px, py, drawSize, drawAlpha } = cellStates[y][x];

                    ctx.fillStyle = active ? colors.primary : colors.inactive;
                    const colormaps: Record<string, { r: number, g: number, b: number }[]> = {
                        ocean: [{r:4,g:31,b:67}, {r:28,g:100,b:153}, {r:61,g:204,b:212}, {r:240,g:249,b:255}],
                        fire:  [{r:50,g:0,b:0}, {r:200,g:40,b:0}, {r:255,g:150,b:0}, {r:255,g:255,b:150}],
                        cyber: [{r:20,g:0,b:40}, {r:120,g:20,b:200}, {r:255,g:20,b:147}, {r:0,g:255,b:255}],
                        neon:  [{r:0,g:30,b:10}, {r:0,g:150,b:50}, {r:150,g:255,b:0}, {r:255,g:255,b:255}]
                    };

                    let finalColor = ctx.fillStyle;
                    if (colors.colorMap && colors.colorMap !== 'none' && colormaps[colors.colorMap as keyof typeof colormaps]) {
                        const map = colormaps[colors.colorMap as keyof typeof colormaps];
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

                        finalColor = \`rgb(\${r}, \${g}, \${b})\`;
                        ctx.fillStyle = finalColor;

                        if (animationStyle === 'glow' || animationStyle === 'fade') {
                            drawAlpha = 1;
                        }
                    }

                    ctx.globalAlpha = drawAlpha;

                    if (active && effects.glow > 0) {
                        ctx.shadowBlur = effects.glow * 0.5 * (animationStyle === 'glow' && (!colors.colorMap || colors.colorMap === 'none') ? opacity * 2 : 1);
                        ctx.shadowColor = finalColor;
                    } else {
                        ctx.shadowBlur = 0;
                    }

                    ctx.beginPath();
                    if (cellShape === 'circle') {
                        ctx.arc(px + drawSize / 2, py + drawSize / 2, drawSize / 2, 0, Math.PI * 2);
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
                        let rot = Math.PI / 2 * 3;
                        let step = Math.PI / spikes;

                        ctx.moveTo(cx, cy - outerRadius);
                        for (let i = 0; i < spikes; i++) {
                            ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
                            rot += step;
                            ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
                            rot += step;
                        }
                        ctx.closePath();
                    } else { // square
                        ctx.rect(px, py, drawSize, drawSize);
                    }
                    ctx.fill();
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [width, height]);

    return (
        <div 
          className={\`flex flex-col items-center justify-center p-8 rounded-2xl \${className}\`} 
          style={{ backgroundColor: '${config.colors.background}' }}
        >
            <canvas ref={canvasRef} style={{ display: 'block' }} />
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <h2 style={{ 
                  color: '${config.colors.text}', 
                  margin: 0, 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  fontFamily: 'sans-serif' 
                }}>
                  ${config.text}
                </h2>
                ${
                  config.showSubheading
                    ? `
                <p style={{
                  color: '${config.colors.text}',
                  margin: '0.25rem 0 0',
                  opacity: 0.7,
                  fontSize: '1rem',
                  fontFamily: 'sans-serif'
                }}>
                  ${config.subheading || ''}
                </p>
                `
                    : ''
                }
            </div>
        </div>
    );
};
`;
};

// Extracted the patterns logic so it can be generated as a string inside the component
function getCellStateTemplate(): string {
  return `
    const getCellState = (
        x: number,
        y: number,
        time: number,
        config: any
    ): { active: boolean; opacity: number } => {
        const { pattern, gridSize, speed } = config;
        const t = time * (speed * 0.7);
        const scale = config.patternScale ?? 1;

        switch (pattern) {
            case 'wave': {
                const diag = x + y;
                const cycleLength = (gridSize * 2) + (4 * scale);
                const wavePos = ((t * 10) % cycleLength) - (2 * scale);
                const dist = Math.abs(diag - wavePos) / scale;
                const active = dist < 2;
                return { active, opacity: active ? 1 - dist * 0.5 : 0.1 };
            }
            case 'radial': {
                const cx = gridSize / 2 - 0.5;
                const cy = gridSize / 2 - 0.5;
                const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                const maxRadius = (gridSize * 0.8) + (2 * scale);
                const radius = (t * 5) % maxRadius;
                const wave = Math.abs(dist - radius) / scale;
                const active = wave < 1.5;
                return { active, opacity: active ? 1 - wave * 0.4 : 0.1 };
            }
            case 'spiral': {
                const cx = gridSize / 2 - 0.5;
                const cy = gridSize / 2 - 0.5;
                const angle = Math.atan2(y - cy, x - cx);
                const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                const spiralPhase = angle + (dist / scale) * 0.5 - t * 5;
                const active = Math.cos(spiralPhase) > 0.8;
                return { active, opacity: active ? 1 : 0.1 };
            }
            case 'pulse': {
                const noise = Math.sin((x / scale) * 0.5 + t) * Math.cos((y / scale) * 0.5 + t * 0.7);
                const active = noise > 0.6;
                return { active, opacity: active ? noise : 0.1 };
            }
            case 'fluid': {
                const nx = x / scale;
                const ny = y / scale;
                const timeScale = t * 0.5;
                const v1 = Math.sin(nx * 0.4 + timeScale);
                const v2 = Math.cos(ny * 0.4 + timeScale * 0.8);
                const v3 = Math.sin((nx + ny) * 0.3 - timeScale * 1.1);
                const v4 = Math.cos((nx - ny) * 0.3 + timeScale * 0.9);
                const noise = (v1 + v2 + v3 + v4) / 4;
                const normalized = (noise + 1) / 2;
                const active = normalized > 0.6;
                const blobIntensity = Math.max(0, (normalized - 0.6) / 0.4);
                return { active, opacity: active ? 0.3 + blobIntensity * 0.7 : 0.1 };
            }
            case 'rain': {
                const colOffset = Math.sin(x * 12.9898) * 43758.5453 % 1;
                const fallSpeed = t * 6;
                const dropY = (fallSpeed + colOffset * gridSize) % (gridSize + 4 * scale) - (2 * scale);
                const dist = dropY - y;
                if (dist >= 0 && dist < 3 * scale) {
                    const intensity = 1 - (dist / (3 * scale));
                    const active = intensity > 0.2;
                    return { active, opacity: intensity };
                }
                return { active: false, opacity: 0.1 };
            }
            case 'radar': {
                const cx = gridSize / 2 - 0.5;
                const cy = gridSize / 2 - 0.5;
                let cellAngle = Math.atan2(y - cy, x - cx);
                if (cellAngle < 0) cellAngle += Math.PI * 2;
                const sweepSpeed = t * 2;
                let radarAngle = sweepSpeed % (Math.PI * 2);
                if (radarAngle < 0) radarAngle += Math.PI * 2;
                let angleDiff = radarAngle - cellAngle;
                if (angleDiff < 0) angleDiff += Math.PI * 2;
                const beamWidth = Math.PI * 0.5 * scale;
                if (angleDiff < beamWidth) {
                    const intensity = 1 - (angleDiff / beamWidth);
                    const active = intensity > 0.1;
                    return { active, opacity: intensity };
                }
                return { active: false, opacity: 0.1 };
            }
            case 'random':
            default: {
                const active = Math.random() > 0.5;
                return { active, opacity: active ? 1 : 0.1 };
            }
        }
    };
    `;
}
