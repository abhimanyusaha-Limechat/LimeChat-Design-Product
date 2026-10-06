/**
 * OrdersPanel — agent-facing order management browser rendered inside the
 * TicketDetailsPanel "Orders" tab. Self-contained: owns its own mock data,
 * search/sort state, and list <-> detail <-> create sub-view switching (no
 * overlay/modal/drawer — every view replaces the list in place), mirroring
 * the conventions established by ProductsPanel.
 *
 *   <OrdersPanel />
 */
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type InputHTMLAttributes,
  type ReactNode,
  type SetStateAction,
  type TextareaHTMLAttributes,
} from 'react';
import {
  type Address,
  type Order,
  type OrderLineItem,
  type OrderStatus,
  type SavedAddress,
} from '../../data/mockOrders';
import { MOCK_PRODUCTS } from '../../data/mockProducts';
import { useCommerce } from '../../context/CommerceContext';
import { Menu, type MenuItemData } from '../Menu';
import { Button } from '../Button';
import { Modal } from '../Modal';
import './OrdersPanel.css';
import { iconProps } from '../iconProps';
import { Icon, CloseIcon as ClearIcon, TrashIcon, CheckIcon } from '../icons';
import { formatINR } from '../formatINR';
import { addressesEqual, draftToOrder, emptyDraft, formatAddressForCopy, isDraftValid, type OrderDraft } from '../../data/orderDraft';
import { thumbPalette, useTypingPlaceholder } from '../catalogUtils';
import { ProductThumb } from '../ProductThumb';
import { HighlightMatch } from '../HighlightMatch';

type SortKey = 'recent' | 'oldest' | 'total_high_low' | 'total_low_high';

