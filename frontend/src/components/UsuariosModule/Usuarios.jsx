import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TarjetaUsuario from './TarjetaUsuario';
import { FaUserPlus, FaSearch, FaFilter } from 'react-icons/fa';
import '../../styles/scss/pages/_usuarios.scss'

const Usuarios = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  
  const navigate = useNavigate();

  // Cargar empleados
  const fetchEmpleados = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/empleados/");
      const data = await response.json();

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

  // Filtrado avanzado
  const empleadosFiltrados = Array.isArray(empleados)
    ? empleados.filter((empleado) => {
        const nombre = empleado.nombre_completo?.toLowerCase() || "";
        const correo = empleado.correo?.toLowerCase() || "";
        const perfil = empleado.perfil?.toLowerCase() || "";
        const estado = empleado.estado?.toLowerCase() || "";

        const cumpleBusqueda = 
          nombre.includes(filtro.toLowerCase()) ||
          correo.includes(filtro.toLowerCase());

        const cumpleRol = 
          filtroRol === "todos" || 
          perfil.includes(filtroRol.toLowerCase());

        const cumpleEstado = 
          filtroEstado === "todos" || 
          estado === filtroEstado.toLowerCase();

        return cumpleBusqueda && cumpleRol && cumpleEstado;
      })
    : [];

  // Navegación
  const handleNuevoEmpleado = () => {
    navigate('/usuarios/nuevo');
  };

  const handleEditarEmpleado = (empleado) => {
    navigate(`/usuarios/editar/${empleado.id_empleado}`);
  };

  const handleEmpleadoEliminado = () => {
    fetchEmpleados();
  };

  if (loading) {
    return (
      <div className="usuarios-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="usuarios-page">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error al cargar usuarios</h3>
          <p>{error}</p>
          <button className="btn-pill btn-pill-primary" onClick={fetchEmpleados}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="usuarios-page">
      {/* Header */}
      <div className="usuarios-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Gestión de Usuarios</h1>
            <p>Administra empleados, roles y permisos del sistema</p>
          </div>
          <button 
            className="btn-pill btn-pill-primary btn-nuevo-usuario"
            onClick={handleNuevoEmpleado}
          >
            <FaUserPlus /> Nuevo Empleado
          </button>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="usuarios-filtros">
        <div className="search-pill-container">
          <div className="search-pill">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filtros-avanzados">
          <div className="filtro-grupo">
            <FaFilter className="filtro-icon" />
            <select 
              value={filtroRol} 
              onChange={(e) => setFiltroRol(e.target.value)}
              className="filtro-select"
            >
              <option value="todos">Todos los roles</option>
              <option value="administrador">Administrador</option>
              <option value="vendedor">Vendedor</option>
              <option value="gerente">Gerente</option>
              <option value="cajero">Cajero</option>
              <option value="contador">Contador</option>
            </select>
          </div>

          <div className="filtro-grupo">
            <select 
              value={filtroEstado} 
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="filtro-select"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>

        <div className="usuarios-stats">
          <div className="stat-badge">
            <span className="stat-number">{empleadosFiltrados.length}</span>
            <span className="stat-label">Usuarios encontrados</span>
          </div>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="usuarios-content">
        {empleadosFiltrados.length === 0 ? (
          <div className="no-resultados">
            <div className="no-resultados-icon">🔍</div>
            <h3>No se encontraron resultados</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="usuarios-grid">
            {empleadosFiltrados.map((empleado) => (
              <TarjetaUsuario
                key={empleado.id_empleado}
                empleado={empleado}
                onEditar={handleEditarEmpleado}
                onEliminado={handleEmpleadoEliminado}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Usuarios;