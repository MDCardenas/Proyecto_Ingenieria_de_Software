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

  // Teléfono Honduras (8 dígitos, acepta formato 98765432 o 9876-5432)
  TELEFONO_HN: /^[2-9]\d{3}-?\d{4}$/,

  // RTN Honduras (14 dígitos con guiones opcionales)
  RTN_HN: /^\d{4}-?\d{4}-?\d{6}$/,

  // Número de identidad Honduras (13 dígitos con guiones opcionales)
  IDENTIDAD_HN: /^\d{4}-?\d{4}-?\d{5}$/,

  // Dirección válida (letras, números, espacios y caracteres especiales comunes)
  DIRECCION: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s,.\-#]+$/,

  // Usuario (debe empezar con letra, luego letras, números y guiones bajos, mínimo 3 caracteres)
  USUARIO: /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/,

  // Contraseña (mínimo 6 caracteres)
  CONTRASENA: /^.{6,}$/,

  // Nombre de producto/material (letras, números, espacios y algunos especiales)
  NOMBRE_PRODUCTO: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-().]+$/,

  // Nombre de proveedor (debe empezar con letra, puede contener números después)
  NOMBRE_PROVEEDOR: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ][a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-().&,]+$/,

  // Dirección con texto obligatorio (no solo números)
  DIRECCION_CON_TEXTO: /^(?=.*[a-zA-ZáéíóúÁÉÍÓÚñÑ])[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s,.\-#]+$/,

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
  TELEFONO_HN: 'Ingrese un teléfono válido de Honduras (8 dígitos, ej: 98765432 o 9876-5432)',
  RTN_HN: 'Ingrese un RTN válido (14 dígitos, ej: 0801-1234-567890)',
  IDENTIDAD_HN: 'Ingrese un número de identidad válido (13 dígitos, ej: 0801-1990-12345)',
  DIRECCION: 'Ingrese una dirección válida',
  USUARIO: 'Usuario debe empezar con letra y tener 3-20 caracteres (letras, números y guión bajo)',
  CONTRASENA: 'La contraseña debe tener al menos 6 caracteres',
  NOMBRE_PRODUCTO: 'Nombre inválido. Use letras, números y caracteres básicos',
  NOMBRE_PROVEEDOR: 'El nombre debe empezar con letra y no puede ser solo números (ej: Plasticos S.A)',
  DIRECCION_CON_TEXTO: 'La dirección debe contener texto, no solo números (ej: Calle Principal #123)',
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
  // Convertir a string para evitar errores
  const valorStr = valor != null ? String(valor) : '';

  if (!valorStr || valorStr.trim() === '') return { valido: false, error: MENSAJES_ERROR.CAMPO_REQUERIDO };

  const valido = pattern.test(valorStr.trim());
  return { valido, error: valido ? null : 'Formato inválido' };
};

/**
 * Valida nombre (solo letras)
 */
export const validarNombre = (valor) => {
  // Convertir a string para evitar errores
  const valorStr = valor != null ? String(valor) : '';

  if (!valorStr || valorStr.trim() === '') {
    return { valido: false, error: MENSAJES_ERROR.CAMPO_REQUERIDO };
  }

  const valido = REGEX_PATTERNS.SOLO_LETRAS.test(valorStr.trim());
  return {
    valido,
    error: valido ? null : MENSAJES_ERROR.SOLO_LETRAS
  };
};

/**
 * Valida email
 */
export const validarEmail = (valor) => {
  // Convertir a string para evitar errores
  const valorStr = valor != null ? String(valor) : '';

  if (!valorStr || valorStr.trim() === '') {
    return { valido: false, error: MENSAJES_ERROR.CAMPO_REQUERIDO };
  }

  const valido = REGEX_PATTERNS.EMAIL.test(valorStr.trim());
  return {
    valido,
    error: valido ? null : MENSAJES_ERROR.EMAIL
  };
};

/**
 * Valida teléfono Honduras
 */
export const validarTelefono = (valor, requerido = false) => {
  // Convertir a string para evitar errores con números
  const valorStr = valor != null ? String(valor) : '';

  if (!valorStr || valorStr.trim() === '') {
    return { valido: !requerido, error: requerido ? MENSAJES_ERROR.CAMPO_REQUERIDO : null };
  }

  const valido = REGEX_PATTERNS.TELEFONO_HN.test(valorStr.trim());
  return {
    valido,
    error: valido ? null : MENSAJES_ERROR.TELEFONO_HN
  };
};

/**
 * Valida RTN
 */
export const validarRTN = (valor, requerido = false) => {
  // Convertir a string para evitar errores
  const valorStr = valor != null ? String(valor) : '';

  if (!valorStr || valorStr.trim() === '') {
    return { valido: !requerido, error: requerido ? MENSAJES_ERROR.CAMPO_REQUERIDO : null };
  }

  const valido = REGEX_PATTERNS.RTN_HN.test(valorStr.trim());
  return {
    valido,
    error: valido ? null : MENSAJES_ERROR.RTN_HN
  };
};

/**
 * Valida número de identidad
 */
export const validarIdentidad = (valor) => {
  // Convertir a string para evitar errores
  const valorStr = valor != null ? String(valor) : '';

  if (!valorStr || valorStr.trim() === '') {
    return { valido: false, error: MENSAJES_ERROR.CAMPO_REQUERIDO };
  }

  const valido = REGEX_PATTERNS.IDENTIDAD_HN.test(valorStr.trim());
  return {
    valido,
    error: valido ? null : MENSAJES_ERROR.IDENTIDAD_HN
  };
};

