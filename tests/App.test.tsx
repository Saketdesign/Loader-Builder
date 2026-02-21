import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';
import * as store from '../src/store';
import { createDefaultLoader } from '../src/utils/defaults';

// Mock matchMedia for jsdom
window.matchMedia = window.matchMedia || function () {
    return {
        matches: false,
        addListener: function () { },
        removeListener: function () { }
    };
};

describe('App Component Integrations', () => {
    it('renders without crashing and shows title', () => {
        render(<App />);
        expect(screen.getByText(/Loader Builder/i)).toBeInTheDocument();
    });

    it('adds a new loader when CTA is clicked', () => {
        // To ensure store is clean or has default state
        store.useStore.setState({ loaders: [], selectedLoaderId: null, isBuilderMode: false });

        render(<App />);

        // There might be a button with "+" text
        const addBtn = screen.getByText('+');
        fireEvent.click(addBtn);

        // After clicking, there should be 1 loader in the store
        expect(store.useStore.getState().loaders.length).toBe(1);
    });
});
