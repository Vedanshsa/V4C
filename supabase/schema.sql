-- ═══════════════════════════════════════════════════════════════
-- Voice-4-Compliance — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Profiles ──────────────────────────────────────────────
-- Extends the built-in auth.users table with app-specific data

create table if not exists public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text not null,
  phone                 text,
  full_name             text,
  plan                  text not null default 'free' check (plan in ('free','starter','pro','enterprise')),
  tokens_remaining      integer not null default 20,
  inbound_calls_used    integer not null default 0,
  inbound_calls_limit   integer not null default 3,
  outbound_calls_used   integer not null default 0,
  outbound_calls_limit  integer not null default 0,
  jurisdiction          text not null default 'in',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can only read/write their own profile
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ── 2. Chat History ──────────────────────────────────────────

create table if not exists public.chat_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  session_id  text not null,
  role        text not null check (role in ('user','ai','system')),
  content     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists chat_history_user_id_idx on public.chat_history(user_id);
create index if not exists chat_history_session_idx  on public.chat_history(session_id);

alter table public.chat_history enable row level security;

create policy "chat_history_select_own" on public.chat_history
  for select using (auth.uid() = user_id);

create policy "chat_history_insert_own" on public.chat_history
  for insert with check (auth.uid() = user_id);

-- ── 3. Document Scans ─────────────────────────────────────────

create table if not exists public.document_scans (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  filename     text not null,
  is_legal     boolean not null,
  message      text not null,
  risk_level   text check (risk_level in ('low','medium','high')),
  details      text[] default '{}',
  jurisdiction text not null default 'in',
  created_at   timestamptz not null default now()
);

create index if not exists doc_scans_user_id_idx on public.document_scans(user_id);

alter table public.document_scans enable row level security;

create policy "document_scans_select_own" on public.document_scans
  for select using (auth.uid() = user_id);

create policy "document_scans_insert_own" on public.document_scans
  for insert with check (auth.uid() = user_id);

-- ── 4. Payments ───────────────────────────────────────────────

create table if not exists public.payments (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  razorpay_order_id    text not null,
  razorpay_payment_id  text,
  plan                 text not null,
  amount               integer not null,   -- in paise
  currency             text not null default 'INR',
  status               text not null default 'created' check (status in ('created','paid','failed')),
  created_at           timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "payments_select_own" on public.payments
  for select using (auth.uid() = user_id);

create policy "payments_insert_own" on public.payments
  for insert with check (auth.uid() = user_id);

-- ── 5. Auto-update updated_at trigger ─────────────────────────

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ── 6. Auto-create profile on new user signup ─────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, phone, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
