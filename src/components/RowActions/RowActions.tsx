/**
 * RowActions — the Edit, Clone and Delete icon buttons a table row shows in Helpdesk Settings, in
 * place of the ⋯ menu. Clicks on them don't also select the row (see `selectRow`).
 *
 *   <RowActions name={row.name} onEdit={() => …} onClone={() => …} onDelete={() => …} />
 *
 * `overflow` keeps only Edit as an icon and moves Clone and Delete into a ⋯ menu.
 */
import { Icon } from '../icons';
import { ActionMenu } from '../Menu';
import { Tooltip } from '../Tooltip';
import './RowActions.css';

export function RowActions({ name, onEdit, onClone, onDelete, overflow = false }: {
  name: string;
  onEdit?: () => void;
  /** Adds a Clone action; omit for rows that can't be cloned. */
  onClone?: () => void;
  onDelete?: () => void;
  overflow?: boolean;
}) {
  return (
    <div className="lc-row-actions">
      <Tooltip label="Edit">
        <button type="button" className="lc-row-actions__btn" aria-label={`Edit ${name}`} onClick={onEdit}>
          <Icon name="pencil" />
        </button>
      </Tooltip>
      {overflow ? (
        <ActionMenu
          ariaLabel={`More actions for ${name}`}
          icon={<Icon name="dots-vertical" />}
          items={[
            ...(onClone ? [{ label: 'Clone', onClick: onClone }] : []),
            { label: 'Delete', danger: true, onClick: onDelete },
          ]}
        />
      ) : (
        <>
          {onClone && (
            <Tooltip label="Clone">
              <button type="button" className="lc-row-actions__btn" aria-label={`Clone ${name}`} onClick={onClone}>
                <Icon name="copy" />
              </button>
            </Tooltip>
          )}
          <Tooltip label="Delete">
            <button type="button" className="lc-row-actions__btn" data-danger aria-label={`Delete ${name}`} onClick={onDelete}>
              <Icon name="trash" />
            </button>
          </Tooltip>
        </>
      )}
    </div>
  );
}

export default RowActions;
