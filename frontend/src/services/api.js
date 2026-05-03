import axios from 'axios';

// Backend URL'sini çevresel değişkenden al veya varsayılanı kullan
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Merkezi Axios instance oluşturuluyor
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Her istekte (eğer varsa) Access Token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 hatası (Token süresi dolduğunda) yenileme mantığı
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Eğer 401 döndüyse ve istek daha önce tekrar edilmediyse (sonsuz döngüyü önle)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Eğer /auth/login veya /auth/refresh isteği 401 döndüyse yenileme yapma (kullanıcı çıkışa zorlanır)
      if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Zaten token yenileniyorsa, bu isteği kuyruğa al
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        // Refresh token yoksa kullanıcıyı çıkışa zorla
        isRefreshing = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        // Yeni tokenleri kaydet
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        api.defaults.headers.common['Authorization'] = 'Bearer ' + data.access_token;
        originalRequest.headers['Authorization'] = 'Bearer ' + data.access_token;

        processQueue(null, data.access_token);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // Refresh token de geçersizse temizle ve giriş sayfasına at
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
