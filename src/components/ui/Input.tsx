import React, { forwardRef } from 'react';
import { cn } from '../../utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightAction, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-[#1E2A24] tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#6B7570]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-[#1E2A24] transition-all duration-150 placeholder:text-[#6B7570]',
              'focus:border-[#1F5240] focus:outline-none focus:ring-3 focus:ring-[#1F5240]/15 focus:bg-white',
              'disabled:bg-[#F6F7F3] disabled:text-[#6B7570] disabled:cursor-not-allowed',
              error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-[#DDE3DE] hover:border-[#1F5240]/60',
              leftIcon ? 'pl-10' : '',
              rightAction ? 'pr-11' : '',
              className
            )}
            {...props}
          />
          {rightAction && (
            <div className="absolute right-2.5 flex items-center">
              {rightAction}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#6B7570]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';