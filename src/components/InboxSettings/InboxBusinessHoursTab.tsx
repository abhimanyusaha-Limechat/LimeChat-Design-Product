/**
 * The Business Hours tab of InboxSettings: when this inbox counts as open, per weekday.
 * Each day has an on/off switch and one or more slots of starting hour + length; the
 * closing hour is derived. The master switch dims everything below it.
 */
import { Fragment, useId } from 'react';
import { Button } from '../Button';
import { Icon } from '../icons';
import { TIMEZONE_OPTIONS } from '../ProfileSettings';
import { NativeSelect, type SelectItem } from '../Select';
import { SectionHeading } from './InboxSettingsSections';

export interface BusinessHoursSlot {
  /** Minutes after midnight. */
  start: number;
  /** Length of the slot in hours, in half-hour steps. */
  hours: number;
}

export interface BusinessHoursDay {
  enabled: boolean;
  slots: BusinessHoursSlot[];
}

export interface InboxBusinessHours {
  enabled: boolean;
  timezone: string;
  /** Shown to visitors outside the available hours. */
  unavailableMessage: string;
  /** Sunday first. */
  days: BusinessHoursDay[];
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DAY_MINUTES = 24 * 60;

function formatTime(minutes: number) {
  const m = ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const h24 = Math.floor(m / 60);
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2, '0')}:${String(m % 60).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`;
}

const START_OPTIONS: SelectItem[] = Array.from({ length: 48 }, (_, i) => ({
  value: String(i * 30),
  label: formatTime(i * 30).replace(/^0/, ''),
}));

const HOURS_OPTIONS: SelectItem[] = Array.from({ length: 48 }, (_, i) => {
  const hours = (i + 1) / 2;
  return { value: String(hours), label: `${hours} ${hours === 1 ? 'HOUR' : 'HOURS'}` };
});

const closing = (slot: BusinessHoursSlot) => formatTime(slot.start + slot.hours * 60);

function DayRow({
  name,
  day,
  off,
  onChange,
}: {
  name: string;
  day: BusinessHoursDay;
  off: boolean;
  onChange: (next: BusinessHoursDay) => void;
}) {
  const labelId = useId();
  const slotsOff = off || !day.enabled;
  const setSlot = (index: number, patch: Partial<BusinessHoursSlot>) =>
    onChange({ ...day, slots: day.slots.map((s, i) => (i === index ? { ...s, ...patch } : s)) });
  const last = day.slots[day.slots.length - 1];
  return (
    <div className="lc-inbs__row lc-inbs__row--top lc-inbs__day" data-disabled={off} role="group" aria-labelledby={labelId}>
      <div className="lc-inbs__day-head">
        <span id={labelId} className="lc-inbs__label">{name}</span>
        <button
          type="button"
          role="switch"
          aria-checked={day.enabled}
          aria-label={`${name} open`}
          disabled={off}
          className="lc-inbs__switch-track"
          onClick={() => onChange({ ...day, enabled: !day.enabled })}
        >
          <span className="lc-inbs__switch-thumb" />
        </button>
      </div>
      <div className="lc-inbs__slots" data-disabled={slotsOff}>
        <div className="lc-inbs__slot lc-inbs__slot--head" aria-hidden="true">
          <span className="lc-inbs__field-label">Starting hour</span>
          <span className="lc-inbs__field-label">Hours</span>
          <span className="lc-inbs__field-label lc-inbs__closing-head">Closing hour</span>
          <span />
        </div>
        {day.slots.map((slot, i) => (
          // Slots have no identity beyond their position; removing one renumbers the rest.
          <Fragment key={i}>
            {i > 0 && <span className="lc-inbs__and" aria-hidden="true"><span className="lc-inbs__and-pill">AND</span></span>}
            <div className="lc-inbs__slot">
              <NativeSelect
                size="sm"
                fullWidth
                aria-label={`${name} slot ${i + 1} starting hour`}
                data={START_OPTIONS}
                value={String(slot.start)}
                disabled={slotsOff}
                onChange={(e) => setSlot(i, { start: Number(e.currentTarget.value) })}
              />
              <NativeSelect
                size="sm"
                fullWidth
                aria-label={`${name} slot ${i + 1} hours`}
                data={HOURS_OPTIONS}
                value={String(slot.hours)}
                disabled={slotsOff}
                onChange={(e) => setSlot(i, { hours: Number(e.currentTarget.value) })}
              />
              <span className="lc-inbs__closing">{closing(slot)}</span>
              {day.slots.length > 1 ? (
                <Button
                  variant="outline"
                  color="red"
                  size="xs"
                  className="lc-inbs__icon-btn"
                  leftSection={<Icon name="trash" size={14} />}
                  disabled={slotsOff}
                  aria-label={`Remove ${name} slot ${i + 1}`}
                  title="Remove hours"
                  onClick={() => onChange({ ...day, slots: day.slots.filter((_, j) => j !== i) })}
                />
              ) : (
                <span />
              )}
            </div>
          </Fragment>
        ))}
        <Button
          variant="outline"
          size="xs"
          className="lc-inbs__icon-btn"
          leftSection={<Icon name="plus" size={14} />}
          disabled={slotsOff}
          aria-label={`Add ${name} hours`}
          title="Add hours"
          // A new slot starts where the last one closes and runs for an hour.
          onClick={() => onChange({ ...day, slots: [...day.slots, { start: (last.start + last.hours * 60) % DAY_MINUTES, hours: 1 }] })}
        />
      </div>
    </div>
  );
}

export function BusinessHoursTab({
  value,
  onChange,
}: {
  value: InboxBusinessHours;
  onChange: (next: InboxBusinessHours) => void;
}) {
  const timezoneId = useId();
  const messageId = useId();
  const off = !value.enabled;
  const set = (patch: Partial<InboxBusinessHours>) => onChange({ ...value, ...patch });
  return (
    <>
      <section className="lc-inbs__group" aria-label="Business hours availability">
        <SectionHeading
          title="Business hours availability"
          description="Show the available hours on the widget even when every agent is offline. Outside those hours, visitors see a message and a pre-chat form."
          toggle={{ checked: value.enabled, onChange: (enabled) => set({ enabled }) }}
        />
        <div className="lc-inbs__table">
          <div className="lc-inbs__row" data-disabled={off}>
            <div className="lc-inbs__row-label">
              <label className="lc-inbs__label" htmlFor={timezoneId}>Timezone</label>
              <p className="lc-inbs__row-desc">Hours below are in this timezone.</p>
            </div>
            <NativeSelect
              id={timezoneId}
              size="sm"
              fullWidth
              data={TIMEZONE_OPTIONS}
              value={value.timezone}
              disabled={off}
              onChange={(e) => set({ timezone: e.currentTarget.value })}
            />
          </div>
          <div className="lc-inbs__row" data-disabled={off}>
            <div className="lc-inbs__row-label">
              <label className="lc-inbs__label" htmlFor={messageId}>Unavailable message for visitors</label>
              <p className="lc-inbs__row-desc">Shown when nobody is available.</p>
            </div>
            <textarea
              id={messageId}
              className="lc-inbs__input lc-inbs__textarea"
              rows={4}
              value={value.unavailableMessage}
              disabled={off}
              onChange={(e) => set({ unavailableMessage: e.currentTarget.value })}
            />
          </div>
        </div>
      </section>

      <section className="lc-inbs__group" aria-label="Default business hours">
        <SectionHeading title="Default business hours" description="When this inbox is open, day by day." />
        <div className="lc-inbs__table">
          {value.days.map((day, i) => (
            <DayRow
              key={DAY_NAMES[i]}
              name={DAY_NAMES[i]}
              day={day}
              off={off}
              onChange={(next) => set({ days: value.days.map((d, j) => (j === i ? next : d)) })}
            />
          ))}
        </div>
      </section>
    </>
  );
}
