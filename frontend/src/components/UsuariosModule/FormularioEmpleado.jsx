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
    codigo_perfil: '1' // Valor por defecto para Vendedor
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.nombre || !formData.apellido || !formData.usuario || !formData.contrasena || !formData.correo) {
        throw new Error('Por favor complete todos los campos obligatorios');
      }

      const empleadoData = {
        ...formData,
        salario: parseFloat(formData.salario) || 0,
        codigo_perfil: parseInt(formData.codigo_perfil) // Asegurar que sea número
      };

      console.log('Enviando datos:', empleadoData);

      const response = await fetch('http://127.0.0.1:8000/api/empleados/crear/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(empleadoData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const result = await response.json();
      console.log('>>> Empleado agregado:', result);

      onEmpleadoAgregado();
      onClose();

    } catch (err) {
      console.error('>>> Error al agregar empleado:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Estilos inline
  const styles = {
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      width: '100%',
      maxWidth: '700px',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '25px 30px',
      borderBottom: '1px solid #e9ecef',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      borderRadius: '12px 12px 0 0'
    },
    btnCerrar: {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '24px',
      cursor: 'pointer',
      padding: 0,
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      transition: 'background-color 0.3s ease'
    },
    errorMessage: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '15px',
      borderRadius: '8px',
      margin: '0 30px 25px 30px',
      border: '1px solid #f5c6cb',
      fontWeight: '500'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '20px',
      marginBottom: '30px',
      padding: '0 30px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    formLabel: {
      marginBottom: '8px',
      fontWeight: '600',
      color: '#2c3e50',
      fontSize: '14px'
    },
    formInput: {
      padding: '12px 15px',
      border: '2px solid #e9ecef',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: '#f8f9fa',
      outline: 'none',
      transition: 'all 0.3s ease'
    },
    formInputFocus: {
      borderColor: '#667eea',
      backgroundColor: 'white',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
    },
    formInputDisabled: {
      backgroundColor: '#e9ecef',
      cursor: 'not-allowed',
      opacity: 0.7
    },
    formActions: {
      display: 'flex',
      gap: '15px',
      justifyContent: 'flex-end',
      padding: '20px 30px',
      borderTop: '1px solid #e9ecef'
    },
    btnCancelar: {
      padding: '12px 25px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      backgroundColor: '#6c757d',
      color: 'white',
      minWidth: '120px',
      transition: 'all 0.3s ease'
    },
    btnGuardar: {
      padding: '12px 25px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      minWidth: '120px',
      transition: 'all 0.3s ease'
    },
    btnDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
      transform: 'none'
    }
  };

  const getInputStyle = (isDisabled = false) => {
    const baseStyle = { ...styles.formInput };
    if (isDisabled) {
      return { ...baseStyle, ...styles.formInputDisabled };
    }
    return baseStyle;
  };

  const getButtonStyle = (isDisabled = false, isCancel = false) => {
    const baseStyle = isCancel ? styles.btnCancelar : styles.btnGuardar;
    if (isDisabled) {
      return { ...baseStyle, ...styles.btnDisabled };
    }
    return baseStyle;
  };

  const handleInputFocus = (e, isDisabled) => {
    if (!isDisabled) {
      e.target.style.borderColor = '#667eea';
      e.target.style.backgroundColor = 'white';
      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
    }
  };

  const handleInputBlur = (e, isDisabled) => {
    if (!isDisabled) {
      e.target.style.borderColor = '#e9ecef';
      e.target.style.backgroundColor = '#f8f9fa';
      e.target.style.boxShadow = 'none';
    }
  };

  const handleButtonHover = (e, isDisabled) => {
    if (!isDisabled) {
      e.target.style.transform = 'translateY(-2px)';
    }
  };

  const handleButtonLeave = (e) => {
    e.target.style.transform = 'none';
  };

  const handleCloseHover = (e) => {
    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
  };

  const handleCloseLeave = (e) => {
    e.target.style.backgroundColor = 'transparent';
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h2 style={{ margin: 0, fontSize: '1.5em', fontWeight: '600' }}>Agregar Nuevo Empleado</h2>
          <button 
            style={styles.btnCerrar} 
            onClick={onClose}
            onMouseOver={handleCloseHover}
            onMouseOut={handleCloseLeave}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={styles.errorMessage}>
              {error}
            </div>
          )}

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel} htmlFor="nombre">Nombre *</label>
              <input
                style={getInputStyle(loading)}
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Ingrese el nombre"
                disabled={loading}
                onFocus={(e) => handleInputFocus(e, loading)}
                onBlur={(e) => handleInputBlur(e, loading)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel} htmlFor="apellido">Apellido *</label>
              <input
                style={getInputStyle(loading)}
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
                placeholder="Ingrese el apellido"
                disabled={loading}
                onFocus={(e) => handleInputFocus(e, loading)}
                onBlur={(e) => handleInputBlur(e, loading)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel} htmlFor="usuario">Usuario *</label>
              <input
                style={getInputStyle(loading)}
                type="text"
                id="usuario"
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                required
                placeholder="Ingrese el nombre de usuario"
                disabled={loading}
                onFocus={(e) => handleInputFocus(e, loading)}
                onBlur={(e) => handleInputBlur(e, loading)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel} htmlFor="contrasena">Contraseña *</label>
              <input
                style={getInputStyle(loading)}
                type="password"
                id="contrasena"
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                required
                placeholder="Ingrese la contraseña"
                disabled={loading}
                onFocus={(e) => handleInputFocus(e, loading)}
                onBlur={(e) => handleInputBlur(e, loading)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel} htmlFor="telefono">Teléfono</label>
              <input
                style={getInputStyle(loading)}
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ingrese el teléfono"
                disabled={loading}
                onFocus={(e) => handleInputFocus(e, loading)}
                onBlur={(e) => handleInputBlur(e, loading)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel} htmlFor="correo">Correo Electrónico *</label>
              <input
                style={getInputStyle(loading)}
                type="email"
                id="correo"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                required
                placeholder="ejemplo@correo.com"
                disabled={loading}
                onFocus={(e) => handleInputFocus(e, loading)}
                onBlur={(e) => handleInputBlur(e, loading)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel} htmlFor="salario">Salario</label>
              <input
                style={getInputStyle(loading)}
                type="number"
                id="salario"
                name="salario"
                value={formData.salario}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                disabled={loading}
                onFocus={(e) => handleInputFocus(e, loading)}
                onBlur={(e) => handleInputBlur(e, loading)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel} htmlFor="codigo_perfil">Perfil *</label>
              <select
                style={getInputStyle(loading)}
                id="codigo_perfil"
                name="codigo_perfil"
                value={formData.codigo_perfil}
                onChange={handleChange}
                required
                disabled={loading}
                onFocus={(e) => handleInputFocus(e, loading)}
                onBlur={(e) => handleInputBlur(e, loading)}
              >
                <option value="1">Administrador</option>
                <option value="2">Contador</option>
                <option value="3">Vendedor</option>
                <option value="4">Joyero</option>
              </select>
            </div>
          </div>

          <div style={styles.formActions}>
            <button 
              type="button" 
              style={getButtonStyle(loading, true)}
              onClick={onClose}
              disabled={loading}
              onMouseOver={(e) => handleButtonHover(e, loading)}
              onMouseOut={handleButtonLeave}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              style={getButtonStyle(loading, false)}
              disabled={loading}
              onMouseOver={(e) => handleButtonHover(e, loading)}
              onMouseOut={handleButtonLeave}
            >
              {loading ? 'Guardando...' : 'Guardar Empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioEmpleado;