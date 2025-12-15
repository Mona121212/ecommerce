"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getFirebaseAuth } from "./firebase";

/* =====================
   create Context
===================== */
const AuthContext = createContext(null);

/* =====================
   Provider
===================== */
export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const emailSignUp = async (email, password) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase Auth not initialized");
    const { createUserWithEmailAndPassword } = await import("firebase/auth");
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const emailSignIn = async (email, password) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase Auth not initialized");
    const { signInWithEmailAndPassword } = await import("firebase/auth");
    return signInWithEmailAndPassword(auth, email, password);
  };

  const firebaseSignOut = async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    const { signOut } = await import("firebase/auth");
    return signOut(auth);
  };

  useEffect(() => {
    let unsubscribe = null;

    (async () => {
      try {
        const auth = getFirebaseAuth();
        if (!auth) {
          setAuthLoading(false);
          return;
        }

        const { onAuthStateChanged } = await import("firebase/auth");
        unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser ?? null);
          setAuthLoading(false);
        });
      } catch (e) {
        setUser(null);
        setAuthLoading(false);
      }
    })();

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      authLoading,
      emailSignUp,
      emailSignIn,
      firebaseSignOut,
    }),
    [user, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* =====================
   Hook
===================== */
export function useUserAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useUserAuth must be used within AuthContextProvider");
  }
  return ctx;
}
