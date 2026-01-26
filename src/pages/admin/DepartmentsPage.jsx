import AppShell from '../../layouts/AppShell.jsx';

export default function DepartmentsPage() {
  return (
    <AppShell title="Departments">
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Departments</h2>
        <p className="mt-2 text-sm text-slate-500">
          Manage departments and their status.
        </p>
      </div>
    </AppShell>
  );
}
