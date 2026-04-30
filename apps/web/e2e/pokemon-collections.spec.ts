import { expect, Page, test } from '@playwright/test';

const pokemon = [
  {
    id: 1,
    name: 'bulbasaur',
    speciesName: 'bulbasaur',
    weight: 69,
    spriteUrl: null,
    types: ['grass', 'poison'],
  },
  {
    id: 4,
    name: 'charmander',
    speciesName: 'charmander',
    weight: 85,
    spriteUrl: null,
    types: ['fire'],
  },
  {
    id: 7,
    name: 'squirtle',
    speciesName: 'squirtle',
    weight: 90,
    spriteUrl: null,
    types: ['water'],
  },
];

const savedList = {
  id: '507f1f77bcf86cd799439011',
  name: 'Starter Team',
  totalWeight: 244,
  distinctSpeciesCount: 3,
  createdAt: '2026-04-29T10:00:00.000Z',
  updatedAt: '2026-04-29T10:00:00.000Z',
  pokemon: pokemon.map(({ id, ...snapshot }) => ({
    pokeApiId: id,
    ...snapshot,
  })),
};

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test('app loads and shows the saved lists page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Pokemon Collections' })).toBeVisible();
  await expect(page.getByText('No saved lists yet')).toBeVisible();
  await expect(
    page.getByRole('main').getByRole('link', { name: 'Create New List' }),
  ).toHaveAttribute('href', '/lists/new');
});

test('user creates a valid Pokemon list', async ({ page }) => {
  await page.goto('/lists/new');

  await expect(page.getByRole('heading', { name: 'bulbasaur' })).toBeVisible();
  await page.getByLabel('List name').fill('Starter Team');
  await selectPokemon(page, 'bulbasaur');
  await selectPokemon(page, 'charmander');
  await selectPokemon(page, 'squirtle');

  await expect(page.getByText('Selection is valid.')).toBeVisible();
  await page.getByRole('button', { name: 'Save list' }).click();

  await expect(page).toHaveURL(/\/lists\/507f1f77bcf86cd799439011$/);
  await expect(page.getByRole('heading', { name: 'Starter Team' })).toBeVisible();
  await expect(page.getByText('244 hg').first()).toBeVisible();
});

test('user downloads a list and uploads it for review', async ({ page }) => {
  await page.goto(`/lists/${savedList.id}`);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download JSON' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('starter-team.json');

  await page.goto('/lists/new');
  await page
    .locator('input[type="file"]')
    .setInputFiles({
      name: 'starter-team.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        JSON.stringify({
          version: 1,
          name: 'Starter Team',
          pokemonIds: [1, 4, 7],
        }),
      ),
    });

  await expect(page.getByLabel('List name')).toHaveValue('Starter Team');
  await expect(page.getByText('Selection is valid.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save list' })).toBeEnabled();
});

async function mockApi(page: Page) {
  await page.route('**/api/lists', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ json: savedList });
      return;
    }

    await route.fulfill({ json: [] });
  });

  await page.route(`**/api/lists/${savedList.id}`, async (route) => {
    await route.fulfill({ json: savedList });
  });

  await page.route(`**/api/lists/${savedList.id}/download`, async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        version: 1,
        name: 'Starter Team',
        pokemonIds: [1, 4, 7],
      }),
      contentType: 'application/json',
      headers: {
        'content-disposition': 'attachment; filename="starter-team.json"',
      },
    });
  });

  await page.route('**/api/pokemon?*', async (route) => {
    await route.fulfill({
      json: {
        items: pokemon,
        total: pokemon.length,
        limit: 20,
        offset: 0,
      },
    });
  });

  for (const currentPokemon of pokemon) {
    await page.route(`**/api/pokemon/${currentPokemon.id}`, async (route) => {
      await route.fulfill({ json: currentPokemon });
    });
  }
}

async function selectPokemon(page: Page, name: string) {
  const card = page.getByRole('heading', { name }).locator('xpath=ancestor::article');
  await card.getByRole('button', { name: 'Select' }).click();
}
