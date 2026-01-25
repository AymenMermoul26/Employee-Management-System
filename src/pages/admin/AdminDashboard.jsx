import AppShell from '../../layouts/AppShell.jsx';

export default function AdminDashboard() {
  return (
    <AppShell title="Admin Dashboard">
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Bienvenue Admin</h2>
        <p className="mt-2 text-sm text-slate-500">
          Sélectionnez un module pour gérer les employés, départements, QR ou demandes.
        </p>
      </div>
    </AppShell>
  );
}
