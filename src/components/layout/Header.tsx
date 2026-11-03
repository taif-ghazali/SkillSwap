import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { WalletIndicator } from '../shared/WalletIndicator';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { BackendConfigModal } from '../ui/BackendConfigModal';
import { apiClient } from '../../services/apiClient';
import { PlusCircle, Search, Database, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isLive, isBusy } = useAuth();
  const navigate = useNavigate();
  const [showBackendModal, setShowBackendModal] = useState(false);
  const isBackendLive = isLive && apiClient.isConfigured();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Mobile Brand / Left side */}
        <div className="flex items-center gap-3 md:hidden">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#263778] via-[#2f4396] to-[#4969F5] flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
              S
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-slate-900 tracking-tight text-sm">SkillSwap</span>
                <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1 rounded">UoH</span>
              </div>
              <p className="text-[9px] text-slate-400 font-medium">Learn Together</p>
            </div>
          </Link>
        </div>

        {/* Desktop Quick Search bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div
            onClick={() => navigate('/discover')}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-400 hover:border-brand-300 hover:bg-white hover:text-slate-600 text-xs cursor-pointer transition-all duration-150 shadow-2xs group"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 transition-colors" />
            <span className="font-medium">Search tutors by skill (Python, LaTeX, Figma, Excel)...</span>
            <kbd className="ml-auto px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-400 font-mono shadow-2xs">
              /
            </kbd>
          </div>
        </div>

        {/* Right Section: Backend Status, Time Wallet, Teach Slot, Profile */}
        <div className="flex items-center gap-3">
          {/* Backend Connection Status Badge / Button */}
          <button
            type="button"
            onClick={() => setShowBackendModal(true)}
            disabled={isBusy}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border cursor-pointer transition-all duration-150 active:scale-95 ${
              isBackendLive
                ? 'bg-[#DDF7EB] text-[#0A6B5B] border-[#bdf1d9] hover:bg-[#cbf5e2]'
                : 'bg-slate-100/90 text-slate-600 border-slate-200 hover:bg-slate-200/80'
            }`}
            title="Configure Google Apps Script API & Google Sheets database"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isBackendLive ? 'Live backend configured' : isLive ? 'Configure live backend' : 'Demo local mode'}</span>
          </button>

          {/* Prominent Time Wallet on Every Page per Spec 5B */}
          <WalletIndicator variant="pill" />

          {/* Quick Publish Slot Button */}
          <Button
            size="sm"
            variant="primary"
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            onClick={() => navigate('/teach')}
            className="hidden sm:inline-flex shadow-sm hover:shadow-md transition-shadow"
          >
            Teach Slot
          </Button>

          {/* User Profile Avatar Link */}
          <Link
            to="/profile"
            className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-brand-500/30 transition-all active:scale-95"
            title={`${user.nick} - View Profile`}
          >
            <Avatar name={user.nick} size="sm" />
          </Link>
        </div>
      </div>

      {/* Backend Settings Dialog */}
      <BackendConfigModal
        isOpen={showBackendModal}
        onClose={() => setShowBackendModal(false)}
      />
    </header>
  );
};
