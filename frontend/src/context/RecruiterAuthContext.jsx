import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const RecruiterAuthContext = createContext(null);

const TOKEN_KEY = 'recruiterToken';
const USER_KEY = 'recruiterUser';
const API_URL = 'http://localhost:5000/api';

export const RecruiterAuthProvider = ({ children }) => {
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
      if (res.data.user.role !== 'recruiter') {
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
    const res = await axios.post(`${API_URL}/auth/login`, { email, password, selectedRole: 'recruiter' });
    const { token: newToken, user: newUser } = res.data;
    if (newUser.role !== 'recruiter') {
      return { success: false, error: 'Invalid recruiter account' };
    }
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(newUser);
    return { success: true, role: 'recruiter' };
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
    <RecruiterAuthContext.Provider value={{
      user, loading, token,
      login, logout, getToken,
      isAuthenticated: !!user,
    }}>
      {children}
    </RecruiterAuthContext.Provider>
  );
};

export const useRecruiterAuth = () => {
  const ctx = useContext(RecruiterAuthContext);
  if (!ctx) throw new Error('useRecruiterAuth must be inside RecruiterAuthProvider');
  return ctx;
};

export default RecruiterAuthContext;
