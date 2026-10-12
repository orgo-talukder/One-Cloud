'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  HardDrive,
  Plus,
  Star,
  Clock,
  Upload,
  FolderPlus,
  X,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import { NewFolderModal } from '@/components/modals/NewFolderModal';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { uploadFiles } = useDrive();

  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      setShowUploadSheet(false);
      e.target.value = '';
    }
  };

  const navItems = [
    {
      label: 'Home',
      href: '/app',
      icon: LayoutDashboard,
      isActive: pathname === '/app',
    },
    {
      label: 'My Drive',
      href: '/app/drive',
      icon: HardDrive,
      isActive: pathname.startsWith('/app/drive'),
    },
    // Center is the upload action button
    {
      label: 'Starred',
      href: '/app/starred',
      icon: Star,
      isActive: pathname.startsWith('/app/starred'),
    },
    {
      label: 'Recent',
      href: '/app/recent',
      icon: Clock,
      isActive: pathname.startsWith('/app/recent'),
    },
  ];

  return (
    <>
      {/* Hidden File Input for Mobile Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
      />

      {/* Floating Center Action Sheet for Mobile */}
      {showUploadSheet && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-150"
          onClick={() => setShowUploadSheet(false)}
        >
          <div
            className="bg-surface-raised border-t border-border rounded-t-2xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <span className="text-sm font-semibold text-text-primary">
                Create &amp; Upload
              </span>
              <button
                type="button"
                onClick={() => setShowUploadSheet(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowUploadSheet(false);
                }}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-surface border border-border hover:bg-surface-hover active:scale-[0.98] transition-all text-center cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-brand-subtle flex items-center justify-center text-primary">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-text-primary">Upload Files</span>
                <span className="text-[10px] text-text-muted">From device gallery or storage</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowUploadSheet(false);
                  setShowNewFolderModal(true);
                }}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-surface border border-border hover:bg-surface-hover active:scale-[0.98] transition-all text-center cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-warning/15 flex items-center justify-center text-warning">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-text-primary">New Folder</span>
                <span className="text-[10px] text-text-muted">Organize Telegram files</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal if triggered from mobile bar */}
      {showNewFolderModal && (
        <NewFolderModal onClose={() => setShowNewFolderModal(false)} />
      )}

      {/* Fixed Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-surface/95 backdrop-blur-md border-t border-border px-2 py-1 flex items-center justify-around pb-[calc(env(safe-area-inset-bottom,0px)+6px)] pt-1 shadow-[0_-4px_16px_rgba(0,0,0,0.1)] transition-colors select-none"
      >
        {/* Item 1: Home */}
        <Link
          href={navItems[0].href}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-colors ${
            navItems[0].isActive
              ? 'text-primary font-semibold'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-1 leading-tight">{navItems[0].label}</span>
        </Link>

        {/* Item 2: My Drive */}
        <Link
          href={navItems[1].href}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-colors ${
            navItems[1].isActive
              ? 'text-primary font-semibold'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <HardDrive className="w-5 h-5" />
          <span className="text-[10px] mt-1 leading-tight">{navItems[1].label}</span>
        </Link>

        {/* Central Floating "+ Upload" Button */}
        <div className="relative -top-2 px-1">
          <button
            type="button"
            onClick={() => setShowUploadSheet(true)}
            aria-label="Create or upload"
            className="w-12 h-12 rounded-full bg-primary-container text-text-primary hover:bg-brand-hover shadow-lg flex items-center justify-center transition-transform active:scale-95 cursor-pointer ring-4 ring-canvas"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Item 3: Starred */}
        <Link
          href={navItems[2].href}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-colors ${
            navItems[2].isActive
              ? 'text-primary font-semibold'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Star className={`w-5 h-5 ${navItems[2].isActive ? 'fill-primary' : ''}`} />
          <span className="text-[10px] mt-1 leading-tight">{navItems[2].label}</span>
        </Link>

        {/* Item 4: Recent */}
        <Link
          href={navItems[3].href}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-colors ${
            navItems[3].isActive
              ? 'text-primary font-semibold'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] mt-1 leading-tight">{navItems[3].label}</span>
        </Link>
      </nav>
    </>
  );
}
