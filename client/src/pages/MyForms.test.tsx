import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import MyForms from './MyForms';

const request = vi.hoisted(() => vi.fn());
vi.mock('../hooks/useAxiosPrivate', () => ({ default: () => request }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderForms(query = '', total = 0) {
  request.mockResolvedValue({ data: { data: { forms: [], total } } });
  return render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <MemoryRouter initialEntries={['/my-forms' + query]}>
        <MyForms />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('My Forms empty state', () => {
  it('helps a user with no forms open the builder', async () => {
    renderForms();
    expect(
      await screen.findByText("You don't have any forms yet"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Create your first form' }),
    ).toHaveAttribute('href', '/');
    expect(screen.queryByText('No results.')).not.toBeInTheDocument();
  });

  it('keeps No results for an empty search', async () => {
    renderForms('?query=missing');
    expect(await screen.findByText('No results.')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Create your first form' }),
    ).not.toBeInTheDocument();
  });

  it('does not treat an empty page as a new account', async () => {
    renderForms('?page=2', 10);
    expect(await screen.findByText('No results.')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Create your first form' }),
    ).not.toBeInTheDocument();
  });
});
