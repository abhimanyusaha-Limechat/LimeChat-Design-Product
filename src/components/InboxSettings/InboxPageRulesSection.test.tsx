import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageRulesSection, pageSettingsFor, type InboxPageRules } from './InboxPageRulesSection';

const rule = (id: string, match: 'contains' | 'startsWith' | 'equals', url: string, widget = true, popup = true) => ({ id, match, url, widget, popup });

describe('pageSettingsFor', () => {
  const value: InboxPageRules = {
    all: { widget: true, popup: true },
    rules: [rule('a', 'startsWith', '/checkout', false), rule('b', 'contains', 'blog', true, false), rule('c', 'equals', '/cart')],
  };

  it('is on unless a matching rule turns it off', () => {
    expect(pageSettingsFor(value, '/checkout/step-2')).toEqual({ widget: false, popup: false });
    expect(pageSettingsFor(value, '/blog/post')).toEqual({ widget: true, popup: false });
    expect(pageSettingsFor(value, '/about')).toEqual({ widget: true, popup: true });
  });

  it('lets any matching rule turn it off, whatever the order', () => {
    const overlap = [rule('x', 'startsWith', '/blog', true, true), rule('y', 'equals', '/blog/private', false)];
    expect(pageSettingsFor({ all: value.all, rules: overlap }, '/blog/private')).toEqual({ widget: false, popup: false });
    expect(pageSettingsFor({ all: value.all, rules: [...overlap].reverse() }, '/blog/private')).toEqual({ widget: false, popup: false });
  });

  it('ignores case, query, hash and a trailing slash', () => {
    expect(pageSettingsFor(value, '/Cart/?utm=1#top')).toEqual({ widget: true, popup: true });
    expect(pageSettingsFor(value, '/cart/extra')).toEqual({ widget: true, popup: true });
    expect(pageSettingsFor(value, '/CHECKOUT/')).toEqual({ widget: false, popup: false });
  });

  it('follows All pages, never shows a pop-up without the widget, and ignores blank rules', () => {
    expect(pageSettingsFor({ all: { widget: false, popup: true }, rules: [rule('x', 'contains', '  ')] }, '/any')).toEqual({ widget: false, popup: false });
    expect(pageSettingsFor({ all: { widget: true, popup: false }, rules: [] }, '/any')).toEqual({ widget: true, popup: false });
  });
});

function Harness({ widgetOn = true, popupOn = true }: { widgetOn?: boolean; popupOn?: boolean }) {
  const [value, setValue] = useState<InboxPageRules>({
    all: { widget: true, popup: true },
    rules: [rule('a', 'startsWith', '/checkout'), rule('b', 'startsWith', '/blog')],
  });
  return <PageRulesSection value={value} widgetOn={widgetOn} popupOn={popupOn} onChange={setValue} />;
}

describe('PageRulesSection', () => {
  it('disables a row’s pop-up while its widget is off, and restores it after', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const popup = screen.getByRole('switch', { name: 'Pop-up on /checkout' });
    expect(popup).toBeEnabled();
    expect(popup).toBeChecked();

    await user.click(screen.getByRole('switch', { name: 'Widget on /checkout' }));
    expect(popup).toBeDisabled();
    expect(popup).not.toBeChecked();

    await user.click(screen.getByRole('switch', { name: 'Widget on /checkout' }));
    expect(popup).toBeEnabled();
    expect(popup).toBeChecked();
  });

  it('disables the pop-up column when the Pop-up Message is off', () => {
    render(<Harness popupOn={false} />);
    expect(screen.getByRole('switch', { name: 'Pop-up on /blog' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'Pop-up on all pages' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'Widget on /blog' })).toBeEnabled();
  });

  it('disables every switch when no device widget is on', () => {
    render(<Harness widgetOn={false} />);
    expect(screen.getByRole('switch', { name: 'Widget on /blog' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'Widget on all pages' })).toBeDisabled();
  });

  it('adds and removes rules', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const paths = () => screen.getAllByRole('textbox').map((el) => (el as HTMLInputElement).value);

    await user.click(screen.getByRole('button', { name: 'Add rule' }));
    expect(paths()).toEqual(['/checkout', '/blog', '']);

    await user.click(screen.getByRole('button', { name: 'Remove /blog' }));
    expect(paths()).toEqual(['/checkout', '']);
  });
});
