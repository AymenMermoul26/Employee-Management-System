import AppShell from '../../layouts/AppShell.jsx';

export default function EmployeeRequestsPage() {
  return (
    <AppShell title="My Requests">
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Mes demandes</h2>
        <p className="mt-2 text-sm text-slate-500">
          Suivez vos demandes de modification.
        </p>
      </div>
    </AppShell>
  );
}
