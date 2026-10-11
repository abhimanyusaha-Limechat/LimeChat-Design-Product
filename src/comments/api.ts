/**
 * Comments live in Supabase (ADR 0002). Row-level security in
 * `supabase/migrations/0001_comments.sql` is the only gate — this module is a
 * thin typed wrapper, and nothing here decides who may do what.
 */
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/** Without a backend the Comment tool is hidden and the Inspector works as before. */
export const COMMENTS_ENABLED = Boolean(url && key);

export interface Reply {
  id: string;
  comment_id: string;
  body: string;
  author_id: string;
  author_name: string;
  created_at: string;
}

export interface Comment {
  id: string;
  screen: string;
  /** null = Loose comment: `x`/`y` are fractions of the viewport, not of an Anchor's box. */
  anchor: string | null;
  anchor_key: string | null;
  /** Made inside a modal, menu or popover, which the URL can't restore: listed, never pinned. */
  in_overlay: boolean;
  x: number;
  y: number;
  viewport_w: number;
  viewport_h: number;
  body: string;
  author_id: string;
  author_name: string;
  build_sha: string;
  created_at: string;
  replies: Reply[];
}

/** What the client sends. Author fields and status come from the token via column defaults. */
export type NewComment = Pick<
  Comment,
  'screen' | 'anchor' | 'anchor_key' | 'in_overlay' | 'x' | 'y' | 'viewport_w' | 'viewport_h' | 'body'
>;

/** No Clerk session: the request would silently run as anonymous and read nothing. */
export class SignedOutError extends Error {}

let getToken: () => Promise<string | null> = async () => null;

/** Kept current by `useComments` from Clerk, so token refresh needs nothing here. */
export function setTokenGetter(next: () => Promise<string | null>) {
  getToken = next;
}

const client = COMMENTS_ENABLED ? createClient(url, key, { accessToken: () => getToken() }) : null;

async function signedIn() {
  if (!client) throw new Error('Comments are not configured');
  if (!(await getToken())) throw new SignedOutError();
  return client;
}

const COLUMNS =
  'id, screen, anchor, anchor_key, in_overlay, x, y, viewport_w, viewport_h, body, author_id, author_name, build_sha, created_at, ' +
  'replies:comment_replies(id, comment_id, body, author_id, author_name, created_at)';

/** Open Comments on one Screen, oldest first, each with its Replies oldest first. */
export async function listComments(screen: string, signal: AbortSignal): Promise<Comment[]> {
  const db = await signedIn();
  const { data, error } = await db
    .from('comments')
    .select(COLUMNS)
    .eq('screen', screen)
    .eq('status', 'open')
    .order('created_at')
    .order('created_at', { referencedTable: 'replies' })
    .limit(500)
    .abortSignal(signal);
  if (error) throw error;
  // ponytail: rows are cast, not validated; generate types with `supabase gen types` if the schema grows.
  return (data ?? []) as unknown as Comment[];
}

export async function addComment(comment: NewComment): Promise<void> {
  const db = await signedIn();
  const { error } = await db.from('comments').insert({ ...comment, build_sha: import.meta.env.BUILD_SHA });
  if (error) throw error;
}

export async function addReply(commentId: string, body: string): Promise<void> {
  const db = await signedIn();
  const { error } = await db.from('comment_replies').insert({ comment_id: commentId, body });
  if (error) throw error;
}

export async function resolveComment(commentId: string): Promise<void> {
  const db = await signedIn();
  const { error } = await db.rpc('resolve_comment', { comment_id: commentId });
  if (error) throw error;
}

/** Asks the database, which holds the only copy of the Designer's email. */
export async function amIDesigner(): Promise<boolean> {
  const db = await signedIn();
  const { data, error } = await db.rpc('is_designer');
  if (error) throw error;
  return data === true;
}
