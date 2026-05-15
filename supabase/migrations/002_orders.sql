-- =====================================================================
-- Veliscos — Phase 2: Orders + order_items
-- =====================================================================
-- Run once in the Supabase SQL Editor after 001_products.sql.
-- Idempotent: safe to re-run.
-- =====================================================================

drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop sequence if exists public.orders_seq cascade;

create sequence public.orders_seq start 1000;

create table public.orders (
  id              text primary key default ('VLC-' || to_char(nextval('public.orders_seq'), 'FM00000000')),
  status          text not null default 'pending'
                    check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  first_name      text not null,
  last_name       text not null,
  email           text not null,
  phone           text not null,
  address         text not null,
  city            text not null,
  zip             text,
  notes           text,
  payment_method  text not null
                    check (payment_method in ('cod','jazzcash','easypaisa','bank')),
  subtotal        integer not null check (subtotal >= 0),
  shipping        integer not null check (shipping >= 0),
  total           integer not null check (total >= 0),
  currency        text not null default 'PKR',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.order_items (
  id            bigserial primary key,
  order_id      text not null references public.orders(id) on delete cascade,
  product_id    text not null references public.products(id) on delete restrict,
  product_name  text not null,
  unit_price    integer not null check (unit_price >= 0),
  qty           integer not null check (qty > 0),
  line_total    integer not null check (line_total >= 0)
);

create index orders_created_at_idx on public.orders(created_at desc);
create index orders_status_idx     on public.orders(status);
create index order_items_order_id_idx on public.order_items(order_id);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Anyone (anon) can place an order. Reads stay locked down until Phase 3
-- adds an admin role; for now no SELECT policy = no public reads.
drop policy if exists "Public insert orders" on public.orders;
create policy "Public insert orders"
  on public.orders for insert to anon, authenticated
  with check (true);

drop policy if exists "Public insert order_items" on public.order_items;
create policy "Public insert order_items"
  on public.order_items for insert to anon, authenticated
  with check (true);

-- updated_at trigger (reuses function created in 001_products.sql)
drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Done. Verify with:
--   select * from public.orders limit 1;
--   select * from public.order_items limit 1;
