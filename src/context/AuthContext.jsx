// ─── AuthContext ───
// Wraps Firebase Auth state into React Context.
// Provides: user object, loading flag, login, signup, logout, and the raw Firebase auth instance.

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Listen to Firebase auth state ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Hydrate user profile from Firestore (contains role, phone, etc.)
        const profileRef = doc(db, 'users', firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);
        const profileData = profileSnap.exists() ? profileSnap.data() : {};

        setUser({
          uid:         firebaseUser.uid,
          email:       firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL:    firebaseUser.photoURL,
          ...profileData,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Signup with Email/Password ──
  const signup = async ({ email, password, firstName, lastName, phone }) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = credential.user;

    // Set displayName on Firebase Auth profile
    await updateProfile(credential.user, {
      displayName: `${firstName} ${lastName}`,
    });

    // Store extended profile in Firestore
    await setDoc(doc(db, 'users', uid), {
      uid,
      email,
      firstName,
      lastName,
      phone:     phone || '',
      role:      'user', // default role; admin is set manually or via VITE_ADMIN_EMAIL check
      createdAt: serverTimestamp(),
    });

    return credential.user;
  };

  // ── Login with Email/Password ──
  const login = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  };

  // ── Logout ──
  const logout = () => signOut(auth);

  // ── Admin check ──
  const isAdmin =
    user?.email === (import.meta.env.VITE_ADMIN_EMAIL || 'admin@bookngo.com') ||
    user?.role === 'admin';

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAdmin,
    auth, // raw Firebase auth instance for edge-case usage
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
