import { FlowsHomePage, type FlowRowData, type FlowTab } from '../FlowsHomePage';
import { matchesSearch, useListScreen } from '../../hooks/useListScreen';
import { DEMO_FLOWS_ACTIVE, DEMO_FLOWS_DRAFT, DEMO_FLOWS_INACTIVE } from '../../data/flowsDemo';

const FLOWS_BY_TAB: Record<FlowTab, FlowRowData[]> = {
  active: DEMO_FLOWS_ACTIVE,
  inactive: DEMO_FLOWS_INACTIVE,
  draft: DEMO_FLOWS_DRAFT,
};

/** Marketing → Flows list. Opening a row or "+ Flow" belongs to the flow editor, so App handles it. */
export function FlowsScreen({
  onRowClick,
  onNewFlow,
}: {
  onRowClick: (row: FlowRowData) => void;
  onNewFlow: () => void;
}) {
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
      onNewFlow={onNewFlow}
      onRowClick={onRowClick}
      onRowDownload={(row) => alert(`Download report: ${row.name}`)}
      onRowCopy={(row) => alert(`Copy flow: ${row.name}`)}
      page={list.page}
      totalPages={list.search || tab !== 'active' ? 1 : 10}
      onPageChange={list.setPage}
    />
  );
}
