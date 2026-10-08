/**
 * Pure helpers shared by the catalog-style panels (Orders, Products, Cart, Add product):
 * a stable colour for a thumbnail without a photo, and the typewriter search placeholder.
 */
import { useEffect, useRef, useState } from 'react';

const THUMB_PALETTE = [
  { bg: '#FAFDF6', fg: '#6BAC1B' },
  { bg: '#EDF7FF', fg: '#097BA3' },
  { bg: '#FAEFDB', fg: '#C68610' },
  { bg: '#FCF3F3', fg: '#DA1B21' },
  { bg: '#FCF2FF', fg: '#A045EC' },
];

export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
}

/** Same key always yields the same background/foreground pair. */
export function thumbPalette(key: string): { bg: string; fg: string } {
  return THUMB_PALETTE[hashString(key) % THUMB_PALETTE.length];
}

/** Types out, pauses, then deletes each phrase in turn — a rotating typewriter placeholder. */
export function useTypingPlaceholder(phrases: string[]): string {
  const [text, setText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const reducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  ).current;

  useEffect(() => {
    if (reducedMotion) return undefined;
    const current = phrases[phraseIndex % phrases.length];
    let timeout: number;
    if (!deleting && text === current) {
      timeout = window.setTimeout(() => setDeleting(true), 1300);
    } else if (deleting && text === '') {
      timeout = window.setTimeout(() => {
        setDeleting(false);
        setPhraseIndex((i) => (i + 1) % phrases.length);
      }, 300);
    } else {
      timeout = window.setTimeout(
        () => setText((t) => (deleting ? current.slice(0, t.length - 1) : current.slice(0, t.length + 1))),
        deleting ? 30 : 60,
      );
    }
    return () => window.clearTimeout(timeout);
  }, [text, deleting, phraseIndex, phrases, reducedMotion]);

  return reducedMotion ? phrases[0] : text;
}
