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

  it('shows user settings over any page and closes them on navigation', () => {
    const { result } = setup();
    act(() => result.current.openUserSettings('profile'));
    expect(result.current.page).toBe('user-settings');
    expect(result.current.userSettingsTab).toBe('profile');
    act(() => result.current.select('tickets'));
    expect(result.current.page).toBe('tickets');
  });
});
