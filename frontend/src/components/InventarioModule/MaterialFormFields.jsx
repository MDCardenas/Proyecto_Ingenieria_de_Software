// src/components/InventarioModule/forms/MaterialFormFields.jsx
import React from 'react';

const MaterialFormFields = ({ formData, onChange, errors, proveedores }) => {
  return (
    <>
      {/* Sección de proveedor */}
      <div className="form-section">
        <h3 className="section-title">Proveedor</h3>
        
        <div className="form-group">
          <label className="form-label">
            Proveedor <span className="required">*</span>
          </label>
          <select
            name="codigo_provedor"
            value={formData.codigo_provedor || ''}
            onChange={onChange}
            className={`form-select ${errors.codigo_provedor ? 'error' : ''}`}
          >
            <option value="">Seleccione un proveedor</option>
            {proveedores.map(p => (
              <option key={p.codigo_provedor} value={p.codigo_provedor}>
                {p.nombre}
              </option>
            ))}
          </select>
          {errors.codigo_provedor && (
            <span className="error-message">{errors.codigo_provedor}</span>
          )}
        </div>
      </div>

      {/* Sección de características */}
      <div className="form-section">
        <h3 className="section-title">Características del Material</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tipo de Material</label>
            <input
              type="text"
              name="tipo_material"
              value={formData.tipo_material || ''}
              onChange={onChange}
              className="form-input"
              placeholder="Ej: Metal, Piedra preciosa"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tipo de Piedra</label>
            <input
              type="text"
              name="tipo_piedra"
              value={formData.tipo_piedra || ''}
              onChange={onChange}
              className="form-input"
              placeholder="Ej: Diamante, Esmeralda"
            />
          </div>
        </div>

        <div className="form-row form-row-3">
          <div className="form-group">
            <label className="form-label">Peso (g)</label>
            <input
              type="number"
              step="0.01"
              name="peso"
              value={formData.peso || ''}
              onChange={onChange}
              className="form-input"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Quilates</label>
            <input
              type="number"
              step="0.01"
              name="quilates"
              value={formData.quilates || ''}
              onChange={onChange}
              className="form-input"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Pureza</label>
            <input
              type="text"
              name="pureza"
              value={formData.pureza || ''}
              onChange={onChange}
              className="form-input"
              placeholder="Ej: 18K, 24K"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Color</label>
            <input
              type="text"
              name="color"
              value={formData.color || ''}
              onChange={onChange}
              className="form-input"
              placeholder="Ej: Amarillo, Blanco"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Dimensiones</label>
            <input
              type="text"
              name="dimensiones"
              value={formData.dimensiones || ''}
              onChange={onChange}
              className="form-input"
              placeholder="Ej: 10x5mm"
            />
          </div>
        </div>
      </div>

      {/* Sección de inventario */}
      <div className="form-section">
        <h3 className="section-title">Inventario y Costo</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Cantidad en Stock <span className="required">*</span>
            </label>
            <input
              type="number"
              name="cantidad_existencia"
              value={formData.cantidad_existencia || ''}
              onChange={onChange}
              className={`form-input ${errors.cantidad_existencia ? 'error' : ''}`}
              placeholder="0"
            />
            {errors.cantidad_existencia && (
              <span className="error-message">{errors.cantidad_existencia}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Costo <span className="required">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="costo"
              value={formData.costo || ''}
              onChange={onChange}
              className={`form-input ${errors.costo ? 'error' : ''}`}
              placeholder="0.00"
            />
            {errors.costo && (
              <span className="error-message">{errors.costo}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MaterialFormFields;