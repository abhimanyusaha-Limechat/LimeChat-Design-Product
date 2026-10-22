import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IntegrationSettings, type IntegrationSettingsProps } from './IntegrationSettings';

const saved = { domain: 'acme.freshdesk.com' };
const base: IntegrationSettingsProps = {
  partnerName: 'Freshdesk',
  status: 'connected',
  fields: [{ id: 'domain', label: 'Domain' }],
  values: saved,
  savedValues: saved,
  onChange: () => {},
};

describe('IntegrationSettings status header', () => {
  it.each([
    ['not-connected', 'Not connected to Freshdesk'],
    ['connected', 'Connected to Freshdesk'],
    ['error', 'Couldn’t connect to Freshdesk'],
  ] as const)('%s reads "%s"', (status, label) => {
    render(<IntegrationSettings {...base} status={status} />);
    expect(screen.getByRole('status')).toHaveTextContent(label);
  });

  it('shows Connecting while submitting', () => {
    render(<IntegrationSettings {...base} submitting />);
    expect(screen.getByRole('status')).toHaveTextContent('Connecting to Freshdesk');
  });

  it('shows Refresh always, and Update only once a field changes', () => {
    const { rerender } = render(<IntegrationSettings {...base} />);
    expect(screen.getByRole('button', { name: 'Refresh connection' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Update' })).not.toBeInTheDocument();

    rerender(<IntegrationSettings {...base} values={{ domain: 'new.freshdesk.com' }} />);
    expect(screen.getByRole('button', { name: 'Update' })).toBeEnabled();

    rerender(<IntegrationSettings {...base} values={{ domain: '' }} />);
    expect(screen.getByRole('button', { name: 'Update' })).toBeDisabled();
  });

  it('offers Connect, not Refresh, before the first connection', () => {
    render(<IntegrationSettings {...base} status="not-connected" savedValues={{}} values={{ domain: 'x' }} />);
    expect(screen.getByRole('button', { name: 'Connect' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Refresh connection' })).not.toBeInTheDocument();
  });
});
