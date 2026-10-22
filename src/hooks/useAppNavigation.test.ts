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
    act(() => result.current.openFlow('new'));
    expect(result.current.page).toBe(`${kind}-canvas`);
    expect(isCanvasPage(result.current.page)).toBe(true);
    act(() => result.current.leaveCanvas());
    expect(result.current.page).toBe(`${kind}-list`);
  });

  it('resets every editor view and the settings sub-navigation on navigation', () => {
    const { result } = setup();
    act(() => result.current.switchProduct('automation'));
    act(() => result.current.select('flows'));
    act(() => result.current.openFlow('new'));
    act(() => result.current.setTab('inactive'));
    act(() => result.current.setManageIndustries(true));
    act(() => result.current.select('flows'));
    expect(result.current.page).toBe('bot-flows-list');
    expect(result.current.tab).toBe('active');
    expect(result.current.manageIndustries).toBe(false);

    act(() => result.current.openFlow('new'));
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

  it('opens a ticket, and reopens the first one when Tickets is picked again', () => {
    const { result } = setup();
    expect(result.current.ticketId).toBe('t-1');
    act(() => result.current.openTicket('t-6'));
    expect(result.current.ticketId).toBe('t-6');
    expect(location.hash).toBe('#/helpdesk/tickets?ticket=t-6');
    act(() => result.current.select('tickets'));
    expect(result.current.ticketId).toBe('t-1');
  });

  it('keeps every caller on the same Screen when one of them navigates', () => {
    const app = setup();
    const screen = setup();
    act(() => screen.result.current.openTicket('t-6'));
    expect(app.result.current.ticketId).toBe('t-6');
    act(() => app.result.current.switchProduct('marketing'));
    expect(screen.result.current.product).toBe('marketing');
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
      ['#/helpdesk/settings?tab=agents', { page: 'settings', tab: 'agents' }],
      ['#/automation/settings?tab=bot-templates&industries=1', { page: 'settings', manageIndustries: true }],
      ['#/helpdesk/settings?tab=hd-integration&integration=freshdesk', { page: 'settings', integration: 'freshdesk' }],
      ['#/helpdesk/settings?tab=billing&plans=1', { page: 'settings', tab: 'billing', changePlan: true }],
      ['#/helpdesk/settings?inbox=36000', { page: 'settings', tab: 'inboxes', inbox: '36000' }],
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
      act(() => result.current.openFlow('new'));
      expect(location.hash).toBe('#/marketing/broadcast?view=canvas&flow=new');
      act(() => result.current.leaveCanvas());
      expect(location.hash).toBe('#/marketing/broadcast');
      act(() => result.current.openUserSettings('account'));
      expect(location.hash).toBe('#/marketing/broadcast?user=account');
      act(() => result.current.setUserSettingsTab('profile'));
      expect(location.hash).toBe('#/marketing/broadcast?user=profile');
      expect(history.length).toBe(before + 4);
    });

    it.each([
      ['#/marketing/broadcast?tab=draft', 'draft'],
      ['#/marketing/automation-flows?tab=inactive', 'inactive'],
      ['#/automation/flows?tab=inactive', 'inactive'],
      ['#/marketing/segments?tab=imported', 'imported'],
      ['#/helpdesk/templates?tab=sms', 'sms'],
      ['#/automation/knowledge-base?tab=manage', 'manage'],
    ])('restores the List tab in %s', (hash, tab) => {
      history.replaceState(null, '', hash);
      const { result } = setup();
      expect(result.current.tab).toBe(tab);
      expect(location.hash).toBe(hash);
    });

    it.each([
      ['#/marketing/broadcast?tab=nope', '#/marketing/broadcast', 'triggered'],
      ['#/marketing/broadcast?tab=inactive', '#/marketing/broadcast', 'triggered'],
      ['#/marketing/home?tab=draft', '#/marketing/home', ''],
    ])('falls back from %s to the default List tab', (hash, corrected, tab) => {
      history.replaceState(null, '', hash);
      const { result } = setup();
      expect(result.current.tab).toBe(tab);
      expect(location.hash).toBe(corrected);
    });

    it('writes the List tab to the hash, leaving the default out, and keeps it across the editor', () => {
      history.replaceState(null, '', '#/marketing/broadcast');
      const { result } = setup();
      act(() => result.current.setTab('draft'));
      expect(location.hash).toBe('#/marketing/broadcast?tab=draft');
      act(() => result.current.openFlow('new'));
      act(() => result.current.leaveCanvas());
      expect(result.current.tab).toBe('draft');
      act(() => result.current.setTab('triggered'));
      expect(location.hash).toBe('#/marketing/broadcast');
    });

    it("opens a flow in the editor, leaving the List tab's first row out of the URL", () => {
      history.replaceState(null, '', '#/marketing/broadcast');
      const { result } = setup();
      act(() => result.current.openFlow('b-3'));
      expect(location.hash).toBe('#/marketing/broadcast?view=canvas&flow=b-3');
      expect(result.current).toMatchObject({ page: 'broadcast-canvas', flowKind: 'broadcast', flowId: 'b-3' });
      act(() => result.current.openFlow('b-1'));
      expect(location.hash).toBe('#/marketing/broadcast?view=canvas');
      act(() => result.current.leaveCanvas());
      expect(location.hash).toBe('#/marketing/broadcast');
      expect(result.current.flowId).toBe('');
    });

    it.each([
      ['#/marketing/broadcast?view=canvas', '#/marketing/broadcast?view=canvas', 'b-1'],
      ['#/marketing/broadcast?view=canvas&tab=draft', '#/marketing/broadcast?view=canvas&tab=draft', 'd-1'],
      ['#/marketing/broadcast?view=canvas&flow=nope', '#/marketing/broadcast?view=canvas', 'b-1'],
      ['#/marketing/broadcast?view=canvas&flow=f-1', '#/marketing/broadcast?view=canvas', 'b-1'],
      ['#/marketing/automation-flows?view=canvas&flow=new', '#/marketing/automation-flows?view=canvas&flow=new', 'new'],
      ['#/marketing/broadcast?flow=b-3', '#/marketing/broadcast', ''],
    ])('reads %s as flow %s', (hash, corrected, flowId) => {
      history.replaceState(null, '', hash);
      const { result } = setup();
      expect(result.current.flowId).toBe(flowId);
      expect(location.hash).toBe(corrected);
    });

    it('writes settings tab and manage industries to the hash', () => {
      history.replaceState(null, '', '#/automation/settings');
      const { result } = setup();
      const before = history.length;
      act(() => result.current.setTab('bot-templates'));
      expect(location.hash).toBe('#/automation/settings?tab=bot-templates');
      act(() => result.current.setManageIndustries(true));
      expect(location.hash).toBe('#/automation/settings?tab=bot-templates&industries=1');
      act(() => result.current.setManageIndustries(false));
      act(() => result.current.setTab('inboxes'));
      expect(location.hash).toBe('#/automation/settings');
      expect(history.length).toBe(before + 4);
    });

    it.each(['inboxes', 'bot-templates'])('picking the %s tab closes Manage industries in one entry', (tab) => {
      history.replaceState(null, '', '#/automation/settings?tab=bot-templates&industries=1');
      const { result } = setup();
      const before = history.length;
      act(() => result.current.setTab(tab));
      expect(location.hash).toBe(tab === 'inboxes' ? '#/automation/settings' : '#/automation/settings?tab=bot-templates');
      expect(result.current.manageIndustries).toBe(false);
      expect(result.current.tab).toBe(tab);
      expect(history.length).toBe(before + 1);
    });

    it('opens Change plan from Billing and closes it on picking a tab', () => {
      history.replaceState(null, '', '#/helpdesk/settings?tab=billing');
      const { result } = setup();
      act(() => result.current.setChangePlan(true));
      expect(location.hash).toBe('#/helpdesk/settings?tab=billing&plans=1');
      act(() => result.current.setTab('billing'));
      expect(location.hash).toBe('#/helpdesk/settings?tab=billing');
      expect(result.current.changePlan).toBe(false);
    });

    it('composes back-to-back changes made in one handler', () => {
      history.replaceState(null, '', '#/automation/settings?tab=bot-templates&industries=1');
      const { result } = setup();
      act(() => {
        result.current.setManageIndustries(false);
        result.current.setTab('inboxes');
      });
      expect(location.hash).toBe('#/automation/settings');
      expect(result.current.manageIndustries).toBe(false);
      expect(result.current.tab).toBe('inboxes');
    });

    it('follows Back and Forward across sub-view changes', () => {
      history.replaceState(null, '', '#/helpdesk/settings');
      const { result } = setup();
      go('#/helpdesk/settings?tab=teams');
      expect(result.current.tab).toBe('teams');
      go('#/helpdesk/settings');
      expect(result.current.tab).toBe('inboxes');
      go('#/automation/flows?view=canvas');
      expect(result.current.page).toBe('bot-flows-canvas');
      go('#/automation/flows');
      expect(result.current.page).toBe('bot-flows-list');
    });

    it('drops unknown parameters when navigating', () => {
      history.replaceState(null, '', '#/marketing/broadcast?comment=12');
      const { result } = setup();
      act(() => result.current.openFlow('new'));
      expect(location.hash).toBe('#/marketing/broadcast?view=canvas&flow=new');
    });

    it.each([
      ['#/marketing/segments?view=canvas', '#/marketing/segments', { page: 'segments' }],
      ['#/marketing/broadcast?view=nope', '#/marketing/broadcast', { page: 'broadcast-list' }],
      ['#/helpdesk/settings?tab=nope', '#/helpdesk/settings', { tab: 'inboxes' }],
      ['#/marketing/settings?tab=agents', '#/marketing/settings', { tab: 'inboxes' }],
      ['#/helpdesk/tickets?tab=agents', '#/helpdesk/tickets', { page: 'tickets' }],
      ['#/automation/settings?industries=1', '#/automation/settings', { manageIndustries: false }],
      ['#/automation/settings?tab=bot-templates&industries=yes', '#/automation/settings?tab=bot-templates', { manageIndustries: false }],
      ['#/helpdesk/settings?integration=freshdesk', '#/helpdesk/settings', { integration: '' }],
      ['#/helpdesk/settings?tab=hd-integration&integration=constructor', '#/helpdesk/settings?tab=hd-integration', { integration: '' }],
      ['#/helpdesk/settings?inbox=nope', '#/helpdesk/settings', { inbox: '' }],
      ['#/helpdesk/settings?tab=agents&inbox=36000', '#/helpdesk/settings?tab=agents', { inbox: '' }],
      ['#/helpdesk/tickets?user=admin', '#/helpdesk/tickets', { page: 'tickets' }],
      ['#/helpdesk/settings?tab=agents&plans=1', '#/helpdesk/settings?tab=agents', { changePlan: false }],
      ['#/helpdesk/settings?tab=billing&plans=yes', '#/helpdesk/settings?tab=billing', { changePlan: false }],
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
