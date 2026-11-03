import React from 'react';
import { cn } from '../../utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'pills' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pills',
  className,
}) => {
  if (variant === 'underline') {
    return (
      <div className={cn('border-b border-[#DDE3DE] flex space-x-6', className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 -mb-px cursor-pointer',
                isActive
                  ? 'border-[#1F5240] text-[#1F5240]'
                  : 'border-transparent text-[#6B7570] hover:text-[#1E2A24] hover:border-[#DDE3DE]'
              )}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'px-2 py-0.5 text-xs rounded-full font-bold',
                    isActive
                      ? 'bg-[#E4ECE5] text-[#1F5240]'
                      : 'bg-[#F0F4F1] text-[#6B7570]'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('inline-flex p-1.5 bg-[#E4ECE5]/50 rounded-2xl gap-1 border border-[#DDE3DE]', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-4 py-2 text-xs font-bold rounded-xl transition-all duration-150 flex items-center gap-2 cursor-pointer select-none',
              isActive
                ? 'bg-[#1F5240] text-white shadow-sm font-extrabold'
                : 'text-[#6B7570] hover:text-[#1E2A24] hover:bg-white/60'
            )}
          >
            {tab.icon && <span className={isActive ? 'text-white' : 'text-[#6B7570]'}>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-colors',
                  isActive ? 'bg-white/20 text-white' : 'bg-[#E4ECE5] text-[#1F5240]'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
