import { BotFlowsHomePage, type BotFlowRowData, type BotFlowTab } from '../BotFlowsHomePage';
import { matchesSearch, useListScreen } from '../../hooks/useListScreen';
import { DEMO_BOT_FLOWS_ACTIVE, DEMO_BOT_FLOWS_INACTIVE } from '../../data/flowsDemo';

const BOT_FLOWS_BY_TAB: Record<BotFlowTab, BotFlowRowData[]> = {
  active: DEMO_BOT_FLOWS_ACTIVE,
  inactive: DEMO_BOT_FLOWS_INACTIVE,
};

/** Automation → Flows list. Opening a row or "+ Flow" belongs to the flow editor, so App handles it. */
export function BotFlowsScreen({
  onRowClick,
  onNewFlow,
}: {
  onRowClick: (row: BotFlowRowData) => void;
  onNewFlow: () => void;
}) {
  const list = useListScreen({});
  const tab = list.tab as BotFlowTab; // navigation only lets this list's tabs through
  return (
    <BotFlowsHomePage
      flows={BOT_FLOWS_BY_TAB[tab].filter((row) => matchesSearch(list.search, row.name))}
      loading={list.loading}
      activeTab={tab}
      onTabChange={list.setTab}
      searchValue={list.search}
      onSearchChange={list.setSearch}
      onNewFlow={onNewFlow}
      onRowToggleActive={(row) => alert(`${row.status === 'active' ? 'Deactivate' : 'Activate'} flow: ${row.name}`)}
      onRowClick={onRowClick}
      onRowClone={(row) => alert(`Clone flow: ${row.name}`)}
      onRowDownload={(row) => alert(`Download flow: ${row.name}`)}
      onRowDelete={(row) => alert(`Delete flow: ${row.name}`)}
      page={list.page}
      totalPages={list.search || tab !== 'active' ? 1 : 10}
      onPageChange={list.setPage}
    />
  );
}
