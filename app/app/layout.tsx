'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { UploadQueueDrawer } from '@/components/modals/UploadQueueDrawer';

export default function DriveAppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <AppSidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/50 backdrop-blur-xs">
          <div className="relative flex flex-col w-72 max-w-xs bg-white h-full shadow-2xl">
            <AppSidebar />
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Workspace Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader onToggleMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Persistent Upload Manager Drawer */}
      <UploadQueueDrawer />
    </div>
  );
}
