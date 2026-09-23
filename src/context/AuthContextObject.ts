import { createContext } from 'react';

export type UserRole =
  | 'VERIFIER'
  | 'ADMIN'
  | 'COMMUNITY_REPORTER'
  | 'FIELD_AGENT'
  | 'NGO_MANAGER'
  | 'ANALYST';

export interface AuthState {
  token: string | null;
  userEmail: string | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  login: (token: string, email: string, role: UserRole) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);