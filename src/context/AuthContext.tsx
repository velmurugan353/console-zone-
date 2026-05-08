import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  kyc_status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW' | 'REVERIFICATION_REQUESTED';
  kyc_address?: string;
  consolezone_id?: string;
  kyc_resubmissions?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string, role?: 'user' | 'admin') => Promise<void>;
  register: (email: string, password?: string, name?: string, phone?: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.PROD && !import.meta.env.VITE_API_URL_FORCE 
  ? '' 
  : (import.meta.env.VITE_API_URL || '');

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('consolezone_token');
    console.log('[AUTH] Checking session, token exists:', !!token);
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        console.log('[AUTH] Session valid:', data.username);
        setUser({
          id: data.id || data._id,
          name: data.username,
          email: data.email,
          role: data.role,
          kyc_status: data.kyc_status,
          consolezone_id: data.consolezone_id,
          avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'
        });
      } else {
        console.warn('[AUTH] Session invalid, status:', response.status);
        // If the server returns 401 or 403, the token is likely invalid or expired
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('consolezone_token');
        }
        setUser(null);
      }
    } catch (e) {
      console.error("[AUTH] Matrix uplink failure:", e);
      // Don't remove token on network error, only on auth error
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password?: string, role: 'user' | 'admin' = 'user') => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Login failed');

    localStorage.setItem('consolezone_token', data.token);
    setUser({
      id: data.user.id || data.user._id,
      name: data.user.username,
      email: data.user.email,
      role: data.user.role,
      kyc_status: data.user.kyc_status,
      consolezone_id: data.user.consolezone_id,
      avatar: data.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'
    });
  };

  const register = async (email: string, password?: string, name?: string, phone?: string) => {
    console.log('Attempting register with:', { email, username: name, phone });
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username: name || email.split('@')[0], phone })
    });

    console.log('Register response status:', response.status);
    const data = await response.json().catch(() => ({}));
    console.log('Register response data:', data);
    
    if (!response.ok) throw new Error(data.error || 'Registration failed');

    localStorage.setItem('consolezone_token', data.token);
    setUser({
      id: data.user.id,
      name: data.user.username,
      email: data.user.email,
      role: data.user.role,
      kyc_status: data.user.kyc_status,
      consolezone_id: data.user.consolezone_id,
      avatar: data.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'
    });
  };

  const loginWithGoogle = async (credential: string) => {
    const response = await fetch(`${API_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Google Login failed');

    localStorage.setItem('consolezone_token', data.token);
    setUser({
      id: data.user.id,
      name: data.user.username,
      email: data.user.email,
      role: data.user.role,
      kyc_status: data.user.kyc_status,
      consolezone_id: data.user.consolezone_id,
      avatar: data.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'
    });
  };

  const logout = async () => {
    localStorage.removeItem('consolezone_token');
    setUser(null);
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      loginWithGoogle,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      refreshUser,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
}
