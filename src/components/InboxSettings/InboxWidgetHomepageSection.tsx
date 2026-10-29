/**
 * The widget editor's Homescreen tab, Homepage section: the first screen a customer sees
 * when opening the widget. A welcome heading and tagline, the inboxes offered as channels,
 * up to three custom link buttons, and whether to show the agents' offline status.
 * Three sections, each following the Waiting reminder pattern: a heading (with its own switch
 * for the two lists), dimming rows, and an Add button below.
 */
import { Button } from '../Button';
import { Icon } from '../icons';
import { NativeSelect } from '../Select';
import { MediaPicker, type MediaFile } from './MediaPicker';
import { SectionHeading, SwitchRow, TextRow } from './InboxSettingsSections';

export interface HomepageButton {
  name: string;
  subheading: string;
  link: string;
  icon: MediaFile | null;
}

export interface InboxWidgetHomepage {
  heading: string;
  tagline: string;
  multiChannel: boolean;
  /** Names of the inboxes shown on the homescreen, in order. */
  inboxes: string[];
  customButtons: boolean;
  buttons: HomepageButton[];
  agentOfflineStatus: boolean;
}

const MAX_INBOXES = 4;
const MAX_BUTTONS = 3;
const INBOX_OPTIONS = ['Whatsapp_Customer_support', 'Email_Customer_support', 'Instagram_Customer_support', 'Facebook_Customer_support'];

