import AuthLayout from '../../layouts/AuthLayout.jsx';

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <h2 className="text-xl font-semibold text-slate-800">Nouveau mot de passe</h2>
      <p className="mt-2 text-sm text-slate-500">
        Choisissez un nouveau mot de passe pour votre compte.
      </p>
      <div className="mt-6 space-y-3">
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder="Nouveau mot de passe"
          type="password"
        />
        <button className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
          Mettre à jour
        </button>
      </div>
    </AuthLayout>
  );
}
