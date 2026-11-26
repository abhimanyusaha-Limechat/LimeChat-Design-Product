import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BotSettings, DEFAULT_BOT_SETTINGS, unsavedChanges, type BotSettingsValues } from './BotSettings';
import { fromDom, toHtml } from './RichTextField';

// Stands in for SettingsScreen: it owns the values and the last saved copy.
function Harness({ initial = DEFAULT_BOT_SETTINGS }: { initial?: BotSettingsValues }) {
  const [values, setValues] = useState(initial);
  return <BotSettings values={values} savedValues={initial} onChange={setValues} />;
}

const tab = (name: string) => screen.getByRole('tab', { name });

describe('BotSettings tabs', () => {
  it('opens on Bot behaviour with the AI decision making card and the required flow unset', () => {
    render(<Harness />);
    expect(tab('Bot behaviour')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('switch', { name: 'AI decision making' })).toBeChecked();
    expect(screen.getByText('Controls this tab')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'When no flow matches' })).toHaveValue('');
    expect(screen.getByText(/Required\. Nothing is set/)).toBeInTheDocument();
  });

  it('shows each section from its tab', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(tab('Messaging'));
    expect(screen.getByRole('switch', { name: 'Rewrite messages in a warmer tone' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Holding message when replies run slow' })).toBeChecked();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Up to 120 characters.')).toBeInTheDocument();

    await user.click(tab('Channels & input'));
    expect(screen.getByRole('combobox', { name: 'Transcription model' })).toHaveValue('deepgram');

    await user.click(tab('CSAT'));
    expect(screen.getByRole('combobox', { name: 'Survey rating scale' })).toHaveValue('5');

    await user.click(tab('Advanced'));
    expect(screen.getByRole('switch', { name: 'Use fast model for all AI steps' })).not.toBeChecked();
    expect(screen.getByRole('switch', { name: 'Message execution logs' })).toBeChecked();

    await user.click(tab('Product cards'));
    expect(screen.getByRole('heading', { name: 'Product cards' })).toBeInTheDocument();
  });

  it('keeps the reminder rows off until the reminder is turned on', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const flow = screen.getByRole('combobox', { name: 'Reminder flow' });
    const after = screen.getByRole('spinbutton', { name: 'Send after' });
    expect(flow).toBeDisabled();
    expect(after).toBeDisabled();
    expect(screen.getByText('Available once the reminder is turned on.')).toBeInTheDocument();

    await user.click(screen.getByRole('switch', { name: 'Reminder when a customer goes quiet' }));
    expect(flow).toBeEnabled();
    expect(after).toBeEnabled();
    expect(after).toHaveValue(300);
    expect(screen.queryByText('Available once the reminder is turned on.')).not.toBeInTheDocument();
  });

  it('greys the AI-dependent rows when AI decision making is off', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('switch', { name: 'AI decision making' }));
    expect(screen.getByRole('switch', { name: 'Reminder when a customer goes quiet' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'What the bot says when it switches topic' })).toHaveAttribute('aria-disabled', 'true');
    // The flow fallback stays live: it is what runs without AI.
    expect(screen.getByRole('combobox', { name: 'When no flow matches' })).toBeEnabled();

    await user.click(tab('Messaging'));
    expect(screen.getByRole('switch', { name: 'Rewrite messages in a warmer tone' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'Holding message when replies run slow' })).toBeEnabled();
  });

  it('clamps the holding delay to its range on blur', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(tab('Messaging'));
    const after = screen.getByRole('spinbutton', { name: 'Send after' });
    fireEvent.change(after, { target: { value: '99' } });
    expect(after).toHaveValue(99);
    fireEvent.blur(after);
    expect(after).toHaveValue(60);
    await user.click(screen.getByRole('button', { name: 'Decrease Send after' }));
    expect(after).toHaveValue(59);
  });

  it('dots a tab once one of its settings changes', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.queryByTestId('segtab-dot')).not.toBeInTheDocument();

    await user.click(tab('Advanced'));
    await user.click(screen.getByRole('switch', { name: 'Use fast model for all AI steps' }));
    expect(within(tab('Advanced')).getByTestId('segtab-dot')).toBeInTheDocument();
    expect(within(tab('Messaging')).queryByTestId('segtab-dot')).not.toBeInTheDocument();

    await user.click(tab('Messaging'));
    await user.click(screen.getByRole('switch', { name: 'Keep button labels in the original language' }));
    expect(within(tab('Messaging')).getByTestId('segtab-dot')).toBeInTheDocument();
    expect(within(tab('Advanced')).getByTestId('segtab-dot')).toBeInTheDocument();
  });
});

