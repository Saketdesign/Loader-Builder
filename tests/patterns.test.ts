import { describe, it, expect } from 'vitest';
import { getCellState } from '../src/utils/patterns';
import { createDefaultLoader } from '../src/utils/defaults';

describe('patterns (getCellState)', () => {
    it('handles wave pattern', () => {
        const config = createDefaultLoader('1', 0, 0);
        config.pattern = 'wave';
        const state = getCellState(0, 0, 1, config);
        expect(state).toHaveProperty('active');
        expect(state).toHaveProperty('opacity');
    });

    it('handles radial pattern', () => {
        const config = createDefaultLoader('1', 0, 0);
        config.pattern = 'radial';
        const state = getCellState(5, 5, 2, config);
        expect(state.active).toBeDefined();
    });

    it('handles spiral pattern', () => {
        const config = createDefaultLoader('1', 0, 0);
        config.pattern = 'spiral';
        const state = getCellState(2, 2, 3, config);
        expect(state.active).toBeDefined();
    });

    it('handles pulse pattern', () => {
        const config = createDefaultLoader('1', 0, 0);
        config.pattern = 'pulse';
        const state = getCellState(4, 4, 1, config);
        expect(state.active).toBeDefined();
    });

    it('handles fluid pattern', () => {
        const config = createDefaultLoader('1', 0, 0);
        config.pattern = 'fluid';
        const state = getCellState(3, 3, 2, config);
        expect(state.active).toBeDefined();
    });

    it('handles rain pattern', () => {
        const config = createDefaultLoader('1', 0, 0);
        config.pattern = 'rain';
        const state = getCellState(1, 1, 1, config);
        expect(state.active).toBeDefined();
    });

    it('handles radar pattern', () => {
        const config = createDefaultLoader('1', 0, 0);
        config.pattern = 'radar';
        const state = getCellState(8, 8, 4, config);
        expect(state.active).toBeDefined();
    });

    it('handles random pattern', () => {
        const config = createDefaultLoader('1', 0, 0);
        config.pattern = 'random';
        const state = getCellState(0, 0, 0, config);
        expect(state.active).toBeDefined();
    });
});
