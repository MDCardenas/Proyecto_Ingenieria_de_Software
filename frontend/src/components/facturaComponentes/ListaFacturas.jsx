import React, { useState, useEffect, useCallback } from "react";
import { 
  FaSearch, FaFileInvoice, FaCheck, FaClock, FaEye, 
  FaBox, FaTools, FaSync, FaMoneyBillWave, FaReceipt,
  FaFilter, FaTimes, FaExclamationTriangle
} from "react-icons/fa";

export default function ListaFacturas() {
  const [facturas, setFacturas] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODAS");
  const [filtroTipo, setFiltroTipo] = useState("TODAS");
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState({});
  const [error, setError] = useState(null);

  // Cargar facturas al montar el componente
  useEffect(() => {
    cargarFacturas();
  }, []);

  // Función optimizada para cargar facturas con useCallback
  const cargarFacturas = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      console.log("🔄 Cargando facturas desde API...");
      
      const response = await fetch('http://localhost:8000/api/facturas/completas/');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Facturas cargadas:', data.length);
      setFacturas(data);
      
    } catch (error) {
      console.error('❌ Error cargando facturas:', error);
      setError(`Error al cargar facturas: ${error.message}`);
    } finally {
      setCargando(false);
    }
  }, []);

  // Función para cambiar estado de pago
  const cambiarEstadoPago = async (numeroFactura, nuevoEstado) => {
    try {
      setActualizando(prev => ({ ...prev, [numeroFactura]: true }));
      
      const payload = {
        estado_pago: nuevoEstado,
        ...(nuevoEstado === 'PAGADA' && {
          metodo_pago: 'EFECTIVO',
          fecha_pago: new Date().toISOString()
        })
      };

      console.log('📤 Enviando PATCH a:', `http://localhost:8000/api/facturas/${numeroFactura}/`);
      console.log('📦 Payload:', payload);

      // URL CORREGIDA - sin /estado-pago/
      const response = await fetch(`http://localhost:8000/api/facturas/${numeroFactura}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('📥 Respuesta HTTP:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response body:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const resultado = await response.json();
      console.log('✅ Factura actualizada:', resultado);
      
      // Actualizar estado local
      setFacturas(prev => prev.map(f => 
        f.numero_factura === numeroFactura 
          ? { ...f, ...resultado }  // Usar resultado directamente
          : f
      ));
      
      console.log(`✅ Factura #${numeroFactura} actualizada a: ${nuevoEstado}`);
      
    } catch (error) {
      console.error('❌ Error actualizando estado:', error);
      setError(`Error al actualizar: ${error.message}`);
    } finally {
      setActualizando(prev => ({ ...prev, [numeroFactura]: false }));
    }
  };

  // Función para ver detalles de factura
  const verDetallesFactura = (factura) => {
    console.log('Ver detalles de factura:', factura);
    // Aquí puedes implementar la navegación a la vista de detalles
    // o mostrar un modal con la información completa
    alert(`Detalles de Factura #${factura.numero_factura}\nCliente: ${factura.cliente_nombre}\nTotal: L. ${factura.total}`);
  };

  // Filtrar facturas con useMemo para optimización
  const facturasFiltradas = React.useMemo(() => {
    return facturas.filter(factura => {
      const coincideBusqueda = !terminoBusqueda || 
        factura.numero_factura.toString().includes(terminoBusqueda) ||
        factura.cliente_nombre?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        factura.cliente_identidad?.includes(terminoBusqueda);

      const coincideEstado = filtroEstado === "TODAS" || factura.estado_pago === filtroEstado;
      const coincideTipo = filtroTipo === "TODAS" || factura.tipo_venta === filtroTipo;

      return coincideBusqueda && coincideEstado && coincideTipo;
    });
  }, [facturas, terminoBusqueda, filtroEstado, filtroTipo]);

  // Estadísticas con useMemo
  const estadisticas = React.useMemo(() => {
    const pendientes = facturas.filter(f => f.estado_pago === 'PENDIENTE');
    const pagadas = facturas.filter(f => f.estado_pago === 'PAGADA');
    const canceladas = facturas.filter(f => f.estado_pago === 'CANCELADA');
    
    return { pendientes, pagadas, canceladas };
  }, [facturas]);

  // Helper functions
  const obtenerIconoTipo = (tipo) => {
    const tipoUpper = (tipo || '').toUpperCase();
    switch (tipoUpper) {
      case 'FABRICACION': return <FaBox className="icono-tipo" title="Fabricación" />;
      case 'REPARACION': return <FaTools className="icono-tipo" title="Reparación" />;
      case 'VENTA': return <FaFileInvoice className="icono-tipo" title="Venta" />;
      default: return <FaFileInvoice className="icono-tipo" />;
    }
  };

  const obtenerClaseEstado = (estado) => {
    switch (estado) {
      case 'PAGADA': return 'estado-pagada';
      case 'PENDIENTE': return 'estado-pendiente';
      case 'CANCELADA': return 'estado-cancelada';
      default: return 'estado-pendiente';
    }
  };

  const formatearMoneda = (monto) => {
    return `L. ${parseFloat(monto || 0).toLocaleString('es-HN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const formatearFecha = (fechaString) => {
    if (!fechaString) return 'N/A';
    try {
      return new Date(fechaString).toLocaleDateString('es-HN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setTerminoBusqueda("");
    setFiltroEstado("TODAS");
    setFiltroTipo("TODAS");
  };

  // Render loading
  if (cargando) {
    return (
      <div className="cargando-facturas">
        <FaSync className="icono-cargando girando" />
        <p>Cargando facturas...</p>
      </div>
    );
  }

  return (
    <div className="lista-facturas-container">
      {/* Header con estadísticas */}
      <div className="header-lista-facturas">
        <div className="estadisticas-rapidas">
          <div className="estadistica-item total">
            <FaFileInvoice />
            <span className="numero">{facturas.length}</span>
            <span className="label">Total Facturas</span>
          </div>
          <div className="estadistica-item pendiente">
            <FaClock />
            <span className="numero">{estadisticas.pendientes.length}</span>
            <span className="label">Pendientes</span>
          </div>
          <div className="estadistica-item pagada">
            <FaCheck />
            <span className="numero">{estadisticas.pagadas.length}</span>
            <span className="label">Pagadas</span>
          </div>
          <div className="estadistica-item cancelada">
            <FaExclamationTriangle />
            <span className="numero">{estadisticas.canceladas.length}</span>
            <span className="label">Canceladas</span>
          </div>
        </div>

        <div className="controles-superiores">
          <button 
            className="btn-actualizar"
            onClick={cargarFacturas}
            disabled={cargando}
            title="Actualizar lista"
          >
            <FaSync className={cargando ? 'girando' : ''} />
            {cargando ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* Panel de filtros y búsqueda */}
      <div className="panel-filtros">
        <div className="grupo-busqueda">
          <div className="input-busqueda-container">
            <FaSearch className="icono-busqueda" />
            <input
              type="text"
              placeholder="Buscar por número, cliente o identidad..."
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              className="input-busqueda"
            />
            {terminoBusqueda && (
              <button 
                onClick={() => setTerminoBusqueda('')}
                className="btn-limpiar-busqueda"
                title="Limpiar búsqueda"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        <div className="grupo-filtros">
          <div className="filtro-group">
            <label className="filtro-label">
              <FaFilter />
              Estado:
            </label>
            <select 
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="select-filtro"
            >
              <option value="TODAS">Todos los estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="PAGADA">Pagadas</option>
              <option value="CANCELADA">Canceladas</option>
            </select>
          </div>

          <div className="filtro-group">
            <label className="filtro-label">
              <FaFilter />
              Tipo:
            </label>
            <select 
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="select-filtro"
            >
              <option value="TODAS">Todos los tipos</option>
              <option value="VENTA">Ventas</option>
              <option value="FABRICACION">Fabricación</option>
              <option value="REPARACION">Reparación</option>
            </select>
          </div>

          {(terminoBusqueda || filtroEstado !== "TODAS" || filtroTipo !== "TODAS") && (
            <button 
              onClick={limpiarFiltros}
              className="btn-limpiar-filtros"
              title="Limpiar todos los filtros"
            >
              <FaTimes />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mensaje-error">
          <FaExclamationTriangle />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="btn-cerrar-error">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Resumen de filtros */}
      <div className="resumen-filtros">
        <span>
          Mostrando <strong>{facturasFiltradas.length}</strong> de <strong>{facturas.length}</strong> facturas
          {(filtroEstado !== "TODAS" || filtroTipo !== "TODAS" || terminoBusqueda) && (
            <span className="filtros-activos">
              {filtroEstado !== "TODAS" && ` • Estado: ${filtroEstado}`}
              {filtroTipo !== "TODAS" && ` • Tipo: ${filtroTipo}`}
              {terminoBusqueda && ` • Búsqueda: "${terminoBusqueda}"`}
            </span>
          )}
        </span>
      </div>

      {/* Grid de facturas */}
      <div className="grid-facturas">
        {facturasFiltradas.length > 0 ? (
          facturasFiltradas.map((factura) => (
            <div 
              key={factura.numero_factura}
              className={`card-factura ${obtenerClaseEstado(factura.estado_pago)}`}
            >
              <div className="card-header">
                <div className="info-principal">
                  {obtenerIconoTipo(factura.tipo_venta)}
                  <div className="numero-y-cliente">
                    <span className="numero-factura">#{factura.numero_factura}</span>
                    <span className="cliente-nombre">{factura.cliente_nombre || 'Cliente no especificado'}</span>
                    {factura.cliente_identidad && (
                      <span className="cliente-identidad">{factura.cliente_identidad}</span>
                    )}
                  </div>
                </div>
                <div className={`badge-estado ${obtenerClaseEstado(factura.estado_pago)}`}>
                  {factura.estado_pago}
                </div>
              </div>

              <div className="card-body">
                <div className="detalles-factura">
                  <div className="detalle-linea">
                    <span>Tipo:</span>
                    <span className="tipo-venta">{factura.tipo_venta || 'No especificado'}</span>
                  </div>
                  <div className="detalle-linea">
                    <span>Fecha:</span>
                    <span>{formatearFecha(factura.fecha)}</span>
                  </div>
                  <div className="detalle-linea">
                    <span>Empleado:</span>
                    <span>{factura.empleado_nombre || 'No especificado'}</span>
                  </div>
                  {factura.metodo_pago && (
                    <div className="detalle-linea">
                      <span>Método pago:</span>
                      <span>{factura.metodo_pago}</span>
                    </div>
                  )}
                  {factura.fecha_pago && factura.estado_pago === 'PAGADA' && (
                    <div className="detalle-linea">
                      <span>Fecha pago:</span>
                      <span>{formatearFecha(factura.fecha_pago)}</span>
                    </div>
                  )}
                </div>

                <div className="resumen-financiero">
                  <div className="monto-total">
                    {formatearMoneda(factura.total)}
                  </div>
                  <div className="desglose">
                    <span>Subtotal: {formatearMoneda(factura.subtotal)}</span>
                    <span>ISV: {formatearMoneda(factura.isv)}</span>
                    {factura.descuento > 0 && (
                      <span className="descuento">Desc: -{formatearMoneda(factura.descuento)}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <button 
                  className="btn-detalles"
                  onClick={() => verDetallesFactura(factura)}
                  title="Ver detalles completos"
                >
                  <FaEye />
                  Detalles
                </button>

                {factura.estado_pago === 'PENDIENTE' && (
                  <button
                    className="btn-marcar-pagada"
                    onClick={() => cambiarEstadoPago(factura.numero_factura, 'PAGADA')}
                    disabled={actualizando[factura.numero_factura]}
                  >
                    {actualizando[factura.numero_factura] ? (
                      <FaSync className="girando" />
                    ) : (
                      <FaMoneyBillWave />
                    )}
                    {actualizando[factura.numero_factura] ? 'Procesando...' : 'Pagar'}
                  </button>
                )}

                {factura.estado_pago === 'PAGADA' && (
                  <button
                    className="btn-reabrir"
                    onClick={() => cambiarEstadoPago(factura.numero_factura, 'PENDIENTE')}
                    disabled={actualizando[factura.numero_factura]}
                  >
                    {actualizando[factura.numero_factura] ? (
                      <FaSync className="girando" />
                    ) : (
                      <FaReceipt />
                    )}
                    Reabrir
                  </button>
                )}

                {factura.estado_pago === 'CANCELADA' && (
                  <button
                    className="btn-reactivar"
                    onClick={() => cambiarEstadoPago(factura.numero_factura, 'PENDIENTE')}
                    disabled={actualizando[factura.numero_factura]}
                  >
                    {actualizando[factura.numero_factura] ? (
                      <FaSync className="girando" />
                    ) : (
                      <FaCheck />
                    )}
                    Reactivar
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="sin-resultados">
            <FaFileInvoice />
            <p>
              {terminoBusqueda || filtroEstado !== "TODAS" || filtroTipo !== "TODAS" 
                ? "No se encontraron facturas que coincidan con los filtros aplicados"
                : "No hay facturas registradas en el sistema"
              }
            </p>
            {(terminoBusqueda || filtroEstado !== "TODAS" || filtroTipo !== "TODAS") && (
              <button onClick={limpiarFiltros} className="btn-limpiar-filtros">
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}