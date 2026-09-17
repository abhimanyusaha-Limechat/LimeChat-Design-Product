/**
 * IntegrationsHomePage — Settings → Integration, HelpDesk product.
 *
 * Partners grouped into labelled sections ("CRM Partners", "Logistics
 * Partners", …), each rendered as a grid of icon + name tiles.
 *
 *   <IntegrationsHomePage categories={INTEGRATION_CATEGORIES} onPartnerClick={(id) => ...} />
 */
import type { ReactNode } from 'react';
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
}

export function IntegrationsHomePage({ categories, onPartnerClick }: IntegrationsHomePageProps) {
  return (
    <div className="lc-ihp">
      {categories.map((category) => (
        <section key={category.id} className="lc-ihp__section">
          <h3 className="lc-ihp__section-title">{category.title}</h3>
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
