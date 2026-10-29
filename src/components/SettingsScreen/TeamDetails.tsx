/**
 * Teams tab details panel body: the team's description (3 lines, then See more) and its
 * composition — the agents at each escalation level, in order. The name is in the panel header.
 */
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { initials } from '../AccountPicker/AccountPicker';
import { Avatar } from '../Avatar';
import type { BotTemplateRow } from '../BotTemplatesTable';
import './TeamDetails.css';

/** Initials pinned to 12px (Avatar scales them by default), as in the Agents table. */
const AVATAR_STYLE = { '--lc-avatar-font': '12px' } as CSSProperties;

/** Text cut to 3 lines, with a See more / See less toggle once it's longer than that. */
function ClampedText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  // The panel has a fixed width, so measuring when the text or the toggle changes is enough.
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && !expanded) setOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, [text, expanded]);

  return (
    <>
      <p ref={ref} className="lc-td__desc" data-expanded={expanded || undefined}>
        {text}
      </p>
      {(overflowing || expanded) && (
        <button type="button" className="lc-td__more" aria-expanded={expanded} onClick={() => setExpanded((on) => !on)}>
          {expanded ? 'See less' : 'See more'}
        </button>
      )}
    </>
  );
}

export function TeamDetails({ description, levels }: { description?: string; levels: BotTemplateRow[][] }) {
  return (
    <>
      {description && (
        <section className="lc-td lc-td--description" aria-label="Description">
          <h3 className="lc-td__heading">Description</h3>
          <ClampedText key={description} text={description} />
        </section>
      )}
      <section className="lc-td" aria-label="Team composition">
        <h3 className="lc-td__heading">Team composition</h3>
        {levels.length === 0 ? (
          <p className="lc-td__empty">No agents in this team yet.</p>
        ) : (
          levels.map((agents, i) => (
            <div key={i} className="lc-td__level" role="group" aria-label={`Level ${i + 1}`}>
              <h4 className="lc-td__level-title">Level {i + 1}</h4>
              <ul className="lc-td__list">
                {agents.map((agent) => (
                  <li key={agent.id} className="lc-td__item">
                    <Avatar size={36} radius="xl" alt={agent.name} className="lc-td__avatar" style={AVATAR_STYLE}>
                      {initials(agent.name)}
                    </Avatar>
                    <div className="lc-td__text">
                      <span className="lc-td__name">{agent.name}</span>
                      <span className="lc-td__email">{agent.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </>
  );
}
