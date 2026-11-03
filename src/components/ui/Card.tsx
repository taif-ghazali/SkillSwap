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
    default: 'bg-white border border-[#DDE3DE] shadow-card rounded-2xl transition-all duration-150',
    subtle: 'bg-[#F6F7F3] border border-[#DDE3DE] rounded-2xl',
    bordered: 'bg-white border-2 border-[#1F5240] rounded-2xl',
    interactive: 'bg-white border border-[#DDE3DE] shadow-card hover:shadow-card-hover hover:border-[#1F5240] rounded-2xl transition-all duration-150 cursor-pointer',
    gradient: 'bg-gradient-to-br from-white to-[#F6F7F3] border border-[#DDE3DE] shadow-card rounded-2xl',
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