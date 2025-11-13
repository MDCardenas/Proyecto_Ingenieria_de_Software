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
        const perfilesRes = await fetch('http://127.0.0.1:8000/api/perfiles/');
        const perfilesData = await perfilesRes.json();
        setPerfiles(perfilesData);

        const empleadoRes = await fetch(`http://127.0.0.1:8000/api/empleados/${empleado.id_empleado}/`);
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
        codigo_perfil: parseInt(formData.codigo_perfil)
      };

      const response = await fetch(`http://127.0.0.1:8000/api/empleados/${empleado.id_empleado}/actualizar/`, {
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

  // 🎨 Estilos uniformes y alineados
  const styles = {
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: '10px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
      width: '100%',
      maxWidth: '900px',
      overflow: 'hidden',
      animation: 'fadeIn 0.25s ease',
    },
    modalHeader: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: '#fff',
      padding: '25px 35px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontWeight: '700',
      fontSize: '1.7em',
      borderRadius: '10px 10px 0 0',
    },
    btnCerrar: {
      background: 'none',
      border: 'none',
      color: '#fff',
      fontSize: '24px',
      cursor: 'pointer',
    },
    errorMessage: {
      backgroundColor: '#fde2e1',
      color: '#b71c1c',
      padding: '15px 20px',
      borderRadius: '10px',
      margin: '20px 35px',
      border: '1px solid #f5c6cb',
      fontWeight: '500',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      columnGap: '30px',
      rowGap: '22px',
      padding: '30px 40px',
      alignItems: 'center',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
    },
    formLabel: {
      fontWeight: '600',
      color: '#34495e',
      marginBottom: '8px',
      fontSize: '15px',
    },
    formInput: {
      width: '100%',
      padding: '12px 15px',
      borderRadius: '8px',
      border: '1.8px solid #e5e7eb',
      backgroundColor: '#f9fafb',
      fontSize: '15px',
      color: '#2c3e50',
      outline: 'none',
      transition: 'all 0.3s ease',
    },
    formActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '15px',
      padding: '25px 40px',
      borderTop: '1px solid #e9ecef',
      backgroundColor: '#fafafa',
    },
    btnCancelar: {
      backgroundColor: '#6c757d',
      color: '#fff',
      border: 'none',
      padding: '12px 30px',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '15px',
      cursor: 'pointer',
    },
    btnGuardar: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: '#fff',
      border: 'none',
      padding: '12px 30px',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '15px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
  };

  const styleSheet = document.styleSheets[0];
  styleSheet.insertRule(`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `, styleSheet.cssRules.length);

  if (cargandoDatos) {
    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <div style={styles.modalHeader}>
            <h2 style={{ margin: 0 }}>Editando Empleado</h2>
            <button style={styles.btnCerrar} onClick={onClose}>×</button>
          </div>
          <div style={{ padding: '25px', textAlign: 'center' }}>Cargando datos del empleado...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h2 style={{ margin: 0 }}>Editando Empleado: {empleado.nombre_completo}</h2>
          <button style={styles.btnCerrar} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div style={styles.errorMessage}>{error}</div>}

          <div style={styles.formGrid}>
            {[ 
              ['Nombre *', 'nombre', 'text', formData.nombre],
              ['Apellido *', 'apellido', 'text', formData.apellido],
              ['Usuario *', 'usuario', 'text', formData.usuario],
              ['Teléfono', 'telefono', 'tel', formData.telefono],
              ['Correo Electrónico *', 'correo', 'email', formData.correo],
              ['Salario', 'salario', 'number', formData.salario]
            ].map(([label, name, type, value]) => (
              <div style={styles.formGroup} key={name}>
                <label style={styles.formLabel}>{label}</label>
                <input
                  style={styles.formInput}
                  type={type}
                  name={name}
                  value={value}
                  onChange={handleChange}
                  required={label.includes('*')}
                />
              </div>
            ))}

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Perfil *</label>
              <select
                style={styles.formInput}
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

          <div style={styles.formActions}>
            <button type="button" style={styles.btnCancelar} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" style={styles.btnGuardar} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioEditarEmpleado;
