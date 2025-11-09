import { useEffect, useState } from "react";
import { FaFileInvoice, FaSearch, FaFilter, FaSync, FaMoneyBillWave } from 'react-icons/fa';
import axios from 'axios';
import PropTypes from 'prop-types';
import "../styles/VentasList.css";

export default function VentasList({ onVolver }) {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("TODAS");

  useEffect(() => {
    fetchFacturas();
  }, []);

  const fetchFacturas = async () => {
    try {
      setLoading(true);
      console.log('Cargando facturas...');
      const response = await axios.get('http://localhost:8000/api/facturas/completas/');
      console.log('Facturas recibidas:', response.data);
      setFacturas(response.data);
    } catch (error) {
      console.error('Error al cargar facturas:', error);
      alert('Error al cargar las facturas. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const anularFactura = async (numeroFactura) => {
    if (window.confirm('¿Está seguro de que desea anular esta factura?')) {
      try {
        await axios.post(`http://localhost:8000/api/facturas/${numeroFactura}/anular/`, {
          observaciones: 'Factura anulada por el usuario'
        });
        await fetchFacturas();
        alert('Factura anulada exitosamente');
      } catch (error) {
        console.error('Error al anular factura:', error);
        alert('Error al anular la factura');
      }
    }
  };

  const filtrarFacturas = () => {
    let filtered = facturas;

    // FILTRO PRINCIPAL: Mostrar solo facturas PAGADAS
    filtered = filtered.filter(f => f.estado_pago === 'PAGADA');

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const searchLower = busqueda.toLowerCase();
      filtered = filtered.filter(f => 
        f.numero_factura.toString().includes(searchLower) ||
        f.cliente_nombre.toLowerCase().includes(searchLower) ||
        (f.cliente_identidad && f.cliente_identidad.toLowerCase().includes(searchLower)) ||
        (f.observaciones && f.observaciones.toLowerCase().includes(searchLower)) ||
        (f.metodo_pago && f.metodo_pago.toLowerCase().includes(searchLower))
      );
    }

    // Filtro por tipo de venta
    if (filtroTipo !== "TODAS") {
      filtered = filtered.filter(f => f.tipo_venta === filtroTipo);
    }

    return filtered;
  };

  const facturasFiltradas = filtrarFacturas();

  const getTipoBadgeClass = (tipo) => {
    switch (tipo) {
      case 'VENTA': return 'badge-venta';
      case 'FABRICACION': return 'badge-fabricacion';
      case 'REPARACION': return 'badge-reparacion';
      default: return 'badge-secondary';
    }
  };

  const getMetodoPagoBadge = (metodo) => {
    if (!metodo) return <span className="badge badge-metodo">N/A</span>;
    
    switch (metodo.toUpperCase()) {
      case 'EFECTIVO': return <span className="badge badge-efectivo">Efectivo</span>;
      case 'TARJETA': return <span className="badge badge-tarjeta">Tarjeta</span>;
      case 'TRANSFERENCIA': return <span className="badge badge-transferencia">Transferencia</span>;
      default: return <span className="badge badge-metodo">{metodo}</span>;
    }
  };

  const totalVentas = facturasFiltradas.reduce((sum, factura) => sum + parseFloat(factura.total || 0), 0);
  const totalFacturas = facturasFiltradas.length;

  // Debug: Mostrar información en consola
  console.log('Total facturas:', facturas.length);
  console.log('Facturas filtradas (PAGADAS):', facturasFiltradas.length);

  return (
    <div className="ventas-list-container">
      {/* Header con controles */}
      <div className="list-header">
        <div className="header-left">
          <h2>Facturas Pagadas</h2>
          <p className="subtitle">
            Lista de todas las facturas con estado <strong className="text-pagada">PAGADO</strong>
          </p>
        </div>
        <div className="header-actions">
          {onVolver && (
            <button 
              onClick={onVolver}
              className="btn-volver"
            >
              ← Volver
            </button>
          )}
          <button 
            onClick={fetchFacturas}
            className="btn-refresh"
            disabled={loading}
          >
            <FaSync className={loading ? "spin" : ""} />
            {loading ? "Cargando..." : "Actualizar"}
          </button>
        </div>
      </div>

      {/* Resumen de totales */}
      <div className="resumen-totales">
        <div className="total-card">
          <FaMoneyBillWave className="total-icon" />
          <div className="total-info">
            <span className="total-label">Total en Ventas</span>
            <span className="total-value">L. {totalVentas.toLocaleString('es-HN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
        <div className="total-card">
          <FaFileInvoice className="total-icon" />
          <div className="total-info">
            <span className="total-label">Facturas Pagadas</span>
            <span className="total-value">{totalFacturas}</span>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="filtros-container">
        <div className="search-section">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input 
              type="text"
              placeholder="Buscar por número, cliente, método de pago..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-busqueda"
            />
          </div>
          {busqueda && (
            <button 
              onClick={() => setBusqueda("")}
              className="btn-limpiar"
            >
              Limpiar
            </button>
          )}
        </div>

        <div className="filtros-section">
          <div className="filtro-group">
            <label>Tipo de Venta:</label>
            <select 
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="select-filtro"
            >
              <option value="TODAS">Todos los tipos</option>
              <option value="VENTA">Venta</option>
              <option value="FABRICACION">Fabricación</option>
              <option value="REPARACION">Reparación</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumen de filtros aplicados */}
      <div className="resumen-filtros">
        <span className="filtro-activo">
          <FaFilter />
          Filtro principal: <strong className="text-pagada">Estado PAGADA</strong>
        </span>
        {filtroTipo !== "TODAS" && (
          <span className="filtro-activo">
            Tipo: <strong>{filtroTipo}</strong>
          </span>
        )}
        {busqueda && (
          <span className="filtro-activo">
            Búsqueda: <strong>"{busqueda}"</strong>
          </span>
        )}
      </div>

      {/* Tabla de facturas */}
      {loading ? (
        <div className="loading-message">Cargando facturas...</div>
      ) : (
        <div className="tabla-container">
          <table className="tabla-ventas">
            <thead>
              <tr>
                <th>N° Factura</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Subtotal</th>
                <th>ISV</th>
                <th>Descuento</th>
                <th>Total</th>
                <th>Tipo</th>
                <th>Método Pago</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facturasFiltradas.length > 0 ? (
                facturasFiltradas.map(factura => (
                  <tr key={factura.numero_factura} className="fila-factura">
                    <td className="numero-factura">
                      <FaFileInvoice className="icon-factura" />
                      #{factura.numero_factura}
                    </td>
                    <td className="cliente-nombre">
                      <div className="cliente-info">
                        <strong>{factura.cliente_nombre}</strong>
                        {factura.observaciones && (
                          <small className="observacion">{factura.observaciones}</small>
                        )}
                      </div>
                    </td>
                    <td className="fecha-factura">
                      {new Date(factura.fecha).toLocaleDateString('es-HN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="subtotal">
                      L. {parseFloat(factura.subtotal || 0).toLocaleString('es-HN', { 
                        minimumFractionDigits: 2 
                      })}
                    </td>
                    <td className="isv">
                      L. {parseFloat(factura.isv || 0).toLocaleString('es-HN', { 
                        minimumFractionDigits: 2 
                      })}
                    </td>
                    <td className="descuento">
                      L. {parseFloat(factura.descuento || 0).toLocaleString('es-HN', { 
                        minimumFractionDigits: 2 
                      })}
                    </td>
                    <td className="total-factura">
                      <strong>L. {parseFloat(factura.total || 0).toLocaleString('es-HN', { 
                        minimumFractionDigits: 2 
                      })}</strong>
                    </td>
                    <td>
                      <span className={`badge ${getTipoBadgeClass(factura.tipo_venta)}`}>
                        {factura.tipo_venta_display || factura.tipo_venta}
                      </span>
                    </td>
                    <td>
                      {getMetodoPagoBadge(factura.metodo_pago)}
                    </td>
                    <td>
                      <div className="acciones-tabla">
                        <button 
                          onClick={() => console.log('Ver detalles:', factura.numero_factura)}
                          className="btn-detalles"
                          title="Ver detalles completos"
                        >
                          Detalles
                        </button>
                        <button 
                          onClick={() => anularFactura(factura.numero_factura)}
                          className="btn-anular"
                          title="Anular factura"
                        >
                          Anular
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="sin-resultados">
                    {busqueda || filtroTipo !== "TODAS" 
                      ? 'No se encontraron facturas pagadas que coincidan con los filtros aplicados'
                      : 'No hay facturas pagadas registradas'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Resumen final */}
      <div className="resumen-final">
        <div className="resumen-stats">
          <span>Facturas pagadas mostradas: <strong>{facturasFiltradas.length}</strong></span>
          <span>Total en ventas: <strong>L. {totalVentas.toLocaleString('es-HN', { minimumFractionDigits: 2 })}</strong></span>
        </div>
        <div className="resumen-leyenda">
          <small>
            * Solo se muestran facturas con estado <strong className="text-pagada">PAGADA</strong>
          </small>
        </div>
      </div>
    </div>
  );
}

VentasList.propTypes = {
  onVolver: PropTypes.func
};