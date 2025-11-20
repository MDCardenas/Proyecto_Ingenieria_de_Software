// src/components/InventarioModule/forms/JoyaFormField.jsx
import React from 'react';

const JoyaFormFields = ({ formData, onChange, errors }) => {
  return (
    <>
      {/* Sección de características */}
      <div className="form-section">
        <h3 className="section-title">Características</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tipo</label>
            <input
              type="text"
              name="tipo"
              value={formData.tipo || ''}
              onChange={onChange}
              className="form-input"
              placeholder="Ej: Anillo, Collar, Pulsera"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Material</label>
            <input
              type="text"
              name="material"
              value={formData.material || ''}
              onChange={onChange}
              className="form-input"
              placeholder="Ej: Oro, Plata, Platino"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Peso (gramos)</label>
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
            <label className="form-label">
              Precio de Venta <span className="required">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="precio_venta"
              value={formData.precio_venta || ''}
              onChange={onChange}
              className={`form-input ${errors.precio_venta ? 'error' : ''}`}
              placeholder="0.00"
            />
            {errors.precio_venta && (
              <span className="error-message">{errors.precio_venta}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default JoyaFormFields;