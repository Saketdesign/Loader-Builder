import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopControls } from '../src/components/TopControls';
import { useStore } from '../src/store';
import { createDefaultLoader } from '../src/utils/defaults';

describe('TopControls Integration', () => {
    it('renders and opens about me modal', () => {
        useStore.setState({ loaders: [], selectedLoaderId: null });
        render(<TopControls />);

        const aboutBtn = screen.getByText(/About Me/i);
        fireEvent.click(aboutBtn);

        expect(screen.getByText(/Yello! I am Saket/i)).toBeInTheDocument();
    });

    it('can open export menu when loader is selected', () => {
        const loader = createDefaultLoader('1', 0, 0);
        useStore.setState({ loaders: [loader], selectedLoaderId: '1' });

        render(<TopControls />);
        const exportBtn = screen.getByText(/Export/i);
        expect(exportBtn).not.toBeDisabled();

        fireEvent.click(exportBtn);
        expect(screen.getByText(/Download JSON/i)).toBeInTheDocument();
        expect(screen.getByText(/Copy Component/i)).toBeInTheDocument();
    });

    it('export menu is disabled when no loader is selected', () => {
        useStore.setState({ loaders: [], selectedLoaderId: null });

        render(<TopControls />);
        const exportBtn = screen.getByText(/Export/i);
        // the button itself might not be strictly disabled attribute-wise, let's check its class or disabled prop
        expect(exportBtn).toBeDisabled();
    });
});
