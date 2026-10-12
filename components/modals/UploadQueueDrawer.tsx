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
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import { formatBytes } from '@/lib/drive/storage-calc';

export function UploadQueueDrawer() {
  const { uploadTasks, clearCompletedUploads, cancelUpload } = useDrive();
  const [collapsed, setCollapsed] = useState(false);

  if (uploadTasks.length === 0) return null;

  const inProgressCount = uploadTasks.filter(
    (t) => t.status === 'uploading' || t.status === 'queued'
  ).length;
  const completedCount = uploadTasks.filter((t) => t.status === 'completed').length;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-32px)] bg-surface border border-border rounded-[14px] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.65)] flex flex-col overflow-hidden text-text-primary transition-all duration-200"
      id="uploadQueueDrawer"
    >
      {/* Header Block */}
      <div className="p-3.5 pb-2.5 flex flex-col bg-surface border-b border-border/60">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-subtle flex items-center justify-center text-primary-container shrink-0">
              {inProgressCount > 0 ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Upload className="h-4 w-4 text-tertiary" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-text-primary truncate">
                {inProgressCount > 0
                  ? `Uploading ${inProgressCount} item${inProgressCount > 1 ? 's' : ''}...`
                  : 'All uploads completed'}
              </span>
              <span className="text-[11px] text-text-muted truncate">
                {completedCount} completed • {inProgressCount} active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {completedCount > 0 && (
              <button
                onClick={clearCompletedUploads}
                className="px-2 py-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-hover text-[11px] transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            >
              {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Task List */}
      {!collapsed && (
        <div className="max-h-72 overflow-y-auto divide-y divide-border/40 bg-surface">
          {uploadTasks.map((task) => (
            <div key={task.id} className="px-3.5 py-2.5 flex flex-col gap-1.5 hover:bg-surface-hover/40 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded bg-brand-subtle flex items-center justify-center text-primary shrink-0">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs text-text-primary font-medium truncate" title={task.name}>
                      {task.name}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted">
                      {formatBytes(task.size)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {task.status === 'uploading' && (
                    <span className="text-xs font-mono font-semibold text-primary">
                      {task.progress}%
                    </span>
                  )}
                  {task.status === 'completed' && (
                    <span className="text-tertiary flex items-center gap-1 text-[11px] font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Done
                    </span>
                  )}
                  {task.status === 'failed' && (
                    <span className="text-danger flex items-center gap-1 text-[11px]" title={task.error}>
                      <AlertCircle className="h-3.5 w-3.5" /> Error
                    </span>
                  )}
                  {task.status === 'queued' && (
                    <span className="text-text-muted flex items-center gap-1 text-[11px]">
                      <Clock className="h-3 w-3" /> Queued
                    </span>
                  )}

                  {task.status === 'uploading' && (
                    <button
                      onClick={() => cancelUpload(task.id)}
                      className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-danger hover:bg-surface-raised transition-colors cursor-pointer"
                      title="Cancel"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Row Progress bar */}
              <div className="w-full h-1 bg-surface-raised rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    task.status === 'completed'
                      ? 'bg-tertiary'
                      : task.status === 'failed'
                      ? 'bg-danger'
                      : 'bg-primary-container'
                  }`}
                  style={{ width: `${task.status === 'completed' ? 100 : task.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
