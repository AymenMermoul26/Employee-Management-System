# Layer 5 — API / Query Layer (Implementation Guide)

This document defines the query contracts that map UI screens to Supabase calls.
It is intentionally minimal and aligned with RLS constraints.

## 1) Auth + Session

### A) Fetch current session
- **Purpose:** determine authenticated user and access token.
- **Supabase:** `auth.getSession()`

### B) Load current user profile
- **Query:** `user_profiles` by `supabase_user_id = auth.uid()`
- **Fields:** `role`, `statut_compte`
- **Notes:** if `statut_compte = DESACTIVE`, block access.

---

## 2) Admin: Employee List (search + pagination)

### Query
- **Table:** `employees`
- **Join:** `departments` (for display)
- **Filters:**
  - `matricule` or `nom/prenom` (text search)
  - `department_id`
  - `statut_employe`
- **Sort:** `nom`, `matricule`, `department`, `created_at`
- **Pagination:** `range(from, to)`

### Returned fields
- `id`, `matricule`, `nom`, `prenom`, `poste`, `statut_employe`, `department_id`
- `departments.name` as `department_name`

---

## 3) Admin: Employee Detail

### Query
- **Table:** `employees`
- **Join:** `departments`
- **Filter:** `employees.id = :id`

### Returned fields (full internal profile)
- All employee columns + `departments.name` as `department_name`

---

## 4) Admin: Create / Update Employee

### Insert
- **Table:** `employees`
- **Fields:** core identity, department, status, contact, optional `auth_user_id`.

### Update
- **Table:** `employees`
- **Filter:** `id = :id`
- **Fields:** mutable columns only.

---

## 5) Admin: Department CRUD

### List
- **Table:** `departments`
- **Fields:** `id`, `name`, `status`

### Create / Update
- **Table:** `departments`
- **Fields:** `name`, `status`

---

## 6) Admin: QR Token Management

### Create token
- **Table:** `employee_qr_tokens`
- **Fields:** `employee_id`, `token_hash`, `statut_token`, `expires_at`

### Revoke token
- **Table:** `employee_qr_tokens`
- **Filter:** `id = :id`
- **Fields:** `statut_token = 'REVOKED'`, `revoked_at = now()`

### List tokens
- **Filter:** `employee_id = :employee_id`
- **Fields:** `id`, `statut_token`, `created_at`, `expires_at`, `revoked_at`

---

## 7) Admin: CV-Style Export

### Query
- **Table:** `employees`
- **Join:** `departments`
- **Filter:** `id = :id`

### Returned fields (approved only)
- `photo_url`, `nom`, `prenom`, `poste`, `department_name`,
  `email_pro`, `telephone_pro` (only if approved)

### Export output
- **PDF** built from a consistent template.
- **Exclude:** private address, personal phone, internal notes.

---

## 8) Employee: Own Profile

### Query
- **Table:** `employees`
- **Filter:** `auth_user_id = auth.uid()`
- **Fields:** internal-safe profile fields (read-only).

---

## 9) Employee: Modification Requests

### Create request
- **Table:** `employee_modification_requests`
- **Fields:** `employee_id`, `contenu_demande`

### List requests
- **Filter:** `employee_id = :employee_id`
- **Fields:** `statut_demande`, `date_demande`, `reviewed_at`, `decision_reason`

---

## 10) Public QR Profile

### Query
- **Function:** `get_public_profile(token)`
- **Output:** public-safe fields only.

---

## 11) Error Handling Rules

- **401/403** → show access denied or redirect to login.
- **Empty results** → show safe empty states (no sensitive hints).
- **Validation errors** → show field-level messages.
