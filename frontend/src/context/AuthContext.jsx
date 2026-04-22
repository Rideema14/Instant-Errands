import { createContext, useContext, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('qs_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const persist = (data) => {
    localStorage.setItem('qs_token', data.token);
    localStorage.setItem('qs_user', JSON.stringify(data));
    setUser(data);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      persist(data);
      return { success: true, role: data.role };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally { setLoading(false); }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', payload);
      persist(data);
      return { success: true, role: data.role };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally { setLoading(false); }
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      const updated = { ...user, ...data };
      localStorage.setItem('qs_user', JSON.stringify(updated));
      setUser(updated);
    } catch {}
  };

  const logout = () => {
    localStorage.removeItem('qs_token');
    localStorage.removeItem('qs_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
