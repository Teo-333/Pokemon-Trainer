import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ApiError } from '../api/http';
import { getList, getLists } from '../api/listsApi';
import { PageHeader } from '../components/layout/PageHeader';
import { PokemonListSummary } from '../types/list';

type SavedListViewModel = PokemonListSummary & {
  pokemonCount: number;
};

export function SavedListsPage() {
  const { t } = useTranslation();
  const [lists, setLists] = useState<SavedListViewModel[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadLists() {
      setStatus('loading');

      try {
        const summaries = await getLists();
        const listsWithCounts = await Promise.all(
          summaries.map(async (summary) => {
            const details = await getList(summary.id);

            return {
              ...summary,
              pokemonCount: details.pokemon.length,
            };
          }),
        );

        if (isMounted) {
          setLists(listsWithCounts);
          setStatus('success');
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof ApiError ? error.message : t('common.error'));
          setStatus('error');
        }
      }
    }

    void loadLists();

    return () => {
      isMounted = false;
    };
  }, [t]);

  return (
    <section>
      <PageHeader
        actions={
          <Link
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-950"
            to="/lists/new"
          >
            {t('navigation.createNewList')}
          </Link>
        }
        eyebrow={t('savedLists.eyebrow')}
        title={t('app.name')}
      />

      {status === 'loading' ? (
        <p className="mt-8 text-slate-700 dark:text-slate-300">
          {t('savedLists.loading')}
        </p>
      ) : null}

      {status === 'error' ? (
        <div className="mt-8 rounded-md border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <p className="font-medium">{t('savedLists.errorTitle')}</p>
          <p className="mt-1 text-sm">{errorMessage}</p>
        </div>
      ) : null}

      {status === 'success' && lists.length === 0 ? (
        <div className="mt-8 rounded-md border border-dashed border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <p className="font-medium">{t('savedLists.emptyTitle')}</p>
          <p className="mt-2 text-slate-700 dark:text-slate-300">
            {t('savedLists.empty')}
          </p>
        </div>
      ) : null}

      {status === 'success' && lists.length > 0 ? (
        <div className="mt-8 grid gap-4">
          {lists.map((list) => (
            <Link
              className="rounded-md border border-slate-200 bg-white p-5 hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-600"
              key={list.id}
              to={`/lists/${list.id}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">{list.name}</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {t('savedLists.createdAt', {
                      date: new Intl.DateTimeFormat(undefined, {
                        dateStyle: 'medium',
                      }).format(new Date(list.createdAt)),
                    })}
                  </p>
                </div>
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t('savedLists.pokemonCount')}
                  </dt>
                  <dd className="mt-1 font-medium">{list.pokemonCount}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t('savedLists.totalWeight')}
                  </dt>
                  <dd className="mt-1 font-medium">
                    {t('savedLists.weightValue', { count: list.totalWeight })}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t('savedLists.distinctSpecies')}
                  </dt>
                  <dd className="mt-1 font-medium">{list.distinctSpeciesCount}</dd>
                </div>
              </dl>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
