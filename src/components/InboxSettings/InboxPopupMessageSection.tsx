/**
 * The WhatsApp Widget tab's Pop-up Message: a short note shown next to the widget to
 * catch new visitors' eye. One switch covers both devices; Desktop and Mobile are set
 * up separately. The open device tab is local.
 */
import { useState } from 'react';
import { NativeSelect, type SelectItem } from '../Select';
import { DEVICES, type WidgetDevice } from './InboxWhatsAppWidgetTab';
import { MediaPicker, type MediaFile } from './MediaPicker';
import { RadioRow, Row, SectionHeading, TextRow, type Choice } from './InboxSettingsSections';

export interface PopupSettings {
  position: 'top' | 'side';
  type: 'static' | 'video';
  /** Seconds after the page loads. */
  appearAfter: number;
  /** Seconds after it appears. */
  disappearAfter: number;
  heading: string;
  body: string;
  /** Button text; no button when empty. */
  ctaText: string;
  /** Logo shown in the pop-up. */
  companyImage: MediaFile | null;
  /** An image for a Static pop-up, or a video for a Video one. */
  media: MediaFile | null;
}

export interface InboxPopupMessage extends Record<WidgetDevice, PopupSettings> {
  enabled: boolean;
}

const TABS = [...DEVICES].reverse();

const POSITIONS: Choice<PopupSettings['position']>[] = [
  { value: 'top', label: 'Top' },
  { value: 'side', label: 'Side' },
];

const TYPES: Choice<PopupSettings['type']>[] = [
  { value: 'static', label: 'Static' },
  { value: 'video', label: 'Video' },
];

const DELAYS: SelectItem[] = [0, 3, 5, 10, 15, 30, 60].map((s) => ({ value: String(s), label: `${s} Secs` }));

export function PopupMessageSection({ value, onChange }: { value: InboxPopupMessage; onChange: (next: InboxPopupMessage) => void }) {
  const [device, setDevice] = useState<WidgetDevice>('desktop');
  const off = !value.enabled;
  const popup = value[device];
  const set = (patch: Partial<PopupSettings>) => onChange({ ...value, [device]: { ...popup, ...patch } });
  return (
    <section className="lc-inbs__group" aria-label="Pop-up Message">
      <SectionHeading
        title="Pop-up Message"
        description="Makes the widget more noticeable to new visitors. It appears next to the widget on your website."
        toggle={{ checked: value.enabled, onChange: (enabled) => onChange({ ...value, enabled }) }}
      />
      <div className="lc-inbs__tabs" role="tablist" aria-label="Pop-up device">
        {TABS.map((d) => (
          <button
            key={d.device}
            type="button"
            role="tab"
            aria-selected={d.device === device}
            className="lc-inbs__tab"
            data-active={d.device === device || undefined}
            onClick={() => setDevice(d.device)}
          >
            {d.label}
          </button>
        ))}
      </div>
      <div className="lc-inbs__table" role="tabpanel" aria-label={TABS.find((d) => d.device === device)?.label}>
        <RadioRow
          label="Pop-up position"
          description="Above the widget, or beside it."
          choices={POSITIONS}
          value={popup.position}
          off={off}
          onChange={(position) => set({ position })}
        />
        <RadioRow
          label="Pop-up type"
          description="A text message, or a short video."
          choices={TYPES}
          value={popup.type}
          off={off}
          onChange={(type) => set({ type })}
        />
        <Row label="Time delays" description="When the pop-up shows after the page loads, and how long it stays." off={off}>
          <div className="lc-inbs__duration lc-inbs__duration--pair" role="group" aria-label="Time delays">
            <NativeSelect
              label="Time to appear"
              fullWidth
              data={DELAYS}
              value={String(popup.appearAfter)}
              disabled={off}
              onChange={(e) => set({ appearAfter: Number(e.currentTarget.value) })}
            />
            <NativeSelect
              label="Time to disappear"
              fullWidth
              data={DELAYS}
              value={String(popup.disappearAfter)}
              disabled={off}
              onChange={(e) => set({ disappearAfter: Number(e.currentTarget.value) })}
            />
          </div>
        </Row>
        <TextRow
          label="Heading"
          description="Optional bold line above the message."
          placeholder="Enter heading text"
          value={popup.heading}
          off={off}
          onChange={(heading) => set({ heading })}
        />
        <TextRow
          label="Body"
          description="The message visitors see."
          placeholder="Enter body text"
          value={popup.body}
          off={off}
          onChange={(body) => set({ body })}
        />
        <TextRow
          label="Call to action button"
          description="Leave empty for no button."
          placeholder="Enter button text"
          value={popup.ctaText}
          off={off}
          onChange={(ctaText) => set({ ctaText })}
        />
        <Row label="Company image" description="Your logo, shown in the pop-up. PNG, JPG, WebP or SVG, up to 1 MB." off={off}>
          <MediaPicker
            label="company image"
            placeholder="Company Image"
            kind="image"
            maxMb={1}
            value={popup.companyImage}
            off={off}
            onChange={(companyImage) => set({ companyImage })}
          />
        </Row>
        <Row
          label="Media"
          description={popup.type === 'video' ? 'An MP4 or WebM video, up to 16 MB.' : 'An image, up to 5 MB.'}
          off={off}
        >
          <MediaPicker
            // Remount on type change so a stale error from the other type doesn't linger.
            key={popup.type}
            label="media"
            placeholder="Select Media"
            kind={popup.type === 'video' ? 'video' : 'image'}
            maxMb={popup.type === 'video' ? 16 : 5}
            value={popup.media}
            off={off}
            onChange={(media) => set({ media })}
          />
        </Row>
      </div>
    </section>
  );
}
