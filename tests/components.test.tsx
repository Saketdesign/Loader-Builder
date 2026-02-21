import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsPanel } from '../src/components/SettingsPanel';
import { GridRenderer } from '../src/components/GridRenderer';
import { LoaderCard } from '../src/components/LoaderCard';
import { useStore } from '../src/store';
import { createDefaultLoader } from '../src/utils/defaults';

describe('Components Integration', () => {
    it('SettingsPanel renders when loader selected', () => {
        const loader = createDefaultLoader('1', 0, 0);
        useStore.setState({
            loaders: [loader],
            selectedLoaderId: '1'
        });

        render(<SettingsPanel />);
        expect(screen.getByText(/Content/i)).toBeInTheDocument();
    });

    it('GridRenderer renders a canvas', () => {
        const loader = createDefaultLoader('2', 0, 0);
        const { container } = render(<GridRenderer loader={loader} index={0} />);
        expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('LoaderCard renders with title and interacts', () => {
        const loader = createDefaultLoader('3', 0, 0);
        loader.text = 'Test Card Loader';

        const { container } = render(<LoaderCard loader={loader} index={0} />);
        expect(screen.getByText('Test Card Loader')).toBeInTheDocument();
    });
});
