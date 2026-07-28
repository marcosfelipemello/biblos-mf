import { useState, useEffect } from "react";
import { auth } from "../config/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (authUser) => {
        setUser(authUser);

        // Fonte única de verdade para admin: a custom claim do token.
        try {
          const token = await authUser?.getIdTokenResult();
          setIsAdmin(!!token?.claims.admin);
        } catch (err) {
          console.error("Admin claim check failed:", err);
          setIsAdmin(false);
        }

        setLoading(false);
      },
      (err) => {
        console.error("Auth Error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error("Login Error:", err);
      setError(err);
      throw err;
    }
  };

  const register = async (email, password) => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error("Register Error:", err);
      setError(err);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Google Login Error:", err);
      setError(err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  const loginAnonymously = async () => {
    setError(null);
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.error("Anonymous Login Error:", err);
      setError(err);
      throw err;
    }
  };

  return {
    user,
    isAdmin,
    loading,
    error,
    login,
    loginWithGoogle,
    loginAnonymously,
    register,
    logout,
    isAuthenticated: !!user,
  };
}
