import AppShell from '../../layouts/AppShell.jsx';

export default function PublicPreviewPage() {
  return (
    <AppShell title="Public Preview">
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Prévisualisation publique</h2>
        <p className="mt-2 text-sm text-slate-500">
          Aperçu de votre profil public accessible via QR.
        </p>
      </div>
    </AppShell>
  );
}
