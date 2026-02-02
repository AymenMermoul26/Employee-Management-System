import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);

  // Supabase session user
  const [authUser, setAuthUser] = useState(null);

  // Row from public.user_profiles
  const [profile, setProfile] = useState(null);

  async function loadProfile(userId) {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("role, statut_compte")
      .eq("supabase_user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data; // can be null if row missing or blocked
  }

  async function hydrateFromSession(session) {
    const user = session?.user ?? null;
    setAuthUser(user);

    if (!user) {
      setProfile(null);
      return;
    }

    try {
      const p = await loadProfile(user.id);
      setProfile(p);

      // UX enforcement: disabled accounts should not stay logged in
      if (p?.statut_compte === "DESACTIVE") {
        await supabase.auth.signOut();
        setAuthUser(null);
        setProfile(null);
      }
    } catch (e) {
      // Fail closed: keep session but no role => guards will block access
      console.error("Profile load failed:", e);
      setProfile(null);
    }
  }

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!alive) return;
        await hydrateFromSession(data.session);
      } catch (e) {
        console.error("Auth bootstrap failed:", e);
        setAuthUser(null);
        setProfile(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          setLoading(true);
          await hydrateFromSession(session);
        } finally {
          setLoading(false);
        }
      },
    );

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(() => {
    const role = profile?.role ?? null;
    const accountStatus = profile?.statut_compte ?? null;

    // Strict rule: you are "authenticated for app access" only if:
    // - Supabase user exists
    // - profile exists
    // - account is ACTIF
    const isAuthenticated =
      Boolean(authUser) && Boolean(role) && accountStatus === "ACTIF";

    return {
      loading,
      authUser,
      profile,
      role,
      accountStatus,
      isAuthenticated,
      signOut: () => supabase.auth.signOut(),
    };
  }, [loading, authUser, profile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
