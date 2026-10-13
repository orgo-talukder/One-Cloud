'use client';

import React from 'react';
import {
  X,
  Download,
  FileText,
  Headphones,
  Video as VideoIcon,
  Image as ImageIcon,
  HardDrive,
  Calendar,
  Send,
  Star,
  Archive,
  File,
} from 'lucide-react';
import type { FileItem } from '@/lib/drive/types';
import { formatBytes, getFileTypeCategory } from '@/lib/drive/storage-calc';
import { useDrive } from '@/lib/drive/drive-context';
import { ItemIcon } from '@/components/drive/ItemIcon';

interface FilePreviewModalProps {
  file: FileItem;
  onClose: () => void;
}

export function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  const { sessionToken, toggleStarFile, downloadFile } = useDrive();
  const category = getFileTypeCategory(file.mimeType, file.extension);

  const downloadUrl = file.downloadUrl || `/api/telegram/download/${file.id}?messageId=${file.telegramMessageId}&sessionToken=${encodeURIComponent(
    sessionToken
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-2xl bg-surface shadow-2xl border border-border overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-raised border border-border/50 p-1">
              <ItemIcon type="file" fileName={file.name} mimeType={file.mimeType} extension={file.extension} className="h-7 w-7" size={28} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-text-primary truncate">{file.name}</h3>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>{formatBytes(file.fileSizeBytes)}</span>
                <span>•</span>
                <span className="uppercase text-[11px] text-text-secondary">{file.extension || 'FILE'}</span>
                <span>•</span>
                <span className="hidden sm:inline text-text-muted truncate">{file.mimeType}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toggleStarFile(file.id)}
              className="p-2 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-muted hover:text-warning transition-colors cursor-pointer"
              title="Star file"
            >
              <Star
                className={`h-4 w-4 ${
                  file.isStarred ? 'fill-warning text-warning' : ''
                }`}
              />
            </button>
            <button
              type="button"
              onClick={() => downloadFile(file)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-text-primary bg-primary-container hover:bg-brand-hover rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Preview Zone */}
        <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center min-h-[340px] bg-canvas">
          {category === 'image' && (
            <div className="relative max-h-[520px] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={downloadUrl}
                alt={file.name}
                referrerPolicy="no-referrer"
                className="max-h-[480px] max-w-full rounded-xl object-contain shadow-lg border border-border"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const fb = document.getElementById('preview-fallback');
                  if (fb) fb.style.display = 'flex';
                }}
              />
              <div
                id="preview-fallback"
                className="hidden flex-col items-center justify-center p-8 text-center text-text-muted"
              >
                <ImageIcon className="h-12 w-12 text-text-muted mb-2" />
                <p className="text-xs text-text-secondary">Image preview buffer ready to stream.</p>
              </div>
            </div>
          )}

          {category === 'video' && (
            <div className="w-full max-w-2xl">
              <video
                controls
                src={downloadUrl}
                className="w-full rounded-xl shadow-lg border border-border bg-black max-h-[440px]"
              >
                Your browser does not support HTML5 video preview.
              </video>
            </div>
          )}

          {category === 'audio' && (
            <div className="w-full max-w-md p-6 bg-surface rounded-2xl border border-border shadow-md text-center">
              <div className="h-14 w-14 rounded-full bg-brand-subtle text-file-audio flex items-center justify-center mx-auto mb-4">
                <Headphones className="h-7 w-7" />
              </div>
              <p className="font-semibold text-sm text-text-primary mb-1 truncate">{file.name}</p>
              <p className="text-xs text-text-muted mb-4">{formatBytes(file.fileSizeBytes)}</p>
              <audio controls src={downloadUrl} className="w-full">
                Your browser does not support audio element.
              </audio>
            </div>
          )}

          {category === 'pdf' && (
            <div className="w-full h-[520px] rounded-xl overflow-hidden border border-border bg-surface">
              <iframe src={downloadUrl} className="w-full h-full" title={file.name} />
            </div>
          )}

          {category !== 'image' &&
            category !== 'video' &&
            category !== 'audio' &&
            category !== 'pdf' && (
              <div className="text-center p-8 bg-surface border border-border rounded-2xl shadow-md max-w-sm">
                <div className="h-14 w-14 rounded-full bg-brand-subtle text-primary flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-7 w-7" />
                </div>
                <h4 className="text-sm font-semibold text-text-primary mb-1 truncate">{file.name}</h4>
                <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                  Payload is safely stored in Telegram Saved Messages. Download the original payload to inspect locally.
                </p>
                <button
                  type="button"
                  onClick={() => downloadFile(file)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-text-primary bg-primary-container hover:bg-brand-hover rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download File ({formatBytes(file.fileSizeBytes)})</span>
                </button>
              </div>
            )}
        </div>

        {/* Modal Footer / File Details */}
        <div className="px-6 py-3 border-t border-border bg-surface flex flex-wrap items-center justify-between gap-4 text-xs text-text-secondary">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-text-muted">
              <Calendar className="h-3.5 w-3.5 text-text-muted" />
              <span>Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}</span>
            </span>
            <span className="flex items-center gap-1.5 text-text-muted">
              <HardDrive className="h-3.5 w-3.5 text-text-muted" />
              <span className="font-mono tabular-nums">{formatBytes(file.fileSizeBytes)}</span>
            </span>
            <span className="flex items-center gap-1.5 text-text-muted">
              <Send className="h-3.5 w-3.5 text-[#36AEEA]" />
              <span>Telegram Message #{file.telegramMessageId}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
