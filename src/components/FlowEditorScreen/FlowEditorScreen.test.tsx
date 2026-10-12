import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it } from 'vitest';
import { FlowEditorScreen } from './FlowEditorScreen';
import { editorSetup, findFlow } from './editorSetup';

// jsdom has no ResizeObserver; the canvas only uses it to re-measure.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('editorSetup', () => {
  it.each([
    ['new broadcast', 'broadcast', 'new', { badge: { label: 'Draft' }, active: false, publish: 'confirm', marketing: { omitActions: ['reports', 'save'], canTest: true, broadcastMeta: { readOnly: false } } }],
    ['sending broadcast', 'broadcast', 'b-1', { badge: { label: 'Sending' }, marketing: { omitActions: ['save', 'publish'], canTest: false, simpleReport: true, broadcastMeta: { readOnly: true } } }],
    ['completed broadcast', 'broadcast', 'b-2', { badge: { label: 'Completed' }, marketing: { omitActions: ['save', 'publish'], canTest: false, broadcastMeta: { readOnly: true } } }],
    ['scheduled broadcast', 'broadcast', 's-1', { badge: { label: 'Scheduled', tone: 'warning' }, marketing: { omitActions: ['reports', 'save'], canTest: true } }],
    ['new flow', 'flows', 'new', { badge: { label: 'Draft' }, active: false, publish: 'form', marketing: { omitActions: ['reports'], saveLabel: undefined, canTest: false } }],
    ['active flow', 'flows', 'f-1', { badge: { label: 'Active' }, active: true, marketing: { simpleReport: true, saveLabel: 'Draft', omitActions: undefined } }],
    ['new bot flow', 'bot-flows', 'new', { badge: { label: 'Inactive' }, active: false, publish: 'instant' }],
  ] as const)('%s', (_, kind, id, expected) => {
    expect(editorSetup(findFlow(kind, id))).toMatchObject(expected);
  });

  it('gives Bot flows the automation canvas', () => {
    expect(editorSetup(findFlow('bot-flows', 'bf-1')).marketing).toBeUndefined();
  });

  it('names new flows and leaves them, like drafts, without an ID', () => {
    expect(findFlow('broadcast', 'new').name).toBe('Untitled broadcast');
    expect(findFlow('flows', 'new').name).toBe('Untitled flow');
    expect(findFlow('broadcast', 'new').displayId).toBeUndefined();
    expect(findFlow('broadcast', 'd-1').displayId).toBeUndefined();
    expect(findFlow('broadcast', 'b-1').displayId).toBe('40000');
  });
});

describe('FlowEditorScreen', () => {
  const go = (hash: string) =>
    act(() => {
      history.pushState(null, '', hash);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

  it('opens "+ Broadcast" as an editable Draft even after a Completed one', () => {
    history.replaceState(null, '', '#/marketing/broadcast?view=canvas&flow=b-2');
    render(<FlowEditorScreen />);
    expect(screen.queryByRole('button', { name: 'Publish' })).not.toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();

    go('#/marketing/broadcast?view=canvas&flow=new');
    expect(screen.getByText('Untitled broadcast')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Test' })).toBeInTheDocument();
  });

  it('keeps a Flow details rename until another flow opens', async () => {
    const user = userEvent.setup();
    history.replaceState(null, '', '#/marketing/automation-flows?view=canvas&flow=f-1');
    render(<FlowEditorScreen />);
    const original = findFlow('flows', 'f-1').name;
    await user.click(screen.getByRole('button', { name: 'Rename flow' }));
    const name = await screen.findByRole('textbox', { name: /Flow name/ });
    await user.clear(name);
    await user.type(name, 'Renamed flow');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByText('Renamed flow')).toBeInTheDocument();

    go('#/marketing/automation-flows?view=canvas&flow=f-2');
    go('#/marketing/automation-flows?view=canvas&flow=f-1');
    expect(screen.getByText(original)).toBeInTheDocument();
    expect(screen.queryByText('Renamed flow')).not.toBeInTheDocument();
  });
});
