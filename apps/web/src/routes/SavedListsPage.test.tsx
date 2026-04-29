import { screen } from '@testing-library/react';
import { ApiError } from '../api/http';
import { getList, getLists } from '../api/listsApi';
import { starterList, starterListSummary } from '../test/fixtures';
import { renderWithProviders } from '../test/renderWithProviders';

vi.mock('../api/listsApi', () => ({
  getList: vi.fn(),
  getLists: vi.fn(),
}));

describe('SavedListsPage', () => {
  beforeEach(() => {
    vi.mocked(getLists).mockResolvedValue([]);
    vi.mocked(getList).mockResolvedValue(starterList);
  });

  it('renders the empty state', async () => {
    renderWithProviders();

    expect(await screen.findByText('No saved lists yet')).toBeInTheDocument();
    expect(screen.getByText('Saved Pokemon lists will appear here.')).toBeInTheDocument();
  });

  it('renders saved list summaries', async () => {
    vi.mocked(getLists).mockResolvedValue([starterListSummary]);

    renderWithProviders();

    expect(await screen.findByRole('heading', { name: 'Starter Team' })).toBeInTheDocument();
    expect(screen.getByText('Pokemon')).toBeInTheDocument();
    expect(screen.getAllByText('3')).toHaveLength(2);
    expect(screen.getByText('Total weight')).toBeInTheDocument();
    expect(screen.getByText('244 hg')).toBeInTheDocument();
    expect(screen.getByText('Distinct species')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Starter Team/ })).toHaveAttribute(
      'href',
      `/lists/${starterListSummary.id}`,
    );
  });

  it('links to the create page', async () => {
    renderWithProviders();

    expect(screen.getAllByRole('link', { name: 'Create New List' })[0]).toHaveAttribute(
      'href',
      '/lists/new',
    );
    expect(await screen.findByText('No saved lists yet')).toBeInTheDocument();
  });

  it('renders the error state', async () => {
    vi.mocked(getLists).mockRejectedValue(
      new ApiError('Backend is unavailable.', 500, 'INTERNAL_ERROR', '/api/lists'),
    );

    renderWithProviders();

    expect(await screen.findByText('Could not load saved lists')).toBeInTheDocument();
    expect(screen.getByText('Backend is unavailable.')).toBeInTheDocument();
  });

  it('renders Russian text when language is ru', async () => {
    localStorage.setItem('pokemonCollectionsLanguage', 'ru');

    renderWithProviders();

    expect(await screen.findByText('Пока нет сохраненных списков')).toBeInTheDocument();
    expect(
      screen.getByText('Сохраненные списки покемонов появятся здесь.'),
    ).toBeInTheDocument();
  });
});
