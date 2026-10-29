import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../../types/models';
import { ROLE_PERMISSIONS, RolePermission } from '../../types/workflow';
import { storage } from '../storage';

interface AuthContextType {
  currentUser: User;
  currentRole: UserRole;
  permissions: RolePermission;
  switchRole: (role: UserRole) => void;
  loginAs: (userId: string) => void;
  loginWithCredentials: (emailOrNip: string, password?: string) => { success: boolean; message: string; user?: User };
  logout: () => void;
  allUsers: User[];
  refreshUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => storage.getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(() => storage.getUsers());

  const refreshUsers = () => {
    setAllUsers(storage.getUsers());
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const switchRole = (role: UserRole) => {
    if (role === 'public') {
      const publicUser: User = {
        id: 'public_guest',
        name: 'Pemohon Publik',
        email: 'warga@public.id',
        role: 'public',
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(publicUser);
      storage.setCurrentUser(publicUser);
      return;
    }

    const currentList = storage.getUsers();
    const matched = currentList.find((u) => u.role === role);
    if (matched) {
      setCurrentUser(matched);
      storage.setCurrentUser(matched);
    }
  };

  const loginAs = (userId: string) => {
    const currentList = storage.getUsers();
    const user = currentList.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      storage.setCurrentUser(user);
    }
  };

  const loginWithCredentials = (emailOrNip: string, password?: string) => {
    const res = storage.authenticateUser(emailOrNip, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      refreshUsers();
    }
    return res;
  };

  const logout = () => {
    switchRole('public');
  };

  const permissions = ROLE_PERMISSIONS[currentUser.role] || ROLE_PERMISSIONS.public;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser.role,
        permissions,
        switchRole,
        loginAs,
        loginWithCredentials,
        logout,
        allUsers,
        refreshUsers,
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
