import { createBrowserRouter, Outlet, type RouteObject } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { CreateListPage } from '../routes/CreateListPage';
import { ListDetailsPage } from '../routes/ListDetailsPage';
import { SavedListsPage } from '../routes/SavedListsPage';

export const routes: RouteObject[] = [
  {
    element: (
      <AppLayout>
        <Outlet />
      </AppLayout>
    ),
    children: [
      {
        path: '/',
        element: <SavedListsPage />,
      },
      {
        path: '/lists/new',
        element: <CreateListPage />,
      },
      {
        path: '/lists/:id',
        element: <ListDetailsPage />,
      },
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(routes);
}
