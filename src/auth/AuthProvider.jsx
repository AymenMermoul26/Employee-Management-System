import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Supabase session user
  const [authUser, setAuthUser] = useState(null);

  // Row from public.user_profiles
  const [profile, setProfile] = useState(null);

  async function ensureFreshSession(session) {
    if (!session) return { session: null };

    const nowSec = Date.now() / 1000;
    const expiresAt = session.expires_at ?? 0;

    // If token is close to expiry, refresh it to avoid stale sessions that block queries
    if (expiresAt - nowSec < 30) {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        throw error;
      }
      return { session: data.session };
    }

    return { session };
  }

  async function loadProfile(userId) {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("role, statut_compte")
        .eq("supabase_user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data; // can be null if row missing or blocked
    } catch (e) {
      console.error("PROFILE FETCH ERROR", e);
      return null;
    }
  }

  async function hydrateFromSession(session) {
    const user = session?.user ?? null;
    setAuthUser(user);
    setProfileLoaded(false);

    if (!user) {
      setProfile(null);
      return;
    }

    try {
      const { session: freshSession } = await ensureFreshSession(session);
      const activeUser = freshSession?.user ?? user;

      // Session refresh failed or user vanished
      if (!activeUser) {
        await supabase.auth.signOut();
        setAuthUser(null);
        setProfile(null);
        setProfileLoaded(true);
        return;
      }

      const p = await loadProfile(activeUser.id);
      if (!p) {
        // Session exists but no profile row; force logout to clear bad state
        await supabase.auth.signOut();
        setAuthUser(null);
        setProfile(null);
        setProfileLoaded(true);
        return;
      }

      setProfile(p);
      setProfileLoaded(true);

      // UX enforcement: disabled accounts should not stay logged in
      if (p?.statut_compte === "DESACTIVE") {
        await supabase.auth.signOut();
        setAuthUser(null);
        setProfile(null);
      }
    } catch (e) {
      console.error("Profile load failed, signing out:", e);
      await supabase.auth.signOut(); // clears the bad session automatically
      setAuthUser(null);
      setProfile(null);
      setProfileLoaded(true);
    } finally {
      setHydrated(true);
    }
  }

  useEffect(() => {
    let alive = true;
    const safety = setTimeout(() => {
      if (!alive) return;
      setHydrated(true);
      setProfileLoaded(true);
      setLoading(false);
    }, 5000);

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
        setProfileLoaded(false);
        setHydrated(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setLoading(true);
          await hydrateFromSession(session);
        } finally {
          setLoading(false);
          setHydrated(true);
          if (!session?.user) setProfileLoaded(false);
        }
      },
    );

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe();
      clearTimeout(safety);
    };
  }, []);

  const value = useMemo(() => {
    const role = profile?.role ?? null;
    const accountStatus = profile?.statut_compte ?? null;
    const profileReady = authUser ? profileLoaded : true;

    // Strict rule: you are "authenticated for app access" only if:
    // - Supabase user exists
    // - profile exists
    // - account is ACTIF
    const isAuthenticated =
      Boolean(authUser) && profileReady && Boolean(role) && accountStatus === "ACTIF";

    return {
      loading,
      hydrated,
      profileReady,
      authUser,
      profile,
      role,
      accountStatus,
      isAuthenticated,
      signOut: () => supabase.auth.signOut(),
    };
  }, [loading, hydrated, authUser, profile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
