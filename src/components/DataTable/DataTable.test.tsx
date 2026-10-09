import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, DataTableHead, DataTableRow, DataTableSkeleton, DataTableSortHeader, useTableSort } from './DataTable';

const names = ['Bea', 'Al', 'Cy'];

function Demo({ onOpen }: { onOpen?: (n: string) => void }) {
  const { sorted, sort, toggle } = useTableSort<string, 'name'>(names, (n) => n);
  return (
    <DataTable variant="cards" aria-label="Demo">
      <DataTableHead>
        <DataTableSortHeader label="Name" sortKey="name" sort={sort} onSort={toggle} />
      </DataTableHead>
      {sorted.map((n) => (
        <DataTableRow key={n} onRowClick={() => onOpen?.(n)}>
          <div role="cell">{n}</div>
          <div role="cell" className="lc-dt__actions">
            <button type="button">menu {n}</button>
          </div>
        </DataTableRow>
      ))}
    </DataTable>
  );
}

describe('DataTable cards variant', () => {
  it('sets the variant hook and sorts from the header', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    expect(screen.getByRole('table', { name: 'Demo' })).toHaveAttribute('data-variant', 'cards');
    await user.click(screen.getByRole('button', { name: 'Name' }));
    expect(screen.getAllByRole('cell').filter((c) => names.includes(c.textContent ?? '')).map((c) => c.textContent)).toEqual(['Al', 'Bea', 'Cy']);
    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'ascending');
  });

  it('opens a row on click and Enter, but not from a button inside it', async () => {
    const onOpen = vi.fn();
    const user = userEvent.setup();
    render(<Demo onOpen={onOpen} />);
    await user.click(screen.getByText('Al'));
    expect(onOpen).toHaveBeenLastCalledWith('Al');
    await user.click(screen.getByRole('button', { name: 'menu Bea' }));
    expect(onOpen).toHaveBeenCalledTimes(1);
    screen.getAllByRole('row')[2].focus();
    await user.keyboard('{Enter}');
    expect(onOpen).toHaveBeenCalledTimes(2);
  });

  it('renders skeleton rows hidden from assistive tech, with a loading label', () => {
    render(
      <DataTable variant="cards" aria-label="Loading">
        <DataTableSkeleton>
          <div />
        </DataTableSkeleton>
      </DataTable>,
    );
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(document.querySelectorAll('.lc-dt__row--skeleton[aria-hidden="true"]')).toHaveLength(6);
  });
});
