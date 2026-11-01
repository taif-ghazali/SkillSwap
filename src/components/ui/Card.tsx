import React from 'react';
import { cn } from '../../utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'bordered';
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
    default: 'bg-white border border-slate-200/80 shadow-card rounded-xl',
    subtle: 'bg-slate-50/60 border border-slate-200/60 rounded-xl',
    bordered: 'bg-white border-2 border-slate-200 rounded-xl',
  };

  const paddings = {
    none: '',
    sm: 'p-3.5',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div className={cn(variants[variant], paddings[padding], className)} {...props}>
      {children}
    </div>
  );
};
