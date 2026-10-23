/**
 * ShopifyActionsPermissions — the rows of Settings → Integration → Shopify: which
 * Shopify actions agents may perform. Rendered as children of `<IntegrationSettings>`,
 * so they sit in its bordered label | control table under the status card.
 * Everything below the "Create Order" switch is disabled while it's off.
 *
 *   <IntegrationSettings partnerName="Shopify" fields={[]} changed={changed} …>
 *     <ShopifyActionsPermissions values={values} onChange={setValues} prepaidAvailable={razorpayConnected} />
 *   </IntegrationSettings>
 */
import { useId } from 'react';
import { Icon } from '../icons';
import { NativeSelect } from '../Select';
import { Tooltip } from '../Tooltip';
import './ShopifyActionsPermissions.css';

export interface ShopifyPermissions {
  createOrder: boolean;
  prepaid: boolean;
  cod: boolean;
  mandatoryField: string;
}

export const DEFAULT_SHOPIFY_PERMISSIONS: ShopifyPermissions = {
  createOrder: true,
  prepaid: false,
  cod: true,
  mandatoryField: 'Email',
};

const MANDATORY_FIELDS = ['Email', 'Phone number', 'Name', 'Shipping address'];

export interface ShopifyActionsPermissionsProps {
  values: ShopifyPermissions;
  onChange: (values: ShopifyPermissions) => void;
  /** Prepaid orders need the Razorpay integration; without it the option is disabled with a warning. */
  prepaidAvailable?: boolean;
}

export function ShopifyActionsPermissions({ values, onChange, prepaidAvailable = true }: ShopifyActionsPermissionsProps) {
  const id = useId();
  const off = !values.createOrder;
  const set = (patch: Partial<ShopifyPermissions>) => onChange({ ...values, ...patch });
  return (
    <>
      <div className="lc-is__row">
        <div className="lc-is__row-label">
          <span id={`${id}-title`} className="lc-is__label">Create Order</span>
          <p id={`${id}-desc`} className="lc-is__row-desc">
            Prepaid Order creation is enabled using the Razorpay Integration. Connect with your LimeChat CSM for
            setting it up to start creating prepaid orders.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={values.createOrder}
          aria-labelledby={`${id}-title`}
          aria-describedby={`${id}-desc`}
          className="lc-is__switch"
          onClick={() => set({ createOrder: !values.createOrder })}
        >
          <span className="lc-is__switch-thumb" aria-hidden="true" />
        </button>
      </div>

      <div className="lc-is__row">
        <div className="lc-is__row-label">
          <span className="lc-is__label">Order types</span>
        </div>
        <div className="lc-sap__checks" role="group" aria-label="Order types">
          <label className="lc-sap__check">
            <input
              type="checkbox"
              checked={values.prepaid && prepaidAvailable}
              disabled={off || !prepaidAvailable}
              onChange={(e) => set({ prepaid: e.currentTarget.checked })}
            />
            Prepaid Order
            {!prepaidAvailable && (
              <Tooltip label="Connect Razorpay to enable prepaid orders" position="bottom">
                <span className="lc-sap__warn" role="img" aria-label="Connect Razorpay to enable prepaid orders" tabIndex={0}>
                  <Icon name="alert-triangle" width={16} height={16} />
                </span>
              </Tooltip>
            )}
          </label>
          <label className="lc-sap__check">
            <input
              type="checkbox"
              checked={values.cod}
              disabled={off}
              onChange={(e) => set({ cod: e.currentTarget.checked })}
            />
            COD Order
          </label>
        </div>
      </div>

      <div className="lc-is__row">
        <div className="lc-is__row-label">
          <label className="lc-is__label" htmlFor={`${id}-mandatory`}>Mandatory fields</label>
          <p className="lc-is__row-desc">Needed before an order is created or updated.</p>
        </div>
        <NativeSelect
          id={`${id}-mandatory`}
          data={MANDATORY_FIELDS}
          value={values.mandatoryField}
          disabled={off}
          fullWidth
          onChange={(e) => set({ mandatoryField: e.currentTarget.value })}
        />
      </div>
    </>
  );
}

export default ShopifyActionsPermissions;