export function WidgetHomepageSection({
  value,
  onChange,
}: {
  value: InboxWidgetHomepage;
  onChange: (next: InboxWidgetHomepage) => void;
}) {
  const set = (patch: Partial<InboxWidgetHomepage>) => onChange({ ...value, ...patch });
  const setButton = (index: number, patch: Partial<HomepageButton>) =>
    set({ buttons: value.buttons.map((b, i) => (i === index ? { ...b, ...patch } : b)) });
  const nextInbox = INBOX_OPTIONS.find((name) => !value.inboxes.includes(name));
  const inboxesOff = !value.multiChannel;
  const buttonsOff = !value.customButtons;
  return (
    <>
      <section className="lc-inbs__group" aria-label="Homepage">
        <SectionHeading title="Homepage" description="This is the first screen a customer will see when they click on the Website widget." />
        <div className="lc-inbs__table">
          <TextRow
            label="Welcome heading"
            description="The large greeting at the top of the widget."
            placeholder="Hello & Welcome"
            value={value.heading}
            onChange={(heading) => set({ heading })}
          />
          <TextRow
            label="Welcome Tagline"
            description="A short line under the heading."
            placeholder="Our team is available to assist you round the clock"
            value={value.tagline}
            onChange={(tagline) => set({ tagline })}
          />
          <SwitchRow
            label="Agent offline Status"
            description="Show customers when no agent is online."
            checked={value.agentOfflineStatus}
            onChange={(agentOfflineStatus) => set({ agentOfflineStatus })}
          />
        </div>
      </section>

      <section className="lc-inbs__group" aria-label="Multi-Channel support">
        <SectionHeading
          title="Multi-Channel support"
          description={`Select which inboxes to display on the Homescreen, up to ${MAX_INBOXES}.`}
          toggle={{ checked: value.multiChannel, onChange: (multiChannel) => set({ multiChannel }) }}
        />
        <div className="lc-inbs__table">
          {value.inboxes.length === 0 && (
            <p className="lc-inbs__row lc-inbs__row-desc" data-disabled={inboxesOff}>No inboxes yet.</p>
          )}
          {value.inboxes.map((inbox, i) => (
            <div key={inbox} className="lc-inbs__row" data-disabled={inboxesOff} role="group" aria-label={`Inbox ${i + 1}`}>
              <span className="lc-inbs__label">Inbox {i + 1}</span>
              <div className="lc-inbs__inline-control">
                <NativeSelect
                  size="sm"
                  fullWidth
                  aria-label={`Inbox ${i + 1}`}
                  data={INBOX_OPTIONS.filter((o) => o === inbox || !value.inboxes.includes(o))}
                  value={inbox}
                  disabled={inboxesOff}
                  onChange={(e) => set({ inboxes: value.inboxes.map((n, j) => (j === i ? e.currentTarget.value : n)) })}
                />
                <Button
                  variant="outline"
                  color="red"
                  size="xs"
                  className="lc-inbs__icon-btn"
                  leftSection={<Icon name="trash" size={14} />}
                  disabled={inboxesOff}
                  aria-label={`Remove inbox ${i + 1}`}
                  title="Remove inbox"
                  onClick={() => set({ inboxes: value.inboxes.filter((_, j) => j !== i) })}
                />
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="lc-inbs__add-reminder"
          leftSection={<Icon name="plus" />}
          disabled={inboxesOff || value.inboxes.length >= MAX_INBOXES || !nextInbox}
          onClick={() => nextInbox && set({ inboxes: [...value.inboxes, nextInbox] })}
        >
          Add inbox
        </Button>
      </section>

      <section className="lc-inbs__group" aria-label="Custom buttons">
        <SectionHeading
          title="Custom buttons"
          description={`Add links that redirect the user, up to ${MAX_BUTTONS} buttons on the Homescreen.`}
          toggle={{ checked: value.customButtons, onChange: (customButtons) => set({ customButtons }) }}
        />
        <div className="lc-inbs__table">
          {value.buttons.length === 0 && (
            <p className="lc-inbs__row lc-inbs__row-desc" data-disabled={buttonsOff}>No buttons yet.</p>
          )}
          {value.buttons.map((button, i) => (
            // Buttons have no identity beyond their position; deleting renumbers the rest.
            <div key={i} className="lc-inbs__row lc-inbs__row--stacked" data-disabled={buttonsOff} role="group" aria-label={`Button ${i + 1}`}>
              <div className="lc-inbs__reminder-head">
                <span className="lc-inbs__label">Button {i + 1}</span>
                <Button
                  variant="outline"
                  color="red"
                  size="xs"
                  className="lc-inbs__icon-btn"
                  leftSection={<Icon name="trash" size={14} />}
                  disabled={buttonsOff}
                  aria-label={`Delete button ${i + 1}`}
                  title="Delete button"
                  onClick={() => set({ buttons: value.buttons.filter((_, j) => j !== i) })}
                />
              </div>
              <div className="lc-inbs__reminder-fields">
                <label className="lc-inbs__field">
                  <span className="lc-inbs__field-label">Button name</span>
                  <input className="lc-inbs__input" placeholder="Insert button name" value={button.name} disabled={buttonsOff} onChange={(e) => setButton(i, { name: e.currentTarget.value })} />
                </label>
                <label className="lc-inbs__field">
                  <span className="lc-inbs__field-label">Subheading</span>
                  <input className="lc-inbs__input" placeholder="Insert subheading" value={button.subheading} disabled={buttonsOff} onChange={(e) => setButton(i, { subheading: e.currentTarget.value })} />
                </label>
                <label className="lc-inbs__field">
                  <span className="lc-inbs__field-label">Link</span>
                  <input className="lc-inbs__input" type="url" placeholder="Insert link" value={button.link} disabled={buttonsOff} onChange={(e) => setButton(i, { link: e.currentTarget.value })} />
                </label>
                <MediaPicker
                  label={`icon for button ${i + 1}`}
                  placeholder="Icon"
                  kind="image"
                  maxMb={1}
                  value={button.icon}
                  off={buttonsOff}
                  onChange={(icon) => setButton(i, { icon })}
                />
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="lc-inbs__add-reminder"
          leftSection={<Icon name="plus" />}
          disabled={buttonsOff || value.buttons.length >= MAX_BUTTONS}
          onClick={() => set({ buttons: [...value.buttons, { name: '', subheading: '', link: '', icon: null }] })}
        >
          Add button
        </Button>
      </section>
    </>
  );
}
