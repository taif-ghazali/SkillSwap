import React, { createContext, useContext, useEffect, useState } from 'react';
import { appService } from '../services/appService';
import { UserProfile } from '../types';
interface AuthContextType {
 user: UserProfile; totalCredits: number; availableCredits: number; reservedCredits: number;
 login: (email: string, nick?: string) => Promise<void>; logout: () => void; refreshUserData: () => void;
 updateProfile: (params: { nick?: string; offers: string[]; wants: string[]; bio?: string }) => Promise<{ success: boolean; error?: string }>;
 resetDemoData: () => void; isLive: boolean; isBusy: boolean; error: string;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const [, render] = useState(0);
 useEffect(() => {
  const unsubscribe = appService.subscribe(() => render(n => n + 1));
  void appService.restore().catch(() => {});
  return unsubscribe;
 }, []);
 const credits = appService.getCreditBreakdown();
 return <AuthContext.Provider value={{
  user: appService.getCurrentUser(), totalCredits: credits.total, availableCredits: credits.available, reservedCredits: credits.reserved,
  login: async (email, nick) => { await appService.loginWithEmail(email, nick); }, logout: () => appService.logout(),
  refreshUserData: () => { render(n => n + 1); }, updateProfile: params => appService.updateProfile(params),
  resetDemoData: () => appService.resetToDefault(), isLive: appService.isLive(), isBusy: appService.isBusy(), error: appService.error,
 }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
 const context = useContext(AuthContext);
 if (!context) throw Error('useAuth must be used within AuthProvider');
 return context;
};
