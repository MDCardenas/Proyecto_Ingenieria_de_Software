/**
 * Utilidades de validación con expresiones regulares
 * Para garantizar datos limpios y sin falsos positivos
 */

// ============================================
// EXPRESIONES REGULARES
// ============================================

export const REGEX_PATTERNS = {
  // Solo letras (incluyendo acentos y espacios)
  SOLO_LETRAS: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,

  // Solo números
  SOLO_NUMEROS: /^\d+$/,

  // Números con decimales
  NUMERO_DECIMAL: /^\d+(\.\d{1,2})?$/,

  // Email válido
  EMAIL: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,

  // Teléfono Honduras (8 dígitos con formato opcional)
  TELEFONO_HN: /^[2-9]\d{3}-?\d{4}$/,

  // RTN Honduras (14 dígitos con guiones opcionales)
  RTN_HN: /^\d{4}-?\d{4}-?\d{6}$/,

  // Número de identidad Honduras (13 dígitos con guiones opcionales)
  IDENTIDAD_HN: /^\d{4}-?\d{4}-?\d{5}$/,

  // Dirección válida (letras, números, espacios y caracteres especiales comunes)
  DIRECCION: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s,.\-#]+$/,

  // Usuario (letras, números y guiones bajos, mínimo 3 caracteres)
  USUARIO: /^[a-zA-Z0-9_]{3,20}$/,

  // Contraseña (mínimo 6 caracteres)
  CONTRASENA: /^.{6,}$/,

  // Nombre de producto/material (letras, números, espacios y algunos especiales)
  NOMBRE_PRODUCTO: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-().]+$/,

  // Código alfanumérico
  CODIGO: /^[a-zA-Z0-9\-]+$/
};

// ============================================
// MENSAJES DE ERROR
// ============================================

export const MENSAJES_ERROR = {
  SOLO_LETRAS: 'Solo se permiten letras',
  SOLO_NUMEROS: 'Solo se permiten números',
  NUMERO_DECIMAL: 'Ingrese un número válido (máximo 2 decimales)',
  EMAIL: 'Ingrese un correo electrónico válido (ejemplo@dominio.com)',
  TELEFONO_HN: 'Ingrese un teléfono válido de Honduras (8 dígitos, ej: 9999-9999)',
  RTN_HN: 'Ingrese un RTN válido (14 dígitos, ej: 0801-1234-567890)',
  IDENTIDAD_HN: 'Ingrese un número de identidad válido (13 dígitos, ej: 0801-1990-12345)',
  DIRECCION: 'Ingrese una dirección válida',
  USUARIO: 'Usuario debe tener entre 3-20 caracteres (letras, números y guión bajo)',
  CONTRASENA: 'La contraseña debe tener al menos 6 caracteres',
  NOMBRE_PRODUCTO: 'Nombre inválido. Use letras, números y caracteres básicos',
  CODIGO: 'Código inválido. Use solo letras, números y guiones',
  CAMPO_REQUERIDO: 'Este campo es requerido',
  VALOR_MINIMO: 'El valor debe ser mayor a',
  LONGITUD_MINIMA: 'Debe tener al menos',
  LONGITUD_MAXIMA: 'No puede exceder'
};

// ============================================
// FUNCIONES DE VALIDACIÓN
// ============================================

/**
 * Valida un campo contra una expresión regular
 */
export const validarCampo = (valor, pattern) => {
  if (!valor || valor.trim() === '') return { valido: false, error: MENSAJES_ERROR.CAMPO_REQUERIDO };

  const valido = pattern.test(valor.trim());
  return { valido, error: valido ? null : 'Formato inválido' };
};

/**
 * Valida nombre (solo letras)
 */
export const validarNombre = (valor) => {
  if (!valor || valor.trim() === '') {
    return { valido: false, error: MENSAJES_ERROR.CAMPO_REQUERIDO };
  }

  const valido = REGEX_PATTERNS.SOLO_LETRAS.test(valor.trim());
  return {
    valido,
    error: valido ? null : MENSAJES_ERROR.SOLO_LETRAS
  };
};

/**
 * Valida email
 */
export const validarEmail = (valor) => {
  if (!valor || valor.trim() === '') {
    return { valido: false, error: MENSAJES_ERROR.CAMPO_REQUERIDO };
  }

  const valido = REGEX_PATTERNS.EMAIL.test(valor.trim());
  return {
    valido,
    error: valido ? null : MENSAJES_ERROR.EMAIL
  };
};

/**
 * Valida teléfono Honduras
 */
