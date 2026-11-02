import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils';

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
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200',
          'bg-[#fef5e0] text-[#8c5717] hover:bg-[#fde7be] border border-[#fde7be] shadow-2xs hover:shadow-xs active:scale-95',
          className
        )}
        title={`${totalCredits} Total Credits (${availableCredits} available to book, ${reservedCredits} in escrow)`}
      >
        <span className="text-sm">⏱</span>
        <span>{availableCredits} {availableCredits === 1 ? 'credit' : 'credits'}</span>
      </Link>
    );
  }

  if (variant === 'expanded') {
    return (
      <div className={cn('bg-linear-to-br from-[#fffbf2] via-[#fef5e0] to-white border border-[#fde7be] rounded-2xl p-5 shadow-card', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-900 flex items-center justify-center text-xl shadow-inner font-bold">
              ⏱
            </div>
            <div>
              <p className="text-[11px] font-bold text-amber-900/80 uppercase tracking-wider">Time Credit Wallet</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{totalCredits}</span>
                <span className="text-xs font-semibold text-amber-800">Total Credits</span>
              </div>
            </div>
          </div>
          <Link
            to="/wallet"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all"
          >
            Ledger &rarr;
          </Link>
        </div>
        <div className="mt-4 pt-3.5 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>Available: <strong className="font-extrabold text-slate-900">{availableCredits}</strong></span>
          </div>
          {reservedCredits > 0 && (
            <div className="flex items-center gap-1.5 text-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              <span>In Escrow: <strong>{reservedCredits}</strong></span>
            </div>
          )}
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">1 hr peer session = 1 credit</span>
        </div>
      </div>
    );
  }

  return (
    <Link
      to="/wallet"
      className={cn(
        'group flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200',
        'bg-[#fef5e0] hover:bg-[#fde7be] border border-[#fde7be] text-[#8c5717] shadow-2xs hover:shadow-xs active:scale-95',
        className
      )}
      title={`${totalCredits} Total Credits (${availableCredits} available to spend)`}
    >
      <span className="text-sm group-hover:scale-110 transition-transform">⏱</span>
      <span>
        <strong className="font-extrabold">{availableCredits}</strong>{' '}
        <span className="hidden sm:inline">{availableCredits === 1 ? 'Credit' : 'Credits'}</span>
      </span>
      {reservedCredits > 0 && (
        <span className="text-[10px] text-amber-800/80 font-normal hidden lg:inline">
          ({reservedCredits} held)
        </span>
      )}
    </Link>
  );
};
