/**
 * LoadMore — list footer for cursor/page pagination (mirrors the Vue app's
 * "Load More Orders" / "All Orders Loaded" pattern), with the remaining count
 * shown on the button so the agent knows how much is left before clicking.
 *
 *   <LoadMore noun="orders" remaining={12} loading={fetching} onLoadMore={next} />
 */
import './LoadMore.css';

export interface LoadMoreProps {
  /** Plural noun used in both states, e.g. "orders" → "Load more orders" / "All orders loaded". */
  noun: string;
  /** Items not yet loaded. `0` renders the "all loaded" end-of-list note. */
  remaining: number;
  loading?: boolean;
  onLoadMore: () => void;
}

export function LoadMore({ noun, remaining, loading = false, onLoadMore }: LoadMoreProps) {
  if (remaining <= 0 && !loading) {
    return <p className="lc-load-more__done">All {noun} loaded</p>;
  }
  return (
    <div className="lc-load-more">
      <button
        type="button"
        className="lc-load-more__btn"
        onClick={onLoadMore}
        disabled={loading}
        aria-busy={loading || undefined}
      >
        {loading ? (
          <>
            <span className="lc-load-more__spinner" aria-hidden="true" />
            Loading {noun}…
          </>
        ) : (
          <>
            Load more {noun}
            <span className="lc-load-more__count">{remaining}</span>
          </>
        )}
      </button>
    </div>
  );
}

export default LoadMore;