export const validarTelefono = (valor, requerido = false) => {
  if (!valor || valor.trim() === '') {
    return { valido: !requerido, error: requerido ? MENSAJES_ERROR.CAMPO_REQUERIDO : null };
  }

  const valido = REGEX_PATTERNS.TELEFONO_HN.test(valor.trim());
  return {
    valido,
    error: valido ? null : MENSAJES_ERROR.TELEFONO_HN
  };
};

/**
 * Valida RTN
 */
export const validarRTN = (valor, requerido = false) => {
  if (!valor || valor.trim() === '') {
    return { valido: !requerido, error: requerido ? MENSAJES_ERROR.CAMPO_REQUERIDO : null };
  }

  const valido = REGEX_PATTERNS.RTN_HN.test(valor.trim());
  return {
    valido,
    error: valido ? null : MENSAJES_ERROR.RTN_HN
  };
};

/**
 * Valida número de identidad
 */
export const validarIdentidad = (valor) => {
  if (!valor || valor.trim() === '') {
    return { valido: false, error: MENSAJES_ERROR.CAMPO_REQUERIDO };
  }

  const valido = REGEX_PATTERNS.IDENTIDAD_HN.test(valor.trim());
  return {
    valido,
    error: valido ? null : MENSAJES_ERROR.IDENTIDAD_HN
  };
};

/**
 * Valida dirección
 */
export const validarDireccion = (valor) => {
  if (!valor || valor.trim() === '') {
    return { valido: false, error: MENSAJES_ERROR.CAMPO_REQUERIDO };
  }

  // Verificar longitud mínima
  if (valor.trim().length < 10) {
    return { valido: false, error: 'La dirección debe tener al menos 10 caracteres' };
  }

  const valido = REGEX_PATTERNS.DIRECCION.test(valor.trim());
  return {
    valido,
    error: valido ? null : MENSAJES_ERROR.DIRECCION
  };
};

/**
 * Valida usuario
 */
export const validarUsuario = (valor) => {
  if (!valor || valor.trim() === '') {
    return { valido: false, error: MENSAJES_ERROR.CAMPO_REQUERIDO };
  }

  const valido = REGEX_PATTERNS.USUARIO.test(valor.trim());
  return {
    valido,
    error: valido ? null : MENSAJES_ERROR.USUARIO
  };
};

/**
 * Valida contraseña
 */
export const validarContrasena = (valor) => {
  if (!valor || valor.trim() === '') {
    return { valido: false, error: MENSAJES_ERROR.CAMPO_REQUERIDO };
  }

  const valido = REGEX_PATTERNS.CONTRASENA.test(valor);
  return {
    valido,
    error: valido ? null : MENSAJES_ERROR.CONTRASENA
  };
};

/**
 * Valida número entero positivo
 */
export const validarNumeroEntero = (valor, min = 0) => {
  if (valor === '' || valor === null || valor === undefined) {
    return { valido: false, error: MENSAJES_ERROR.CAMPO_REQUERIDO };
  }

  const num = parseInt(valor);
  if (isNaN(num) || num < min) {
    return { valido: false, error: `${MENSAJES_ERROR.VALOR_MINIMO} ${min}` };
  }

  return { valido: true, error: null };
};

/**
 * Valida número decimal positivo
 */
export const validarNumeroDecimal = (valor, min = 0) => {
  if (valor === '' || valor === null || valor === undefined) {
    return { valido: false, error: MENSAJES_ERROR.CAMPO_REQUERIDO };
  }

  const num = parseFloat(valor);
  if (isNaN(num) || num < min) {
    return { valido: false, error: `${MENSAJES_ERROR.VALOR_MINIMO} ${min}` };
  }

  if (!REGEX_PATTERNS.NUMERO_DECIMAL.test(valor.toString())) {
    return { valido: false, error: MENSAJES_ERROR.NUMERO_DECIMAL };
  }

  return { valido: true, error: null };
};

/**
 * Valida nombre de producto
 */
export const validarNombreProducto = (valor) => {
  if (!valor || valor.trim() === '') {
    return { valido: false, error: MENSAJES_ERROR.CAMPO_REQUERIDO };
  }

  if (valor.trim().length < 3) {
    return { valido: false, error: 'El nombre debe tener al menos 3 caracteres' };
  }

  const valido = REGEX_PATTERNS.NOMBRE_PRODUCTO.test(valor.trim());
  return {
    valido,
    error: valido ? null : MENSAJES_ERROR.NOMBRE_PRODUCTO
  };
};

