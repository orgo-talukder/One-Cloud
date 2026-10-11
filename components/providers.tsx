'use client';

import React from 'react';
import { AuthProvider } from '@/lib/firebase/auth-context';
import { DriveProvider } from '@/lib/drive/drive-context';
import { ThemeProvider } from '@/lib/theme-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DriveProvider>{children}</DriveProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
