-- Seed data for Employee Management System (idempotent)
-- Replace the UUID placeholders with real Supabase Auth user IDs.

-- Departments (avoid duplicates if rerun)
insert into public.departments (name, status)
values
  ('Engineering', 'ACTIF'),
  ('Human Resources', 'ACTIF'),
  ('Finance', 'ACTIF')
on conflict (name) do nothing;

-- Optional: create an employee without an auth account yet
insert into public.employees (
  department_id,
  matricule,
  nom,
  prenom,
  poste,
  telephone_pro,
  email_pro,
  statut_employe
)
select
  d.id,
  'EMP-001',
  'Doe',
  'Jane',
  'Software Engineer',
  '+000000000001',
  'jane.doe@company.tld',
  'ACTIF'
from public.departments d
where d.name = 'Engineering'
on conflict (matricule) do nothing;

-- Admin profile (use a real UUID from Supabase Auth)
insert into public.user_profiles (supabase_user_id, role, statut_compte)
values
  ('00000000-0000-0000-0000-000000000001', 'ADMIN', 'ACTIF')
on conflict (supabase_user_id) do update
set role = excluded.role,
    statut_compte = excluded.statut_compte;

-- Optional: employee user profile (separate UUID from admin)
insert into public.user_profiles (supabase_user_id, role, statut_compte)
values
  ('00000000-0000-0000-0000-000000000002', 'EMPLOYEE', 'ACTIF')
on conflict (supabase_user_id) do update
set role = excluded.role,
    statut_compte = excluded.statut_compte;

-- Link employee auth user to employee record
update public.employees
set auth_user_id = '00000000-0000-0000-0000-000000000002'
where matricule = 'EMP-001';