/**
 * Formatea teléfono automáticamente
 */
export const formatearTelefono = (valor) => {
  const numeros = valor.replace(/\D/g, '');
  if (numeros.length <= 4) return numeros;
  return `${numeros.slice(0, 4)}-${numeros.slice(4, 8)}`;
};

/**
 * Formatea RTN automáticamente
 */
export const formatearRTN = (valor) => {
  const numeros = valor.replace(/\D/g, '');
  if (numeros.length <= 4) return numeros;
  if (numeros.length <= 8) return `${numeros.slice(0, 4)}-${numeros.slice(4)}`;
  return `${numeros.slice(0, 4)}-${numeros.slice(4, 8)}-${numeros.slice(8, 14)}`;
};

/**
 * Formatea identidad automáticamente
 */
export const formatearIdentidad = (valor) => {
  const numeros = valor.replace(/\D/g, '');
  if (numeros.length <= 4) return numeros;
  if (numeros.length <= 8) return `${numeros.slice(0, 4)}-${numeros.slice(4)}`;
  return `${numeros.slice(0, 4)}-${numeros.slice(4, 8)}-${numeros.slice(8, 13)}`;
};

// ============================================
// VALIDACIÓN DE FORMULARIOS COMPLETOS
// ============================================

/**
 * Valida todos los campos de un formulario cliente
 */
export const validarFormularioCliente = (datos) => {
  const errores = {};

  // Validar nombre
  const validNombre = validarNombre(datos.nombre);
  if (!validNombre.valido) errores.nombre = validNombre.error;

  // Validar apellido
  const validApellido = validarNombre(datos.apellido);
  if (!validApellido.valido) errores.apellido = validApellido.error;

  // Validar identidad
  const validIdentidad = validarIdentidad(datos.numero_identidad);
  if (!validIdentidad.valido) errores.numero_identidad = validIdentidad.error;

  // Validar teléfono
  const validTelefono = validarTelefono(datos.telefono, false);
  if (!validTelefono.valido) errores.telefono = validTelefono.error;

  // Validar correo
  if (datos.correo) {
    const validEmail = validarEmail(datos.correo);
    if (!validEmail.valido) errores.correo = validEmail.error;
  }

  // Validar dirección
  if (datos.direccion) {
    const validDireccion = validarDireccion(datos.direccion);
    if (!validDireccion.valido) errores.direccion = validDireccion.error;
  }

  // Validar RTN
  if (datos.rtn) {
    const validRTN = validarRTN(datos.rtn, false);
    if (!validRTN.valido) errores.rtn = validRTN.error;
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores
  };
};

/**
 * Valida todos los campos de un formulario empleado
 */
export const validarFormularioEmpleado = (datos) => {
  const errores = {};

  // Validar nombre
  const validNombre = validarNombre(datos.nombre);
  if (!validNombre.valido) errores.nombre = validNombre.error;

  // Validar apellido
  const validApellido = validarNombre(datos.apellido);
  if (!validApellido.valido) errores.apellido = validApellido.error;

  // Validar usuario
  const validUsuario = validarUsuario(datos.usuario);
  if (!validUsuario.valido) errores.usuario = validUsuario.error;

  // Validar contraseña (solo si es nuevo o se está cambiando)
  if (datos.contrasena) {
    const validContrasena = validarContrasena(datos.contrasena);
    if (!validContrasena.valido) errores.contrasena = validContrasena.error;
  }

  // Validar correo
  const validEmail = validarEmail(datos.correo);
  if (!validEmail.valido) errores.correo = validEmail.error;

  // Validar teléfono
  if (datos.telefono) {
    const validTelefono = validarTelefono(datos.telefono, false);
    if (!validTelefono.valido) errores.telefono = validTelefono.error;
  }

  // Validar salario
  if (datos.salario !== undefined && datos.salario !== '') {
    const validSalario = validarNumeroDecimal(datos.salario, 0);
    if (!validSalario.valido) errores.salario = validSalario.error;
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores
  };
};

export default {
  REGEX_PATTERNS,
  MENSAJES_ERROR,
  validarNombre,
  validarEmail,
  validarTelefono,
  validarRTN,
  validarIdentidad,
  validarDireccion,
  validarUsuario,
  validarContrasena,
  validarNumeroEntero,
  validarNumeroDecimal,
  validarNombreProducto,
  formatearTelefono,
  formatearRTN,
  formatearIdentidad,
  validarFormularioCliente,
  validarFormularioEmpleado
};
