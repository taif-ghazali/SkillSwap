import React from 'react';
import { cn } from '../../utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'brand' | 'teal' | 'success' | 'warning' | 'danger' | 'credit' | 'outline' | 'swap';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full tracking-wide select-none';

  const variants = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    brand: 'bg-brand-50 text-brand-700 border border-brand-200/80',
    teal: 'bg-teal-50 text-teal-700 border border-teal-200/80',
    success: 'bg-[#DDF7EB] text-[#0A6B5B] border border-[#bdf1d9]',
    warning: 'bg-amber-50 text-amber-900 border border-amber-200/90',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    credit: 'bg-[#fef5e0] text-[#8c5717] border border-[#fde7be] font-bold shadow-2xs',
    swap: 'bg-gradient-to-r from-teal-50 to-brand-50 text-brand-800 border border-brand-200/80 font-bold',
    outline: 'border border-slate-200 text-slate-700 bg-white',
  };

  const sizes = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
