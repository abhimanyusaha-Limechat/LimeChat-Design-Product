// @vitest-environment node
// Plain Node, not jsdom: `vite` loads esbuild, which rejects jsdom's TextEncoder.
/**
 * ADR 0002 release blocker: with only the public key (what anyone can lift
 * from the bundle), the Comment tables are unreadable and unwritable.
 * Hits the real project, so it runs only on request:
 *
 *   RUN_RLS_TEST=1 npx vitest run src/comments/rls.test.ts
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnv } from 'vite';
import { describe, expect, it, vi } from 'vitest';

// Test setup blanks these in process.env for component tests, and loadEnv prefers
// process.env over the env files, so undo that first.
vi.unstubAllEnvs();
const env = loadEnv('production', '.', ['VITE_SUPABASE_', 'RUN_RLS_TEST']);
const enabled = env.RUN_RLS_TEST === '1' && Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_PUBLISHABLE_KEY);
const NO_ID = '00000000-0000-0000-0000-000000000000';

// Built per test, not in the describe body: Vitest runs that body even when skipping,
// and createClient throws without a URL (as on CI).
const anonClient = () => createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

describe.runIf(enabled)('Comments row-level security, anonymous', () => {
  it.each(['comments', 'comment_replies'])('reads zero rows from %s', async (table) => {
    const { data, error } = await anonClient().from(table).select('id').limit(1);
    expect(error !== null || data?.length === 0).toBe(true);
  });

  it('cannot post a Comment', async () => {
    const { error } = await anonClient().from('comments').insert({
      screen: '#/helpdesk/tickets',
      x: 0.5,
      y: 0.5,
      viewport_w: 1,
      viewport_h: 1,
      body: 'rls probe',
      author_id: 'x',
      author_email: 'x@example.com',
      author_name: 'x',
      build_sha: 'rls',
    });
    expect(error).not.toBeNull();
  });

  it('cannot post a Reply', async () => {
    const { error } = await anonClient()
      .from('comment_replies')
      .insert({ comment_id: NO_ID, body: 'rls probe', author_id: 'x', author_email: 'x@example.com', author_name: 'x' });
    expect(error).not.toBeNull();
  });

  it('cannot update or delete', async () => {
    const update = await anonClient().from('comments').update({ status: 'resolved' }).neq('id', NO_ID).select('id');
    const remove = await anonClient().from('comments').delete().neq('id', NO_ID).select('id');
    expect(update.error !== null || update.data?.length === 0).toBe(true);
    expect(remove.error !== null || remove.data?.length === 0).toBe(true);
  });

  it('cannot resolve', async () => {
    const { error } = await anonClient().rpc('resolve_comment', { comment_id: NO_ID });
    expect(error).not.toBeNull();
  });
});
