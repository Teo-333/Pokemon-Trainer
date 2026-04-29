import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { i18n } from '../i18n/i18n';

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  void i18n.changeLanguage('en');
});
