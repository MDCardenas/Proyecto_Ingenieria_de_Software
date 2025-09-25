import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Login from "../pages/Login.jsx";
import AdminPanel from "../pages/Adminpanel.jsx";
import EmployeePanel from "../pages/EmployeePanel.jsx";
import Gerente from "../pages/Gerente.jsx";


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

      {/* Ruta fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
