/**
 * The Widget tab of a website widget inbox: the widget's basic settings, AI thinking
 * states and AI disclosure. The per-device launcher and Pop-up Message sections below
 * them are shared with the WhatsApp widget. Bot name, font, colour and the input
 * elements live in `widgetGeneral` / `widgetAppearance`; the rest is `InboxWebsiteWidget`.
 */
import { NativeSelect } from '../Select';
import { Tooltip } from '../Tooltip';
import { MediaPicker, type MediaFile } from './MediaPicker';
import { PrimaryColourRow, type InboxWidgetAppearance } from './InboxWidgetAppearanceSection';
import type { InboxWidgetGeneral } from './InboxWidgetGeneralSection';
import { Row, SectionHeading, SwitchRow, TextRow } from './InboxSettingsSections';

export interface InboxWebsiteWidget {
  enabled: boolean;
  widgetAvatar: MediaFile | null;
  botAvatar: MediaFile | null;
  replyTime: string;
  offlineStatus: string;
  /** Append the visitor's active page URL to their message. */
  utm: boolean;
  /** Reveal AI messages word by word. */
  aiStreaming: boolean;
  /** Hide the avatars of online agents in the widget header. */
  hideAgentStatus: boolean;
  /** Remove the "Powered by LimeChat" line. */
  hideBranding: boolean;
  /** The new widget layout with a homepage and quick actions. */
  homepage: boolean;
  disableThinkingStates: boolean;
  customThinkingStates: boolean;
  /** Tell visitors under the chat input that they are talking to AI. */
  aiNotice: boolean;
}

const FONTS = ['Lato', 'Inter', 'Roboto', 'Open Sans', 'Poppins'];
const REPLY_TIMES = ['In A Few Minutes', 'In An Hour', 'In A Few Hours', 'In A Day'];
const OFFLINE_STATUSES = ['Disable', 'Enable'];
const YES_NO = ['No', 'Yes'];

const ELEMENTS = [
  { key: 'filePicker', label: 'Display file picker on the widget', help: 'Lets customers attach files to their messages.' },
  { key: 'emojiPicker', label: 'Display emoji picker on the widget', help: 'Lets customers add emojis to their messages.' },
] as const;

function SelectRow({ label, description, data, value, off, onChange }: { label: string; description: string; data: string[]; value: string; off: boolean; onChange: (next: string) => void }) {
  return (
    <Row label={label} description={description} off={off}>
      <NativeSelect size="sm" fullWidth aria-label={label} data={data} disabled={off} value={value} onChange={(e) => onChange(e.currentTarget.value)} />
    </Row>
  );
}

