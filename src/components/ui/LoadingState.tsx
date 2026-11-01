import React from 'react';
import { cn } from '../../utils';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  variant?: 'spinner' | 'skeleton';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  variant = 'spinner',
  className,
}) => {
  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-4 animate-pulse w-full', className)}>
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="border border-slate-200 rounded-xl p-5 space-y-3 bg-white">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-5 bg-slate-200 rounded w-3/4"></div>
              <div className="h-16 bg-slate-100 rounded"></div>
              <div className="h-8 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center', className)}>
      <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 mb-3">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
};
