import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sayfa yüklendiğinde, local storage'da token varsa kullanıcıyı kontrol et
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Token geçerli mi diye backend'e sor (opsiyonel, güvenliği artırır)
          // Fakat şimdilik sadece localStorage'dan alıyoruz ki hızlı açılsın
          setUser(JSON.parse(savedUser));
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // FastAPI OAuth2 formu beklediği için URLSearchParams kullanıyoruz
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { access_token, refresh_token, user } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Giriş işlemi başarısız' 
      };
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/auth/register', userData);
      // Kayıt başarılıysa otomatik giriş yap
      return await login(userData.email, userData.password);
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Kayıt işlemi başarısız' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Auth sağlayıcısını sarmala
  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAdmin: user?.rol === 'admin' }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook kullanımı
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
