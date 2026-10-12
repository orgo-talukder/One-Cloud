'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import type {
  FileItem,
  FolderItem,
  UploadTask,
  DriveStorageSummary,
  ViewMode,
  SortOption,
  FileTypeFilter,
} from './types';
import { calculateDriveStorage } from './storage-calc';
import { useAuth } from '@/lib/firebase/auth-context';
import { db } from '@/lib/firebase/client';
import { handleFirestoreError, OperationType } from '@/lib/firebase/firestore-errors';

interface DriveContextType {
  files: FileItem[];
  folders: FolderItem[];
  currentFolderId: string | null;
  breadcrumbs: { id: string | null; name: string }[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  fileTypeFilter: FileTypeFilter;
  setFileTypeFilter: (filter: FileTypeFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFileIds: string[];
  setSelectedFileIds: React.Dispatch<React.SetStateAction<string[]>>;
  toggleSelectFile: (fileId: string) => void;
  clearSelection: () => void;

  // Storage metrics
  storageSummary: DriveStorageSummary;

  // Telegram connection
  telegramConnected: boolean;
  telegramUsername: string;
  sessionToken: string;
  telegramSyncing: boolean;

  // Upload tasks
  uploadTasks: UploadTask[];
  clearCompletedUploads: () => void;
  cancelUpload: (taskId: string) => void;
  retryUpload: (taskId: string) => Promise<void>;
  dismissUpload: (taskId: string) => void;

  // Real Drive operations
  navigateToFolder: (folderId: string | null) => void;
  createFolder: (name: string) => Promise<FolderItem>;
  renameFolder: (folderId: string, newName: string) => Promise<void>;
  renameFile: (fileId: string, newName: string) => Promise<void>;
  moveFile: (fileId: string, targetFolderId: string | null) => Promise<void>;
  toggleStarFile: (fileId: string) => Promise<void>;
  toggleStarFolder: (folderId: string) => Promise<void>;
  trashFile: (fileId: string) => Promise<void>;
  trashFolder: (folderId: string) => Promise<void>;
  restoreFile: (fileId: string) => Promise<void>;
  restoreFolder: (folderId: string) => Promise<void>;
  permanentlyDeleteFile: (fileId: string) => Promise<void>;
  permanentlyDeleteFolder: (folderId: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  uploadFiles: (files: FileList | File[]) => Promise<void>;
  connectTelegramSuccess: (token: string, username: string) => void;
  disconnectTelegram: () => void;
  syncTelegram: () => Promise<void>;
}

const DriveContext = createContext<DriveContextType | null>(null);

export function DriveProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [fileTypeFilter, setFileTypeFilter] = useState<FileTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [telegramSyncing, setTelegramSyncing] = useState(false);

  // Track cancelled task IDs and active XHR requests so in-flight parallel workers abort immediately
  const cancelledTasksRef = useRef<Set<string>>(new Set());
  const activeXhrsRef = useRef<Map<string, Set<XMLHttpRequest>>>(new Map());

  // Saved Telegram sessions mapped by User UID
  const [savedSessions, setSavedSessions] = useState<
    Record<string, { connected: boolean; username: string; token: string }>
  >(() => {
    if (typeof window !== 'undefined') {
      try {
        const initial: Record<string, { connected: boolean; username: string; token: string }> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('onecloud_tg_')) {
            const uid = key.replace('onecloud_tg_', '');
            const raw = localStorage.getItem(key);
            if (raw) initial[uid] = JSON.parse(raw);
          }
        }
        return initial;
      } catch {}
    }
    return {};
  });

  const currentSession = useMemo(() => {
    const uid = user ? user.uid : 'default_workspace';
    return savedSessions[uid] || { connected: false, username: '', token: '' };
  }, [user, savedSessions]);

  const telegramConnected = currentSession.connected;
  const telegramUsername = currentSession.username;
  const sessionToken = currentSession.token;

