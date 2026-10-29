import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
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
  const [agent, setAgent] = useState('');
  const [team, setTeam] = useState('');
  const [changePlan, setChangePlan] = useState(false);
  return (
    <SettingsScreen
      product={product}
      settingsTab={tab}
      manageIndustries={false}
      integration={integration}
      inbox={inbox}
      agent={agent}
      team={team}
      changePlan={changePlan}
      onTabChange={(id) => {
        setTab(id);
        setIntegration('');
        setInbox('');
        setAgent('');
        setTeam('');
        setChangePlan(false);
      }}
      onManageIndustriesChange={onManageIndustriesChange}
      onIntegrationChange={setIntegration}
      onInboxChange={setInbox}
      onAgentChange={setAgent}
      onTeamChange={setTeam}
      onChangePlanChange={setChangePlan}
    />
  );
}

/** The table row holding this text, once the demo data has loaded. */
const rowOf = async (text: string) =>
  (await screen.findByText(text, {}, { timeout: 2000 })).closest<HTMLElement>('[role="row"]')!;

// The Settings tab list on the left; the segmented list tabs inside a table are role=tab.
const sideTab = (name: string) => within(screen.getByRole('navigation', { name: 'Settings' })).getByRole('button', { name });

const products = Object.keys(SETTINGS_TABS_BY_PRODUCT) as SidebarProduct[];

