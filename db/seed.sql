-- Seed data for Employee Management System
-- Replace the placeholder UUIDs with real values from your Supabase Auth users.

-- Departments
insert into public.departments (name, status)
values
  ('Engineering', 'ACTIF'),
  ('Human Resources', 'ACTIF'),
  ('Finance', 'ACTIF');

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
  '+212600000001',
  'jane.doe@company.tld',
  'ACTIF'
from public.departments d
where d.name = 'Engineering';

-- Link an existing Supabase Auth user to the admin profile
-- 1) Create the user in Supabase Auth
-- 2) Copy their UUID and paste it below
insert into public.user_profiles (supabase_user_id, role, statut_compte)
values
  ('00000000-0000-0000-0000-000000000000', 'ADMIN', 'ACTIF');

-- Optional: link an existing Supabase Auth user to an employee record
-- 1) Create the user in Supabase Auth
-- 2) Copy their UUID and paste it below
update public.employees
set auth_user_id = '00000000-0000-0000-0000-000000000000'
where matricule = 'EMP-001';
