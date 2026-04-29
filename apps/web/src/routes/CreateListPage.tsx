import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../api/http';
import { createList } from '../api/listsApi';
import { getPokemonPage } from '../api/pokemonApi';
import { PageHeader } from '../components/layout/PageHeader';
import { PokemonCard } from '../components/pokemon/PokemonCard';
import { SelectedPokemonPanel } from '../components/pokemon/SelectedPokemonPanel';
import { ValidationSummary } from '../components/pokemon/ValidationSummary';
import { Pokemon, PokemonPage } from '../types/pokemon';
import { validateSelectedPokemon } from '../utils/validation';

const PAGE_SIZE = 20;

export function CreateListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [listName, setListName] = useState('');
  const [page, setPage] = useState<PokemonPage | null>(null);
  const [offset, setOffset] = useState(0);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon[]>([]);
  const [catalogueStatus, setCatalogueStatus] = useState<
    'loading' | 'success' | 'error'
  >('loading');
  const [catalogueError, setCatalogueError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving'>('idle');
  const [saveError, setSaveError] = useState('');

  const validation = useMemo(
    () => validateSelectedPokemon(selectedPokemon),
    [selectedPokemon],
  );
  const canSave =
    validation.isValid && listName.trim().length > 0 && saveStatus !== 'saving';

  useEffect(() => {
    let isMounted = true;

    async function loadPokemon() {
      setCatalogueStatus('loading');
      setCatalogueError('');

      try {
        const nextPage = await getPokemonPage(PAGE_SIZE, offset);

        if (isMounted) {
          setPage(nextPage);
          setCatalogueStatus('success');
        }
      } catch (error) {
        if (isMounted) {
          setCatalogueError(error instanceof ApiError ? error.message : t('common.error'));
          setCatalogueStatus('error');
        }
      }
    }

    void loadPokemon();

    return () => {
      isMounted = false;
    };
  }, [offset, t]);

  function togglePokemon(pokemon: Pokemon) {
    setSelectedPokemon((currentPokemon) => {
      if (currentPokemon.some((selected) => selected.id === pokemon.id)) {
        return currentPokemon.filter((selected) => selected.id !== pokemon.id);
      }

      return [...currentPokemon, pokemon];
    });
    setSaveError('');
  }

  function removePokemon(pokemonId: number) {
    setSelectedPokemon((currentPokemon) =>
      currentPokemon.filter((pokemon) => pokemon.id !== pokemonId),
    );
    setSaveError('');
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSave) {
      return;
    }

    setSaveStatus('saving');
    setSaveError('');

    try {
      const savedList = await createList({
        name: listName.trim(),
        pokemonIds: selectedPokemon.map((pokemon) => pokemon.id),
      });

      navigate(`/lists/${savedList.id}`);
    } catch (error) {
      setSaveError(error instanceof ApiError ? error.message : t('common.error'));
      setSaveStatus('idle');
    }
  }

  return (
    <section>
      <PageHeader eyebrow={t('createList.eyebrow')} title={t('createList.title')} />

      <form className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]" onSubmit={handleSave}>
        <div>
          <label className="block text-sm font-medium" htmlFor="list-name">
            {t('createList.nameLabel')}
          </label>
          <input
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            id="list-name"
            onChange={(event) => setListName(event.target.value)}
            placeholder={t('createList.namePlaceholder')}
            value={listName}
          />

          <div className="mt-6 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">{t('createList.catalogueTitle')}</h2>
            <div className="flex items-center gap-2">
              <button
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
                disabled={offset === 0 || catalogueStatus === 'loading'}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                type="button"
              >
                {t('createList.previous')}
              </button>
              <button
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
                disabled={
                  catalogueStatus === 'loading' ||
                  !page ||
                  offset + PAGE_SIZE >= page.total
                }
                onClick={() => setOffset(offset + PAGE_SIZE)}
                type="button"
              >
                {t('createList.next')}
              </button>
            </div>
          </div>

          {catalogueStatus === 'loading' ? (
            <p className="mt-4 text-slate-700 dark:text-slate-300">
              {t('createList.loadingCatalogue')}
            </p>
          ) : null}

          {catalogueStatus === 'error' ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              <p className="font-medium">{t('createList.catalogueErrorTitle')}</p>
              <p className="mt-1 text-sm">{catalogueError}</p>
            </div>
          ) : null}

          {catalogueStatus === 'success' && page ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {page.items.map((pokemon) => (
                <PokemonCard
                  isSelected={selectedPokemon.some(
                    (selected) => selected.id === pokemon.id,
                  )}
                  key={pokemon.id}
                  onToggle={togglePokemon}
                  pokemon={pokemon}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <SelectedPokemonPanel
            onRemove={removePokemon}
            selectedPokemon={selectedPokemon}
          />
          <ValidationSummary validation={validation} />
          {saveError ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              {saveError}
            </div>
          ) : null}
          <button
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-950"
            disabled={!canSave}
            type="submit"
          >
            {saveStatus === 'saving' ? t('createList.saving') : t('createList.save')}
          </button>
        </div>
      </form>
    </section>
  );
}
