import { describe, it, expect } from 'vitest';
import { generateReactCode } from '../src/utils/exportCode';
import { createDefaultLoader } from '../src/utils/defaults';

describe('exportCode', () => {
    it('generates valid react component code for a loader configuration', () => {
        const config = createDefaultLoader('test-123', 0, 0);
        config.text = 'My Test Loader';

        // Add active cells to test mask array generation
        config.activeCells = Array(config.gridSize).fill(Array(config.gridSize).fill(true));

        const code = generateReactCode(config);

        // Check for essential React structure
        expect(code).toContain('import React, { useRef, useEffect } from \'react\'');
        expect(code).toContain('export const Loader');

        // Check if parts of config are injected
        expect(code).toContain('gridSize: 10');
        expect(code).toContain('My Test Loader');

        // Check if the getCellState helper was injected
        expect(code).toContain('const getCellState = (');
    });

    it('handles empty activeCells array gracefully', () => {
        const config = createDefaultLoader('test-123', 0, 0);
        config.activeCells = [];

        const code = generateReactCode(config);
        expect(code).toContain('activeCells: []');
    });
});
