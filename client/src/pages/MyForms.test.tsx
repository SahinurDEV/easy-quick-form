import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import MyForms from './MyForms';
import type { FormType } from '../types';

const request = vi.hoisted(() => vi.fn());
vi.mock('../hooks/useAxiosPrivate', () => ({ default: () => request }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderForms(query = '', forms: FormType[] = []) {
  request.mockResolvedValue({ data: { data: { forms, total: forms.length } } });
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

  it('shows existing forms in the table', async () => {
    renderForms('', [
      {
        _id: 'form-1',
        name: 'Feedback',
        isActive: true,
        responseCount: 0,
        elements: [],
        user: 'user-1',
        createdAt: '2026-11-01',
        updatedAt: '2026-11-01',
      },
    ]);
    expect(await screen.findByText('Feedback')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Create your first form' }),
    ).not.toBeInTheDocument();
  });

  it('keeps the friendly state while cached empty forms refetch', () => {
    request.mockReturnValue(new Promise(() => {}));
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    client.setQueryData(
      ['forms', { page: 0, pageSize: 10, sort: '-createdAt', search: null }],
      { forms: [], total: 0 },
    );
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/my-forms']}>
          <MyForms />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(
      screen.getByRole('link', { name: 'Create your first form' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('No results.')).not.toBeInTheDocument();
  });
});
