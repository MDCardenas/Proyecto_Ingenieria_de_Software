import axios from 'axios';

const api = axios.create({
  baseURL: 'http://20.64.150.5:8000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error de API:', error);
    return Promise.reject(error);
  }
);

export default api;