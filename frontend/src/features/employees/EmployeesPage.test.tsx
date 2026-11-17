import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import type { Employee, EmployeePage } from '@/api/types';
import { server } from '@/test/server';
import { renderPage } from '@/test/render';
import EmployeesPage from './EmployeesPage';

function employee(overrides: Partial<Employee>): Employee {
  return {
    id: crypto.randomUUID(),
    firstName: 'Ada',
    lastName: 'Lovelace',
    seniority: 'SENIOR',
    community: 'OWL',
    staff: [],
    roles: [],
    technologies: [],
    skills: [],
    version: 0,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function page(content: Employee[]): EmployeePage {
  return { content, page: { number: 0, size: 20, totalElements: content.length, totalPages: 1 } };
}

describe('EmployeesPage', () => {
  it('lists employees with their manager, seniority and technologies', async () => {
    server.use(
      http.get('*/api/employees', () =>
        HttpResponse.json(
          page([
            employee({
              firstName: 'Ada',
              lastName: 'Lovelace',
              manager: { id: 'm1', firstName: 'Grace', lastName: 'Hopper' },
              technologies: [{ id: 't1', label: 'Java', version: 0, createdAt: '', updatedAt: '' }],
            }),
            employee({ firstName: 'Linus', lastName: 'Torvalds', seniority: 'JUNIOR' }),
          ]),
        ),
      ),
    );

    renderPage(<EmployeesPage />);

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    const table = within(screen.getByRole('table'));
    expect(table.getByText('Reports to Grace Hopper')).toBeInTheDocument();
    expect(table.getByText('Linus Torvalds')).toBeInTheDocument();
    expect(table.getByText('Junior')).toBeInTheDocument();
    expect(table.getByText('Java')).toBeInTheDocument();
    expect(screen.getByText('2 employees match your search.')).toBeInTheDocument();
  });

  it('sends the search and filters from the URL to the API', async () => {
    const requests: URL[] = [];
    server.use(
      http.get('*/api/employees', ({ request }) => {
        requests.push(new URL(request.url));
        return HttpResponse.json(page([]));
      }),
    );

    const { location } = renderPage(<EmployeesPage />, { url: '/?community=OWL' });

    await screen.findByText('Nobody matches these filters');
    expect(requests.at(-1)?.searchParams.get('community')).toBe('OWL');

    await userEvent.type(screen.getByRole('textbox', { name: 'Search' }), 'ada');
    await waitFor(() => expect(requests.at(-1)?.searchParams.get('search')).toBe('ada'));
    expect(requests.at(-1)?.searchParams.get('community')).toBe('OWL');
    // The search is kept in the URL, so the view can be bookmarked and shared.
    expect(location.current?.search).toBe('?community=OWL&search=ada');
  });
});
