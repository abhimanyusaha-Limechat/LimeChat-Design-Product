import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { WebhooksTable, type WebhookRowData } from './WebhooksTable';

const rows: WebhookRowData[] = [
  { id: 'w1', url: 'https://a.example.com/hook', status: 'failing' },
  { id: 'w2', url: 'https://b.example.com/hook', status: 'active' },
];

describe('WebhooksTable', () => {
  it('lists each endpoint with its status', () => {
    render(<WebhooksTable webhooks={rows} />);
    expect(screen.getByText('https://a.example.com/hook')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Delivering' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /^Failing/ })).toBeInTheDocument();
  });

  it('reports Edit and Delete from the row menu', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<WebhooksTable webhooks={rows} onEdit={onEdit} onDelete={onDelete} />);
    const rowOf = (url: string) => screen.getByText(url).closest('[role="row"]') as HTMLElement;
    fireEvent.click(within(rowOf('https://b.example.com/hook')).getByRole('button', { name: 'More actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledWith(rows[1]);
    fireEvent.click(within(rowOf('https://a.example.com/hook')).getByRole('button', { name: 'More actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith(rows[0]);
  });

  it('shows an empty state', () => {
    render(<WebhooksTable webhooks={[]} />);
    expect(screen.getByText('No webhooks added yet')).toBeInTheDocument();
  });
});
