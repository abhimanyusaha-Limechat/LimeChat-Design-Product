import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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

  it('shows Update only once a field changes', () => {
    const { rerender } = render(<IntegrationSettings {...base} />);
    expect(screen.queryByRole('button', { name: 'Update' })).not.toBeInTheDocument();

    rerender(<IntegrationSettings {...base} values={{ domain: 'new.freshdesk.com' }} />);
    expect(screen.getByRole('button', { name: 'Update' })).toBeEnabled();

    rerender(<IntegrationSettings {...base} values={{ domain: '' }} />);
    expect(screen.getByRole('button', { name: 'Update' })).toBeDisabled();
  });

  it('shows an Active switch only when onActiveChange is given', () => {
    const onActiveChange = vi.fn();
    const { rerender } = render(<IntegrationSettings {...base} />);
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();

    rerender(<IntegrationSettings {...base} onActiveChange={onActiveChange} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Active' }));
    expect(onActiveChange).toHaveBeenCalledWith(true);

  });

  it('disables the fields while the Active switch is off', () => {
    const { rerender } = render(<IntegrationSettings {...base} active={false} onActiveChange={() => {}} />);
    expect(screen.getByLabelText(/Domain/)).toBeDisabled();

    rerender(<IntegrationSettings {...base} active onActiveChange={() => {}} />);
    expect(screen.getByLabelText(/Domain/)).toBeEnabled();

    rerender(<IntegrationSettings {...base} status="not-connected" active={false} onActiveChange={() => {}} />);
    expect(screen.getByLabelText(/Domain/)).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'Active' })).toBeEnabled();
  });

  it('reads Not connected while the Active switch is off', () => {
    const { rerender } = render(<IntegrationSettings {...base} active onActiveChange={() => {}} />);
    expect(screen.getByRole('status')).toHaveTextContent('Connected to Freshdesk');

    rerender(<IntegrationSettings {...base} active={false} onActiveChange={() => {}} />);
    expect(screen.getByRole('status')).toHaveTextContent('Not connected to Freshdesk');
  });

  it('reads Update, not Connect, when the Active switch is present', () => {
    render(
      <IntegrationSettings {...base} status="not-connected" savedValues={{}} values={{ domain: 'x' }} onActiveChange={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Update' })).toBeEnabled();
  });

  it('renders children as extra rows and shows Update when they have changed', () => {
    const { rerender } = render(
      <IntegrationSettings {...base} fields={[]}>
        <div>Extra row</div>
      </IntegrationSettings>,
    );
    expect(screen.getByText('Extra row')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Update' })).not.toBeInTheDocument();

    rerender(<IntegrationSettings {...base} fields={[]} changed />);
    expect(screen.getByRole('button', { name: 'Update' })).toBeEnabled();
  });

  it('offers Connect before the first connection', () => {
    render(<IntegrationSettings {...base} status="not-connected" savedValues={{}} values={{ domain: 'x' }} />);
    expect(screen.getByRole('button', { name: 'Connect' })).toBeEnabled();
  });
});
