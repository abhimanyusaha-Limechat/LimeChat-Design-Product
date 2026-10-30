/**
 * SLA rules tab → Edit: what a policy matches (Conditions), the time allowed (Metrics), who is
 * reminded (Setup Reminders) and who is notified or assigned on a breach (Setup Escalations).
 * Controlled: every edit goes out through `onChange` and the caller saves the draft when Update is clicked.
 */
import { useRef } from 'react';
import { Button } from '../Button';
import { Icon } from '../icons';
import { NativeSelect } from '../Select';
import { TagsInput } from '../TagsInput';
import { SLA_FIELDS, SLA_METRICS, SLA_RECIPIENTS, metricLabel, type SlaPolicy, type SlaRecipients } from '../../data/slaPolicyDemo';
import { clamp } from '../InboxSettings/InboxSettingsSections';
import { Card, RemoveButton, StackBox, replaceAt } from './RuleEdit';
import { duration } from './SlaPolicyDetails';

type Reminder = SlaPolicy['reminders'][number];
type Escalation = SlaPolicy['escalations'][number];
type Step = Escalation['steps'][number];

const FIELD_NAMES = Object.keys(SLA_FIELDS);
const METRIC_OPTIONS = SLA_METRICS.map((metric) => ({ value: metric, label: metricLabel(metric) }));

