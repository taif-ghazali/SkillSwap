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
  const baseStyles = 'inline-flex items-center font-bold rounded-full tracking-wide select-none';

  const variants = {
    default: 'bg-[#F6F7F3] text-[#1E2A24] border border-[#DDE3DE]',
    brand: 'bg-[#E4ECE5] text-[#1F5240] border border-[#C8D7CB]',
    teal: 'bg-[#E4ECE5] text-[#1F5240] border border-[#C8D7CB]',
    success: 'bg-[#E4ECE5] text-[#1F5240] border border-[#C8D7CB]',
    warning: 'bg-amber-50 text-amber-900 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    credit: 'bg-[#E4ECE5] text-[#1F5240] border border-[#C8D7CB] font-extrabold shadow-2xs',
    swap: 'bg-[#E4ECE5] text-[#1F5240] border border-[#C8D7CB] font-extrabold',
    outline: 'border border-[#DDE3DE] text-[#1E2A24] bg-white',
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