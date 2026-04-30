import { screen, within } from '@testing-library/react';
import { ApiError } from '../api/http';
import { getList } from '../api/listsApi';
import { i18n } from '../i18n/i18n';
import { starterList } from '../test/fixtures';
import { renderWithProviders } from '../test/renderWithProviders';

vi.mock('../api/listsApi', () => ({
  downloadList: vi.fn(),
  getList: vi.fn(),
}));

describe('ListDetailsPage', () => {
  beforeEach(() => {
    vi.mocked(getList).mockResolvedValue(starterList);
  });

  it('renders the saved list details', async () => {
    renderWithProviders(undefined, { route: `/lists/${starterList.id}` });

    expect(
      await screen.findByRole('heading', { name: 'Starter Team' }),
    ).toBeInTheDocument();
    expect(getList).toHaveBeenCalledWith(starterList.id);
    expect(screen.getByRole('link', { name: 'Back to lists' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByRole('button', { name: 'Download JSON' })).toBeInTheDocument();
    expect(screen.getByText('Pokemon')).toBeInTheDocument();
    expect(screen.getByText('Total weight')).toBeInTheDocument();
    expect(screen.getByText('244 hg')).toBeInTheDocument();
    expect(screen.getByText('Distinct species')).toBeInTheDocument();
    expect(screen.getAllByText('3')).toHaveLength(2);

    const pokemonSection = screen.getByRole('heading', { name: 'Saved Pokemon' })
      .parentElement;

    expect(pokemonSection).not.toBeNull();
    expect(
      within(pokemonSection as HTMLElement).getByRole('heading', { name: 'bulbasaur' }),
    ).toBeInTheDocument();
    expect(
      within(pokemonSection as HTMLElement).getByRole('heading', {
        name: 'charmander',
      }),
    ).toBeInTheDocument();
    expect(
      within(pokemonSection as HTMLElement).getByRole('heading', { name: 'squirtle' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Species: bulbasaur')).toBeInTheDocument();
  });

  it('renders the loading state', () => {
    vi.mocked(getList).mockReturnValue(new Promise(() => undefined));

    renderWithProviders(undefined, { route: `/lists/${starterList.id}` });

    expect(screen.getByText('Loading saved list...')).toBeInTheDocument();
  });

  it('renders the error state', async () => {
    vi.mocked(getList).mockRejectedValue(
      new ApiError('Backend is unavailable.', 500, 'INTERNAL_ERROR', '/api/lists/1'),
    );

    renderWithProviders(undefined, { route: `/lists/${starterList.id}` });

    expect(await screen.findByText('Could not load saved list')).toBeInTheDocument();
    expect(screen.getByText('Backend is unavailable.')).toBeInTheDocument();
  });

  it('renders the not-found state', async () => {
    vi.mocked(getList).mockRejectedValue(
      new ApiError('List not found.', 404, 'NOT_FOUND', '/api/lists/missing'),
    );

    renderWithProviders(undefined, { route: '/lists/missing' });

    expect(await screen.findByText('List not found')).toBeInTheDocument();
    expect(
      screen.getByText('The saved list does not exist or was removed.'),
    ).toBeInTheDocument();
  });

  it('renders Russian text when language is ru', async () => {
    localStorage.setItem('pokemonCollectionsLanguage', 'ru');

    renderWithProviders(undefined, { route: `/lists/${starterList.id}` });

    expect(await screen.findByText('Starter Team')).toBeInTheDocument();
    expect(screen.getByText(i18n.t('listDetails.totalWeight'))).toBeInTheDocument();
    expect(screen.getByText(i18n.t('listDetails.pokemonTitle'))).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: i18n.t('downloadList.download') }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: i18n.t('listDetails.backToLists') }))
      .toHaveAttribute('href', '/');
  });
});
