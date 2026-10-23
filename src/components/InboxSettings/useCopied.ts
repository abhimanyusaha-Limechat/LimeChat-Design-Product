import { useEffect, useState } from 'react';

const COPIED_MS = 2000;

/** `copy()` writes `text` to the clipboard; `copied` stays true for a moment afterwards. */
export function useCopied(text: string) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    // The clipboard can be unavailable (insecure context, denied permission); the text stays selectable.
    navigator.clipboard?.writeText(text).then(() => setCopied(true), () => undefined);
  };

  return { copied, copy };
}
