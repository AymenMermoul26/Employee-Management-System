import AppShell from '../../layouts/AppShell.jsx';

export default function EmployeeDashboard() {
  return (
    <AppShell title="Employee Dashboard">
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Bienvenue</h2>
        <p className="mt-2 text-sm text-slate-500">
          Consultez votre profil et vos demandes.
        </p>
      </div>
    </AppShell>
  );
}
