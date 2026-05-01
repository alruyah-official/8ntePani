import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="bg-surface rounded-2xl border border-border flex flex-col h-[380px] overflow-hidden">
      {/* Thumbnail area */}
      <div className="h-48 w-full shimmer-bg" />
      
      {/* Content area */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Category Pill */}
        <div className="w-1/3 h-6 rounded-full shimmer-bg" />
        
        {/* Title */}
        <div className="flex flex-col gap-2">
          <div className="w-full h-5 rounded shimmer-bg" />
          <div className="w-4/5 h-5 rounded shimmer-bg" />
        </div>
        
        {/* Footer info (avatar & price) */}
        <div className="mt-auto w-full flex justify-between items-center pt-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full shimmer-bg" />
            <div className="w-16 h-4 rounded shimmer-bg" />
          </div>
          <div className="w-16 h-6 rounded shimmer-bg" />
        </div>
      </div>
    </div>
  );
};
