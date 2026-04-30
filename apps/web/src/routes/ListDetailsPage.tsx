import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../api/http';
import { getList } from '../api/listsApi';
import { DownloadListButton } from '../components/lists/DownloadListButton';
import { PageHeader } from '../components/layout/PageHeader';
import { PokemonList } from '../types/list';

export function ListDetailsPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [list, setList] = useState<PokemonList | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'not-found'>(
    'loading',
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadList() {
      if (!id) {
        setStatus('not-found');
        return;
      }

      setStatus('loading');
      setErrorMessage('');

      try {
        const nextList = await getList(id);

        if (isMounted) {
          setList(nextList);
          setStatus('success');
        }
      } catch (error) {
        if (isMounted) {
          if (error instanceof ApiError && error.statusCode === 404) {
            setStatus('not-found');
            return;
          }

          setErrorMessage(error instanceof ApiError ? error.message : t('common.error'));
          setStatus('error');
        }
      }
    }

    void loadList();

    return () => {
      isMounted = false;
    };
  }, [id, t]);

  return (
    <section>
      <PageHeader
        actions={
          <>
            {list ? <DownloadListButton listId={list.id} listName={list.name} /> : null}
            <Link
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              to="/"
            >
              {t('listDetails.backToLists')}
            </Link>
          </>
        }
        eyebrow={t('listDetails.eyebrow')}
        title={list?.name ?? t('listDetails.title')}
      />

      {status === 'loading' ? (
        <p className="mt-8 text-slate-700 dark:text-slate-300">
          {t('listDetails.loading')}
        </p>
      ) : null}

      {status === 'error' ? (
        <div className="mt-8 rounded-md border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <p className="font-medium">{t('listDetails.errorTitle')}</p>
          <p className="mt-1 text-sm">{errorMessage}</p>
        </div>
      ) : null}

      {status === 'not-found' ? (
        <div className="mt-8 rounded-md border border-dashed border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <p className="font-medium">{t('listDetails.notFoundTitle')}</p>
          <p className="mt-2 text-slate-700 dark:text-slate-300">
            {t('listDetails.notFound')}
          </p>
        </div>
      ) : null}

      {status === 'success' && list ? (
        <div className="mt-8 space-y-6">
          <dl className="grid gap-4 rounded-md border border-slate-200 bg-white p-5 text-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3">
            <div>
              <dt className="text-slate-500 dark:text-slate-400">
                {t('listDetails.pokemonCount')}
              </dt>
              <dd className="mt-1 font-medium">{list.pokemon.length}</dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">
                {t('listDetails.totalWeight')}
              </dt>
              <dd className="mt-1 font-medium">
                {t('listDetails.weightValue', { count: list.totalWeight })}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">
                {t('listDetails.distinctSpecies')}
              </dt>
              <dd className="mt-1 font-medium">{list.distinctSpeciesCount}</dd>
            </div>
          </dl>

          <div>
            <h2 className="text-xl font-semibold">{t('listDetails.pokemonTitle')}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {list.pokemon.map((pokemon) => (
                <article
                  className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                  key={pokemon.pokeApiId}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
                      {pokemon.spriteUrl ? (
                        <img alt="" className="h-14 w-14" src={pokemon.spriteUrl} />
                      ) : (
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          #{pokemon.pokeApiId}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold capitalize">{pokemon.name}</h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {t('listDetails.species', { species: pokemon.speciesName })}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {t('listDetails.weightValue', { count: pokemon.weight })}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {pokemon.types.join(', ')}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
