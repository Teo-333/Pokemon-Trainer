import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LANGUAGE_STORAGE_KEY } from './i18n';
import { renderWithProviders } from '../test/renderWithProviders';

describe('i18n', () => {
  it('renders English text by default', () => {
    renderWithProviders();

    expect(
      screen.getByRole('heading', { name: 'Pokemon Collections' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Saved Pokemon lists will appear here.')).toBeInTheDocument();
  });

  it('switches visible UI text to Russian', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await user.click(screen.getByRole('button', { name: 'RU' }));

    expect(
      screen.getByRole('heading', { name: 'Коллекции покемонов' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Сохраненные списки покемонов появятся здесь.'),
    ).toBeInTheDocument();
  });

  it('saves the selected language preference', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await user.click(screen.getByRole('button', { name: 'RU' }));

    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('ru');
  });

  it('restores a saved Russian preference', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'ru');

    renderWithProviders();

    expect(
      screen.getByRole('heading', { name: 'Коллекции покемонов' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'RU' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
