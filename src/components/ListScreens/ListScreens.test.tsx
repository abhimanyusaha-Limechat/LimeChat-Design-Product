import { beforeAll, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEMO_TEMPLATES } from '../../data/templatesDemo';
import { BroadcastScreen, KnowledgeBaseScreen, TemplatesScreen, templateMatches } from '.';

// jsdom has no ResizeObserver; tab indicators only use it to re-measure.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const rows = (anchor: string) => [...document.querySelectorAll(`[data-anchor="${anchor}"]`)];
const pagination = () => screen.queryByRole('navigation', { name: 'Pagination' });
const open = (hash: string) => history.replaceState(null, '', hash);

describe('BroadcastScreen', () => {
  it('narrows rows by name or ID and hides pagination while searching', async () => {
    const user = userEvent.setup();
    open('#/marketing/broadcast');
    render(<BroadcastScreen />);
    expect(pagination()).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Search for broadcast'), 'sale');
    expect(rows('broadcast-row')).toHaveLength(4);
    expect(pagination()).not.toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText('Search for broadcast'));
    await user.type(screen.getByPlaceholderText('Search for broadcast'), '40000');
    expect(rows('broadcast-row').map((r) => r.textContent)).toEqual([expect.stringContaining('Spring Launch')]);
  });

  it('writes the List tab to the URL and starts the search over', async () => {
    const user = userEvent.setup();
    open('#/marketing/broadcast');
    render(<BroadcastScreen />);
    await user.type(screen.getByPlaceholderText('Search for broadcast'), 'sale');
    await user.click(screen.getByRole('tab', { name: 'Draft' }));
    expect(location.hash).toBe('#/marketing/broadcast?tab=draft');
    expect(screen.getByPlaceholderText('Search for broadcast')).toHaveValue('');
    expect(screen.getByRole('tab', { name: 'Draft' })).toHaveAttribute('aria-selected', 'true');
  });

  it('reaches any page through the pagination', async () => {
    const user = userEvent.setup();
    open('#/marketing/broadcast');
    render(<BroadcastScreen />);
    await user.click(screen.getByRole('button', { name: '10' }));
    await user.click(screen.getByRole('button', { name: '9' }));
    await user.click(screen.getByRole('button', { name: '8' }));
    expect(screen.getByRole('button', { name: '8' })).toHaveAttribute('aria-current', 'page');
  });
});

describe('TemplatesScreen', () => {
  it('filters by inbox and category, and a channel switch clears the filters', async () => {
    const user = userEvent.setup();
    open('#/marketing/templates');
    render(<TemplatesScreen />);
    const [inbox, , category] = screen.getAllByRole('combobox');
    await user.selectOptions(inbox, 'clinikally-helpdesk');
    await user.selectOptions(category, 'marketing');
    expect(rows('template-row')).toHaveLength(3);

    await user.click(screen.getByRole('tab', { name: 'SMS' }));
    expect(location.hash).toBe('#/marketing/templates?tab=sms');
    expect(rows('template-row')).toHaveLength(DEMO_TEMPLATES.length);
  });

  it.each([
    [{ inbox: 'main', type: 'all', category: 'all' }, 'tre', true],
    [{ inbox: 'clinikally-helpdesk', type: 'all', category: 'all' }, 'tre', false],
    [{ inbox: 'all', type: 'image', category: 'all' }, 'spf100', true],
    [{ inbox: 'all', type: 'all', category: 'authentication' }, 'otp_verification', true],
  ])('templateMatches %j on %s is %s', (filters, name, expected) => {
    const row = DEMO_TEMPLATES.find((t) => t.name === name)!;
    expect(templateMatches(row, '', filters)).toBe(expected);
  });
});

describe('KnowledgeBaseScreen', () => {
  it('opens the KB tab in the URL and searches its files', async () => {
    const user = userEvent.setup();
    open('#/automation/knowledge-base?tab=manage');
    render(<KnowledgeBaseScreen />);
    await user.type(screen.getByPlaceholderText('Search for Doc'), 'return');
    expect(screen.getByText('Return policy.pdf')).toBeInTheDocument();
    expect(screen.queryByText('Product catalogue.pdf')).not.toBeInTheDocument();
  });

  it('opens the change history as a read-only log', async () => {
    const user = userEvent.setup();
    open('#/automation/knowledge-base?tab=manage');
    render(<KnowledgeBaseScreen />);

    expect(screen.queryByRole('dialog', { name: 'History' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'More knowledge base actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'See history' }));

    const panel = screen.getByRole('dialog', { name: 'History' });
    // Nothing is published here, so there is no draft to sit above the log.
    expect(within(panel).queryByRole('region', { name: 'Current version' })).not.toBeInTheDocument();

    // Each entry says who did what, and no entry is a control.
    expect(within(panel).getAllByRole('listitem')).toHaveLength(12);
    expect(within(panel).getByText(/added Support scripts\.md/)).toBeInTheDocument();
    expect(within(panel).getByText(/removed Size guide\.html/)).toBeInTheDocument();
    expect(within(panel).queryByText('View')).not.toBeInTheDocument();
    expect(within(panel).queryByRole('button', { name: /^Download/ })).not.toBeInTheDocument();
    expect(within(panel).queryByRole('button', { name: /^View the version/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close history' }));
    expect(screen.queryByRole('dialog', { name: 'History' })).not.toBeInTheDocument();
  });
});
