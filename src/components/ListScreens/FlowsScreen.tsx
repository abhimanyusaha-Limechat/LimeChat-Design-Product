import { FlowsHomePage, type FlowTab } from '../FlowsHomePage';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { matchesSearch, useListScreen } from '../../hooks/useListScreen';
import { FLOWS_BY_TAB } from '../../data/flowsDemo';

/** Marketing → Flows list. A row or "+ Flow" opens in the Flow editor. */
export function FlowsScreen() {
  const { openFlow } = useAppNavigation();
  const list = useListScreen({});
  const tab = list.tab as FlowTab; // navigation only lets this list's tabs through
  return (
    <FlowsHomePage
      flows={FLOWS_BY_TAB[tab].filter((row) => matchesSearch(list.search, row.name, row.displayId))}
      loading={list.loading}
      activeTab={tab}
      onTabChange={list.setTab}
      searchValue={list.search}
      onSearchChange={list.setSearch}
      onReport={(type) => alert(type === 'flow-report' ? 'Download flow report' : 'Download error log')}
      onNewFlow={() => openFlow('new')}
      onRowClick={(row) => openFlow(row.id)}
      onRowDownload={(row) => alert(`Download report: ${row.name}`)}
      onRowCopy={(row) => alert(`Copy flow: ${row.name}`)}
      page={list.page}
      totalPages={list.search || tab !== 'active' ? 1 : 10}
      onPageChange={list.setPage}
    />
  );
}
