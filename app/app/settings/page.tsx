'use client';

import React, { useState } from 'react';
import {
  Settings,
  Send,
  Download,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import { useAuth } from '@/lib/firebase/auth-context';
import { ConnectTelegramModal } from '@/components/modals/ConnectTelegramModal';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const {
    telegramConnected,
    telegramUsername,
    disconnectTelegram,
    files,
    folders,
    storageSummary,
  } = useDrive();

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Export metadata JSON
  const handleExportMetadata = () => {
    const exportData = {
      user: {
        uid: user?.uid,
        email: user?.email,
      },
      exportedAt: new Date().toISOString(),
      summary: storageSummary,
      folders,
      files,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onecloud_metadata_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice('Drive metadata exported successfully.');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your Telegram connection, storage preferences, and account security.
        </p>
      </div>

      {/* Telegram Connection Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Telegram Cloud Account</h2>
              <p className="text-xs text-slate-500">
                Connected storage chat: <strong>Saved Messages</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {telegramConnected ? (
              <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>@{telegramUsername}</span>
              </span>
            ) : (
              <span className="px-3 py-1 text-xs font-semibold text-amber-800 bg-amber-50 rounded-lg border border-amber-200">
                Disconnected
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          One Cloud stores your raw file document messages inside your personal Telegram Saved
          Messages. Session tokens are encrypted on the server with AES-256-GCM and never shared
          with third parties.
        </p>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setShowConnectModal(true)}
            className="px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            {telegramConnected ? 'Change Credentials / Reconnect' : 'Connect Telegram'}
          </button>

          {telegramConnected && (
            <button
              onClick={disconnectTelegram}
              className="px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
            >
              Disconnect Session
            </button>
          )}
        </div>
      </div>

      {/* Metadata Export Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-200">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Export Drive Metadata</h2>
            <p className="text-xs text-slate-500">
              Download a complete JSON export of all indexed file records and folder hierarchy.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          This export includes all file names, sizes, upload dates, folder mappings, and Telegram
          message IDs. The actual file bytes remain safely in your Telegram account.
        </p>

        {exportNotice && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{exportNotice}</span>
          </div>
        )}

        <button
          onClick={handleExportMetadata}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-2xs transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export JSON Metadata</span>
        </button>
      </div>

      {/* Account Deletion & Disclaimer */}
      <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Account Disconnect & Data Purge</h2>
            <p className="text-xs text-slate-500">
              Information on what happens if you delete your website account.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-rose-50/50 border border-rose-200 p-4 text-xs text-rose-900 leading-relaxed space-y-2">
          <p className="font-semibold text-rose-950">Important Storage Semantics Notice:</p>
          <p>
            Deleting your website account or clearing Drive metadata removes the organizational
            index (folders, stars, tags) from this web app. <strong>It does not automatically delete
            your original files from Telegram.</strong> Your uploaded files will remain securely
            accessible in your Telegram Saved Messages chat.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to sign out and clear your active session?')) {
                signOut();
              }
            }}
            className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
          >
            Sign Out & Clear Active Session
          </button>
        </div>
      </div>

      {showConnectModal && <ConnectTelegramModal onClose={() => setShowConnectModal(false)} />}
    </div>
  );
}
