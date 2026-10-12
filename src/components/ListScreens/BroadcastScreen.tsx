import { BroadcastHomePage, type BroadcastTab } from '../BroadcastHomePage';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { matchesSearch, useListScreen } from '../../hooks/useListScreen';
import { BROADCASTS_BY_TAB } from '../../data/broadcastDemo';

/** Marketing → Broadcast list. A row or "+ Broadcast" opens in the Flow editor. */
export function BroadcastScreen() {
  const { openFlow } = useAppNavigation();
  const list = useListScreen({});
  const tab = list.tab as BroadcastTab; // navigation only lets this list's tabs through
  return (
    <BroadcastHomePage
      broadcasts={BROADCASTS_BY_TAB[tab].filter((row) => matchesSearch(list.search, row.name, row.displayId))}
      loading={list.loading}
      activeTab={tab}
      onTabChange={list.setTab}
      searchValue={list.search}
      onSearchChange={list.setSearch}
      onReport={() => alert('Download broadcast report')}
      onNewBroadcast={() => openFlow('new')}
      onRowClick={(row) => openFlow(row.id)}
      onRowDownload={(row) => alert(`Download report: ${row.name}`)}
      onRowCopy={(row) => alert(`Copy broadcast: ${row.name}`)}
      page={list.page}
      totalPages={list.search || tab !== 'triggered' ? 1 : 10}
      onPageChange={list.setPage}
    />
  );
}
