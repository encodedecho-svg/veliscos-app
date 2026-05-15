"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdmin = useCallback(async (email: string | undefined) => {
    if (!email) {
      setIsAdmin(false);
      return;
    }
    const { data, error } = await supabase
      .from("admin_emails")
      .select("email")
      .eq("email", email)
      .maybeSingle();
    setIsAdmin(Boolean(data) && !error);
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Safety: never let `loading` stay true for more than 5s. If something
    // hangs (network, RLS, deadlock), we still let the app render so the user
    // sees something instead of a perpetual spinner.
    const safety = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 5000);

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (cancelled) return;
        const u = data.session?.user ?? null;
        setUser(u);
        await checkAdmin(u?.email);
      })
      .catch((err) => console.warn("getSession failed", err))
      .finally(() => {
        if (!cancelled) {
          clearTimeout(safety);
          setLoading(false);
        }
      });
    // IMPORTANT: do not call other Supabase methods inside this callback —
    // it holds an internal lock and awaiting another Supabase call can
    // deadlock the auth client. Defer admin check to a microtask.
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      const u = sess?.user ?? null;
      setUser(u);
      setTimeout(() => {
        checkAdmin(u?.email);
      }, 0);
    });
    return () => {
      cancelled = true;
      clearTimeout(safety);
      sub.subscription.unsubscribe();
    };
  }, [checkAdmin]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAdmin, signIn, signOut }),
    [user, loading, isAdmin, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
