import AppShell from '../../layouts/AppShell.jsx';

export default function EmployeeDetailPage() {
  return (
    <AppShell title="Employee Detail">
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Employee Profile</h2>
        <p className="mt-2 text-sm text-slate-500">
          Profile details, QR management, and export will live here.
        </p>
      </div>
    </AppShell>
  );
}
