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
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#DDE3DE] h-screen sticky top-0 shrink-0 z-20 shadow-subtle">
      {/* Brand Header with Official Team Logo */}
      <div className="p-4 border-b border-[#DDE3DE]/80 flex items-center justify-between">
        <NavLink to="/dashboard" className="flex items-center gap-3 group">
          <img
            src="/SkillSwapLogo.png"
            alt="SkillSwap Logo"
            className="h-9 w-auto object-contain"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[#1F5240]">SkillSwap</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-[#E4ECE5] text-[#1F5240]">
                UoH
              </span>
            </div>
            <p className="text-[10px] text-[#6B7570] font-medium tracking-wide">Teach &bull; Learn &bull; Swap</p>
          </div>
        </NavLink>
      </div>

      {/* Prominent Balance Header Widget */}
      <div className="px-4 py-3 bg-[#E4ECE5]/50 border-b border-[#DDE3DE]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#1F5240] uppercase tracking-wider flex items-center gap-1">
            <span>⏱</span>
            <span>Time Wallet</span>
          </span>
          <WalletIndicator variant="compact" />
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <div className="text-[10px] font-bold text-[#6B7570] px-3 uppercase tracking-wider">
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
                        ? 'bg-[#1F5240] text-white shadow-sm'
                        : 'text-[#1E2A24] hover:text-[#1F5240] hover:bg-[#E4ECE5]/50'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className={cn('w-4 h-4 transition-colors', isActive ? 'text-white' : 'text-[#6B7570] group-hover:text-[#1F5240]')} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full font-bold',
                          isActive ? 'bg-white/20 text-white' : 'bg-[#E4ECE5] text-[#1F5240]'
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
      <div className="p-3 mx-3 mb-3 bg-[#E4ECE5]/40 rounded-xl border border-[#DDE3DE]">
        <div className="flex items-start gap-2.5 text-xs text-[#1E2A24]">
          <ShieldCheck className="w-4 h-4 text-[#1F5240] shrink-0 mt-0.5" />
          <p className="text-[11px] leading-tight text-[#6B7570]">
            <strong className="text-[#1F5240]">Campus Honor Code:</strong> 1 hour peer mentoring = 1 time credit.
          </p>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-[#DDE3DE] flex items-center justify-between bg-white">
        <NavLink to="/profile" className="flex items-center gap-2.5 min-w-0 group flex-1">
          <Avatar name={user.nick} size="sm" isOnline />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#1E2A24] truncate group-hover:text-[#1F5240] transition-colors">
              {user.nick}
            </p>
            <p className="text-[11px] text-[#6B7570] truncate">
              {user.email.split('@')[0]}
            </p>
          </div>
        </NavLink>
        <NavLink
          to="/login"
          className="text-[#6B7570] hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors"
          title="Switch campus account"
        >
          <LogOut className="w-4 h-4" />
        </NavLink>
      </div>
    </aside>
  );
};