const SORT_LABEL: Record<SortKey, string> = {
  recent: 'Most recent',
  oldest: 'Oldest first',
  total_high_low: 'Total: High to Low',
  total_low_high: 'Total: Low to High',
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: 'Placed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  returned: 'Returned',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

const STATUS_UPDATE_TEXT: Record<OrderStatus, string> = {
  placed: 'Order placed',
  processing: 'Order is being processed',
  shipped: 'Order has shipped',
  delivered: 'Order delivered',
  returned: 'Order returned',
  cancelled: 'Order cancelled',
  refunded: 'Order refunded',
};

const CORE_STATUS_SEQUENCE: OrderStatus[] = ['placed', 'processing', 'shipped', 'delivered'];

/**
 * Builds the step-by-step history shown in the "Order updates" modal. No
 * per-transition timestamp exists in the data model, so dates are derived
 * by spacing a day per step forward from `placedAt` — illustrative, like
 * the rest of this mock catalog, not a claim of real event timestamps.
 */
function buildStatusTimeline(order: Order): { status: OrderStatus; date: string }[] {
  const base = new Date(order.placedAt);
  const dateAt = (daysAhead: number) => {
    const d = new Date(base);
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().slice(0, 10);
  };

  if (order.status === 'cancelled') {
    return [
      { status: 'placed', date: dateAt(0) },
      { status: 'cancelled', date: dateAt(1) },
    ];
  }

  if (order.status === 'returned' || order.status === 'refunded') {
    const steps = CORE_STATUS_SEQUENCE.map((status, i) => ({ status, date: dateAt(i) }));
    steps.push({ status: 'returned', date: dateAt(CORE_STATUS_SEQUENCE.length) });
    if (order.status === 'refunded') {
      steps.push({ status: 'refunded', date: dateAt(CORE_STATUS_SEQUENCE.length + 1) });
    }
    return steps;
  }

  const idx = CORE_STATUS_SEQUENCE.indexOf(order.status);
  return CORE_STATUS_SEQUENCE.slice(0, idx + 1).map((status, i) => ({ status, date: dateAt(i) }));
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
}

/** "ORD-10241" -> "10241" — the list shows just the order number, prefix omitted for scannability. */
function orderNumber(id: string): string {
  return id.replace(/^ORD-/, '');
}

const SEARCH_PLACEHOLDER_PHRASES = ['order ID', 'invoice name', 'product keyword'];

/** Animated overlay placeholder for the search input — cycles "Search by order ID / invoice name / product keyword...". */
function AnimatedSearchPlaceholder({ visible }: { visible: boolean }) {
  const typed = useTypingPlaceholder(SEARCH_PLACEHOLDER_PHRASES);
  if (!visible) return null;
  return (
    <span className="lc-op__search-placeholder" aria-hidden="true">
      Search by {typed}
      <span className="lc-op__search-caret" />
    </span>
  );
}

const SearchIcon = () => (
  <svg {...iconProps()}>
    <circle cx="10" cy="10" r="7" />
    <path d="M21 21l-6 -6" />
  </svg>
);
const SortIcon = () => <Icon name="arrows-sort" />;
const BackIcon = () => <Icon name="chevron-left" />;
const PlusIcon = () => <Icon name="plus" />;
const EditIcon = () => <Icon name="pencil" />;
const LinkIcon = () => (
  <svg {...iconProps()}>
    <path d="M9 15l6 -6" />
    <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" />
    <path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.533" />
  </svg>
);
const CopyIcon = () => (
  <svg {...iconProps()}>
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" />
  </svg>
);
function OrderStatusPill({ status, size = 'md' }: { status: OrderStatus; size?: 'sm' | 'md' }) {
  return (
    <span className="lc-op__status" data-status={status} data-size={size}>
      {STATUS_LABEL[status]}
    </span>
  );
}

/** Products + cost summary, combined into one card matching the Figma "Item_Description" component. */
type CostSummaryData = Pick<
  Order,
  | 'items'
  | 'subtotal'
  | 'discountAmount'
  | 'discountCode'
  | 'taxRate'
  | 'taxAmount'
  | 'shippingCost'
  | 'extraChargeLabel'
  | 'extraChargeAmount'
  | 'total'
>;

interface DiscountEditable {
  amount: string;
  code: string;
  onAmountChange: (amount: string) => void;
  onCodeChange: (code: string) => void;
}

interface ExtraChargeEditable {
  label: string;
  amount: string;
  onLabelChange: (label: string) => void;
  onAmountChange: (amount: string) => void;
}


const PRODUCT_IMAGE_BY_SKU: Record<string, string> = Object.fromEntries(
  MOCK_PRODUCTS.filter((p) => p.imageUrl).map((p) => [p.sku, p.imageUrl!]),
);

function ProductsCostCard({
  data,
  discountEditable,
  extraChargeEditable,
}: {
  data: CostSummaryData;
  discountEditable?: DiscountEditable;
  extraChargeEditable?: ExtraChargeEditable;
}) {
  const [discountOpen, setDiscountOpen] = useState(!!discountEditable && Number(discountEditable.amount) > 0);
  const [extraChargeOpen, setExtraChargeOpen] = useState(
    !!extraChargeEditable && Number(extraChargeEditable.amount) > 0,
  );

  return (
    <div className="lc-op__cost-card">
      {data.items.map((item, i) => (
        <div key={`${item.sku}-${i}`} className="lc-op__cost-item">
          <ProductThumb colorKey={item.sku} imageUrl={PRODUCT_IMAGE_BY_SKU[item.sku]} name={item.name} size={32} />

          <div className="lc-op__cost-item-main">
            <div className="lc-op__cost-item-top">
              <span className="lc-op__cost-item-name">{item.name}</span>
              <span className="lc-op__cost-item-unit-price">{formatINR(item.unitPrice)}</span>
            </div>
            <p className="lc-op__cost-item-sku">
              <span>
                {item.sku} <span className="lc-op__cost-item-sku-qty">×{item.quantity}</span>
              </span>
              <span className="lc-op__cost-item-sku-total">{formatINR(item.unitPrice * item.quantity)}</span>
            </p>
          </div>
        </div>
      ))}

      <div className="lc-op__cost-divider" />

      <div className="lc-op__cost-rows">
        <div className="lc-op__cost-row">
          <span>Item total</span>
          <span>{formatINR(data.subtotal)}</span>
        </div>
        <div className="lc-op__cost-row">
          <span>Tax ({data.taxRate}%)</span>
          <span>{formatINR(data.taxAmount)}</span>
        </div>

        <div className="lc-op__cost-row">
          <span>Shipping</span>
          <span>{data.shippingCost > 0 ? formatINR(data.shippingCost) : 'Free'}</span>
        </div>

        {discountEditable && discountOpen ? (
          <div className="lc-op__cost-row lc-op__cost-row-inline-edit">
            <span>Discount</span>
            <span className="lc-op__cost-row-inline-edit-controls">
              <TextInput
                type="number"
                min={0}
                placeholder="Amount (₹)"
                value={discountEditable.amount}
                onChange={(e) => discountEditable.onAmountChange(e.currentTarget.value)}
              />
              <button
                type="button"
                className="lc-op__cost-remove-btn"
                aria-label="Remove discount"
                onClick={() => {
                  discountEditable.onAmountChange('0');
                  discountEditable.onCodeChange('');
                  setDiscountOpen(false);
                }}
              >
                <TrashIcon />
              </button>
            </span>
          </div>
        ) : discountEditable ? (
          <button type="button" className="lc-op__cost-add-btn" onClick={() => setDiscountOpen(true)}>
            <PlusIcon />
            Add discount
          </button>
        ) : (
          data.discountAmount > 0 && (
            <div className="lc-op__cost-row">
              <span>Discount{data.discountCode ? ` (${data.discountCode})` : ''}</span>
              <span>−{formatINR(data.discountAmount)}</span>
            </div>
          )
        )}

        {extraChargeEditable && extraChargeOpen ? (
          <div className="lc-op__cost-row lc-op__cost-row-inline-edit">
            <span>Extra charge</span>
            <span className="lc-op__cost-row-inline-edit-controls">
              <TextInput
                type="number"
                min={0}
                placeholder="Amount (₹)"
                value={extraChargeEditable.amount}
                onChange={(e) => extraChargeEditable.onAmountChange(e.currentTarget.value)}
              />
              <button
                type="button"
                className="lc-op__cost-remove-btn"
                aria-label="Remove extra charge"
                onClick={() => {
                  extraChargeEditable.onAmountChange('0');
                  extraChargeEditable.onLabelChange('');
                  setExtraChargeOpen(false);
                }}
              >
                <TrashIcon />
              </button>
            </span>
          </div>
        ) : extraChargeEditable ? (
          <button type="button" className="lc-op__cost-add-btn" onClick={() => setExtraChargeOpen(true)}>
            <PlusIcon />
            Add extra charge
          </button>
        ) : (
          !!data.extraChargeAmount &&
          data.extraChargeAmount > 0 && (
            <div className="lc-op__cost-row">
              <span>{data.extraChargeLabel || 'Extra charge'}</span>
              <span>{formatINR(data.extraChargeAmount)}</span>
            </div>
          )
        )}
      </div>

      <div className="lc-op__cost-divider" />

      <div className="lc-op__cost-total">
        <span>Total Price</span>
        <span>{formatINR(data.total)}</span>
      </div>
    </div>
  );
}

function OrderRow({ order, search, onClick }: { order: Order; search: string; onClick: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = order.items.length > 1;
  const visibleItems = expanded ? order.items : order.items.slice(0, 1);

  return (
    <div
      className="lc-op__row"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="lc-op__row-heading">
        <span className="lc-op__row-id-group">
          <span className="lc-op__row-id">
            <HighlightMatch text={orderNumber(order.id)} query={search} />
          </span>
          <OrderStatusPill status={order.status} size="sm" />
        </span>
        <span className="lc-op__row-date">{formatDate(order.placedAt)}</span>
      </div>
      <div className="lc-op__row-items">
        {visibleItems.map((item, i) => (
          <span key={`${item.sku}-${i}`} className="lc-op__row-item">
            <span
              className="lc-op__row-item-thumb"
              style={PRODUCT_IMAGE_BY_SKU[item.sku] ? undefined : { background: thumbPalette(item.sku).bg }}
              aria-hidden="true"
            >
              {PRODUCT_IMAGE_BY_SKU[item.sku] && <img src={PRODUCT_IMAGE_BY_SKU[item.sku]} alt="" />}
            </span>
            <span className="lc-op__row-item-name">
              <HighlightMatch text={item.name} query={search} />
            </span>
            <span className="lc-op__row-item-qty">×{item.quantity}</span>
          </span>
        ))}
      </div>
      <div className="lc-op__row-footer">
        <span className="lc-op__row-count">
          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
          {hasMore && (
            <button
              type="button"
              className="lc-op__row-item-more"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
            >
              {expanded ? 'Show less' : 'Show all'}
            </button>
          )}
        </span>
        <span className="lc-op__row-total">{formatINR(order.total)}</span>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i} className="lc-op__row--skeleton">
          <span className="lc-op__skel lc-op__skel-line lc-op__skel-line--lg" />
          <span className="lc-op__skel lc-op__skel-line lc-op__skel-line--sm" />
          <span className="lc-op__skel lc-op__skel-line" />
        </div>
      ))}
    </>
  );
}

