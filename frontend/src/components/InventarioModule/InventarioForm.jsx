// src/components/InventarioModule/forms/InventarioForm.jsx
import React, { useState } from 'react';
import { X, Save, ArrowLeft } from 'lucide-react';
import JoyaFormFields from './JoyaFormFields';
import MaterialFormFields from './MaterialFormFields';
import InsumoFormFields from './InsumoFormFields';

const InventarioForm = ({ mode, activeTab, formData: initialData, onSubmit, onCancel, proveedores }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validación de nombre (común para todos)
    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    // Validaciones específicas según el tab
    if (activeTab === 'joyas') {
      if (!formData.precio_venta || formData.precio_venta <= 0) {
        newErrors.precio_venta = 'El precio debe ser mayor a 0';
      }
    } else if (activeTab === 'materiales' || activeTab === 'insumos') {
      if (!formData.codigo_provedor) {
        newErrors.codigo_provedor = 'Debe seleccionar un proveedor';
      }
      if (!formData.cantidad_existencia || formData.cantidad_existencia < 0) {
        newErrors.cantidad_existencia = 'La cantidad debe ser mayor o igual a 0';
      }
      if (!formData.costo || formData.costo <= 0) {
        newErrors.costo = 'El costo debe ser mayor a 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getTitulo = () => {
    const tipo = activeTab === 'joyas' ? 'Joya' : activeTab === 'materiales' ? 'Material' : 'Insumo';
    return mode === 'create' ? `Agregar ${tipo}` : `Editar ${tipo}`;
  };

  return (
    <div className="inventario-form">
      <div className="form-header">
        <button onClick={onCancel} className="btn-back">
          <ArrowLeft className="btn-icon" />
        </button>
        <h2 className="form-title">{getTitulo()}</h2>
        <div className="form-header-spacer" />
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-sections">
          {/* Sección de información básica */}
          <div className="form-section">
            <h3 className="section-title">Información Básica</h3>
            
            <div className="form-group">
              <label className="form-label">
                Nombre <span className="required">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre || ''}
                onChange={handleChange}
                className={`form-input ${errors.nombre ? 'error' : ''}`}
                placeholder="Ingrese el nombre"
              />
              {errors.nombre && <span className="error-message">{errors.nombre}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion || ''}
                onChange={handleChange}
                rows="3"
                className="form-textarea"
                placeholder="Ingrese una descripción (opcional)"
              />
            </div>
          </div>

          {/* Campos específicos según el tipo */}
          {activeTab === 'joyas' && (
            <JoyaFormFields 
              formData={formData} 
              onChange={handleChange} 
              errors={errors}
            />
          )}
          
          {activeTab === 'materiales' && (
            <MaterialFormFields 
              formData={formData} 
              onChange={handleChange} 
              errors={errors}
              proveedores={proveedores}
            />
          )}
          
          {activeTab === 'insumos' && (
            <InsumoFormFields 
              formData={formData} 
              onChange={handleChange} 
              errors={errors}
              proveedores={proveedores}
            />
          )}
        </div>

        {/* Botones de acción */}
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            <X className="btn-icon" />
            Cancelar
          </button>
          <button type="submit" className="btn-submit">
            <Save className="btn-icon" />
            {mode === 'create' ? 'Crear' : 'Actualizar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventarioForm;