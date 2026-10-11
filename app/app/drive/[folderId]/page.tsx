'use client';

import React, { useEffect, use } from 'react';
import { useDrive } from '@/lib/drive/drive-context';
import MyDrivePage from '../page';

export default function NestedFolderPage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = use(params);
  const { navigateToFolder, currentFolderId } = useDrive();

  useEffect(() => {
    if (folderId && currentFolderId !== folderId) {
      navigateToFolder(folderId);
    }
  }, [folderId, currentFolderId, navigateToFolder]);

  return <MyDrivePage />;
}
