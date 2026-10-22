/**
 * IntegrationsHomePage — Settings → Integration, HelpDesk product.
 *
 * Partners grouped into labelled sections ("CRM Partners", "Logistics
 * Partners", …), each rendered as a grid of icon + name tiles. A toolbar of
 * category chips + a name search narrows the list (hidden in `compact`).
 *
 *   <IntegrationsHomePage categories={INTEGRATION_CATEGORIES} onPartnerClick={(id) => ...} />
 */
import { useState, type ReactNode } from 'react';
import { TemplateIcon } from '../TemplatesHomePage';
import './IntegrationsHomePage.css';

export interface IntegrationPartner {
  id: string;
  name: string;
  icon: ReactNode;
}

export interface IntegrationCategory {
  id: string;
  title: string;
  partners: IntegrationPartner[];
}

export interface IntegrationsHomePageProps {
  categories: IntegrationCategory[];
  /** Called when a partner tile is clicked/activated. */
  onPartnerClick?: (partnerId: string, categoryId: string) => void;
  /** Fixed 3-column grid with smaller tiles and no filter toolbar, for narrow containers like the ticket details panel. */
  compact?: boolean;
}

const ALL = 'all';

export function IntegrationsHomePage({ categories, onPartnerClick, compact }: IntegrationsHomePageProps) {
  const [categoryId, setCategoryId] = useState(ALL);
  const [query, setQuery] = useState('');

  const needle = query.trim().toLowerCase();
  const visible = categories
    .filter((c) => categoryId === ALL || c.id === categoryId)
    .map((c) => ({ ...c, partners: c.partners.filter((p) => p.name.toLowerCase().includes(needle)) }))
    .filter((c) => c.partners.length > 0);

  return (
    <div className={`lc-ihp${compact ? ' lc-ihp--compact' : ''}`}>
      {!compact && (
        <div className="lc-ihp__toolbar">
          <div className="lc-ihp__chips" role="group" aria-label="Filter by category">
            {[{ id: ALL, title: 'All' }, ...categories].map((c) => (
              <button
                key={c.id}
                type="button"
                className="lc-ihp__chip"
                aria-pressed={c.id === categoryId}
                onClick={() => setCategoryId(c.id)}
              >
                {c.title.replace(/ Partners$/, '')}
              </button>
            ))}
          </div>
          <div className="lc-ihp__search">
            <TemplateIcon name="search" className="lc-ihp__search-icon" aria-hidden />
            <input
              className="lc-ihp__search-input"
              type="search"
              placeholder="Search integrations"
              aria-label="Search integrations"
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
            />
          </div>
        </div>
      )}
      {visible.length === 0 && <p className="lc-ihp__empty">No integrations match “{query.trim()}”.</p>}
      {visible.map((category) => (
        <section key={category.id} className="lc-ihp__section">
          {category.title && <h3 className="lc-ihp__section-title">{category.title}</h3>}
          <div className="lc-ihp__grid">
            {category.partners.map((partner) => (
              <button
                key={partner.id}
                type="button"
                className="lc-ihp__tile"
                onClick={() => onPartnerClick?.(partner.id, category.id)}
              >
                {partner.icon}
                <span className="lc-ihp__tile-name">{partner.name}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default IntegrationsHomePage;