function EmptyState({ searching }: { searching: boolean }) {
  return (
    <div className="lc-op__empty">
      <span className="lc-op__empty-title">{searching ? 'No orders found' : 'No orders yet'}</span>
      <span className="lc-op__empty-subtext">
        {searching
          ? 'Try searching with a different order ID, invoice name, or product.'
          : 'Orders placed by this customer will appear here.'}
      </span>
    </div>
  );
}

/* --- Shared order form (used by both in-place edit mode and Create) ----- */

function Field({ label, full, children }: { label: string; full?: boolean; children: ReactNode }) {
  return (
    <label className={`lc-op__field${full ? ' lc-op__field--full' : ''}`}>
      <span className="lc-op__field-label">{label}</span>
      {children}
    </label>
  );
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input {...rest} className={`lc-op__input${className ? ` ${className}` : ''}`} />;
}

function TextareaInput(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, rows, ...rest } = props;
  return <textarea {...rest} rows={rows ?? 3} className={`lc-op__textarea${className ? ` ${className}` : ''}`} />;
}

function AddressFields({ value, onChange }: { value: Address; onChange: (next: Address) => void }) {
  const set = <K extends keyof Address>(key: K, v: Address[K]) => onChange({ ...value, [key]: v });
  return (
    <div className="lc-op__address-grid">
      <Field label="Full name">
        <TextInput value={value.name} onChange={(e) => set('name', e.currentTarget.value)} />
      </Field>
      <Field label="Phone">
        <TextInput value={value.phone ?? ''} onChange={(e) => set('phone', e.currentTarget.value)} />
      </Field>
      <Field label="Address line 1" full>
        <TextInput value={value.line1} onChange={(e) => set('line1', e.currentTarget.value)} />
      </Field>
      <Field label="Address line 2 (optional)" full>
        <TextInput value={value.line2 ?? ''} onChange={(e) => set('line2', e.currentTarget.value)} />
      </Field>
      <Field label="City">
        <TextInput value={value.city} onChange={(e) => set('city', e.currentTarget.value)} />
      </Field>
      <Field label="State">
        <TextInput value={value.state} onChange={(e) => set('state', e.currentTarget.value)} />
      </Field>
      <Field label="Postal code">
        <TextInput value={value.postalCode} onChange={(e) => set('postalCode', e.currentTarget.value)} />
      </Field>
      <Field label="Country">
        <TextInput value={value.country} onChange={(e) => set('country', e.currentTarget.value)} />
      </Field>
    </div>
  );
}

