import React, { useState, useEffect } from 'react';

const FormularioEmpleado = ({ onClose, onEmpleadoAgregado }) => {
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [perfiles, setPerfiles] = useState([]);
  const [cargandoPerfiles, setCargandoPerfiles] = useState(true);

  // Cargar perfiles disponibles
  useEffect(() => {
    const cargarPerfiles = async () => {
      try {
        const response = await fetch('http://20.64.150.5:8000/api/perfiles/');
        if (response.ok) {
          const data = await response.json();
          setPerfiles(data);
          // Establecer el primer perfil como valor por defecto
          if (data.length > 0) {
            setFormData(prev => ({
              ...prev,
              codigo_perfil: data[0].codigo_perfil.toString()
            }));
          }
        }
      } catch (err) {
        console.error('Error cargando perfiles:', err);
        setError('Error al cargar los perfiles disponibles');
      } finally {
        setCargandoPerfiles(false);
      }
    };

    cargarPerfiles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones básicas
    if (!formData.nombre || !formData.apellido || !formData.usuario || !formData.contrasena || !formData.correo) {
      setError('Todos los campos marcados con * son obligatorios');
      setLoading(false);
      return;
    }

    try {
      const empleadoData = {
        ...formData,
        salario: formData.salario ? parseFloat(formData.salario) : 0,
        codigo_perfil: parseInt(formData.codigo_perfil),
        telefono: formData.telefono || null
      };

      console.log('🚀 Enviando empleado:', empleadoData);

      const response = await fetch('http://20.64.150.5:8000/api/empleados/nuevo/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(empleadoData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details || `Error ${response.status}`);
      }

      console.log('✅ Empleado guardado:', result);
      
      if (result.success) {
        onEmpleadoAgregado();
        onClose();
      } else {
        setError(result.error || 'Error desconocido al crear empleado');
      }
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
                  disabled={loading}
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
                  placeholder="Opcional"
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Perfil *</label>
                <select
                  name="codigo_perfil"
                  value={formData.codigo_perfil}
                  onChange={handleChange}
                  required
                  disabled={loading || cargandoPerfiles}
                >
                  <option value="">Seleccione un perfil</option>
                  {perfiles.map((perfil) => (
                    <option key={perfil.codigo_perfil} value={perfil.codigo_perfil}>
                      {perfil.perfil}
                    </option>
                  ))}
                </select>
                {cargandoPerfiles && <small>Cargando perfiles...</small>}
              </div>
            </div>
          </div>
        </div>

        <div className="formulario-acciones">
          <button 
            type="button" 
            className="btn-pill secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-pill primary" 
            disabled={loading || cargandoPerfiles}
          >
            {loading ? 'Guardando...' : 'Guardar Empleado'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioEmpleado;