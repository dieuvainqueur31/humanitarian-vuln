import React, { useState } from 'react';
import {
  AuthContext,
  type UserRole,
} from './AuthContextObject';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );

  const [userEmail, setUserEmail] = useState<string | null>(
    localStorage.getItem('userEmail')
  );

  const [userRole, setUserRole] = useState<UserRole | null>(
    (localStorage.getItem('userRole') as UserRole) || null
  );

  const login = (
    newToken: string,
    email: string,
    role: UserRole
  ) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);

    setToken(newToken);
    setUserEmail(email);
    setUserRole(role);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');

    setToken(null);
    setUserEmail(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userEmail,
        userRole,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export type { UserRole };
