'use client';

import React, { useState } from 'react';
import { Search, RefreshCw, User, LogOut, LogIn, Menu, ShieldCheck } from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import { useAuth } from '@/lib/firebase/auth-context';
import Link from 'next/link';

interface AppHeaderProps {
  onToggleMobileMenu?: () => void;
}

export function AppHeader({ onToggleMobileMenu }: AppHeaderProps) {
  const { searchQuery, setSearchQuery, telegramSyncing, syncTelegram, telegramConnected } =
    useDrive();
  const { user, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="h-16 shrink-0 border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-6 z-20">
      <div className="flex items-center gap-3 flex-1 max-w-xl my-auto">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Toggle Navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Global Search Bar */}
        <div className="relative w-full flex items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files by name or extension..."
            className="w-full h-10 pl-9 pr-14 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 rounded-xl border border-transparent focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-slate-600 px-1 py-0.5 rounded"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-4">
        {/* Sync with Telegram Button */}
        {telegramConnected && (
          <button
            onClick={syncTelegram}
            disabled={telegramSyncing}
            title="Reconcile metadata with Telegram Saved Messages"
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-slate-500 ${
                telegramSyncing ? 'animate-spin text-sky-600' : ''
              }`}
            />
            <span className="hidden sm:inline">
              {telegramSyncing ? 'Syncing...' : 'Sync'}
            </span>
          </button>
        )}

        {/* Account Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-sky-100 border border-sky-200 text-sky-700 flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
              {user?.displayName ? user.displayName.charAt(0) : user?.email ? user.email.charAt(0) : 'U'}
            </div>
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 top-11 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50"
              onMouseLeave={() => setProfileOpen(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {user?.displayName || (user ? 'Authenticated User' : 'Guest')}
                  </p>
                  {user && (
                    <span title="Firebase Verified" className="inline-flex items-center">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {user?.email || (user?.isAnonymous ? 'Guest Firebase Session' : 'Not signed in')}
                </p>
              </div>

              <div className="py-1">
                <Link
                  href="/app/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span>Account & Settings</span>
                </Link>

                {!user ? (
                  <Link
                    href="/login"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Sign In to Firebase</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      signOut();
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left"
                  >
                    <LogOut className="h-3.5 w-3.5 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
