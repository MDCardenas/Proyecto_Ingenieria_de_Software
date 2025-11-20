// src/components/InventarioModule/forms/InsumoFormFields.jsx
import React from 'react';

const InsumoFormFields = ({ formData, onChange, errors, proveedores }) => {
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

      {/* Sección de clasificación */}
      <div className="form-section">
        <h3 className="section-title">Clasificación</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tipo de Insumo</label>
            <input
              type="text"
              name="tipo_insumo"
              value={formData.tipo_insumo || ''}
              onChange={onChange}
              className="form-input"
              placeholder="Ej: Herramienta, Químico"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Categoría</label>
            <input
              type="text"
              name="categoria"
              value={formData.categoria || ''}
              onChange={onChange}
              className="form-input"
              placeholder="Ej: Consumible, Permanente"
            />
          </div>
        </div>
      </div>

      {/* Sección de inventario */}
      <div className="form-section">
        <h3 className="section-title">Inventario y Costo</h3>
        
        <div className="form-row form-row-3">
          <div className="form-group">
            <label className="form-label">
              Cantidad <span className="required">*</span>
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
            <label className="form-label">Unidad de Medida</label>
            <input
              type="text"
              name="unidad_medida"
              value={formData.unidad_medida || ''}
              onChange={onChange}
              className="form-input"
              placeholder="Ej: unidades, kg, litros"
            />
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

      {/* Sección de vencimiento */}
      <div className="form-section">
        <h3 className="section-title">Control de Vencimiento</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Fecha de Vencimiento</label>
            <input
              type="date"
              name="fecha_vencimiento"
              value={formData.fecha_vencimiento || ''}
              onChange={onChange}
              className="form-input"
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="requiere_control_vencimiento"
                checked={formData.requiere_control_vencimiento || false}
                onChange={onChange}
                className="form-checkbox"
              />
              <span className="checkbox-text">Requiere control de vencimiento</span>
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

export default InsumoFormFields;