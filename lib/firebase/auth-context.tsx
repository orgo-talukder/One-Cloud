'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  signOut as fbSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './client';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isAnonymous?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInAsGuest: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName:
              fbUser.displayName ||
              (fbUser.isAnonymous ? 'Guest User' : fbUser.email?.split('@')[0] || 'User'),
            photoURL: fbUser.photoURL,
            isAnonymous: fbUser.isAnonymous,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Auth state listener error:', err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
      setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        isAnonymous: false,
      });
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || email.split('@')[0],
        photoURL: result.user.photoURL,
        isAnonymous: false,
      });
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      await updateProfile(result.user, { displayName: name });
      setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: name,
        photoURL: null,
        isAnonymous: false,
      });
    }
  };

  const signInAsGuest = async () => {
    const result = await signInAnonymously(auth);
    if (result.user) {
      setUser({
        uid: result.user.uid,
        email: null,
        displayName: 'Guest User',
        photoURL: null,
        isAnonymous: true,
      });
    }
  };

  const signOut = async () => {
    await fbSignOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
