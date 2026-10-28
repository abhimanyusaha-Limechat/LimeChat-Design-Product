/**
 * The WhatsApp Widget tab of InboxSettings: the chat button this inbox puts on the
 * customer's website, set up separately for mobile and desktop visitors. Each section's
 * switch dims its own rows.
 */
import { useId } from 'react';
import { Icon } from '../icons';
import { MediaPicker, type MediaFile } from './MediaPicker';
import { RadioRow, Row, SectionHeading, SwitchRow, clamp, type Choice } from './InboxSettingsSections';

export type WidgetDevice = 'mobile' | 'desktop';

/** Mobile first; the pop-up's device tabs flip this to list Desktop first. */
export const DEVICES: { device: WidgetDevice; label: string }[] = [
  { device: 'mobile', label: 'Mobile' },
  { device: 'desktop', label: 'Desktop' },
];
export type InboxWhatsAppWidget = Record<WidgetDevice, WhatsAppWidgetSettings>;

export interface WhatsAppWidgetSettings {
  enabled: boolean;
  type: 'icon' | 'button';
  position: 'left' | 'right';
  size: 'small' | 'medium' | 'large';
  /** Slide the widget out while the visitor scrolls, back in when they stop. */
  disappearOnScroll: boolean;
  /** Pixels from the bottom edge. */
  marginBottom: number;
  /** Pixels from the side the widget sits on. */
  marginSide: number;
  /** The image the widget shows; no `src` means the built-in WhatsApp logo. `null` once removed. */
  icon: MediaFile | null;
}

const WHATSAPP_THUMB = (
  <span className="lc-inbs__media-thumb lc-inbs__media-thumb--whatsapp" aria-hidden="true">
    <Icon name="whatsapp" size={28} />
  </span>
);

const TYPES: Choice<WhatsAppWidgetSettings['type']>[] = [
  { value: 'icon', label: 'Icon' },
  { value: 'button', label: 'Button' },
];

const POSITIONS: Choice<WhatsAppWidgetSettings['position']>[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

const SIZES: Choice<WhatsAppWidgetSettings['size']>[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

function WidgetSection({
  title,
  value,
  onChange,
}: {
  title: string;
  value: WhatsAppWidgetSettings;
  onChange: (next: WhatsAppWidgetSettings) => void;
}) {
  const off = !value.enabled;
  const set = (patch: Partial<WhatsAppWidgetSettings>) => onChange({ ...value, ...patch });
  const margins = [
    { key: 'marginBottom', label: 'From bottom' },
    { key: 'marginSide', label: value.position === 'left' ? 'From left' : 'From right' },
  ] as const;
  return (
    <section className="lc-inbs__group" aria-label={title}>
      <SectionHeading
        title={title}
        description="Use diverse options and set a customised widget that suits your website best."
        toggle={{ checked: value.enabled, onChange: (enabled) => set({ enabled }) }}
      />
      <div className="lc-inbs__table">
        <RadioRow
          label="Widget type"
          description="A round WhatsApp icon, or a button with a label."
          choices={TYPES}
          value={value.type}
          off={off}
          onChange={(type) => set({ type })}
        />
        <RadioRow
          label="Widget position"
          description="The bottom corner of the screen the widget sits in."
          choices={POSITIONS}
          value={value.position}
          off={off}
          onChange={(position) => set({ position })}
        />
        <RadioRow
          label="Widget size"
          description="How large the widget appears on the page."
          choices={SIZES}
          value={value.size}
          off={off}
          onChange={(size) => set({ size })}
        />
        <SwitchRow
          label="Disappear on scroll"
          description="Gives visitors more screen space: the widget slides out while they scroll and back in when they stop."
          checked={value.disappearOnScroll}
          off={off}
          onChange={(disappearOnScroll) => set({ disappearOnScroll })}
        />
        <Row label="Margin" description="Distance from the screen's edges, in pixels." off={off}>
          <div className="lc-inbs__duration lc-inbs__duration--pair" role="group" aria-label="Margin">
            {margins.map(({ key, label }) => (
              <label key={key} className="lc-inbs__field">
                <span className="lc-inbs__field-label">{label}</span>
                <input
                  type="number"
                  min={0}
                  className="lc-inbs__input"
                  value={value[key]}
                  disabled={off}
                  onChange={(e) => set({ [key]: clamp(e.currentTarget.valueAsNumber) })}
                />
              </label>
            ))}
          </div>
        </Row>
        <Row label="Widget icon" description="PNG, JPG, WebP or SVG, up to 1 MB." off={off}>
          <MediaPicker
            label="widget icon"
            placeholder="Widget icon"
            kind="image"
            maxMb={1}
            value={value.icon}
            fallbackThumb={WHATSAPP_THUMB}
            off={off}
            onChange={(icon) => set({ icon })}
          />
        </Row>
      </div>
    </section>
  );
}

/** One device's section, for the widget editor where Mobile and Desktop are separate tabs. */
export function WhatsAppWidgetDeviceSection({
  device,
  value,
  onChange,
}: {
  device: WidgetDevice;
  value: InboxWhatsAppWidget;
  onChange: (next: InboxWhatsAppWidget) => void;
}) {
  const label = DEVICES.find((d) => d.device === device)?.label ?? device;
  return (
    <WidgetSection
      title={`WhatsApp Widget for ${label}`}
      value={value[device]}
      onChange={(next) => onChange({ ...value, [device]: next })}
    />
  );
}

export function WhatsAppWidgetTab({
  value,
  onChange,
}: {
  value: InboxWhatsAppWidget;
  onChange: (next: InboxWhatsAppWidget) => void;
}) {
  return DEVICES.map(({ device, label }) => (
    <WidgetSection
      key={device}
      title={`WhatsApp Widget for ${label}`}
      value={value[device]}
      onChange={(next) => onChange({ ...value, [device]: next })}
    />
  ));
}

/** CSS z-index ceiling (largest 32-bit int). */
const Z_INDEX_MAX = 2147483647;

/** Stacking order of the widget on the customer's page, so it isn't hidden behind their own overlays. */
export function ZIndexSection({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  const id = useId();
  return (
    <section className="lc-inbs__group" aria-label="Widget Z-Index">
      <SectionHeading
        title="Widget Z-Index"
        description="The widget's stacking order on your page. Raise it if the widget hides behind other elements."
      />
      <div className="lc-inbs__table">
        <div className="lc-inbs__row">
          <div className="lc-inbs__row-label">
            <label className="lc-inbs__label" htmlFor={id}>Z-Index value</label>
            <p className="lc-inbs__row-desc">Higher values sit above lower ones.</p>
          </div>
          <input
            id={id}
            type="number"
            min={0}
            max={Z_INDEX_MAX}
            className="lc-inbs__input"
            value={value}
            onChange={(e) => onChange(clamp(e.currentTarget.valueAsNumber, Z_INDEX_MAX))}
          />
        </div>
      </div>
    </section>
  );
}
