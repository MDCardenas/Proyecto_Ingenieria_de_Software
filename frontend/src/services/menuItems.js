// src/constants/menuItems.js
import { 
  FaShoppingCart, FaFileInvoiceDollar, FaClipboardList, FaBoxes, FaListAlt, 
  FaChartLine, FaUserFriends, FaTachometerAlt 
} from 'react-icons/fa';

export const menuItems = [
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