/**
 * Valida dirección
 */
export const validarDireccion = (valor, requerido = true) => {
  // Convertir a string para evitar errores
  const valorStr = valor != null ? String(valor) : '';

  if (!valorStr || valorStr.trim() === '') {
    return { valido: !requerido, error: requerido ? MENSAJES_ERROR.CAMPO_REQUERIDO : null };
  }

  // Verificar longitud mínima
  if (valorStr.trim().length < 10) {
    return { valido: false, error: 'La dirección debe tener al menos 10 caracteres' };
  }

  const valido = REGEX_PATTERNS.DIRECCION.test(valorStr.trim());
  return {
    valido,
    error: valido ? null : MENSAJES_ERROR.DIRECCION
  };
};

/**
 * Valida usuario
 */
export const validarUsuario = (valor) => {
  // Convertir a string para evitar errores
  const valorStr = valor != null ? String(valor) : '';

  if (!valorStr || valorStr.trim() === '') {
    return { valido: false, error: MENSAJES_ERROR.CAMPO_REQUERIDO };
  }

  const valido = REGEX_PATTERNS.USUARIO.test(valorStr.trim());
  return {
    valido,
    error: valido ? null : MENSAJES_ERROR.USUARIO
  };
};

/**
 * Valida contraseña
 */
export const validarContrasena = (valor) => {
  // Convertir a string para evitar errores
  const valorStr = valor != null ? String(valor) : '';

  if (!valorStr || valorStr.trim() === '') {
    return { valido: false, error: MENSAJES_ERROR.CAMPO_REQUERIDO };
  }

  const valido = REGEX_PATTERNS.CONTRASENA.test(valorStr);
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
  // Convertir a string para evitar errores
  const valorStr = valor != null ? String(valor) : '';

  if (!valorStr || valorStr.trim() === '') {
    return { valido: false, error: MENSAJES_ERROR.CAMPO_REQUERIDO };
  }

  if (valorStr.trim().length < 3) {
    return { valido: false, error: 'El nombre debe tener al menos 3 caracteres' };
  }

  const valido = REGEX_PATTERNS.NOMBRE_PRODUCTO.test(valorStr.trim());
  return {
    valido,
    error: valido ? null : MENSAJES_ERROR.NOMBRE_PRODUCTO
  };
};

/**
 * Valida nombre de proveedor (debe empezar con letra, no puede ser solo números)
 */
export const validarNombreProveedor = (valor) => {
  // Convertir a string para evitar errores
  const valorStr = valor != null ? String(valor) : '';

  if (!valorStr || valorStr.trim() === '') {
    return { valido: false, error: MENSAJES_ERROR.CAMPO_REQUERIDO };
  }

  if (valorStr.trim().length < 3) {
    return { valido: false, error: 'El nombre debe tener al menos 3 caracteres' };
  }

  // Verificar que no sea solo números
  if (/^\d+$/.test(valorStr.trim())) {
    return { valido: false, error: 'El nombre no puede contener solo números' };
  }

  const valido = REGEX_PATTERNS.NOMBRE_PROVEEDOR.test(valorStr.trim());
  return {
    valido,
    error: valido ? null : MENSAJES_ERROR.NOMBRE_PROVEEDOR
  };
};

/**
 * Valida dirección con texto obligatorio (no solo números)
 */
export const validarDireccionConTexto = (valor, requerido = true) => {
  // Convertir a string para evitar errores
  const valorStr = valor != null ? String(valor) : '';

  if (!valorStr || valorStr.trim() === '') {
    return { valido: !requerido, error: requerido ? MENSAJES_ERROR.CAMPO_REQUERIDO : null };
  }

  // Verificar longitud mínima
  if (valorStr.trim().length < 10) {
    return { valido: false, error: 'La dirección debe tener al menos 10 caracteres' };
  }

  // Verificar que no sea solo números
  if (/^\d+$/.test(valorStr.trim())) {
    return { valido: false, error: 'La dirección no puede contener solo números' };
  }

  // Verificar que contenga al menos algunas letras
  const valido = REGEX_PATTERNS.DIRECCION_CON_TEXTO.test(valorStr.trim());
  return {
    valido,
    error: valido ? null : MENSAJES_ERROR.DIRECCION_CON_TEXTO
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

/**
 * Valida todos los campos de un formulario proveedor
 */
export const validarFormularioProveedor = (datos) => {
  const errores = {};

  // Validar nombre del proveedor (debe empezar con letra, no solo números)
  const validNombre = validarNombreProveedor(datos.nombre);
  if (!validNombre.valido) errores.nombre = validNombre.error;

  // Validar teléfono (opcional)
  if (datos.telefono) {
    const validTelefono = validarTelefono(datos.telefono, false);
    if (!validTelefono.valido) errores.telefono = validTelefono.error;
  }

  // Validar dirección (opcional, pero debe contener texto si se proporciona)
  if (datos.direccion) {
    const validDireccion = validarDireccionConTexto(datos.direccion, false);
    if (!validDireccion.valido) errores.direccion = validDireccion.error;
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
  validarDireccionConTexto,
  validarUsuario,
  validarContrasena,
  validarNumeroEntero,
  validarNumeroDecimal,
  validarNombreProducto,
  validarNombreProveedor,
  formatearTelefono,
  formatearRTN,
  formatearIdentidad,
  validarFormularioCliente,
  validarFormularioEmpleado,
  validarFormularioProveedor
};
