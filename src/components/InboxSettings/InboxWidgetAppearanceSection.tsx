/**
 * The widget editor's Appearance tab: primary colour (a hex plus ten generated shades to
 * pick from), font, the launcher icon and the company logo.
 */
import { useId } from 'react';
import { NativeSelect } from '../Select';
import { MediaPicker, type MediaFile } from './MediaPicker';
import { Row, SectionHeading } from './InboxSettingsSections';

export interface InboxWidgetAppearance {
  /** Six hex digits, no '#'. The shades below are generated from it. */
  baseColor: string;
  /** Which of the ten generated shades is the widget's primary colour (1-based). */
  shade: number;
  font: string;
  icon: MediaFile | null;
  logo: MediaFile | null;
}

const FONTS = ['Lato', 'Inter', 'Roboto', 'Open Sans', 'Poppins'];
const SHADES = 10;
const HEX = /^[0-9a-f]{6}$/i;

const channel = (hex: string, i: number) => parseInt(hex.slice(i, i + 2), 16);

/** Ten shades of `hex`: 1 is a near-white tint, 7 is the base, 10 the darkest. */
function shadesOf(hex: string): string[] {
  const rgb = [0, 2, 4].map((i) => channel(hex, i));
  return Array.from({ length: SHADES }, (_, n) => {
    const toward = n < 6 ? 255 : 0;
    const amount = n < 6 ? (6 - n) / 7 : (n - 6) / 5 * 0.5;
    return (
      '#' +
      rgb
        .map((c) => Math.round(c + (toward - c) * amount).toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()
    );
  });
}

export function WidgetAppearanceSection({
  value,
  onChange,
}: {
  value: InboxWidgetAppearance;
  onChange: (next: InboxWidgetAppearance) => void;
}) {
  const hexId = useId();
  const set = (patch: Partial<InboxWidgetAppearance>) => onChange({ ...value, ...patch });
  const valid = HEX.test(value.baseColor);
  const shades = shadesOf(valid ? value.baseColor : '1B83AC');
  const primary = shades[value.shade - 1];
  return (
    <section className="lc-inbs__group" aria-label="Appearance">
      <SectionHeading title="Appearance" description="How the widget looks on your customer's site." />
      <div className="lc-inbs__table">
        <Row label="Widget Primary Colour" description="Type a hex colour, then pick one of the shades generated from it.">
          <div className="lc-inbs__color">
            <div className="lc-inbs__color-top">
              <span className="lc-inbs__color-swatch" style={{ background: primary }} aria-hidden="true" />
              <label className="lc-inbs__hex" htmlFor={hexId}>
                <span aria-hidden="true">#</span>
                <input
                  id={hexId}
                  className="lc-inbs__hex-input"
                  maxLength={6}
                  value={value.baseColor}
                  aria-invalid={!valid}
                  aria-label="Primary colour hex"
                  onChange={(e) => set({ baseColor: e.currentTarget.value.replace(/[^0-9a-f]/gi, '') })}
                />
              </label>
            </div>
            <div className="lc-inbs__shades" role="radiogroup" aria-label="Primary colour shades">
              {shades.map((shade, i) => (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={value.shade === i + 1}
                  aria-label={`Shade ${i + 1}, ${shade}`}
                  className="lc-inbs__shade"
                  style={{ background: shade }}
                  onClick={() => set({ shade: i + 1 })}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </Row>
        <Row label="Font" description="The typeface used inside the widget.">
          <NativeSelect
            size="sm"
            fullWidth
            aria-label="Font"
            data={FONTS}
            value={value.font}
            onChange={(e) => set({ font: e.currentTarget.value })}
          />
        </Row>
        <Row label="Widget Icon" description="PNG, JPG, WebP or SVG, up to 1 MB.">
          <MediaPicker label="widget icon" placeholder="Widget icon" kind="image" maxMb={1} value={value.icon} off={false} onChange={(icon) => set({ icon })} />
        </Row>
        <Row label="Company Logo" description="PNG, JPG, WebP or SVG, up to 1 MB.">
          <MediaPicker label="company logo" placeholder="Company logo" kind="image" maxMb={1} value={value.logo} off={false} onChange={(logo) => set({ logo })} />
        </Row>
      </div>
    </section>
  );
}
