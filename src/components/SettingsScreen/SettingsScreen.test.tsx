import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { SidebarProduct } from '../Sidebar/presets';
import { SettingsScreen } from './SettingsScreen';
import { SETTINGS_COPY, SETTINGS_TABS_BY_PRODUCT } from './settingsTabs';
import { DEMO_INBOXES, INTEGRATION_CATEGORIES, INTEGRATION_FORMS } from '../../data/settingsDemo';

// Stands in for App: the URL-owned tab and Product come from outside the Screen.
function Harness({
  product,
  initialTab,
  onManageIndustriesChange = () => {},
}: {
  product: SidebarProduct;
  initialTab: string;
  onManageIndustriesChange?: (next: boolean) => void;
}) {
  const [tab, setTab] = useState(initialTab);
  const [integration, setIntegration] = useState('');
  const [inbox, setInbox] = useState('');
  const [changePlan, setChangePlan] = useState(false);
  return (
    <SettingsScreen
      product={product}
      settingsTab={tab}
      manageIndustries={false}
      integration={integration}
      inbox={inbox}
      changePlan={changePlan}
      onTabChange={(id) => {
        setTab(id);
        setIntegration('');
        setInbox('');
        setChangePlan(false);
      }}
      onManageIndustriesChange={onManageIndustriesChange}
      onIntegrationChange={setIntegration}
      onInboxChange={setInbox}
      onChangePlanChange={setChangePlan}
    />
  );
}

// The Settings tab list on the left; the segmented list tabs inside a table are role=tab.
const sideTab = (name: string) => within(screen.getByRole('navigation', { name: 'Settings' })).getByRole('button', { name });

const products = Object.keys(SETTINGS_TABS_BY_PRODUCT) as SidebarProduct[];

describe('SettingsScreen tabs', () => {
  it.each(products.flatMap((p) => SETTINGS_TABS_BY_PRODUCT[p].map((t) => [p, t.id] as const)))(
    '%s / %s opens with its own title',
    (product, tabId) => {
      render(<Harness product={product} initialTab={tabId} />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(SETTINGS_COPY[tabId].title);
    },
  );

  it('switches content when another tab is chosen', async () => {
    const user = userEvent.setup();
    render(<Harness product="helpdesk" initialTab="teams" />);
    expect(screen.getByText('Customer Support')).toBeInTheDocument();

    await user.click(sideTab('Automation rules'));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Automation rules');
    expect(screen.getByText('Auto-assign by inbox')).toBeInTheDocument();
    expect(screen.queryByText('Customer Support')).not.toBeInTheDocument();
  });
});

describe('SettingsScreen filtering', () => {
  it('filters rows by search and clears the search when the tab changes', async () => {
    const user = userEvent.setup();
    render(<Harness product="helpdesk" initialTab="agents" />);

    await user.type(screen.getByRole('textbox', { name: 'Search for agents' }), 'Aarav');
    expect(screen.getByText('Aarav Mehta')).toBeInTheDocument();
    expect(screen.queryByText('Isha Kapoor')).not.toBeInTheDocument();

    await user.click(sideTab('Teams'));
    expect(screen.getByRole('textbox', { name: 'Search for teams' })).toHaveValue('');
    expect(screen.getByText('Customer Support')).toBeInTheDocument();
  });

  it('shows the library rows when the Library list tab is chosen', async () => {
    const user = userEvent.setup();
    render(<Harness product="helpdesk" initialTab="automation-rules" />);
    expect(screen.getByText('Auto-assign by inbox')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Library' }));
    expect(screen.getByText('Round-robin assignment')).toBeInTheDocument();
    expect(screen.queryByText('Auto-assign by inbox')).not.toBeInTheDocument();
  });

  it('keeps a list tab choice per Settings tab when moving between tabs', async () => {
    const user = userEvent.setup();
    render(<Harness product="helpdesk" initialTab="automation-rules" />);
    await user.click(screen.getByRole('tab', { name: 'Library' }));

    await user.click(sideTab('SLA rules'));
    expect(screen.getByRole('tab', { name: 'Created' })).toHaveAttribute('aria-selected', 'true');

    await user.click(sideTab('Automation rules'));
    expect(screen.getByRole('tab', { name: 'Library' })).toHaveAttribute('aria-selected', 'true');
  });
});

describe('SettingsScreen details panel', () => {
  it("shows a canned response's format badge beside its title", async () => {
    const user = userEvent.setup();
    render(<Harness product="helpdesk" initialTab="canned-responses" />);
    await user.click(screen.getByText('Refund timeline'));

    const panel = screen.getByRole('complementary', { name: 'Refund timeline' });
    expect(within(panel).getByTitle('Text')).toHaveTextContent('T');
  });
});

describe('SettingsScreen leaving and re-entering', () => {
  it('starts fresh when mounted again', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Harness product="helpdesk" initialTab="agents" />);
    await user.type(screen.getByRole('textbox', { name: 'Search for agents' }), 'Aarav');
    unmount();

    render(<Harness product="helpdesk" initialTab="agents" />);
    expect(screen.getByRole('textbox', { name: 'Search for agents' })).toHaveValue('');
  });
});

describe('SettingsScreen Manage industries', () => {
  it('asks the owner of the URL to open it', async () => {
    const user = userEvent.setup();
    const onManageIndustriesChange = vi.fn();
    render(<Harness product="automation" initialTab="bot-templates" onManageIndustriesChange={onManageIndustriesChange} />);

    await user.click(screen.getByRole('button', { name: 'Manage industries' }));
    expect(onManageIndustriesChange).toHaveBeenCalledWith(true);
  });
});

