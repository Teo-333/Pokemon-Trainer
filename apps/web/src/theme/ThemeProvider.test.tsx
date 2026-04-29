import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../components/layout/ThemeToggle';
import { renderWithProviders } from '../test/renderWithProviders';

describe('ThemeProvider', () => {
  it('defaults to light theme', async () => {
    renderWithProviders(<ThemeToggle />);

    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument();
    await waitFor(() => {
      expect(document.documentElement).not.toHaveClass('dark');
      expect(localStorage.getItem('pokemonCollectionsTheme')).toBe('light');
    });
  });

  it('switches to dark theme and stores the preference', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }));

    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('pokemonCollectionsTheme')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();
  });

  it('switches back to light theme', async () => {
    const user = userEvent.setup();
    localStorage.setItem('pokemonCollectionsTheme', 'dark');
    renderWithProviders(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }));

    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('pokemonCollectionsTheme')).toBe('light');
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument();
  });

  it('restores a saved dark preference', async () => {
    localStorage.setItem('pokemonCollectionsTheme', 'dark');

    renderWithProviders(<ThemeToggle />);

    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
      expect(localStorage.getItem('pokemonCollectionsTheme')).toBe('dark');
    });
  });
});
