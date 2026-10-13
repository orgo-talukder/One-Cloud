'use client';

import React from 'react';
import type { FolderItem } from '@/lib/drive/types';
import { getFolderIconPath, getFileIconPath } from '@/lib/drive/icon-resolver';

interface ItemIconProps {
  type: 'folder' | 'file';
  folder?: FolderItem | { name: string; isSystem?: boolean; systemType?: string | null };
  fileName?: string;
  mimeType?: string;
  extension?: string;
  className?: string;
  size?: number; // default width/height in px
}

/**
 * A professional vector SVG icon rendered specifically for unrecognized / unknown file types.
 * Styled with crisp isometric/flat gradients and folded corner to match the provided PNG design aesthetic.
 */
export function UnknownFileVectorIcon({ className = 'w-6 h-6', size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-xs select-none ${className}`}
    >
      <defs>
        <linearGradient id="unk_file_body" x1="6" y1="3" x2="26" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#94A3B8" />
          <stop offset="1" stopColor="#64748B" />
        </linearGradient>
        <linearGradient id="unk_file_fold" x1="19" y1="3" x2="26" y2="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#CBD5E1" />
          <stop offset="1" stopColor="#94A3B8" />
        </linearGradient>
      </defs>
      {/* Main Document Body */}
      <path
        d="M7 5C7 3.89543 7.89543 3 9 3H19L26 10V27C26 28.1046 25.1046 29 24 29H9C7.89543 29 7 28.1046 7 27V5Z"
        fill="url(#unk_file_body)"
      />
      {/* Top-Right Folded Dogear Corner */}
      <path
        d="M19 3L26 10H20C19.4477 10 19 9.55228 19 9V3Z"
        fill="url(#unk_file_fold)"
      />
      {/* Document Horizontal Content Stripes */}
      <rect x="10.5" y="14" width="11" height="1.75" rx="0.875" fill="#FFFFFF" fillOpacity="0.85" />
      <rect x="10.5" y="18" width="11" height="1.75" rx="0.875" fill="#FFFFFF" fillOpacity="0.85" />
      <rect x="10.5" y="22" width="7" height="1.75" rx="0.875" fill="#FFFFFF" fillOpacity="0.65" />
    </svg>
  );
}

export function ItemIcon({
  type,
  folder,
  fileName = 'file',
  mimeType,
  extension,
  className = 'w-6 h-6',
  size = 24,
}: ItemIconProps) {
  if (type === 'folder') {
    const iconPath = folder ? getFolderIconPath(folder) : '/icons/folders/normal_folder_icon2.png';
    return (
      <img
        src={iconPath}
        alt={folder?.name || 'Folder'}
        width={size}
        height={size}
        draggable={false}
        className={`object-contain shrink-0 select-none ${className}`}
        loading="lazy"
      />
    );
  }

  // File rendering
  const iconPath = getFileIconPath(fileName, mimeType, extension);

  if (iconPath) {
    return (
      <img
        src={iconPath}
        alt={fileName}
        width={size}
        height={size}
        draggable={false}
        className={`object-contain shrink-0 select-none ${className}`}
        loading="lazy"
      />
    );
  }

  // Unknown file fallback: professional vector icon
  return <UnknownFileVectorIcon className={className} size={size} />;
}
