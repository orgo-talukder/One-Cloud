'use client';

import React from 'react';
import {
  LayoutGrid,
  List,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Home,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import type { SortOption, FileTypeFilter } from '@/lib/drive/types';

export function Toolbar() {
  const {
    breadcrumbs,
    navigateToFolder,
    viewMode,
    setViewMode,
    sortOption,
    setSortOption,
    fileTypeFilter,
    setFileTypeFilter,
  } = useDrive();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-6 border-b border-border bg-canvas text-text-primary transition-colors">
      {/* Breadcrumb Trail */}
      <nav className="flex items-center gap-1.5 text-xs font-medium text-text-secondary overflow-x-auto py-1">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={crumb.id || 'root'}>
              {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-text-muted shrink-0" />}
              <button
                onClick={() => navigateToFolder(crumb.id)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isLast
                    ? 'font-semibold text-text-primary bg-surface border border-border/80'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }`}
              >
                {idx === 0 && <Home className="h-3.5 w-3.5 text-text-muted" />}
                <span>{crumb.name}</span>
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Right Toolbar Controls */}
      <div className="flex items-center gap-2.5">
        {/* Type Filter */}
        <div className="relative flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-text-muted" />
          <select
            value={fileTypeFilter}
            onChange={(e) => setFileTypeFilter(e.target.value as FileTypeFilter)}
            className="text-xs bg-surface hover:bg-surface-hover border border-border rounded-lg px-2.5 py-1.5 font-medium text-text-primary focus:outline-none focus:border-focus-ring cursor-pointer transition-colors"
          >
            <option value="all" className="bg-surface text-text-primary">All Types</option>
            <option value="image" className="bg-surface text-text-primary">Images</option>
            <option value="video" className="bg-surface text-text-primary">Videos</option>
            <option value="audio" className="bg-surface text-text-primary">Audio</option>
            <option value="pdf" className="bg-surface text-text-primary">PDFs</option>
            <option value="document" className="bg-surface text-text-primary">Documents</option>
            <option value="archive" className="bg-surface text-text-primary">Archives</option>
          </select>
        </div>

        {/* Sort Option */}
        <div className="relative flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-text-muted" />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="text-xs bg-surface hover:bg-surface-hover border border-border rounded-lg px-2.5 py-1.5 font-medium text-text-primary focus:outline-none focus:border-focus-ring cursor-pointer transition-colors"
          >
            <option value="date_desc" className="bg-surface text-text-primary">Newest First</option>
            <option value="name_asc" className="bg-surface text-text-primary">Name (A-Z)</option>
            <option value="size_desc" className="bg-surface text-text-primary">Largest First</option>
            <option value="size_asc" className="bg-surface text-text-primary">Smallest First</option>
          </select>
        </div>

        {/* Grid / List Switcher */}
        <div className="flex items-center bg-surface border border-border rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-brand-subtle text-primary shadow-xs'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-hover'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-brand-subtle text-primary shadow-xs'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-hover'
            }`}
            title="List view"
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