describe('SettingsScreen SLA rule reordering', () => {
  const ruleNames = () =>
    screen.getAllByRole('row').slice(1).map((row) => row.querySelector('.lc-bt__name')?.textContent ?? '');

  it('moves a rule with the keyboard and keeps the new order after saving', async () => {
    const user = userEvent.setup();
    render(<Harness product="helpdesk" initialTab="sla-rules" />);
    const [first, second] = ruleNames();

    await user.click(screen.getByRole('button', { name: 'Reorder' }));
    expect(screen.getByRole('button', { name: 'Save order' })).toBeDisabled();

    screen.getByRole('button', { name: new RegExp(`^Reorder ${first}`) }).focus();
    await user.keyboard('{ArrowDown}');
    expect(ruleNames().slice(0, 2)).toEqual([second, first]);

    await user.click(screen.getByRole('button', { name: 'Save order' }));
    expect(await screen.findByRole('button', { name: 'Reorder' }, { timeout: 2000 })).toBeInTheDocument();
    expect(ruleNames().slice(0, 2)).toEqual([second, first]);
  });

  it('discards the new order on Cancel', async () => {
    const user = userEvent.setup();
    render(<Harness product="helpdesk" initialTab="sla-rules" />);
    const before = ruleNames();

    await user.click(screen.getByRole('button', { name: 'Reorder' }));
    screen.getByRole('button', { name: new RegExp(`^Reorder ${before[0]}`) }).focus();
    await user.keyboard('{ArrowDown}');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(ruleNames()).toEqual(before);
  });
});

describe('SettingsScreen integration form', () => {
  it('opens Freshdesk from its tile, needs every field to update, and goes back', async () => {
    const user = userEvent.setup();
    render(<Harness product="helpdesk" initialTab="hd-integration" />);

    await user.click(screen.getByRole('button', { name: 'Freshdesk' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Freshdesk');
    expect(screen.getByText(INTEGRATION_FORMS.freshdesk.description)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Connected to Freshdesk');
    expect(screen.queryByRole('button', { name: 'Update' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Where to find the Widget ID?' })).toHaveTextContent('Where to find?');

    const domain = screen.getByRole('textbox', { name: 'Domain' });
    await user.clear(domain);
    expect(screen.getByRole('button', { name: 'Update' })).toBeDisabled();
    await user.type(domain, 'new.freshdesk.com');
    await user.click(screen.getByRole('button', { name: 'Update' }));
    expect(screen.queryByRole('button', { name: 'Update' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(SETTINGS_COPY['hd-integration'].title);
  });
});

describe('SettingsScreen integration forms', () => {
  it('has a connection form for every Integration tile', () => {
    const missing = INTEGRATION_CATEGORIES.flatMap((c) => c.partners)
      .map((p) => p.id)
      .filter((id) => !INTEGRATION_FORMS[id]);
    expect(missing).toEqual([]);
  });
});

describe('SettingsScreen Change plan', () => {
  it('opens from Upgrade plan, marks the current plan, and goes back to Billing', async () => {
    const user = userEvent.setup();
    render(<Harness product="helpdesk" initialTab="billing" />);

    await user.click(screen.getByRole('button', { name: 'Upgrade plan' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Change plan');
    expect(screen.getByRole('button', { name: 'Current plan' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Switch to Growth' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(SETTINGS_COPY.billing.title);
  });
});

describe('SettingsScreen inbox edit', () => {
  it("opens from a row's Edit action, keeps edits, and goes back to the list", async () => {
    const user = userEvent.setup();
    const inbox = DEMO_INBOXES[0];
    render(<Harness product="helpdesk" initialTab="inboxes" />);

    const row = (await screen.findByText(inbox.name, {}, { timeout: 2000 })).closest<HTMLElement>('[role="row"]');
    await user.click(within(row!).getByRole('button', { name: 'More actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(inbox.name);
    expect(screen.getByRole('textbox', { name: 'Phone number' })).toHaveValue(inbox.detail);

    const ticketDetails = within(screen.getByRole('region', { name: 'Ticket details' }));
    const hours = within(ticketDetails.getByRole('group', { name: 'Auto close duration' })).getByRole('spinbutton', { name: 'Hours' });
    await user.clear(hours);
    await user.type(hours, '99');
    expect(hours).toHaveValue(23);

    const tracking = within(screen.getByRole('region', { name: 'Enable conversation tracking' }));
    await user.click(tracking.getByRole('switch', { name: 'Enable conversation tracking' }));
    expect(tracking.getByRole('spinbutton', { name: 'Days' })).toBeDisabled();

    const optIn = within(screen.getByRole('region', { name: 'Opt in/out' }));
    await user.type(optIn.getByRole('textbox', { name: 'Opt in keyword' }), 'go{Enter}');
    expect(optIn.getByRole('button', { name: 'Remove GO' })).toBeInTheDocument();
    await user.click(optIn.getByRole('button', { name: 'Remove START' }));
    expect(optIn.getByRole('textbox', { name: 'Preview' })).toHaveValue('You can opt in again by typing GO');

    const reminders = within(screen.getByRole('region', { name: 'Waiting reminder' }));
    await user.click(reminders.getByRole('button', { name: 'Add reminder' }));
    expect(reminders.getByRole('group', { name: 'Reminder 3' })).toBeInTheDocument();
    await user.click(reminders.getByRole('button', { name: 'Delete reminder 1' }));
    expect(reminders.queryByRole('group', { name: 'Reminder 3' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'CSAT' }));
    expect(screen.getByText("CSAT settings aren't designed yet.")).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(SETTINGS_COPY.inboxes.title);
  });
});
