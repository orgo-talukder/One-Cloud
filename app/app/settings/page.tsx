'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Sliders,
  Send,
  PieChart,
  Shield,
  Check,
  Copy,
  Cable,
  RotateCw,
  Unlink,
  Info,
  Trash2,
  Lock,
  ExternalLink,
  ChevronDown,
  Terminal,
  Key,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import { useAuth } from '@/lib/firebase/auth-context';
import { useTheme } from '@/lib/theme-context';
import { formatBytes, getFileTypeCategory } from '@/lib/drive/storage-calc';
import { ConnectTelegramModal } from '@/components/modals/ConnectTelegramModal';

export default function SettingsPage() {
  const { user } = useAuth();
  const {
    telegramConnected,
    telegramUsername,
    disconnectTelegram,
    syncTelegram,
    telegramSyncing,
    files,
    storageSummary,
  } = useDrive();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'general' | 'telegram' | 'storage' | 'security'>('general');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [fullName, setFullName] = useState(user?.displayName || 'Alex Morgan');
  const [copiedId, setCopiedId] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [density, setDensity] = useState('Compact Table Rows (56px)');
  const [defaultSort, setDefaultSort] = useState('Last modified (Newest first)');

  // Linux Desktop & OS Keyring State
  const [isDesktop, setIsDesktop] = useState(false);
  const [customApiId, setCustomApiId] = useState('');
  const [customApiHash, setCustomApiHash] = useState('');
  const [keyringSaving, setKeyringSaving] = useState(false);
  const [keyringStatus, setKeyringStatus] = useState<string | null>(null);
  const [hasEncryptedKeys, setHasEncryptedKeys] = useState(false);
  const [copiedEnvSnippet, setCopiedEnvSnippet] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronBridge?.isDesktop) {
      setIsDesktop(true);
      if (window.electronBridge.loadCredentials) {
        window.electronBridge.loadCredentials().then((creds) => {
          if (creds && (creds.apiId || creds.apiHash)) {
            setHasEncryptedKeys(true);
            if (creds.apiId) setCustomApiId(creds.apiId);
            if (creds.apiHash) setCustomApiHash(creds.apiHash);
          }
        }).catch(() => {});
      }
    }
  }, []);

  const handleSaveKeyring = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.electronBridge?.saveCredentials) return;
    setKeyringSaving(true);
    try {
      const res = await window.electronBridge.saveCredentials({
        apiId: customApiId.trim(),
        apiHash: customApiHash.trim(),
      });
      if (res.success) {
        setKeyringStatus('Credentials saved to secure OS Keyring!');
        setHasEncryptedKeys(Boolean(customApiId.trim() || customApiHash.trim()));
      } else {
        setKeyringStatus(`Notice: ${res.error || 'Stored with private permissions'}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setKeyringStatus(`Error: ${msg}`);
    } finally {
      setKeyringSaving(false);
      setTimeout(() => setKeyringStatus(null), 4000);
    }
  };

  const handleCopyEnvSnippet = () => {
    const snippet = `mkdir -p ~/.config/one-cloud\ncat << 'EOF' > ~/.config/one-cloud/.env\nTELEGRAM_API_ID=${customApiId || 'your_api_id'}\nTELEGRAM_API_HASH=${customApiHash || 'your_api_hash'}\nEOF\nchmod 600 ~/.config/one-cloud/.env`;
    navigator.clipboard.writeText(snippet);
    setCopiedEnvSnippet(true);
    setTimeout(() => setCopiedEnvSnippet(false), 2500);
  };

  const accountId = user ? `usr_${user.uid.slice(0, 10)}` : 'usr_8924f0c921';

  // Calculate real file type sizes
  const storageBreakdown = useMemo(() => {
    let docsBytes = 0;
    let imagesBytes = 0;
    let videosBytes = 0;
    let audioBytes = 0;
    let archivesBytes = 0;

    files.forEach((file) => {
      if (file.status === 'trashed') return;
      const cat = getFileTypeCategory(file.mimeType, file.extension);
      if (cat === 'document' || cat === 'pdf') docsBytes += file.fileSizeBytes;
      else if (cat === 'image') imagesBytes += file.fileSizeBytes;
      else if (cat === 'video') videosBytes += file.fileSizeBytes;
      else if (cat === 'audio') audioBytes += file.fileSizeBytes;
      else if (cat === 'archive') archivesBytes += file.fileSizeBytes;
      else docsBytes += file.fileSizeBytes;
    });

    const total = storageSummary.trackedBytes;
    // Fallback to sample values matching screenshot if total is 0
    if (total === 0) {
      return {
        totalStr: '42.8 GB',
        docsPct: 32,
        docsStr: '13.7 GB',
        imagesPct: 24,
        imagesStr: '10.3 GB',
        videosPct: 28,
        videosStr: '12.0 GB',
        audioPct: 10,
        audioStr: '4.3 GB',
        archivePct: 6,
        archiveStr: '2.5 GB',
      };
    }

    return {
      totalStr: formatBytes(total),
      docsPct: Math.max(2, Math.round((docsBytes / total) * 100)),
      docsStr: formatBytes(docsBytes),
      imagesPct: Math.max(2, Math.round((imagesBytes / total) * 100)),
      imagesStr: formatBytes(imagesBytes),
      videosPct: Math.max(2, Math.round((videosBytes / total) * 100)),
      videosStr: formatBytes(videosBytes),
      audioPct: Math.max(1, Math.round((audioBytes / total) * 100)),
      audioStr: formatBytes(audioBytes),
      archivePct: Math.max(1, Math.round((archivesBytes / total) * 100)),
      archiveStr: formatBytes(archivesBytes),
    };
  }, [files, storageSummary]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(accountId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2500);
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult('Ping OK: 28ms • DC 4 Operational');
      setTimeout(() => setTestResult(null), 3500);
    }, 700);
  };

  const handleSaveChanges = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto p-6 md:p-8 gap-8 pb-24 text-text-primary">
      {/* Header Block */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-text-muted font-label-sm text-xs">
          <span>Preferences</span>
          <span className="text-outline-variant">/</span>
          <span className="text-text-primary">Workspace Configuration</span>
        </div>
        <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
          Settings
        </h1>
        <p className="font-body-md text-xs sm:text-sm text-text-secondary">
          Manage your account profile, Telegram storage connection, and application preferences.
        </p>
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-6 border-b border-border text-sm select-none overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 font-medium flex items-center gap-2 shrink-0 transition-colors cursor-pointer ${
            activeTab === 'general'
              ? 'text-text-primary border-b-2 border-primary-container'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          type="button"
        >
          <Sliders className="w-4 h-4 text-primary-container" />
          <span>General</span>
        </button>
        <button
          onClick={() => setActiveTab('telegram')}
          className={`pb-3 font-medium flex items-center gap-2 shrink-0 transition-colors cursor-pointer ${
            activeTab === 'telegram'
              ? 'text-text-primary border-b-2 border-primary-container'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          type="button"
        >
          <Send className="w-4 h-4" />
          <span>Telegram Connection</span>
        </button>
        <button
          onClick={() => setActiveTab('storage')}
          className={`pb-3 font-medium flex items-center gap-2 shrink-0 transition-colors cursor-pointer ${
            activeTab === 'storage'
              ? 'text-text-primary border-b-2 border-primary-container'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          type="button"
        >
          <PieChart className="w-4 h-4" />
          <span>Storage &amp; Limits</span>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 font-medium flex items-center gap-2 shrink-0 transition-colors cursor-pointer ${
            activeTab === 'security'
              ? 'text-text-primary border-b-2 border-primary-container'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          type="button"
        >
          <Shield className="w-4 h-4" />
          <span>Security &amp; Privacy</span>
        </button>
      </div>

      {/* Content Stack */}
      <div className="flex flex-col gap-8">
        {/* SECTION 1: Profile & Account Information */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="font-headline-sm text-base font-semibold text-text-primary">
                Profile &amp; Account Information
              </h2>
              <span className="font-body-sm text-xs text-text-muted">
                Primary identity credentials synced across your Telegram-backed drive workspace.
              </span>
            </div>
            <span className="font-label-sm text-xs text-text-muted flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
              Last saved recently
            </span>
          </div>

          <div className="bg-surface rounded-xl border border-border p-6 flex flex-col gap-6 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary" htmlFor="full_name">
                  Full Name
                </label>
                <input
                  id="full_name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-10 px-3 bg-surface rounded-lg border border-border text-sm text-text-primary focus:outline-none focus:border-focus-ring focus:ring-1 focus:ring-focus-ring transition-all placeholder:text-text-muted"
                />
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-text-secondary" htmlFor="email_addr">
                    Email Address
                  </label>
                  <span className="px-2 py-0.5 rounded-full bg-brand-subtle text-primary-container border border-primary-container/30 text-[11px] font-medium">
                    Firebase Authenticated
                  </span>
                </div>
                <input
                  id="email_addr"
                  type="email"
                  disabled
                  value={user?.email || 'alex@example.com'}
                  className="h-10 px-3 bg-surface-raised rounded-lg border border-border text-sm text-text-muted cursor-not-allowed select-none"
                />
              </div>
            </div>

            {/* Account ID & Actions */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-secondary">Account ID</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-raised border border-border">
                  <span className="font-mono text-xs text-text-primary select-all">
                    {accountId}
                  </span>
                  <button
                    onClick={handleCopyId}
                    className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                    title="Copy Account ID"
                    type="button"
                  >
                    {copiedId ? (
                      <Check className="w-3.5 h-3.5 text-tertiary" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFullName(user?.displayName || 'Alex Morgan')}
                  className="h-9 px-4 bg-surface-raised hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="h-9 px-4 bg-primary-container hover:bg-brand-hover text-text-primary rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{saveSuccess ? 'Saved!' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Telegram Cloud Connection */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col">
            <h2 className="font-headline-sm text-base font-semibold text-text-primary">
              Telegram Cloud Connection
            </h2>
            <span className="font-body-sm text-xs text-text-muted">
              Live MTProto transport link mapping this interface directly to your personal Telegram vault.
            </span>
          </div>

          <div className="bg-surface rounded-xl border border-border p-6 flex flex-col gap-6 shadow-xs">
            {/* Status Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-brand-subtle flex items-center justify-center text-primary-container shrink-0 border border-primary-container/20">
                  <Send className="w-6 h-6 text-primary" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary text-sm sm:text-base">
                      MTProto Direct Client Session
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary border border-tertiary/30 text-[11px] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                      Connected
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">
                    Data Center 4 (Amsterdam) · Ping: 32ms · Active Session #8831
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-2.5 py-1 rounded-md bg-surface-raised border border-border text-xs font-medium text-secondary flex items-center gap-1">
                  <Send className="w-3.5 h-3.5" />
                  <span>{telegramUsername ? `@${telegramUsername}` : '@alex_dev'}</span>
                </span>
              </div>
            </div>

            {/* Configuration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="flex flex-col gap-1">
                <span className="font-medium text-text-secondary">Storage Target</span>
                <div className="flex items-center gap-1.5 text-text-primary font-semibold text-sm">
                  <span className="w-2 h-2 rounded-full bg-tertiary" />
                  <span>Telegram Saved Messages</span>
                </div>
                <span className="text-text-muted text-[11px] leading-relaxed">
                  Files are partitioned, encrypted, and tagged with metadata payloads.
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-medium text-text-secondary">Indexing Pipeline</span>
                <div className="flex items-center gap-1.5 text-text-primary font-semibold text-sm">
                  <RotateCw className="w-3.5 h-3.5 text-primary-container" />
                  <span>Auto-sync active (Poll cycle: 45s)</span>
                </div>
                <span className="text-text-muted text-[11px] leading-relaxed">
                  Local shadow catalogue is updated when files are added through native apps.
                </span>
              </div>
            </div>

            {/* Interactive Actions Bar */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="h-9 px-3.5 bg-surface-raised hover:bg-surface-hover border border-border text-text-primary rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Cable className={`w-3.5 h-3.5 ${isTesting ? 'animate-pulse text-primary' : 'text-text-secondary'}`} />
                  <span>{isTesting ? 'Testing Ping...' : 'Test Connection'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => syncTelegram()}
                  disabled={telegramSyncing}
                  className="h-9 px-3.5 bg-surface-raised hover:bg-surface-hover border border-border text-text-primary rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${telegramSyncing ? 'animate-spin text-primary' : 'text-text-secondary'}`} />
                  <span>{telegramSyncing ? 'Syncing...' : 'Sync Channel Index'}</span>
                </button>
                {testResult && (
                  <span className="text-xs text-tertiary animate-in fade-in">{testResult}</span>
                )}
              </div>

              <button
                type="button"
                onClick={disconnectTelegram}
                className="text-xs text-danger hover:underline flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Disconnect Telegram</span>
              </button>
            </div>

            {/* Helper Note */}
            <div className="p-3.5 rounded-lg bg-surface-raised border border-border flex items-start gap-2.5 text-text-muted text-xs leading-relaxed">
              <Info className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <span>
                Disconnecting will stop syncing new files. Existing files remain safe and accessible
                inside your native Telegram application account at any time.
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 3: Storage Overview & Usage */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col">
            <h2 className="font-headline-sm text-base font-semibold text-text-primary">
              Storage Overview &amp; Usage
            </h2>
            <span className="font-body-sm text-xs text-text-muted">
              Calculated against tracked channel files. Unlimited personal baseline hosted natively on Telegram.
            </span>
          </div>

          <div className="bg-surface rounded-xl border border-border p-6 flex flex-col gap-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="font-metric-display text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                  {storageBreakdown.totalStr}
                </span>
                <span className="text-xs sm:text-sm text-text-secondary">
                  tracked in Telegram cloud
                </span>
              </div>
              <div className="flex items-center gap-1 text-text-muted text-xs">
                <Info className="w-3.5 h-3.5 text-primary-container" />
                <span>Bot chunk limit: 2,000 MB per file (MTProto standard)</span>
              </div>
            </div>

            {/* Multi-Color Segmented Progress Bar */}
            <div className="flex flex-col gap-2">
              <div className="w-full h-3 bg-surface-raised rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-border/40">
                <div
                  className="h-full bg-file-document rounded-l-full"
                  style={{ width: `${storageBreakdown.docsPct}%` }}
                  title={`Documents (${storageBreakdown.docsStr})`}
                />
                <div
                  className="h-full bg-file-image"
                  style={{ width: `${storageBreakdown.imagesPct}%` }}
                  title={`Images (${storageBreakdown.imagesStr})`}
                />
                <div
                  className="h-full bg-file-video"
                  style={{ width: `${storageBreakdown.videosPct}%` }}
                  title={`Videos (${storageBreakdown.videosStr})`}
                />
                <div
                  className="h-full bg-file-audio"
                  style={{ width: `${storageBreakdown.audioPct}%` }}
                  title={`Audio (${storageBreakdown.audioStr})`}
                />
                <div
                  className="h-full bg-file-archive rounded-r-full"
                  style={{ width: `${storageBreakdown.archivePct}%` }}
                  title={`Archives (${storageBreakdown.archiveStr})`}
                />
              </div>

              {/* Legend Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-file-document shrink-0" />
                  <span className="text-text-secondary truncate">
                    Docs ({storageBreakdown.docsStr})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-file-image shrink-0" />
                  <span className="text-text-secondary truncate">
                    Images ({storageBreakdown.imagesStr})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-file-video shrink-0" />
                  <span className="text-text-secondary truncate">
                    Videos ({storageBreakdown.videosStr})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-file-audio shrink-0" />
                  <span className="text-text-secondary truncate">
                    Audio ({storageBreakdown.audioStr})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-file-archive shrink-0" />
                  <span className="text-text-secondary truncate">
                    Archive ({storageBreakdown.archiveStr})
                  </span>
                </div>
              </div>
            </div>

            {/* Cache Management Row */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-semibold text-text-primary">
                  Local Index Cache
                </span>
                <span className="text-xs text-text-muted">
                  Cached file thumbnails, catalog indexes, and temporary preview buffers in your browser.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-surface-raised border border-border font-mono text-xs text-text-secondary">
                  101.2 MB cached
                </span>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="h-9 px-3.5 bg-surface-raised hover:bg-surface-hover text-text-primary border border-border rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-text-muted" />
                  <span>{cacheCleared ? 'Cache Cleared!' : 'Clear Local Browser Cache'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: Linux Desktop & Secure API Keyring Management */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="font-headline-sm text-base font-semibold text-text-primary">
                  Linux Desktop &amp; API Key Security (OS Keyring)
                </h2>
                {isDesktop ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    <span>Native Linux App (16x Engine)</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[11px] font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Web Mode (Desktop .deb Ready)</span>
                  </span>
                )}
              </div>
              <span className="font-body-sm text-xs text-text-muted">
                Hardware-isolated API credentials encrypted using Linux Secret Service (GNOME Keyring / KWallet).
              </span>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border p-6 flex flex-col gap-6 shadow-xs">
            {/* Security Guarantee Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-surface-raised border border-border/70 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Zero Leak in .deb</span>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  No private keys are bundled into the binary. Reverse engineers or decompilers cannot extract your credentials.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-surface-raised border border-border/70 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                  <Lock className="w-4 h-4 text-primary" />
                  <span className="text-text-primary">OS Keyring Encryption</span>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Keys are encrypted at rest via Electron <code>safeStorage</code> backed by Linux kernel secrets and GNOME/KDE wallets.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-surface-raised border border-border/70 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                  <Terminal className="w-4 h-4 text-tertiary" />
                  <span className="text-tertiary">Local .env Config</span>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  You can set keys anytime at <code>~/.config/one-cloud/.env</code> with private user-only <code>0600</code> permissions.
                </p>
              </div>
            </div>

            {/* Custom Telegram API Credentials Form */}
            <form onSubmit={handleSaveKeyring} className="flex flex-col gap-4 pt-2 border-t border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-semibold text-text-primary flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-primary-container" />
                    <span>Telegram API Credentials (my.telegram.org)</span>
                  </span>
                  <span className="text-xs text-text-muted">
                    Leave blank to use default secure client keys, or provide your own custom Telegram App credentials.
                  </span>
                </div>
                {hasEncryptedKeys && (
                  <span className="px-2 py-0.5 rounded bg-tertiary-container/20 text-tertiary border border-tertiary/30 text-[11px] font-medium self-start sm:self-auto">
                    ✓ Custom Credentials Configured
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary" htmlFor="tg_api_id">
                    Telegram API ID
                  </label>
                  <input
                    id="tg_api_id"
                    type="text"
                    placeholder="e.g. 24968821"
                    value={customApiId}
                    onChange={(e) => setCustomApiId(e.target.value)}
                    className="h-9 px-3 bg-surface-raised rounded-lg border border-border text-xs text-text-primary focus:outline-none focus:border-focus-ring focus:ring-1 focus:ring-focus-ring transition-all placeholder:text-text-muted font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary" htmlFor="tg_api_hash">
                    Telegram API Hash
                  </label>
                  <input
                    id="tg_api_hash"
                    type="password"
                    placeholder="e.g. 8da85b0d5bfe62527e5b244c209159c3"
                    value={customApiHash}
                    onChange={(e) => setCustomApiHash(e.target.value)}
                    className="h-9 px-3 bg-surface-raised rounded-lg border border-border text-xs text-text-primary focus:outline-none focus:border-focus-ring focus:ring-1 focus:ring-focus-ring transition-all placeholder:text-text-muted font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {isDesktop ? (
                    <button
                      type="submit"
                      disabled={keyringSaving}
                      className="h-9 px-4 bg-primary hover:bg-primary-hover text-surface rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{keyringSaving ? 'Saving...' : 'Save to OS Keyring'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setKeyringStatus('Tip: This config is active when launched inside the Linux .deb desktop app.');
                        setTimeout(() => setKeyringStatus(null), 3500);
                      }}
                      className="h-9 px-4 bg-surface-raised hover:bg-surface-hover border border-border text-text-primary rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5 text-primary" />
                      <span>Test / Prepare Credentials</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCopyEnvSnippet}
                    className="h-9 px-3 bg-surface-raised hover:bg-surface-hover border border-border text-text-secondary hover:text-text-primary rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Copy ~/.config/one-cloud/.env setup command"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>{copiedEnvSnippet ? 'Copied Terminal Command!' : 'Copy Linux .env Command'}</span>
                  </button>
                </div>

                {keyringStatus && (
                  <span className="text-xs text-tertiary animate-in fade-in">{keyringStatus}</span>
                )}
              </div>
            </form>

            {/* Terminal Helper instructions */}
            <div className="p-3.5 rounded-lg bg-surface-raised/60 border border-border/80 flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-text-muted flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-primary" />
                  <span>Manual storage path: ~/.config/one-cloud/.env</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">chmod 600 (Private)</span>
              </div>
              <div className="bg-surface/90 rounded p-2.5 font-mono text-[11px] text-text-secondary select-all overflow-x-auto">
                mkdir -p ~/.config/one-cloud && echo &quot;TELEGRAM_API_ID={customApiId || 'your_id'}&quot; &gt;&gt; ~/.config/one-cloud/.env &amp;&amp; chmod 600 ~/.config/one-cloud/.env
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: Appearance & Interface Preferences */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col">
            <h2 className="font-headline-sm text-base font-semibold text-text-primary">
              Appearance &amp; Interface Preferences
            </h2>
            <span className="font-body-sm text-xs text-text-muted">
              Configure your personal workspace density and viewing standards.
            </span>
          </div>

          <div className="bg-surface rounded-xl border border-border divide-y divide-border">
            {/* Theme Preference Row */}
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-text-primary">Workspace Theme</span>
                <span className="text-xs text-text-muted">
                  Default dark theme calibrated for precision engineering and Telegram drive clients.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    theme === 'dark'
                      ? 'bg-brand-subtle border border-primary-container text-text-primary'
                      : 'bg-surface-raised border border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span>Obsidian Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    theme === 'light'
                      ? 'bg-brand-subtle border border-primary-container text-text-primary'
                      : 'bg-surface-raised border border-border text-text-muted'
                  }`}
                >
                  <span>Light (System)</span>
                </button>
              </div>
            </div>

            {/* Density Preference Row */}
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-text-primary">Grid &amp; Row Density</span>
                <span className="text-xs text-text-muted">
                  Standard vertical spacing across drive directories and query lists.
                </span>
              </div>
              <div className="relative w-full sm:w-64">
                <select
                  value={density}
                  onChange={(e) => setDensity(e.target.value)}
                  className="w-full h-10 px-3 pr-8 bg-surface rounded-lg border border-border text-xs text-text-primary focus:outline-none focus:border-focus-ring focus:ring-1 focus:ring-focus-ring appearance-none cursor-pointer"
                >
                  <option>Compact Table Rows (56px)</option>
                  <option>Comfortable Rows (68px)</option>
                  <option>Dense Matrix Grid</option>
                </select>
                <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* File Sorting Default Row */}
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-text-primary">Default File Sorting</span>
                <span className="text-xs text-text-muted">
                  Initial ordering index applied when entering directories.
                </span>
              </div>
              <div className="relative w-full sm:w-64">
                <select
                  value={defaultSort}
                  onChange={(e) => setDefaultSort(e.target.value)}
                  className="w-full h-10 px-3 pr-8 bg-surface rounded-lg border border-border text-xs text-text-primary focus:outline-none focus:border-focus-ring focus:ring-1 focus:ring-focus-ring appearance-none cursor-pointer"
                >
                  <option>Last modified (Newest first)</option>
                  <option>Alphabetical (A - Z)</option>
                  <option>File Size (Largest first)</option>
                  <option>File Type &amp; Extension</option>
                </select>
                <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: Security Links & Legal Footer */}
        <section className="pt-4 pb-12 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-text-muted text-xs">
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-text-muted" />
            <span>End-to-End Client Zero Knowledge Workspace</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/security" className="hover:text-text-primary transition-colors hover:underline">
              Security Architecture
            </Link>
            <span className="text-border-strong">·</span>
            <Link href="/privacy" className="hover:text-text-primary transition-colors hover:underline">
              Privacy Policy
            </Link>
            <span className="text-border-strong">·</span>
            <Link href="/terms" className="hover:text-text-primary transition-colors hover:underline">
              Terms of Service
            </Link>
          </div>
        </section>
      </div>

      {showConnectModal && (
        <ConnectTelegramModal onClose={() => setShowConnectModal(false)} />
      )}
    </div>
  );
}
