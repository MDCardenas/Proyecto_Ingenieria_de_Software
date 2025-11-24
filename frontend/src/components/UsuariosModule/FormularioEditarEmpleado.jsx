import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';

const FormularioEditarEmpleado = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [perfiles, setPerfiles] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    usuario: '',
    telefono: '',
    correo: '',
    salario: '',
    codigo_perfil: '',
    contrasena: ''
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        console.log('[CARGA] Iniciando carga de datos para empleado ID:', id);
        
        const [perfilesRes, empleadoRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/perfiles/'),
          fetch(`http://127.0.0.1:8000/api/empleados/${id}/`)
        ]);

        console.log('[CARGA] Status respuestas:', {
          perfiles: perfilesRes.status,
          empleado: empleadoRes.status
        });

        if (!perfilesRes.ok) {
          throw new Error(`Error al cargar perfiles: ${perfilesRes.status}`);
        }
        if (!empleadoRes.ok) {
          throw new Error(`Error al cargar empleado: ${empleadoRes.status}`);
        }

        const perfilesData = await perfilesRes.json();
        const empleadoData = await empleadoRes.json();

        console.log('[CARGA] Perfiles recibidos:', perfilesData);
        console.log('[CARGA] Empleado recibido:', empleadoData);

        setPerfiles(perfilesData);

        // IMPORTANTE: Mapear correctamente los datos
        const nuevoFormData = {
          nombre: empleadoData.nombre || '',
          apellido: empleadoData.apellido || '',
          usuario: empleadoData.usuario || '',
          telefono: empleadoData.telefono || '',
          correo: empleadoData.correo || '',
          salario: empleadoData.salario !== undefined && empleadoData.salario !== null 
            ? empleadoData.salario.toString() 
            : '',
          codigo_perfil: empleadoData.codigo_perfil 
            ? empleadoData.codigo_perfil.toString() 
            : '',
          contrasena: ''
        };

        console.log('[CARGA] FormData preparado:', nuevoFormData);
        setFormData(nuevoFormData);
        console.log('[CARGA] Estado actualizado correctamente');

      } catch (err) {
        console.error('[ERROR] Error al cargar datos:', err);
        setError('Error al cargar los datos del empleado: ' + err.message);
      } finally {
        setCargando(false);
      }
    };

    if (id) {
      cargarDatos();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`[CAMPO] Campo modificado: ${name} = "${value}"`);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('\n========================================');
    console.log('[ENVIO] ENVIANDO ACTUALIZACIÓN');
    console.log('========================================');
    console.log('[ENVIO] FormData actual:', formData);

    // Validaciones básicas más robustas
    const validaciones = [
      { campo: 'nombre', mensaje: 'El nombre es obligatorio' },
      { campo: 'apellido', mensaje: 'El apellido es obligatorio' },
      { campo: 'usuario', mensaje: 'El usuario es obligatorio' },
      { campo: 'correo', mensaje: 'El correo electrónico es obligatorio' },
      { campo: 'codigo_perfil', mensaje: 'El perfil es obligatorio' }
    ];

    for (const validacion of validaciones) {
      const valor = formData[validacion.campo];
      if (!valor || valor.toString().trim() === '') {
        console.error(`[ERROR] Validación fallida: ${validacion.mensaje}`);
        setError(validacion.mensaje);
        setLoading(false);
        return;
      }
    }

    console.log('[ENVIO] Todas las validaciones pasaron');

    try {
      // Preparar datos para enviar - más robusto
      const empleadoData = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        usuario: formData.usuario.trim(),
        correo: formData.correo.trim(),
        codigo_perfil: formData.codigo_perfil, // Enviar como está, el backend lo convierte
        telefono: formData.telefono?.trim() || '',
        salario: formData.salario || 0
      };

      // Solo incluir contraseña si no está vacía
      if (formData.contrasena && formData.contrasena.trim() !== '') {
        empleadoData.contrasena = formData.contrasena.trim();
        console.log('[ENVIO] Incluyendo nueva contraseña');
      } else {
        console.log('[INFO] No se modifica la contraseña');
      }

      // Asegurar que los tipos de datos sean correctos
      if (empleadoData.salario && typeof empleadoData.salario === 'string') {
        empleadoData.salario = parseFloat(empleadoData.salario) || 0;
      }

      console.log('[ENVIO] Datos finales a enviar:', empleadoData);
      console.log('[ENVIO] URL:', `http://127.0.0.1:8000/api/empleados/${id}/actualizar/`);

      const response = await fetch(`http://127.0.0.1:8000/api/empleados/${id}/actualizar/`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(empleadoData)
      });

      console.log('[RESPUESTA] Status de respuesta:', response.status);

      let responseData;
      try {
        responseData = await response.json();
        console.log('[RESPUESTA] Respuesta del servidor:', responseData);
      } catch (jsonError) {
        console.error('[ERROR] Error al parsear JSON de respuesta:', jsonError);
        throw new Error('Error en la respuesta del servidor');
      }

      if (!response.ok) {
        // Mejor manejo de errores del backend
        const errorMessage = responseData.error || 
                            responseData.message || 
                            responseData.details || 
                            `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      console.log('[EXITO] Empleado actualizado exitosamente');
      console.log('========================================\n');
      
      alert('[EXITO] Empleado actualizado correctamente');
      navigate('/usuarios');
      
    } catch (err) {
      console.error('[ERROR] Error al actualizar:', err);
      console.error('[ERROR] Detalles del error:', err.message);
      
      // Mostrar mensaje de error más específico
      let mensajeError = err.message || 'Error desconocido al actualizar el empleado';
      
      // Si es un error de red
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        mensajeError = 'Error de conexión. Verifique que el servidor esté funcionando.';
      }
      
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  if (cargando) {
    return (
      <div className="formulario-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando datos del empleado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="formulario-page">
      <div className="formulario-container">
        <div className="formulario-header">
          <button 
            className="btn-volver"
            onClick={() => navigate('/usuarios')}
            type="button"
          >
            <FaArrowLeft /> Volver
          </button>
          <div className="header-text">
            <h1>Editar Empleado</h1>
            <p>Actualiza la información del usuario</p>
          </div>
        </div>

        <form className="formulario-content" onSubmit={handleSubmit}>
          {error && (
            <div className="alert-error">
              <span className="alert-icon">[ADVERTENCIA]</span>
              <span>{error}</span>
              <button 
                type="button"
                className="alert-close"
                onClick={() => setError('')}
              >
                ×
              </button>
            </div>
          )}

          <div className="formulario-grid">
            <div className="formulario-seccion">
              <h3 className="seccion-titulo">Información Personal</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="Ingrese el nombre"
                  />
                </div>

                <div className="form-group">
                  <label>Apellido *</label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="Ingrese el apellido"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Ej: 98765432"
                  />
                </div>

                <div className="form-group">
                  <label>Correo Electrónico *</label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="ejemplo@correo.com"
                  />
                </div>
              </div>
            </div>

            <div className="formulario-seccion">
              <h3 className="seccion-titulo">Información de Acceso</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Usuario *</label>
                  <input
                    type="text"
                    name="usuario"
                    value={formData.usuario}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="Nombre de usuario"
                  />
                </div>

                <div className="form-group">
                  <label>Nueva Contraseña</label>
                  <input
                    type="password"
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleChange}
                    placeholder="Dejar vacío para mantener la actual"
                    disabled={loading}
                  />
                  <small className="input-help">
                    Solo complete si desea cambiar la contraseña
                  </small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Perfil *</label>
                  <select
                    name="codigo_perfil"
                    value={formData.codigo_perfil}
                    onChange={handleChange}
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
                    value={formData.salario}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    disabled={loading}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="formulario-acciones">
            <button
              type="button"
              className="btn-pill btn-pill-secondary"
              onClick={() => navigate('/usuarios')}
              disabled={loading}
            >
              <FaTimes /> Cancelar
            </button>
            <button
              type="submit"
              className="btn-pill btn-pill-success"
              disabled={loading}
            >
              <FaSave /> {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioEditarEmpleado;