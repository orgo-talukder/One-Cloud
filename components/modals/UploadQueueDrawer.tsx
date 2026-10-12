'use client';

import React, { useState } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  Clock,
  RotateCcw,
  Gauge,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import { formatBytes } from '@/lib/drive/storage-calc';

function formatEta(seconds?: number | null): string {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds) || seconds < 0) {
    return 'Calculating ETA...';
  }
  if (seconds <= 1) {
    return '~1s left';
  }
  if (seconds < 60) {
    return `~${Math.ceil(seconds)}s left`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.ceil(seconds % 60);
  if (mins < 60) {
    return secs > 0 ? `~${mins}m ${secs}s left` : `~${mins}m left`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `~${hours}h ${remMins}m left` : `~${hours}h left`;
}

export function UploadQueueDrawer() {
  const {
    uploadTasks,
    clearCompletedUploads,
    cancelUpload,
    retryUpload,
    dismissUpload,
  } = useDrive();
  const [collapsed, setCollapsed] = useState(false);

  if (uploadTasks.length === 0) return null;

  const activeUploadingTasks = uploadTasks.filter((t) => t.status === 'uploading');
  const inProgressCount = uploadTasks.filter(
    (t) => t.status === 'uploading' || t.status === 'queued'
  ).length;
  const completedCount = uploadTasks.filter((t) => t.status === 'completed').length;
  const failedCount = uploadTasks.filter(
    (t) => t.status === 'failed' || t.status === 'cancelled'
  ).length;

  const totalLiveSpeed = activeUploadingTasks.reduce(
    (sum, t) => sum + (t.speedBytesPerSec || 0),
    0
  );

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-[440px] max-w-[calc(100vw-32px)] bg-surface border border-border rounded-[14px] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.65)] flex flex-col overflow-hidden text-text-primary transition-all duration-200"
      id="uploadQueueDrawer"
    >
      {/* Header Block */}
      <div className="p-3.5 pb-2.5 flex flex-col bg-surface border-b border-border/60">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-subtle flex items-center justify-center text-primary-container shrink-0">
              {inProgressCount > 0 ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : failedCount > 0 && completedCount === 0 ? (
                <AlertCircle className="h-4 w-4 text-danger" />
              ) : (
                <Upload className="h-4 w-4 text-tertiary" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-primary truncate">
                  {inProgressCount > 0
                    ? `Uploading ${inProgressCount} item${inProgressCount > 1 ? 's' : ''}...`
                    : failedCount > 0
                    ? `${failedCount} upload${failedCount > 1 ? 's' : ''} need attention`
                    : 'All uploads completed'}
                </span>
                {inProgressCount > 0 && totalLiveSpeed > 0 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand-subtle text-[10px] font-mono font-medium text-primary shrink-0">
                    <Gauge className="h-2.5 w-2.5" />
                    {formatBytes(totalLiveSpeed)}/s
                  </span>
                )}
              </div>
              <span className="text-[11px] text-text-muted truncate">
                {completedCount} completed • {inProgressCount} active
                {failedCount > 0 ? ` • ${failedCount} failed` : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {completedCount > 0 && (
              <button
                onClick={clearCompletedUploads}
                className="px-2 py-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-hover text-[11px] transition-colors cursor-pointer"
                type="button"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              type="button"
            >
              {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Task List */}
      {!collapsed && (
        <div className="max-h-80 overflow-y-auto divide-y divide-border/40 bg-surface">
          {uploadTasks.map((task) => {
            const uploadedBytes =
              task.status === 'completed'
                ? task.size
                : Math.min(task.size, task.uploadedBytes ?? Math.round((task.progress / 100) * task.size));

            return (
              <div
                key={task.id}
                className="px-3.5 py-2.5 flex flex-col gap-1.5 hover:bg-surface-hover/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded bg-brand-subtle flex items-center justify-center text-primary shrink-0">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span
                        className="text-xs text-text-primary font-medium truncate"
                        title={task.name}
                      >
                        {task.name}
                      </span>

                      {/* Real-time transfer metrics row */}
                      {task.status === 'uploading' ? (
                        <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 text-[10px] font-mono tabular-nums text-text-muted">
                          <span className="text-text-secondary">
                            {formatBytes(uploadedBytes)} / {formatBytes(task.size)}
                          </span>
                          <span>•</span>
                          <span className="text-primary font-medium">
                            {task.speedBytesPerSec && task.speedBytesPerSec > 0
                              ? `${formatBytes(task.speedBytesPerSec)}/s`
                              : 'Measuring...'}
                          </span>
                          <span>•</span>
                          <span className="text-text-secondary">
                            {task.phase === 'finalizing'
                              ? 'Finalizing in Telegram...'
                              : formatEta(task.etaSeconds)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono tabular-nums text-text-muted">
                          {formatBytes(task.size)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {task.status === 'uploading' && (
                      <span className="text-xs font-mono tabular-nums font-semibold text-primary">
                        {task.progress}%
                      </span>
                    )}
                    {task.status === 'completed' && (
                      <span className="text-tertiary flex items-center gap-1 text-[11px] font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Done
                      </span>
                    )}
                    {(task.status === 'failed' || task.status === 'cancelled') && (
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-danger flex items-center gap-1 text-[11px] font-medium"
                          title={task.error || 'Upload failed'}
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>{task.status === 'cancelled' ? 'Cancelled' : 'Error'}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => retryUpload(task.id)}
                          className="px-2 py-0.5 rounded-md bg-brand-subtle hover:bg-primary-container text-primary hover:text-text-primary border border-primary/30 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          title="Retry upload"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Retry</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => dismissUpload(task.id)}
                          className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
                          title="Dismiss"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                    {task.status === 'queued' && (
                      <span className="text-text-muted flex items-center gap-1 text-[11px]">
                        <Clock className="h-3 w-3" /> Queued
                      </span>
                    )}

                    {task.status === 'uploading' && (
                      <button
                        type="button"
                        onClick={() => cancelUpload(task.id)}
                        className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-danger hover:bg-surface-raised transition-colors cursor-pointer"
                        title="Cancel"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Error reason display */}
                {task.status === 'failed' && task.error && (
                  <p className="text-[11px] text-danger/90 leading-snug truncate" title={task.error}>
                    {task.error}
                  </p>
                )}

                {/* Row Progress bar */}
                <div className="w-full h-1 bg-surface-raised rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-200 ${
                      task.status === 'completed'
                        ? 'bg-tertiary'
                        : task.status === 'failed' || task.status === 'cancelled'
                        ? 'bg-danger'
                        : 'bg-primary-container'
                    }`}
                    style={{ width: `${task.status === 'completed' ? 100 : task.progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
