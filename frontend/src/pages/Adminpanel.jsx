import { useEffect, useState } from "react";
import { 
  FaShoppingCart, FaFileInvoiceDollar, FaClipboardList, FaBoxes, FaListAlt, 
  FaChartLine, FaUserFriends, FaTachometerAlt, FaSignOutAlt 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import "../styles/AdminPanel.css";


export default function AdminPanel() {
  const navigate = useNavigate();

  const handleLogout = ()=> {
    navigate('/Login');
  };

  const [empleado, setEmpleado] = useState(null);

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
          <button className="button">
            <FaTachometerAlt className="icon" />
            Dashboard
          </button>
          <button className="button">
            <FaShoppingCart className="icon" />
            Ventas
          </button>
          <button className="button">
            <FaFileInvoiceDollar className="icon" />
            Facturación
          </button>
          <button className="button">
            <FaClipboardList className="icon" />
            Cotizaciones
          </button>
          <button className="button">
            <FaBoxes className="icon" />
            Inventario
          </button>
          <button className="button">
            <FaListAlt className="icon" />
            Órdenes
          </button>
          <button className="button">
            <FaChartLine className="icon" />
            Contabilidad
          </button>
          <button className="button">
            <FaUserFriends className="icon" />
            Usuarios
          </button>
        </div>

        {/* Aquí iría el contenido principal de tu aplicación */}
        <div className="contenido">
          {/* Tu contenido aquí */}
        </div>
      </div>
    </div>
  );
}

