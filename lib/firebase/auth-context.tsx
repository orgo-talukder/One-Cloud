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
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './client';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isAnonymous?: boolean;
  providerId?: string;
  emailVerified?: boolean;
  creationTime?: string;
  lastSignInTime?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  updateUserDisplayName: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInAsGuest: async () => {},
  updateUserDisplayName: async () => {},
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
          const primaryProvider =
            fbUser.providerData?.[0]?.providerId ||
            (fbUser.isAnonymous ? 'anonymous' : 'password');

          const appUser: AppUser = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName:
              fbUser.displayName ||
              (fbUser.isAnonymous ? 'Guest User' : fbUser.email?.split('@')[0] || 'User'),
            photoURL: fbUser.photoURL,
            isAnonymous: fbUser.isAnonymous,
            providerId: primaryProvider,
            emailVerified: fbUser.emailVerified,
            creationTime: fbUser.metadata?.creationTime,
            lastSignInTime: fbUser.metadata?.lastSignInTime,
          };
          setUser(appUser);

          // Persist user profile to Firestore
          try {
            setDoc(
              doc(db, 'users', fbUser.uid),
              {
                uid: fbUser.uid,
                email: fbUser.email,
                displayName: appUser.displayName,
                photoURL: fbUser.photoURL || null,
                providerId: primaryProvider,
                emailVerified: fbUser.emailVerified || false,
                lastSeenAt: new Date().toISOString(),
              },
              { merge: true }
            ).catch((err) => {
              console.warn('Silent user profile sync notice:', err);
            });
          } catch {}
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
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const primaryProvider = result.user.providerData?.[0]?.providerId || 'google.com';
        const appUser: AppUser = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          isAnonymous: false,
          providerId: primaryProvider,
          emailVerified: result.user.emailVerified,
          creationTime: result.user.metadata?.creationTime,
          lastSignInTime: result.user.metadata?.lastSignInTime,
        };
        setUser(appUser);

        try {
          await setDoc(
            doc(db, 'users', result.user.uid),
            {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL || null,
              providerId: primaryProvider,
              emailVerified: result.user.emailVerified || false,
              lastLoginAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (dbErr) {
          console.warn('Could not persist Google user to Firestore:', dbErr);
        }
      }
    } catch (err: unknown) {
      console.error('Google Sign-In failed:', err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      const appUser: AppUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || email.split('@')[0],
        photoURL: result.user.photoURL,
        isAnonymous: false,
        providerId: 'password',
        emailVerified: result.user.emailVerified,
        creationTime: result.user.metadata?.creationTime,
        lastSignInTime: result.user.metadata?.lastSignInTime,
      };
      setUser(appUser);

      try {
        await setDoc(
          doc(db, 'users', result.user.uid),
          {
            uid: result.user.uid,
            email: result.user.email,
            displayName: appUser.displayName,
            providerId: 'password',
            lastLoginAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch {}
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      await updateProfile(result.user, { displayName: name });
      const appUser: AppUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: name,
        photoURL: null,
        isAnonymous: false,
        providerId: 'password',
        emailVerified: result.user.emailVerified,
        creationTime: result.user.metadata?.creationTime,
        lastSignInTime: result.user.metadata?.lastSignInTime,
      };
      setUser(appUser);

      try {
        await setDoc(
          doc(db, 'users', result.user.uid),
          {
            uid: result.user.uid,
            email: result.user.email,
            displayName: name,
            photoURL: null,
            providerId: 'password',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch {}
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
        providerId: 'anonymous',
      });
    }
  };

  const updateUserDisplayName = async (name: string) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: name });
      setUser((prev) => (prev ? { ...prev, displayName: name } : null));
      try {
        await setDoc(
          doc(db, 'users', auth.currentUser.uid),
          { displayName: name, updatedAt: new Date().toISOString() },
          { merge: true }
        );
      } catch {}
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
        updateUserDisplayName,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
