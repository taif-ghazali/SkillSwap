import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils';
import { Clock } from 'lucide-react';

export interface WalletIndicatorProps {
  className?: string;
  variant?: 'compact' | 'pill' | 'expanded';
}

export const WalletIndicator: React.FC<WalletIndicatorProps> = ({
  className,
  variant = 'pill',
}) => {
  const { user, availableCredits } = useAuth();

  if (variant === 'compact') {
    return (
      <Link
        to="/wallet"
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all',
          'bg-amber-100/90 text-amber-900 hover:bg-amber-200 border border-amber-300 shadow-2xs',
          className
        )}
        title={`${user.credits} Total Credits (${availableCredits} available to book)`}
      >
        <span className="text-sm">⏱</span>
        <span>{availableCredits} {availableCredits === 1 ? 'credit' : 'credits'}</span>
      </Link>
    );
  }

  if (variant === 'expanded') {
    return (
      <div className={cn('bg-linear-to-br from-amber-50 to-orange-50/40 border border-amber-200 rounded-xl p-4 shadow-subtle', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 text-lg shadow-inner">
              ⏱
            </div>
            <div>
              <p className="text-xs font-medium text-amber-900 uppercase tracking-wider">Time Credit Wallet</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-amber-950">{user.credits}</span>
                <span className="text-xs text-amber-800">total credits</span>
              </div>
            </div>
          </div>
          <Link
            to="/wallet"
            className="text-xs font-semibold text-amber-900 underline hover:text-amber-950"
          >
            View Ledger &rarr;
          </Link>
        </div>
        <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-800">
          <span>Available to book now: <strong className="font-bold text-amber-950">{availableCredits}</strong></span>
          <span className="text-[11px] text-amber-700/80">1 hour peer learning = 1 credit</span>
        </div>
      </div>
    );
  }

  return (
    <Link
      to="/wallet"
      className={cn(
        'group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200',
        'bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 shadow-2xs',
        className
      )}
      title="View your credit ledger and balance"
    >
      <span className="text-sm group-hover:scale-110 transition-transform">⏱</span>
      <span>
        <strong className="font-bold">{availableCredits}</strong>{' '}
        <span className="hidden sm:inline">credits</span>
      </span>
      {user.credits !== availableCredits && (
        <span className="text-[10px] text-amber-700 font-normal">
          ({user.credits - availableCredits} reserved)
        </span>
      )}
    </Link>
  );
};
