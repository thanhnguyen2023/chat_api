import React, { createContext, useContext, useState, ReactNode } from 'react';
import { currentUser as mockCurrentUser, User } from '@/data/mock';

interface AuthContextType {
  currentUser: User;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser] = useState<User>(mockCurrentUser);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};