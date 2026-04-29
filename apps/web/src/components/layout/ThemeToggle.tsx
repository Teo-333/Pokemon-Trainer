import { useTheme } from '../../theme/useTheme';
import { useTranslation } from 'react-i18next';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  return (
    <button
      aria-label={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      onClick={toggleTheme}
      type="button"
    >
      {isDark ? t('theme.light') : t('theme.dark')}
    </button>
  );
}
