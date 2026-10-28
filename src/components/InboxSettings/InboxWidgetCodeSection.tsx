/**
 * The widget editor's Code tab: the script a site pastes in to load the LimeChat widget,
 * with a Copy code button under the install instructions. The header's "Copy widget code" copies the same script.
 */
import { Button } from '../Button';
import { Icon } from '../icons';
import { SectionHeading } from './InboxSettingsSections';
import { useCopied } from './useCopied';

// ponytail: demo token and SDK URL until widgets have a real embed script.
export const WIDGET_EMBED_CODE = `<script>
(function(d,t) {
  var BASE_URL="https://app.limechat.ai";
  var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
  g.src="https://s3.ap-south-1.amazonaws.com/cdn.limechat.ai/packs/js/LC_sdk/v1/sdk.js";
  g.defer = true;
  s.parentNode.insertBefore(g,s);
  g.onload=function(){
    window.chatwootSDK.run({
      websiteToken: 'vjNqKyGonaVozn2v8e5H2nwz',
      baseUrl: BASE_URL
    })
  }
})(document,"script");
</script>`;

/** Wraps quoted strings in a span so they can be coloured; no other highlighting. */
function highlight(code: string) {
  return code.split(/("[^"]*"|'[^']*')/g).map((part, i) =>
    i % 2 ? <span key={i} className="lc-inbs__code-str">{part}</span> : part,
  );
}

export function WidgetCodeSection() {
  const { copied, copy } = useCopied(WIDGET_EMBED_CODE);
  return (
    <section className="lc-inbs__group" aria-label="Widget code">
      <SectionHeading
        title="Install the widget"
        description="Paste this script just before the closing </body> tag on every page where the widget should appear."
      />
      <div className="lc-inbs__code-panel">
        <div className="lc-inbs__code-bar">
          <span className="lc-inbs__code-lang">HTML</span>
          <Button variant="filled" color="primary" size="xs" leftSection={<Icon name="copy" size={14} />} onClick={copy}>
            <span aria-live="polite">{copied ? 'Copied' : 'Copy code'}</span>
          </Button>
        </div>
        <pre className="lc-inbs__code" tabIndex={0}><code>{highlight(WIDGET_EMBED_CODE)}</code></pre>
      </div>
    </section>
  );
}
