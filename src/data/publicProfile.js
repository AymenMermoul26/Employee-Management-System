import { supabase } from "../lib/supabaseClient.js";

/**
 * Fetch the public employee profile associated with a QR token.
 *
 * Why RPC?
 * - We intentionally do NOT allow public table reads.
 * - The DB function `public.get_public_profile(token text)` returns a whitelisted
 *   subset of fields only.
 */
export async function fetchPublicProfileByToken(token) {
    if (!token || typeof token !== "string") {
        return { profile: null, error: new Error("Missing token") };
    }

    const { data, error } = await supabase.rpc("get_public_profile", { token });
    if (error) return { profile: null, error };

    // Normalize to a single row or null.
    const row = Array.isArray(data) ? data[0] ?? null : data ?? null;

    return { profile: row, error: null };
}
