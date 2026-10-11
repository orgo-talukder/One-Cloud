'use client';

import React from 'react';
import { AuthProvider } from '@/lib/firebase/auth-context';
import { DriveProvider } from '@/lib/drive/drive-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DriveProvider>{children}</DriveProvider>
    </AuthProvider>
  );
}
