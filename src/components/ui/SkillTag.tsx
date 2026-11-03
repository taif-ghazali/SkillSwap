import React from 'react';
import { cn } from '../../utils';
import { X, BookOpen, Sparkles } from 'lucide-react';

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
    offer: 'bg-[#E4ECE5] text-[#1F5240] border-[#DDE3DE] hover:bg-[#d8e3d9]',
    want: 'bg-[#F0F4F1] text-[#1F5240] border-[#DDE3DE] hover:bg-[#E4ECE5]',
    neutral: 'bg-[#F6F7F3] text-[#1E2A24] border-[#DDE3DE] hover:bg-[#E4ECE5]',
    interactive: 'bg-white text-[#1E2A24] border-[#DDE3DE] hover:border-[#1F5240] hover:text-[#1F5240] hover:bg-[#E4ECE5]/50 shadow-2xs cursor-pointer',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3.5 py-1 gap-2',
  };

  return (
    <span
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={cn(
        'inline-flex items-center font-semibold rounded-full border transition-all duration-150 select-none',
        variants[variant],
        sizes[size],
        isClickable && 'cursor-pointer hover:shadow-xs active:scale-95',
        className
      )}
    >
      {variant === 'offer' && <Sparkles className="w-3 h-3 text-[#1F5240] shrink-0" />}
      {variant === 'want' && <BookOpen className="w-3 h-3 text-[#1F5240] shrink-0" />}
      <span>{skill}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 text-slate-400 hover:text-rose-600 p-0.5 rounded-full hover:bg-rose-50 transition-colors"
          title={`Remove ${skill}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
