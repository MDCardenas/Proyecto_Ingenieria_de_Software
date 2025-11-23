import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import api from '../../services/api';

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
    codigo_perfil: ''
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [perfilesRes, empleadoRes] = await Promise.all([
          api.get('/perfiles/'),
          api.get(`/empleados/${id}/`)
        ]);

        const perfilesData = perfilesRes.data;
        const empleadoData = empleadoRes.data;

        setPerfiles(perfilesData);

        const perfilEncontrado = perfilesData.find(p => p.perfil === empleadoData.perfil);

        setFormData({
          nombre: empleadoData.nombre || '',
          apellido: empleadoData.apellido || '',
          usuario: empleadoData.usuario || '',
          telefono: empleadoData.telefono || '',
          correo: empleadoData.correo || '',
          salario: empleadoData.salario || '',
          codigo_perfil: perfilEncontrado ? perfilEncontrado.codigo_perfil.toString() : ''
        });
      } catch (err) {
        setError('Error al cargar los datos del empleado');
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const empleadoData = {
        ...formData,
        salario: parseFloat(formData.salario) || 0,
        codigo_perfil: parseInt(formData.codigo_perfil)
      };

      await api.put(`/empleados/${id}/actualizar/`, empleadoData);
      navigate('/usuarios');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al actualizar empleado');
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
        {/* Header */}
        <div className="formulario-header">
          <button 
            className="btn-volver"
            onClick={() => navigate('/usuarios')}
          >
            <FaArrowLeft /> Volver
          </button>
          <div className="header-text">
            <h1>Editar Empleado</h1>
            <p>Actualiza la información del usuario</p>
          </div>
        </div>

        {/* Formulario */}
        <form className="formulario-content" onSubmit={handleSubmit}>
          {error && (
            <div className="alert-error">
              <span className="alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

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
                    value={formData.nombre}
                    onChange={handleChange}
                    required
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
                    value={formData.usuario}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Perfil *</label>
                  <select
                    name="codigo_perfil"
                    value={formData.codigo_perfil}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un perfil</option>
                    {perfiles.map((perfil) => (
                      <option key={perfil.codigo_perfil} value={perfil.codigo_perfil}>
                        {perfil.perfil}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Salario</label>
                  <input
                    type="number"
                    name="salario"
                    value={formData.salario}
                    onChange={handleChange}
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="formulario-acciones">
            <button
              type="button"
              className="btn-pill btn-pill-secondary"
              onClick={() => navigate('/usuarios')}
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