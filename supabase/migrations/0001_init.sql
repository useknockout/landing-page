-- useknockout schema v1
-- Run this in Supabase SQL editor (or via `supabase db push` if using the local CLI).

-- =========================================================================
-- USERS — application profile mirrored from auth.users
-- =========================================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  tier text not null default 'free' check (tier in ('free', 'payg', 'volume', 'enterprise')),
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a row in public.users when a new auth.users row appears.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================================
-- TOKENS — API keys issued to users
-- =========================================================================
create table if not exists public.tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  prefix text not null,                -- first 12 chars of token, shown in UI (e.g. kno_live_abc1)
  hashed_token text not null unique,   -- SHA-256 of full raw token; raw token never stored
  env text not null default 'live' check (env in ('test', 'live')),
  scopes text[] not null default array[]::text[],   -- empty = full access; otherwise list of allowed endpoints
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists tokens_user_id_idx on public.tokens(user_id);
create index if not exists tokens_hashed_token_idx on public.tokens(hashed_token);

-- =========================================================================
-- USAGE — per-call audit log for billing + dashboard
-- =========================================================================
create table if not exists public.usage (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  token_id uuid references public.tokens(id) on delete set null,
  endpoint text not null,
  status int not null,
  latency_ms int,
  created_at timestamptz not null default now()
);

create index if not exists usage_user_id_created_at_idx
  on public.usage(user_id, created_at desc);
create index if not exists usage_token_id_idx
  on public.usage(token_id);

-- =========================================================================
-- ROW LEVEL SECURITY — users see only their own rows
-- =========================================================================
alter table public.users    enable row level security;
alter table public.tokens   enable row level security;
alter table public.usage    enable row level security;

-- USERS
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id);

-- TOKENS
drop policy if exists "tokens_select_own" on public.tokens;
create policy "tokens_select_own"
  on public.tokens for select
  using (auth.uid() = user_id);

drop policy if exists "tokens_insert_own" on public.tokens;
create policy "tokens_insert_own"
  on public.tokens for insert
  with check (auth.uid() = user_id);

drop policy if exists "tokens_update_own" on public.tokens;
create policy "tokens_update_own"
  on public.tokens for update
  using (auth.uid() = user_id);

drop policy if exists "tokens_delete_own" on public.tokens;
create policy "tokens_delete_own"
  on public.tokens for delete
  using (auth.uid() = user_id);

-- USAGE — read-only for users; service role inserts
drop policy if exists "usage_select_own" on public.usage;
create policy "usage_select_own"
  on public.usage for select
  using (auth.uid() = user_id);

-- =========================================================================
-- HELPER VIEW: monthly usage counts per user (used by dashboard quota)
-- =========================================================================
create or replace view public.usage_current_month as
select
  user_id,
  count(*) as call_count,
  sum(case when status >= 400 then 1 else 0 end) as error_count,
  avg(latency_ms)::int as avg_latency_ms
from public.usage
where created_at >= date_trunc('month', now())
group by user_id;
