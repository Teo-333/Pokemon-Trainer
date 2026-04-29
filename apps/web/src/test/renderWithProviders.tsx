import { render, type RenderOptions } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from '../app/router';

type RenderWithProvidersOptions = RenderOptions & {
  route?: string;
};

export function renderWithProviders(
  routeElement?: React.ReactElement,
  options: RenderWithProvidersOptions = {},
) {
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

  return render(<RouterProvider router={router} />, options);
}
