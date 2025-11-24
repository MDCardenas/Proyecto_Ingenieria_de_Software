import React, { useState, useEffect } from 'react';

const FormularioEditarEmpleado = ({ empleado, onClose, onEmpleadoActualizado }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    usuario: '',
    telefono: '',
    correo: '',
    salario: '',
    codigo_perfil: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [perfiles, setPerfiles] = useState([]);

  // Cargar datos del empleado y perfiles
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const perfilesRes = await fetch('http://20.64.150.5:8000/api/perfiles/');
        const perfilesData = await perfilesRes.json();
        setPerfiles(perfilesData);

        const empleadoRes = await fetch(`http://20.64.150.5:8000/api/empleados/${empleado.id_empleado}/`);
        const datos = await empleadoRes.json();

        const perfilEncontrado = perfilesData.find(p => p.perfil === datos.perfil);

        setFormData({
          nombre: datos.nombre || '',
          apellido: datos.apellido || '',
          usuario: datos.usuario || '',
          telefono: datos.telefono || '',
          correo: datos.correo || '',
          salario: datos.salario || '',
          codigo_perfil: perfilEncontrado ? perfilEncontrado.codigo_perfil.toString() : ''
        });
      } catch (err) {
        setError('Error al cargar los datos del empleado');
      } finally {
        setCargandoDatos(false);
      }
    };
    cargarDatos();
  }, [empleado.id_empleado]);

  // Cambios de input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Enviar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const empleadoData = {
        ...formData,
        salario: parseFloat(formData.salario) || 0,
        codigo_perfil: parseInt(formData.codigo_perfil),
        telefono: formData.telefono || null  // Asegurar que teléfono sea null si está vacío
      };

      const response = await fetch(`http://20.64.150.5:8000/api/empleados/${empleado.id_empleado}/actualizar/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empleadoData)
      });

      if (!response.ok) throw new Error('Error al actualizar empleado');
      onEmpleadoActualizado();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cargandoDatos) {
    return (
      <div className="formulario-content">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando datos del empleado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="formulario-content">
      <div className="formulario-header">
        <button className="btn-volver" onClick={onClose}>
          ← Volver a la lista
        </button>
        <div className="header-text">
          <h1>Editando Empleado: {empleado.nombre_completo}</h1>
          <p>Modifique la información del empleado</p>
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
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="formulario-seccion">
            <h3 className="seccion-titulo">Información Laboral</h3>
            
            <div className="form-row">
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
                  <option value="">Seleccione un perfil</option>
                  {perfiles.map((perfil) => (
                    <option key={perfil.codigo_perfil} value={perfil.codigo_perfil}>
                      {perfil.perfil}
                    </option>
                  ))}
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
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioEditarEmpleado;