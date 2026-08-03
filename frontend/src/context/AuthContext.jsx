import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/endpoints';
import { setAccessToken } from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking existing session

  // Try to silently restore session on first load using the refresh cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await authApi.refresh();
        setAccessToken(data.accessToken);
        setUser(data.user);
      } catch (err) {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // If axios interceptor detects a failed refresh mid-session, log out cleanly
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      setAccessToken(null);
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authApi.register(formData);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (formData) => {
    const { data } = await authApi.login(formData);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // even if the API call fails, clear local state so UI doesn't get stuck
    } finally {
      setAccessToken(null);
      setUser(null);
      toast.success('Logged out');
    }
  }, []);

  const value = { user, loading, register, login, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
