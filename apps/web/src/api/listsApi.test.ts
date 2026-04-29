import {
  createList,
  downloadList,
  getList,
  getLists,
} from './listsApi';
import { starterList, starterListSummary } from '../test/fixtures';

describe('listsApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('gets saved list summaries', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse([starterListSummary]));

    await expect(getLists()).resolves.toEqual([starterListSummary]);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/lists',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('gets one saved list', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(starterList));

    await expect(getList(starterList.id)).resolves.toEqual(starterList);
    expect(fetch).toHaveBeenCalledWith(
      `http://localhost:3000/api/lists/${starterList.id}`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('creates a saved list', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(starterList, 201));

    await expect(
      createList({
        name: 'Starter Team',
        pokemonIds: [1, 4, 7],
      }),
    ).resolves.toEqual(starterList);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/lists',
      expect.objectContaining({
        body: JSON.stringify({
          name: 'Starter Team',
          pokemonIds: [1, 4, 7],
        }),
        method: 'POST',
      }),
    );
  });

  it('downloads a saved list file', async () => {
    const blob = new Blob([JSON.stringify({ version: 1 })], {
      type: 'application/json',
    });
    vi.mocked(fetch).mockResolvedValue(new Response(blob, { status: 200 }));

    await expect(downloadList(starterList.id)).resolves.toBeInstanceOf(Blob);
    expect(fetch).toHaveBeenCalledWith(
      `http://localhost:3000/api/lists/${starterList.id}/download`,
      expect.objectContaining({ method: 'GET' }),
    );
  });
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