describe('Agents edit page', () => {
  it('opens from the row menu, edits the agent and goes back to the list', async () => {
    const user = userEvent.setup();
    render(<Harness product="helpdesk" initialTab="agents" />);
    const row = await rowOf('Aarav Mehta');
    // Helpdesk rows show Edit and Delete icons instead of a ⋯ menu.
    await user.click(within(row).getByRole('button', { name: 'Edit Aarav Mehta' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Aarav Mehta');

    const name = screen.getByRole('textbox', { name: 'Agent name' });
    await user.clear(name);
    expect(screen.getByRole('alert')).toHaveTextContent('Enter the agent');
    await user.type(name, 'Aarav M');
    // Role is the table's role split in two: administrators have no editor / viewer choice.
    await user.selectOptions(screen.getByRole('combobox', { name: 'Role' }), 'Agent');
    await user.click(screen.getByRole('radio', { name: 'Viewer' }));
    const addInbox = screen.getByRole('combobox', { name: 'Add inbox' });
    const removable = () => screen.getAllByRole('button', { name: /^Remove / }).length;
    const before = removable();
    await user.selectOptions(addInbox, within(addInbox).getAllByRole('option')[1]);
    expect(removable()).toBe(before + 1);
    expect(screen.getByLabelText('Upload profile picture')).toBeInTheDocument();
    // Nothing is saved until Update: the heading keeps the saved name, and Back drops the draft.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Aarav Mehta');
    await user.click(screen.getByRole('button', { name: 'Update' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Aarav M');
    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(await screen.findByText('Aarav M', {}, { timeout: 2000 })).toBeInTheDocument();
  });

  it('drops unsaved changes when going back without Update', async () => {
    const user = userEvent.setup();
    render(<Harness product="helpdesk" initialTab="agents" />);
    const row = await rowOf('Aarav Mehta');
    // Helpdesk rows show Edit and Delete icons instead of a ⋯ menu.
    await user.click(within(row).getByRole('button', { name: 'Edit Aarav Mehta' }));
    expect(screen.getByRole('button', { name: 'Update' })).toBeDisabled();
    await user.type(screen.getByRole('textbox', { name: 'Agent name' }), ' Jr');
    expect(screen.getByRole('button', { name: 'Update' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(await screen.findByText('Aarav Mehta', {}, { timeout: 2000 })).toBeInTheDocument();
  });
});

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

describe('SLA rule row actions', () => {
  it('keeps Edit as an icon and puts Clone and Delete in a menu', async () => {
    const user = userEvent.setup();
    render(<Harness product="helpdesk" initialTab="sla-rules" />);
    const row = (await screen.findAllByRole('row', {}, { timeout: 2000 }))[1];
    expect(within(row).getByRole('button', { name: /^Edit / })).toBeInTheDocument();
    expect(within(row).queryByRole('button', { name: /^Delete / })).not.toBeInTheDocument();
    await user.click(within(row).getByRole('button', { name: 'More actions' }));
    expect(screen.getByRole('menuitem', { name: 'Clone' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument();
  });
});

describe('SLA rule details panel', () => {
  it('summarises the policy: conditions, targets, reminders and escalation', async () => {
    const user = userEvent.setup();
    render(<Harness product="helpdesk" initialTab="sla-rules" />);
    await user.click(await screen.findByText('First response – urgent', {}, { timeout: 2000 }));

    expect(within(screen.getByRole('region', { name: 'Conditions' })).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('80247')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'SLA Rule' })).getByText(/Resolution Time/)).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Reminders' })).getByText(/30 min before SLA breach/)).toBeInTheDocument();
    const escalation = within(screen.getByRole('region', { name: 'Escalation' }));
    expect(escalation.getByText(/level 1 escalation/i)).toBeInTheDocument();
    expect(escalation.getByText(/level 2 escalation/i)).toBeInTheDocument();
  });
});

describe('Automation rule details panel', () => {
  it('shows the event, conditions and actions', async () => {
    const user = userEvent.setup();
    render(<Harness product="helpdesk" initialTab="automation-rules" />);
    await user.click(await screen.findByText('Auto-assign by inbox', {}, { timeout: 2000 }));

    expect(within(screen.getByRole('region', { name: 'Event' })).getByText('created')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Conditions' })).getByText('Limechat (189)')).toBeInTheDocument();
    const actions = within(screen.getByRole('region', { name: 'Actions' }));
    expect(actions.getByText('Assign Team')).toBeInTheDocument();
    expect(actions.getByText('Customer Support')).toBeInTheDocument();
  });
});

describe('Team details panel', () => {
  it('shows the description and the agents at each of the three levels', async () => {
    const user = userEvent.setup();
    render(<Harness product="helpdesk" initialTab="teams" />);
    await user.click(await screen.findByText('Customer Support', {}, { timeout: 2000 }));

    expect(within(screen.getByRole('region', { name: 'Description' })).getByText(/first-line customer queries/)).toBeInTheDocument();
    const composition = within(screen.getByRole('region', { name: 'Team composition' }));
    const level1 = within(composition.getByRole('group', { name: 'Level 1' }));
    const level2 = within(composition.getByRole('group', { name: 'Level 2' }));
    expect(level1.getAllByRole('listitem')).toHaveLength(5);
    expect(level2.getAllByRole('listitem')).toHaveLength(5);
    expect(within(composition.getByRole('group', { name: 'Level 3' })).getAllByRole('listitem')).toHaveLength(5);
    expect(level1.getByText('Aarav Mehta')).toBeInTheDocument();
    expect(level1.getByText('aarav@limechat.ai')).toBeInTheDocument();
  });
});

describe('Team edit page', () => {
  async function openEdit(user: ReturnType<typeof userEvent.setup>) {
    render(<Harness product="helpdesk" initialTab="teams" />);
    await user.click(await screen.findByText('Customer Support', {}, { timeout: 2000 }));
    await user.click(screen.getByRole('button', { name: 'Edit' }));
  }

  it('adds and removes members and levels, and saves them with Update', async () => {
    const user = userEvent.setup();
    await openEdit(user);

    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Customer Support');
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(
      'Handles first-line customer queries across all inboxes',
    );
    const update = screen.getByRole('button', { name: 'Update' });
    expect(update).toBeDisabled();
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getAllByText('5 members')).toHaveLength(3);

    await user.click(screen.getByRole('button', { name: 'Level 1 members' }));
    await user.click(screen.getByRole('button', { name: 'Remove Aarav Mehta from level 1' }));
    expect(screen.getByText('4 members')).toBeInTheDocument();
    expect(update).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Insert A Level' }));
    expect(screen.getAllByRole('row')).toHaveLength(4);
    expect(screen.getByText('0 members')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete level 4' }));
    expect(screen.getAllByRole('row')).toHaveLength(3);

    await user.click(update);
    await user.click(screen.getByRole('button', { name: 'Back' }));
    // The team's details panel is still open behind the edit page.
    const level1 = within(await screen.findByRole('group', { name: 'Level 1' }));
    expect(level1.getAllByRole('listitem')).toHaveLength(4);
    expect(level1.queryByText('Aarav Mehta')).not.toBeInTheDocument();
  });

  it('renames the team and rewrites its description by typing, and needs a name to save', async () => {
    const user = userEvent.setup();
    await openEdit(user);
    const title = screen.getByRole('textbox', { name: 'Title' });
    const update = screen.getByRole('button', { name: 'Update' });

    await user.clear(title);
    expect(title).toBeInvalid();
    expect(update).toBeDisabled();
    await user.type(title, 'Care Team');
    await user.clear(screen.getByRole('textbox', { name: 'Description' }));
    await user.type(screen.getByRole('textbox', { name: 'Description' }), 'Everything first-line');
    expect(update).toBeEnabled();

    await user.click(update);
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Teams' })).toBeInTheDocument();
    expect(screen.getAllByText('Care Team').length).toBeGreaterThan(0);
    expect(screen.queryByText('Customer Support')).not.toBeInTheDocument();
  });

  it('expands and collapses a level by clicking its header, but not its buttons', async () => {
    const user = userEvent.setup();
    await openEdit(user);
    const first = screen.getAllByRole('row')[0];
    const chevron = within(first).getByRole('button', { name: 'Level 1 members' });
    expect(chevron).toHaveAttribute('aria-expanded', 'false');

    await user.click(within(first).getByText('5 members'));
    expect(chevron).toHaveAttribute('aria-expanded', 'true');
    await user.click(within(first).getByText('5 members'));
    expect(chevron).toHaveAttribute('aria-expanded', 'false');

    await user.click(chevron);
    expect(chevron).toHaveAttribute('aria-expanded', 'true');
    await user.click(within(first).getByRole('button', { name: 'Add Member' }));
    expect(chevron).toHaveAttribute('aria-expanded', 'true');
  });

  it('searches the Add Member menu by name or email', async () => {
    const user = userEvent.setup();
    await openEdit(user);
    await user.click(within(screen.getAllByRole('row')[0]).getByRole('button', { name: 'Add Member' }));
    const menu = within(screen.getByRole('menu', { name: 'Add a member to level 1' }));
    const all = menu.getAllByRole('menuitem').length;

    await user.type(menu.getByRole('searchbox', { name: 'Search collaborators' }), 'zzz');
    expect(menu.getByText('No collaborators found.')).toBeInTheDocument();

    await user.clear(menu.getByRole('searchbox'));
    await user.type(menu.getByRole('searchbox'), '@limechat');
    expect(menu.getAllByRole('menuitem')).toHaveLength(all);
  });

  it('turns Auto-assign on and keeps it after Update', async () => {
    const user = userEvent.setup();
    await openEdit(user);
    const toggle = screen.getByRole('switch', { name: 'Auto-assign' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('button', { name: 'Update' })).toBeDisabled();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('button', { name: 'Update' }));
    await user.click(screen.getByRole('button', { name: 'Back' }));
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByRole('switch', { name: 'Auto-assign' })).toHaveAttribute('aria-checked', 'true');
  });

  it('replaces the team from a CSV, and reports a bad file', async () => {
    const user = userEvent.setup();
    await openEdit(user);
    const upload = screen.getByLabelText('Upload team data', { selector: 'aside' }).querySelector('input[type="file"]');
    if (!(upload instanceof HTMLInputElement)) throw new Error('no file input');

    await user.upload(upload, new File(['email,level\nnobody@x.com,1'], 'team.csv', { type: 'text/csv' }));
    expect(await screen.findByRole('alert')).toHaveTextContent("Row 2: nobody@x.com isn't a collaborator");
    expect(screen.getAllByRole('row')).toHaveLength(3);

    await user.upload(upload, new File(['email,level\naarav@limechat.ai,1\nisha@limechat.ai,2'], 'team.csv', { type: 'text/csv' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Imported 2 members across 2 levels.');
    expect(screen.getAllByRole('row')).toHaveLength(2);
  });
});

describe('Products tab', () => {
  it('lists the synced catalog and refreshes "Last synced" on Sync', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<Harness product="helpdesk" initialTab="products" />);
      expect(await screen.findByText('Nike Air Zoom Pegasus 41')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent('Last synced 2 hours ago');

      await user.click(screen.getByRole('button', { name: 'Sync from Shopify' }));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1600);
      });
      expect(screen.getByRole('status')).toHaveTextContent('Last synced just now');
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('Inbox details panel collaborators', () => {
  it('lists the inbox collaborators, filters them, and removes one', async () => {
    const user = userEvent.setup();
    render(<Harness product="helpdesk" initialTab="inboxes" />);
    const row = await rowOf(DEMO_INBOXES[0].name);
    await user.click(row);

    const panel = within(screen.getByRole('region', { name: 'Collaborators' }));
    expect(panel.getAllByRole('listitem')).toHaveLength(20);
    await user.type(panel.getByRole('searchbox', { name: 'Search collaborators' }), 'aarav');
    expect(panel.getAllByRole('listitem')).toHaveLength(1);
    await user.click(panel.getByRole('button', { name: 'Remove Aarav Mehta' }));
    expect(panel.getByText('No collaborators match.')).toBeInTheDocument();
  });
});

describe('SettingsScreen inbox edit', () => {
  it("opens from a row's Edit action, keeps edits, and goes back to the list", async () => {
    const user = userEvent.setup();
    const inbox = DEMO_INBOXES[0];
    render(<Harness product="helpdesk" initialTab="inboxes" />);

    const row = await rowOf(inbox.name);
    await user.click(within(row).getByRole('button', { name: `Edit ${inbox.name}` }));
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

    await user.click(screen.getByRole('tab', { name: 'Business Hours' }));
    const monday = within(screen.getByRole('group', { name: 'Monday' }));
    expect(monday.getByText('05:00 PM', { selector: '.lc-inbs__closing' })).toBeInTheDocument();
    await user.selectOptions(monday.getByRole('combobox', { name: 'Monday slot 1 hours' }), '2');
    expect(monday.getByText('11:00 AM', { selector: '.lc-inbs__closing' })).toBeInTheDocument();
    await user.click(monday.getByRole('button', { name: 'Add Monday hours' }));
    expect(monday.getByRole('combobox', { name: 'Monday slot 2 starting hour' })).toHaveValue('660');
    await user.click(monday.getByRole('button', { name: 'Remove Monday slot 2' }));
    expect(monday.queryByRole('combobox', { name: 'Monday slot 2 hours' })).not.toBeInTheDocument();
    await user.click(within(screen.getByRole('group', { name: 'Sunday' })).getByRole('switch', { name: 'Sunday open' }));
    expect(within(screen.getByRole('group', { name: 'Sunday' })).getByRole('combobox', { name: 'Sunday slot 1 hours' })).toBeEnabled();

    await user.click(screen.getByRole('tab', { name: 'Collaborators' }));
    const agents = within(screen.getByRole('region', { name: 'Agents' }));
    const addedList = within(agents.getByRole('region', { name: /^Collaborators added/ }));
    const availableList = within(agents.getByRole('region', { name: /^Available collaborators/ }));
    expect(addedList.getByText('Aarav Mehta')).toBeInTheDocument();
    // Column headers sort: Name ascending, then descending, then back to the original order.
    const nameSort = addedList.getByRole('button', { name: 'Name' });
    await user.click(nameSort);
    expect(addedList.getAllByRole('row')[1]).toHaveTextContent('Aarav Mehta');
    await user.click(nameSort);
    expect(addedList.getAllByRole('row')[1]).toHaveTextContent('Yash Agarwal');
    await user.click(nameSort);
    await user.click(addedList.getByRole('switch', { name: 'Only assign Aarav Mehta manually' }));
    expect(addedList.getByRole('switch', { name: 'Only assign Aarav Mehta manually' })).toBeChecked();
    // Removing offers an undo that restores the agent with their manual-assignment setting.
    await user.click(addedList.getByRole('button', { name: 'Remove Aarav Mehta' }));
    expect(addedList.queryByText('Aarav Mehta')).not.toBeInTheDocument();
    await user.click(agents.getByRole('button', { name: 'Undo' }));
    expect(addedList.getByRole('switch', { name: 'Only assign Aarav Mehta manually' })).toBeChecked();
    await user.click(addedList.getByRole('button', { name: 'Remove Aarav Mehta' }));
    expect(availableList.getByText('Aarav Mehta')).toBeInTheDocument();
    // Search narrows both lists.
    await user.type(agents.getByRole('searchbox', { name: 'Search agents' }), 'karan');
    expect(availableList.queryByText('Aarav Mehta')).not.toBeInTheDocument();
    await user.click(availableList.getByRole('button', { name: 'Add Karan Malik to inbox' }));
    expect(addedList.getByText('Karan Malik')).toBeInTheDocument();
    await user.clear(agents.getByRole('searchbox', { name: 'Search agents' }));
    expect(agents.getAllByText('Incomplete profile').length).toBeGreaterThan(0);
    // Create a brand-new agent and add it to the inbox in one go.
    await user.click(agents.getByRole('button', { name: 'Create agent' }));
    const dialog = within(screen.getByRole('dialog'));
    await user.click(dialog.getByRole('button', { name: 'Create agent' }));
    expect(dialog.getByText('Enter the agent’s name.')).toBeInTheDocument();
    await user.type(dialog.getByLabelText(/Full name/), 'Zoya Khan');
    await user.type(dialog.getByLabelText(/Email address/), 'aarav@limechat.ai');
    await user.click(dialog.getByRole('button', { name: 'Create agent' }));
    expect(dialog.getByText('An agent with this email already exists.')).toBeInTheDocument();
    await user.clear(dialog.getByLabelText(/Email address/));
    await user.type(dialog.getByLabelText(/Email address/), 'zoya@limechat.ai');
    await user.click(dialog.getByRole('button', { name: 'Create agent' }));
    expect(addedList.getByText('Zoya Khan')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Configuration' }));
    expect(screen.getByText('Please contact admin to set this up.')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'CSAT' }));
    const csat = within(screen.getByRole('region', { name: 'Agent CSAT' }));
    expect(csat.getByRole('radio', { name: '5 stars' })).toBeChecked();
    await user.click(csat.getByRole('radio', { name: '3 stars' }));
    expect(csat.getByRole('radio', { name: '3 stars' })).toBeChecked();
    await user.click(csat.getByRole('switch', { name: 'Agent CSAT' }));
    expect(csat.getByRole('radio', { name: 'Link-based' })).toBeDisabled();
    const csatReminder = within(screen.getByRole('region', { name: 'Enable CSAT reminder' }));
    expect(csatReminder.getByRole('spinbutton', { name: 'Hours' })).toHaveValue(1);

    expect(screen.queryByRole('complementary', { name: 'Mobile preview' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'WhatsApp Widget' }));
    expect(screen.getByRole('complementary', { name: 'Mobile preview' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Preview on desktop' }));
    expect(screen.getByRole('dialog', { name: 'Desktop preview' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Copy code' }));
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
    expect(await navigator.clipboard.readText()).toContain(`data-phone="${inbox.detail.replace(/\D/g, '')}"`);
    const widget = within(screen.getByRole('region', { name: 'WhatsApp Widget for Mobile' }));
    expect(widget.getByRole('spinbutton', { name: 'From right' })).toHaveValue(24);
    await user.click(widget.getByRole('radio', { name: 'Left' }));
    expect(widget.getByRole('spinbutton', { name: 'From left' })).toHaveValue(24);
    expect(widget.getByText('Static without stroke')).toBeInTheDocument();
    await user.click(widget.getByRole('button', { name: 'Remove widget icon' }));
    expect(widget.getByRole('button', { name: 'Upload widget icon' })).toBeInTheDocument();
    await user.click(widget.getByRole('switch', { name: 'WhatsApp Widget for Mobile' }));
    expect(widget.getByRole('radio', { name: 'Icon' })).toBeDisabled();
    // Desktop is set up separately, so mobile's edits don't reach it.
    const desktopWidget = within(screen.getByRole('region', { name: 'WhatsApp Widget for Desktop' }));
    expect(desktopWidget.getByRole('radio', { name: 'Icon' })).toBeEnabled();
    expect(desktopWidget.getByRole('spinbutton', { name: 'From right' })).toHaveValue(24);
    // Pop-up copy is set per device.
    const popup = within(screen.getByRole('region', { name: 'Pop-up Message' }));
    await user.type(popup.getByRole('textbox', { name: 'Heading' }), 'Hi there');
    await user.click(popup.getByRole('tab', { name: 'Mobile' }));
    expect(popup.getByRole('textbox', { name: 'Heading' })).toHaveValue('');
    expect(popup.getByRole('combobox', { name: 'Time to appear' })).toHaveValue('3');
    expect(popup.getByText('Select Media')).toBeInTheDocument();
    const pages = within(screen.getByRole('region', { name: 'Shopify pages' }));
    await user.click(pages.getByRole('checkbox', { name: 'Checkout' }));
    expect(pages.getByRole('checkbox', { name: 'Checkout' })).not.toBeChecked();
    // Unticking a page type disables its pre-filled message.
    const prefill = within(screen.getByRole('region', { name: 'Pre-filled text message' }));
    expect(prefill.getByRole('textbox', { name: 'Collections pages' })).toBeEnabled();
    await user.click(pages.getByRole('checkbox', { name: 'Collections' }));
    expect(prefill.getByRole('textbox', { name: 'Collections pages' })).toBeDisabled();
    expect(screen.getByRole('spinbutton', { name: 'Z-Index value' })).toHaveValue(1000);

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(SETTINGS_COPY.inboxes.title);
  });
});
