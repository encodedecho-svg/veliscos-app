-- =====================================================================
-- Veliscos — Phase 4.1: admin_emails CRUD for Staff management
-- =====================================================================
-- Adds policies so admins can manage other admin emails from the UI.
-- Idempotent: safe to re-run.
-- Run AFTER 003_admin.sql.
-- =====================================================================

-- Already exists from 003: a user can read their OWN row (chicken-and-egg fix).
-- Add: admins can read all rows, insert new admins, delete other admins.

drop policy if exists "Admins read all admin_emails" on public.admin_emails;
create policy "Admins read all admin_emails"
  on public.admin_emails for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins insert admin_emails" on public.admin_emails;
create policy "Admins insert admin_emails"
  on public.admin_emails for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Admins delete admin_emails" on public.admin_emails;
create policy "Admins delete admin_emails"
  on public.admin_emails for delete to authenticated
  using (public.is_admin());
