import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function LoadingSpinner({
  className,
  size = 'md',
  message,
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 gap-3', className)}>
      <Loader2 className={cn('animate-spin text-indigo-600', sizeMap[size])} />
      {message && <p className="text-sm text-slate-500 font-medium">{message}</p>}
    </div>
  );
}

export function SkeletonRow({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-10 bg-slate-100 rounded-lg w-full" />
      ))}
    </div>
  );
}
