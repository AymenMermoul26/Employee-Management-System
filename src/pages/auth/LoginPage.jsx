import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout.jsx";
import { supabase } from "../../lib/supabaseClient.js";
import { useAuth } from "../../auth/AuthProvider.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    loading,
    hydrated,
    profileReady,
    isAuthenticated,
    role,
    accountStatus,
    authUser,
    signOut,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (loading || !hydrated || !profileReady) return;

    let cancelled = false;

    (async () => {
      // Logged in at Supabase level but missing role/profile after hydration
      if (authUser && !role) {
        setErrorMsg(
          "Connexion réussie, mais votre compte n’est pas encore configuré. Contactez l’administrateur.",
        );

        // Prevent the user from interacting while we cleanly terminate the session
        setSubmitting(true);

        try {
          await signOut(); // <-- IMPORTANT: await it
        } finally {
          if (!cancelled) setSubmitting(false);
        }
        return;
      }

      if (isAuthenticated) {
        if (accountStatus === "DESACTIVE") {
          setErrorMsg(
            "Votre compte est désactivé. Contactez l’administrateur.",
          );
          return;
        }

        if (role === "ADMIN") navigate("/admin", { replace: true });
        else if (role === "EMPLOYEE") navigate("/employee", { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    loading,
    hydrated,
    profileReady,
    authUser,
    isAuthenticated,
    role,
    accountStatus,
    navigate,
    signOut,
  ]);

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }
      // redirect happens via AuthProvider hydration + effect above
    } catch (err) {
      console.error(err);
      setErrorMsg("Erreur inattendue pendant la connexion.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      {loading || !hydrated || !profileReady ? (
        <div className="text-sm text-slate-500">Chargement...</div>
      ) : null}

      <h2 className="text-xl font-semibold text-slate-800">Sign in</h2>
      <p className="mt-2 text-sm text-slate-500">
        Connectez-vous pour accéder à votre espace.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          required
        />
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder="Mot de passe"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={submitting}
          required
        />

        {errorMsg ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMsg}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {submitting ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </AuthLayout>
  );
}
