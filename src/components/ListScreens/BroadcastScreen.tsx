import { BroadcastHomePage, type BroadcastRowData, type BroadcastTab } from '../BroadcastHomePage';
import { matchesSearch, useListScreen } from '../../hooks/useListScreen';
import { DEMO_BROADCASTS, DEMO_DRAFT_BROADCASTS, DEMO_SCHEDULED_BROADCASTS } from '../../data/broadcastDemo';

const BROADCASTS_BY_TAB: Record<BroadcastTab, BroadcastRowData[]> = {
  triggered: DEMO_BROADCASTS,
  scheduled: DEMO_SCHEDULED_BROADCASTS,
  draft: DEMO_DRAFT_BROADCASTS,
};

/** Marketing → Broadcast list. Opening a row or "+ Broadcast" belongs to the flow editor, so App handles it. */
export function BroadcastScreen({
  onRowClick,
  onNewBroadcast,
}: {
  onRowClick: (row: BroadcastRowData) => void;
  onNewBroadcast: () => void;
}) {
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
      onNewBroadcast={onNewBroadcast}
      onRowClick={onRowClick}
      onRowDownload={(row) => alert(`Download report: ${row.name}`)}
      onRowCopy={(row) => alert(`Copy broadcast: ${row.name}`)}
      page={list.page}
      totalPages={list.search || tab !== 'triggered' ? 1 : 10}
      onPageChange={list.setPage}
    />
  );
}
