import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const ROLE_TOKEN_MAP = {
  student: 'studentToken',
  alumni: 'alumniToken',
  recruiter: 'recruiterToken',
  admin: 'adminToken',
};

const getStoredToken = () => {
  const currentRole = localStorage.getItem('currentRole');
  if (currentRole && ROLE_TOKEN_MAP[currentRole]) {
    const token = localStorage.getItem(ROLE_TOKEN_MAP[currentRole]);
    if (token) return { role: currentRole, token };
  }
  for (const role of ['student', 'alumni', 'recruiter', 'admin']) {
    const token = localStorage.getItem(ROLE_TOKEN_MAP[role]);
    if (token) return { role, token };
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const stored = getStoredToken();
  const [token, setToken] = useState(stored?.token || null);
  const [currentRole, setCurrentRole] = useState(stored?.role || null);
  const [socket, setSocket] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  const persistToken = (role, newToken) => {
    const key = ROLE_TOKEN_MAP[role];
    localStorage.setItem(key, newToken);
    localStorage.setItem('currentRole', role);
    localStorage.setItem('token', newToken);
  };

  const clearToken = (role) => {
    if (!role) return;
    const key = ROLE_TOKEN_MAP[role];
    localStorage.removeItem(key);
    localStorage.removeItem('currentRole');
    localStorage.removeItem('token');
  };

  const login = async (email, password, selectedRole, turnstileToken) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password, selectedRole, turnstileToken });
      const { token: newToken, user: newUser } = response.data;

      persistToken(newUser.role, newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setCurrentRole(newUser.role);
      setUser(newUser);

      return { success: true, role: newUser.role };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const adminLogin = async (email, password, turnstileToken) => {
    try {
      const response = await axios.post(`${API_URL}/auth/admin/login`, { email, password, turnstileToken });
      const { token: newToken, user: newUser } = response.data;

      persistToken('admin', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setCurrentRole('admin');
      setUser(newUser);

      return { success: true, role: 'admin' };
    } catch (error) {
      console.error('Admin login error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      const { token: newToken, user: newUser } = response.data;

      persistToken(newUser.role, newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setCurrentRole(newUser.role);
      setUser(newUser);

      return { success: true, role: newUser.role };
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    const role = currentRole;
    localStorage.removeItem('user');
    clearToken(role);
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setCurrentRole(null);
    setUser(null);

    try {
      const socket = io('http://localhost:5000');
      if (socket) {
        socket.disconnect();
      }
    } catch (e) {
      console.error(e);
    }

    window.location.href = role === 'admin' ? '/admin/login' : '/login';
  };

  const loadUser = async () => {
    const stored = getStoredToken();
    const currentToken = stored?.token || null;

    if (!currentToken) {
      setLoading(false);
      return;
    }

    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
      const response = await axios.get(`${API_URL}/auth/me`);
      const loadedRole = response.data.user.role;
      setUser(response.data.user);
      setCurrentRole(loadedRole);
      setToken(currentToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('currentRole', loadedRole);
    } catch (error) {
      console.error('[AuthContext] loadUser /me FAILED:', error.response?.status, error.response?.data);
      const stored = getStoredToken();
      if (stored) clearToken(stored.role);
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setToken(null);
      setCurrentRole(null);
    } finally {
      setLoading(false);
    }
  };

  const updateTheme = async (newTheme) => {
    try {
      await axios.put(`${API_URL}/users/theme`, { themePreference: newTheme });
      setUser(prev => {
        const updated = { ...prev, themePreference: newTheme };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && !user) {
      setUser(JSON.parse(savedUser));
    }
    loadUser();

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    newSocket.on('profile_updated', (data) => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (currentUser && data.userId === (currentUser.id || currentUser._id)) {
        loadUser();
      }
    });

    return () => newSocket.disconnect();
  }, []);

  // Theme application logic
  useEffect(() => {
    const applyTheme = (theme) => {
      const root = window.document.documentElement;
      const isDark = 
        theme === 'dark' || 
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    const currentTheme = user?.themePreference || 'system';
    applyTheme(currentTheme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (currentTheme === 'system') applyTheme('system');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [user?.themePreference]);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      adminLogin,
      register,
      logout,
      loading,
      socket,
      isAuthenticated: !!user,
      updateTheme
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
