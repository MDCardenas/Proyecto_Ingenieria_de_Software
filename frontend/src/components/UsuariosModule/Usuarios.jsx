import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaSearch, FaFilter, FaTrash, FaEdit, FaArrowLeft, FaSave, FaTimes, FaUser, FaEnvelope, FaUserTag, FaCheckCircle, FaTimesCircle, FaPhone } from 'react-icons/fa';
import "../../styles/scss/main.scss"

// Componente de Tarjeta de Usuario
const TarjetaUsuario = ({ empleado, onEditar, onEliminar }) => {
  return (
    <div className="usuario-card">
      <div className="usuario-card-header">
        <div className="usuario-avatar">
          <FaUser />
        </div>
        <div className="usuario-info-principal">
          <h3 className="usuario-nombre">{empleado.nombre_completo}</h3>
          <p className="usuario-email">
            <FaEnvelope /> {empleado.correo || "Sin correo"}
          </p>
        </div>
      </div>

      <div className="usuario-detalles">
        <div className="detalle-item">
          <FaUserTag className="detalle-icon" />
          <div className="detalle-content">
            <span className="detalle-label">Perfil</span>
            <span className="detalle-valor perfil-badge">
              {empleado.perfil || "Sin perfil"}
            </span>
          </div>
        </div>

        <div className="detalle-item">
          <FaPhone className="detalle-icon" />
          <div className="detalle-content">
            <span className="detalle-label">Teléfono</span>
            <span className="detalle-valor">{empleado.telefono || "—"}</span>
          </div>
        </div>

        <div className="detalle-item">
          <div className="detalle-content estado-content">
            <span className="detalle-label">Estado</span>
            <span className={`estado-badge ${empleado.estado?.toLowerCase()}`}>
              {empleado.estado === "Activo" ? (
                <>
                  <FaCheckCircle /> Activo
                </>
              ) : (
                <>
                  <FaTimesCircle /> Inactivo
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="usuario-acciones">
        <button 
          className="btn-pill btn-pill-info btn-accion"
          onClick={() => onEditar(empleado)}
        >
          <FaEdit /> Editar
        </button>
        <button 
          className="btn-pill btn-pill-danger btn-accion"
          onClick={() => onEliminar(empleado)}
        >
          <FaTrash /> Eliminar
        </button>
      </div>
    </div>
  );
};

// Componente de Formulario de Registro/Edición
const FormularioEmpleado = ({ form, editId, loading, perfiles, onFieldChange, onSubmit, onCancel }) => {
  return (
    <div className="pantalla-accion">
      <h2 className="form-title">{editId ? "Editar Empleado" : "Nuevo Empleado"}</h2>

      <div className="formulario-content">
        <div className="formulario-grid">
          {/* Información Personal */}
          <div className="formulario-seccion">
            <h3 className="seccion-titulo">Información Personal</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={onFieldChange}
                  required
                  placeholder="Ingrese el nombre"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Apellido *</label>
                <input
                  type="text"
                  name="apellido"
                  value={form.apellido}
                  onChange={onFieldChange}
                  required
                  placeholder="Ingrese el apellido"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={form.telefono}
                  onChange={onFieldChange}
                  placeholder="Ej: +504 9999-9999"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Correo Electrónico *</label>
                <input
                  type="email"
                  name="correo"
                  value={form.correo}
                  onChange={onFieldChange}
                  required
                  placeholder="ejemplo@correo.com"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Información de Acceso */}
          <div className="formulario-seccion">
            <h3 className="seccion-titulo">Información de Acceso</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Usuario *</label>
                <input
                  type="text"
                  name="usuario"
                  value={form.usuario}
                  onChange={onFieldChange}
                  required
                  placeholder="Nombre de usuario"
                  disabled={loading}
                />
              </div>

              {!editId && (
                <div className="form-group">
                  <label>Contraseña *</label>
                  <input
                    type="password"
                    name="contrasena"
                    value={form.contrasena}
                    onChange={onFieldChange}
                    required
                    placeholder="Contraseña segura"
                    disabled={loading}
                  />
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Perfil *</label>
                <select
                  name="codigo_perfil"
                  value={form.codigo_perfil}
                  onChange={onFieldChange}
                  required
                  disabled={loading}
                >
                  <option value="">Seleccione un perfil</option>
                  {perfiles.map((perfil) => (
                    <option key={perfil.codigo_perfil} value={perfil.codigo_perfil}>
                      {perfil.perfil}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Salario</label>
                <input
                  type="number"
                  name="salario"
                  value={form.salario}
                  onChange={onFieldChange}
                  placeholder="0.00"
                  step="0.01"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="botones-container">
          <button 
            type="button" 
            className="btn-submit" 
            disabled={loading}
            onClick={onSubmit}
          >
            {loading ? "Procesando..." : (editId ? "Actualizar" : "Registrar")}
          </button>
          <button 
            type="button" 
            className="btn-cancel" 
            onClick={onCancel}
            disabled={loading}
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Principal
const UsuariosModule = () => {
  const [empleados, setEmpleados] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [accionActiva, setAccionActiva] = useState(null);
  const [editId, setEditId] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    usuario: '',
    contrasena: '',
    telefono: '',
    correo: '',
    salario: '',
    codigo_perfil: ''
  });

  useEffect(() => {
    fetchEmpleados();
    fetchPerfiles();
  }, []);

  const fetchEmpleados = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/empleados/");
      const data = await response.json();
      setEmpleados(Array.isArray(data) ? data : Array.isArray(data.usuarios) ? data.usuarios : []);
      setError(null);
    } catch (err) {
      console.error("Error cargando empleados:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerfiles = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/perfiles/');
      const data = await response.json();
      setPerfiles(data);
    } catch (err) {
      console.error("Error cargando perfiles:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const empleadoData = {
        ...formData,
        salario: parseFloat(formData.salario) || 0,
        codigo_perfil: parseInt(formData.codigo_perfil)
      };

      let response;
      if (editId) {
        response = await fetch(`http://127.0.0.1:8000/api/empleados/${editId}/actualizar/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(empleadoData)
        });
        setSuccess('¡Empleado actualizado exitosamente!');
      } else {
        response = await fetch('http://127.0.0.1:8000/api/empleados/nuevo/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(empleadoData)
        });
        setSuccess('¡Empleado registrado exitosamente!');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }
      
      setFormData({
        nombre: '',
        apellido: '',
        usuario: '',
        contrasena: '',
        telefono: '',
        correo: '',
        salario: '',
        codigo_perfil: ''
      });
      setEditId(null);
      setAccionActiva(null);
      await fetchEmpleados();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoEmpleado = () => {
    setFormData({
      nombre: '',
      apellido: '',
      usuario: '',
      contrasena: '',
      telefono: '',
      correo: '',
      salario: '',
      codigo_perfil: ''
    });
    setEditId(null);
    setAccionActiva('registrar');
    setError(null);
    setSuccess(null);
  };

  const handleEditarEmpleado = (empleado) => {
    const perfilEncontrado = perfiles.find(p => p.perfil === empleado.perfil);
    
    setFormData({
      nombre: empleado.nombre || '',
      apellido: empleado.apellido || '',
      usuario: empleado.usuario || '',
      contrasena: '',
      telefono: empleado.telefono || '',
      correo: empleado.correo || '',
      salario: empleado.salario || '',
      codigo_perfil: perfilEncontrado ? perfilEncontrado.codigo_perfil.toString() : ''
    });
    setEditId(empleado.id_empleado);
    setAccionActiva('registrar');
    setError(null);
    setSuccess(null);
  };

  const handleEliminarClick = (empleado) => {
    setEmpleadoSeleccionado(empleado);
    setMostrarConfirmacion(true);
  };

  const confirmarEliminar = async () => {
    if (!empleadoSeleccionado) return;
    setEliminando(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/empleados/${empleadoSeleccionado.id_empleado}/eliminar/`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setSuccess('¡Empleado eliminado exitosamente!');
        await fetchEmpleados();
        setMostrarConfirmacion(false);
      } else {
        setError('Error al eliminar empleado');
      }
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      setError('Error al eliminar empleado');
    } finally {
      setEliminando(false);
    }
  };

  // Filtrado de empleados
  const empleadosFiltrados = empleados.filter((empleado) => {
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
  });

  // Si hay una acción activa (registrar/editar), mostrar el formulario
  if (accionActiva === 'registrar') {
    return (
      <div className="usuarios-module">
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)} className="error-close">×</button>
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
            <button onClick={() => setSuccess(null)} className="success-close">×</button>
          </div>
        )}

        <FormularioEmpleado
          form={formData}
          editId={editId}
          loading={loading}
          perfiles={perfiles}
          onFieldChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={() => setAccionActiva(null)}
        />
      </div>
    );
  }

  // Vista principal con las tarjetas
  return (
    <div className="usuarios-module">
      {/* Mensajes de estado */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
          <button onClick={() => setSuccess(null)} className="success-close">×</button>
        </div>
      )}

      {/* Barra de búsqueda y filtros */}
      <div className="usuarios-filtros">
        <div className="filtros-superiores">
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

          <button 
            className="btn-pill btn-pill-primary btn-nuevo-usuario"
            onClick={handleNuevoEmpleado}
          >
            <FaUserPlus /> Nuevo Empleado
          </button>
        </div>

        <div className="usuarios-stats">
          <div className="stat-badge">
            <span className="stat-number">{empleadosFiltrados.length}</span>
            <span className="stat-label">usuarios</span>
          </div>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="usuarios-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando usuarios...</p>
          </div>
        ) : empleadosFiltrados.length === 0 ? (
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
                onEliminar={handleEliminarClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {mostrarConfirmacion && (
        <div className="modal-overlay" onClick={() => setMostrarConfirmacion(false)}>
          <div className="modal-confirmacion" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-warning">⚠️</div>
            <h3>¿Eliminar empleado?</h3>
            <p>
              ¿Estás seguro de eliminar a <strong>{empleadoSeleccionado?.nombre_completo}</strong>?
              <br />
              Esta acción no se puede deshacer.
            </p>
            <div className="modal-acciones">
              <button
                className="btn-pill btn-pill-secondary"
                onClick={() => setMostrarConfirmacion(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-pill btn-pill-danger"
                onClick={confirmarEliminar}
                disabled={eliminando}
              >
                {eliminando ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosModule;