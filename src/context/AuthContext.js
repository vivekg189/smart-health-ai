import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hydrate from localStorage first for hard refreshes
    try {
      const stored = localStorage.getItem('healthai_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (_) {}

    // Then verify session with backend (non-blocking for UI already showing)
    fetch('http://localhost:5000/api/auth/me', {
      credentials: 'include'
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) {
          setUser(data.user);
          localStorage.setItem('healthai_user', JSON.stringify(data.user));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem('healthai_user', JSON.stringify(userData));
    } catch (_) {}
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    try {
      localStorage.removeItem('healthai_user');
    } catch (_) {}
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
