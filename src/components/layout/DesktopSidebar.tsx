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
  ShieldCheck,
  LogOut,
  Sparkles
} from 'lucide-react';

export const DesktopSidebar: React.FC = () => {
  const { user } = useAuth();

  const navGroups = [
    {
      label: 'Explore',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/discover', label: 'Discover & Search', icon: Search, badge: 'Live' },
      ]
    },
    {
      label: 'Peer Exchange',
      items: [
        { to: '/teach', label: 'Teach a Skill', icon: PlusCircle },
        { to: '/sessions', label: 'My Sessions', icon: CalendarCheck },
      ]
    },
    {
      label: 'Wallet & Account',
      items: [
        { to: '/wallet', label: 'Time Wallet', icon: Wallet },
        { to: '/profile', label: 'My Profile', icon: User },
      ]
    }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/90 h-screen sticky top-0 shrink-0 z-20">
      {/* Brand Header with Deep Indigo Accent */}
      <div className="p-5 border-b border-slate-100/90 flex items-center justify-between">
        <NavLink to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#263778] via-[#2f4396] to-[#4969F5] flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">SkillSwap</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                UoH
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wide">Learn &bull; Grow &bull; Together</p>
          </div>
        </NavLink>
      </div>

      {/* Prominent Balance Header Widget */}
      <div className="px-4 py-3 bg-[#fef5e0]/60 border-b border-[#fde7be]/70">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#8c5717] uppercase tracking-wider">Time Wallet</span>
          <WalletIndicator variant="compact" />
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <div className="text-[10px] font-extrabold text-slate-400 px-3 uppercase tracking-wider">
              {group.label}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group',
                      isActive
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className={cn('w-4 h-4 transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700')} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full font-bold',
                          isActive ? 'bg-white/20 text-white' : 'bg-[#DDF7EB] text-[#0A6B5B]'
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Campus Honor Notice */}
      <div className="p-3 mx-3 mb-3 bg-gradient-to-r from-teal-50 to-brand-50 rounded-xl border border-teal-200/60">
        <div className="flex items-start gap-2 text-xs text-slate-700">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-tight text-slate-600">
            <strong>Campus Honor Code:</strong> 1 hour peer mentoring = 1 time credit.
          </p>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-white">
        <NavLink to="/profile" className="flex items-center gap-2.5 min-w-0 group flex-1">
          <Avatar name={user.nick} size="sm" isOnline />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-brand-600 transition-colors">
              {user.nick}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {user.email.split('@')[0]}
            </p>
          </div>
        </NavLink>
        <NavLink
          to="/login"
          className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors"
          title="Switch campus account"
        >
          <LogOut className="w-4 h-4" />
        </NavLink>
      </div>
    </aside>
  );
};
