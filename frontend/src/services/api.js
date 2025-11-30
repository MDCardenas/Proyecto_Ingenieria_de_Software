import axios from 'axios';

// Determinar la URL de la API basado en la variable de entorno
const isLocal = import.meta.env.VITE_ENVIRONMENT === 'local';
const apiURL = isLocal
  ? import.meta.env.VITE_API_URL_LOCAL
  : import.meta.env.VITE_API_URL_NETWORK;

console.log(`📡 API configurada en modo: ${isLocal ? 'LOCAL' : 'NETWORK'}`);
console.log(`🔗 API URL: ${apiURL}`);

const api = axios.create({
  baseURL: apiURL,
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