describe('Search all settings', () => {
  const searchBox = () => screen.getByRole('searchbox', { name: 'Search all settings' });
  // While searching, a tab's name carries its match count ("Messaging1"), so match by prefix.
  const tabNamed = (label: string) => screen.getByRole('tab', { name: new RegExp(`^${label}`) });

  it('narrows the open tab to its matching rows and counts matches on every tab', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(searchBox(), 'send after');

    expect(screen.getByRole('status')).toHaveTextContent('1 setting matches "send after" in Bot behaviour');
    // The matching child row, with its parent switch row kept, and nothing else.
    expect(screen.getByRole('spinbutton', { name: 'Send after' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Reminder when a customer goes quiet' })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Reminder flow' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'When no flow matches' })).not.toBeInTheDocument();
    expect(screen.queryByText('Controls this tab')).not.toBeInTheDocument();
    // Tabs say where the other match is.
    expect(within(tabNamed('Bot behaviour')).getByText('1')).toBeInTheDocument();
    expect(within(tabNamed('Messaging')).getByText('1')).toBeInTheDocument();
    expect(within(tabNamed('Advanced')).queryByText(/\d/)).not.toBeInTheDocument();
  });

  it('points at the tabs with matches when the open one has none, and keeps the search across tabs', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(searchBox(), 'voice notes');
    expect(screen.getByRole('status')).toHaveTextContent('No matches in Bot behaviour');

    await user.click(screen.getByRole('button', { name: 'Channels & input (2)' }));
    expect(tabNamed('Channels & input')).toHaveAttribute('aria-selected', 'true');
    expect(searchBox()).toHaveValue('voice notes');
    // A matching parent row keeps its child rows.
    expect(screen.getByRole('switch', { name: 'Voice transcription' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Transcription model' })).toBeInTheDocument();
    expect(screen.queryByRole('switch', { name: 'Use a custom email summary prompt' })).not.toBeInTheDocument();
  });

  it('says when nothing matches, and clears on Escape or the clear button', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
    await user.type(searchBox(), 'zzz');
    expect(screen.getByRole('status')).toHaveTextContent('No settings match "zzz"');
    expect(screen.queryByRole('switch', { name: 'AI decision making' })).not.toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(searchBox()).toHaveValue('');
    expect(screen.getByRole('switch', { name: 'AI decision making' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    // A tab's name matches its settings too, so "csat" finds the survey scale.
    await user.type(searchBox(), 'csat');
    expect(screen.getByRole('status')).toHaveTextContent('No matches in Bot behaviour');
    expect(screen.getByRole('button', { name: 'CSAT (1)' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(searchBox()).toHaveValue('');
    expect(searchBox()).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });
});

describe('unsavedChanges', () => {
  it('counts settings and lists their tabs in tab order', () => {
    const saved = DEFAULT_BOT_SETTINGS;
    expect(unsavedChanges(saved, saved)).toEqual({ count: 0, sections: [] });
    expect(unsavedChanges({ ...saved, fastModel: true, surveyRatingScale: '3', reminderEnabled: true }, saved)).toEqual({
      count: 3,
      sections: ['bot-behaviour', 'csat', 'advanced'],
    });
  });
});

describe('RichTextField', () => {
  it('draws merge fields as tokens and reads them back', () => {
    const html = toHtml('Hi {{customer.first_name}}, <b>welcome</b>');
    expect(html).toContain('data-token="customer.first_name"');
    expect(html).toContain('&lt;b&gt;welcome&lt;/b&gt;');
    const body = document.createElement('div');
    body.innerHTML = html;
    expect(fromDom(body)).toBe('Hi {{customer.first_name}}, <b>welcome</b>');
  });

  it('shows the holding message with its token, and inserts one from the toolbar', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(tab('Messaging'));
    const editor = screen.getByRole('textbox', { name: 'Holding message' });
    expect(within(editor).getByText('customer.first_name')).toBeInTheDocument();
    expect(editor).toHaveTextContent(/This is taking a little longer than usual/);

    const company = screen.getByRole('textbox', { name: 'Company instructions' });
    expect(company).toHaveAttribute('data-placeholder', 'Nothing set. The built-in default is used.');
    const companyToolbar = screen.getByRole('toolbar', { name: 'Company instructions formatting' });
    await user.click(within(companyToolbar).getByRole('button', { name: 'Insert variable' }));
    expect(within(company).getByText('customer.first_name')).toBeInTheDocument();
  });
});
