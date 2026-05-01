import React from 'react';
import { AlertTriangle, Ghost, RefreshCw } from 'lucide-react';
import { SkeletonCard } from './SkeletonCard';

export const QueryWrapper = ({ 
  isLoading, 
  isError, 
  error, 
  isEmpty, 
  emptyMessage = "No data found.", 
  skeleton, 
  children 
}) => {
  if (isLoading) {
    if (skeleton) return skeleton;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (isError) {
    const errorMessage = error?.message || "An unexpected error occurred while loading data.";
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 text-center bg-surface border border-border rounded-2xl my-6">
        <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold font-display text-text-primary mb-2">Failed to load data</h3>
        <p className="text-muted text-sm max-w-md mb-6">{errorMessage}</p>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-2.5 bg-surface border border-border rounded-full text-text-primary hover:text-accent hover:border-accent transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Try again
        </button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-12 text-center bg-surface/50 border border-border/50 border-dashed rounded-2xl my-6">
        <div className="w-16 h-16 bg-primary text-muted rounded-full flex items-center justify-center mb-4">
          <Ghost className="w-8 h-8 opacity-50" />
        </div>
        <h3 className="text-lg font-bold font-display text-text-primary mb-2">Nothing to see here</h3>
        <p className="text-muted text-sm max-w-md">{emptyMessage}</p>
      </div>
    );
  }

  // Render actual content if not loading, not errored, and not empty
  return <>{children}</>;
};
