import { useTranslation } from 'react-i18next';
import { SelectionValidationSummary } from '../../utils/validation';

type ValidationSummaryProps = {
  validation: SelectionValidationSummary;
};

export function ValidationSummary({ validation }: ValidationSummaryProps) {
  const { t } = useTranslation();

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold">{t('createList.validationTitle')}</h2>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500 dark:text-slate-400">
            {t('createList.distinctSpecies')}
          </dt>
          <dd className="mt-1 font-medium">{validation.distinctSpeciesCount}</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">
            {t('createList.totalWeight')}
          </dt>
          <dd className="mt-1 font-medium">
            {t('createList.weightValue', { count: validation.totalWeight })}
          </dd>
        </div>
      </dl>
      {validation.issues.length === 0 ? (
        <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">
          {t('createList.validSelection')}
        </p>
      ) : (
        <ul className="mt-3 space-y-1 text-sm text-amber-700 dark:text-amber-300">
          {validation.issues.map((issue) => (
            <li key={issue.code}>{t(`validation.${issue.code}`)}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
