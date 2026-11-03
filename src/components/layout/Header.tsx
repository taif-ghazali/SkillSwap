import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { WalletIndicator } from '../shared/WalletIndicator';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { BackendConfigModal } from '../ui/BackendConfigModal';
import { apiClient } from '../../services/apiClient';
import { PlusCircle, Search, Database, Settings2 } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isLive, isBusy } = useAuth();
  const navigate = useNavigate();
  const [showBackendModal, setShowBackendModal] = useState(false);
  const isBackendLive = isLive && apiClient.isConfigured();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#DDE3DE] px-4 sm:px-6 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Mobile Brand / Left side */}
        <div className="flex items-center gap-3 md:hidden">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <img
              src="/SkillSwapLogo.png"
              alt="SkillSwap UoH Logo"
              className="h-8 w-auto object-contain"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[#1F5240] tracking-tight text-sm">SkillSwap</span>
                <span className="text-[10px] font-bold text-[#1F5240] bg-[#E4ECE5] px-1.5 py-0.2 rounded-md">
                  UoH
                </span>
              </div>
              <p className="text-[9px] text-[#6B7570] font-medium">Teach &bull; Learn &bull; Swap</p>
            </div>
          </Link>
        </div>

        {/* Desktop Quick Search bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div
            onClick={() => navigate('/discover')}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-[#DDE3DE] bg-[#F6F7F3] hover:bg-white text-[#6B7570] hover:text-[#1E2A24] hover:border-[#1F5240] text-xs cursor-pointer transition-all duration-150 shadow-2xs group"
          >
            <Search className="w-3.5 h-3.5 text-[#6B7570] group-hover:text-[#1F5240] transition-colors" />
            <span className="font-medium text-[#6B7570]">Search skills (Python, LaTeX, Figma, Excel)...</span>
            <kbd className="ml-auto px-1.5 py-0.5 rounded-md bg-white border border-[#DDE3DE] text-[10px] text-[#6B7570] font-mono shadow-2xs">
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
            className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold border cursor-pointer transition-all duration-150 active:scale-95 shadow-2xs ${
              isBackendLive
                ? 'bg-[#E4ECE5] text-[#1F5240] border-[#C8D7CB] hover:bg-[#D4E2D6]'
                : 'bg-[#F6F7F3] text-[#6B7570] border-[#DDE3DE] hover:bg-slate-100'
            }`}
            title="Configure Google Apps Script API & Google Sheets database"
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isBackendLive ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isBackendLive ? 'bg-emerald-600' : 'bg-amber-500'
                }`}
              />
            </span>
            <span className="tracking-tight">
              {isBackendLive ? 'Live backend connected' : isLive ? 'Configure live backend' : 'Demo local mode'}
            </span>
          </button>

          {/* Time Wallet: matches lblWallet in Screen1.scm (#E4ECE5 bg, #1F5240 text) */}
          <WalletIndicator variant="pill" />

          {/* Quick Publish Slot Button: matches btnPublish (#1F5240 bg, white text) */}
          <Button
            size="sm"
            variant="primary"
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            onClick={() => navigate('/teach')}
            className="hidden sm:inline-flex shadow-sm hover:shadow-card transition-all active:scale-95 bg-[#1F5240] hover:bg-[#174032] text-white"
          >
            Teach Slot
          </Button>

          {/* User Profile Avatar Link */}
          <Link
            to="/profile"
            className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-[#1F5240]/40 transition-all active:scale-95"
            title={`${user.nick} - View Profile`}
          >
            <Avatar name={user.nick} size="sm" isOnline />
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