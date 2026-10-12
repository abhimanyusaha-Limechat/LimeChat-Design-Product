import { TemplatesHomePage, type TemplateChannel, type TemplateRowData } from '../TemplatesHomePage';
import { matchesSearch, useListScreen } from '../../hooks/useListScreen';
import { DEMO_TEMPLATES } from '../../data/templatesDemo';

/** Filter values are slugs of what the row shows: "Clinikally Helpdesk" → "clinikally-helpdesk". */
const slug = (value = '') => value.toLowerCase().replace(/\s+/g, '-');

/** Whether `row` matches the search and every filter; "all" lets everything through. */
export function templateMatches(
  row: TemplateRowData,
  search: string,
  filters: { inbox: string; type: string; category: string },
): boolean {
  return (
    matchesSearch(search, row.name, row.displayId) &&
    (filters.inbox === 'all' || slug(row.businessTag) === filters.inbox) &&
    (filters.type === 'all' || row.type === filters.type) &&
    (filters.category === 'all' || slug(row.category) === filters.category)
  );
}

/** Marketing / Helpdesk → Templates list. Its List tab is the channel. */
export function TemplatesScreen() {
  const list = useListScreen({ inbox: 'all', type: 'all', category: 'all' });
  const channel = list.tab as TemplateChannel; // navigation only lets this list's tabs through
  return (
    <TemplatesHomePage
      // ponytail: every channel shows the same demo templates until channels get their own data.
      templates={DEMO_TEMPLATES.filter((row) => templateMatches(row, list.search, list.filters))}
      loading={list.loading}
      activeChannel={channel}
      onChannelChange={list.setTab}
      searchValue={list.search}
      onSearchChange={list.setSearch}
      inboxFilter={list.filters.inbox}
      onInboxFilterChange={(v) => list.setFilter('inbox', v)}
      typeFilter={list.filters.type}
      onTypeFilterChange={(v) => list.setFilter('type', v)}
      categoryFilter={list.filters.category}
      onCategoryFilterChange={(v) => list.setFilter('category', v)}
      onRefresh={() => alert('Refresh templates')}
      onDownloadReport={() => alert('Download template report')}
      onCreateTemplate={() => alert('Create template')}
      onRowEdit={(row) => alert(`Edit template: ${row.name}`)}
      onRowClone={(row) => alert(`Clone template: ${row.name}`)}
      onRowDelete={(row) => alert(`Delete template: ${row.name}`)}
      page={list.page}
      totalPages={list.search ? 1 : 262}
      onPageChange={list.setPage}
    />
  );
}
