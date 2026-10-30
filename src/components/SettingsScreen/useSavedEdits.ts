import { useState } from 'react';

/**
 * Edit pages keyed by row id: edits are a draft until `save`, then stay over the demo rows.
 * `draftFor(id)` is the unsaved patch of that row, if the draft is for it.
 */
export function useSavedEdits<P extends object>() {
  const [saves, setSaves] = useState<Record<string, P>>({});
  const [draft, setDraft] = useState<{ id: string; patch: P } | null>(null);
  const draftFor = (id: string) => (draft?.id === id ? draft.patch : undefined);
  return {
    saves,
    draftFor,
    /** Adds to the unsaved edits of this row. */
    patch: (id: string, patch: P) => setDraft({ id, patch: { ...draftFor(id), ...patch } }),
    /** Makes the unsaved edits the saved ones. */
    save: (id: string) => {
      const unsaved = draftFor(id);
      if (unsaved) setSaves((prev) => ({ ...prev, [id]: { ...prev[id], ...unsaved } }));
      setDraft(null);
    },
    discard: () => setDraft(null),
  };
}
