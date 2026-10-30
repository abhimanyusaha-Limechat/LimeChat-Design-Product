/**
 * Automation rules tab → Edit: when the rule runs (Event), what it checks (Conditions), what it
 * does (Actions, in order) and how many times it may run. Controlled: every edit goes out through
 * `onChange` and the caller saves the draft when Update is clicked.
 */
import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { Button } from '../Button';
import { Icon } from '../icons';
import { NativeSelect } from '../Select';
import { TagsInput } from '../TagsInput';
import {
  RULE_ACTIONS,
  RULE_EVENTS,
  RULE_FIELDS,
  type AutomationRule,
} from '../../data/ruleDemo';
import './RuleEdit.css';

type Condition = AutomationRule['conditions'][number];
type Action = AutomationRule['actions'][number];

const OPERATORS = [
  { value: 'is', label: 'Equal To' },
  { value: 'is not', label: 'Not Equal To' },
];

const eventLabel = (e: AutomationRule['event']) => `${e.subject} ${e.state}`;
const EVENT_LABELS = RULE_EVENTS.map(eventLabel);
const FIELD_NAMES = Object.keys(RULE_FIELDS);
const ACTION_NAMES = Object.keys(RULE_ACTIONS);

/** The rule can be saved once it does something, every condition and action is filled in, and it has a limit. */
export const isRuleComplete = ({ conditions, actions, maxExecutions }: AutomationRule) =>
  maxExecutions !== undefined &&
  actions.length > 0 &&
  actions.every((a) => a.name !== '' && (RULE_ACTIONS[a.name]?.length ? a.values.length > 0 : true)) &&
  conditions.every((c) => c.values.length > 0);

/** The rule in one sentence, from the parts that are filled in: "When Conversation created, if Inbox is X, then Assign Team (Y)". */
export function ruleSummary({ event, conditions, actions }: AutomationRule) {
  const ifs = conditions
    .filter((c) => c.values.length > 0)
    .map((c) => `${c.field} ${c.not ? 'is not' : 'is'} ${c.values.join(' or ')}`)
    .join(' and ');
  const thens = actions
    .filter((a) => a.name !== '')
    .map((a) => (a.values.length > 0 ? `${a.name} (${a.values.join(', ')})` : a.name))
    .join(', then ');
  return [`When ${eventLabel(event)}`, ifs && `if ${ifs}`, thens && `then ${thens}`].filter(Boolean).join(', ');
}

/** A whole number >= 1, or undefined while the box is empty. */
const toLimit = (text: string) => (text === '' ? undefined : Math.max(1, Math.floor(Number(text)) || 1));

export const replaceAt = <T,>(list: T[], index: number, next: T) => list.map((item, i) => (i === index ? next : item));

/** A grey card of the edit page; SlaEdit shares it. */
export function Card({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="lc-re__card" aria-label={title}>
      <h3 className="lc-re__title">{title}</h3>
      {description && <p className="lc-re__desc">{description}</p>}
      {children}
    </section>
  );
}

export function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="lc-re__remove" aria-label={label} title={label} onClick={onClick}>
      <Icon name="trash" size={16} />
    </button>
  );
}

/**
 * A bordered box of rows with `divider` ("AND", "THEN") between them, `empty` when there are none,
 * and an "Add" button at the foot. Give each row a `key`. SlaEdit shares it.
 */
export function StackBox({
  empty,
  divider,
  addLabel,
  addDisabled,
  onAdd,
  children,
}: {
  empty: string;
  divider: string;
  addLabel: string;
  addDisabled?: boolean;
  onAdd: () => void;
  children: ReactNode;
}) {
  const rows = Children.toArray(children);
  return (
    <div className="lc-re__box lc-re__box--stack">
      {rows.length === 0 && <p className="lc-re__hint lc-re__cond-empty">{empty}</p>}
      {rows.map((row, i) => (
        <Fragment key={isValidElement(row) ? row.key : i}>
          {i > 0 && (
            <div className="lc-re__and" role="separator">
              {divider}
            </div>
          )}
          {row}
        </Fragment>
      ))}
      <div className="lc-re__cond-foot">
        <Button variant="outline" size="xs" leftSection={<Icon name="plus" />} disabled={addDisabled} onClick={onAdd}>
          {addLabel}
        </Button>
      </div>
    </div>
  );
}

