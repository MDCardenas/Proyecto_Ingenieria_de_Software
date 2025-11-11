import { useEffect, useState } from "react";
import { FaFileInvoice, FaCalculator, FaUsers, FaList, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';
import axios from 'axios';
import PropTypes from 'prop-types';
import VentasList from './VentasList';
import "../../styles/VentasModule.css";

export default function VentasModule({ setActiveButton }) {
  const [ventasMes, setVentasMes] = useState(0);
  const [transaccionesMes, setTransaccionesMes] = useState(0);
  const [ticketPromedio, setTicketPromedio] = useState(0);
  const [facturasPendientes, setFacturasPendientes] = useState(0);
  const [vistaActual, setVistaActual] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVentasData();
  }, []);

  const fetchVentasData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/dashboard/');
      const data = response.data.estadisticas;
      
      setVentasMes(data.ventas_mes_actual || 0);
      setTransaccionesMes(data.cantidad_ventas_mes || 0);
      setFacturasPendientes(data.facturas_pendientes_pago || 0);
      
      // Calcular ticket promedio
      const promedio = data.cantidad_ventas_mes > 0 
        ? (data.ventas_mes_actual / data.cantidad_ventas_mes) 
        : 0;
      setTicketPromedio(promedio);
      
    } catch (error) {
      console.error('Error al cargar datos de ventas:', error);
      setError("Error al cargar los datos de ventas");
    } finally {
      setLoading(false);
    }
  };

  const accionesRapidas = [
    {
      id: 1,
      icon: FaFileInvoice,
      title: "Nueva Factura",
      description: "Crear factura de venta",
      color: "#9333ea",
      onClick: () => {
        if (setActiveButton) {
          setActiveButton('Facturacion');
        }
      }
    },
    {
      id: 2,
      icon: FaCalculator,
      title: "Nueva Cotización",
      description: "Generar presupuesto",
      color: "#3b82f6",
      onClick: () => {
        if (setActiveButton) {
          setActiveButton('Cotizaciones');
        }
      }
    },
    {
      id: 3,
      icon: FaList,
      title: "Lista de Ventas",
      description: "Ver facturas pagadas",
      color: "#10b981",
      onClick: () => setVistaActual('lista-ventas')
    },
    {
      id: 4,
      icon: FaUsers,
      title: "Clientes",
      description: "Gestionar clientes",
      color: "#f59e0b",
      onClick: () => {
        if (setActiveButton) {
          setActiveButton('Clientes');
        }
      }
    }
  ];

  // Renderizar diferentes vistas
  const renderVista = () => {
    switch (vistaActual) {
      case 'lista-ventas':
        return <VentasList onVolver={() => setVistaActual('dashboard')} />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <>
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card stat-card-green">
          <div className="stat-icon-wrapper">
            <FaMoneyBillWave className="stat-icon" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Ventas del Mes</p>
            <h2 className="stat-value">L. {ventasMes.toLocaleString('es-HN')}</h2>
          </div>
        </div>

        <div className="stat-card stat-card-blue">
          <div className="stat-icon-wrapper">
            <FaFileInvoice className="stat-icon" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Transacciones del Mes</p>
            <h2 className="stat-value">{transaccionesMes}</h2>
          </div>
        </div>

        <div className="stat-card stat-card-purple">
          <div className="stat-icon-wrapper">
            <FaChartLine className="stat-icon" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Ticket Promedio</p>
            <h2 className="stat-value">L. {ticketPromedio.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          </div>
        </div>

        <div className="stat-card stat-card-orange">
          <div className="stat-icon-wrapper">
            <FaMoneyBillWave className="stat-icon" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Pendientes de Pago</p>
            <h2 className="stat-value">{facturasPendientes}</h2>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="acciones-section">
        <h2 className="section-title">Acciones Rápidas</h2>
        <div className="acciones-grid">
          {accionesRapidas.map((accion) => {
            const Icon = accion.icon;
            return (
              <div 
                key={accion.id} 
                className="accion-card"
                onClick={accion.onClick}
                style={{ cursor: 'pointer' }}
              >
                <div 
                  className="accion-icon-wrapper"
                  style={{ backgroundColor: `${accion.color}15` }}
                >
                  <Icon 
                    className="accion-icon" 
                    style={{ color: accion.color }}
                  />
                </div>
                <div className="accion-content">
                  <h3 className="accion-title">{accion.title}</h3>
                  <p className="accion-description">{accion.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <div className="ventas-module">
      {/* Header */}
      <div className="ventas-header">
        {vistaActual !== 'dashboard' && (
          <button 
            onClick={() => setVistaActual('dashboard')} 
            className="btn-volver"
          >
            ← Volver al Dashboard
          </button>
        )}
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {loading ? (
        <div className="loading-message">Cargando datos...</div>
      ) : (
        renderVista()
      )}
    </div>
  );
}

// Validación de props
VentasModule.propTypes = {
  setActiveButton: PropTypes.func
};