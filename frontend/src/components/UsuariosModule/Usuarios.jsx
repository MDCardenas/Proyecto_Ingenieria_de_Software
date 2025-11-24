import React, { useState, useEffect } from 'react';
import ListaUsuarios from './ListaUsuarios';
import FormularioEmpleado from './FormularioEmpleado';
import FormularioEditarEmpleado from './FormularioEditarEmpleado';
import ModalDetallesEmpleado from './ModalDetallesEmpleado'; // <--- IMPORTAR MODAL
import '../../styles/Usuarios.css';

const Usuarios = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("");
  
  // Estados para controlar qué se muestra
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState(null);
  const [empleadoVerDetalles, setEmpleadoVerDetalles] = useState(null); // <--- ESTADO NUEVO

  // Cargar empleados
  const fetchEmpleados = async () => {
    try {
      const response = await fetch("http://20.64.150.5:8000/api/empleados/");
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

  // Filtrado
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

  // --- HANDLERS ---

  const handleAgregarEmpleado = () => setMostrarFormulario(true);
  
  const handleCerrarFormulario = () => {
    setMostrarFormulario(false);
    setEmpleadoEditando(null);
  };

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

  // Handlers para Detalles
  const handleVerDetalles = (emp) => {
    setEmpleadoVerDetalles(emp); // Abre el modal
  };

  const handleCerrarDetalles = () => {
    setEmpleadoVerDetalles(null); // Cierra el modal
  };

  if (loading) return <div className="loading">Cargando empleados...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="usuarios-page">
      {/* Mostrar formulario o lista según el estado */}
      {mostrarFormulario || empleadoEditando ? (
        <div className="formulario-page">
          <div className="formulario-container">
            {mostrarFormulario ? (
              <FormularioEmpleado
                onClose={handleCerrarFormulario}
                onEmpleadoAgregado={handleEmpleadoAgregado}
              />
            ) : (
              <FormularioEditarEmpleado
                empleado={empleadoEditando}
                onClose={handleCerrarFormulario}
                onEmpleadoActualizado={handleEmpleadoActualizado}
              />
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Filtros y búsqueda */}
          <div className="usuarios-filtros">
            <div className="filtros-superiores">
              <div className="search-pill">
                <input
                  type="text"
                  placeholder="Buscar por nombre o correo..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filtros-avanzados">
                <button 
                  className="btn-nuevo-usuario primary" 
                  onClick={handleAgregarEmpleado}
                >
                  <span className="btn-icono">👤</span>
                  Nuevo Empleado
                </button>
              </div>
            </div>

            <div className="usuarios-stats">
              <div className="stat-badge">
                <span className="stat-number">{empleadosFiltrados.length}</span>
                <span className="stat-label">empleados encontrados</span>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="usuarios-content">
            <div className="lista-usuarios-container">
              {empleadosFiltrados.length === 0 ? (
                <div className="no-resultados">
                  <div className="no-resultados-icon">🔍</div>
                  <h3>No se encontraron empleados</h3>
                  <p>No hay resultados para "{filtro}"</p>
                </div>
              ) : (
                <ListaUsuarios
                  usuarios={empleadosFiltrados}
                  onEditarEmpleado={handleEditarEmpleado}
                  onEmpleadoEliminado={handleEmpleadoEliminado}
                  onVerDetalles={handleVerDetalles} // <--- Pasar prop
                />
              )}
            </div>
          </div>
        </>
      )}

      {/* Renderizar Modal de Detalles si hay uno seleccionado */}
      {empleadoVerDetalles && (
        <ModalDetallesEmpleado 
          empleado={empleadoVerDetalles} 
          onClose={handleCerrarDetalles} 
        />
      )}
    </div>
  );
};

export default Usuarios;