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
    <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      {/* Breadcrumb Trail */}
      <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 overflow-x-auto py-1">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={crumb.id || 'root'}>
              {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />}
              <button
                onClick={() => navigateToFolder(crumb.id)}
                className={`flex items-center gap-1 px-1.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                  isLast
                    ? 'font-bold text-slate-900 dark:text-slate-100 bg-slate-100/70 dark:bg-slate-800'
                    : 'hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {idx === 0 && <Home className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />}
                <span>{crumb.name}</span>
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Right Toolbar Controls */}
      <div className="flex items-center gap-2">
        {/* Type Filter */}
        <div className="relative flex items-center gap-1">
          <Filter className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          <select
            value={fileTypeFilter}
            onChange={(e) => setFileTypeFilter(e.target.value as FileTypeFilter)}
            className="text-xs bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
            <option value="pdf">PDFs</option>
            <option value="document">Documents</option>
            <option value="archive">Archives</option>
          </select>
        </div>

        {/* Sort Option */}
        <div className="relative flex items-center gap-1">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="text-xs bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="date_desc">Newest First</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="size_desc">Largest First</option>
            <option value="size_asc">Smallest First</option>
          </select>
        </div>

        {/* Grid / List Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-700 shadow-2xs text-slate-900 dark:text-slate-100'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-700 shadow-2xs text-slate-900 dark:text-slate-100'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
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
