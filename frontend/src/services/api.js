// services/api.js
const API_BASE_URL = 'http://localhost:8000/api';

// Headers comunes para las peticiones
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

// Manejo de errores común
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// Función para crear factura completa
export const crearFacturaCompleta = async (datosFactura) => {
  try {
    console.log('Enviando datos de factura:', datosFactura);
    
    const response = await fetch(`${API_BASE_URL}/facturas/crear-completa/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(datosFactura),
    });

    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error('Error en crearFacturaCompleta:', error);
    throw error;
  }
};

// Funciones para obtener datos
export const obtenerClientes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/clientes/`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    throw error;
  }
};

export const obtenerEmpleados = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/empleados/`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error obteniendo empleados:', error);
    throw error;
  }
};

export const obtenerJoyas = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/joyas/`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error obteniendo joyas:', error);
    throw error;
  }
};

export const obtenerServicios = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/servicios/`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    throw error;
  }
};

export const obtenerMateriales = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/materiales/`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error obteniendo materiales:', error);
    throw error;
  }
};

export const obtenerInsumos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/insumos/`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error obteniendo insumos:', error);
    throw error;
  }
};

// Funciones adicionales para el módulo de facturación
export const obtenerFacturas = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/facturas/`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error obteniendo facturas:', error);
    throw error;
  }
};

export const obtenerFacturaPorId = async (numeroFactura) => {
  try {
    const response = await fetch(`${API_BASE_URL}/facturas/${numeroFactura}/`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error obteniendo factura:', error);
    throw error;
  }
};

export const actualizarEstadoPago = async (numeroFactura, datosPago) => {
  try {
    const response = await fetch(`${API_BASE_URL}/facturas/${numeroFactura}/estado-pago/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(datosPago),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error actualizando estado de pago:', error);
    throw error;
  }
};