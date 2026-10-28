/**
 * The widget editor's General tab: the bot's name, the inbox it feeds, which input
 * elements the widget shows, and whether it shows unread messages while closed.
 */
import { Tooltip } from '../Tooltip';
import { NativeSelect } from '../Select';
import { Row, SectionHeading, SwitchRow, TextRow } from './InboxSettingsSections';

export interface InboxWidgetGeneral {
  botName: string;
  inbox: string;
  filePicker: boolean;
  emojiPicker: boolean;
  restartButton: boolean;
  /** Show the unread message and count on the launcher while the widget is closed. */
  showUnread: boolean;
}

const INBOXES = ['Website widget', 'Support widget', 'Sales widget'];

const ELEMENTS: { key: 'filePicker' | 'emojiPicker' | 'restartButton'; label: string; help: string }[] = [
  { key: 'filePicker', label: 'Display File Picker on the Widget', help: 'Lets customers attach files to their messages.' },
  { key: 'emojiPicker', label: 'Display Emoji Picker on the Widget', help: 'Lets customers add emojis to their messages.' },
  { key: 'restartButton', label: 'Display Restart Button on the Widget', help: 'Lets customers start a fresh conversation with the bot.' },
];

export function WidgetGeneralSection({
  value,
  onChange,
}: {
  value: InboxWidgetGeneral;
  onChange: (next: InboxWidgetGeneral) => void;
}) {
  const set = (patch: Partial<InboxWidgetGeneral>) => onChange({ ...value, ...patch });
  return (
    <section className="lc-inbs__group" aria-label="Widget details">
      <SectionHeading title="Widget details" description="The bot customers chat with, and what the widget's input area offers." />
      <div className="lc-inbs__table">
        <TextRow
          label="Website Widget Bot Name"
          description="The name customers see on the bot's messages."
          placeholder="Bot101"
          value={value.botName}
          onChange={(botName) => set({ botName })}
        />
        <Row label="Inbox" description="Conversations from this widget land in this inbox.">
          <NativeSelect
            size="sm"
            fullWidth
            aria-label="Inbox"
            data={INBOXES}
            value={value.inbox}
            onChange={(e) => set({ inbox: e.currentTarget.value })}
          />
        </Row>
        <Row label="Input Field elements to enable" description="Choose what appears in the widget's message box.">
          <div className="lc-inbs__checks lc-inbs__checks--stack" role="group" aria-label="Input Field elements to enable">
            {ELEMENTS.map(({ key, label, help }) => (
              <label key={key} className="lc-inbs__radio">
                <input type="checkbox" checked={value[key]} onChange={(e) => set({ [key]: e.currentTarget.checked })} />
                {label}
                <Tooltip label={help} position="top">
                  <span className="lc-inbs__help" tabIndex={0} role="img" aria-label={help}>?</span>
                </Tooltip>
              </label>
            ))}
          </div>
        </Row>
        <SwitchRow
          label="Show unread messages and count when widget is closed"
          description="Shows the latest unread message and a count beside the launcher."
          checked={value.showUnread}
          onChange={(showUnread) => set({ showUnread })}
        />
      </div>
    </section>
  );
}
