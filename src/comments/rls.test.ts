/**
 * ADR 0002 release blocker: with only the public key (what anyone can lift
 * from the bundle), the Comment tables are unreadable and unwritable.
 * Hits the real project, so it runs only on request:
 *
 *   RUN_RLS_TEST=1 npx vitest run src/comments/rls.test.ts
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnv } from 'vite';
import { describe, expect, it } from 'vitest';

// Read from the env files directly: test setup blanks these for component tests.
const env = loadEnv('production', '.', ['VITE_SUPABASE_', 'RUN_RLS_TEST']);
const enabled = env.RUN_RLS_TEST === '1' && Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_PUBLISHABLE_KEY);
const NO_ID = '00000000-0000-0000-0000-000000000000';

describe.runIf(enabled)('Comments row-level security, anonymous', () => {
  const anon = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

  it.each(['comments', 'comment_replies'])('reads zero rows from %s', async (table) => {
    const { data, error } = await anon.from(table).select('id').limit(1);
    expect(error !== null || data?.length === 0).toBe(true);
  });

  it('cannot post a Comment', async () => {
    const { error } = await anon.from('comments').insert({
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
    const { error } = await anon
      .from('comment_replies')
      .insert({ comment_id: NO_ID, body: 'rls probe', author_id: 'x', author_email: 'x@example.com', author_name: 'x' });
    expect(error).not.toBeNull();
  });

  it('cannot update or delete', async () => {
    const update = await anon.from('comments').update({ status: 'resolved' }).neq('id', NO_ID).select('id');
    const remove = await anon.from('comments').delete().neq('id', NO_ID).select('id');
    expect(update.error !== null || update.data?.length === 0).toBe(true);
    expect(remove.error !== null || remove.data?.length === 0).toBe(true);
  });

  it('cannot resolve', async () => {
    const { error } = await anon.rpc('resolve_comment', { comment_id: NO_ID });
    expect(error).not.toBeNull();
  });
});
