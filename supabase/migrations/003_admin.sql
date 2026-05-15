-- =====================================================================
-- Veliscos — Phase 3: Admin access (RLS for staff)
-- =====================================================================
-- Run once in the Supabase SQL Editor after 002_orders.sql.
-- Idempotent: safe to re-run.
-- =====================================================================
--
-- Setup steps (do these in Supabase Studio after running this SQL):
--   1. Authentication → Users → "Add user" → create with email/password
--      (e.g. encodedecho@gmail.com). Confirm the email.
--   2. Open SQL Editor and run:
--        insert into public.admin_emails (email) values ('encodedecho@gmail.com');
--      Replace the email with whatever you signed up with in step 1.
--   3. Log in at /admin/login on the storefront.
-- =====================================================================

drop table if exists public.admin_emails cascade;

create table public.admin_emails (
  email       text primary key,
  created_at  timestamptz not null default now()
);

alter table public.admin_emails enable row level security;

-- Admins can read the admin list (useful for the UI). No public reads.
drop policy if exists "Admins read admin_emails" on public.admin_emails;
create policy "Admins read admin_emails"
  on public.admin_emails for select to authenticated
  using (auth.email() in (select email from public.admin_emails));

-- ---------------------------------------------------------------------
-- Helper: is the current session an admin?
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_emails
    where email = auth.email()
  );
$$;

-- ---------------------------------------------------------------------
-- Orders + order_items: admins can SELECT and UPDATE
-- ---------------------------------------------------------------------
drop policy if exists "Admins read orders" on public.orders;
create policy "Admins read orders"
  on public.orders for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders"
  on public.orders for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins read order_items" on public.order_items;
create policy "Admins read order_items"
  on public.order_items for select to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- Products: admins can INSERT / UPDATE / DELETE
-- (Public read for active products is already allowed by 001_products.sql)
-- ---------------------------------------------------------------------
drop policy if exists "Admins insert products" on public.products;
create policy "Admins insert products"
  on public.products for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Admins update products" on public.products;
create policy "Admins update products"
  on public.products for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins delete products" on public.products;
create policy "Admins delete products"
  on public.products for delete to authenticated
  using (public.is_admin());

-- Admins can also SELECT inactive (draft) products
drop policy if exists "Admins read all products" on public.products;
create policy "Admins read all products"
  on public.products for select to authenticated
  using (public.is_admin());

-- Done.
-- Reminder: after running this, add yourself to public.admin_emails:
--   insert into public.admin_emails (email) values ('encodedecho@gmail.com');
