import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '../api/http';
import { createList } from '../api/listsApi';
import { getPokemonById, getPokemonPage } from '../api/pokemonApi';
import {
  bulbasaur,
  charmander,
  squirtle,
  starterList,
} from '../test/fixtures';
import { renderWithProviders } from '../test/renderWithProviders';
import { Pokemon } from '../types/pokemon';

const navigateMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../api/pokemonApi', () => ({
  getPokemonById: vi.fn(),
  getPokemonPage: vi.fn(),
}));

vi.mock('../api/listsApi', () => ({
  createList: vi.fn(),
  downloadList: vi.fn(),
}));

describe('CreateListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock.mockReset();
    vi.mocked(getPokemonPage).mockResolvedValue({
      items: [bulbasaur, charmander, squirtle],
      total: 40,
      limit: 20,
      offset: 0,
    });
    vi.mocked(getPokemonById).mockImplementation(async (id: number) => {
      const pokemonById = {
        [bulbasaur.id]: bulbasaur,
        [charmander.id]: charmander,
        [squirtle.id]: squirtle,
      };

      const pokemon = pokemonById[id as keyof typeof pokemonById];

      if (!pokemon) {
        throw new ApiError('Pokemon not found.', 404, 'NOT_FOUND', `/api/pokemon/${id}`);
      }

      return pokemon;
    });
    vi.mocked(createList).mockResolvedValue(starterList);
  });

  it('renders the Pokemon catalogue', async () => {
    renderWithProviders(undefined, { route: '/lists/new' });

    expect(await screen.findByRole('heading', { name: 'bulbasaur' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'charmander' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'squirtle' })).toBeInTheDocument();
  });

  it('paginates the catalogue', async () => {
    const user = userEvent.setup();
    renderWithProviders(undefined, { route: '/lists/new' });

    await screen.findByRole('heading', { name: 'bulbasaur' });
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(getPokemonPage).toHaveBeenLastCalledWith(20, 20);
  });

  it('selects and unselects Pokemon without duplicates', async () => {
    const user = userEvent.setup();
    renderWithProviders(undefined, { route: '/lists/new' });

    const bulbasaurCard = await findPokemonCard('bulbasaur');
    await user.click(within(bulbasaurCard).getByRole('button', { name: 'Select' }));

    expect(screen.getByRole('button', { name: 'Unselect' })).toBeInTheDocument();
    expect(screen.getByText('Selected Pokemon')).toBeInTheDocument();
    expect(screen.getAllByText('bulbasaur')).toHaveLength(2);

    await user.click(within(bulbasaurCard).getByRole('button', { name: 'Unselect' }));

    expect(screen.getByText('Selected Pokemon will appear here.')).toBeInTheDocument();
    expect(screen.getAllByText('bulbasaur')).toHaveLength(1);
  });

  it('updates validation summary and enables save for a valid selection', async () => {
    const user = userEvent.setup();
    renderWithProviders(undefined, { route: '/lists/new' });

    await selectPokemon(user, 'bulbasaur');
    await selectPokemon(user, 'charmander');
    await selectPokemon(user, 'squirtle');

    expect(screen.getByText('Selection is valid.')).toBeInTheDocument();
    expect(screen.getByText('244 hg')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save list' })).toBeDisabled();

    await user.type(screen.getByLabelText('List name'), 'Starter Team');

    expect(screen.getByRole('button', { name: 'Save list' })).toBeEnabled();
  });

  it('keeps save disabled when selection is invalid', async () => {
    const user = userEvent.setup();
    renderWithProviders(undefined, { route: '/lists/new' });

    await selectPokemon(user, 'bulbasaur');
    await user.type(screen.getByLabelText('List name'), 'Invalid Team');

    expect(
      screen.getByText('Select at least 3 Pokemon of different species.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save list' })).toBeDisabled();
  });

  it('saves a valid list and navigates to details', async () => {
    const user = userEvent.setup();
    renderWithProviders(undefined, { route: '/lists/new' });

    await selectValidTeam(user);
    await user.type(screen.getByLabelText('List name'), 'Starter Team');
    await user.click(screen.getByRole('button', { name: 'Save list' }));

    expect(createList).toHaveBeenCalledWith({
      name: 'Starter Team',
      pokemonIds: [1, 4, 7],
    });
    expect(navigateMock).toHaveBeenCalledWith(`/lists/${starterList.id}`);
  });

  it('displays backend validation errors', async () => {
    const user = userEvent.setup();
    vi.mocked(createList).mockRejectedValue(
      new ApiError(
        'A list must contain at least 3 Pokemon of different species.',
        400,
        'MIN_DISTINCT_SPECIES',
        '/api/lists',
      ),
    );
    renderWithProviders(undefined, { route: '/lists/new' });

    await selectValidTeam(user);
    await user.type(screen.getByLabelText('List name'), 'Starter Team');
    await user.click(screen.getByRole('button', { name: 'Save list' }));

    expect(
      await screen.findByText(
        'A list must contain at least 3 Pokemon of different species.',
      ),
    ).toBeInTheDocument();
  });

  it('uploads a valid file, populates selection, and waits for explicit save', async () => {
    const user = userEvent.setup();
    renderWithProviders(undefined, { route: '/lists/new' });

    await uploadListFile(user, {
      version: 1,
      name: 'Uploaded Team',
      pokemonIds: [1, 4, 7],
    });

    expect(await screen.findByDisplayValue('Uploaded Team')).toBeInTheDocument();
    expect(getPokemonById).toHaveBeenCalledTimes(3);
    expect(screen.getAllByText('bulbasaur')).toHaveLength(2);
    expect(screen.getByText('Selection is valid.')).toBeInTheDocument();
    expect(createList).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Save list' }));

    expect(createList).toHaveBeenCalledWith({
      name: 'Uploaded Team',
      pokemonIds: [1, 4, 7],
    });
  });

  it('shows a translated error for invalid uploaded files', async () => {
    const user = userEvent.setup();
    renderWithProviders(undefined, { route: '/lists/new' });

    await uploadRawFile(user, '{');

    expect(await screen.findByText('Upload file must be valid JSON.')).toBeInTheDocument();
  });

  it('renders Russian validation text', async () => {
    localStorage.setItem('pokemonCollectionsLanguage', 'ru');

    renderWithProviders(undefined, { route: '/lists/new' });

    expect(
      await screen.findByText('Выберите минимум 3 покемона разных видов.'),
    ).toBeInTheDocument();
  });
});

async function uploadListFile(
  user: ReturnType<typeof userEvent.setup>,
  content: unknown,
) {
  await uploadRawFile(user, JSON.stringify(content));
}

async function uploadRawFile(user: ReturnType<typeof userEvent.setup>, content: string) {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]');

  if (!input) {
    throw new Error('Upload input not found');
  }

  await user.upload(
    input,
    new File([content], 'pokemon-list.json', { type: 'application/json' }),
  );
}

async function findPokemonCard(name: string): Promise<HTMLElement> {
  const heading = await screen.findByRole('heading', { name });
  const card = heading.closest('article');

  if (!card) {
    throw new Error(`Pokemon card not found for ${name}`);
  }

  return card;
}

async function selectPokemon(user: ReturnType<typeof userEvent.setup>, name: string) {
  const card = await findPokemonCard(name);
  await user.click(within(card).getByRole('button', { name: 'Select' }));
}

async function selectValidTeam(user: ReturnType<typeof userEvent.setup>) {
  await selectPokemon(user, 'bulbasaur');
  await selectPokemon(user, 'charmander');
  await selectPokemon(user, 'squirtle');
}
