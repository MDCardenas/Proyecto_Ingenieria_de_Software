import { useEffect, useState } from "react";
import { 
  FaShoppingCart, FaFileInvoiceDollar, FaClipboardList, FaBoxes, FaListAlt, 
  FaChartLine, FaUserFriends, FaTachometerAlt, FaSignOutAlt 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import "../styles/AdminPanel.css";
import Facturacion from "./facturacion";


export default function AdminPanel() {
  const navigate = useNavigate();

  const handleLogout = ()=> {
    navigate('/Login');
  };

  const [empleado, setEmpleado] = useState(null);
  const [activeButton, setActiveButton] = useState("Dashboard"); // por defecto es Dashboard

  useEffect(()=> {
    //Recuperar el empleado guardado en localStorage
    const empleadoGuardado = localStorage.getItem("empleado");
    if (empleadoGuardado) {
      setEmpleado(JSON.parse(empleadoGuardado));
    }
  }, []);

  // Si empleado es null, mostramos algo mientras carga
  if (!empleado) {
    return <p>Cargando usuario...</p>;
  }

  return (
    // Contenedor padre de toda la pagina
    <div className="contenedor-principal">

      {/* Navbar horizontal superior */}
      <div className="navbarHorizontal">
        <div className="logo-containet">
          <img src="src/assets/logo-joyeria.jpg" alt="Logo de la joyeria" />
          <span className="logo-text">JoyaSystem</span>
        </div>
        <article className="article">
          <header className="header">
            <div className="avatar">A</div>
            <div className="info">
              <strong>Administrador</strong>
              {empleado.nombre} {empleado.apellido}
              <span className="infoUsername">{empleado.correo}</span>
            </div>
          </header>
          <aside>
            <button onClick={handleLogout} className="adminButton">
              <FaSignOutAlt />
            </button>
          </aside>
        </article>
      </div>

      {/* Contenedor del contenido principal */}
      <div className="contenido-principal">
        {/* Navbar vertical del lado izquierdo */}
        <div className="navbarVertical">
          <button 
            className={`button ${activeButton === "Dashboard" ? "active" : ""}`}
            onClick={()=> setActiveButton("Dashboard")}
          >
            <FaTachometerAlt className="icon" />
            Dashboard
          </button>
          <button 
            className={`button ${activeButton === "Ventas" ? "active" : ""}`}
            onClick={() => setActiveButton("Ventas")}
          >
            <FaShoppingCart className="icon" />
            Ventas
          </button>
          <button 
            className={`button ${activeButton === "Facturacion" ? "active" : ""}`}
            onClick={() => setActiveButton("Facturacion")}
          >
            <FaFileInvoiceDollar className="icon" />
            Facturación
          </button>
          <button 
            className={`button ${activeButton === "Cotizaciones" ? "active" : ""}`}
            onClick={() => setActiveButton("Cotizaciones")}
          >
            <FaClipboardList className="icon" />
            Cotizaciones
          </button>
          <button 
            className={`button ${activeButton === "Inventario" ? "active" : ""}`}
            onClick={() => setActiveButton("Inventario")}
          >
            <FaBoxes className="icon" />
            Inventario
          </button>
          <button 
            className={`button ${activeButton === "Ordenes" ? "active" : ""}`}
            onClick={() => setActiveButton("Ordenes")}
          >
            <FaListAlt className="icon" />
            Órdenes
          </button>
          <button 
            className={`button ${activeButton === "Contabilidad" ? "active" : ""}`}
            onClick={() => setActiveButton("Contabilidad")}
          >
            <FaChartLine className="icon" />
            Contabilidad
          </button>
          <button 
            className={`button ${activeButton === "Usuarios" ? "active" : ""}`}
            onClick={() => setActiveButton("Usuarios")}
          >
            <FaUserFriends className="icon" />
            Usuarios
          </button>
        </div>

        {/* Aquí iría el contenido principal de tu aplicación */}
        <div className="contenido">
          {/* Tu contenido aquí */}
          {/* Aqui en lugar del "h1" iria el llamado a los componentes de cada modulo */}
          {activeButton === "Dashboard" && <h1>DASHBOARD</h1>}
          {activeButton === "Ventas" && <h1>VENTAS</h1>}
          {activeButton === "Facturacion" && (
            <Facturacion onCancel={()=> setActiveButton("Ventas")} />
          )} 
          {activeButton === "Cotizaciones" && <h1>COTIZACIONES</h1>}
          {activeButton === "Inventario" && <h1>INVENTARIO</h1>}
          {activeButton === "Ordenes" && <h1>ÓRDENES</h1>}
          {activeButton === "Contabilidad" && <h1>CONTABILIDAD</h1>}
          {activeButton === "Usuarios" && <h1>USUARIOS</h1>}
        </div>
      </div>
    </div>
  );
}

