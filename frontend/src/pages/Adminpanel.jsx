// src/pages/AdminPanel.jsx
import { useEffect, useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import VentasModule from "../components/VentasModule/VentasModule.jsx";
import ClientesModule from "../components/ClientesModule/ClientesModule.jsx";
import FacturacionModule from "../components/FacturacionModule/FacturacionModule.jsx";
import Dashboard from "../components/DashboardModule/Dashboard.jsx";
import Usuarios from "../components/UsuariosModule/Usuarios.jsx";
import InventarioModule from "../components/InventarioModule/InventarioModule.jsx";
import CotizacionesModule from "../components/CotizacionesModule/CotizacionesModule.jsx";
import { menuItems } from "../services/menuItems.js";
import "../styles/scss/main.scss";
import OrdenesModule from "../components/OrdenesModule/OrdenesModule.jsx";
import Contabilidad from "../components/ContabilidadModule/Contabilidad.jsx";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [empleado, setEmpleado] = useState(null);
  const [activeButton, setActiveButton] = useState("Dashboard");

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("empleado");
    navigate("/login");
  };

  // Cargar empleado desde localStorage
  useEffect(() => {
    const empleadoGuardado = localStorage.getItem("empleado");
    if (empleadoGuardado) {
      setEmpleado(JSON.parse(empleadoGuardado));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const getActiveMenuItem = () => {
    return menuItems.find(item => item.id === activeButton) || menuItems[0];
  };

  const activeMenuItem = getActiveMenuItem();
  const ActiveIcon = activeMenuItem.icon;

  // Obtener título del módulo activo
  const getModuleTitle = () => {
    const titles = {
      "Dashboard": "Dashboard Principal",
      "Ventas": "Gestión de Ventas",
      "Clientes": "Gestión de Clientes",
      "Facturacion": "Sistema de Facturación",
      "Cotizaciones": "Cotizaciones y Presupuestos",
      "Inventario": "Control de Inventario",
      "Ordenes": "Órdenes de Trabajo",
      "Contabilidad": "Contabilidad y Finanzas",
      "Usuarios": "Gestión de Usuarios"
    };
    return titles[activeButton] || "Panel de Control";
  };

  // Obtener subtítulo del módulo activo
  const getModuleSubtitle = () => {
    const subtitles = {
      "Dashboard": "Resumen general y métricas del sistema",
      "Ventas": "Registro y seguimiento de ventas",
      "Clientes": "Administración de clientes y contactos",
      "Facturacion": "Emisión y control de documentos fiscales",
      "Cotizaciones": "Crear y gestionar cotizaciones",
      "Inventario": "Control de stock y productos",
      "Ordenes": "Seguimiento de órdenes de servicio",
      "Contabilidad": "Informes financieros y contables",
      "Usuarios": "Administración de usuarios y permisos"
    };
    return subtitles[activeButton] || "Gestiona la información del sistema";
  };

  if (!empleado) {
    return <p className="loading-text">Cargando usuario...</p>;
  }

  // Renderiza módulo según botón activo
  const renderContent = () => {
    switch (activeButton) {
      case "Dashboard":
        return <Dashboard setActiveButton={setActiveButton} />;
      case "Ventas":
        return <VentasModule setActiveButton={setActiveButton} />;
      case "Clientes":
        return <ClientesModule setVistaActual={setActiveButton} />;
      case "Facturacion":
        return <FacturacionModule onCancel={() => setActiveButton("Dashboard")} />;
      case "Cotizaciones":
        return <CotizacionesModule setActiveButton={setActiveButton} />;
      case "Inventario":
        return <InventarioModule setActiveButton={setActiveButton} />;
      case "Ordenes":
        return <OrdenesModule setActiveButton={setActiveButton} />;
      case "Contabilidad":
        return <Contabilidad setActiveButton={setActiveButton} />;
      case "Usuarios":
        return <Usuarios setActiveButton={setActiveButton} />;
      default:
        return <VentasModule setActiveButton={setActiveButton} />;
    }
  };

  return (
    <div className="contenedor-principal">
      {/* 🔹 Grid Container Principal */}
      <div className="grid-container">
        
        {/* 🔹 ITEM 1 - Header Superior */}
        <div className="grid-item item-1">
          <div className="header-content">
            <div className="welcome-section">
              <img src="/src/assets/logo-joyeria.jpg" alt="Logo" className="logo" />
              <div className="welcome-text">
                JoyaSystem - Panel de Administración
              </div>
            </div>
            
            <div className="user-info">
              <div className="user-details">
                <div className="user-name">{empleado.nombre} {empleado.apellido}</div>
                <div className="user-role">Administrador</div>
              </div>
              <div className="user-avatar">
                {empleado.nombre.charAt(0).toUpperCase()}
              </div>
              <button onClick={handleLogout} className="adminButton" title="Cerrar Sesión">
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>

        {/* 🔹 ITEM 2 - Sidebar */}
        <div className="grid-item item-2">
          <div className="sidebar-content">
            <Sidebar activeButton={activeButton} setActiveButton={setActiveButton} />
          </div>
        </div>

        {/* 🔹 ITEM 3 - Contenido Principal - AQUÍ ESTÁ LA CORRECCIÓN */}
        <div className="grid-item item-3">
          <div className="modules-content">
            <div className="modules-navbar">
              <div className="module-header">
                {/* AGREGAR EL ICONO AQUÍ */}
                <div className="module-title-with-icon">
                  <ActiveIcon className="module-title-icon" />
                  <div className="module-title-text">
                    <div className="module-title">
                      {getModuleTitle()}
                    </div>
                    <div className="module-subtitle">
                      {getModuleSubtitle()}
                    </div>
                  </div>
                </div>
                </div>
              
              <div className="module-actions">
              </div>
            </div>
            <div className="module-container">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}