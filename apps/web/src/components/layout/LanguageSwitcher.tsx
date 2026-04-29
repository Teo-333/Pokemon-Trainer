import { useTranslation } from 'react-i18next';
import {
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '../../i18n/i18n';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  function handleLanguageChange(language: SupportedLanguage) {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    void i18n.changeLanguage(language);
  }

  return (
    <div className="flex items-center gap-1" aria-label={t('language.label')}>
      {SUPPORTED_LANGUAGES.map((language) => (
        <button
          aria-pressed={i18n.language === language}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 aria-pressed:bg-slate-900 aria-pressed:text-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:aria-pressed:bg-slate-100 dark:aria-pressed:text-slate-950"
          key={language}
          onClick={() => handleLanguageChange(language)}
          type="button"
        >
          {language.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
