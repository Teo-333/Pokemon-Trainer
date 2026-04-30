import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getLists } from '../api/listsApi';
import { LANGUAGE_STORAGE_KEY } from './i18n';
import { renderWithProviders } from '../test/renderWithProviders';

vi.mock('../api/listsApi', () => ({
  downloadList: vi.fn(),
  getList: vi.fn(),
  getLists: vi.fn(),
}));

describe('i18n', () => {
  beforeEach(() => {
    vi.mocked(getLists).mockResolvedValue([]);
  });

  it('renders English text by default', async () => {
    renderWithProviders();

    expect(
      screen.getByRole('heading', { name: 'Pokemon Collections' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('No saved lists yet')).toBeInTheDocument();
  });

  it('switches visible UI text to Russian', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await user.click(screen.getByRole('button', { name: 'RU' }));

    expect(
      screen.getByRole('heading', { name: 'Коллекции покемонов' }),
    ).toBeInTheDocument();
  });

  it('saves the selected language preference', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await user.click(screen.getByRole('button', { name: 'RU' }));

    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('ru');
  });

  it('restores a saved Russian preference', async () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'ru');

    renderWithProviders();

    expect(
      screen.getByRole('heading', { name: 'Коллекции покемонов' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Пока нет сохраненных списков')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'RU' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
