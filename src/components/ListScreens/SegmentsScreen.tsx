import { SegmentsHomePage, type SegmentRowData, type SegmentSourceTab } from '../SegmentsHomePage';
import { matchesSearch, useListScreen } from '../../hooks/useListScreen';
import { DEMO_SEGMENTS } from '../../data/segmentsDemo';

const SEGMENTS_BY_TAB: Record<SegmentSourceTab, SegmentRowData[]> = {
  'lc-segments': DEMO_SEGMENTS,
  imported: [],
};

/** Marketing → Segments list. */
export function SegmentsScreen() {
  const list = useListScreen({});
  const tab = list.tab as SegmentSourceTab; // navigation only lets this list's tabs through
  return (
    <SegmentsHomePage
      segments={SEGMENTS_BY_TAB[tab].filter((row) => matchesSearch(list.search, row.name))}
      loading={list.loading}
      activeTab={tab}
      onTabChange={list.setTab}
      searchValue={list.search}
      onSearchChange={list.setSearch}
      onCreateSegment={() => alert('Create segment')}
      onRowEdit={(row) => alert(`Edit segment: ${row.name}`)}
      onRowClone={(row) => alert(`Clone segment: ${row.name}`)}
      onRowDownload={(row) => alert(`Download segment: ${row.name}`)}
      onRowDelete={(row) => alert(`Delete segment: ${row.name}`)}
      onRowRefresh={(row) => alert(`Refresh size: ${row.name}`)}
      page={list.page}
      totalPages={1}
      onPageChange={list.setPage}
    />
  );
}
