import React, { useState, useEffect } from 'react';
import ListaUsuarios from './ListaUsuarios';
import FormularioEmpleado from './FormularioEmpleado';
import FormularioEditarEmpleado from './FormularioEditarEmpleado';
import '../../styles/Usuarios.css';

const Usuarios = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState(null);

  // =====================================================
  // 🔹 Cargar empleados desde el backend
  // =====================================================
  const fetchEmpleados = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/empleados/");
      const data = await response.json();

      // Normaliza si viene como array o dentro de "usuarios"
      if (Array.isArray(data)) {
        setEmpleados(data);
      } else if (Array.isArray(data.usuarios)) {
        setEmpleados(data.usuarios);
      } else {
        setEmpleados([]);
      }
    } catch (err) {
      console.error("Error cargando empleados:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  // =====================================================
  // 🔹 Filtro solo por nombre o correo (sin roles)
  // =====================================================
  const empleadosFiltrados = Array.isArray(empleados)
    ? empleados.filter((empleado) => {
        const nombre = empleado.nombre_completo
          ? empleado.nombre_completo.toLowerCase()
          : "";
        const correo = empleado.correo ? empleado.correo.toLowerCase() : "";

        return (
          nombre.includes(filtro.toLowerCase()) ||
          correo.includes(filtro.toLowerCase())
        );
      })
    : [];

  // =====================================================
  // 🔹 Funciones auxiliares
  // =====================================================
  const handleAgregarEmpleado = () => setMostrarFormulario(true);
  const handleCerrarFormulario = () => setMostrarFormulario(false);

  const handleEmpleadoAgregado = () => {
    fetchEmpleados();
    setMostrarFormulario(false);
  };

  const handleEditarEmpleado = (emp) => setEmpleadoEditando(emp);

  const handleEmpleadoActualizado = () => {
    fetchEmpleados();
    setEmpleadoEditando(null);
  };

  const handleEmpleadoEliminado = () => {
    fetchEmpleados();
  };

  // =====================================================
  // 🔹 Render
  // =====================================================
  if (loading) return <div className="loading">Cargando empleados...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="usuarios-page">
      <div className="usuarios-header">
        <h1>Gestión de Usuarios</h1>
        <p>Administración de usuarios y permisos</p>
      </div>

      <div className="busqueda-filtros">
        <div className="busqueda-container">
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="input-busqueda"
          />
        </div>

        <button className="btn-agregar-usuario" onClick={handleAgregarEmpleado}>
          <span className="btn-icono">👤+</span> Agregar Empleado
        </button>
      </div>

      <div className="usuarios-content">
        <div className="lista-usuarios-container">
          {empleadosFiltrados.length === 0 ? (
            <div className="no-resultados">
              No se encontraron empleados con “{filtro}”
            </div>
          ) : (
            <ListaUsuarios
              usuarios={empleadosFiltrados}
              onEditarEmpleado={handleEditarEmpleado}
              onEmpleadoEliminado={handleEmpleadoEliminado}
            />
          )}
        </div>
      </div>

      {mostrarFormulario && (
        <FormularioEmpleado
          onClose={handleCerrarFormulario}
          onEmpleadoAgregado={handleEmpleadoAgregado}
        />
      )}

      {empleadoEditando && (
        <FormularioEditarEmpleado
          empleado={empleadoEditando}
          onClose={() => setEmpleadoEditando(null)}
          onEmpleadoActualizado={handleEmpleadoActualizado}
        />
      )}
    </div>
  );
};

export default Usuarios;