/** The policy can be saved once every condition, reminder and escalation level has its values. */
export const isSlaComplete = ({ conditions, reminders, escalations }: SlaPolicy) =>
  conditions.every((c) => c.values.length > 0) &&
  reminders.every((r) => r.to.length > 0) &&
  escalations.every((e) =>
    e.steps.every(({ notify, assign }) => (notify || assign) && (!notify || notify.to.length > 0) && (!assign || assign.to.length > 0)),
  );

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`;
/** 0 → "Immediately", 30 → "30 Minutes", 120 → "2 Hours", 1440 → "1 Day". */
const delayLabel = (minutes: number) =>
  minutes === 0
    ? 'Immediately'
    : minutes % 1440 === 0
      ? plural(minutes / 1440, 'Day')
      : minutes >= 60 && minutes % 60 === 0
        ? plural(minutes / 60, 'Hour')
        : plural(minutes, 'Minute');
/** For an escalation: "Immediately", or "After 5 Minutes". */
const afterLabel = (minutes: number) => (minutes === 0 ? delayLabel(0) : `After ${delayLabel(minutes)}`);
const DELAYS = [5, 10, 15, 30, 45, 60, 120, 240, 480, 1440];

const ORDINALS = ['1st', '2nd', '3rd'];
const ordinal = (n: number) => ORDINALS[n - 1] ?? `${n}th`;

/** A time picked from a short list (or "Immediately"); a saved time that isn't on the list stays selectable. */
function DelaySelect({
  label,
  labelled,
  value,
  allowZero,
  after,
  disabled,
  onChange,
}: {
  label: string;
  /** Shows `label` above the dropdown; otherwise it only names it for assistive tech. */
  labelled?: boolean;
  value: number;
  allowZero?: boolean;
  /** Words the times as "After 5 Minutes" instead of "5 Minutes". */
  after?: boolean;
  disabled?: boolean;
  onChange: (minutes: number) => void;
}) {
  const minutes = [...new Set([...(allowZero ? [0] : []), ...DELAYS, value])].sort((a, b) => a - b);
  return (
    <NativeSelect
      size="sm"
      {...(labelled ? { label } : { 'aria-label': label })}
      disabled={disabled}
      wrapperClassName="lc-re__control"
      data={minutes.map((m) => ({ value: String(m), label: after ? afterLabel(m) : delayLabel(m) }))}
      value={String(value)}
      onChange={(e) => onChange(Number(e.currentTarget.value))}
    />
  );
}

/** One metric's time as Days | Hours | Minutes, like the inbox durations. A time can't be zero, so that change is refused. */
function TimeInputs({ minutes, onChange }: { minutes: number; onChange: (minutes: number) => void }) {
  const day = Math.floor(minutes / 1440);
  const hour = Math.floor((minutes % 1440) / 60);
  const minute = minutes % 60;
  const part = (label: string, value: number, max: number | undefined, toMinutes: (n: number) => number) => (
    <label className="lc-inbs__field">
      <span className="lc-inbs__field-label">{label}</span>
      <input
        type="number"
        min={0}
        max={max}
        className="lc-inbs__input"
        value={value}
        onChange={(e) => {
          const next = minutes - toMinutes(value) + toMinutes(clamp(e.currentTarget.valueAsNumber, max));
          if (next > 0) onChange(next);
        }}
      />
    </label>
  );
  return (
    <div className="lc-inbs__duration">
      {part('Days', day, undefined, (n) => n * 1440)}
      {part('Hours', hour, 23, (n) => n * 60)}
      {part('Minutes', minute, 59, (n) => n)}
    </div>
  );
}

/** "Notify" or "Assign ticket": ticked, it takes recipients and a delay. The rows share one grid so they line up. */
function RecipientsRow({
  label,
  checkedLabel = label,
  name,
  value,
  onChange,
}: {
  label: string;
  /** The label once ticked; `label` unless given. */
  checkedLabel?: string;
  name: string;
  value?: SlaRecipients;
  onChange: (next?: SlaRecipients) => void;
}) {
  // What was set before it was ticked off, so ticking it on again brings it back.
  const lastOn = useRef<SlaRecipients | undefined>(undefined);
  const off = !value;
  const shown = value ?? lastOn.current ?? { to: [], afterMinutes: 0 };
  return (
    <div className="lc-re__recipients" data-on={!off || undefined}>
      <label className="lc-re__check">
        <input
          type="checkbox"
          checked={!off}
          onChange={(e) => {
            if (e.currentTarget.checked) {
              onChange(lastOn.current ?? { to: [SLA_RECIPIENTS[0]], afterMinutes: 0 });
            } else {
              lastOn.current = value;
              onChange(undefined);
            }
          }}
        />
        {off ? label : checkedLabel}
      </label>
      <TagsInput
        className="lc-re__tags"
        ariaLabel={`${name} recipients`}
        placeholder="Search"
        data={SLA_RECIPIENTS}
        disabled={off}
        value={shown.to}
        onChange={(to) => onChange({ ...shown, to })}
      />
      <DelaySelect
        label={`${name} delay`}
        allowZero
        after
        disabled={off}
        value={shown.afterMinutes}
        onChange={(afterMinutes) => onChange({ ...shown, afterMinutes })}
      />
    </div>
  );
}

export function SlaEdit({ policy, onChange }: { policy: SlaPolicy; onChange: (patch: Partial<SlaPolicy>) => void }) {
  const { conditions, targets, reminders, escalations } = policy;
  const unusedFields = FIELD_NAMES.filter((f) => !conditions.some((c) => c.field === f));
  const unusedMetrics = SLA_METRICS.filter((m) => !escalations.some((e) => e.metric === m));
  const setReminder = (i: number, next: Reminder) => onChange({ reminders: replaceAt(reminders, i, next) });
  const setEscalation = (i: number, next: Escalation) => onChange({ escalations: replaceAt(escalations, i, next) });

  return (
    <div className="lc-re">
      <Card
        title="Conditions"
        description="Define the conditions under which an escalation is triggered. You can set the trigger based on Inbox, Team, or Tags"
      >
        <StackBox
          empty="No conditions. The policy matches every ticket."
          divider="AND"
          addLabel="Add condition"
          addDisabled={unusedFields.length === 0}
          onAdd={() => onChange({ conditions: [...conditions, { field: unusedFields[0], values: [] }] })}
        >
          {conditions.map((c, i) => (
            <div key={c.field} className="lc-re__cond">
              <span className="lc-re__word">if</span>
              <NativeSelect
                size="sm"
                aria-label={`Condition ${i + 1} field`}
                wrapperClassName="lc-re__control"
                data={FIELD_NAMES.filter((f) => f === c.field || unusedFields.includes(f))}
                value={c.field}
                onChange={(e) => onChange({ conditions: replaceAt(conditions, i, { field: e.currentTarget.value, values: [] }) })}
              />
              <span className="lc-re__word">is</span>
              <TagsInput
                className="lc-re__tags"
                ariaLabel={`Condition ${i + 1} values`}
                creatable
                placeholder={`Search for ${c.field.toLowerCase()}`}
                data={SLA_FIELDS[c.field] ?? []}
                value={c.values}
                onChange={(values) => onChange({ conditions: replaceAt(conditions, i, { ...c, values }) })}
              />
              <RemoveButton label={`Remove condition ${i + 1}`} onClick={() => onChange({ conditions: conditions.filter((_, j) => j !== i) })} />
            </div>
          ))}
        </StackBox>
      </Card>

      <Card title="Metrics" description="Configure the service level agreements (SLAs) to determine the acceptable response and resolution times">
        <div className="lc-re__metrics">
          {targets.map((t, i) => (
            <div key={t.metric} className="lc-re__box lc-re__box--stack" role="group" aria-label={metricLabel(t.metric)}>
              <div className="lc-re__esc-head">
                <h4 className="lc-re__level-title">{metricLabel(t.metric)}</h4>
                <span className="lc-re__total">{duration(t.minutes)}</span>
              </div>
              <div className="lc-re__metric-body">
                <TimeInputs minutes={t.minutes} onChange={(minutes) => onChange({ targets: replaceAt(targets, i, { ...t, minutes }) })} />
                <label className="lc-re__check">
                  <input
                    type="checkbox"
                    checked={!!t.includeOutOfOffice}
                    onChange={(e) => onChange({ targets: replaceAt(targets, i, { ...t, includeOutOfOffice: e.currentTarget.checked }) })}
                  />
                  Include Out of office times
                </label>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Setup Reminders" description="Set up reminders to make sure that agents are notified about the approaching due by time for tickets">
        {reminders.length === 0 && <p className="lc-re__hint">No reminders. Add one to warn agents before a breach.</p>}
        {reminders.map((r, i) => (
          <div key={i} className="lc-re__box lc-re__box--stack" role="group" aria-label={`Reminder ${i + 1}`}>
            <div className="lc-re__esc-head">
              <h4 className="lc-re__level-title">Reminder {i + 1}</h4>
              <RemoveButton label={`Remove reminder ${i + 1}`} onClick={() => onChange({ reminders: reminders.filter((_, j) => j !== i) })} />
            </div>
            <div className="lc-re__reminder">
              <NativeSelect
                size="sm"
                label="When SLA of"
                wrapperClassName="lc-re__control"
                data={METRIC_OPTIONS}
                value={r.metric}
                onChange={(e) => setReminder(i, { ...r, metric: e.currentTarget.value })}
              />
              <DelaySelect label="Approaches in" labelled value={r.minutesBefore} onChange={(minutesBefore) => setReminder(i, { ...r, minutesBefore })} />
              <TagsInput
                className="lc-re__tags"
                label="Send reminder to"
                placeholder="Search"
                data={SLA_RECIPIENTS}
                value={r.to}
                onChange={(to) => setReminder(i, { ...r, to })}
              />
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          size="xs"
          leftSection={<Icon name="plus" />}
          onClick={() => onChange({ reminders: [...reminders, { metric: SLA_METRICS[0], to: [SLA_RECIPIENTS[0]], minutesBefore: 30 }] })}
        >
          Add reminder
        </Button>
      </Card>

      <Card
        title="Setup Escalations"
        description="Set escalation rules to notify or reassign tickets when an SLA is breached. You can add multiple escalation levels per SLA metric for resolution."
      >
        {escalations.map((escalation, ei) => {
          const setStep = (si: number, next: Step) => setEscalation(ei, { ...escalation, steps: replaceAt(escalation.steps, si, next) });
          return (
            <div key={escalation.metric} className="lc-re__box lc-re__box--stack" role="group" aria-label={`Escalation ${ei + 1}`}>
              <div className="lc-re__esc-head">
                <div className="lc-re__fields">
                  <span className="lc-re__word">When SLA of</span>
                  <NativeSelect
                    size="sm"
                    aria-label={`Escalation ${ei + 1} metric`}
                    wrapperClassName="lc-re__control"
                    data={METRIC_OPTIONS.filter((m) => m.value === escalation.metric || unusedMetrics.includes(m.value))}
                    value={escalation.metric}
                    onChange={(e) => setEscalation(ei, { ...escalation, metric: e.currentTarget.value })}
                  />
                  <span className="lc-re__word">is breached</span>
                </div>
                <RemoveButton label={`Remove escalation ${ei + 1}`} onClick={() => onChange({ escalations: escalations.filter((_, j) => j !== ei) })} />
              </div>

              {escalation.steps.map((step, si) => (
                <div key={si} className="lc-re__level" role="group" aria-label={`Escalation ${ei + 1} level ${si + 1}`}>
                  <div className="lc-re__level-head">
                    <span className="lc-re__badge" aria-hidden="true">
                      {si + 1}
                    </span>
                    <h4 className="lc-re__level-title">{ordinal(si + 1)} level escalation</h4>
                    <RemoveButton
                      label={`Remove level ${si + 1}`}
                      onClick={() => setEscalation(ei, { ...escalation, steps: escalation.steps.filter((_, j) => j !== si) })}
                    />
                  </div>
                  <div className="lc-re__level-body">
                    <RecipientsRow
                      label="Notify"
                      name={`Level ${si + 1} notify`}
                      value={step.notify}
                      onChange={(notify) => setStep(si, { ...step, notify })}
                    />
                    <RecipientsRow
                      label="Assign ticket"
                      checkedLabel="Assign ticket to"
                      name={`Level ${si + 1} assign`}
                      value={step.assign}
                      onChange={(assign) => setStep(si, { ...step, assign })}
                    />
                    {!step.notify && !step.assign && <p className="lc-re__hint">Pick Notify or Assign ticket for this level.</p>}
                  </div>
                </div>
              ))}

              <div className="lc-re__esc-foot">
                {escalation.steps.length === 0 && <p className="lc-re__hint">No levels yet. Add one to start escalating.</p>}
                <Button
                  variant="outline"
                  size="xs"
                  leftSection={<Icon name="plus" />}
                  onClick={() => setEscalation(ei, { ...escalation, steps: [...escalation.steps, { notify: { to: [SLA_RECIPIENTS[0]], afterMinutes: 5 } }] })}
                >
                  Add one more level
                </Button>
              </div>
            </div>
          );
        })}
        <Button
          variant="outline"
          size="xs"
          leftSection={<Icon name="plus" />}
          disabled={unusedMetrics.length === 0}
          onClick={() =>
            onChange({ escalations: [...escalations, { metric: unusedMetrics[0], steps: [{ notify: { to: [SLA_RECIPIENTS[0]], afterMinutes: 5 } }] }] })
          }
        >
          Add escalation
        </Button>
      </Card>
    </div>
  );
}
