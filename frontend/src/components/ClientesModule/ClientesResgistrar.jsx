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
  
  // Función para validar campos en tiempo real
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    
    // Aplicar validaciones según el campo
    let newValue = value;
    
    switch(name) {
      case 'telefono':
        // Solo números y guiones, máximo 9 caracteres (8 dígitos + guión)
        newValue = value.replace(/[^\d-]/g, '');
        // Formato automático xxxx-xxxx
        if (newValue.length > 4 && !newValue.includes('-')) {
          newValue = newValue.slice(0, 4) + '-' + newValue.slice(4);
        }
        // Limitar a 9 caracteres (8 dígitos + guión)
        if (newValue.length > 9) {
          newValue = newValue.slice(0, 9);
        }
        break;
        
      case 'nombre':
      case 'apellido':
        // Solo letras, espacios y caracteres especiales comunes en nombres
        newValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        break;
        
      case 'correo':
        // Permitir solo caracteres válidos para email
        newValue = value.replace(/[^\w@.-]/g, '');
        break;
        
      case 'direccion':
        // Permitir letras, números, espacios y caracteres comunes en direcciones
        newValue = value.replace(/[^\wáéíóúÁÉÍÓÚñÑ\s.,#-]/g, '');
        break;
        
      default:
        break;
    }
    
    // Crear un nuevo evento con el valor validado
    const validatedEvent = {
      ...e,
      target: {
        ...e.target,
        value: newValue
      }
    };
    
    onFieldChange(validatedEvent);
  };

  // Función para validar el formulario antes de enviar
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones adicionales antes de enviar
    const errors = {};
    
    // Validar email
    if (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      errors.correo = "Formato de email inválido";
    }
    
    // Validar teléfono (8 dígitos con formato xxxx-xxxx)
    if (form.telefono && !/^\d{4}-\d{4}$/.test(form.telefono)) {
      errors.telefono = "Formato de teléfono inválido (xxxx-xxxx)";
    }
    
    // Validar nombre y apellido (solo letras y espacios)
    if (form.nombre && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.nombre)) {
      errors.nombre = "El nombre solo puede contener letras y espacios";
    }
    
    if (form.apellido && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.apellido)) {
      errors.apellido = "El apellido solo puede contener letras y espacios";
    }
    
    // Validar dirección (mínimo 5 caracteres, no solo letras repetidas)
    if (form.direccion) {
      if (form.direccion.length < 5) {
        errors.direccion = "La dirección debe tener al menos 5 caracteres";
      } else if (/^(.)\1+$/.test(form.direccion.replace(/\s/g, ''))) {
        errors.direccion = "La dirección no es válida";
      }
    }
    
    // Si hay errores, mostrarlos y no enviar el formulario
    if (Object.keys(errors).length > 0) {
      alert("Por favor, corrige los siguientes errores:\n" + 
            Object.values(errors).join('\n'));
      return;
    }
    
    // Si no hay errores, proceder con el envío
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
                onChange={onFieldChange} 
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
                onChange={onFieldChange} 
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