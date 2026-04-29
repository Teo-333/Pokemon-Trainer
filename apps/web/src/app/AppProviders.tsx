import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '../theme/ThemeProvider';
import '../i18n/i18n';
import { createAppRouter } from './router';

const router = createAppRouter();

export function AppProviders() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
