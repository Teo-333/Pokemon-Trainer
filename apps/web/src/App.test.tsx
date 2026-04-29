import { screen } from '@testing-library/react';
import { App } from './App';
import { renderWithProviders } from './test/renderWithProviders';

vi.mock('./app/AppProviders', () => ({
  AppProviders: () => <div>App providers rendered</div>,
}));

describe('App', () => {
  it('renders app providers', () => {
    renderWithProviders(<App />);

    expect(screen.getByText('App providers rendered')).toBeInTheDocument();
  });
});
