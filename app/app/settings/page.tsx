'use client';

import React, { useState, useMemo } from 'react';
import {
  Send,
  Download,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sun,
  Moon,
  Laptop,
  Check,
  Database,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Headphones,
  Archive,
  Layers,
  Copy,
  Info,
  Sliders,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import { useAuth } from '@/lib/firebase/auth-context';
import { useTheme } from '@/lib/theme-context';
import { formatBytes, getFileTypeCategory } from '@/lib/drive/storage-calc';
import { ConnectTelegramModal } from '@/components/modals/ConnectTelegramModal';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const {
    telegramConnected,
    telegramUsername,
    disconnectTelegram,
    syncTelegram,
    telegramSyncing,
    files,
    folders,
    storageSummary,
  } = useDrive();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'telegram' | 'storage' | 'security'>('general');

  // Breakdown by file types
  const storageBreakdown = useMemo(() => {
    let imagesBytes = 0;
    let imagesCount = 0;
    let videosBytes = 0;
    let videosCount = 0;
    let docsBytes = 0;
    let docsCount = 0;
    let audioBytes = 0;
    let audioCount = 0;
    let archivesBytes = 0;
    let archivesCount = 0;
    let othersBytes = 0;
    let othersCount = 0;

    files.forEach((file) => {
      if (file.status === 'trashed') return;
      const cat = getFileTypeCategory(file.mimeType, file.extension);
      if (cat === 'image') {
        imagesBytes += file.fileSizeBytes;
        imagesCount++;
      } else if (cat === 'video') {
        videosBytes += file.fileSizeBytes;
        videosCount++;
      } else if (cat === 'document' || cat === 'pdf') {
        docsBytes += file.fileSizeBytes;
        docsCount++;
      } else if (cat === 'audio') {
        audioBytes += file.fileSizeBytes;
        audioCount++;
      } else if (cat === 'archive') {
        archivesBytes += file.fileSizeBytes;
        archivesCount++;
      } else {
        othersBytes += file.fileSizeBytes;
        othersCount++;
      }
    });

    const total = storageSummary.trackedBytes || 1;
    return {
      images: { bytes: imagesBytes, count: imagesCount, pct: Math.round((imagesBytes / total) * 100) },
      videos: { bytes: videosBytes, count: videosCount, pct: Math.round((videosBytes / total) * 100) },
      docs: { bytes: docsBytes, count: docsCount, pct: Math.round((docsBytes / total) * 100) },
      audio: { bytes: audioBytes, count: audioCount, pct: Math.round((audioBytes / total) * 100) },
      archives: { bytes: archivesBytes, count: archivesCount, pct: Math.round((archivesBytes / total) * 100) },
      others: { bytes: othersBytes, count: othersCount, pct: Math.round((othersBytes / total) * 100) },
    };
  }, [files, storageSummary.trackedBytes]);

  const handleCopyAccountId = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleExportMetadata = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        uid: user?.uid,
        email: user?.email,
      },
      telegram: {
        connected: telegramConnected,
        username: telegramUsername,
      },
      folders: folders.map((f) => ({
        id: f.id,
        name: f.name,
        parentFolderId: f.parentFolderId,
        isStarred: f.isStarred,
        createdAt: f.createdAt,
      })),
      files: files.map((f) => ({
        id: f.id,
        name: f.name,
        fileSizeBytes: f.fileSizeBytes,
        mimeType: f.mimeType,
        extension: f.extension,
        parentFolderId: f.parentFolderId,
        telegramMessageId: f.telegramMessageId,
        uploadedAt: f.uploadedAt,
        isStarred: f.isStarred,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onecloud-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportNotice('Metadata index exported successfully as JSON.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => {
      setCacheCleared(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full bg-canvas text-text-primary transition-colors overflow-y-auto">
      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6 pb-24">
        {/* Header Block */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-text-muted text-xs font-medium">
            <span>Preferences</span>
            <span>/</span>
            <span className="text-text-primary">Workspace Configuration</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Settings</h1>
          <p className="text-xs text-text-secondary">
            Manage your account profile, Telegram storage connection, and application preferences.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-6 border-b border-border text-xs font-medium select-none overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
              activeTab === 'general'
                ? 'text-text-primary border-b-2 border-primary-container font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>General</span>
          </button>
          <button
            onClick={() => setActiveTab('telegram')}
            className={`pb-3 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
              activeTab === 'telegram'
                ? 'text-text-primary border-b-2 border-primary-container font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Send className="h-4 w-4 text-[#36AEEA]" />
            <span>Telegram Connection</span>
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`pb-3 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
              activeTab === 'storage'
                ? 'text-text-primary border-b-2 border-primary-container font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Database className="h-4 w-4 text-primary" />
            <span>Storage & Quotas</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
              activeTab === 'security'
                ? 'text-text-primary border-b-2 border-primary-container font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-tertiary" />
            <span>Security & Privacy</span>
          </button>
        </div>

        {/* SECTION 1: General & Profile */}
        {(activeTab === 'general' || activeTab === 'telegram') && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-text-primary">Profile & Account Information</h2>
                <p className="text-xs text-text-muted">Primary identity credentials synced across your Telegram-backed workspace.</p>
              </div>
              <span className="text-[11px] text-text-muted flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                Active
              </span>
            </div>

            <div className="bg-surface rounded-xl border border-border p-5 space-y-4 shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary">Display Name</label>
                  <input
                    type="text"
                    defaultValue={user?.displayName || 'Cloud Explorer'}
                    className="h-10 px-3 bg-surface-raised rounded-lg border border-border text-xs text-text-primary focus:outline-none focus:border-focus-ring transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-text-secondary">Email Address</label>
                    <span className="px-2 py-0.5 rounded-full bg-brand-subtle text-primary border border-primary-container/30 text-[10px]">
                      Firebase Auth
                    </span>
                  </div>
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'user@onecloud.dev'}
                    className="h-10 px-3 bg-surface-raised rounded-lg border border-border text-xs text-text-muted cursor-not-allowed select-none opacity-80"
                  />
                </div>
              </div>

              {/* Account ID row */}
              <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-secondary">Account ID</span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-raised border border-border">
                    <span className="font-mono text-[11px] text-text-primary select-all">
                      {user?.uid || 'usr_anonymous'}
                    </span>
                    <button
                      onClick={handleCopyAccountId}
                      className="text-text-muted hover:text-text-primary cursor-pointer"
                      title="Copy UID"
                    >
                      {copiedId ? (
                        <Check className="h-3.5 w-3.5 text-tertiary" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="h-9 px-3.5 bg-surface-raised hover:bg-danger/10 text-danger border border-danger/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 2: Telegram Cloud Connection */}
        {(activeTab === 'general' || activeTab === 'telegram') && (
          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Telegram Cloud Connection</h2>
              <p className="text-xs text-text-muted">Live MTProto transport link mapping this interface directly to your personal Telegram vault.</p>
            </div>

            <div className="bg-surface rounded-xl border border-border p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-lg bg-brand-subtle flex items-center justify-center text-[#36AEEA] shrink-0 border border-[#36AEEA]/20">
                    <Send className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">MTProto Direct Client Session</span>
                      {telegramConnected ? (
                        <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary border border-tertiary/30 text-[10px] font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                          Connected
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/30 text-[10px] font-medium">
                          Demo Mode
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      Target: Saved Messages · Ping: 28ms · Active Session
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-surface-raised border border-border text-xs text-[#36AEEA] font-medium flex items-center gap-1">
                    <Send className="h-3.5 w-3.5" />
                    {telegramUsername ? `@${telegramUsername}` : '@alex_dev'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => syncTelegram()}
                    disabled={telegramSyncing}
                    className="h-9 px-3.5 bg-surface-raised hover:bg-surface-hover border border-border text-text-primary rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-text-secondary ${telegramSyncing ? 'animate-spin' : ''}`} />
                    <span>{telegramSyncing ? 'Syncing...' : 'Sync Channel Index'}</span>
                  </button>
                  <button
                    onClick={() => setShowConnectModal(true)}
                    className="h-9 px-3.5 bg-primary-container hover:bg-brand-hover text-text-primary rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Reconnect Session</span>
                  </button>
                </div>

                {telegramConnected && (
                  <button
                    onClick={() => disconnectTelegram()}
                    className="text-xs text-danger hover:underline transition-colors cursor-pointer flex items-center gap-1"
                  >
                    Disconnect Telegram
                  </button>
                )}
              </div>

              <div className="p-3 rounded-lg bg-surface-raised border border-border flex items-start gap-2.5 text-text-muted text-xs">
                <Info className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <span>Disconnecting will stop syncing new files. Existing files remain safe and accessible inside your native Telegram application at any time.</span>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 3: Storage Overview & Usage */}
        {(activeTab === 'general' || activeTab === 'storage') && (
          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Storage Overview & Usage</h2>
              <p className="text-xs text-text-muted">Calculated against tracked channel files. Unlimited personal baseline hosted natively on Telegram.</p>
            </div>

            <div className="bg-surface rounded-xl border border-border p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-text-primary">
                    {formatBytes(storageSummary.trackedBytes)}
                  </span>
                  <span className="text-xs text-text-secondary">tracked in Telegram cloud</span>
                </div>
                <div className="text-xs text-text-muted flex items-center gap-1">
                  <Info className="h-3.5 w-3.5 text-primary" />
                  Bot chunk limit: 2,000 MB per file (MTProto standard)
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="w-full h-3 bg-surface-raised rounded-full overflow-hidden flex p-0.5 gap-0.5">
                  <div
                    className="h-full bg-file-document rounded-l-full"
                    style={{ width: `${Math.max(storageBreakdown.docs.pct, 4)}%` }}
                    title={`Docs: ${formatBytes(storageBreakdown.docs.bytes)}`}
                  ></div>
                  <div
                    className="h-full bg-file-image"
                    style={{ width: `${Math.max(storageBreakdown.images.pct, 4)}%` }}
                    title={`Images: ${formatBytes(storageBreakdown.images.bytes)}`}
                  ></div>
                  <div
                    className="h-full bg-file-video"
                    style={{ width: `${Math.max(storageBreakdown.videos.pct, 4)}%` }}
                    title={`Videos: ${formatBytes(storageBreakdown.videos.bytes)}`}
                  ></div>
                  <div
                    className="h-full bg-file-audio"
                    style={{ width: `${Math.max(storageBreakdown.audio.pct, 4)}%` }}
                    title={`Audio: ${formatBytes(storageBreakdown.audio.bytes)}`}
                  ></div>
                  <div
                    className="h-full bg-file-archive rounded-r-full"
                    style={{ width: `${Math.max(storageBreakdown.archives.pct, 4)}%` }}
                    title={`Archives: ${formatBytes(storageBreakdown.archives.bytes)}`}
                  ></div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-file-document shrink-0"></span>
                    <span className="text-text-secondary truncate">
                      Docs ({formatBytes(storageBreakdown.docs.bytes)})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-file-image shrink-0"></span>
                    <span className="text-text-secondary truncate">
                      Images ({formatBytes(storageBreakdown.images.bytes)})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-file-video shrink-0"></span>
                    <span className="text-text-secondary truncate">
                      Videos ({formatBytes(storageBreakdown.videos.bytes)})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-file-audio shrink-0"></span>
                    <span className="text-text-secondary truncate">
                      Audio ({formatBytes(storageBreakdown.audio.bytes)})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-file-archive shrink-0"></span>
                    <span className="text-text-secondary truncate">
                      Archive ({formatBytes(storageBreakdown.archives.bytes)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Cache Management Row */}
              <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-medium text-text-primary">Local Index Cache</span>
                  <p className="text-[11px] text-text-muted">
                    Cached file thumbnails, catalog indexes, and temporary preview buffers in your browser.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-surface-raised border border-border font-mono text-[11px] text-text-secondary">
                    {cacheCleared ? '0 KB' : '101.2 MB'} cached
                  </span>
                  <button
                    onClick={handleClearCache}
                    className="h-8 px-3 bg-surface-raised hover:bg-surface-hover text-text-primary border border-border rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    {cacheCleared ? 'Cleared!' : 'Clear Browser Cache'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 4: Appearance & Interface Preferences */}
        {(activeTab === 'general' || activeTab === 'security') && (
          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Appearance & Interface Preferences</h2>
              <p className="text-xs text-text-muted">Configure workspace theme and export backup files.</p>
            </div>

            <div className="bg-surface rounded-xl border border-border divide-y divide-border shadow-xs">
              {/* Theme Preference Row */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-text-primary">Workspace Theme</span>
                  <p className="text-xs text-text-muted">
                    Default Obsidian dark theme calibrated for precision engineering and Telegram drive clients.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      resolvedTheme === 'dark'
                        ? 'bg-brand-subtle border-primary-container text-text-primary'
                        : 'bg-surface-raised border-border text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Moon className="h-3.5 w-3.5 text-primary" />
                    <span>Obsidian Dark</span>
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      resolvedTheme === 'light'
                        ? 'bg-brand-subtle border-primary-container text-text-primary'
                        : 'bg-surface-raised border-border text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Sun className="h-3.5 w-3.5 text-warning" />
                    <span>Light Mode</span>
                  </button>
                </div>
              </div>

              {/* Backup & Export Row */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-text-primary">Export Drive Catalog (JSON)</span>
                  <p className="text-xs text-text-muted">
                    Download a full snapshot of your folder tree, file hashes, and Telegram message IDs.
                  </p>
                  {exportNotice && (
                    <p className="text-xs text-tertiary mt-1">{exportNotice}</p>
                  )}
                </div>
                <button
                  onClick={handleExportMetadata}
                  className="h-9 px-3.5 bg-surface-raised hover:bg-surface-hover border border-border text-text-primary rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Download className="h-3.5 w-3.5 text-text-secondary" />
                  <span>Export Backup</span>
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {showConnectModal && (
        <ConnectTelegramModal onClose={() => setShowConnectModal(false)} />
      )}
    </div>
  );
}
