-- Prototype Commenting (ADR 0002). Run once in the Supabase SQL editor.
-- Identity comes from the Clerk session token (Supabase Third-Party Auth):
-- `sub` = Clerk user id, plus the custom `email` and `name` claims.
-- Row-level security is the only gate: the repo and the site are public.

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  screen text not null check (screen ~ '^#/' and length(screen) <= 200),
  anchor text check (anchor ~ '^[a-z][a-z0-9-]*$' and length(anchor) <= 80),
  anchor_key text check (length(anchor_key) <= 120),
  in_overlay boolean not null default false,
  x real not null check (x between 0 and 1),
  y real not null check (y between 0 and 1),
  viewport_w int not null check (viewport_w between 1 and 10000),
  viewport_h int not null check (viewport_h between 1 and 10000),
  body text not null check (length(btrim(body)) between 1 and 5000),
  author_id text not null default (auth.jwt()->>'sub'),
  author_email text not null default (auth.jwt()->>'email'),
  author_name text not null default (coalesce(nullif(auth.jwt()->>'name', ''), auth.jwt()->>'email')),
  build_sha text not null check (length(build_sha) <= 40),
  status text not null default 'open' check (status in ('open', 'resolved')),
  resolved_by text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.comment_replies (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments on delete cascade,
  body text not null check (length(btrim(body)) between 1 and 5000),
  author_id text not null default (auth.jwt()->>'sub'),
  author_email text not null default (auth.jwt()->>'email'),
  author_name text not null default (coalesce(nullif(auth.jwt()->>'name', ''), auth.jwt()->>'email')),
  created_at timestamptz not null default now()
);

create index on public.comments (screen) where status = 'open';
create index on public.comment_replies (comment_id);

-- The ONLY place the Designer is defined. The client asks via rpc('is_designer').
create function public.is_designer() returns boolean
  language sql stable set search_path = ''
  as $$ select lower(coalesce(auth.jwt()->>'email', '')) = 'abhimanyu.saha@limechat.ai' $$;

-- The only way a Comment changes after it's posted.
create function public.resolve_comment(comment_id uuid) returns void
  language plpgsql security definer set search_path = ''
  as $$
  begin
    if not public.is_designer() then
      raise exception 'Only the Designer can resolve comments' using errcode = '42501';
    end if;
    update public.comments
       set status = 'resolved', resolved_by = auth.jwt()->>'sub', resolved_at = now()
     where id = comment_id and status = 'open';
  end $$;

revoke all on public.comments, public.comment_replies from anon, authenticated;
grant select, insert on public.comments, public.comment_replies to authenticated;
revoke all on function public.resolve_comment(uuid), public.is_designer() from public, anon;
grant execute on function public.resolve_comment(uuid), public.is_designer() to authenticated;

alter table public.comments enable row level security;
alter table public.comment_replies enable row level security;

create policy read on public.comments for select to authenticated using (true);
create policy read on public.comment_replies for select to authenticated using (true);

-- Post only as yourself, only as Open. A missing email claim compares to null and fails.
create policy add on public.comments for insert to authenticated with check (
  author_id = auth.jwt()->>'sub'
  and author_email = auth.jwt()->>'email'
  and author_name = coalesce(nullif(auth.jwt()->>'name', ''), auth.jwt()->>'email')
  and status = 'open' and resolved_by is null and resolved_at is null
);
create policy add on public.comment_replies for insert to authenticated with check (
  author_id = auth.jwt()->>'sub'
  and author_email = auth.jwt()->>'email'
  and author_name = coalesce(nullif(auth.jwt()->>'name', ''), auth.jwt()->>'email')
);

-- No update or delete policies or grants: nothing changes a row except resolve_comment().
