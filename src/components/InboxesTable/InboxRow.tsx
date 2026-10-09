/** One inbox card row. Its cells line up under the header cells in InboxesTable (same lc-ib__cell--* classes). */
import { Avatar } from '../Avatar';
import { ActionMenu } from '../Menu';
import { DataTableRow } from '../DataTable';
import { InboxChannelIcon } from './InboxChannelIcon';
import { InboxIcon } from './icons';
import { TYPE_LABEL, attentionText, canReauthorize, initialsOf, type InboxAgent, type InboxRowData } from './inboxes';

function MembersCell({ members }: { members: InboxAgent[] }) {
  if (members.length === 0) return <span className="lc-ib__muted">No members</span>;
  return (
    <>
      <Avatar.Group size={24} radius="xl" aria-hidden="true">
        {members.slice(0, 3).map(({ id, name }) => (
          <Avatar key={id} variant="filled">
            {initialsOf(name)}
          </Avatar>
        ))}
      </Avatar.Group>
      <span className="lc-ib__members-count">
        {members.length}
        <span className="lc-dt__sr-only"> {members.length === 1 ? 'member' : 'members'}</span>
      </span>
    </>
  );
}

interface InboxRowProps {
  row: InboxRowData;
  selected: boolean;
  onOpen: () => void;
  onReauthorize: () => void;
  onDelete: () => void;
}

export function InboxRow({ row, selected, onOpen, onReauthorize, onDelete }: InboxRowProps) {
  const attention = attentionText(row);
  return (
    <DataTableRow data-anchor="inbox-row" data-anchor-key={row.id} data-selected={selected || undefined} onRowClick={onOpen}>
      <div role="cell" className="lc-ib__cell--name lc-ib__cell">
        <InboxChannelIcon row={row} size="tile" />
        <div className="lc-ib__name-block">
          <span className="lc-ib__name">{row.name}</span>
          <span className="lc-ib__sub">
            <span className="lc-ib__identifier">{row.identifier}</span>
            {attention && (
              <span className="lc-ib__attention" data-status={row.status}>
                {attention}
              </span>
            )}
          </span>
        </div>
      </div>
      <div role="cell" className="lc-ib__cell--type lc-ib__cell">
        <span className="lc-ib__type-chip">{TYPE_LABEL[row.type]}</span>
      </div>
      <div role="cell" className="lc-ib__cell--members lc-ib__cell">
        <MembersCell members={row.members} />
      </div>
      <div role="cell" className="lc-dt__actions lc-ib__cell">
        <ActionMenu
          ariaLabel={`Actions for ${row.name}`}
          icon={<InboxIcon name="dots-vertical" />}
          items={[
            { label: 'Open', onClick: onOpen },
            ...(canReauthorize(row) ? [{ label: 'Reauthorize', icon: <InboxIcon name="refresh" />, onClick: onReauthorize }] : []),
            { label: 'Delete', icon: <InboxIcon name="trash" />, danger: true, onClick: onDelete },
          ]}
        />
      </div>
    </DataTableRow>
  );
}
