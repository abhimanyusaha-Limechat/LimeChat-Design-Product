/**
 * Undo / redo for the reply box. The textarea is controlled and the formatting buttons and canned
 * replies rewrite its value from code, which breaks the browser's own undo, so the composer keeps its
 * own history. Typing is grouped: a burst of keystrokes is one step, a pause starts the next.
 */
import { useRef, useState } from 'react';

const TYPING_PAUSE_MS = 600;

export function useTextHistory(value: string, onChange: (value: string) => void) {
  const [past, setPast] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);
  const lastTypedAt = useRef(0);

  /** Call just before a change replaces `value`. `typing` groups rapid keystrokes into one step. */
  const record = (typing: boolean) => {
    const now = Date.now();
    if (!typing || past.length === 0 || now - lastTypedAt.current > TYPING_PAUSE_MS) setPast([...past, value]);
    lastTypedAt.current = typing ? now : 0;
    setFuture([]);
  };

  const undo = () => {
    if (past.length === 0) return;
    setFuture([...future, value]);
    setPast(past.slice(0, -1));
    lastTypedAt.current = 0;
    onChange(past[past.length - 1]);
  };

  const redo = () => {
    if (future.length === 0) return;
    setPast([...past, value]);
    setFuture(future.slice(0, -1));
    lastTypedAt.current = 0;
    onChange(future[future.length - 1]);
  };

  const reset = () => {
    setPast([]);
    setFuture([]);
  };

  return { record, undo, redo, reset, canUndo: past.length > 0, canRedo: future.length > 0 };
}
