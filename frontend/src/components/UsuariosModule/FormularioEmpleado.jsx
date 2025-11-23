import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import api from '../../services/api';

const FormularioNuevoEmpleado = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    usuario: '',
    contrasena: '',
    telefono: '',
    correo: '',
    salario: '',
    codigo_perfil: '1',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const empleadoData = {
        ...formData,
        salario: parseFloat(formData.salario) || 0,
        codigo_perfil: parseInt(formData.codigo_perfil),
      };

      await api.post('/empleados/nuevo/', empleadoData);
      navigate('/usuarios');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al guardar el empleado');
    } finally {
      setLoading(false);
    }
  };

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
            <h1>Nuevo Empleado</h1>
            <p>Completa la información del nuevo usuario</p>
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
                    placeholder="Ej: +504 9999-9999"
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
                    placeholder="ejemplo@correo.com"
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
                    placeholder="Nombre de usuario"
                  />
                </div>

                <div className="form-group">
                  <label>Contraseña *</label>
                  <input
                    type="password"
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleChange}
                    required
                    placeholder="Contraseña segura"
                  />
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
                  >
                    <option value="1">Administrador</option>
                    <option value="2">Vendedor</option>
                    <option value="3">Gerente</option>
                    <option value="4">Cajero</option>
                    <option value="5">Contador</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Salario</label>
                  <input
                    type="number"
                    name="salario"
                    value={formData.salario}
                    onChange={handleChange}
                    placeholder="0.00"
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
              <FaSave /> {loading ? 'Guardando...' : 'Guardar Empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioNuevoEmpleado;