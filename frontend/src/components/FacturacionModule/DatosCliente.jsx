// components/cotizacionesComponentes/DatosCliente.jsx
import React, { useState, useRef, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { normalizeText, normalizeSearch } from "../../utils/normalize";

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
  
  // Referencias para detectar clics fuera
  const refBusquedaCliente = useRef(null);
  const refBusquedaEmpleado = useRef(null);

  // Debug: Verificar datos recibidos
  useEffect(() => {
    console.log("Datos recibidos en DatosCliente:");
    console.log("- Clientes:", clientes?.length || 0, clientes);
    console.log("- Empleados:", empleados?.length || 0, empleados);
    console.log("- Datos factura:", datosFactura);
  }, [clientes, empleados, datosFactura]);

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
      // Normalizar nombre completo
      const nombreCompleto = normalizeText(`${c.nombre || ''} ${c.apellido || ''}`);
      
      // Normalizar número de identidad (eliminar guiones y espacios)
      const numeroIdentidad = normalizeText(c.numero_identidad || '');
      
      // Normalizar RTN si existe
      const rtn = normalizeText(c.rtn || '');
      
      // Búsqueda en múltiples campos
      return nombreCompleto.includes(searchNormalized) || 
             numeroIdentidad.includes(searchNormalized) ||
             rtn.includes(searchNormalized);
    });

    setClientesFiltrados(filtrados);
    setMostrarResultadosCliente(filtrados.length > 0);
  }, [busquedaCliente, clientes]);

  // Filtrar empleados en tiempo real - MEJORADO
  useEffect(() => {
    if (busquedaEmpleado.trim() === "") {
      setEmpleadosFiltrados([]);
      setMostrarResultadosEmpleado(false);
      return;
    }

    const searchNormalized = normalizeSearch(busquedaEmpleado);
    const filtrados = empleados.filter(e => {
      const nombreCompleto = normalizeSearch(`${e.nombre || ''} ${e.apellido || ''}`);
      const usuario = normalizeSearch(e.usuario || '');
      
      return nombreCompleto.includes(searchNormalized) ||
             usuario.includes(searchNormalized);
    });

    setEmpleadosFiltrados(filtrados);
    setMostrarResultadosEmpleado(filtrados.length > 0);
  }, [busquedaEmpleado, empleados]);

  // Obtener nombre del cliente seleccionado - CORREGIDO
  const obtenerNombreCliente = () => {
    if (!datosFactura.id_cliente) return "";
    const cliente = clientes.find(c => c.id_cliente === parseInt(datosFactura.id_cliente));
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : "";
  };

  // Obtener nombre del empleado seleccionado - CORREGIDO
  const obtenerNombreEmpleado = () => {
    if (!datosFactura.id_empleado) return "";
    
    console.log("Buscando empleado con ID:", datosFactura.id_empleado);
    console.log("Lista de empleados:", empleados);
    
    // Buscar el empleado - probamos diferentes formas de comparación
    const empleado = empleados.find(e => {
      // Intentar diferentes formas de comparación
      return e.id_empleado === parseInt(datosFactura.id_empleado) ||
             e.id_empleado == datosFactura.id_empleado ||
             e.id === parseInt(datosFactura.id_empleado) ||
             e.id == datosFactura.id_empleado;
    });
    
    console.log("Empleado encontrado:", empleado);
    
    if (empleado) {
      // Mostrar el nombre completo si existe
      const nombreCompleto = `${empleado.nombre || ''} ${empleado.apellido || ''}`.trim();
      return nombreCompleto || empleado.usuario || empleado.nombre || "Empleado sin nombre";
    }
    
    return "Empleado no encontrado";
  };

  // Manejar selección de cliente
  const handleSeleccionarCliente = (cliente) => {
    onClienteChange(cliente.id_cliente);
    setBusquedaCliente("");
    setMostrarResultadosCliente(false);
    onCambioCampo && onCambioCampo('id_cliente');
  };

  // Manejar selección de empleado
  const handleSeleccionarEmpleado = (empleado) => {
    console.log("Empleado seleccionado:", empleado);
    onActualizar('id_empleado', empleado.id_empleado || empleado.id);
    setBusquedaEmpleado("");
    setMostrarResultadosEmpleado(false);
    onCambioCampo && onCambioCampo('id_empleado');
  };

  // Limpiar selección de cliente
  const limpiarCliente = () => {
    onActualizar('id_cliente', '');
    onActualizar('direccion', '');
    onActualizar('telefono', '');
    onActualizar('rtn', '');
    setBusquedaCliente("");
    onCambioCampo && onCambioCampo('id_cliente');
  };

  // Limpiar selección de empleado
  const limpiarEmpleado = () => {
    onActualizar('id_empleado', '');
    setBusquedaEmpleado("");
    onCambioCampo && onCambioCampo('id_empleado');
  };

  return (
    <div className="formulario-factura">
      <div className="fila-formulario">
        {/* BÚSQUEDA DE CLIENTE - MEJORADA */}
        <div className="campo-formulario" ref={refBusquedaCliente}>
          <label htmlFor="busqueda_cliente">Cliente *</label>
          
          {!datosFactura.id_cliente ? (
            // Mostrar campo de búsqueda si no hay cliente seleccionado
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  id="busqueda_cliente"
                  placeholder="Buscar por nombre, identidad o RTN..."
                  value={busquedaCliente}
                  onChange={(e) => setBusquedaCliente(e.target.value)}
                  onFocus={() => busquedaCliente && setMostrarResultadosCliente(true)}
                  className={errores?.id_cliente ? 'campo-error' : ''}
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

              {/* Resultados de búsqueda */}
              {mostrarResultadosCliente && clientesFiltrados.length > 0 && (
                <div className="resultados-busqueda">
                  {clientesFiltrados.map(cliente => (
                    <div 
                      key={cliente.id_cliente}
                      className="resultado-item"
                      onClick={() => handleSeleccionarCliente(cliente)}
                    >
                      <div>
                        <strong>{cliente.nombre} {cliente.apellido}</strong>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                          ID: {cliente.numero_identidad}
                          {cliente.rtn && ` | RTN: ${cliente.rtn}`}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                          Tel: {cliente.telefono} | {cliente.direccion}
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
            // Mostrar cliente seleccionado
            <div className="seleccion-mostrada">
              <div style={{ flex: 1 }}>
                <strong>{obtenerNombreCliente()}</strong>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  {clientes.find(c => c.id_cliente === parseInt(datosFactura.id_cliente))?.numero_identidad}
                </div>
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
          {errores?.id_cliente && <span className="mensaje-error">{errores.id_cliente}</span>}
        </div>

        {/* BÚSQUEDA DE EMPLEADO - MEJORADA */}
        <div className="campo-formulario" ref={refBusquedaEmpleado}>
          <label htmlFor="busqueda_empleado">Empleado *</label>
          
          {!datosFactura.id_empleado ? (
            // Mostrar campo de búsqueda si no hay empleado seleccionado
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  id="busqueda_empleado"
                  placeholder="Buscar empleado por nombre o usuario..."
                  value={busquedaEmpleado}
                  onChange={(e) => setBusquedaEmpleado(e.target.value)}
                  onFocus={() => busquedaEmpleado && setMostrarResultadosEmpleado(true)}
                  className={errores?.id_empleado ? 'campo-error' : ''}
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

              {/* Resultados de búsqueda */}
              {mostrarResultadosEmpleado && empleadosFiltrados.length > 0 && (
                <div className="resultados-busqueda">
                  {empleadosFiltrados.map(empleado => (
                    <div 
                      key={empleado.id_empleado || empleado.id}
                      className="resultado-item"
                      onClick={() => handleSeleccionarEmpleado(empleado)}
                    >
                      <div>
                        <strong>{empleado.nombre} {empleado.apellido}</strong>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                          Usuario: {empleado.usuario}
                          {empleado.codigo_perfil && ` | Perfil: ${empleado.codigo_perfil}`}
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
            // Mostrar empleado seleccionado
            <div className="seleccion-mostrada">
              <div style={{ flex: 1 }}>
                <strong>{obtenerNombreEmpleado()}</strong>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  {empleados.find(e => 
                    e.id_empleado === parseInt(datosFactura.id_empleado) || 
                    e.id_empleado == datosFactura.id_empleado ||
                    e.id === parseInt(datosFactura.id_empleado) ||
                    e.id == datosFactura.id_empleado
                  )?.usuario}
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
          {errores?.id_empleado && <span className="mensaje-error">{errores.id_empleado}</span>}
        </div>
      </div>

      {/* CAMPOS AUTOMÁTICOS DEL CLIENTE */}
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
            className={errores?.fecha ? 'campo-error' : ''}
          />
          {errores?.fecha && <span className="mensaje-error">{errores.fecha}</span>}
        </div>
        <div className="campo-formulario">
          <label htmlFor="telefono">Teléfono *</label>
          <input 
            type="tel" 
            id="telefono" 
            placeholder="Teléfono del cliente" 
            value={datosFactura.telefono}
            onChange={(e) => {
              onActualizar('telefono', e.target.value);
              onCambioCampo && onCambioCampo('telefono');
            }}
            required 
            className={errores?.telefono ? 'campo-error' : ''}
            readOnly={!!datosFactura.id_cliente}
            style={datosFactura.id_cliente ? { backgroundColor: '#f9fafb', cursor: 'not-allowed' } : {}}
          />
          {errores?.telefono && <span className="mensaje-error">{errores.telefono}</span>}
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
            placeholder="Dirección del cliente" 
            value={datosFactura.direccion}
            onChange={(e) => {
              onActualizar('direccion', e.target.value);
              onCambioCampo && onCambioCampo('direccion');
            }}
            required 
            className={errores?.direccion ? 'campo-error' : ''}
            readOnly={!!datosFactura.id_cliente}
            style={datosFactura.id_cliente ? { backgroundColor: '#f9fafb', cursor: 'not-allowed' } : {}}
          />
          {errores?.direccion && <span className="mensaje-error">{errores.direccion}</span>}
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
            placeholder="RTN del cliente" 
            value={datosFactura.rtn}
            onChange={(e) => {
              onActualizar('rtn', e.target.value);
              onCambioCampo && onCambioCampo('rtn');
            }}
            readOnly={!!datosFactura.id_cliente}
            style={datosFactura.id_cliente ? { backgroundColor: '#f9fafb', cursor: 'not-allowed' } : {}}
          />
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