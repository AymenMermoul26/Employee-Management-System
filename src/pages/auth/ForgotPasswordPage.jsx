import AuthLayout from '../../layouts/AuthLayout.jsx';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <h2 className="text-xl font-semibold text-slate-800">Mot de passe oublié</h2>
      <p className="mt-2 text-sm text-slate-500">
        Saisissez votre email pour recevoir un lien de réinitialisation.
      </p>
      <div className="mt-6 space-y-3">
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder="Email"
          type="email"
        />
        <button className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
          Envoyer le lien
        </button>
      </div>
    </AuthLayout>
  );
}
