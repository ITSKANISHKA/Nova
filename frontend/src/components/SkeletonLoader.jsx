import React from 'react';

export function ProductSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 animate-pulse shadow-sm">
      <div className="w-full aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl mb-4" />
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2" />
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-4" />
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-20" />
        <div className="h-9 w-9 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
