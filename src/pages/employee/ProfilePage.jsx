import AppShell from '../../layouts/AppShell.jsx';

export default function ProfilePage() {
  return (
    <AppShell title="My Profile">
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Mon Profil</h2>
        <p className="mt-2 text-sm text-slate-500">
          Vos informations professionnelles (lecture seule).
        </p>
      </div>
    </AppShell>
  );
}
