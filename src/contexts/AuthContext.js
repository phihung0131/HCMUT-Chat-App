import React, { createContext, useState, useEffect, useContext } from "react";
import { createClient } from "@supabase/supabase-js";

const AuthContext = createContext();

const supabase = createClient(
  "https://tdxlkbnxwjdxcphlncwi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkeGxrYm54d2pkeGNwaGxuY3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYwMzQ1MDQsImV4cCI6MjA0MTYxMDUwNH0.hD7V62SpuPz6iaW3UavLAhU4MCxgjhry3zaspcxJ-sM"
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (options) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      ...options,
      options: {
        ...options.options,
        queryParams: {
          ...options.options?.queryParams,
          hd: "hcmut.edu.vn",
        },
      },
    });

    if (error) throw error;
    return data;
  };

  const signOut = () => supabase.auth.signOut();

  const value = {
    signIn,
    signOut,
    user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
