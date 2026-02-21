import { describe, it, expect } from 'vitest';
import { createDefaultLoader } from '../src/utils/defaults';

describe('createDefaultLoader', () => {
    it('creates a loader with given id and position', () => {
        const loader = createDefaultLoader('test-id', 100, 200);
        expect(loader.id).toBe('test-id');
        expect(loader.position).toEqual({ x: 100, y: 200 });
    });

    it('generates random shapes, patterns, colors, and text', () => {
        const loader = createDefaultLoader('random-test', 0, 0);
        expect(loader.cellShape).toBeTruthy();
        expect(loader.pattern).toBeTruthy();
        expect(loader.colors.primary).toBeTruthy();
        expect(loader.text).toBeTruthy();
        expect(loader.subheading).toBeTruthy();
        expect(loader.gridSize).toBe(10);
    });
});
