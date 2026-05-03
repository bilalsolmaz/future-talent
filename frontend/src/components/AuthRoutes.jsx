import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return user ? <Outlet /> : <Navigate to="/auth/login" />;
};

export const AdminRoute = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/auth/login" />;

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <ShieldAlert size={64} className="text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-surface-900 mb-2">Erişim Engellendi</h1>
        <p className="text-surface-500 max-w-md">
          Bu sayfayı görüntülemek için yönetici (admin) yetkisine sahip olmalısınız.
        </p>
      </div>
    );
  }

  return <Outlet />;
};
