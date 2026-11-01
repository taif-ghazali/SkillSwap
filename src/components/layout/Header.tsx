import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { WalletIndicator } from '../shared/WalletIndicator';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { PlusCircle, Search, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Mobile Brand / Left side */}
        <div className="flex items-center gap-3 md:hidden">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
              S
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-sm">SkillSwap</span>
              <span className="ml-1 text-[10px] font-bold text-brand-600">UoH</span>
            </div>
          </Link>
        </div>

        {/* Desktop Quick Search bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div
            onClick={() => navigate('/discover')}
            className="w-full flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300 hover:text-slate-600 text-xs cursor-pointer transition-colors shadow-2xs"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search tutors by skill (Python, LaTeX, Figma, Excel)...</span>
            <kbd className="ml-auto px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-400 font-mono">
              /
            </kbd>
          </div>
        </div>

        {/* Right Section: Time Wallet, Post Slot, Profile */}
        <div className="flex items-center gap-3">
          {/* Prominent Time Wallet on Every Page per Spec 5B */}
          <WalletIndicator variant="pill" />

          {/* Quick Publish Slot Button */}
          <Button
            size="sm"
            variant="primary"
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            onClick={() => navigate('/teach')}
            className="hidden sm:inline-flex"
          >
            Teach Slot
          </Button>

          {/* User Profile Avatar Link */}
          <Link to="/profile" className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-brand-500/30 transition-all">
            <Avatar name={user.nick} size="sm" />
          </Link>
        </div>
      </div>
    </header>
  );
};
