import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors">
            <Store size={32} />
            <span className="text-2xl font-bold tracking-tight text-surface-900">LocalShop</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-surface-900">
            Hesabınıza giriş yapın
          </h2>
          <p className="mt-2 text-sm text-surface-600">
            veya{' '}
            <Link to="/auth/register" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              yeni bir hesap oluşturun
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6 card p-8" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1" htmlFor="email">
                E-posta Adresi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field"
                placeholder="ornek@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1" htmlFor="password">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-surface-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-surface-900 cursor-pointer">
                Beni hatırla
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                Şifremi unuttum
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full group"
          >
            {isLoading ? (
              <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
            ) : null}
            Giriş Yap
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
