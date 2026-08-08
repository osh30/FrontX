import { API_BASE } from '../config/api';
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AlumniAuthContext = createContext(null);

const TOKEN_KEY = 'alumniToken';
const USER_KEY = 'alumniUser';
const API_URL = API_BASE;

export const AlumniAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const loadUser = async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      if (res.data.user.role !== 'alumni') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(res.data.user);
      setToken(storedToken);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUser(); }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password, selectedRole: 'alumni' });
    const { token: newToken, user: newUser } = res.data;
    if (newUser.role !== 'alumni') {
      return { success: false, error: 'Invalid alumni account' };
    }
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(newUser);
    return { success: true, role: 'alumni' };
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const getToken = () => localStorage.getItem(TOKEN_KEY);

  return (
    <AlumniAuthContext.Provider value={{
      user, loading, token,
      login, logout, getToken,
      isAuthenticated: !!user,
    }}>
      {children}
    </AlumniAuthContext.Provider>
  );
};

export const useAlumniAuth = () => {
  const ctx = useContext(AlumniAuthContext);
  if (!ctx) throw new Error('useAlumniAuth must be inside AlumniAuthProvider');
  return ctx;
};

export default AlumniAuthContext;
