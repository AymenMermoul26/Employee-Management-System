import AppShell from '../../layouts/AppShell.jsx';

export default function RequestsPage() {
  return (
    <AppShell title="Requests">
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Modification Requests</h2>
        <p className="mt-2 text-sm text-slate-500">
          Review pending employee requests here.
        </p>
      </div>
    </AppShell>
  );
}
