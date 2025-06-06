import { create } from 'zustand'
import { useOrganizationStore } from './organizationStore';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImageUrl: string;
  organization?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  logout: () => void; 
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    useOrganizationStore.getState().resetOrg();
    set({ token: null, user: null });

  }
}));


export const getToken = (): string | null => useAuthStore.getState().token;
