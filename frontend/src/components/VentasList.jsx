import { useEffect, useState } from "react";
import { FaFileInvoice, FaCalculator, FaSearch, FaList } from 'react-icons/fa';
import { MdRefresh, MdLock } from 'react-icons/md';
import axios from 'axios';
import VentasList from './VentasList';
import "../styles/VentasModule.css";

export default function VentasModule() {
  const [ventasHoy, setVentasHoy] = useState(0);
  const [transacciones, setTransacciones] = useState(0);
  const [ticketPromedio, setTicketPromedio] = useState(0);
  const [vistaActual, setVistaActual] = useState('dashboard');

  useEffect(() => {
    fetchVentasData();
  }, []);

  const fetchVentasData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/ventas/dashboard/');
      setVentasHoy(response.data.ventas_hoy);
      setTransacciones(response.data.transacciones);
      setTicketPromedio(response.data.ticket_promedio);
    } catch (error) {
      console.error('Error al cargar datos de ventas:', error);
    }
  };

  const accionesRapidas = [
    {
      id: 1,
      icon: FaFileInvoice,
      title: "Nueva Factura",
      description: "Crear factura de venta",
      color: "#9333ea",
      onClick: () => console.log('Nueva Factura')
    },
    {
      id: 2,
      icon: FaCalculator,
      title: "Nueva Cotización",
      description: "Generar presupuesto",
      color: "#3b82f6",
      onClick: () => console.log('Nueva Cotización')
    },
    {
      id: 3,
      icon: FaSearch,
      title: "Consultar Stock",
      description: "Ver disponibilidad",
      color: "#10b981",
      onClick: () => console.log('Consultar Stock')
    },
    {
      id: 4,
      icon: FaList,
      title: "Ver Todas las Ventas",
      description: "Lista completa",
      color: "#f59e0b",
      onClick: () => setVistaActual('lista')
    }
  ];

  if (vistaActual === 'lista') {
    return (
      <div className="ventas-module">
        <div className="ventas-header">
          <div>
            <h1 className="ventas-title">Lista de Ventas</h1>
            <p className="ventas-subtitle">Gestión de todas las ventas</p>
          </div>
          <button 
            onClick={() => setVistaActual('dashboard')} 
            className="btn-volver"
          >
            ← Volver al Dashboard
          </button>
        </div>
        <VentasList />
      </div>
    );
  }

  return (
    <div className="ventas-module">
      <div className="ventas-header">
        <div>
          <h1 className="ventas-title">Módulo de Ventas</h1>
          <p className="ventas-subtitle">Gestión completa de ventas</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card-green">
          <div className="stat-icon-wrapper">
            <FaFileInvoice className="stat-icon" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Ventas Hoy</p>
            <h2 className="stat-value">L.{ventasHoy.toLocaleString()}</h2>
          </div>
        </div>

        <div className="stat-card stat-card-blue">
          <div className="stat-icon-wrapper">
            <FaCalculator className="stat-icon" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Transacciones</p>
            <h2 className="stat-value">{transacciones}</h2>
          </div>
        </div>

        <div className="stat-card stat-card-purple">
          <div className="stat-icon-wrapper">
            <FaList className="stat-icon" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Ticket Promedio</p>
            <h2 className="stat-value">L.{ticketPromedio.toLocaleString()}</h2>
          </div>
        </div>
      </div>

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

      <div className="bottom-actions">
        <button className="action-button action-button-refresh" onClick={fetchVentasData}>
          <MdRefresh className="button-icon" />
        </button>
        <button className="action-button action-button-lock">
          <MdLock className="button-icon" />
        </button>
      </div>
    </div>
  );
}