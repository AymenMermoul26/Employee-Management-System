import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout.jsx";
import { fetchPublicProfileByToken } from "../../data/publicProfile.js";

export default function PublicProfilePage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);
      setProfile(null);

      const { profile: p, error: e } = await fetchPublicProfileByToken(token);
      if (!alive) return;

      if (e) setError(e);
      else setProfile(p);

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [token]);

  return (
    <PublicLayout>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Profil public</h2>

        {loading && (
          <p className="mt-4 text-sm text-slate-500">Chargement du profil…</p>
        )}

        {!loading && error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-medium">Impossible de charger le profil.</p>
            <p className="mt-1 opacity-90">
              Le QR code est peut-être invalide, expiré ou révoqué.
            </p>
          </div>
        )}

        {!loading && !error && !profile && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-medium">Profil introuvable.</p>
            <p className="mt-1 opacity-90">
              Vérifiez que le QR code est toujours actif.
            </p>
          </div>
        )}

        {!loading && !error && profile && (
          <div className="mt-4 flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={`${profile.prenom ?? ""} ${profile.nom ?? ""}`.trim()}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>

            <div>
              <p className="text-base font-semibold">
                {profile.prenom} {profile.nom}
              </p>
              <p className="text-sm text-slate-600">{profile.poste}</p>
              <p className="text-sm text-slate-500">
                {profile.department_name}
              </p>
            </div>
          </div>
        )}

        <p className="mt-6 text-xs text-slate-400">
          Token: <span className="font-mono">{token}</span>
        </p>
      </div>
    </PublicLayout>
  );
}