export function RuleEdit({ rule, onChange }: { rule: AutomationRule; onChange: (patch: Partial<AutomationRule>) => void }) {
  const { event, conditions, actions } = rule;
  const unusedFields = FIELD_NAMES.filter((f) => !conditions.some((c) => c.field === f));
  const setCondition = (i: number, next: Condition) => onChange({ conditions: replaceAt(conditions, i, next) });
  const setAction = (i: number, next: Action) => onChange({ actions: replaceAt(actions, i, next) });

  return (
    <div className="lc-re">
      <p className="lc-re__summary">
        <strong>In short</strong> {ruleSummary(rule)}
      </p>

      <Card title="Event" description="The moment that starts this rule.">
        <div className="lc-re__box">
          <span className="lc-re__word">When</span>
          <NativeSelect
            size="sm"
            aria-label="Event"
            wrapperClassName="lc-re__control"
            data={EVENT_LABELS}
            value={eventLabel(event)}
            onChange={(e) => {
              const next = RULE_EVENTS.find((x) => eventLabel(x) === e.currentTarget.value);
              if (next) onChange({ event: next });
            }}
          />
        </div>
      </Card>

      <Card title="Conditions" description="The rule runs only when every condition matches.">
        <StackBox
          empty="No conditions. The rule runs every time."
          divider="AND"
          addLabel="Add condition"
          addDisabled={unusedFields.length === 0}
          onAdd={() => onChange({ conditions: [...conditions, { field: unusedFields[0], values: [] }] })}
        >
          {conditions.map((c, i) => (
            <div key={c.field} className="lc-re__cond lc-re__cond--op">
              <span className="lc-re__word">if</span>
              <NativeSelect
                size="sm"
                aria-label={`Condition ${i + 1} field`}
                wrapperClassName="lc-re__control"
                data={FIELD_NAMES.filter((f) => f === c.field || unusedFields.includes(f))}
                value={c.field}
                onChange={(e) => setCondition(i, { field: e.currentTarget.value, values: [], not: c.not })}
              />
              <NativeSelect
                size="sm"
                aria-label={`Condition ${i + 1} operator`}
                wrapperClassName="lc-re__control"
                data={OPERATORS}
                value={c.not ? 'is not' : 'is'}
                onChange={(e) => setCondition(i, { ...c, not: e.currentTarget.value === 'is not' })}
              />
              <TagsInput
                className="lc-re__tags"
                ariaLabel={`Condition ${i + 1} values`}
                placeholder={`Search for ${c.field.toLowerCase()}`}
                data={RULE_FIELDS[c.field] ?? []}
                value={c.values}
                onChange={(values) => setCondition(i, { ...c, values })}
              />
              <RemoveButton label={`Remove condition ${i + 1}`} onClick={() => onChange({ conditions: conditions.filter((_, j) => j !== i) })} />
            </div>
          ))}
        </StackBox>
      </Card>

      <Card title="Actions" description="What the rule does, in order.">
        <StackBox
          empty="Add at least one action."
          divider="THEN"
          addLabel="Add action"
          onAdd={() => onChange({ actions: [...actions, { name: '', values: [] }] })}
        >
          {actions.map((a, i) => (
            <div key={i} className="lc-re__cond lc-re__act">
              <span className="lc-re__badge" aria-hidden="true">
                {i + 1}
              </span>
              <NativeSelect
                size="sm"
                aria-label={`Action ${i + 1}`}
                wrapperClassName="lc-re__control"
                placeholder="Select An Action"
                data={ACTION_NAMES}
                value={a.name}
                onChange={(e) => setAction(i, { name: e.currentTarget.value, values: [] })}
              />
              {(RULE_ACTIONS[a.name]?.length ?? 0) > 0 && (
                <TagsInput
                  className="lc-re__tags"
                  ariaLabel={`Action ${i + 1} values`}
                  placeholder="Search"
                  data={RULE_ACTIONS[a.name]}
                  value={a.values}
                  onChange={(values) => setAction(i, { ...a, values })}
                />
              )}
              <RemoveButton label={`Remove action ${i + 1}`} onClick={() => onChange({ actions: actions.filter((_, j) => j !== i) })} />
            </div>
          ))}
        </StackBox>
      </Card>

      <section className="lc-re__card lc-re__card--inline" aria-label="Maximum executions">
        <div className="lc-re__stack">
          <label className="lc-re__title" htmlFor="lc-re-max">
            Maximum executions for this automation rule
          </label>
          <p className="lc-re__desc">Stops the rule after it has run this many times.</p>
        </div>
        <div className="lc-re__unit">
          <input
            id="lc-re-max"
            className="lc-re__number"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            value={rule.maxExecutions ?? ''}
            onChange={(e) => onChange({ maxExecutions: toLimit(e.currentTarget.value) })}
          />
          times
        </div>
      </section>
    </div>
  );
}
