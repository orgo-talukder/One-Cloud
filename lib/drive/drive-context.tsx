'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
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
  isSandboxTelegram: boolean;
  sessionToken: string;
  telegramSyncing: boolean;

  // Upload tasks
  uploadTasks: UploadTask[];
  clearCompletedUploads: () => void;
  cancelUpload: (taskId: string) => void;

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
  connectTelegramSuccess: (token: string, username: string, isSandbox: boolean) => void;
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

  // Consolidated Telegram session with lazy initializer to avoid effect setState
  const [tgSession, setTgSession] = useState<{
    connected: boolean;
    username: string;
    isSandbox: boolean;
    token: string;
  }>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('onecloud_active_tg');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {
      connected: false,
      username: '',
      isSandbox: true,
      token: '',
    };
  });

  const telegramConnected = tgSession.connected;
  const telegramUsername = tgSession.username;
  const isSandboxTelegram = tgSession.isSandbox;
  const sessionToken = tgSession.token;

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
  };

  const permanentlyDeleteFile = async (fileId: string) => {
    const file = activeFiles.find((f) => f.id === fileId);
    if (file) {
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

  // Upload file pipeline into Telegram Saved Messages + Cloud Firestore
  const uploadFiles = async (fileList: FileList | File[]) => {
    const items = Array.from(fileList);
    if (items.length === 0) return;

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
      setUploadTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: 'uploading', progress: 20 } : t))
      );

      try {
        const formData = new FormData();
        formData.append('file', task.file);
        formData.append('sessionToken', sessionToken);
        if (currentFolderId) {
          formData.append('parentFolderId', currentFolderId);
        }

        setUploadTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, progress: 65 } : t))
        );

        const res = await fetch('/api/telegram/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (data.success && data.file) {
          const uploadedFileItem: FileItem = data.file;

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

          setUploadTasks((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, status: 'completed', progress: 100 } : t))
          );
        } else {
          setUploadTasks((prev) =>
            prev.map((t) =>
              t.id === task.id ? { ...t, status: 'failed', error: data.error || 'Upload failed' } : t
            )
          );
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Network error during upload';
        setUploadTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: 'failed', error: msg } : t))
        );
      }
    }
  };

  const clearCompletedUploads = () => {
    setUploadTasks((prev) => prev.filter((t) => t.status !== 'completed'));
  };

  const cancelUpload = (taskId: string) => {
    setUploadTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'cancelled' } : t))
    );
  };

  const connectTelegramSuccess = (token: string, username: string, isSandbox: boolean) => {
    const data = {
      connected: true,
      username: username || 'ConnectedUser',
      isSandbox,
      token,
    };
    setTgSession(data);
    if (typeof window !== 'undefined') {
      localStorage.setItem('onecloud_active_tg', JSON.stringify(data));
    }
  };

  const disconnectTelegram = () => {
    const data = {
      connected: false,
      username: '',
      isSandbox: true,
      token: '',
    };
    setTgSession(data);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('onecloud_active_tg');
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
        isSandboxTelegram,
        sessionToken,
        telegramSyncing,
        uploadTasks,
        clearCompletedUploads,
        cancelUpload,
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