export function WebsiteWidgetSection({
  value,
  general,
  appearance,
  onChange,
  onGeneralChange,
  onAppearanceChange,
}: {
  value: InboxWebsiteWidget;
  general: InboxWidgetGeneral;
  appearance: InboxWidgetAppearance;
  onChange: (next: InboxWebsiteWidget) => void;
  onGeneralChange: (next: InboxWidgetGeneral) => void;
  onAppearanceChange: (next: InboxWidgetAppearance) => void;
}) {
  const set = (patch: Partial<InboxWebsiteWidget>) => onChange({ ...value, ...patch });
  const setGeneral = (patch: Partial<InboxWidgetGeneral>) => onGeneralChange({ ...general, ...patch });
  const off = !value.enabled;
  return (
    <section className="lc-inbs__group" aria-label="Website Widget">
      <SectionHeading
        title="Website Widget"
        description="Configure the basic settings for your website widget."
        toggle={{ checked: value.enabled, onChange: (enabled) => set({ enabled }) }}
      />
      <div className="lc-inbs__table">
        <TextRow
          label="Widget Bot Name"
          description="The name customers see on the bot's messages."
          placeholder="Bot"
          value={general.botName}
          off={off}
          onChange={(botName) => setGeneral({ botName })}
        />
        <SelectRow label="Widget Font" description="The typeface used inside the widget." data={FONTS} value={appearance.font} off={off} onChange={(v) => onAppearanceChange({ ...appearance, font: v })} />
        <PrimaryColourRow value={appearance} onChange={onAppearanceChange} off={off} />
        <Row label="Widget Avatar" description="PNG, JPG, WebP or SVG, up to 1 MB." off={off}>
          <MediaPicker label="widget avatar" placeholder="Widget Avatar" kind="image" maxMb={1} value={value.widgetAvatar} off={off} onChange={(widgetAvatar) => set({ widgetAvatar })} />
        </Row>
        <Row label="Bot Avatar" description="PNG, JPG, WebP or SVG, up to 1 MB." off={off}>
          <MediaPicker label="bot avatar" placeholder="Bot Avatar" kind="image" maxMb={1} value={value.botAvatar} off={off} onChange={(botAvatar) => set({ botAvatar })} />
        </Row>
        <SelectRow label="Set Reply time" description="How soon customers are told to expect a reply." data={REPLY_TIMES} value={value.replyTime} off={off} onChange={(v) => set({ replyTime: v })} />
        <SelectRow label="Agent offline status" description="What the widget shows when no agent is online." data={OFFLINE_STATUSES} value={value.offlineStatus} off={off} onChange={(v) => set({ offlineStatus: v })} />
        <SelectRow label="Show unread messages and count when widget is closed" description="Shows the latest unread message and a count beside the launcher." data={YES_NO} value={general.showUnread ? 'Yes' : 'No'} off={off} onChange={(v) => setGeneral({ showUnread: v === 'Yes' })} />
        <Row label="Input field elements" description="Choose what appears in the widget's message box." off={off}>
          <div className="lc-inbs__checks lc-inbs__checks--stack" role="group" aria-label="Input field elements">
            {ELEMENTS.map(({ key, label, help }) => (
              <label key={key} className="lc-inbs__radio">
                <input type="checkbox" checked={general[key]} disabled={off} onChange={(e) => setGeneral({ [key]: e.currentTarget.checked })} />
                {label}
                <Tooltip label={help} position="top">
                  <span className="lc-inbs__help" tabIndex={0} role="img" aria-label={help}>?</span>
                </Tooltip>
              </label>
            ))}
          </div>
        </Row>
        <SwitchRow label="Enable UTM for Widget" description="Append active page URL to the message." checked={value.utm} off={off} onChange={(utm) => set({ utm })} />
        <SwitchRow label="AI streaming" description="Reveal agent messages word by word, as if they're being written live." checked={value.aiStreaming} off={off} onChange={(aiStreaming) => set({ aiStreaming })} />
        <SwitchRow
          label="Hide agent online status"
          description="Stop showing the avatars of online agents in the widget header. Customers won't see who on your team is available."
          checked={value.hideAgentStatus}
          off={off}
          onChange={(hideAgentStatus) => set({ hideAgentStatus })}
        />
        <SwitchRow label="Hide branding" description={'Remove the "Powered by LimeChat" line from the bottom of the widget.'} checked={value.hideBranding} off={off} onChange={(hideBranding) => set({ hideBranding })} />
        <SwitchRow label="Widget with Homepage" description="Switch to the new widget layout with homepage and quick actions." checked={value.homepage} off={off} onChange={(homepage) => set({ homepage })} />
      </div>
    </section>
  );
}

export function WebsiteWidgetAiSections({ value, onChange }: { value: InboxWebsiteWidget; onChange: (next: InboxWebsiteWidget) => void }) {
  const set = (patch: Partial<InboxWebsiteWidget>) => onChange({ ...value, ...patch });
  return (
    <>
      <section className="lc-inbs__group" aria-label="AI thinking states">
        <SectionHeading title="AI thinking states" description="Phrases shown while the AI prepares a reply." />
        <div className="lc-inbs__table">
          <SwitchRow
            label="Disable thinking states"
            description="Only show the typing state while an agent is typing."
            checked={value.disableThinkingStates}
            onChange={(disableThinkingStates) => set({ disableThinkingStates })}
          />
          <SwitchRow
            label="Custom thinking states"
            description="Set your own thinking states and timing to match your needs."
            checked={value.customThinkingStates}
            onChange={(customThinkingStates) => set({ customThinkingStates })}
          />
        </div>
      </section>
      <section className="lc-inbs__group" aria-label="AI disclosure">
        <SectionHeading title="AI disclosure" description="Tell visitors they are chatting with AI and should verify its answers." />
        <div className="lc-inbs__table">
          <SwitchRow
            label="Show AI notice below the chat input"
            description="Shows a short note under the message box."
            checked={value.aiNotice}
            onChange={(aiNotice) => set({ aiNotice })}
          />
        </div>
      </section>
    </>
  );
}
