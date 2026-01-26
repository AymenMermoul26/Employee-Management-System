import AppShell from '../../layouts/AppShell.jsx';

export default function EmployeesPage() {
  return (
    <AppShell title="Employees">
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Employee List</h2>
        <p className="mt-2 text-sm text-slate-500">
          This view will host search, filters, and pagination.
        </p>
      </div>
    </AppShell>
  );
}
