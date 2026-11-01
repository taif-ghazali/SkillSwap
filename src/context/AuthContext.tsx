import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { mockService } from '../services/mockService';

interface AuthContextType {
  user: UserProfile;
  totalCredits: number;
  availableCredits: number;
  reservedCredits: number;
  login: (email: string, nick?: string) => void;
  logout: () => void;
  refreshUserData: () => void;
  updateProfile: (params: {
    nick?: string;
    offers: string[];
    wants: string[];
    bio?: string;
  }) => { success: boolean; error?: string };
  resetDemoData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(mockService.getCurrentUser());
  const [creditBreakdown, setCreditBreakdown] = useState(mockService.getCreditBreakdown());

  const refreshUserData = () => {
    const updatedUser = mockService.getCurrentUser();
    setUser(updatedUser);
    setCreditBreakdown(mockService.getCreditBreakdown(updatedUser.email));
  };

  useEffect(() => {
    refreshUserData();
  }, []);

  const login = (email: string, nick?: string) => {
    mockService.loginWithEmail(email, nick);
    refreshUserData();
  };

  const logout = () => {
    refreshUserData();
  };

  const updateProfile = (params: {
    nick?: string;
    offers: string[];
    wants: string[];
    bio?: string;
  }) => {
    const result = mockService.updateProfile(params);
    refreshUserData();
    return { success: result.success, error: result.error };
  };

  const resetDemoData = () => {
    mockService.resetToDefault();
    refreshUserData();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        totalCredits: creditBreakdown.total,
        availableCredits: creditBreakdown.available,
        reservedCredits: creditBreakdown.reserved,
        login,
        logout,
        refreshUserData,
        updateProfile,
        resetDemoData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
