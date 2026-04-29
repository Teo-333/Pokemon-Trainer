import { useTranslation } from 'react-i18next';

export function SavedListsPage() {
  const { t } = useTranslation();

  return (
    <section>
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {t('savedLists.eyebrow')}
      </p>
      <h1 className="mt-2 text-3xl font-semibold">{t('app.name')}</h1>
      <p className="mt-4 text-slate-700 dark:text-slate-300">
        {t('savedLists.empty')}
      </p>
    </section>
  );
}
