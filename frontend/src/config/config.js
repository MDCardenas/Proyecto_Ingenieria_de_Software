// Configuración centralizada de URLs de la API

// Determinar si estamos en modo local o network
const isLocal = import.meta.env.VITE_ENVIRONMENT === 'local';

// Obtener la URL base según el modo
export const API_BASE_URL = isLocal
  ? import.meta.env.VITE_API_URL_LOCAL || 'http://localhost:8000/api'
  : import.meta.env.VITE_API_URL_NETWORK || 'http://20.64.150.5:8000/api';

// URL del backend (sin /api)
export const BACKEND_URL = isLocal
  ? import.meta.env.VITE_BACKEND_URL_LOCAL || 'http://localhost:8000'
  : import.meta.env.VITE_BACKEND_URL_NETWORK || 'http://20.64.150.5:8000';

// Logs para debugging
console.log(`🌐 Configuración de API:`);
console.log(`   Modo: ${isLocal ? 'LOCAL' : 'NETWORK'}`);
console.log(`   API URL: ${API_BASE_URL}`);
console.log(`   Backend URL: ${BACKEND_URL}`);

// Exportar también las URLs completas de endpoints comunes
export const ENDPOINTS = {
  clientes: `${API_BASE_URL}/clientes/`,
  empleados: `${API_BASE_URL}/empleados/`,
  materiales: `${API_BASE_URL}/materiales/`,
  joyas: `${API_BASE_URL}/joyas/`,
  cotizaciones: `${API_BASE_URL}/cotizaciones/`,
  facturas: `${API_BASE_URL}/facturas/`,
  perfiles: `${API_BASE_URL}/perfiles/`,
  contabilidad: `${API_BASE_URL}/contabilidad/`,
};
