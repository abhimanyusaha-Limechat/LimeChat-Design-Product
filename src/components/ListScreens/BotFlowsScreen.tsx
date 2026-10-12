import { BotFlowsHomePage, type BotFlowTab } from '../BotFlowsHomePage';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { matchesSearch, useListScreen } from '../../hooks/useListScreen';
import { BOT_FLOWS_BY_TAB } from '../../data/flowsDemo';

/** Automation → Flows list. A row or "+ Flow" opens in the Flow editor. */
export function BotFlowsScreen() {
  const { openFlow } = useAppNavigation();
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
      onNewFlow={() => openFlow('new')}
      onRowToggleActive={(row) => alert(`${row.status === 'active' ? 'Deactivate' : 'Activate'} flow: ${row.name}`)}
      onRowClick={(row) => openFlow(row.id)}
      onRowClone={(row) => alert(`Clone flow: ${row.name}`)}
      onRowDownload={(row) => alert(`Download flow: ${row.name}`)}
      onRowDelete={(row) => alert(`Delete flow: ${row.name}`)}
      page={list.page}
      totalPages={list.search || tab !== 'active' ? 1 : 10}
      onPageChange={list.setPage}
    />
  );
}