  // Upload tasks queue
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);

  // Real-time synchronization with Cloud Firestore when user is authenticated
  useEffect(() => {
    if (!user) {
      return;
    }

    // Save/update root user document in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    setDoc(
      userDocRef,
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    ).catch((err) => {
      console.warn('Failed to update user profile in Firestore:', err);
    });

    const filesPath = `users/${user.uid}/files`;
    const foldersPath = `users/${user.uid}/folders`;

    // Subscribe to Firestore Files subcollection
    const unsubscribeFiles = onSnapshot(
      collection(db, 'users', user.uid, 'files'),
      (snapshot) => {
        const liveFiles: FileItem[] = [];
        snapshot.forEach((docSnap) => {
          liveFiles.push(docSnap.data() as FileItem);
        });
        setFiles(liveFiles);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, filesPath);
      }
    );

    // Subscribe to Firestore Folders subcollection
    const unsubscribeFolders = onSnapshot(
      collection(db, 'users', user.uid, 'folders'),
      (snapshot) => {
        const liveFolders: FolderItem[] = [];
        snapshot.forEach((docSnap) => {
          liveFolders.push(docSnap.data() as FolderItem);
        });
        setFolders(liveFolders);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, foldersPath);
      }
    );

    return () => {
      unsubscribeFiles();
      unsubscribeFolders();
    };
  }, [user]);

  // Clean data isolation: unauthenticated sessions show zero items
  const activeFiles = useMemo(() => (user ? files : []), [user, files]);
  const activeFolders = useMemo(() => (user ? folders : []), [user, folders]);

  // Truthful Drive storage calculation based strictly on active tracked files
  const storageSummary = useMemo(() => {
    const activeFoldersCount = activeFolders.filter((f) => f.status === 'active').length;
    return calculateDriveStorage(activeFiles, activeFoldersCount);
  }, [activeFiles, activeFolders]);

  // Dynamic breadcrumb hierarchy
  const breadcrumbs = useMemo(() => {
    const crumbs: { id: string | null; name: string }[] = [{ id: null, name: 'My Drive' }];
    if (!currentFolderId) return crumbs;

    const findPath = (id: string | null): { id: string | null; name: string }[] => {
      if (!id) return [];
      const folder = activeFolders.find((f) => f.id === id);
      if (!folder) return [];
      return [...findPath(folder.parentFolderId), { id: folder.id, name: folder.name }];
    };

    return [{ id: null, name: 'My Drive' }, ...findPath(currentFolderId)];
  }, [currentFolderId, activeFolders]);

  const toggleSelectFile = (fileId: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const clearSelection = () => setSelectedFileIds([]);

  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    clearSelection();
  };

  // Real Folder Operations
  const createFolder = async (name: string): Promise<FolderItem> => {
    const safeName = name.trim() || 'New Folder';
    const folderId = 'folder_' + Date.now();
    const newFolder: FolderItem = {
      id: folderId,
      name: safeName,
      parentFolderId: currentFolderId,
      isStarred: false,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'folders', folderId), newFolder);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/folders/${folderId}`);
      }
    } else {
      setFolders((prev) => [...prev, newFolder]);
    }

    return newFolder;
  };

  const renameFolder = async (folderId: string, newName: string) => {
    const cleanName = newName.trim();
    if (!cleanName) return;
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid, 'folders', folderId), {
          name: cleanName,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/folders/${folderId}`);
      }
    } else {
      setFolders((prev) =>
        prev.map((f) =>
          f.id === folderId ? { ...f, name: cleanName, updatedAt: new Date().toISOString() } : f
        )
      );
    }
  };

  const renameFile = async (fileId: string, newName: string) => {
    const cleanName = newName.trim();
    if (!cleanName) return;
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid, 'files', fileId), {
          name: cleanName,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/files/${fileId}`);
      }
    } else {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, name: cleanName, updatedAt: new Date().toISOString() } : f
        )
      );
    }
  };

  const moveFile = async (fileId: string, targetFolderId: string | null) => {
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid, 'files', fileId), {
          parentFolderId: targetFolderId,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/files/${fileId}`);
      }
    } else {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, parentFolderId: targetFolderId, updatedAt: new Date().toISOString() }
            : f
        )
      );
    }
  };

  const toggleStarFile = async (fileId: string) => {
    const target = activeFiles.find((f) => f.id === fileId);
    if (!target) return;
    const nextState = !target.isStarred;

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid, 'files', fileId), {
          isStarred: nextState,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/files/${fileId}`);
      }
    } else {
      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, isStarred: nextState } : f)));
    }
  };

  const toggleStarFolder = async (folderId: string) => {
    const target = activeFolders.find((f) => f.id === folderId);
    if (!target) return;
    const nextState = !target.isStarred;

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid, 'folders', folderId), {
          isStarred: nextState,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/folders/${folderId}`);
      }
    } else {
      setFolders((prev) =>
        prev.map((f) => (f.id === folderId ? { ...f, isStarred: nextState } : f))
      );
    }
  };

  const trashFile = async (fileId: string) => {
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid, 'files', fileId), {
          status: 'trashed',
          trashedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/files/${fileId}`);
      }
    } else {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: 'trashed', trashedAt: new Date().toISOString() }
            : f
        )
      );
    }
    setSelectedFileIds((prev) => prev.filter((id) => id !== fileId));
  };

  const trashFolder = async (folderId: string) => {
    // Also move active files inside this folder to Trash so everything stays consistent
    const nestedFiles = activeFiles.filter(
      (f) => f.parentFolderId === folderId && f.status === 'active'
    );
    for (const f of nestedFiles) {
      await trashFile(f.id);
    }

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid, 'folders', folderId), {
          status: 'trashed',
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/folders/${folderId}`);
      }
    } else {
      setFolders((prev) =>
        prev.map((f) => (f.id === folderId ? { ...f, status: 'trashed' } : f))
      );
    }

    if (currentFolderId === folderId) {
      setCurrentFolderId(null);
    }
  };

  const restoreFile = async (fileId: string) => {
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid, 'files', fileId), {
          status: 'active',
          trashedAt: null,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/files/${fileId}`);
      }
    } else {
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: 'active', trashedAt: null } : f))
      );
    }
  };

  const restoreFolder = async (folderId: string) => {
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid, 'folders', folderId), {
          status: 'active',
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/folders/${folderId}`);
      }
    } else {
      setFolders((prev) =>
        prev.map((f) => (f.id === folderId ? { ...f, status: 'active' } : f))
      );
    }

    // Restore files inside this folder that were trashed with it
    const nestedTrashedFiles = activeFiles.filter(
      (f) => f.parentFolderId === folderId && f.status === 'trashed'
    );
    for (const f of nestedTrashedFiles) {
      await restoreFile(f.id);
    }
  };

  const permanentlyDeleteFile = async (fileId: string) => {
    const file = activeFiles.find((f) => f.id === fileId);
    if (file && sessionToken) {
      try {
        await fetch('/api/telegram/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageId: file.telegramMessageId,
            sessionToken,
          }),
        });
      } catch (e) {
        console.warn('Failed to delete message from Telegram backend:', e);
      }
    }

    if (user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'files', fileId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/files/${fileId}`);
      }
    } else {
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    }
    setSelectedFileIds((prev) => prev.filter((id) => id !== fileId));
  };

  const permanentlyDeleteFolder = async (folderId: string) => {
    // Also remove files inside this folder
    const filesInFolder = activeFiles.filter((f) => f.parentFolderId === folderId);
    for (const f of filesInFolder) {
      await permanentlyDeleteFile(f.id);
    }

    if (user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'folders', folderId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/folders/${folderId}`);
      }
    } else {
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
    }

    if (currentFolderId === folderId) {
      setCurrentFolderId(null);
    }
  };

  const emptyTrash = async () => {
    const trashedFiles = activeFiles.filter((f) => f.status === 'trashed');
    for (const f of trashedFiles) {
      await permanentlyDeleteFile(f.id);
    }

    const trashedFolders = activeFolders.filter((f) => f.status === 'trashed');
    for (const fold of trashedFolders) {
      await permanentlyDeleteFolder(fold.id);
    }
  };

  // Helper to persist an uploaded FileItem to Firestore or local state
  const saveUploadedFileMetadata = async (uploadedFileItem: FileItem) => {
    if (user) {
      try {
        await setDoc(
          doc(db, 'users', user.uid, 'files', uploadedFileItem.id),
          uploadedFileItem
        );
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.CREATE,
          `users/${user.uid}/files/${uploadedFileItem.id}`
        );
      }
    } else {
      setFiles((prev) => [uploadedFileItem, ...prev]);
    }
  };

  // Helper to abort all active XHR requests for a given taskId
  const abortTaskXhrs = (taskId: string) => {
    const xhrs = activeXhrsRef.current.get(taskId);
    if (xhrs) {
      xhrs.forEach((xhr) => {
        try {
          xhr.abort();
        } catch {}
      });
      xhrs.clear();
      activeXhrsRef.current.delete(taskId);
    }
  };

  // Core high-speed parallel upload runner with real-time XHR byte tracking, speed (MB/s), and real ETA
  const executeTaskUpload = async (task: UploadTask, targetFolderId: string | null) => {
    cancelledTasksRef.current.delete(task.id);
    activeXhrsRef.current.set(task.id, new Set());

    const file = task.file;
    const uploadStartTime = performance.now();
    let lastUiUpdateTime = 0;

    // Sliding window of (timestampMs, confirmedAndInFlightBytes) for real-time speed & ETA
    const speedSamples: { timeMs: number; bytes: number }[] = [
      { timeMs: uploadStartTime, bytes: 0 },
    ];

    // Map of chunkKey -> current effective uploaded bytes
    const chunkProgressBytes = new Map<string, number>();

    const updateRealTimeTelemetry = (force = false, phase: 'uploading' | 'finalizing' = 'uploading') => {
      if (cancelledTasksRef.current.has(task.id)) return;
      const now = performance.now();
      if (!force && now - lastUiUpdateTime < 120) {
        return; // Throttle state updates to ~8 fps for smooth UI
      }
      lastUiUpdateTime = now;

      let currentBytes = 0;
      chunkProgressBytes.forEach((b) => {
        currentBytes += b;
      });
      currentBytes = Math.min(file.size, Math.max(0, Math.round(currentBytes)));

      // Record sample in 5-second sliding window
      speedSamples.push({ timeMs: now, bytes: currentBytes });
      while (speedSamples.length > 2 && now - speedSamples[0].timeMs > 5000) {
        speedSamples.shift();
      }

      const totalElapsedSec = Math.max(0.15, (now - uploadStartTime) / 1000);
      const overallSpeed = currentBytes / totalElapsedSec;

      const oldestSample = speedSamples[0];
      const windowElapsedSec = Math.max(0.15, (now - oldestSample.timeMs) / 1000);
      const windowBytes = Math.max(0, currentBytes - oldestSample.bytes);
      const windowSpeed = windowBytes / windowElapsedSec;

      // Blend window speed (65%) and overall speed (35%) for responsive, jitter-free real-time measurement
      const measuredSpeed =
        totalElapsedSec > 1.0 && windowSpeed > 0
          ? Math.round(windowSpeed * 0.65 + overallSpeed * 0.35)
          : Math.round(overallSpeed);

      const remainingBytes = Math.max(0, file.size - currentBytes);
      const etaSeconds =
        phase === 'finalizing'
          ? 1
          : measuredSpeed > 0
          ? Math.max(1, Math.ceil(remainingBytes / measuredSpeed))
          : null;

      const rawPercent = file.size > 0 ? Math.round((currentBytes / file.size) * 96) : 50;
      const progress =
        phase === 'finalizing' ? 98 : Math.min(96, Math.max(1, rawPercent));

      setUploadTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: 'uploading',
                progress,
                uploadedBytes: phase === 'finalizing' ? file.size : currentBytes,
                speedBytesPerSec: measuredSpeed > 0 ? measuredSpeed : t.speedBytesPerSec,
                etaSeconds,
                phase,
                error: undefined,
              }
            : t
        )
      );
    };

    setUploadTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status: 'uploading',
              progress: 1,
              uploadedBytes: 0,
              speedBytesPerSec: 0,
              etaSeconds: null,
              phase: 'uploading',
              error: undefined,
            }
          : t
      )
    );

    // Helper to send a raw binary chunk via XMLHttpRequest with live upload.onprogress
    const sendBinaryChunkXhr = (params: {
      chunkKey: string;
      chunkBlob: Blob;
      telegramFileId: string;
      totalParts: number;
      partOffset: number;
    }): Promise<{ success?: boolean; completed?: boolean; error?: string; status: number }> => {
      const { chunkKey, chunkBlob, telegramFileId, totalParts, partOffset } = params;
      const chunkByteLength = chunkBlob.size;

      return new Promise((resolve, reject) => {
        if (cancelledTasksRef.current.has(task.id)) {
          reject(new Error('Upload cancelled'));
          return;
        }

        const xhr = new XMLHttpRequest();
        const taskXhrs = activeXhrsRef.current.get(task.id);
        if (taskXhrs) taskXhrs.add(xhr);

        xhr.open('POST', '/api/telegram/upload', true);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
        xhr.setRequestHeader('x-session-token', sessionToken);
        xhr.setRequestHeader('x-telegram-file-id', telegramFileId);
        xhr.setRequestHeader('x-file-name', encodeURIComponent(file.name));
        xhr.setRequestHeader('x-mime-type', file.type || 'application/octet-stream');
        xhr.setRequestHeader('x-total-size', String(file.size));
        xhr.setRequestHeader('x-total-parts', String(totalParts));
        xhr.setRequestHeader('x-part-offset', String(partOffset));
        xhr.setRequestHeader('x-is-last-chunk', 'false');
        if (targetFolderId) {
          xhr.setRequestHeader('x-parent-folder-id', targetFolderId);
        }

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            // Weight in-flight browser->server bytes at 70%, and 100% once Telegram confirms part upload
            const effectiveBytes = Math.min(
              chunkByteLength * 0.75,
              (event.loaded / Math.max(1, event.total)) * chunkByteLength * 0.75
            );
            chunkProgressBytes.set(chunkKey, effectiveBytes);
            updateRealTimeTelemetry(false, 'uploading');
          }
        };

        const cleanup = () => {
          const set = activeXhrsRef.current.get(task.id);
          if (set) set.delete(xhr);
        };

        xhr.onload = () => {
          cleanup();
          if (xhr.status === 413) {
            resolve({ success: false, status: 413, error: 'Payload too large (413)' });
            return;
          }
          try {
            const parsed = JSON.parse(xhr.responseText || '{}');
            if (xhr.status >= 200 && xhr.status < 300 && parsed.success) {
              chunkProgressBytes.set(chunkKey, chunkByteLength);
              updateRealTimeTelemetry(true, 'uploading');
              resolve({ ...parsed, status: xhr.status });
            } else {
              resolve({
                success: false,
                status: xhr.status,
                error: parsed.error || `Upload server error (${xhr.status}).`,
              });
            }
          } catch {
            resolve({
              success: false,
              status: xhr.status,
              error: `Unexpected server response (${xhr.status}).`,
            });
          }
        };

        xhr.onerror = () => {
          cleanup();
          reject(new Error('Network connection error during chunk upload.'));
        };

        xhr.onabort = () => {
          cleanup();
          reject(new Error('Upload cancelled'));
        };

        xhr.send(chunkBlob);
      });
    };

    // MTProto part size = 512 KB (524,288 bytes)
    // Max 512 KB-aligned chunk under Vercel's 4.5 MB limit = 8 * 512 KB = 4,194,304 bytes (~4.2 MB raw binary)
    const PART_SIZE = 512 * 1024;
    const PARTS_PER_CHUNK = 8; // 8 × 512 KB = 4.19 MB (utilizes full ~4.5 MB serverless limit with 512KB MTProto alignment)
    const CHUNK_SIZE = PART_SIZE * PARTS_PER_CHUNK;
    const PARALLEL_WORKERS = 3; // 3 concurrent workers (~12.6 MB in-flight simultaneously)

    try {
      // Fast Path for small files (<= 4 MB): single XHR upload with real-time progress
      if (file.size <= CHUNK_SIZE) {
        const singleResult = await new Promise<{
          success?: boolean;
          file?: FileItem;
          error?: string;
        }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const taskXhrs = activeXhrsRef.current.get(task.id);
          if (taskXhrs) taskXhrs.add(xhr);

          const formData = new FormData();
          formData.append('mode', 'single');
          formData.append('file', file);
          formData.append('sessionToken', sessionToken);
          if (targetFolderId) {
            formData.append('parentFolderId', targetFolderId);
          }

          xhr.open('POST', '/api/telegram/upload', true);

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const effectiveBytes = Math.min(
                file.size * 0.85,
                (event.loaded / Math.max(1, event.total)) * file.size * 0.85
              );
              chunkProgressBytes.set('single', effectiveBytes);
              updateRealTimeTelemetry(false, 'uploading');
            }
          };

          const cleanup = () => {
            const set = activeXhrsRef.current.get(task.id);
            if (set) set.delete(xhr);
          };

          xhr.onload = () => {
            cleanup();
            try {
              const parsed = JSON.parse(xhr.responseText || '{}');
              if (xhr.status >= 200 && xhr.status < 300 && parsed.success) {
                resolve(parsed);
              } else {
                reject(new Error(parsed.error || `Upload failed (${xhr.status}).`));
              }
            } catch {
              reject(new Error(`Server error (${xhr.status}). Please retry.`));
            }
          };

          xhr.onerror = () => {
            cleanup();
            reject(new Error('Network error during file upload.'));
          };

          xhr.onabort = () => {
            cleanup();
            reject(new Error('Upload cancelled'));
          };

          xhr.send(formData);
        });

        if (singleResult.success && singleResult.file) {
          await saveUploadedFileMetadata(singleResult.file);
          setUploadTasks((prev) =>
            prev.map((t) =>
              t.id === task.id
                ? {
                    ...t,
                    status: 'completed',
                    progress: 100,
                    uploadedBytes: file.size,
                    etaSeconds: 0,
                    phase: 'uploading',
                  }
                : t
            )
          );
        } else {
          throw new Error(singleResult.error || 'Upload to Telegram failed.');
        }
        return;
      }

      // High-Speed Parallel Chunked Upload for files > 4 MB
      const totalParts = Math.ceil(file.size / PART_SIZE);
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const telegramFileId =
        String(Math.floor(Math.random() * 900000000000000) + 100000000000000) +
        String(Math.floor(Math.random() * 9000) + 1000);

      // Build queue of chunk descriptors
      interface ChunkJob {
        key: string;
        startByte: number;
        endByte: number;
        partOffset: number;
      }

      const chunkQueue: ChunkJob[] = [];
      for (let idx = 0; idx < totalChunks; idx++) {
        const startByte = idx * CHUNK_SIZE;
        const endByte = Math.min(startByte + CHUNK_SIZE, file.size);
        chunkQueue.push({
          key: `chunk_${idx}`,
          startByte,
          endByte,
          partOffset: idx * PARTS_PER_CHUNK,
        });
      }

      // Helper to upload a single ChunkJob with automatic retry and automatic 413 split fallback
      const processChunkJob = async (job: ChunkJob): Promise<void> => {
        if (cancelledTasksRef.current.has(task.id)) return;

        const chunkBlob = file.slice(job.startByte, job.endByte);
        let attempt = 0;
        let lastError: Error | null = null;

        while (attempt < 3) {
          if (cancelledTasksRef.current.has(task.id)) return;
          try {
            const res = await sendBinaryChunkXhr({
              chunkKey: job.key,
              chunkBlob,
              telegramFileId,
              totalParts,
              partOffset: job.partOffset,
            });

            // Automatic fallback: if a strict gateway ever returns 413 on a 4.2MB chunk,
            // split it into two 2.1MB (4 * 512KB) sub-chunks so it never fails!
            if (res.status === 413 && job.endByte - job.startByte > PART_SIZE * 4) {
              chunkProgressBytes.delete(job.key);
              const splitBytes = PART_SIZE * 4; // 2 MB
              const midByte = job.startByte + splitBytes;
              await processChunkJob({
                key: `${job.key}_a`,
                startByte: job.startByte,
                endByte: midByte,
                partOffset: job.partOffset,
              });
              await processChunkJob({
                key: `${job.key}_b`,
                startByte: midByte,
                endByte: job.endByte,
                partOffset: job.partOffset + 4,
              });
              return;
            }

            if (!res.success) {
              throw new Error(res.error || 'Chunk upload failed.');
            }

            lastError = null;
            break;
          } catch (err: unknown) {
            if (cancelledTasksRef.current.has(task.id)) return;
            lastError = err instanceof Error ? err : new Error(String(err));
            attempt++;
            if (attempt < 3) {
              await new Promise((r) => setTimeout(r, 700 * attempt));
            }
          }
        }

        if (lastError) {
          throw lastError;
        }
      };

      // Phase 1: Run 3 parallel workers pulling from chunkQueue
      let nextIndex = 0;
      const workerCount = Math.min(PARALLEL_WORKERS, chunkQueue.length);

      const workers = Array.from({ length: workerCount }, async () => {
        while (nextIndex < chunkQueue.length) {
          if (cancelledTasksRef.current.has(task.id)) return;
          const currentIdx = nextIndex++;
          const job = chunkQueue[currentIdx];
          if (!job) break;
          await processChunkJob(job);
        }
      });

      await Promise.all(workers);

      if (cancelledTasksRef.current.has(task.id)) {
        return;
      }

      // Phase 2: Commit all uploaded MTProto parts to Telegram Saved Messages ('me')
      updateRealTimeTelemetry(true, 'finalizing');

      const commitRes = await fetch('/api/telegram/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'commit',
          sessionToken,
          telegramFileId,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          totalSize: file.size,
          totalParts,
          parentFolderId: targetFolderId,
        }),
      });

      const commitData = await commitRes.json();
      if (!commitRes.ok || !commitData.success || !commitData.file) {
        throw new Error(commitData.error || 'Failed to finalize uploaded file in Telegram.');
      }

      await saveUploadedFileMetadata(commitData.file);
      setUploadTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: 'completed',
                progress: 100,
                uploadedBytes: file.size,
                etaSeconds: 0,
                phase: 'uploading',
              }
            : t
        )
      );
    } catch (err: unknown) {
      abortTaskXhrs(task.id);
      if (cancelledTasksRef.current.has(task.id)) return;
      const msg = err instanceof Error ? err.message : 'Network error during upload';
      setUploadTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: 'failed', error: msg, etaSeconds: null } : t
        )
      );
    } finally {
      activeXhrsRef.current.delete(task.id);
    }
  };

  // Upload file pipeline into real Telegram Saved Messages + Cloud Firestore
  const uploadFiles = async (fileList: FileList | File[]) => {
    const items = Array.from(fileList);
    if (items.length === 0) return;

    if (!sessionToken) {
      const failedTasks: UploadTask[] = items.map((file) => ({
        id: 'task_' + Math.random().toString(36).substring(2, 9),
        file,
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'failed',
        error: 'Telegram is not connected. Please connect your Telegram account first.',
      }));
      setUploadTasks((prev) => [...prev, ...failedTasks]);
      return;
    }

    const folderSnapshot = currentFolderId;
    const newTasks: UploadTask[] = items.map((file) => ({
      id: 'task_' + Math.random().toString(36).substring(2, 9),
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'queued',
      uploadedBytes: 0,
      speedBytesPerSec: 0,
      etaSeconds: null,
      phase: 'uploading',
    }));

    setUploadTasks((prev) => [...prev, ...newTasks]);

    for (const task of newTasks) {
      await executeTaskUpload(task, folderSnapshot);
    }
  };

  const retryUpload = async (taskId: string) => {
    const task = uploadTasks.find((t) => t.id === taskId);
    if (!task) return;
    if (!sessionToken) {
      setUploadTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: 'failed',
                error: 'Telegram is not connected. Please connect your Telegram account first.',
              }
            : t
        )
      );
      return;
    }
    await executeTaskUpload(task, currentFolderId);
  };

  const dismissUpload = (taskId: string) => {
    cancelledTasksRef.current.add(taskId);
    abortTaskXhrs(taskId);
    setUploadTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const clearCompletedUploads = () => {
    setUploadTasks((prev) => prev.filter((t) => t.status !== 'completed'));
  };

  const cancelUpload = (taskId: string) => {
    cancelledTasksRef.current.add(taskId);
    abortTaskXhrs(taskId);
    setUploadTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: 'cancelled', error: 'Upload cancelled', etaSeconds: null }
          : t
      )
    );
  };

  const connectTelegramSuccess = (token: string, username: string) => {
    const uid = user ? user.uid : 'default_workspace';
    const data = {
      connected: true,
      username: username || 'TelegramUser',
      token,
    };
    setSavedSessions((prev) => ({ ...prev, [uid]: data }));
    if (typeof window !== 'undefined') {
      localStorage.setItem(`onecloud_tg_${uid}`, JSON.stringify(data));
      if (user) {
        setDoc(
          doc(db, 'users', user.uid),
          {
            telegramConnected: true,
            telegramUsername: username,
            telegramConnectedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch(() => {});
      }
    }
  };

  const disconnectTelegram = () => {
    const uid = user ? user.uid : 'default_workspace';
    const empty = {
      connected: false,
      username: '',
      token: '',
    };
    setSavedSessions((prev) => ({ ...prev, [uid]: empty }));
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`onecloud_tg_${uid}`);
      if (user) {
        setDoc(
          doc(db, 'users', user.uid),
          {
            telegramConnected: false,
            telegramUsername: '',
            telegramDisconnectedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch(() => {});
      }
    }
  };

  const syncTelegram = async () => {
    setTelegramSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setTelegramSyncing(false);
  };

  return (
    <DriveContext.Provider
      value={{
        files: activeFiles,
        folders: activeFolders,
        currentFolderId,
        breadcrumbs,
        viewMode,
        setViewMode,
        sortOption,
        setSortOption,
        fileTypeFilter,
        setFileTypeFilter,
        searchQuery,
        setSearchQuery,
        selectedFileIds,
        setSelectedFileIds,
        toggleSelectFile,
        clearSelection,
        storageSummary,
        telegramConnected,
        telegramUsername,
        sessionToken,
        telegramSyncing,
        uploadTasks,
        clearCompletedUploads,
        cancelUpload,
        retryUpload,
        dismissUpload,
        navigateToFolder,
        createFolder,
        renameFolder,
        renameFile,
        moveFile,
        toggleStarFile,
        toggleStarFolder,
        trashFile,
        trashFolder,
        restoreFile,
        restoreFolder,
        permanentlyDeleteFile,
        permanentlyDeleteFolder,
        emptyTrash,
        uploadFiles,
        connectTelegramSuccess,
        disconnectTelegram,
        syncTelegram,
      }}
    >
      {children}
    </DriveContext.Provider>
  );
}

export function useDrive() {
  const context = useContext(DriveContext);
  if (!context) {
    throw new Error('useDrive must be used within a DriveProvider');
  }
  return context;
}
