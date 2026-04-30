import { ListFileError, parseListFileContent } from './listFile';

describe('listFile', () => {
  it('parses a valid uploaded file', () => {
    expect(
      parseListFileContent(
        JSON.stringify({
          version: 1,
          name: 'Starter Team',
          pokemonIds: [1, 4, 7],
        }),
      ),
    ).toEqual({
      version: 1,
      name: 'Starter Team',
      pokemonIds: [1, 4, 7],
    });
  });

  it('rejects malformed JSON', () => {
    expectListFileError(() => parseListFileContent('{'), 'INVALID_JSON');
  });

  it('rejects missing version', () => {
    expectListFileError(
      () =>
        parseListFileContent(JSON.stringify({ name: 'Starter Team', pokemonIds: [1] })),
      'MISSING_VERSION',
    );
  });

  it('rejects unsupported version', () => {
    expectListFileError(
      () =>
        parseListFileContent(
          JSON.stringify({ version: 2, name: 'Starter Team', pokemonIds: [1] }),
        ),
      'UNSUPPORTED_VERSION',
    );
  });

  it('rejects missing pokemonIds', () => {
    expectListFileError(
      () => parseListFileContent(JSON.stringify({ version: 1, name: 'Starter Team' })),
      'MISSING_POKEMON_IDS',
    );
  });

  it('rejects invalid pokemonIds', () => {
    expectListFileError(
      () =>
        parseListFileContent(
          JSON.stringify({ version: 1, name: 'Starter Team', pokemonIds: [1, '4'] }),
        ),
      'INVALID_POKEMON_IDS',
    );
  });
});

function expectListFileError(received: () => unknown, code: string) {
  try {
    received();
  } catch (error) {
    expect(error).toBeInstanceOf(ListFileError);
    expect((error as ListFileError).code).toBe(code);
    return;
  }

  throw new Error(`Expected ListFileError ${code}`);
}
