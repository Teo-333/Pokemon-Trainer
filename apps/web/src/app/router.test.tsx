import { screen } from '@testing-library/react';
import { getLists } from '../api/listsApi';
import { renderWithProviders } from '../test/renderWithProviders';

vi.mock('../api/listsApi', () => ({
  getList: vi.fn(),
  getLists: vi.fn(),
}));

describe('router', () => {
  beforeEach(() => {
    vi.mocked(getLists).mockResolvedValue([]);
  });

  it('renders the main page', async () => {
    renderWithProviders();

    expect(
      screen.getByRole('heading', { name: 'Pokemon Collections' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('No saved lists yet')).toBeInTheDocument();
  });

  it('renders the create list page', () => {
    renderWithProviders(undefined, { route: '/lists/new' });

    expect(
      screen.getByRole('heading', { name: 'Create Pokemon list' }),
    ).toBeInTheDocument();
  });

  it('renders the list details page', () => {
    renderWithProviders(undefined, { route: '/lists/abc123' });

    expect(
      screen.getByRole('heading', { name: 'Pokemon list abc123' }),
    ).toBeInTheDocument();
  });
});
