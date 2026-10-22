import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntegrationsHomePage, type IntegrationCategory } from './IntegrationsHomePage';

const categories: IntegrationCategory[] = [
  { id: 'crm', title: 'CRM Partners', partners: [{ id: 'hubspot', name: 'HubSpot', icon: null }] },
  { id: 'logistics', title: 'Logistics Partners', partners: [{ id: 'shiprocket', name: 'Shiprocket', icon: null }] },
];

describe('IntegrationsHomePage', () => {
  it('filters by category chip and name search, with an empty state', async () => {
    const user = userEvent.setup();
    render(<IntegrationsHomePage categories={categories} />);

    await user.click(screen.getByRole('button', { name: 'Logistics' }));
    expect(screen.getByRole('button', { name: 'Logistics' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText('HubSpot')).not.toBeInTheDocument();
    expect(screen.getByText('Shiprocket')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'All' }));
    await user.type(screen.getByRole('searchbox', { name: 'Search integrations' }), 'hub');
    expect(screen.getByText('HubSpot')).toBeInTheDocument();
    expect(screen.queryByText('Shiprocket')).not.toBeInTheDocument();

    await user.type(screen.getByRole('searchbox'), 'zzz');
    expect(screen.getByText(/No integrations match/)).toBeInTheDocument();
  });

  it('hides the toolbar in compact mode', () => {
    render(<IntegrationsHomePage categories={categories} compact />);
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });
});
