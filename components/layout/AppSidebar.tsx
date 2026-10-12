'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Cloud,
  HardDrive,
  Clock,
  Star,
  Trash2,
  Settings,
  Plus,
  FolderPlus,
  Upload,
  Send,
  ChevronDown,
  LayoutDashboard,
  X,
  LogOut,
  User,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import { useAuth } from '@/lib/firebase/auth-context';
import { formatBytes } from '@/lib/drive/storage-calc';
import { NewFolderModal } from '@/components/modals/NewFolderModal';
import { ConnectTelegramModal } from '@/components/modals/ConnectTelegramModal';
import { PWAInstallButton } from '@/components/pwa/PWAInstallButton';

interface AppSidebarProps {
  onNavigate?: () => void;
  onClose?: () => void;
}

export function AppSidebar({ onNavigate, onClose }: AppSidebarProps = {}) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const {
    storageSummary,
    telegramConnected,
    telegramUsername,
    uploadFiles,
  } = useDrive();

  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [newDropdownOpen, setNewDropdownOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { label: 'Home', href: '/app', icon: LayoutDashboard },
    { label: 'My Drive', href: '/app/drive', icon: HardDrive },
    { label: 'Recent', href: '/app/recent', icon: Clock },
    { label: 'Starred', href: '/app/starred', icon: Star },
    { label: 'Trash', href: '/app/trash', icon: Trash2 },
    { label: 'Settings', href: '/app/settings', icon: Settings },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      setNewDropdownOpen(false);
      onNavigate?.();
      e.target.value = '';
    }
  };

  return (
    <>
      <aside className="w-[256px] shrink-0 border-r border-border bg-sidebar flex flex-col justify-between h-full max-h-[100dvh] overflow-y-auto select-none transition-colors pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-[68px] px-4 flex items-center justify-between border-b border-border/40 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-primary border border-border/60 shrink-0">
                <Cloud className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-text-primary tracking-tight text-[15px] leading-tight truncate">
                  One Cloud
                </span>
                <span className="text-[11px] text-text-muted leading-tight truncate font-medium">
                  Telegram Drive
                </span>
              </div>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* "+ New" Action Button */}
          <div className="p-4 relative shrink-0">
            <button
              onClick={() => setNewDropdownOpen(!newDropdownOpen)}
              className="w-full h-10 px-3.5 bg-primary-container hover:bg-brand-hover text-text-primary font-medium text-sm rounded-[10px] transition-colors flex items-center justify-between shadow-xs cursor-pointer active:scale-[0.99]"
              type="button"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>New</span>
              </div>
              <ChevronDown className="w-4 h-4 opacity-80" />
            </button>

            {newDropdownOpen && (
              <div
                className="absolute left-4 right-4 top-16 z-50 bg-surface-raised border border-border rounded-xl shadow-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setNewDropdownOpen(false)}
              >
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setNewDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-text-primary hover:bg-surface-hover rounded-lg transition-colors text-left cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-primary" />
                  <span>Upload Files</span>
                </button>
                <button
                  onClick={() => {
                    setShowNewFolderModal(true);
                    setNewDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-text-primary hover:bg-surface-hover rounded-lg transition-colors text-left cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4 text-warning" />
                  <span>New Folder</span>
                </button>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              className="hidden"
            />
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/app'
                  ? pathname === '/app'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onNavigate?.()}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                    isActive
                      ? 'bg-brand-subtle text-primary font-medium'
                      : 'text-text-muted hover:text-text-primary hover:bg-surface'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Storage Box, Telegram Status & Profile Card */}
        <div className="p-3.5 flex flex-col gap-2.5 border-t border-border/40 mt-auto shrink-0">
          {/* PWA Install Button */}
          <PWAInstallButton variant="sidebar" />

          {/* Storage card */}
          <div className="p-3 bg-surface border border-border rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-primary">
                {formatBytes(storageSummary.trackedBytes)} used
              </span>
              <span className="text-xs text-text-muted font-medium">
                {Math.min(100, Math.round((storageSummary.trackedBytes / (100 * 1024 * 1024 * 1024)) * 100))}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface-raised rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-container rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      storageSummary.trackedBytes > 0 ? 3 : 0,
                      Math.round((storageSummary.trackedBytes / (100 * 1024 * 1024 * 1024)) * 100)
                    )
                  )}%`,
                }}
              />
            </div>
            <span className="text-[11px] text-text-muted">
              Saved in Telegram
            </span>
          </div>

          {/* Telegram Connection pill */}
          <button
            onClick={() => setShowConnectModal(true)}
            className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-surface/60 hover:bg-surface border border-border/50 text-text-muted text-xs transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Send className="w-3.5 h-3.5 text-[#36AEEA] shrink-0" />
              <span className="truncate text-text-secondary text-[12px]">
                {telegramConnected ? `@${telegramUsername}` : 'Connect Telegram'}
              </span>
            </div>
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                telegramConnected ? 'bg-tertiary animate-pulse' : 'bg-warning'
              }`}
            />
          </button>

          {/* Profile & Settings Card (User-approved) */}
          <div className="p-2.5 bg-surface-raised border border-border rounded-xl flex flex-col gap-2 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-brand-subtle text-primary border border-primary-container/30 flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-text-primary truncate">
                    {user?.displayName || (user?.email ? user.email.split('@')[0] : 'One Cloud User')}
                  </span>
                  <span className="text-[10px] text-text-muted truncate">
                    {user?.email || 'Logged In'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-border/40">
              <Link
                href="/app/settings"
                onClick={() => onNavigate?.()}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-colors ${
                  pathname === '/app/settings'
                    ? 'bg-primary-container text-text-primary'
                    : 'bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border/50'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </Link>

              <button
                type="button"
                onClick={async () => {
                  onNavigate?.();
                  await signOut();
                }}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-medium bg-surface hover:bg-danger/10 hover:text-danger text-text-muted border border-border/50 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {showNewFolderModal && (
        <NewFolderModal onClose={() => setShowNewFolderModal(false)} />
      )}
      {showConnectModal && (
        <ConnectTelegramModal onClose={() => setShowConnectModal(false)} />
      )}
    </>
  );
}
