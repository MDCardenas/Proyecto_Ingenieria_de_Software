// utils/normalize.js

/**
 * Normaliza texto para búsquedas estrictas (solo letras y números)
 * Elimina tildes, caracteres especiales y convierte a minúsculas
 */
export const normalizeText = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina tildes
    .replace(/[^a-z0-9]/g, ''); // Solo letras y números
};

/**
 * Normaliza texto para búsquedas más flexibles (incluye espacios)
 * Elimina tildes pero mantiene espacios para búsquedas por nombre
 */
export const normalizeSearch = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina tildes
    .replace(/[^a-z0-9\s]/g, '') // Letras, números y espacios
    .replace(/\s+/g, ' ') // Espacios múltiples a uno
    .trim();
};

/**
 * Normaliza números de identidad (elimina guiones)
 */
export const normalizeIdentidad = (identidad) => {
  if (!identidad) return '';
  
  return identidad
    .toString()
    .replace(/[^0-9]/g, ''); // Solo números
};

/**
 * Formatea número de identidad con guiones
 */
export const formatIdentidad = (identidad) => {
  if (!identidad) return '';
  
  const clean = normalizeIdentidad(identidad);
  if (clean.length !== 13) return clean;
  
  return `${clean.substring(0, 4)}-${clean.substring(4, 8)}-${clean.substring(8, 13)}`;
};