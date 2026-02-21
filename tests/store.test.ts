import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../src/store';
import { createDefaultLoader } from '../src/utils/defaults';

describe('Zustand Store', () => {
    beforeEach(() => {
        // Reset store state before each test
        useStore.setState({
            loaders: [],
            selectedLoaderId: null,
            canvasTransform: { x: 0, y: 0, scale: 1 },
            isBuilderMode: false,
        });
    });

    it('adds a loader', () => {
        const loader = createDefaultLoader('1', 0, 0);
        useStore.getState().addLoader(loader);

        expect(useStore.getState().loaders).toHaveLength(1);
        expect(useStore.getState().loaders[0].id).toBe('1');
        expect(useStore.getState().selectedLoaderId).toBe('1');
    });

    it('removes a loader', () => {
        const loader = createDefaultLoader('2', 0, 0);
        useStore.getState().addLoader(loader);
        expect(useStore.getState().loaders).toHaveLength(1);

        useStore.getState().removeLoader('2');
        expect(useStore.getState().loaders).toHaveLength(0);
        expect(useStore.getState().selectedLoaderId).toBeNull();
    });

    it('updates a loader', () => {
        const loader = createDefaultLoader('3', 0, 0);
        useStore.getState().addLoader(loader);
        useStore.getState().updateLoader('3', { speed: 5, text: 'Updated Text' });

        const updated = useStore.getState().loaders[0];
        expect(updated.speed).toBe(5);
        expect(updated.text).toBe('Updated Text');
    });

    it('selects a loader', () => {
        useStore.getState().selectLoader('some-id');
        expect(useStore.getState().selectedLoaderId).toBe('some-id');
    });

    it('duplicates a loader', () => {
        const loader = createDefaultLoader('4', 0, 0);
        useStore.getState().addLoader(loader);

        useStore.getState().duplicateLoader('4');
        expect(useStore.getState().loaders).toHaveLength(2);

        const newLoader = useStore.getState().loaders[1];
        expect(newLoader.id).not.toBe('4');
        expect(newLoader.position.x).toBe(loader.position.x + 50);
        expect(newLoader.text).toBe(`${loader.text} (Copy)`);
    });

    it('toggles builder mode', () => {
        expect(useStore.getState().isBuilderMode).toBe(false);
        useStore.getState().toggleBuilderMode();
        expect(useStore.getState().isBuilderMode).toBe(true);
    });
});
