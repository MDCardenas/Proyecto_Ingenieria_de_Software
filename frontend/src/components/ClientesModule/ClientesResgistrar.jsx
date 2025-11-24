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
  return (
    <div className="pantalla-accion">
      <h2 className="form-title">{editId ? "Editar Cliente" : "Registrar Cliente"}</h2>

      <form className="form-cliente" onSubmit={onSubmit}>
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
                onChange={onFieldChange} 
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
                onChange={onFieldChange} 
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
              onChange={onFieldChange} 
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
              onChange={onFieldChange} 
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
              onChange={onFieldChange} 
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