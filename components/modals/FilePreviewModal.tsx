'use client';

import React from 'react';
import {
  X,
  Download,
  FileText,
  Music,
  Video as VideoIcon,
  Image as ImageIcon,
  HardDrive,
  Calendar,
  Send,
} from 'lucide-react';
import type { FileItem } from '@/lib/drive/types';
import { formatBytes, getFileTypeCategory } from '@/lib/drive/storage-calc';
import { useDrive } from '@/lib/drive/drive-context';

interface FilePreviewModalProps {
  file: FileItem;
  onClose: () => void;
}

export function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  const { sessionToken } = useDrive();
  const category = getFileTypeCategory(file.mimeType, file.extension);

  const downloadUrl = file.downloadUrl || `/api/telegram/download/${file.id}?messageId=${file.telegramMessageId}&sessionToken=${encodeURIComponent(
    sessionToken
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
              {category === 'image' && <ImageIcon className="h-4 w-4 text-sky-500" />}
              {category === 'video' && <VideoIcon className="h-4 w-4 text-purple-500" />}
              {category === 'audio' && <Music className="h-4 w-4 text-emerald-500" />}
              {category === 'pdf' && <FileText className="h-4 w-4 text-rose-500" />}
              {category !== 'image' &&
                category !== 'video' &&
                category !== 'audio' &&
                category !== 'pdf' && <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{file.name}</h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                <span>{formatBytes(file.fileSizeBytes)}</span>
                <span>·</span>
                <span>{file.mimeType}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={downloadUrl}
              download={file.name}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-2xs transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Preview Zone */}
        <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center min-h-[300px] bg-slate-100/40 dark:bg-slate-950/60">
          {category === 'image' && (
            <div className="relative max-h-[500px] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={downloadUrl}
                alt={file.name}
                referrerPolicy="no-referrer"
                className="max-h-[460px] max-w-full rounded-lg object-contain shadow-sm border border-slate-200 dark:border-slate-800"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const fb = document.getElementById('preview-fallback');
                  if (fb) fb.style.display = 'flex';
                }}
              />
              <div
                id="preview-fallback"
                className="hidden flex-col items-center justify-center p-8 text-center text-slate-400"
              >
                <ImageIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Image preview not ready.</p>
              </div>
            </div>
          )}

          {category === 'video' && (
            <div className="w-full max-w-xl">
              <video
                controls
                src={downloadUrl}
                className="w-full rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 bg-black max-h-[420px]"
              >
                Your browser does not support HTML5 video preview.
              </video>
            </div>
          )}

          {category === 'audio' && (
            <div className="w-full max-w-md p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
              <div className="h-14 w-14 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <Music className="h-7 w-7" />
              </div>
              <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">{file.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{formatBytes(file.fileSizeBytes)}</p>
              <audio controls src={downloadUrl} className="w-full">
                Your browser does not support audio element.
              </audio>
            </div>
          )}

          {category === 'pdf' && (
            <div className="w-full h-[500px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
              <iframe src={downloadUrl} className="w-full h-full" title={file.name} />
            </div>
          )}

          {category !== 'image' &&
            category !== 'video' &&
            category !== 'audio' &&
            category !== 'pdf' && (
              <div className="text-center p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm max-w-sm">
                <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-7 w-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{file.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                  No preview available for this file type. You can download the original file to view
                  it on your device.
                </p>
                <a
                  href={downloadUrl}
                  download={file.name}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 rounded-xl shadow-xs transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download File ({formatBytes(file.fileSizeBytes)})</span>
                </a>
              </div>
            )}
        </div>

        {/* Modal Footer / File Details */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-mono tabular-nums">{formatBytes(file.fileSizeBytes)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5 text-sky-500" />
              <span>Telegram Message #{file.telegramMessageId}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
