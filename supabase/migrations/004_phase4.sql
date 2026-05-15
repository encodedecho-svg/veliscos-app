-- =====================================================================
-- Veliscos — Phase 4: full admin data layer
-- =====================================================================
-- Adds: config (singleton), activity_log, announcement (singleton),
--       promo_codes, expenses, partners, payouts. Also adds discount
--       columns to orders for promo code support.
-- Idempotent: safe to re-run.
-- Run AFTER 003_admin.sql (depends on public.is_admin()).
-- =====================================================================

-- ──────────────────────────────────────────────────────────────────
-- CONFIG (singleton)
-- ──────────────────────────────────────────────────────────────────
create table if not exists public.config (
  id smallint primary key default 1 check (id = 1),
  shipping_flat            int not null default 200 check (shipping_flat >= 0),
  free_shipping_threshold  int not null default 3000 check (free_shipping_threshold >= 0),
  brand_email              text,
  brand_phone              text,
  brand_whatsapp           text,
  payout_bank              text,
  payout_jazzcash          text,
  payout_easypaisa         text,
  updated_at               timestamptz not null default now()
);
insert into public.config (id) values (1) on conflict (id) do nothing;

alter table public.config enable row level security;
drop policy if exists "Public read config" on public.config;
create policy "Public read config" on public.config for select using (true);
drop policy if exists "Admin update config" on public.config;
create policy "Admin update config" on public.config for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop trigger if exists config_set_updated_at on public.config;
create trigger config_set_updated_at
  before update on public.config
  for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────
-- ACTIVITY LOG
-- ──────────────────────────────────────────────────────────────────
create table if not exists public.activity_log (
  id            bigserial primary key,
  actor_email   text not null,
  action        text not null,
  entity_type   text,
  entity_id     text,
  details       jsonb,
  created_at    timestamptz not null default now()
);
create index if not exists activity_log_created_idx on public.activity_log(created_at desc);
create index if not exists activity_log_actor_idx on public.activity_log(actor_email);

alter table public.activity_log enable row level security;
drop policy if exists "Admin read activity" on public.activity_log;
create policy "Admin read activity" on public.activity_log for select to authenticated
  using (public.is_admin());
drop policy if exists "Admin insert activity" on public.activity_log;
create policy "Admin insert activity" on public.activity_log for insert to authenticated
  with check (public.is_admin());

-- ──────────────────────────────────────────────────────────────────
-- ANNOUNCEMENT BANNER (singleton)
-- ──────────────────────────────────────────────────────────────────
create table if not exists public.announcement (
  id          smallint primary key default 1 check (id = 1),
  text        text,
  bg_color    text not null default '#1a2a44',
  status      text not null default 'inactive' check (status in ('active','inactive')),
  updated_at  timestamptz not null default now()
);
insert into public.announcement (id) values (1) on conflict (id) do nothing;

alter table public.announcement enable row level security;
drop policy if exists "Public read announcement" on public.announcement;
create policy "Public read announcement" on public.announcement for select
  using (status = 'active' or public.is_admin());
drop policy if exists "Admin update announcement" on public.announcement;
create policy "Admin update announcement" on public.announcement for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop trigger if exists announcement_set_updated_at on public.announcement;
create trigger announcement_set_updated_at
  before update on public.announcement
  for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────
-- PROMO CODES
-- ──────────────────────────────────────────────────────────────────
create table if not exists public.promo_codes (
  code           text primary key,
  type           text not null check (type in ('percentage','fixed')),
  value          int not null check (value > 0),
  valid_from     date,
  valid_to       date,
  max_uses       int,
  used_count     int not null default 0 check (used_count >= 0),
  min_subtotal   int not null default 0 check (min_subtotal >= 0),
  active         boolean not null default true,
  created_at     timestamptz not null default now()
);

alter table public.promo_codes enable row level security;
drop policy if exists "Public read active promos" on public.promo_codes;
create policy "Public read active promos" on public.promo_codes for select
  using (active = true or public.is_admin());
drop policy if exists "Admin all promos" on public.promo_codes;
create policy "Admin all promos" on public.promo_codes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ──────────────────────────────────────────────────────────────────
-- EXPENSES
-- ──────────────────────────────────────────────────────────────────
create table if not exists public.expenses (
  id            bigserial primary key,
  description   text not null,
  category      text not null check (category in ('Operations','Marketing','Packaging','Shipping','Other')),
  amount        int not null check (amount >= 0),
  occurred_at   date not null default current_date,
  created_at    timestamptz not null default now()
);
create index if not exists expenses_occurred_idx on public.expenses(occurred_at desc);
create index if not exists expenses_category_idx on public.expenses(category);

alter table public.expenses enable row level security;
drop policy if exists "Admin all expenses" on public.expenses;
create policy "Admin all expenses" on public.expenses for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ──────────────────────────────────────────────────────────────────
-- PARTNERS
-- ──────────────────────────────────────────────────────────────────
create table if not exists public.partners (
  id              bigserial primary key,
  name            text not null,
  contact         text,
  share_percent   numeric(5,2) not null check (share_percent >= 0 and share_percent <= 100),
  notes           text,
  created_at      timestamptz not null default now()
);

alter table public.partners enable row level security;
drop policy if exists "Admin all partners" on public.partners;
create policy "Admin all partners" on public.partners for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ──────────────────────────────────────────────────────────────────
-- PAYOUTS
-- ──────────────────────────────────────────────────────────────────
create table if not exists public.payouts (
  id          bigserial primary key,
  partner_id  bigint not null references public.partners(id) on delete cascade,
  amount      int not null check (amount > 0),
  paid_at     date not null default current_date,
  notes       text,
  created_at  timestamptz not null default now()
);
create index if not exists payouts_partner_idx on public.payouts(partner_id);
create index if not exists payouts_paid_idx on public.payouts(paid_at desc);

alter table public.payouts enable row level security;
drop policy if exists "Admin all payouts" on public.payouts;
create policy "Admin all payouts" on public.payouts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ──────────────────────────────────────────────────────────────────
-- ORDERS: add discount columns (idempotent)
-- ──────────────────────────────────────────────────────────────────
alter table public.orders add column if not exists discount        int not null default 0 check (discount >= 0);
alter table public.orders add column if not exists promo_code      text;

-- Done.
