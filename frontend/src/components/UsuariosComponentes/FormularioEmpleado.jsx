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

  // 🟣 === ESTILOS ===
  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease-in-out',
      padding: '20px',
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      width: '100%',
      maxWidth: '750px',
      overflow: 'hidden',
      animation: 'slideUp 0.4s ease-in-out',
    },
    header: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      padding: '20px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '1.3em',
      fontWeight: 'bold',
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '24px',
      cursor: 'pointer',
    },
    form: {
      padding: '25px 30px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      marginBottom: '25px',
    },
    group: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '8px',
      fontSize: '14px',
    },
    input: {
      padding: '12px 15px',
      border: '2px solid #e9ecef',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: '#f8f9fa',
      outline: 'none',
      transition: 'all 0.3s ease',
    },
    select: {
      padding: '12px',
      border: '2px solid #e9ecef',
      borderRadius: '8px',
      backgroundColor: '#f8f9fa',
      fontSize: '14px',
      outline: 'none',
    },
    errorMsg: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid #f5c6cb',
      marginBottom: '15px',
      fontWeight: '500',
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '15px',
      borderTop: '1px solid #e9ecef',
      padding: '20px 30px',
      backgroundColor: '#fdfdfd',
    },
    btnCancelar: {
      backgroundColor: '#6c757d',
      border: 'none',
      padding: '12px 25px',
      color: 'white',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s ease',
    },
    btnGuardar: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      border: 'none',
      padding: '12px 25px',
      color: 'white',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s ease',
    },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2>Agregar Nuevo Empleado</h2>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          {error && <div style={styles.errorMsg}>{error}</div>}

          <div style={styles.grid}>
            <div style={styles.group}>
              <label style={styles.label}>Nombre *</label>
              <input style={styles.input} name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Apellido *</label>
              <input style={styles.input} name="apellido" value={formData.apellido} onChange={handleChange} required />
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Usuario *</label>
              <input style={styles.input} name="usuario" value={formData.usuario} onChange={handleChange} required />
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Contraseña *</label>
              <input type="password" style={styles.input} name="contrasena" value={formData.contrasena} onChange={handleChange} required />
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Teléfono</label>
              <input style={styles.input} name="telefono" value={formData.telefono} onChange={handleChange} />
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Correo *</label>
              <input type="email" style={styles.input} name="correo" value={formData.correo} onChange={handleChange} required />
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Salario</label>
              <input type="number" style={styles.input} name="salario" value={formData.salario} onChange={handleChange} placeholder="0.00" />
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Perfil *</label>
              <select style={styles.select} name="codigo_perfil" value={formData.codigo_perfil} onChange={handleChange}>
                <option value="1">Administrador</option>
                <option value="2">Vendedor</option>
                <option value="3">Gerente</option>
                <option value="4">Cajero</option>
                <option value="5">Contador</option>
              </select>
            </div>
          </div>

          <div style={styles.actions}>
            <button type="button" style={styles.btnCancelar} onClick={onClose}>Cancelar</button>
            <button type="submit" style={styles.btnGuardar} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          input:focus, select:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
            background-color: #fff;
          }
          button:hover {
            transform: scale(1.05);
          }
        `}
      </style>
    </div>
  );
};

export default FormularioEmpleado;
