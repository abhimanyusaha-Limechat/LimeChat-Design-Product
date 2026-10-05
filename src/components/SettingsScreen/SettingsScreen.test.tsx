import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { SidebarProduct } from '../Sidebar/presets';
import { SettingsScreen } from './SettingsScreen';
import { SETTINGS_COPY, SETTINGS_TABS_BY_PRODUCT } from './settingsTabs';

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
  return (
    <SettingsScreen
      product={product}
      settingsTab={tab}
      manageIndustries={false}
      onTabChange={setTab}
      onManageIndustriesChange={onManageIndustriesChange}
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
