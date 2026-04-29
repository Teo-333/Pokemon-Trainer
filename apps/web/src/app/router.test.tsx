import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/renderWithProviders';

describe('router', () => {
  it('renders the main page', () => {
    renderWithProviders();

    expect(
      screen.getByRole('heading', { name: 'Pokemon Collections' }),
    ).toBeInTheDocument();
  });

  it('renders the create list page', () => {
    renderWithProviders(undefined, { route: '/lists/new' });

    expect(
      screen.getByRole('heading', { name: 'Create Pokemon list' }),
    ).toBeInTheDocument();
  });

  it('renders the list details page', () => {
    renderWithProviders(undefined, { route: '/lists/abc123' });

    expect(
      screen.getByRole('heading', { name: 'Pokemon list abc123' }),
    ).toBeInTheDocument();
  });
});
