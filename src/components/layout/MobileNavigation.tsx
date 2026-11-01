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
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-medium transition-colors',
                  isActive
                    ? 'text-brand-600 font-bold'
                    : 'text-slate-500 hover:text-slate-900',
                  item.isHighlight && 'relative -top-2'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.isHighlight ? (
                    <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-md -mb-1">
                      <Icon className="w-5 h-5" />
                    </div>
                  ) : (
                    <Icon className={cn('w-5 h-5 mb-0.5', isActive ? 'text-brand-600' : 'text-slate-500')} />
                  )}
                  <span className={cn(item.isHighlight && 'mt-1')}>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
