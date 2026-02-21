import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportWebM } from '../src/utils/exportVideo';
import { createDefaultLoader } from '../src/utils/defaults';

describe('exportVideo', () => {
    let originalCreateElement: typeof document.createElement;
    let originalMediaRecorder: any;

    beforeEach(() => {
        // Mock URL methods
        globalThis.URL.createObjectURL = vi.fn(() => 'blob:test-url');
        globalThis.URL.revokeObjectURL = vi.fn();

        // Mock Canvas and Context
        const mockContext = {
            scale: vi.fn(),
            fillRect: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
            fill: vi.fn(),
            arc: vi.fn(),
            roundRect: vi.fn(),
            rect: vi.fn(),
            closePath: vi.fn()
        };

        const mockCanvas = {
            getContext: vi.fn(() => mockContext),
            captureStream: vi.fn(() => ({
                getTracks: vi.fn(() => [])
            })),
            width: 0,
            height: 0,
            style: {}
        };

        originalCreateElement = document.createElement;
        document.createElement = vi.fn((tag) => {
            if (tag === 'canvas') return mockCanvas as any;
            if (tag === 'a') return { click: vi.fn() } as any;
            return originalCreateElement.call(document, tag);
        });

        // Mock MediaRecorder
        class MockMediaRecorder {
            ondataavailable: any;
            onstop: any;
            start() {
                // simulate data available
                setTimeout(() => {
                    if (this.ondataavailable) {
                        this.ondataavailable({ data: new Blob(['test'], { type: 'video/webm' }) });
                    }
                    if (this.onstop) this.onstop();
                }, 10);
            }
            stop() {
                if (this.onstop) this.onstop();
            }
        }
        originalMediaRecorder = (globalThis as any).MediaRecorder;
        (globalThis as any).MediaRecorder = MockMediaRecorder;

        // Mock requestAnimationFrame to run immediately
        vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
            setTimeout(() => cb(performance.now() + 5000), 0);
            return 1;
        });
    });

    afterEach(() => {
        document.createElement = originalCreateElement;
        (globalThis as any).MediaRecorder = originalMediaRecorder;
        vi.unstubAllGlobals();
    });

    it('exports webm without crashing', async () => {
        const config = createDefaultLoader('1', 0, 0);
        config.effects.enableTrails = true; // hit trail branches
        config.animationStyle = 'scale';
        config.cellShape = 'hexagon'; // hit branches

        // We expect this to resolve after the mock MediaRecorder stops
        await expect(exportWebM(config, 100, 100, 100)).resolves.toBeUndefined();
    });
});
