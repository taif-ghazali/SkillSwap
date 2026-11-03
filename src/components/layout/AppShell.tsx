import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appService } from '../../services/appService';
import { DesktopSidebar } from './DesktopSidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';

export const AppShell: React.FC = () => {
  const { user, isLive, isBusy, error } = useAuth();
  if (isLive && !user.email) return <Navigate to="/login" replace />;
  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto pb-20 md:pb-8">
          <p className="mb-3 text-sm">{isLive ? 'Live backend' : 'Demo mode: changes stay on this device'}</p>
          {isLive && <button className="mb-3 underline" disabled={isBusy} onClick={() => void appService.refresh().catch(() => {})}>Refresh from server</button>}
          {error && <p role="alert" className="mb-4 text-rose-700">{error}</p>}
          {isLive && <p className="mb-4 text-sm text-slate-500">The backend provides balances and sessions. Ledger history, rating history, peer profiles, categories, descriptions and bios are unavailable through its current API.</p>}
          <fieldset disabled={isBusy} className="min-w-0">{isBusy && <p role="status">Connecting to server...</p>}<Outlet /></fieldset>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNavigation />
      </div>
    </div>
  );
};
