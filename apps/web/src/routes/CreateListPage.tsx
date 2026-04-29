import { useTranslation } from 'react-i18next';

export function CreateListPage() {
  const { t } = useTranslation();

  return (
    <section>
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {t('createList.eyebrow')}
      </p>
      <h1 className="mt-2 text-3xl font-semibold">{t('createList.title')}</h1>
      <p className="mt-4 text-slate-700 dark:text-slate-300">
        {t('createList.placeholder')}
      </p>
    </section>
  );
}
