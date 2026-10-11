import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/react';
import { parseHash, toHash } from '../hooks/navigationHash';
import {
  addComment,
  addReply,
  amIDesigner,
  listComments,
  resolveComment,
  setTokenGetter,
  SignedOutError,
  type Comment,
  type NewComment,
} from './api';

export type CommentsStatus = 'loading' | 'ready' | 'error' | 'signed-out';

/** The Screen a Comment belongs to: the hash, normalised so stray params never split one Screen in two. */
export const currentScreen = () => toHash(parseHash(window.location.hash));

interface Loaded {
  screen: string;
  status: Exclude<CommentsStatus, 'loading'>;
  comments: Comment[];
}

/** The current Screen's open Comments, and the writes on them. Refetches after every write. */
export function useComments() {
  const { getToken } = useAuth();
  // Declared before the fetch effect, so the first fetch already has a token.
  useEffect(() => setTokenGetter(() => getToken()), [getToken]);

  const [screen, setScreen] = useState(currentScreen);
  useEffect(() => {
    const onHash = () => setScreen(currentScreen());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [version, setVersion] = useState(0);
  /** Wraps a write so the list reloads once it lands. */
  const thenRefetch =
    <A extends unknown[]>(write: (...args: A) => Promise<void>) =>
    async (...args: A) => {
      await write(...args);
      setVersion((v) => v + 1);
    };

  useEffect(() => {
    const controller = new AbortController();
    // A slow response for a Screen you've already left is dropped, never shown on the new one.
    const settle = (next: Loaded) => !controller.signal.aborted && setLoaded(next);
    listComments(screen, controller.signal).then(
      (comments) => settle({ screen, status: 'ready', comments }),
      (err: unknown) => {
        if (!controller.signal.aborted && !(err instanceof SignedOutError)) console.error('Loading comments failed', err);
        settle({ screen, status: err instanceof SignedOutError ? 'signed-out' : 'error', comments: [] });
      },
    );
    return () => controller.abort();
  }, [screen, version]);

  const [isDesigner, setIsDesigner] = useState(false);
  useEffect(() => void amIDesigner().then(setIsDesigner, () => {}), []);

  const current = loaded?.screen === screen ? loaded : null;
  const status: CommentsStatus = current?.status ?? 'loading';

  return {
    status,
    comments: current?.comments ?? [],
    isDesigner,
    retry: () => {
      setLoaded(null);
      setVersion((v) => v + 1);
    },
    add: thenRefetch((comment: Omit<NewComment, 'screen'>) => addComment({ ...comment, screen })),
    reply: thenRefetch(addReply),
    resolve: thenRefetch(resolveComment),
  };
}
