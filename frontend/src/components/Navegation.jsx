// src/components/Navegation.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "../pages/Login.jsx";
import AdminPanel from "../pages/Adminpanel.jsx";
import EmployeePanel from "../pages/EmployeePanel.jsx";
import Gerente from "../pages/Gerente.jsx";

export default function Navegation() {
  const [empleado, setEmpleado] = useState(null);

  // Cargar empleado desde localStorage al inicializar
  useEffect(() => {
    const empleadoGuardado = localStorage.getItem("empleado");
    if (empleadoGuardado) {
      setEmpleado(JSON.parse(empleadoGuardado));
    }
  }, []);

  const handleLogin = (empleadoLogueado) => {
    setEmpleado(empleadoLogueado);
    localStorage.setItem("empleado", JSON.stringify(empleadoLogueado));
  };

  // Ruta protegida según rol - MÁS FLEXIBLE
  const ProtectedRoute = ({ children, role }) => {
    if (!empleado) {
      return <Navigate to="/login" replace />;
    }
    
  
    
    // Determinar el rol del usuario de múltiples formas
    const userRole = empleado.rol || 
                    empleado.perfil_nombre?.toLowerCase() || 
                    (empleado.codigo_perfil && empleado.codigo_perfil.toString());
    

    
    // Si no se especifica rol, permitir acceso a todos los usuarios autenticados
    if (!role) {
      return children;
    }
    
    // Verificar acceso basado en código de perfil
    if (empleado.codigo_perfil) {
      if (role === "admin" && empleado.codigo_perfil === 1) {
        return children;
      } else if (role === "gerente" && empleado.codigo_perfil === 2) {
        return children;
      } else if (role === "empleado" && empleado.codigo_perfil === 3) {
        return children;
      }
    }
    
    // Verificar acceso basado en nombre de perfil
    if (empleado.perfil_nombre) {
      const perfilLower = empleado.perfil_nombre.toLowerCase();
      if (role === "admin" && perfilLower.includes("admin")) {
        return children;
      } else if (role === "gerente" && perfilLower.includes("gerente")) {
        return children;
      } else if (role === "empleado" && (perfilLower.includes("empleado") || perfilLower.includes("vendedor"))) {
        return children;
      }
    }
    
    // Verificar acceso basado en rol
    if (empleado.rol) {
      const rolLower = empleado.rol.toLowerCase();
      if (role === "admin" && rolLower.includes("admin")) {
        return children;
      } else if (role === "gerente" && rolLower.includes("gerente")) {
        return children;
      } else if (role === "empleado" && (rolLower.includes("empleado") || rolLower.includes("vendedor"))) {
        return children;
      }
    }
    
    console.log("Acceso denegado, redirigiendo a login");
    return <Navigate to="/login" replace />;
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

      {/* Ruta por defecto */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Ruta fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}