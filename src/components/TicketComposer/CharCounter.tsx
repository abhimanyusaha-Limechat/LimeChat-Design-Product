/** "n / limit" for a draft. Hidden until the draft is 80% of the way there, amber from then on, red at the limit. */
interface CharCounterProps {
  length: number;
  limit: number;
}

export function CharCounter({ length, limit }: CharCounterProps) {
  if (length < limit * 0.8) return null;
  return (
    <div className="lc-ticket-composer__counter" data-level={length >= limit ? 'limit' : 'warn'} aria-live="polite">
      {length} / {limit}
    </div>
  );
}
