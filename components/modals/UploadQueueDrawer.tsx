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

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden text-slate-800 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
        <div className="flex items-center gap-2">
          {inProgressCount > 0 ? (
            <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
          ) : (
            <Upload className="h-4 w-4 text-emerald-400" />
          )}
          <span className="text-xs font-semibold">
            {inProgressCount > 0
              ? `Uploading ${inProgressCount} item${inProgressCount > 1 ? 's' : ''}...`
              : 'All uploads completed'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white"
          >
            {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            onClick={clearCompletedUploads}
            className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white"
            title="Clear finished"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Task List */}
      {!collapsed && (
        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 p-2">
          {uploadTasks.map((task) => (
            <div key={task.id} className="p-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-800 truncate max-w-[200px]" title={task.name}>
                  {task.name}
                </span>
                <span className="text-[11px] font-mono tabular-nums text-slate-400">
                  {formatBytes(task.size)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      task.status === 'completed'
                        ? 'bg-emerald-500'
                        : task.status === 'failed'
                        ? 'bg-rose-500'
                        : 'bg-sky-500'
                    }`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>

                <div className="shrink-0 text-[10px] font-medium font-mono tabular-nums">
                  {task.status === 'uploading' && (
                    <span className="text-sky-600">{task.progress}%</span>
                  )}
                  {task.status === 'completed' && (
                    <span className="text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 className="h-3 w-3" /> Done
                    </span>
                  )}
                  {task.status === 'failed' && (
                    <span className="text-rose-600 flex items-center gap-0.5" title={task.error}>
                      <AlertCircle className="h-3 w-3" /> Failed
                    </span>
                  )}
                  {task.status === 'queued' && (
                    <span className="text-slate-400">Queued</span>
                  )}
                </div>

                {task.status === 'uploading' && (
                  <button
                    onClick={() => cancelUpload(task.id)}
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                    title="Cancel"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
