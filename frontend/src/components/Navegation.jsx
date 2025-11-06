import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Login from "../pages/Login.jsx";
import AdminPanel from "../pages/Adminpanel.jsx";
import EmployeePanel from "../pages/EmployeePanel.jsx";
import Gerente from "../pages/Gerente.jsx";
<<<<<<< Updated upstream
=======
import VentasModule from "../components/VentasModule.jsx";
import ClientesModule from "../components/ClientesModule.jsx";
import Dashboard from "../pages/Dashboard.jsx";
>>>>>>> Stashed changes


export default function Navegation() {
  const [empleado, setEmpleado] = useState(
    JSON.parse(localStorage.getItem("empleado")) || null
  );

  const handleLogin = (empleadoLogueado) => {
    console.log("Usuario logueado:", empleadoLogueado);
    setEmpleado(empleadoLogueado);
    localStorage.setItem("empleado", JSON.stringify(empleadoLogueado));
  };

  const ProtectedRoute = ({ children, role }) => {
    if (!empleado) return <Navigate to="/login" />;
    if (role && empleado.rol !== role) return <Navigate to="/login" />;
    return children;
  };

  return (
    <Routes>
      {/* Ruta de login */}
      <Route path="/login" element={<Login onLogin={handleLogin} />} />

      {/* Panel de administrador */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      {/* Panel de empleado */}
      <Route
        path="/empleado"
        element={
          <ProtectedRoute role="empleado">
            <EmployeePanel />
          </ProtectedRoute>
        }
      />

      {/* Panel de gerente */}
      <Route
        path="/gerente"
        element={
          <ProtectedRoute role="gerente">
            <Gerente />
          </ProtectedRoute>
        }
      />

<<<<<<< Updated upstream
=======
      {/* Módulo de Ventas (solo admin) */}
        <Route
        path="admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Módulo de ventas (solo admin) */}
      <Route
        path="/admin/ventas"
        element={
          <ProtectedRoute role="admin">
            <VentasModule />
          </ProtectedRoute>
        }
      />

      {/* Módulo de clientes (solo admin) */}
      <Route
        path="/admin/clientes"
        element={
          <ProtectedRoute role="admin">
            <ClientesModule setVistaActual={() => {}} />
          </ProtectedRoute>
        }
      />

>>>>>>> Stashed changes
      {/* Ruta fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
