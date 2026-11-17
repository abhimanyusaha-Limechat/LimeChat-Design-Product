import { useState } from 'react';
import { SettingsPage } from '../SettingsPage';
import { BotTemplatesTable } from '../BotTemplatesTable';
import { PublishHistoryPanel } from '../PublishHistoryPanel';
import { Menu } from '../Menu';
import { Icon } from '../icons';
import { matchesSearch, useListScreen } from '../../hooks/useListScreen';
import { DEMO_KB_FILES, KB_COPY, KB_HISTORY, KB_SOURCE_TABS, KB_TABS } from '../../data/settingsDemo';

/** URL and domain sources show the site's host; files show their extension. */
const formatOf = (source: string, name: string) =>
  source === 'url' || source === 'domain'
    ? new URL(name).hostname.replace(/^www\./, '')
    : name.includes('.')
      ? name.split('.').pop()?.toUpperCase()
      : undefined;

/** Automation → Knowledge base. Its List tab is the KB tab; the source row under Manage stays local. */
export function KnowledgeBaseScreen() {
  const list = useListScreen({ source: 'doc' });
  const { tab } = list;
  const { source } = list.filters;
  const copy = KB_COPY[tab];
  const [historyOpen, setHistoryOpen] = useState(false);
  const manage = tab === 'manage';
  return (
    <SettingsPage
      tabs={KB_TABS}
      activeTab={tab}
      onTabChange={list.setTab}
      title={copy.title}
      description={copy.description}
      onWatchVideo={() => alert(`Play tutorial video: ${copy.title}`)}
      onViewDocs={() => alert(`Open docs: ${copy.title}`)}
      // Only the Manage tab has a list to have a history of.
      headerActions={
        manage ? (
          <Menu
            ariaLabel="More knowledge base actions"
            items={[{ label: 'See history', onClick: () => setHistoryOpen(true) }]}
            trigger={({ ref, onClick }) => (
              <button
                ref={ref}
                type="button"
                className="lc-sp__detail-btn"
                aria-label="More knowledge base actions"
                onClick={onClick}
              >
                <Icon name="dots-vertical" size={20} />
              </button>
            )}
          />
        ) : undefined
      }
    >
      {/* A log, not a version history. Nothing here is published — a source is live the moment
          it is added — so there is no current-versus-published split to show, and no row is
          selectable or downloadable. The panel renders none of those controls. */}
      {manage && historyOpen && (
        <PublishHistoryPanel
          title="History"
          hint="Every change to the knowledge base, newest first."
          sectionLabel="Changes"
          versions={KB_HISTORY}
          onClose={() => setHistoryOpen(false)}
        />
      )}
      {tab === 'manage' && (
        <BotTemplatesTable
          variant="files"
          webSource={source === 'url' || source === 'domain' ? source : undefined}
          tabs={KB_SOURCE_TABS}
          activeTab={source}
          onTabChange={(next) => list.setFilter('source', next)}
          templates={(DEMO_KB_FILES[source] ?? [])
            .filter((r) => matchesSearch(list.search, r.name))
            .map((r) => ({ ...r, format: formatOf(source, r.name) }))}
          loading={list.loading}
          searchValue={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder={`Search for ${KB_SOURCE_TABS.find((t) => t.id === source)?.label ?? ''}`}
          hideFilters
          onViewDetails={(row) => alert(`View details: ${row.name}`)}
          onRowEdit={(row) => alert(`Edit template: ${row.name}`)}
          onRowClone={(row) => alert(`Clone template: ${row.name}`)}
          onRowDelete={(row) => alert(`Delete template: ${row.name}`)}
        />
      )}
    </SettingsPage>
  );
}
