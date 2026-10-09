/**
 * InboxDetailPlaceholder — stands in for the inbox detail page until it is built, so opening an
 * inbox from the list isn't a dead end. TODO(phase 2): replace with the real detail view.
 */
import { Button } from '../Button';
import { InboxIcon } from './icons';
import { STATUS_LABEL, TYPE_LABEL, type InboxRowData } from './inboxes';

export interface InboxDetailPlaceholderProps {
  /** The inbox from the URL; undefined when that id doesn't exist (a stale link, or deleted). */
  inbox?: InboxRowData;
  onBack: () => void;
}

export function InboxDetailPlaceholder({ inbox, onBack }: InboxDetailPlaceholderProps) {
  return (
    <div className="lc-ib-detail" data-anchor="inbox-detail">
      <Button variant="subtle" color="gray" size="sm" leftSection={<InboxIcon name="chevron-left" />} onClick={onBack}>
        Back to inboxes
      </Button>
      {inbox ? (
        <>
          <h2 className="lc-ib-detail__title">{inbox.name}</h2>
          <p className="lc-ib-detail__text">
            {TYPE_LABEL[inbox.type]} · {STATUS_LABEL[inbox.status]} · ID {inbox.id}
          </p>
        </>
      ) : (
        <h2 className="lc-ib-detail__title">Inbox not found</h2>
      )}
      <p className="lc-ib-detail__text">Inbox detail coming in phase 2.</p>
    </div>
  );
}
