-- Database schema + RLS for Employee Management System

create extension if not exists pgcrypto;

-- Enums
create type public.user_role as enum ('ADMIN', 'EMPLOYEE');
create type public.account_status as enum ('ACTIF', 'DESACTIVE');
create type public.employee_status as enum ('ACTIF', 'DESACTIVE');
create type public.token_status as enum ('ACTIVE', 'REVOKED');
create type public.request_status as enum ('PENDING', 'APPROVED', 'REJECTED');

-- Helper: updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Departments
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status public.account_status not null default 'ACTIF',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger departments_set_updated_at
before update on public.departments
for each row execute function public.set_updated_at();

-- Employees
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id),
  auth_user_id uuid references auth.users(id),
  matricule text not null,
  nom text not null,
  prenom text not null,
  poste text not null,
  telephone_pro text,
  email_pro text,
  photo_url text,
  statut_employe public.employee_status not null default 'ACTIF',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (matricule)
);

create index employees_department_id_idx on public.employees(department_id);
create index employees_status_idx on public.employees(statut_employe);
create index employees_name_idx on public.employees(nom, prenom);

create trigger employees_set_updated_at
before update on public.employees
for each row execute function public.set_updated_at();

-- User profiles (roles + account status)
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  supabase_user_id uuid not null references auth.users(id) on delete cascade,
  role public.user_role not null,
  statut_compte public.account_status not null default 'ACTIF',
  created_at timestamptz not null default now(),
  unique (supabase_user_id)
);

-- Helper: admin check
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.user_profiles
    where supabase_user_id = auth.uid()
      and role = 'ADMIN'
      and statut_compte = 'ACTIF'
  );
$$;

-- QR tokens
create table if not exists public.employee_qr_tokens (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  token_hash text not null,
  statut_token public.token_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  unique (token_hash)
);

create index employee_qr_tokens_employee_id_idx on public.employee_qr_tokens(employee_id);

-- Modification requests
create table if not exists public.employee_modification_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  contenu_demande jsonb not null,
  statut_demande public.request_status not null default 'PENDING',
  date_demande timestamptz not null default now(),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  decision_reason text
);

create index employee_modification_requests_employee_id_idx on public.employee_modification_requests(employee_id);
create index employee_modification_requests_status_idx on public.employee_modification_requests(statut_demande);

-- Public-safe profile accessor (token hashed with sha256)
create or replace function public.get_public_profile(token text)
returns table (
  employee_id uuid,
  nom text,
  prenom text,
  poste text,
  department_name text,
  photo_url text
)
language sql
security definer
set search_path = public
as $$
  select
    e.id as employee_id,
    e.nom,
    e.prenom,
    e.poste,
    d.name as department_name,
    e.photo_url
  from public.employee_qr_tokens t
  join public.employees e on e.id = t.employee_id
  join public.departments d on d.id = e.department_id
  where t.token_hash = encode(digest(token, 'sha256'), 'hex')
    and t.statut_token = 'ACTIVE'
    and (t.expires_at is null or t.expires_at > now())
    and t.revoked_at is null
    and e.statut_employe = 'ACTIF'
  limit 1;
$$;

grant execute on function public.get_public_profile(text) to anon, authenticated;

-- RLS
alter table public.departments enable row level security;
alter table public.employees enable row level security;
alter table public.user_profiles enable row level security;
alter table public.employee_qr_tokens enable row level security;
alter table public.employee_modification_requests enable row level security;

-- Departments policies
create policy departments_read_authenticated
on public.departments
for select
to authenticated
using (true);

create policy departments_admin_insert
on public.departments
for insert
to authenticated
with check (public.is_admin());

create policy departments_admin_update
on public.departments
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy departments_admin_delete
on public.departments
for delete
to authenticated
using (public.is_admin());

-- Employees policies
create policy employees_read_admin
on public.employees
for select
to authenticated
using (public.is_admin());

create policy employees_read_self
on public.employees
for select
to authenticated
using (auth.uid() = auth_user_id);

create policy employees_admin_insert
on public.employees
for insert
to authenticated
with check (public.is_admin());

create policy employees_admin_update
on public.employees
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy employees_admin_delete
on public.employees
for delete
to authenticated
using (public.is_admin());

-- User profiles policies
create policy user_profiles_read_self
on public.user_profiles
for select
to authenticated
using (supabase_user_id = auth.uid());

create policy user_profiles_admin_insert
on public.user_profiles
for insert
to authenticated
with check (public.is_admin());

create policy user_profiles_admin_update
on public.user_profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy user_profiles_admin_delete
on public.user_profiles
for delete
to authenticated
using (public.is_admin());

-- QR token policies
create policy qr_tokens_read_admin
on public.employee_qr_tokens
for select
to authenticated
using (public.is_admin());

create policy qr_tokens_read_self
on public.employee_qr_tokens
for select
to authenticated
using (
  exists (
    select 1
    from public.employees e
    where e.id = employee_id
      and e.auth_user_id = auth.uid()
  )
);

create policy qr_tokens_admin_insert
on public.employee_qr_tokens
for insert
to authenticated
with check (public.is_admin());

create policy qr_tokens_admin_update
on public.employee_qr_tokens
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy qr_tokens_admin_delete
on public.employee_qr_tokens
for delete
to authenticated
using (public.is_admin());

-- Modification request policies
create policy requests_read_admin
on public.employee_modification_requests
for select
to authenticated
using (public.is_admin());

create policy requests_read_self
on public.employee_modification_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.employees e
    where e.id = employee_id
      and e.auth_user_id = auth.uid()
  )
);

create policy requests_create_self
on public.employee_modification_requests
for insert
to authenticated
with check (
  exists (
    select 1
    from public.employees e
    where e.id = employee_id
      and e.auth_user_id = auth.uid()
  )
);

create policy requests_admin_update
on public.employee_modification_requests
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy requests_admin_delete
on public.employee_modification_requests
for delete
to authenticated
using (public.is_admin());
