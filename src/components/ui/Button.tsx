import React from 'react';
import { cn } from '../../utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'credit' | 'teal' | 'forest';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl active:scale-[0.98] cursor-pointer';

  const variants = {
    // Primary: Exact Team Pine Green (#1F5240)
    primary: 'bg-[#1F5240] text-white hover:bg-[#174032] active:bg-[#102D23] focus:ring-[#1F5240]/40 shadow-sm',
    forest: 'bg-[#1F5240] text-white hover:bg-[#174032] active:bg-[#102D23] focus:ring-[#1F5240]/40 shadow-sm',
    secondary: 'bg-[#E4ECE5] text-[#1F5240] hover:bg-[#D4E2D6] active:bg-[#C8D7CB] focus:ring-[#1F5240]/40',
    outline: 'border border-[#DDE3DE] bg-white text-[#1E2A24] hover:bg-[#F6F7F3] hover:border-[#1F5240] focus:ring-[#1F5240]/40 shadow-2xs',
    ghost: 'text-[#6B7570] hover:bg-[#E4ECE5]/50 hover:text-[#1E2A24] focus:ring-[#1F5240]/40',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-400 shadow-sm',
    credit: 'bg-[#E4ECE5] text-[#1F5240] hover:bg-[#D4E2D6] active:bg-[#C8D7CB] border border-[#C8D7CB] shadow-2xs font-extrabold',
    teal: 'bg-[#1F5240] text-white hover:bg-[#174032] active:bg-[#102D23] focus:ring-[#1F5240]/40 shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
    md: 'text-sm px-4 py-2.5 gap-2 rounded-xl',
    lg: 'text-base px-5 py-3 gap-2.5 rounded-xl',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};