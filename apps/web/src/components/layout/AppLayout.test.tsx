import { screen } from '@testing-library/react';
import { AppLayout } from './AppLayout';
import { renderWithProviders } from '../../test/renderWithProviders';

describe('AppLayout', () => {
  it('renders navigation and children', () => {
    renderWithProviders(
      <AppLayout>
        <p>Page content</p>
      </AppLayout>,
    );

    expect(screen.getByRole('link', { name: 'Pokemon Collections' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByRole('link', { name: 'Create New List' })).toHaveAttribute(
      'href',
      '/lists/new',
    );
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });
});
