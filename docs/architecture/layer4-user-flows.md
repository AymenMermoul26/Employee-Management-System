# Layer 4 — User Flows (High-Level)

## 1) Admin Flow
**Goal:** full control over employees, departments, QR tokens, and requests.

### A) Authentication & Landing
1. Admin logs in via Supabase Auth.
2. App reads `ProfilUtilisateur` → role = ADMIN.
3. Admin is redirected to **Admin Dashboard**.

### B) Employee Management
1. Admin opens **Employees** page.
2. Uses search, filters, pagination.
3. Actions:
   - Create employee
   - Edit employee
   - Deactivate/Reactivate employee
   - Optional delete (discouraged)

### C) Department Management
1. Admin opens **Departments**.
2. Create/update departments.
3. Optional soft-deactivate.

### D) QR Management
1. Admin opens employee record.
2. Generate QR (creates token).
3. Regenerate QR (revokes old token, creates new).
4. Revoke QR (sets revoked_at).
5. Download/view QR.

### E) Modification Requests
1. Admin sees list of requests.
2. Opens request details.
3. Approves or rejects.
4. Decision reason saved.

### F) Employee Profile Export (CV-style)
1. Admin opens employee record.
2. Selects **Download Profile** (CV-style summary).
3. Export includes photo, core identity, role/department, and safe contact fields.

---

## 2) Employee Flow
**Goal:** view own data; request changes.

### A) Authentication & Landing
1. Employee logs in.
2. App loads `ProfilUtilisateur` → role = EMPLOYEE.
3. Employee redirected to **Employee Dashboard**.

### B) Profile Viewing
1. Employee opens **My Profile**.
2. Sees read-only data (from `Employe`).

### C) Public Preview
1. Employee opens **Public Preview**.
2. Sees how their profile appears via QR.

### D) Request Modification (Optional)
1. Employee submits change request.
2. Request is stored in `DemandeModification`.
3. Admin handles approval/rejection.

### E) Password Change
1. Employee uses Supabase password reset flow.

---

## 3) Public QR Flow
**Goal:** safe public profile view without login.

1. Visitor scans QR.
2. Public page loads with `token` in URL.
3. System validates:
   - token exists + active
   - not expired / revoked
   - employee status = ACTIF
4. If valid → display public-safe profile fields.
5. If invalid/revoked/inactive → show safe error page.

---

## 4) Shared Edge Cases (All Flows)
- **Account disabled** → deny access, show message.
- **Employee inactive** → deny internal + public access.
- **Token revoked** → public sees “Access expired or revoked.”
- **Missing profile** → safe fallback screen.
