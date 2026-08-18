import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('mess_token');
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
          } else {
            localStorage.removeItem('mess_token');
          }
        } catch (err) {
          localStorage.removeItem('mess_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        const userData = res.data.data;
        localStorage.setItem('mess_token', userData.token);
        setUser(userData);
        showToast('Login successful! Welcome back.', 'success');
        return { success: true, role: userData.role };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      showToast(errMsg, 'error');
      return { success: false, message: errMsg };
    }
  };

  const register = async (formData) => {
    try {
      const res = await API.post('/auth/register', formData);
      if (res.data.success) {
        const userData = res.data.data;
        localStorage.setItem('mess_token', userData.token);
        setUser(userData);
        showToast('Registration successful!', 'success');
        return { success: true, role: userData.role };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed.';
      showToast(errMsg, 'error');
      return { success: false, message: errMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('mess_token');
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        toast,
        showToast,
        hideToast
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
