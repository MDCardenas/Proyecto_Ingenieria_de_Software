// src/components/Sidebar.jsx
import { 
  FaShoppingCart, FaFileInvoiceDollar, FaClipboardList, FaBoxes, FaListAlt, 
  FaChartLine, FaUserFriends, FaTachometerAlt 
} from 'react-icons/fa';
import PropTypes from 'prop-types';

export default function Sidebar({ activeButton, setActiveButton }) {
  // Lista de botones del sidebar
  const menuItems = [
    { id: "Dashboard", icon: FaTachometerAlt, label: "Dashboard" },
    { id: "Clientes", icon: FaUserFriends, label: "Clientes" },
    { id: "Ventas", icon: FaShoppingCart, label: "Ventas" },
    { id: "Facturacion", icon: FaFileInvoiceDollar, label: "Facturación" },
    { id: "Cotizaciones", icon: FaClipboardList, label: "Cotizaciones" },
    { id: "Inventario", icon: FaBoxes, label: "Inventario" },
    { id: "Ordenes", icon: FaListAlt, label: "Órdenes" },
    { id: "Contabilidad", icon: FaChartLine, label: "Contabilidad" },
    { id: "Usuarios", icon: FaUserFriends, label: "Usuarios" }
  ];

  return (
    <div className="buttons-container">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <button 
            key={item.id}
            className={`button ${activeButton === item.id ? "active" : ""}`}
            onClick={() => setActiveButton(item.id)}
          >
            <Icon className="icon" />
            <span className="label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Validación de props
Sidebar.propTypes = {
  activeButton: PropTypes.string.isRequired,
  setActiveButton: PropTypes.func.isRequired
};