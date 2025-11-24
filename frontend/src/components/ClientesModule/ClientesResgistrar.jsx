import { FaIdCard } from 'react-icons/fa';
import "../../styles/scss/pages/_clientes.scss";

const ClientesRegistrar = ({ 
  form, 
  editId, 
  loading, 
  onFieldChange, 
  onSubmit, 
  onCancel 
}) => {
  
  // Función para validar que solo contenga letras y espacios
  const validarSoloLetras = (valor) => {
    const regex = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]*$/;
    return regex.test(valor);
  };

  // Función para validar email
  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Manejador de cambios con validación
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    
    // Validación para nombre (solo letras y espacios)
    if (name === 'nombre') {
      if (validarSoloLetras(value) || value === '') {
        onFieldChange(e);
      }
      return;
    }
    
    // Validación para apellido (solo letras y espacios)
    if (name === 'apellido') {
      if (validarSoloLetras(value) || value === '') {
        onFieldChange(e);
      }
      return;
    }
    
    // Validación para dirección (no permitir solo números)
    if (name === 'direccion') {
      const soloNumeros = /^\d+$/;
      if (!soloNumeros.test(value) || value === '') {
        onFieldChange(e);
      }
      return;
    }
    
    // Para los demás campos, pasar el evento sin modificar
    onFieldChange(e);
  };

  // Validación del formulario antes de enviar
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar email si está presente
    if (form.correo && !validarEmail(form.correo)) {
      alert('Por favor ingrese un email válido');
      return;
    }
    
    // Validar que nombre solo contenga letras
    if (form.nombre && !validarSoloLetras(form.nombre)) {
      alert('El nombre solo debe contener letras');
      return;
    }
    
    // Validar que apellido solo contenga letras
    if (form.apellido && !validarSoloLetras(form.apellido)) {
      alert('El apellido solo debe contener letras');
      return;
    }
    
    // Validar que dirección no sea solo números
    if (form.direccion) {
      const soloNumeros = /^\d+$/;
      if (soloNumeros.test(form.direccion)) {
        alert('La dirección no puede contener solo números');
        return;
      }
    }
    
    // Si todas las validaciones pasan, llamar al onSubmit original
    onSubmit(e);
  };

  return (
    <div className="pantalla-accion">
      <h2 className="form-title">{editId ? "Editar Cliente" : "Registrar Cliente"}</h2>

      <form className="form-cliente" onSubmit={handleSubmit}>
        <div className="form-campos">
          {/* Campos de identificación */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="numero_identidad">
                Número de Identidad *
                <FaIdCard style={{ marginLeft: '8px', color: '#6b7280', fontSize: '0.9rem' }} />
              </label>
              <input 
                className="form-input"
                id="numero_identidad" 
                name="numero_identidad" 
                placeholder="xxxx-xxxx-xxxxx" 
                value={form.numero_identidad} 
                onChange={handleFieldChange} 
                required 
                disabled={loading || !!editId}
              />
              <small className="form-hint">Formato: xxxx-xxxx-xxxxx (13 dígitos)</small>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="rtn">RTN</label>
              <input 
                className="form-input"
                id="rtn" 
                name="rtn" 
                placeholder="xxxx-xxxx-xxxxx-x" 
                value={form.rtn} 
                onChange={handleFieldChange} 
                disabled={loading || !!editId}
              />
              <small className="form-hint">Formato: xxxx-xxxx-xxxxx-x (14 dígitos)</small>
            </div>
          </div>

          {/* Campos personales */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="nombre">Nombre *</label>
              <input 
                className="form-input"
                id="nombre" 
                name="nombre" 
                placeholder="Nombre" 
                value={form.nombre} 
                onChange={handleFieldChange} 
                required 
                disabled={loading} 
              />
              <small className="form-hint">Solo letras y espacios</small>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="apellido">Apellido *</label>
              <input 
                className="form-input"
                id="apellido" 
                name="apellido" 
                placeholder="Apellido" 
                value={form.apellido} 
                onChange={handleFieldChange} 
                required 
                disabled={loading} 
              />
              <small className="form-hint">Solo letras y espacios</small>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="correo">Email</label>
            <input 
              className="form-input"
              id="correo" 
              name="correo" 
              type="email" 
              placeholder="cliente@example.com" 
              value={form.correo} 
              onChange={handleFieldChange} 
              disabled={loading} 
            />
            <small className="form-hint">Formato válido de email requerido</small>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="telefono">Teléfono</label>
            <input 
              className="form-input"
              id="telefono" 
              name="telefono" 
              type="tel" 
              placeholder="3322-0000" 
              value={form.telefono} 
              onChange={handleFieldChange} 
              disabled={loading} 
            />
            <small className="form-hint">Formato: xxxx-xxxx (8 dígitos)</small>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="direccion">Dirección</label>
            <input 
              className="form-input"
              id="direccion" 
              name="direccion" 
              placeholder="Dirección completa" 
              value={form.direccion} 
              onChange={handleFieldChange} 
              disabled={loading} 
            />
            <small className="form-hint">Debe contener texto, no solo números</small>
          </div>
        </div>

        {/* Botones */}
        <div className="botones-container">
          <button 
            type="submit" 
            className="btn-submit" 
            disabled={loading}
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
      </form>
    </div>
  );
};

export default ClientesRegistrar;