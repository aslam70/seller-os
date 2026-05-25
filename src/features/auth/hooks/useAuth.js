import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    // Ensure password meets Supabase minimum (6 characters)
    if (password.length < 6) {
      return { error: { message: "Password must be at least 6 characters" } };
    }
    // Provide a redirect URL for email confirmation flows
    const redirectTo = window.location.origin + "/login";
    return supabase.auth.signUp({ email, password }, { emailRedirectTo: redirectTo });
  };

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

  return { user, loading, signUp, signIn, signOut };
}
