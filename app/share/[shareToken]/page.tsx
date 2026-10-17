'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Cloud,
  Download,
  Lock,
  Clock,
  ShieldAlert,
  FileText,
  FileArchive,
  FileCode,
  File as FileIcon,
  Eye,
  EyeOff,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Maximize2,
} from 'lucide-react';
import type { PublicShareFileMetadata } from '@/lib/drive/share-types';
import { ShareService } from '@/lib/drive/share-service';
import { formatBytes } from '@/lib/drive/storage-calc';

export default function GuestSharePage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const resolvedParams = use(params);
  const shareToken = resolvedParams.shareToken;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const [requiresPassword, setRequiresPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  const [fileMeta, setFileMeta] = useState<PublicShareFileMetadata | null>(null);
  const [unlockedPassword, setUnlockedPassword] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadShare() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await ShareService.verifyShare(shareToken);

        if (!isMounted) return;

        if (!res.valid) {
          setError(res.error || 'Failed to load shared file.');
          setErrorCode(res.errorCode || 'UNKNOWN');
          return;
        }

        if (res.requiresPassword) {
          setRequiresPassword(true);
          setFileMeta(res.file || null);
        } else {
          setRequiresPassword(false);
          setFileMeta(res.file || null);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Error accessing share link.';
        setError(msg);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadShare();

    return () => {
      isMounted = false;
    };
  }, [shareToken]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setIsVerifyingPassword(true);
    setPasswordError(null);

    try {
      const isValid = await ShareService.verifyPassword(shareToken, passwordInput.trim());
      if (isValid) {
        setUnlockedPassword(passwordInput.trim());
        setRequiresPassword(false);
      } else {
        setPasswordError('Incorrect password. Please try again.');
      }
    } catch {
      setPasswordError('Failed to verify password. Please try again.');
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Build stream URL
  const streamUrl = React.useMemo(() => {
    if (!shareToken) return '';
    let url = `/api/drive/share/stream/${shareToken}`;
    if (unlockedPassword) {
      url += `?pwd=${encodeURIComponent(unlockedPassword)}`;
    }
    return url;
  }, [shareToken, unlockedPassword]);

  const downloadUrl = React.useMemo(() => {
    if (!streamUrl) return '';
    const separator = streamUrl.includes('?') ? '&' : '?';
    return `${streamUrl}${separator}download=true`;
  }, [streamUrl]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-neutral-100">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Cloud className="w-7 h-7" />
            </div>
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin absolute -bottom-1 -right-1" />
          </div>
          <p className="text-sm font-medium text-neutral-400 animate-pulse">
            Verifying share link permissions...
          </p>
        </div>
      </div>
    );
  }

  // Error / Expired / Revoked State
  if (error || !fileMeta) {
    const isExpired = errorCode === 'EXPIRED';
    const isRevoked = errorCode === 'REVOKED';

    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-neutral-100">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center bg-rose-500/10 border border-rose-500/20 text-rose-400">
            {isExpired ? (
              <Clock className="w-8 h-8 text-amber-400" />
            ) : isRevoked ? (
              <ShieldAlert className="w-8 h-8 text-rose-400" />
            ) : (
              <AlertCircle className="w-8 h-8 text-neutral-400" />
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-neutral-100">
              {isExpired
                ? 'Link Has Expired'
                : isRevoked
                ? 'Access Revoked'
                : 'File Unavailable'}
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed">
              {isExpired
                ? 'The time limit set by the file owner has lapsed. Contact the owner to generate a fresh link.'
                : isRevoked
                ? 'The file owner has disabled or revoked this public share link.'
                : error}
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to OneCloud Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Password Shield Screen
  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-neutral-100">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-3">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral-100">Password Protected File</h1>
              <p className="text-xs text-neutral-400 mt-1">
                This link was secured with a password by{' '}
                <span className="text-neutral-200 font-medium">{fileMeta.ownerDisplayName || 'the owner'}</span>.
              </p>
            </div>
          </div>

          {/* File Card Summary */}
          <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300">
              <FileIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div className="truncate min-w-0 flex-1">
              <div className="text-xs font-medium text-neutral-200 truncate">{fileMeta.fileName}</div>
              <div className="text-[11px] text-neutral-500">{formatBytes(fileMeta.fileSizeBytes)}</div>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Enter Access Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password..."
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-950 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-rose-400 font-medium pt-1">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifyingPassword}
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isVerifyingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Unlock & View File
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // File Preview Screen
  const isImage =
    fileMeta.mimeType?.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileMeta.fileName);
  const isVideo =
    fileMeta.mimeType?.startsWith('video/') ||
    /\.(mp4|webm|mov|mkv)$/i.test(fileMeta.fileName);
  const isAudio =
    fileMeta.mimeType?.startsWith('audio/') ||
    /\.(mp3|wav|ogg|m4a|flac)$/i.test(fileMeta.fileName);
  const isPdf =
    fileMeta.mimeType === 'application/pdf' ||
    /\.pdf$/i.test(fileMeta.fileName);

  return (
    <div
      className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col select-auto"
      onContextMenu={(e) => {
        // Enforce DLP: prevent right click save if download is blocked
        if (!fileMeta.allowDownload) {
          e.preventDefault();
        }
      }}
    >
      {/* Top Navigation Bar */}
      <header className="h-16 px-4 md:px-6 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3.5 min-w-0">
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
              OneCloud
            </span>
          </Link>

          <div className="h-4 w-px bg-neutral-800 hidden sm:block shrink-0" />

          {/* File Name & Badges */}
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-sm font-semibold text-neutral-100 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {fileMeta.fileName}
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-800 text-neutral-400 shrink-0 uppercase">
              {fileMeta.extension || 'FILE'}
            </span>
            <span className="text-xs text-neutral-500 shrink-0 hidden md:inline">
              {formatBytes(fileMeta.fileSizeBytes)}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleCopyLink}
            className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs"
            title="Copy Share Link"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy Link'}</span>
          </button>

          {fileMeta.allowDownload ? (
            <a
              href={downloadUrl}
              download={fileMeta.fileName}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl shadow-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </a>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/80 border border-neutral-700 text-[11px] font-medium text-amber-300">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>View-Only Mode</span>
            </div>
          )}
        </div>
      </header>

      {/* Security Banner if DLP is active */}
      {!fileMeta.allowDownload && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-200 flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Protected Document: Downloading, printing, and direct saving have been restricted by the owner.</span>
        </div>
      )}

      {/* Main Preview Workspace */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 bg-neutral-950/60 overflow-hidden">
        <div className="w-full max-w-5xl h-full min-h-[60vh] flex flex-col items-center justify-center">
          {/* Image Preview */}
          {isImage && (
            <div className="relative max-w-full max-h-[75vh] flex items-center justify-center rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={streamUrl}
                alt={fileMeta.fileName}
                className="max-h-[70vh] max-w-full object-contain rounded-xl select-none"
                draggable={fileMeta.allowDownload}
              />
            </div>
          )}

          {/* Video Preview */}
          {isVideo && (
            <div className="w-full max-w-4xl rounded-2xl overflow-hidden border border-neutral-800 bg-black shadow-2xl">
              <video
                src={streamUrl}
                controls
                controlsList={fileMeta.allowDownload ? undefined : 'nodownload'}
                className="w-full max-h-[75vh] rounded-2xl bg-black"
                playsInline
              />
            </div>
          )}

          {/* Audio Preview */}
          {isAudio && (
            <div className="w-full max-w-lg p-8 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <FileCode className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-neutral-100">{fileMeta.fileName}</h3>
                <p className="text-xs text-neutral-400">{formatBytes(fileMeta.fileSizeBytes)}</p>
              </div>
              <audio
                src={streamUrl}
                controls
                controlsList={fileMeta.allowDownload ? undefined : 'nodownload'}
                className="w-full"
              />
            </div>
          )}

          {/* PDF Preview */}
          {isPdf && (
            <div className="w-full h-[75vh] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl">
              <iframe
                src={`${streamUrl}#toolbar=${fileMeta.allowDownload ? '1' : '0'}`}
                title={fileMeta.fileName}
                className="w-full h-full border-none"
              />
            </div>
          )}

          {/* Other File Formats (Zip, Code, Executables, Docs) */}
          {!isImage && !isVideo && !isAudio && !isPdf && (
            <div className="max-w-md w-full p-8 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                {fileMeta.extension === 'zip' || fileMeta.extension === 'rar' || fileMeta.extension === '7z' ? (
                  <FileArchive className="w-10 h-10" />
                ) : fileMeta.extension === 'txt' || fileMeta.extension === 'doc' || fileMeta.extension === 'docx' ? (
                  <FileText className="w-10 h-10" />
                ) : (
                  <FileIcon className="w-10 h-10" />
                )}
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-neutral-100 break-all">{fileMeta.fileName}</h3>
                <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
                  <span>{formatBytes(fileMeta.fileSizeBytes)}</span>
                  <span>•</span>
                  <span className="uppercase">{fileMeta.extension || 'FILE'}</span>
                </div>
              </div>

              {fileMeta.allowDownload ? (
                <a
                  href={downloadUrl}
                  download={fileMeta.fileName}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </a>
              ) : (
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-400">
                  This file cannot be previewed in the browser, and the owner has restricted downloads.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer bar */}
      <footer className="py-3 px-6 border-t border-neutral-800/80 bg-neutral-900/60 text-center text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>Shared via OneCloud</span>
          <span>•</span>
          <span>By {fileMeta.ownerDisplayName || 'User'}</span>
        </div>
        <div>
          <span>Views: {fileMeta.viewCount}</span>
        </div>
      </footer>
    </div>
  );
}
