import React, { useState, useEffect } from 'react';
import ListaUsuarios from '../components/UsuariosComponentes/ListaUsuarios';
import FormularioEmpleado from '../components/UsuariosComponentes/FormularioEmpleado';
import FormularioEditarEmpleado from '../components/UsuariosComponentes/FormularioEditarEmpleado';
import '../styles/Usuarios.css';

const Usuarios = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [rolFiltro, setRolFiltro] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFormularioEditar, setMostrarFormularioEditar] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState(null);

  const fetchEmpleados = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/empleados/');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.usuarios && Array.isArray(data.usuarios)) {
        setEmpleados(data.usuarios);
      } else {
        throw new Error('Formato de datos incorrecto');
      }
      
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const empleadosFiltrados = empleados.filter(empleado => {
    const coincideNombre = empleado.nombre_completo?.toLowerCase().includes(filtro.toLowerCase());
    const coincideRol = rolFiltro === '' || empleado.rol === rolFiltro;
    return coincideNombre && coincideRol;
  });

  const handleAgregarEmpleado = () => {
    setMostrarFormulario(true);
  };

  const handleCerrarFormulario = () => {
    setMostrarFormulario(false);
  };

  const handleEmpleadoAgregado = () => {
    setLoading(true);
    fetchEmpleados();
    setMostrarFormulario(false);
  };

  const handleEditarEmpleado = (empleado) => {
    setEmpleadoEditando(empleado);
    setMostrarFormularioEditar(true);
  };

  const handleCerrarFormularioEditar = () => {
    setMostrarFormularioEditar(false);
    setEmpleadoEditando(null);
  };

  const handleEmpleadoActualizado = () => {
    setLoading(true);
    fetchEmpleados();
    setMostrarFormularioEditar(false);
    setEmpleadoEditando(null);
  };

  if (loading) return <div className="loading">Cargando empleados...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="usuarios-page">
      <div className="usuarios-header">
        <h1>Administración de Empleados</h1>
        <p>{empleados.length} empleados en el sistema</p>
      </div>

      <div className="separador"></div>

      <div className="busqueda-filtros">
        <div className="busqueda-container">
          <div className="buscador">
            <input 
              type="text" 
              placeholder="Buscar empleados por nombre..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="input-busqueda"
            />
          </div>
          
          <div className="filtro-roles">
            <select 
              value={rolFiltro}
              onChange={(e) => setRolFiltro(e.target.value)}
              className="select-roles"
            >
              <option value="">Todos los roles</option>
              <option value="Admin">Admin</option>
              <option value="Vendedor">Vendedor</option>
              <option value="Joyero">Joyero</option>
              <option value="Contador">Contador</option>
            </select>
          </div>
        </div>

        <button 
          className="btn-agregar-usuario"
          onClick={handleAgregarEmpleado}
        >
          <span className="btn-icono">👤+</span>
          Agregar Empleado
        </button>
      </div>

      <div className="usuarios-content">
        <div className="lista-usuarios-container">
          {empleadosFiltrados.length === 0 && empleados.length > 0 ? (
            <div className="no-resultados">
              No se encontraron empleados con "{filtro}" {rolFiltro && `en el rol "${rolFiltro}"`}
            </div>
          ) : empleados.length === 0 ? (
            <div className="no-resultados">
              No hay empleados registrados en la base de datos
            </div>
          ) : (
            <ListaUsuarios 
              usuarios={empleadosFiltrados} 
              onEditarEmpleado={handleEditarEmpleado}
            />
          )}
        </div>
      </div>

      {/* Modal para agregar empleado */}
      {mostrarFormulario && (
        <FormularioEmpleado 
          onClose={handleCerrarFormulario}
          onEmpleadoAgregado={handleEmpleadoAgregado}
        />
      )}

      {/* Modal para editar empleado */}
      {mostrarFormularioEditar && empleadoEditando && (
        <FormularioEditarEmpleado 
          empleado={empleadoEditando}
          onClose={handleCerrarFormularioEditar}
          onEmpleadoActualizado={handleEmpleadoActualizado}
        />
      )}
    </div>
  );
};

export default Usuarios;