/**
 * Saved-address picker: pick a saved address, edit one of them in place, or
 * add a new address with an option to save it for reuse next time.
 * The saved addresses come from the Commerce session, so the pickers on one order,
 * and later orders for the same ticket, share one list. Which saved address is
 * selected is derived from `value`; only the edit session and the "add new"
 * choice are local state.
 */
function AddressPicker({ value, onChange }: { value: Address; onChange: (next: Address) => void }) {
  const { savedAddresses, saveAddress, updateAddress } = useCommerce();
  const groupName = useId();
  const matchedSaved = savedAddresses.find((saved) => addressesEqual(saved.address, value));
  // Picked "+ Add new address" while the value still equals a saved one.
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Address>(value);
  const [newLabel, setNewLabel] = useState('');
  const isNew = adding || !matchedSaved;

  const startEdit = (saved: SavedAddress) => {
    setEditingId(saved.id);
    setEditDraft(saved.address);
  };

  const saveNewAddress = () => {
    saveAddress(newLabel.trim() || 'New address', value);
    setAdding(false);
    setNewLabel('');
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateAddress(editingId, editDraft);
    if (matchedSaved?.id === editingId) onChange(editDraft);
    setEditingId(null);
  };

  if (editingId) {
    return (
      <div className="lc-op__address-picker">
        <div className="lc-op__address-new">
          <AddressFields value={editDraft} onChange={setEditDraft} />
          <div className="lc-op__address-edit-actions">
            <Button variant="outline" color="gray" size="xs" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
            <Button variant="filled" color="primary" size="xs" onClick={saveEdit}>
              Save changes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lc-op__address-picker">
      {savedAddresses.map((saved) => {
        const selected = !isNew && matchedSaved?.id === saved.id;
        return (
          <label key={saved.id} className="lc-op__address-option" data-selected={selected || undefined}>
            <input
              type="radio"
              name={groupName}
              checked={selected}
              onChange={() => {
                setAdding(false);
                onChange(saved.address);
              }}
            />
            <span className="lc-op__address-option-body">
              <span className="lc-op__address-option-label">{saved.label}</span>
              <span className="lc-op__address-option-text">
                {saved.address.line1}, {saved.address.city}, {saved.address.state} {saved.address.postalCode}
              </span>
            </span>
            <button
              type="button"
              className="lc-op__address-edit-btn"
              aria-label={`Edit ${saved.label} address`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                startEdit(saved);
              }}
            >
              <EditIcon />
            </button>
          </label>
        );
      })}

      <label className="lc-op__address-option" data-selected={isNew || undefined}>
        <input
          type="radio"
          name={groupName}
          checked={isNew}
          onChange={() => {
            setAdding(true);
            setNewLabel('');
          }}
        />
        <span className="lc-op__address-option-label">+ Add new address</span>
      </label>

      {isNew && (
        <div className="lc-op__address-new">
          <AddressFields value={value} onChange={onChange} />
          <div className="lc-op__address-new-save">
            <TextInput
              placeholder="Save as (e.g. Home, Office)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.currentTarget.value)}
            />
            <Button variant="outline" color="primary" size="xs" onClick={saveNewAddress}>
              Save address
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function CopyIconButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard access denied/unavailable — the value simply won't confirm.
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1000);
  };

  return (
    <button type="button" className="lc-op__address-copy" aria-label={label} onClick={handleCopy}>
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}

function AddressBlock({ address }: { address: Address }) {
  return (
    <div className="lc-op__address-block">
      <span>{address.line1}</span>
      {address.line2 && <span>{address.line2}</span>}
      <span>
        {address.city}, {address.state} {address.postalCode}
      </span>
      <span>{address.country}</span>
      {address.phone && <span className="lc-op__address-phone">{address.phone}</span>}
    </div>
  );
}

function OrderFormFields({
  draft,
  setDraft,
}: {
  draft: OrderDraft;
  setDraft: Dispatch<SetStateAction<OrderDraft>>;
}) {
  return (
    <>
      <div className="lc-op__detail-section">
        <p className="lc-op__detail-section-title">Cost summary</p>
        <ProductsCostCard
          data={draftToOrder(draft)}
          discountEditable={{
            amount: draft.discountAmount,
            code: draft.discountCode,
            onAmountChange: (discountAmount) => setDraft((d) => ({ ...d, discountAmount })),
            onCodeChange: (discountCode) => setDraft((d) => ({ ...d, discountCode })),
          }}
          extraChargeEditable={{
            label: draft.extraChargeLabel,
            amount: draft.extraChargeAmount,
            onLabelChange: (extraChargeLabel) => setDraft((d) => ({ ...d, extraChargeLabel })),
            onAmountChange: (extraChargeAmount) => setDraft((d) => ({ ...d, extraChargeAmount })),
          }}
        />
      </div>

      <div className="lc-op__detail-section">
        <p className="lc-op__detail-section-title">Shipping address</p>
        <AddressPicker
          value={draft.shippingAddress}
          onChange={(shippingAddress) => setDraft((d) => ({ ...d, shippingAddress }))}
        />
      </div>

      <div className="lc-op__detail-section">
        <p className="lc-op__detail-section-title">Billing address</p>
        <span className="lc-op__detail-muted lc-op__detail-card">Same as shipping address</span>
      </div>

      <div className="lc-op__detail-section">
        <p className="lc-op__detail-section-title">Notes</p>
        <TextareaInput
          placeholder="Add a note for this order..."
          value={draft.notes}
          onChange={(e) => {
            const notes = e.currentTarget.value;
            setDraft((d) => ({ ...d, notes }));
          }}
        />
      </div>
    </>
  );
}

/** Current-status callout — dot + status text + date, with a link to jump to the tracking section. */
function OrderStatusCard({ order, onSeeUpdates }: { order: Order; onSeeUpdates: () => void }) {
  const hasUpdates = buildStatusTimeline(order).length > 1;
  return (
    <div className="lc-op__status-card">
      <div className="lc-op__status-card-main">
        <div className="lc-op__status-card-row">
          <span className="lc-op__status-card-title">{STATUS_UPDATE_TEXT[order.status]}</span>
        </div>
        <span className="lc-op__status-card-date">{formatDate(order.placedAt)}</span>
      </div>
      {hasUpdates && (
        <button type="button" className="lc-op__status-card-link" onClick={onSeeUpdates}>
          See updates
        </button>
      )}
    </div>
  );
}

/* --- Order detail (read mode + in-place edit mode) ----------------------- */

function OrderDetailView({
  order,
  onBack,
}: {
  order: Order;
  onBack: () => void;
}) {
  const [updatesOpen, setUpdatesOpen] = useState(false);

  return (
    <div className="lc-op__detail">
      <div className="lc-op__detail-sticky">
        <button type="button" className="lc-op__detail-back" onClick={onBack}>
          <BackIcon />
          <span>Back to orders</span>
        </button>
      </div>

      <div className="lc-op__detail-content">
        <div className="lc-op__detail-header">
          <div className="lc-op__detail-row lc-op__detail-row--id">
            <span className="lc-op__detail-value--id">{orderNumber(order.id)}</span>
            <OrderStatusPill status={order.status} />
          </div>
          <div className="lc-op__detail-row">
            <span className="lc-op__detail-row-label">Invoice name</span>
            <span className="lc-op__detail-row-value">{order.invoiceName}</span>
          </div>
          <div className="lc-op__detail-row">
            <span className="lc-op__detail-row-label">Placed on</span>
            <span className="lc-op__detail-row-value">{formatDate(order.placedAt)}</span>
          </div>
        </div>

        <OrderStatusCard order={order} onSeeUpdates={() => setUpdatesOpen(true)} />

            <div className="lc-op__detail-section">
              <p className="lc-op__detail-section-title">Cost summary</p>
              <ProductsCostCard data={order} />
            </div>

            <div className="lc-op__detail-section">
              <p className="lc-op__detail-section-title">Tracking link</p>
              {order.trackingLink ? (
                <a className="lc-op__tracking-link" href={order.trackingLink} target="_blank" rel="noreferrer">
                  <LinkIcon />
                  <span>{order.trackingLink}</span>
                </a>
              ) : (
                <span className="lc-op__detail-muted">Not available yet</span>
              )}
            </div>

            <div className="lc-op__detail-section">
              <div className="lc-op__detail-section-title-row">
                <p className="lc-op__detail-section-title">Shipping address</p>
                <span className="lc-op__detail-section-actions">
                  <CopyIconButton value={formatAddressForCopy(order.shippingAddress)} label="Copy address" />
                </span>
              </div>
              <AddressBlock address={order.shippingAddress} />
            </div>

            <div className="lc-op__detail-section">
              <div className="lc-op__detail-section-title-row">
                <p className="lc-op__detail-section-title">Billing address</p>
                <span className="lc-op__detail-section-actions">
                  {!order.billingSameAsShipping && (
                    <CopyIconButton value={formatAddressForCopy(order.billingAddress)} label="Copy address" />
                  )}
                </span>
              </div>
              {order.billingSameAsShipping ? (
                <span className="lc-op__detail-muted lc-op__detail-card">Same as shipping address</span>
              ) : (
                <AddressBlock address={order.billingAddress} />
              )}
            </div>

            <div className="lc-op__detail-section">
              <div className="lc-op__detail-section-title-row">
                <p className="lc-op__detail-section-title">Notes</p>
                <span className="lc-op__detail-section-actions">
                  {order.notes && <CopyIconButton value={order.notes} label="Copy notes" />}
                </span>
              </div>
              <p className="lc-op__detail-notes lc-op__detail-card">{order.notes || 'No notes added.'}</p>
            </div>
      </div>

      <Modal
        open={updatesOpen}
        onClose={() => setUpdatesOpen(false)}
        title="Order updates"
        width={360}
        footer={
          <Button variant="subtle" color="primary" size="sm" onClick={() => setUpdatesOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="lc-op__timeline">
          {buildStatusTimeline(order).map((step, i, arr) => (
            <div key={`${step.status}-${i}`} className="lc-op__timeline-item" data-last={i === arr.length - 1 || undefined}>
              <span className="lc-op__timeline-dot-col">
                <span className="lc-op__timeline-dot" />
              </span>
              <div className="lc-op__timeline-text">
                <p className="lc-op__timeline-title">{STATUS_UPDATE_TEXT[step.status]}</p>
                <p className="lc-op__timeline-date">{formatDate(step.date)}</p>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

/* --- Create order ---------------------------------------------------------- */

function CreateOrderView({
  existingOrders,
  initialItems,
  onBack,
  onCreate,
}: {
  existingOrders: Order[];
  initialItems?: OrderLineItem[];
  onBack: () => void;
  onCreate: (order: Order) => void;
}) {
  const [draft, setDraft] = useState<OrderDraft>(() => emptyDraft(initialItems));
  const valid = isDraftValid(draft);

  const handleCreate = () => {
    if (!valid) return;
    onCreate(draftToOrder(draft, existingOrders));
  };

  return (
    <div className="lc-op__detail">
      <button type="button" className="lc-op__detail-back" onClick={onBack}>
        <BackIcon />
        <span>Back to cart</span>
      </button>

      <div className="lc-op__detail-content">
        <div className="lc-op__detail-header">
          <span className="lc-op__detail-invoice">Creating new order</span>
        </div>

        <OrderFormFields draft={draft} setDraft={setDraft} />

        <div className="lc-op__detail-ctas lc-op__detail-ctas--sticky-bottom">
          <Button variant="outline" color="gray" size="sm" style={{ flex: 1 }} onClick={onBack}>
            Cart
          </Button>
          <Button variant="filled" color="primary" size="sm" style={{ flex: 1 }} disabled={!valid} onClick={handleCreate}>
            Create order
          </Button>
        </div>
      </div>
    </div>
  );
}

/* --- Top-level panel -------------------------------------------------------- */

export function OrdersPanel() {
  const { orders, orderView, openOrder, backToList, createOrder, cancelCreate } = useCommerce();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  // Returning to the list slides back; every other change slides forward.
  const [shownKind, setShownKind] = useState(orderView.kind);
  const [navDirection, setNavDirection] = useState<'forward' | 'back'>('forward');
  if (shownKind !== orderView.kind) {
    setShownKind(orderView.kind);
    setNavDirection(orderView.kind === 'list' ? 'back' : 'forward');
  }

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 500);
    return () => window.clearTimeout(t);
  }, []);

  const filteredSorted = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = orders.filter((o) => {
      if (!query) return true;
      const haystack = `${o.id} ${o.invoiceName} ${o.items.map((i) => i.name).join(' ')}`.toLowerCase();
      return haystack.includes(query);
    });

    list = [...list];
    switch (sortKey) {
      case 'oldest':
        list.sort((a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime());
        break;
      case 'total_high_low':
        list.sort((a, b) => b.total - a.total);
        break;
      case 'total_low_high':
        list.sort((a, b) => a.total - b.total);
        break;
      default:
        list.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
        break;
    }
    return list;
  }, [orders, search, sortKey]);

  const selectedOrder = orderView.kind === 'detail' ? orders.find((o) => o.id === orderView.orderId) ?? null : null;

  if (orderView.kind === 'create') {
    return (
      <div className="lc-op">
        <div className="lc-op__view" data-direction="forward" key="create">
          <CreateOrderView
            existingOrders={orders}
            initialItems={orderView.items}
            onBack={cancelCreate}
            onCreate={createOrder}
          />
        </div>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div className="lc-op">
        <div className="lc-op__view" data-direction={navDirection} key="detail">
          <OrderDetailView
            order={selectedOrder}
            onBack={backToList}
          />
        </div>
      </div>
    );
  }

  const sortItems: MenuItemData[] = (Object.keys(SORT_LABEL) as SortKey[]).map((key) => ({
    key,
    label: SORT_LABEL[key],
    selected: sortKey === key,
    onClick: () => setSortKey(key),
  }));

  return (
    <div className="lc-op">
      <div className="lc-op__view" data-direction={navDirection} key="list">
        <div className="lc-op__search-row">
          <span className="lc-op__search">
            <SearchIcon />
            <input
              className="lc-op__search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
            <AnimatedSearchPlaceholder visible={!search} />
            {search && (
              <button type="button" className="lc-op__search-clear" aria-label="Clear search" onClick={() => setSearch('')}>
                <ClearIcon />
              </button>
            )}
          </span>
          <Menu
            items={sortItems}
            ariaLabel="Sort orders"
            align="end"
            width={190}
            trigger={({ ref, onClick }) => (
              <button
                ref={ref}
                type="button"
                className="lc-op__toolbar-btn"
                aria-label="Sort orders"
                data-active={sortKey !== 'recent' || undefined}
                onClick={onClick}
              >
                <SortIcon />
              </button>
            )}
          />
        </div>

        <div className="lc-op__results-line">All orders · {loading ? '...' : filteredSorted.length}</div>

        <div className="lc-op__list">
          {loading ? (
            <SkeletonRows />
          ) : filteredSorted.length === 0 ? (
            <EmptyState searching={search.trim() !== ''} />
          ) : (
            filteredSorted.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                search={search}
                onClick={() => openOrder(order.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default OrdersPanel;
