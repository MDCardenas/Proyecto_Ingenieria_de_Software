import React, { useState } from 'react';

const FormularioEmpleado = ({ onClose, onEmpleadoAgregado }) => {
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      console.log('🚀 Enviando empleado:', empleadoData);

      const response = await fetch('http://127.0.0.1:8000/api/empleados/nuevo/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empleadoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Empleado guardado:', result);
      onEmpleadoAgregado();
      onClose();
    } catch (err) {
      console.error('❌ Error al crear empleado:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formulario-content">
      <div className="formulario-header">
        <button className="btn-volver" onClick={onClose}>
          ← Volver a la lista
        </button>
        <div className="header-text">
          <h1>Agregar Nuevo Empleado</h1>
          <p>Complete la información del nuevo empleado</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="alert-error">
            <span className="alert-icon">⚠️</span>
            {error}
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

          <div className="formulario-seccion">
            <h3 className="seccion-titulo">Información de Cuenta</h3>
            
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
                <label>Contraseña *</label>
                <input
                  type="password"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  required
                />
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
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Perfil *</label>
                <select
                  name="codigo_perfil"
                  value={formData.codigo_perfil}
                  onChange={handleChange}
                >
                  <option value="1">Administrador</option>
                  <option value="2">Vendedor</option>
                  <option value="3">Gerente</option>
                  <option value="4">Cajero</option>
                  <option value="5">Contador</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="formulario-acciones">
          <button type="button" className="btn-pill secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-pill primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Empleado'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioEmpleado;