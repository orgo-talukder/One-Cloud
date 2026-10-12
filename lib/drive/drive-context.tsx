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

  // Track cancelled task IDs so in-flight chunk loops abort immediately
  const cancelledTasksRef = useRef<Set<string>>(new Set());

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

  // Core upload runner for a single task (supports 2MB chunked MTProto uploads for large files)
  const executeTaskUpload = async (task: UploadTask, targetFolderId: string | null) => {
    cancelledTasksRef.current.delete(task.id);

    setUploadTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, status: 'uploading', progress: 5, error: undefined } : t
      )
    );

    const PART_SIZE = 512 * 1024; // 512 KB MTProto part size
    const PARTS_PER_CHUNK = 4; // 4 * 512 KB = 2 MB per HTTP request (well below Vercel's 4.5 MB limit)
    const CHUNK_SIZE = PART_SIZE * PARTS_PER_CHUNK; // 2,097,152 bytes (2 MB)

    try {
      const file = task.file;

      // Small files (<= 2 MB): fast single-request upload
      if (file.size <= CHUNK_SIZE) {
        const formData = new FormData();
        formData.append('mode', 'single');
        formData.append('file', file);
        formData.append('sessionToken', sessionToken);
        if (targetFolderId) {
          formData.append('parentFolderId', targetFolderId);
        }

        setUploadTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, progress: 45 } : t))
        );

        const res = await fetch('/api/telegram/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.status === 413) {
          throw new Error('File chunk exceeded serverless payload limit (413).');
        }

        const rawText = await res.text();
        let data: { success?: boolean; file?: FileItem; error?: string };
        try {
          data = JSON.parse(rawText);
        } catch {
          throw new Error(
            res.ok
              ? 'Unexpected response from upload server.'
              : `Upload server error (${res.status}). Please retry.`
          );
        }

        if (data.success && data.file) {
          await saveUploadedFileMetadata(data.file);
          setUploadTasks((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, status: 'completed', progress: 100 } : t))
          );
        } else {
          throw new Error(data.error || 'Upload to Telegram failed.');
        }
        return;
      }

      // Large files (> 2 MB, e.g. 13.9 MB+): 2 MB chunked MTProto upload
      const totalParts = Math.ceil(file.size / PART_SIZE);
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const telegramFileId =
        String(Math.floor(Math.random() * 900000000000000) + 100000000000000) +
        String(Math.floor(Math.random() * 9000) + 1000);

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        if (cancelledTasksRef.current.has(task.id)) {
          return;
        }

        const startByte = chunkIndex * CHUNK_SIZE;
        const endByte = Math.min(startByte + CHUNK_SIZE, file.size);
        const chunkBlob = file.slice(startByte, endByte);
        const partOffset = chunkIndex * PARTS_PER_CHUNK;
        const isLastChunk = chunkIndex === totalChunks - 1;

        let attempt = 0;
        let lastError: Error | null = null;
        let chunkData: {
          success?: boolean;
          completed?: boolean;
          file?: FileItem;
          error?: string;
        } | null = null;

        while (attempt < 3) {
          try {
            const formData = new FormData();
            formData.append('mode', 'chunk');
            formData.append('chunk', chunkBlob, file.name);
            formData.append('sessionToken', sessionToken);
            formData.append('telegramFileId', telegramFileId);
            formData.append('fileName', file.name);
            formData.append('mimeType', file.type || 'application/octet-stream');
            formData.append('totalSize', String(file.size));
            formData.append('totalParts', String(totalParts));
            formData.append('partOffset', String(partOffset));
            formData.append('isLastChunk', isLastChunk ? 'true' : 'false');
            if (targetFolderId) {
              formData.append('parentFolderId', targetFolderId);
            }

            const res = await fetch('/api/telegram/upload', {
              method: 'POST',
              body: formData,
            });

            if (res.status === 413) {
              throw new Error('Chunk payload too large for serverless function (413).');
            }

            const rawText = await res.text();
            let parsed: {
              success?: boolean;
              completed?: boolean;
              file?: FileItem;
              error?: string;
            };
            try {
              parsed = JSON.parse(rawText);
            } catch {
              throw new Error(`Server returned invalid response (${res.status}).`);
            }

            if (!res.ok || !parsed.success) {
              throw new Error(parsed.error || `Chunk ${chunkIndex + 1}/${totalChunks} failed.`);
            }

            chunkData = parsed;
            lastError = null;
            break;
          } catch (err: unknown) {
            lastError = err instanceof Error ? err : new Error(String(err));
            attempt++;
            if (attempt < 3) {
              await new Promise((r) => setTimeout(r, 800 * attempt));
            }
          }
        }

        if (lastError || !chunkData) {
          throw lastError || new Error('Failed to upload file chunk.');
        }

        if (cancelledTasksRef.current.has(task.id)) {
          return;
        }

        if (isLastChunk && chunkData.completed && chunkData.file) {
          await saveUploadedFileMetadata(chunkData.file);
          setUploadTasks((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, status: 'completed', progress: 100 } : t))
          );
        } else {
          const pct = Math.min(95, Math.max(10, Math.round(((chunkIndex + 1) / totalChunks) * 95)));
          setUploadTasks((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, progress: pct } : t))
          );
        }
      }
    } catch (err: unknown) {
      if (cancelledTasksRef.current.has(task.id)) return;
      const msg = err instanceof Error ? err.message : 'Network error during upload';
      setUploadTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: 'failed', error: msg } : t))
      );
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
    setUploadTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const clearCompletedUploads = () => {
    setUploadTasks((prev) => prev.filter((t) => t.status !== 'completed'));
  };

  const cancelUpload = (taskId: string) => {
    cancelledTasksRef.current.add(taskId);
    setUploadTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: 'cancelled', error: 'Upload cancelled' } : t
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
