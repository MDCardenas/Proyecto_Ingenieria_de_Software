// components/cotizacionesComponentes/DatosCliente.jsx
import React, { useState, useRef, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { normalizeText, normalizeSearch } from "../../utils/normalize";

// ============================================
// UTILIDADES DE VALIDACIÓN CON REGEX
// ============================================
const validaciones = {
    // Teléfono Honduras (8 dígitos, permite guión)
    telefono: (valor) => /^[0-9]{4}-?[0-9]{4}$/.test(valor),
    
    // RTN Honduras (14 dígitos con guiones)
    rtn: (valor) => /^\d{4}-\d{4}-\d{5}-\d{1}$/.test(valor),
    
    // Dirección (debe contener letras, puede tener números)
    direccion: (valor) => {
        if (!valor || valor.trim() === '') return true;
        const soloNumeros = /^\d+$/;
        const contieneLetras = /[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/.test(valor);
        return contieneLetras && !soloNumeros.test(valor) && valor.length >= 10;
    },
    
    // Texto general (sin caracteres peligrosos)
    textoSeguro: (valor) => /^[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,;:()\-"'¿?¡!]*$/.test(valor),
};

// Función para formatear teléfono
const formatearTelefono = (valor) => {
    // Eliminar todo excepto números
    const numeros = valor.replace(/\D/g, '');
    
    // Formatear como xxxx-xxxx
    if (numeros.length <= 4) {
        return numeros;
    }
    return `${numeros.slice(0, 4)}-${numeros.slice(4, 8)}`;
};

// Función para formatear RTN
const formatearRTN = (valor) => {
    // Eliminar todo excepto números
    const numeros = valor.replace(/\D/g, '');
    
    // Formatear como xxxx-xxxx-xxxxx-x
    if (numeros.length <= 4) return numeros;
    if (numeros.length <= 8) return `${numeros.slice(0, 4)}-${numeros.slice(4)}`;
    if (numeros.length <= 13) return `${numeros.slice(0, 4)}-${numeros.slice(4, 8)}-${numeros.slice(8)}`;
    return `${numeros.slice(0, 4)}-${numeros.slice(4, 8)}-${numeros.slice(8, 13)}-${numeros.slice(13, 14)}`;
};

// Función para sanitizar valores
const sanitizar = {
    texto: (valor) => valor.trim().replace(/\s+/g, ' '),
    telefono: (valor) => valor.replace(/[^0-9-]/g, '').slice(0, 9),
};

// ============================================
// FUNCIONES AUXILIARES PARA EMPLEADOS
// ============================================

/**
 * Obtiene el nombre completo de un empleado con fallback inteligente
 * @param {Object} empleado - Objeto empleado
 * @returns {string} - Nombre completo o fallback apropiado
 */
const obtenerNombreCompletoEmpleado = (empleado) => {
  if (!empleado) return "Empleado no encontrado";
  
  const nombre = (empleado.nombre || '').trim();
  const apellido = (empleado.apellido || '').trim();
  
  // Si tiene nombre y apellido, mostrarlos
  if (nombre && apellido) {
    return `${nombre} ${apellido}`;
  }
  
  // Si solo tiene nombre
  if (nombre) {
    return nombre;
  }
  
  // Si solo tiene apellido
  if (apellido) {
    return apellido;
  }
  
  // Si tiene usuario, usarlo como fallback
  if (empleado.usuario) {
    return `Usuario: ${empleado.usuario}`;
  }
  
  // Último recurso: mostrar el ID
  const id = empleado.id_empleado || empleado.id;
  return id ? `Empleado #${id}` : "Sin nombre";
};

/**
 * Obtiene información secundaria del empleado (ID y usuario)
 * @param {Object} empleado - Objeto empleado
 * @returns {string} - Información formateada
 */
const obtenerInfoSecundariaEmpleado = (empleado) => {
  if (!empleado) return 'Info no disponible';
  
  const id = empleado.id_empleado || empleado.id || 'N/A';
  const usuario = empleado.usuario || 'N/A';
  
  return `ID: ${id} | Usuario: ${usuario}`;
};

export default function DatosCliente({ 
  datosFactura, 
  clientes, 
  empleados, 
  onActualizar, 
  onClienteChange,
  errores, 
  onCambioCampo 
}) {
  // Estados para búsqueda de clientes
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [mostrarResultadosCliente, setMostrarResultadosCliente] = useState(false);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  
  // Estados para búsqueda de empleados
  const [busquedaEmpleado, setBusquedaEmpleado] = useState("");
  const [mostrarResultadosEmpleado, setMostrarResultadosEmpleado] = useState(false);
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
  
  // Estados para errores de validación
  const [erroresLocal, setErroresLocal] = useState({});
  
  // Referencias para detectar clics fuera
  const refBusquedaCliente = useRef(null);
  const refBusquedaEmpleado = useRef(null);

  // Detectar clics fuera de los resultados
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (refBusquedaCliente.current && !refBusquedaCliente.current.contains(event.target)) {
        setMostrarResultadosCliente(false);
      }
      if (refBusquedaEmpleado.current && !refBusquedaEmpleado.current.contains(event.target)) {
        setMostrarResultadosEmpleado(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar clientes en tiempo real - MEJORADO
  useEffect(() => {
    if (busquedaCliente.trim() === "") {
      setClientesFiltrados([]);
      setMostrarResultadosCliente(false);
      return;
    }

    const searchNormalized = normalizeText(busquedaCliente);
    
    const filtrados = clientes.filter(c => {
      const nombreCompleto = normalizeText(`${c.nombre || ''} ${c.apellido || ''}`);
      const numeroIdentidad = normalizeText(c.numero_identidad || '');
      const rtn = normalizeText(c.rtn || '');
      
      return nombreCompleto.includes(searchNormalized) || 
             numeroIdentidad.includes(searchNormalized) ||
             rtn.includes(searchNormalized);
    });

    setClientesFiltrados(filtrados);
    setMostrarResultadosCliente(filtrados.length > 0);
  }, [busquedaCliente, clientes]);

  // Filtrar empleados en tiempo real - MEJORADO CON VALIDACIÓN DE CAMPOS
  useEffect(() => {
    if (busquedaEmpleado.trim() === "") {
      setEmpleadosFiltrados([]);
      setMostrarResultadosEmpleado(false);
      return;
    }

    const searchNormalized = normalizeSearch(busquedaEmpleado);
    const filtrados = empleados.filter(e => {
      // Construir nombre completo solo con campos que existan
      const nombre = (e.nombre || '').trim();
      const apellido = (e.apellido || '').trim();
      const nombreCompleto = normalizeSearch(`${nombre} ${apellido}`.trim());
      
      const usuario = normalizeSearch(e.usuario || '');
      const idStr = (e.id || e.id_empleado || '').toString();
      
      return nombreCompleto.includes(searchNormalized) ||
             usuario.includes(searchNormalized) ||
             idStr.includes(searchNormalized);
    });

    setEmpleadosFiltrados(filtrados);
    setMostrarResultadosEmpleado(filtrados.length > 0);
  }, [busquedaEmpleado, empleados]);

  // Obtener nombre del cliente seleccionado
  const obtenerNombreCliente = () => {
    if (!datosFactura.id_cliente) return "";
    const cliente = clientes.find(c => 
      c.id_cliente === parseInt(datosFactura.id_cliente) || 
      c.id === parseInt(datosFactura.id_cliente)
    );
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : "";
  };

  // Obtener nombre del empleado seleccionado - MEJORADO CON FALLBACKS
  const obtenerNombreEmpleado = () => {
    if (!datosFactura.id_empleado) return "";
    
    const empleado = empleados.find(e => {
      return e.id_empleado === parseInt(datosFactura.id_empleado) ||
             e.id_empleado == datosFactura.id_empleado ||
             e.id === parseInt(datosFactura.id_empleado) ||
             e.id == datosFactura.id_empleado;
    });
    
    return obtenerNombreCompletoEmpleado(empleado);
  };

  // Validar campo en tiempo real
  const validarCampo = (campo, valor) => {
    const erroresTemp = { ...erroresLocal };

    switch (campo) {
      case 'telefono':
        if (valor && !validaciones.telefono(valor)) {
          erroresTemp[campo] = 'Formato de teléfono inválido (xxxx-xxxx)';
        } else {
          delete erroresTemp[campo];
        }
        break;

      case 'direccion':
        if (valor && !validaciones.direccion(valor)) {
          if (valor.length < 10) {
            erroresTemp[campo] = 'La dirección debe tener al menos 10 caracteres';
          } else {
            erroresTemp[campo] = 'La dirección debe contener texto, no solo números';
          }
        } else {
          delete erroresTemp[campo];
        }
        break;

      case 'rtn':
        if (valor && !validaciones.rtn(valor)) {
          erroresTemp[campo] = 'Formato de RTN inválido (xxxx-xxxx-xxxxx-x)';
        } else {
          delete erroresTemp[campo];
        }
        break;

      default:
        break;
    }

    setErroresLocal(erroresTemp);
    return Object.keys(erroresTemp).length === 0;
  };

  // Combinar errores del componente padre con errores locales
  const erroresCombinados = { ...errores, ...erroresLocal };

  // Manejar cambios de dirección con validación
  const handleDireccionChange = (valor) => {
    const sanitizado = sanitizar.texto(valor);
    validarCampo('direccion', sanitizado);
    onActualizar('direccion', sanitizado);
    onCambioCampo && onCambioCampo('direccion');
  };

  // Manejar cambios de teléfono con formateo automático
  const handleTelefonoChange = (valor) => {
    const formateado = formatearTelefono(valor);
    validarCampo('telefono', formateado);
    onActualizar('telefono', formateado);
    onCambioCampo && onCambioCampo('telefono');
  };

  // Manejar cambios de RTN con formateo automático
  const handleRTNChange = (valor) => {
    const formateado = formatearRTN(valor);
    validarCampo('rtn', formateado);
    onActualizar('rtn', formateado);
    onCambioCampo && onCambioCampo('rtn');
  };

  // Seleccionar cliente
  const handleSeleccionarCliente = (cliente) => {
    console.log("Cliente seleccionado:", cliente);
    
    onActualizar('id_cliente', cliente.id_cliente || cliente.id);
    
    // Cargar automáticamente todos los datos del cliente
    if (cliente.direccion) onActualizar('direccion', cliente.direccion);
    if (cliente.telefono) onActualizar('telefono', cliente.telefono);
    if (cliente.rtn) onActualizar('rtn', cliente.rtn);
    
    // Ejecutar callback si existe
    if (onClienteChange) {
      onClienteChange(cliente);
    }
    
    setBusquedaCliente("");
    setMostrarResultadosCliente(false);
    
    // Limpiar errores relacionados con el cliente
    const erroresTemp = { ...erroresLocal };
    delete erroresTemp.telefono;
    delete erroresTemp.direccion;
    delete erroresTemp.rtn;
    setErroresLocal(erroresTemp);
  };

  // Seleccionar empleado
  const handleSeleccionarEmpleado = (empleado) => {
    console.log("Empleado seleccionado:", empleado);
    onActualizar('id_empleado', empleado.id_empleado || empleado.id);
    setBusquedaEmpleado("");
    setMostrarResultadosEmpleado(false);
  };

  // Limpiar selección de cliente
  const limpiarCliente = () => {
    onActualizar('id_cliente', "");
    onActualizar('direccion', "");
    onActualizar('telefono', "");
    onActualizar('rtn', "");
    setBusquedaCliente("");
    setMostrarResultadosCliente(false);
  };

  // Limpiar selección de empleado
  const limpiarEmpleado = () => {
    onActualizar('id_empleado', "");
    setBusquedaEmpleado("");
    setMostrarResultadosEmpleado(false);
  };

  return (
    <div className="datos-cliente">
      <h3>Información del Cliente y Vendedor</h3>
      
      {/* BÚSQUEDA DE CLIENTES Y EMPLEADOS */}
      <div className="fila-formulario">
        {/* BÚSQUEDA DE CLIENTE - SIN CAMBIOS */}
        <div className="campo-formulario" ref={refBusquedaCliente}>
          <label htmlFor="busqueda_cliente">Cliente *</label>
          
          {!datosFactura.id_cliente ? (
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  id="busqueda_cliente"
                  placeholder="Buscar por nombre, identidad o RTN..."
                  value={busquedaCliente}
                  onChange={(e) => setBusquedaCliente(e.target.value)}
                  onFocus={() => busquedaCliente && setMostrarResultadosCliente(true)}
                  className={erroresCombinados?.id_cliente ? 'campo-error' : ''}
                  style={{ paddingRight: '40px' }}
                />
                <FaSearch style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                  pointerEvents: 'none'
                }} />
              </div>

              {mostrarResultadosCliente && clientesFiltrados.length > 0 && (
                <div className="resultados-busqueda">
                  {clientesFiltrados.map(cliente => (
                    <div 
                      key={cliente.id_cliente || cliente.id}
                      className="resultado-item"
                      onClick={() => handleSeleccionarCliente(cliente)}
                    >
                      <div>
                        <strong>{cliente.nombre} {cliente.apellido}</strong>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                          {cliente.numero_identidad && `ID: ${cliente.numero_identidad}`}
                          {cliente.numero_identidad && cliente.rtn && ' | '}
                          {cliente.rtn && `RTN: ${cliente.rtn}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {busquedaCliente && !mostrarResultadosCliente && clientesFiltrados.length === 0 && (
                <div className="sin-resultados">
                  No se encontraron clientes
                </div>
              )}
            </div>
          ) : (
            <div className="seleccion-mostrada">
              <div style={{ flex: 1 }}>
                <strong>{obtenerNombreCliente()}</strong>
                {(() => {
                  const cliente = clientes.find(c => 
                    c.id_cliente === parseInt(datosFactura.id_cliente) || 
                    c.id === parseInt(datosFactura.id_cliente)
                  );
                  return cliente ? (
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                      {cliente.numero_identidad && `ID: ${cliente.numero_identidad}`}
                      {cliente.numero_identidad && cliente.rtn && ' | '}
                      {cliente.rtn && `RTN: ${cliente.rtn}`}
                    </div>
                  ) : null;
                })()}
              </div>
              <button 
                type="button"
                onClick={limpiarCliente}
                className="btn-limpiar-seleccion"
                title="Cambiar cliente"
              >
                <FaTimes />
              </button>
            </div>
          )}
          {erroresCombinados?.id_cliente && <span className="mensaje-error">{erroresCombinados.id_cliente}</span>}
        </div>

        {/* BÚSQUEDA DE EMPLEADO - CORREGIDA CON VALIDACIÓN DE CAMPOS */}
        <div className="campo-formulario" ref={refBusquedaEmpleado}>
          <label htmlFor="busqueda_empleado">Empleado/Vendedor *</label>
          
          {!datosFactura.id_empleado ? (
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  id="busqueda_empleado"
                  placeholder="Buscar por nombre, ID o usuario..."
                  value={busquedaEmpleado}
                  onChange={(e) => setBusquedaEmpleado(e.target.value)}
                  onFocus={() => busquedaEmpleado && setMostrarResultadosEmpleado(true)}
                  className={erroresCombinados?.id_empleado ? 'campo-error' : ''}
                  style={{ paddingRight: '40px' }}
                />
                <FaSearch style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                  pointerEvents: 'none'
                }} />
              </div>

              {/* Resultados de búsqueda - CORREGIDO CON VALIDACIÓN DE CAMPOS */}
              {mostrarResultadosEmpleado && empleadosFiltrados.length > 0 && (
                <div className="resultados-busqueda">
                  {empleadosFiltrados.map(empleado => (
                    <div 
                      key={empleado.id_empleado || empleado.id}
                      className="resultado-item"
                      onClick={() => handleSeleccionarEmpleado(empleado)}
                    >
                      <div>
                        <strong>{obtenerNombreCompletoEmpleado(empleado)}</strong>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                          {obtenerInfoSecundariaEmpleado(empleado)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {busquedaEmpleado && !mostrarResultadosEmpleado && empleadosFiltrados.length === 0 && (
                <div className="sin-resultados">
                  No se encontraron empleados
                </div>
              )}
            </div>
          ) : (
            // Mostrar empleado seleccionado - CORREGIDO CON VALIDACIÓN DE CAMPOS
            <div className="seleccion-mostrada">
              <div style={{ flex: 1 }}>
                <strong>{obtenerNombreEmpleado()}</strong>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  {(() => {
                    const emp = empleados.find(e => 
                      e.id_empleado === parseInt(datosFactura.id_empleado) || 
                      e.id_empleado == datosFactura.id_empleado ||
                      e.id === parseInt(datosFactura.id_empleado) ||
                      e.id == datosFactura.id_empleado
                    );
                    return obtenerInfoSecundariaEmpleado(emp);
                  })()}
                </div>
              </div>
              <button 
                type="button"
                onClick={limpiarEmpleado}
                className="btn-limpiar-seleccion"
                title="Cambiar empleado"
              >
                <FaTimes />
              </button>
            </div>
          )}
          {erroresCombinados?.id_empleado && <span className="mensaje-error">{erroresCombinados.id_empleado}</span>}
        </div>
      </div>

      {/* CAMPOS AUTOMÁTICOS DEL CLIENTE CON VALIDACIÓN */}
      <div className="fila-formulario">
        <div className="campo-formulario">
          <label htmlFor="fecha">Fecha *</label>
          <input 
            type="date" 
            id="fecha" 
            value={datosFactura.fecha}
            onChange={(e) => {
              onActualizar('fecha', e.target.value);
              onCambioCampo && onCambioCampo('fecha');
            }}
            required 
            className={erroresCombinados?.fecha ? 'campo-error' : ''}
          />
          {erroresCombinados?.fecha && <span className="mensaje-error">{erroresCombinados.fecha}</span>}
        </div>

        <div className="campo-formulario">
          <label htmlFor="telefono">Teléfono *</label>
          <input
            type="tel"
            id="telefono"
            placeholder="3322-0000"
            value={datosFactura.telefono}
            onChange={(e) => {
              if (!datosFactura.id_cliente) {
                handleTelefonoChange(e.target.value);
              }
            }}
            required
            className={erroresCombinados?.telefono ? 'campo-error' : ''}
            readOnly={!!datosFactura.id_cliente}
            style={datosFactura.id_cliente ? { backgroundColor: '#f9fafb', cursor: 'not-allowed' } : {}}
            maxLength="9"
          />
          {erroresCombinados?.telefono && <span className="mensaje-error">{erroresCombinados.telefono}</span>}
          {!erroresCombinados?.telefono && !datosFactura.id_cliente && (
            <small className="form-hint">Formato: xxxx-xxxx</small>
          )}
          {datosFactura.id_cliente && (
            <small className="form-hint" style={{ color: '#059669' }}>
              ✓ Cargado automáticamente del cliente
            </small>
          )}
        </div>
      </div>

      <div className="fila-formulario">
        <div className="campo-formulario">
          <label htmlFor="direccion">Dirección *</label>
          <input
            type="text"
            id="direccion"
            placeholder="Colonia, calle, número de casa (mín. 10 caracteres)"
            value={datosFactura.direccion}
            onChange={(e) => {
              if (!datosFactura.id_cliente) {
                handleDireccionChange(e.target.value);
              }
            }}
            required
            className={erroresCombinados?.direccion ? 'campo-error' : ''}
            readOnly={!!datosFactura.id_cliente}
            style={datosFactura.id_cliente ? { backgroundColor: '#f9fafb', cursor: 'not-allowed' } : {}}
            minLength="10"
          />
          {erroresCombinados?.direccion && <span className="mensaje-error">{erroresCombinados.direccion}</span>}
          {datosFactura.id_cliente && (
            <small className="form-hint" style={{ color: '#059669' }}>
              ✓ Cargado automáticamente del cliente
            </small>
          )}
        </div>

        <div className="campo-formulario">
          <label htmlFor="rtn">RTN</label>
          <input
            type="text"
            id="rtn"
            placeholder="xxxx-xxxx-xxxxx-x"
            value={datosFactura.rtn}
            onChange={(e) => {
              if (!datosFactura.id_cliente) {
                handleRTNChange(e.target.value);
              }
            }}
            className={erroresCombinados?.rtn ? 'campo-error' : ''}
            readOnly={!!datosFactura.id_cliente}
            style={datosFactura.id_cliente ? { backgroundColor: '#f9fafb', cursor: 'not-allowed' } : {}}
            maxLength="18"
          />
          {erroresCombinados?.rtn && <span className="mensaje-error">{erroresCombinados.rtn}</span>}
          {!erroresCombinados?.rtn && !datosFactura.id_cliente && (
            <small className="form-hint">Formato: xxxx-xxxx-xxxxx-x (14 dígitos)</small>
          )}
          {datosFactura.id_cliente && datosFactura.rtn && (
            <small className="form-hint" style={{ color: '#059669' }}>
              ✓ Cargado automáticamente del cliente
            </small>
          )}
        </div>
      </div>
    </div>
  );
}