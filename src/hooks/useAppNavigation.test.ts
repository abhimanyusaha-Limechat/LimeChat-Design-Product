import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { isCanvasPage, useAppNavigation } from './useAppNavigation';

const setup = () => renderHook(() => useAppNavigation());

describe('useAppNavigation', () => {
  it('starts on the helpdesk tickets page', () => {
    const { result } = setup();
    expect(result.current.product).toBe('helpdesk');
    expect(result.current.page).toBe('tickets');
  });

  it('derives the page from product and rail item', () => {
    const { result } = setup();
    act(() => result.current.select('templates'));
    expect(result.current.page).toBe('templates');
    act(() => result.current.select('settings'));
    expect(result.current.page).toBe('settings');
    act(() => result.current.select('analytics'));
    expect(result.current.page).toBe('home');
    act(() => result.current.switchProduct('marketing'));
    act(() => result.current.select('segments'));
    expect(result.current.page).toBe('segments');
  });

  it.each([
    ['marketing', 'broadcast', 'broadcast'],
    ['marketing', 'automation-flows', 'flows'],
    ['automation', 'flows', 'bot-flows'],
  ] as const)('%s/%s opens a list, then the editor, then back', (product, item, kind) => {
    const { result } = setup();
    act(() => result.current.switchProduct(product));
    act(() => result.current.select(item));
    expect(result.current.page).toBe(`${kind}-list`);
    act(() => result.current.openCanvas(kind));
    expect(result.current.page).toBe(`${kind}-canvas`);
    expect(isCanvasPage(result.current.page)).toBe(true);
    act(() => result.current.leaveCanvas());
    expect(result.current.page).toBe(`${kind}-list`);
  });

  it('resets every editor view and the settings sub-navigation on navigation', () => {
    const { result } = setup();
    act(() => result.current.switchProduct('automation'));
    act(() => result.current.select('flows'));
    act(() => result.current.openCanvas('bot-flows'));
    act(() => result.current.setSettingsTab('agents'));
    act(() => result.current.setManageIndustries(true));
    act(() => result.current.select('flows'));
    expect(result.current.page).toBe('bot-flows-list');
    expect(result.current.settingsTab).toBe('inboxes');
    expect(result.current.manageIndustries).toBe(false);

    act(() => result.current.openCanvas('bot-flows'));
    act(() => result.current.switchProduct('marketing'));
    act(() => result.current.switchProduct('automation'));
    act(() => result.current.select('flows'));
    expect(result.current.page).toBe('bot-flows-list');
  });

  it('writes each navigation to the hash as a new history entry', () => {
    const { result } = setup();
    const before = history.length;
    act(() => result.current.switchProduct('marketing'));
    expect(location.hash).toBe('#/marketing/home');
    act(() => result.current.select('segments'));
    expect(location.hash).toBe('#/marketing/segments');
    expect(history.length).toBe(before + 2);
  });

  it('starts on the screen in the hash', () => {
    history.replaceState(null, '', '#/automation/knowledge-base?foo=1');
    const { result } = setup();
    expect(result.current.product).toBe('automation');
    expect(result.current.selected).toBe('knowledge-base');
    expect(result.current.page).toBe('knowledge-base');
    expect(location.hash).toBe('#/automation/knowledge-base?foo=1');
  });

  it('follows hashchange (back, forward, manual edits)', () => {
    const { result } = setup();
    act(() => result.current.openUserSettings('profile'));
    history.replaceState(null, '', '#/marketing/segments');
    act(() => {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(result.current.product).toBe('marketing');
    expect(result.current.selected).toBe('segments');
    expect(result.current.page).toBe('segments');
  });

  it.each([
    ['', '#/helpdesk/tickets'],
    ['#/nope/x', '#/helpdesk/tickets'],
    ['#/automation/nope', '#/automation/agents'],
  ])('corrects %j to %s in place on load', (hash, corrected) => {
    history.replaceState(null, '', hash || location.pathname);
    const before = history.length;
    setup();
    expect(location.hash).toBe(corrected);
    expect(history.length).toBe(before);
  });

  it('corrects a broken hash in place on hashchange', () => {
    const { result } = setup();
    history.replaceState(null, '', '#/marketing/nope');
    const before = history.length;
    act(() => {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(result.current.selected).toBe('home');
    expect(location.hash).toBe('#/marketing/home');
    expect(history.length).toBe(before);
  });

  it('shows user settings over any page and closes them on navigation', () => {
    const { result } = setup();
    act(() => result.current.openUserSettings('profile'));
    expect(result.current.page).toBe('user-settings');
    expect(result.current.userSettingsTab).toBe('profile');
    act(() => result.current.select('tickets'));
    expect(result.current.page).toBe('tickets');
  });
});
