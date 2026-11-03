import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils';
import { Clock, ArrowRight } from 'lucide-react';

export interface WalletIndicatorProps {
  className?: string;
  variant?: 'compact' | 'pill' | 'expanded';
}

export const WalletIndicator: React.FC<WalletIndicatorProps> = ({
  className,
  variant = 'pill',
}) => {
  const { user, availableCredits, totalCredits, reservedCredits } = useAuth();

  if (variant === 'compact') {
    return (
      <Link
        to="/wallet"
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-150',
          'bg-[#E4ECE5] text-[#1F5240] hover:bg-[#D4E2D6] border border-[#DDE3DE] shadow-2xs active:scale-95',
          className
        )}
        title={`${totalCredits} Total Credits (${availableCredits} available to book, ${reservedCredits} in escrow)`}
      >
        <span className="text-xs">⏱</span>
        <span>{availableCredits} {availableCredits === 1 ? 'credit' : 'credits'}</span>
      </Link>
    );
  }

  if (variant === 'expanded') {
    return (
      <div className={cn('bg-white border border-[#DDE3DE] rounded-2xl p-5 shadow-card', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#E4ECE5] text-[#1F5240] flex items-center justify-center text-xl shadow-inner font-bold">
              ⏱
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#6B7570] uppercase tracking-wider">Time Credit Wallet</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#1E2A24]">{totalCredits}</span>
                <span className="text-xs font-semibold text-[#1F5240]">Total Credits</span>
              </div>
            </div>
          </div>
          <Link
            to="/wallet"
            className="text-xs font-bold text-[#1F5240] hover:text-[#174032] bg-[#E4ECE5]/70 px-3 py-1.5 rounded-xl border border-[#DDE3DE] shadow-2xs hover:shadow-xs transition-all inline-flex items-center gap-1"
          >
            <span>Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="mt-4 pt-3.5 border-t border-[#DDE3DE] flex items-center justify-between text-xs text-[#1E2A24]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1F5240] inline-block"></span>
            <span>Available: <strong className="font-extrabold text-[#1F5240]">{availableCredits}</strong></span>
          </div>
          {reservedCredits > 0 && (
            <div className="flex items-center gap-1.5 text-[#6B7570]">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              <span>In Escrow: <strong>{reservedCredits}</strong></span>
            </div>
          )}
          <span className="text-[11px] text-[#6B7570] font-medium hidden sm:inline">1 hr peer session = 1 credit</span>
        </div>
      </div>
    );
  }

  return (
    <Link
      to="/wallet"
      className={cn(
        'group flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150',
        'bg-[#E4ECE5] hover:bg-[#D4E2D6] border border-[#C8D7CB] text-[#1F5240] shadow-2xs active:scale-95',
        className
      )}
      title={`${totalCredits} Total Credits (${availableCredits} available to spend)`}
    >
      <span className="text-xs">⏱</span>
      <span>
        <strong className="font-extrabold">{availableCredits}</strong>{' '}
        <span className="hidden sm:inline">{availableCredits === 1 ? 'Credit' : 'Credits'}</span>
      </span>
      {reservedCredits > 0 && (
        <span className="text-[10px] text-[#6B7570] font-normal hidden lg:inline">
          ({reservedCredits} held)
        </span>
      )}
    </Link>
  );
};