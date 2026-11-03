import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search, PlusCircle, CalendarCheck, Wallet, User, LayoutDashboard } from 'lucide-react';
import { cn } from '../../utils';

export const MobileNavigation: React.FC = () => {
  const navItems = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/discover', label: 'Search', icon: Search },
    { to: '/teach', label: 'Teach', icon: PlusCircle, isHighlight: true },
    { to: '/sessions', label: 'Sessions', icon: CalendarCheck },
    { to: '/wallet', label: 'Wallet', icon: Wallet },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#DDE3DE] px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-all duration-150',
                  isActive
                    ? 'text-[#1F5240] font-extrabold'
                    : 'text-[#6B7570] hover:text-[#1E2A24]',
                  item.isHighlight && 'relative -top-3'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.isHighlight ? (
                    <div className="w-11 h-11 rounded-2xl bg-[#1F5240] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                  ) : (
                    <Icon className={cn('w-4 h-4 mb-0.5 transition-colors', isActive ? 'text-[#1F5240]' : 'text-[#6B7570]')} />
                  )}
                  <span className={cn(item.isHighlight && 'mt-1 text-[10px] font-bold text-[#1F5240]')}>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};