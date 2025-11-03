// src/pages/AdminPanel.jsx
import { useEffect, useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import VentasModule from "../components/VentasModule";
import ClientesModule from "../components/ClientesModule";
import "../styles/AdminPanel.css";
import "../styles/BaseLayout.css";

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

  if (!empleado) {
    return <p className="loading-text">Cargando usuario...</p>;
  }

  // Renderiza módulo según botón activo
  const renderContent = () => {
    switch (activeButton) {
      case "Dashboard":
        return <h1 className="titulo-modulo">DASHBOARD</h1>;
      case "Ventas":
        return <VentasModule setActiveButton={setActiveButton} />;  // ✅ CAMBIO AQUÍ
      case "Clientes":
        return <ClientesModule setVistaActual={setActiveButton} />;
      case "Facturacion":
        return <h1 className="titulo-modulo">FACTURACIÓN</h1>;
      case "Cotizaciones":
        return <h1 className="titulo-modulo">COTIZACIONES</h1>;
      case "Inventario":
        return <h1 className="titulo-modulo">INVENTARIO</h1>;
      case "Ordenes":
        return <h1 className="titulo-modulo">ÓRDENES</h1>;
      case "Contabilidad":
        return <h1 className="titulo-modulo">CONTABILIDAD</h1>;
      case "Usuarios":
        return <h1 className="titulo-modulo">USUARIOS</h1>;
      default:
        return <VentasModule setActiveButton={setActiveButton} />;  // ✅ Y AQUÍ TAMBIÉN
    }
  };

  return (
    <div className="contenedor-principal">
      {/* 🔹 Header / Navbar superior */}
      <div className="navbarHorizontal">
        <div className="logo-containet">
          <img src="/src/assets/logo-joyeria.jpg" alt="Logo de la joyería" />
          <span className="logo-text">JoyaSystem</span>
        </div>

        <article className="article">
          <header className="header">
            <div className="avatar">
              {empleado.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="info">
              <strong>Administrador</strong>
              <span>{empleado.nombre} {empleado.apellido}</span>
              <span className="infoUsername">{empleado.correo}</span>
            </div>
          </header>
          <aside>
            <button onClick={handleLogout} className="adminButton" title="Cerrar Sesión">
              <FaSignOutAlt />
            </button>
          </aside>
        </article>
      </div>

      {/* 🔹 Cuerpo principal */}
      <div className="contenido-principal">
        <Sidebar activeButton={activeButton} setActiveButton={setActiveButton} />
        <div className="contenido">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}