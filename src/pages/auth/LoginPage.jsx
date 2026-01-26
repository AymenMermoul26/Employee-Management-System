import AuthLayout from '../../layouts/AuthLayout.jsx';

export default function LoginPage() {
  return (
    <AuthLayout>
      <h2 className="text-xl font-semibold text-slate-800">Sign in</h2>
      <p className="mt-2 text-sm text-slate-500">
        Connectez-vous pour accéder à votre espace.
      </p>
      <div className="mt-6 space-y-3">
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder="Email"
          type="email"
        />
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder="Mot de passe"
          type="password"
        />
        <button className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
          Se connecter
        </button>
      </div>
    </AuthLayout>
  );
}
