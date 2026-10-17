'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Share2,
  Copy,
  Check,
  Shield,
  Clock,
  Download,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Trash2,
  QrCode,
  ExternalLink,
  Loader2,
  Info,
} from 'lucide-react';
import type { FileItem } from '@/lib/drive/types';
import type { ShareAccessLevel, ShareLinkDocument } from '@/lib/drive/share-types';
import { ShareService } from '@/lib/drive/share-service';
import QRCode from 'qrcode';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem | null;
  ownerUid: string;
  ownerEmail: string;
  ownerDisplayName?: string;
  ownerSessionToken: string;
  onShareUpdated?: (fileId: string, isShared: boolean, shareToken?: string) => void;
}

export function ShareModal({
  isOpen,
  onClose,
  file,
  ownerUid,
  ownerEmail,
  ownerDisplayName,
  ownerSessionToken,
  onShareUpdated,
}: ShareModalProps) {
  const [accessLevel, setAccessLevel] = useState<ShareAccessLevel>('viewer');
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState<number | null>(null);
  const [allowDownload, setAllowDownload] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [activeShareToken, setActiveShareToken] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);

  // Load existing share info if file is already shared
  useEffect(() => {
    if (!isOpen || !file) {
      setShareUrl('');
      setActiveShareToken(null);
      setQrCodeDataUrl(null);
      return;
    }

    let isMounted = true;
    const fetchExistingShare = async () => {
      setIsLoading(true);
      try {
        const existingShare = await ShareService.getActiveShareForFile(file.id, ownerUid);
        if (existingShare && isMounted) {
          setActiveShareToken(existingShare.shareToken);
          setAccessLevel(existingShare.accessLevel || 'viewer');
          setAllowDownload(existingShare.allowDownload !== false);
          setHasPassword(existingShare.hasPassword);
          setViewCount(existingShare.viewCount || 0);
          setDownloadCount(existingShare.downloadCount || 0);

          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          const url = `${origin}/share/${existingShare.shareToken}`;
          setShareUrl(url);

          try {
            const qr = await QRCode.toDataURL(url, { width: 220, margin: 2 });
            if (isMounted) setQrCodeDataUrl(qr);
          } catch {
            // non-fatal
          }
        } else if (isMounted) {
          setActiveShareToken(null);
          setShareUrl('');
          setHasPassword(false);
          setPassword('');
          setExpiresInDays(null);
          setAllowDownload(true);
          setAccessLevel('viewer');
          setViewCount(0);
          setDownloadCount(0);
        }
      } catch (err) {
        console.warn('Error loading share:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchExistingShare();

    return () => {
      isMounted = false;
    };
  }, [isOpen, file, ownerUid]);

  if (!isOpen || !file) return null;

  const handleCreateOrUpdateShare = async () => {
    if (!ownerSessionToken) {
      alert('Please connect your Telegram session first to enable secure sharing.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await ShareService.createShareLink({
        file,
        ownerUid,
        ownerEmail,
        ownerDisplayName,
        ownerSessionToken,
        accessLevel,
        password: hasPassword ? password : '',
        expiresInDays,
        allowDownload,
        existingToken: activeShareToken || undefined,
      });

      setActiveShareToken(result.shareToken);
      setShareUrl(result.shareUrl);

      try {
        const qr = await QRCode.toDataURL(result.shareUrl, { width: 220, margin: 2 });
        setQrCodeDataUrl(qr);
      } catch {
        // non-fatal
      }

      onShareUpdated?.(file.id, true, result.shareToken);

      // Auto-copy to clipboard
      await navigator.clipboard.writeText(result.shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err: unknown) {
      console.error('Error creating share link:', err);
      alert('Failed to generate share link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) {
      await handleCreateOrUpdateShare();
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleRevokeShare = async () => {
    if (!activeShareToken) return;
    if (!confirm('Are you sure you want to revoke this share link? Anyone with this link will immediately lose access.')) {
      return;
    }

    setIsLoading(true);
    try {
      await ShareService.revokeShareLink(activeShareToken, file.id, ownerUid);
      setActiveShareToken(null);
      setShareUrl('');
      setQrCodeDataUrl(null);
      onShareUpdated?.(file.id, false);
      onClose();
    } catch (err) {
      console.error('Error revoking share:', err);
      alert('Failed to revoke share link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/80 bg-neutral-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Share2 className="w-5 h-5" />
              </div>
              <div className="truncate max-w-[340px]">
                <h3 className="text-base font-semibold text-neutral-100 truncate">
                  Share &ldquo;{file.name}&rdquo;
                </h3>
                <p className="text-xs text-neutral-400">Google Drive-style encrypted sharing</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* General Access Box (Google Drive standard) */}
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  General Access
                </span>
                {activeShareToken && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live & Active
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300 shrink-0">
                    <Globe className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-medium text-neutral-200">
                      Anyone with the link
                    </div>
                    <div className="text-xs text-neutral-400 truncate">
                      Anyone on the internet with this link can view
                    </div>
                  </div>
                </div>

                {/* Role Dropdown */}
                <select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value as ShareAccessLevel)}
                  className="px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700/80 text-neutral-200 rounded-lg border border-neutral-700 focus:outline-hidden focus:border-blue-500 transition-colors"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                </select>
              </div>
            </div>

            {/* Security Shield & Controls */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                <Shield className="w-4 h-4 text-amber-400" />
                Security & Shield Options
              </div>

              {/* Password Protection */}
              <div className="p-3.5 rounded-xl bg-neutral-950/40 border border-neutral-800/80 space-y-2.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-neutral-400" />
                    <div>
                      <div className="text-xs font-medium text-neutral-200">
                        Password Protection
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Require a password challenge before opening or downloading
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasPassword}
                    onChange={(e) => setHasPassword(e.target.checked)}
                    className="w-4 h-4 rounded-sm border-neutral-700 bg-neutral-800 text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                </label>

                {hasPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-2 flex items-center gap-2"
                  >
                    <div className="relative flex-1">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Set link access password..."
                        className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-hidden focus:border-blue-500 pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Expiration Date */}
              <div className="p-3.5 rounded-xl bg-neutral-950/40 border border-neutral-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-neutral-400" />
                  <div>
                    <div className="text-xs font-medium text-neutral-200">Link Expiration (TTL)</div>
                    <div className="text-[11px] text-neutral-400">
                      Link automatically self-destructs after this duration
                    </div>
                  </div>
                </div>

                <select
                  value={expiresInDays === null ? 'never' : expiresInDays.toString()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setExpiresInDays(val === 'never' ? null : parseInt(val, 10));
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-neutral-900 text-neutral-200 rounded-lg border border-neutral-700 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="never">Never (Unlimited)</option>
                  <option value="1">1 Day</option>
                  <option value="7">7 Days</option>
                  <option value="30">30 Days</option>
                  <option value="90">90 Days</option>
                </select>
              </div>

              {/* Allow / Block Downloads (DLP Protection) */}
              <div className="p-3.5 rounded-xl bg-neutral-950/40 border border-neutral-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-neutral-400" />
                  <div>
                    <div className="text-xs font-medium text-neutral-200">
                      Allow Viewers to Download
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {allowDownload
                        ? 'Recipients can preview and save the file to their device'
                        : 'DLP Mode: Viewers can only preview in browser (no download button)'}
                    </div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                  className="w-4 h-4 rounded-sm border-neutral-700 bg-neutral-800 text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Generated Link Field */}
            {shareUrl ? (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Public Share Link</span>
                  <div className="flex items-center gap-2">
                    {qrCodeDataUrl && (
                      <button
                        type="button"
                        onClick={() => setShowQrModal(!showQrModal)}
                        className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        {showQrModal ? 'Hide QR' : 'Show QR'}
                      </button>
                    )}
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Preview
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-neutral-950 border border-neutral-800 rounded-xl">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-transparent px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-hidden select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                {/* QR Code view */}
                {showQrModal && qrCodeDataUrl && (
                  <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeDataUrl}
                      alt="Share QR Code"
                      className="w-40 h-40 rounded-lg bg-white p-2"
                    />
                    <p className="text-[11px] text-neutral-400 text-center">
                      Scan with any smartphone camera to open file
                    </p>
                  </div>
                )}

                {/* Metrics */}
                <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-neutral-500">
                  <span>Views: {viewCount}</span>
                  <span>Downloads: {downloadCount}</span>
                  <span>Zero-credential relay protected</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Click &ldquo;Create Share Link&rdquo; below to generate a unique, cryptographically secure
                  URL. Your Telegram credentials stay 100% private.
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-900/60">
            {activeShareToken ? (
              <button
                type="button"
                onClick={handleRevokeShare}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Revoke Link
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleCreateOrUpdateShare}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg shadow-md transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {activeShareToken ? 'Update & Copy' : 'Create Share Link'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
