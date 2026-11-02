import React from 'react';
import { cn } from '../../utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'bordered' | 'interactive' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  ...props
}) => {
  const variants = {
    default: 'bg-white border border-slate-200/90 shadow-card rounded-2xl transition-all duration-200',
    subtle: 'bg-slate-50/70 border border-slate-200/70 rounded-2xl',
    bordered: 'bg-white border-2 border-slate-200 rounded-2xl',
    interactive: 'bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-brand-200 rounded-2xl transition-all duration-200 cursor-pointer',
    gradient: 'bg-linear-to-br from-white via-slate-50 to-white border border-slate-200/90 shadow-card rounded-2xl',
  };

  const paddings = {
    none: '',
    sm: 'p-3.5',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div className={cn(variants[variant], paddings[padding], className)} {...props}>
      {children}
    </div>
  );
};
