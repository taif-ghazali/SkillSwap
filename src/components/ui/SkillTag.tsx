import React from 'react';
import { cn } from '../../utils';
import { X, Plus, BookOpen, Sparkles } from 'lucide-react';

export interface SkillTagProps {
  skill: string;
  variant?: 'offer' | 'want' | 'neutral' | 'interactive';
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const SkillTag: React.FC<SkillTagProps> = ({
  skill,
  variant = 'neutral',
  onRemove,
  onClick,
  className,
  size = 'md',
}) => {
  const isClickable = !!onClick;

  const variants = {
    offer: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/60',
    want: 'bg-indigo-50 text-indigo-800 border-indigo-200/80 hover:bg-indigo-100/60',
    neutral: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
    interactive: 'bg-white text-slate-700 border-slate-300 hover:border-brand-500 hover:text-brand-600 shadow-xs cursor-pointer',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-2',
  };

  return (
    <span
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={cn(
        'inline-flex items-center font-medium rounded-md border transition-all duration-150 select-none',
        variants[variant],
        sizes[size],
        isClickable && 'cursor-pointer hover:shadow-xs active:scale-95',
        className
      )}
    >
      {variant === 'offer' && <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />}
      {variant === 'want' && <BookOpen className="w-3 h-3 text-indigo-600 shrink-0" />}
      <span>{skill}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 text-slate-400 hover:text-rose-600 p-0.5 rounded hover:bg-rose-50 transition-colors"
          title={`Remove ${skill}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
