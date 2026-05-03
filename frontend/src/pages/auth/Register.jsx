import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    isim: '',
    telefon: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.passwordConfirm) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setIsLoading(true);

    // Backend'e gidecek veri formatı
    const submitData = {
      email: formData.email,
      password: formData.password,
      isim: formData.isim,
      telefon: formData.telefon || null
    };

    const result = await register(submitData);
    
    if (result.success) {
      navigate('/');
    } else {
      // Backend'den gelen Pydantic validation error array ise düzelt
      let errorMsg = result.message;
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg[0]?.msg || 'Kayıt başarısız oldu';
      }
      setError(typeof errorMsg === 'string' ? errorMsg : 'Bir hata oluştu');
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
            Yeni Hesap Oluştur
          </h2>
          <p className="mt-2 text-sm text-surface-600">
            Zaten hesabınız var mı?{' '}
            <Link to="/auth/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              Giriş yapın
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
              <label className="block text-sm font-medium text-surface-700 mb-1" htmlFor="isim">
                Ad Soyad
              </label>
              <input
                id="isim"
                name="isim"
                type="text"
                required
                className="input-field"
                placeholder="Adınız Soyadınız"
                value={formData.isim}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1" htmlFor="email">
                E-posta Adresi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="ornek@mail.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1" htmlFor="telefon">
                Telefon Numarası (Opsiyonel)
              </label>
              <input
                id="telefon"
                name="telefon"
                type="tel"
                className="input-field"
                placeholder="05XX XXX XX XX"
                value={formData.telefon}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1" htmlFor="password">
                  Şifre
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-field"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1" htmlFor="passwordConfirm">
                  Şifre Tekrar
                </label>
                <input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  required
                  className="input-field"
                  placeholder="••••••••"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
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
            Kayıt Ol
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
