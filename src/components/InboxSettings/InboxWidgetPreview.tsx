/**
 * A phone mock-up beside the WhatsApp Widget tab showing the mobile widget and pop-up
 * as currently set: type, size, corner, margins, icon and the pop-up's copy. The page
 * behind is a grey skeleton; the phone is decorative, so it's hidden from screen readers.
 * "Preview on desktop" opens the same thing as a desktop browser window in a modal.
 */
import { useState, type CSSProperties } from 'react';
import { Button } from '../Button';
import { Icon } from '../icons';
import { Modal } from '../Modal';
import type { InboxPopupMessage, PopupSettings } from './InboxPopupMessageSection';
import type { InboxWhatsAppWidget, WhatsAppWidgetSettings, WidgetDevice } from './InboxWhatsAppWidgetTab';
import { useCopied } from './useCopied';

function WidgetFace({ widget }: { widget: WhatsAppWidgetSettings }) {
  const logo = widget.icon?.src ? (
    <img className="lc-inbs-preview__logo" src={widget.icon.src} alt="" />
  ) : (
    <span className="lc-inbs-preview__logo lc-inbs-preview__logo--whatsapp">
      <Icon name="whatsapp" />
    </span>
  );
  return widget.type === 'button' ? (
    <span className="lc-inbs-preview__button">
      {logo}
      Chat with us
    </span>
  ) : (
    logo
  );
}

function PopupCard({ popup }: { popup: PopupSettings }) {
  const media = popup.media?.src;
  return (
    <div className="lc-inbs-preview__popup">
      {media &&
        (popup.media?.kind === 'video' ? (
          <video className="lc-inbs-preview__media" src={media} muted />
        ) : (
          <img className="lc-inbs-preview__media" src={media} alt="" />
        ))}
      <div className="lc-inbs-preview__popup-body">
        {popup.companyImage?.src && <img className="lc-inbs-preview__company" src={popup.companyImage.src} alt="" />}
        <div>
          {popup.heading && <strong className="lc-inbs-preview__heading">{popup.heading}</strong>}
          {popup.body && <p className="lc-inbs-preview__text">{popup.body}</p>}
        </div>
      </div>
      {popup.ctaText && <span className="lc-inbs-preview__cta">{popup.ctaText}</span>}
    </div>
  );
}

/** The widget and its pop-up laid over a page; the parent screen sets `--s` (its scale). */
function WidgetOverlay({ widget, popup }: { widget: WhatsAppWidgetSettings; popup: PopupSettings | null }) {
  if (!widget.enabled) return null;
  // Margins are in real pixels; the CSS scales them by the screen's `--s`.
  const place = { '--mb': widget.marginBottom, '--ms': widget.marginSide } as CSSProperties;
  return (
    <div
      className="lc-inbs-preview__widget"
      data-side={widget.position}
      data-size={widget.size}
      data-popup={popup?.position}
      style={place}
    >
      {popup && <PopupCard popup={popup} />}
      <WidgetFace widget={widget} />
    </div>
  );
}

function Site({ desktop }: { desktop?: boolean }) {
  return (
    <div className={`lc-inbs-preview__site${desktop ? ' lc-inbs-preview__site--desktop' : ''}`}>
      <span className="lc-inbs-preview__bar" />
      <span className="lc-inbs-preview__hero" />
      <span className="lc-inbs-preview__line" />
      <span className="lc-inbs-preview__line lc-inbs-preview__line--short" />
      <span className="lc-inbs-preview__tiles">
        {Array.from({ length: desktop ? 3 : 2 }, (_, i) => (
          <span key={i} />
        ))}
      </span>
    </div>
  );
}

// ponytail: placeholder embed URL until the real widget script is wired up.
const widgetSnippet = (phone: string) =>
  `<script src="https://widget.limechat.ai/whatsapp.js" data-phone="${phone.replace(/\D/g, '')}" async></script>`;

export function WidgetPreview({
  phone,
  widgets,
  popups,
  showCode = true,
}: {
  /** The inbox's WhatsApp number; the embed code is for this inbox. */
  phone: string;
  widgets: InboxWhatsAppWidget;
  popups: InboxPopupMessage;
  /** Shows the "Copy code" card under the phone; the widget editor leaves it out. */
  showCode?: boolean;
}) {
  const { copied, copy } = useCopied(widgetSnippet(phone));
  const [desktopOpen, setDesktopOpen] = useState(false);
  // The pop-up shows only while its master switch is on.
  const popupFor = (device: WidgetDevice) => (popups.enabled ? popups[device] : null);
  const mobile = widgets.mobile;
  const desktop = widgets.desktop;
  return (
    <aside className="lc-inbs-preview" data-no-code={!showCode || undefined} aria-label="Mobile preview">
      <div className="lc-inbs-preview__phone" aria-hidden="true">
        <div className="lc-inbs-preview__screen">
          <Site />
          <WidgetOverlay widget={mobile} popup={popupFor('mobile')} />
        </div>
      </div>
      <Button variant="outline" size="xs" onClick={() => setDesktopOpen(true)}>
        Preview on desktop
      </Button>
      {showCode && (
        <div className="lc-inbs-preview__code">
          <p className="lc-inbs-preview__hint">Copy the script to enable the WhatsApp widget.</p>
          <Button variant="outline" size="sm" onClick={copy}>
            <span aria-live="polite">{copied ? 'Copied' : 'Copy code'}</span>
          </Button>
        </div>
      )}
      {!mobile.enabled && <p className="lc-inbs-preview__note">The mobile widget is switched off.</p>}
      <Modal
        open={desktopOpen}
        onClose={() => setDesktopOpen(false)}
        title="Desktop preview"
        description="Where the widget and pop-up sit on a desktop website, using your Desktop settings."
        width={960}
      >
        <div className="lc-inbs-browser" aria-hidden="true">
          <div className="lc-inbs-browser__bar">
            <span />
            <span />
            <span />
            <span className="lc-inbs-browser__address" />
          </div>
          <div className="lc-inbs-browser__screen">
            <Site desktop />
            <WidgetOverlay widget={desktop} popup={popupFor('desktop')} />
          </div>
        </div>
        {!desktop.enabled && <p className="lc-inbs-browser__note">The desktop widget is switched off.</p>}
      </Modal>
    </aside>
  );
}
