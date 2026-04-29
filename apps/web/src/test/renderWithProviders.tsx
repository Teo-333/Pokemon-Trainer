import { render, type RenderOptions } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from '../app/router';
import { getStoredLanguage, i18n } from '../i18n/i18n';
import { ThemeProvider } from '../theme/ThemeProvider';

type RenderWithProvidersOptions = RenderOptions & {
  route?: string;
};

export function renderWithProviders(
  routeElement?: React.ReactElement,
  options: RenderWithProvidersOptions = {},
) {
  void i18n.changeLanguage(getStoredLanguage());

  const router = createMemoryRouter(
    routeElement
      ? [
          {
            path: options.route ?? '/',
            element: routeElement,
          },
        ]
      : routes,
    {
      initialEntries: [options.route ?? '/'],
    },
  );

  return render(
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>,
    options,
  );
}
