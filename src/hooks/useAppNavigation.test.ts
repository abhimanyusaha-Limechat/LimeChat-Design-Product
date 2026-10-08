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

  describe('sub-views in the URL', () => {
    const go = (hash: string) => {
      history.replaceState(null, '', hash);
      act(() => {
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    };

    it.each([
      ['#/marketing/broadcast?view=canvas', { page: 'broadcast-canvas' }],
      ['#/marketing/automation-flows?view=canvas', { page: 'flows-canvas' }],
      ['#/automation/flows?view=canvas', { page: 'bot-flows-canvas' }],
      ['#/helpdesk/settings?tab=agents', { page: 'settings', settingsTab: 'agents' }],
      ['#/automation/settings?tab=bot-templates&industries=1', { page: 'settings', manageIndustries: true }],
      ['#/marketing/segments?user=profile', { page: 'user-settings', userSettingsTab: 'profile' }],
      ['#/helpdesk/tickets?user=account', { page: 'user-settings', userSettingsTab: 'account' }],
    ])('restores %s in one step', (hash, expected) => {
      history.replaceState(null, '', hash);
      const before = history.length;
      const { result } = setup();
      expect(result.current).toMatchObject(expected);
      expect(location.hash).toBe(hash);
      expect(history.length).toBe(before);
    });

    it('writes each sub-view change to the hash as a new history entry', () => {
      history.replaceState(null, '', '#/marketing/broadcast');
      const { result } = setup();
      const before = history.length;
      act(() => result.current.openCanvas('broadcast'));
      expect(location.hash).toBe('#/marketing/broadcast?view=canvas');
      act(() => result.current.leaveCanvas());
      expect(location.hash).toBe('#/marketing/broadcast');
      act(() => result.current.openUserSettings('account'));
      expect(location.hash).toBe('#/marketing/broadcast?user=account');
      act(() => result.current.setUserSettingsTab('profile'));
      expect(location.hash).toBe('#/marketing/broadcast?user=profile');
      expect(history.length).toBe(before + 4);
    });

    it('writes settings tab and manage industries to the hash', () => {
      history.replaceState(null, '', '#/automation/settings');
      const { result } = setup();
      const before = history.length;
      act(() => result.current.setSettingsTab('bot-templates'));
      expect(location.hash).toBe('#/automation/settings?tab=bot-templates');
      act(() => result.current.setManageIndustries(true));
      expect(location.hash).toBe('#/automation/settings?tab=bot-templates&industries=1');
      act(() => result.current.setManageIndustries(false));
      act(() => result.current.setSettingsTab('inboxes'));
      expect(location.hash).toBe('#/automation/settings');
      expect(history.length).toBe(before + 4);
    });

    it.each(['inboxes', 'bot-templates'])('picking the %s tab closes Manage industries in one entry', (tab) => {
      history.replaceState(null, '', '#/automation/settings?tab=bot-templates&industries=1');
      const { result } = setup();
      const before = history.length;
      act(() => result.current.setSettingsTab(tab));
      expect(location.hash).toBe(tab === 'inboxes' ? '#/automation/settings' : '#/automation/settings?tab=bot-templates');
      expect(result.current.manageIndustries).toBe(false);
      expect(result.current.settingsTab).toBe(tab);
      expect(history.length).toBe(before + 1);
    });

    it('composes back-to-back changes made in one handler', () => {
      history.replaceState(null, '', '#/automation/settings?tab=bot-templates&industries=1');
      const { result } = setup();
      act(() => {
        result.current.setManageIndustries(false);
        result.current.setSettingsTab('inboxes');
      });
      expect(location.hash).toBe('#/automation/settings');
      expect(result.current.manageIndustries).toBe(false);
      expect(result.current.settingsTab).toBe('inboxes');
    });

    it('follows Back and Forward across sub-view changes', () => {
      history.replaceState(null, '', '#/helpdesk/settings');
      const { result } = setup();
      go('#/helpdesk/settings?tab=teams');
      expect(result.current.settingsTab).toBe('teams');
      go('#/helpdesk/settings');
      expect(result.current.settingsTab).toBe('inboxes');
      go('#/automation/flows?view=canvas');
      expect(result.current.page).toBe('bot-flows-canvas');
      go('#/automation/flows');
      expect(result.current.page).toBe('bot-flows-list');
    });

    it('drops unknown parameters when navigating', () => {
      history.replaceState(null, '', '#/marketing/broadcast?comment=12');
      const { result } = setup();
      act(() => result.current.openCanvas('broadcast'));
      expect(location.hash).toBe('#/marketing/broadcast?view=canvas');
    });

    it.each([
      ['#/marketing/segments?view=canvas', '#/marketing/segments', { page: 'segments' }],
      ['#/marketing/broadcast?view=nope', '#/marketing/broadcast', { page: 'broadcast-list' }],
      ['#/helpdesk/settings?tab=nope', '#/helpdesk/settings', { settingsTab: 'inboxes' }],
      ['#/marketing/settings?tab=agents', '#/marketing/settings', { settingsTab: 'inboxes' }],
      ['#/helpdesk/tickets?tab=agents', '#/helpdesk/tickets', { page: 'tickets' }],
      ['#/automation/settings?industries=1', '#/automation/settings', { manageIndustries: false }],
      ['#/automation/settings?tab=bot-templates&industries=yes', '#/automation/settings?tab=bot-templates', { manageIndustries: false }],
      ['#/helpdesk/tickets?user=admin', '#/helpdesk/tickets', { page: 'tickets' }],
    ])('corrects %s to %s in place', (hash, corrected, expected) => {
      history.replaceState(null, '', hash);
      const before = history.length;
      const { result } = setup();
      expect(result.current).toMatchObject(expected);
      expect(location.hash).toBe(corrected);
      expect(history.length).toBe(before);
    });
  });
});
