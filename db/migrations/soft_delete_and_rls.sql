-- =========================================================
-- 2026_02_03_soft_delete_and_rls.sql
-- DB-only refactor: soft delete + account-status enforcement + policy fixes
-- Run AFTER db/schema.sql
-- =========================================================

-- -----------------------------
-- 0) Safety: idempotent helpers
-- -----------------------------

-- Harden is_admin(): pin search_path to '' and fully qualify references
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_profiles up
    where up.supabase_user_id = auth.uid()
      and up.role = 'ADMIN'
      and up.statut_compte = 'ACTIF'
  );
$$;

-- Active-account check for *all authenticated users* (ADMIN or EMPLOYEE)
create or replace function public.is_active_account()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_profiles up
    where up.supabase_user_id = auth.uid()
      and up.statut_compte = 'ACTIF'
  );
$$;

-- Tighten EXECUTE privileges (Postgres commonly grants EXECUTE on functions to PUBLIC by default). :contentReference[oaicite:2]{index=2}
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

revoke execute on function public.is_active_account() from public;
grant execute on function public.is_active_account() to authenticated;

-- ------------------------------------
-- 1) Employees: add soft-delete fields
-- ------------------------------------
alter table public.employees
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references auth.users(id);

-- If deleted_at is set, enforce employee is not active
alter table public.employees
  drop constraint if exists employees_deleted_implies_inactive;

alter table public.employees
  add constraint employees_deleted_implies_inactive
  check (deleted_at is null or statut_employe = 'DESACTIVE');

create index if not exists idx_employees_deleted_at on public.employees(deleted_at);

-- ------------------------------------------------------
-- 2) Fix missing admin SELECT on user_profiles (blocker)
-- ------------------------------------------------------
drop policy if exists user_profiles_read_admin on public.user_profiles;

create policy user_profiles_read_admin
on public.user_profiles
for select
to authenticated
using (public.is_admin());

-- -------------------------------------------------------
-- 3) Update employee/self policies to enforce:
--    - active account only
--    - not soft-deleted
-- -------------------------------------------------------

-- Replace employees_read_self with stronger condition
drop policy if exists employees_read_self on public.employees;

create policy employees_read_self
on public.employees
for select
to authenticated
using (
  public.is_active_account()
  and auth.uid() = auth_user_id
  and deleted_at is null
);

-- (Admin policy stays as-is; admins can see all rows via employees_read_admin)

-- -------------------------------------------------------
-- 4) Remove hard-delete: employees / tokens / requests
-- -------------------------------------------------------
drop policy if exists employees_admin_delete on public.employees;
drop policy if exists qr_tokens_admin_delete on public.employee_qr_tokens;
drop policy if exists requests_admin_delete on public.employee_modification_requests;

-- -------------------------------------------------------
-- 5) Ensure token/request "self" access also requires active account
-- -------------------------------------------------------

-- QR tokens: tighten read_self
drop policy if exists qr_tokens_read_self on public.employee_qr_tokens;

create policy qr_tokens_read_self
on public.employee_qr_tokens
for select
to authenticated
using (
  public.is_active_account()
  and exists (
    select 1
    from public.employees e
    where e.id = employee_id
      and e.auth_user_id = auth.uid()
      and e.deleted_at is null
  )
);

-- Requests: tighten read_self + create_self
drop policy if exists requests_read_self on public.employee_modification_requests;
drop policy if exists requests_create_self on public.employee_modification_requests;

create policy requests_read_self
on public.employee_modification_requests
for select
to authenticated
using (
  public.is_active_account()
  and exists (
    select 1
    from public.employees e
    where e.id = employee_id
      and e.auth_user_id = auth.uid()
      and e.deleted_at is null
  )
);

create policy requests_create_self
on public.employee_modification_requests
for insert
to authenticated
with check (
  public.is_active_account()
  and exists (
    select 1
    from public.employees e
    where e.id = employee_id
      and e.auth_user_id = auth.uid()
      and e.deleted_at is null
  )
);

-- -------------------------------------------------------
-- 6) Optional: a single admin RPC to soft-delete consistently
--    (prevents "forgot to set deleted_at/deleted_by" in app code)
-- -------------------------------------------------------
create or replace function public.soft_delete_employee(p_employee_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  update public.employees
  set statut_employe = 'DESACTIVE',
      deleted_at = now(),
      deleted_by = auth.uid()
  where id = p_employee_id;
end;
$$;

revoke execute on function public.soft_delete_employee(uuid) from public;
grant execute on function public.soft_delete_employee(uuid) to authenticated;
