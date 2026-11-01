import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { WalletIndicator } from '../shared/WalletIndicator';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../utils';
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  CalendarCheck,
  Wallet,
  User,
  Sparkles,
  ShieldCheck,
  LogOut,
  Building2
} from 'lucide-react';

export const DesktopSidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/discover', label: 'Discover & Search', icon: Search, badge: 'Live' },
    { to: '/teach', label: 'Teach a Skill', icon: PlusCircle },
    { to: '/sessions', label: 'My Sessions', icon: CalendarCheck },
    { to: '/wallet', label: 'Time Wallet', icon: Wallet },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/90 h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-brand-500/30">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">SkillSwap</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-brand-50 text-brand-700 border border-brand-200">
                UoH
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Univ. of Hyderabad</p>
          </div>
        </NavLink>
      </div>

      {/* Campus Wallet Status */}
      <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Your Balance</span>
          <WalletIndicator variant="compact" />
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-semibold text-slate-400 px-3 uppercase tracking-wider mb-2">
          Campus Exchange
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                )
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* University & Safety Notice */}
      <div className="p-3 m-3 bg-slate-50 rounded-lg border border-slate-200/70">
        <div className="flex items-start gap-2 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-tight text-slate-500">
            <strong>SCIS Campus Network:</strong> 1 hour peer teaching = 1 time credit.
          </p>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-white">
        <NavLink to="/profile" className="flex items-center gap-2.5 min-w-0 group">
          <Avatar name={user.nick} size="sm" isOnline />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate group-hover:text-brand-600">
              {user.nick}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {user.email.split('@')[0]}
            </p>
          </div>
        </NavLink>
        <NavLink
          to="/login"
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
          title="Sign in with another account"
        >
          <LogOut className="w-4 h-4" />
        </NavLink>
      </div>
    </aside>
  );
};
