import React, { useState } from 'react';
import { X, Save, ArrowLeft, Upload, Image } from 'lucide-react';
import {
  validarNombreProducto,
  validarNumeroEntero,
  validarNumeroDecimal,
  REGEX_PATTERNS
} from '../../utils/validaciones';

const InventarioForm = ({ mode, type, initialData, onSubmit, onCancel, proveedores }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    // Campos comunes
    codigo_provedor: '',
    cantidad_existencia: '',
    costo: '',
    // Campos específicos
    tipo: '',
    material: '',
    peso: '',
    precio_venta: '',
    tipo_material: '',
    tipo_piedra: '',
    quilates: '',
    pureza: '',
    color: '',
    dimensiones: '',
    tipo_insumo: '',
    categoria: '',
    unidad_medida: '',
    fecha_vencimiento: '',
    requiere_control_vencimiento: false,
    // Imagen para joyas - ahora como URL
    imagen_url: '',
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Configuración de campos por tipo
  const fieldConfig = {
    joyas: {
      required: ['nombre', 'precio_venta', 'costo', 'cantidad_existencia'],
      sections: [
        {
          title: 'Características de la Joya',
          fields: [
            { name: 'tipo', label: 'Tipo', type: 'text', placeholder: 'Anillo, Collar, Pulsera' },
            { name: 'material', label: 'Material', type: 'text', placeholder: 'Oro, Plata, Platino' },
            { name: 'peso', label: 'Peso (gramos)', type: 'number', step: '0.01' },
            { name: 'costo', label: 'Costo', type: 'number', step: '0.01', required: true },
            { name: 'precio_venta', label: 'Precio de Venta', type: 'number', step: '0.01', required: true }
          ]
        },
        {
          title: 'Inventario',
          fields: [
            { name: 'cantidad_existencia', label: 'Cantidad en Stock', type: 'number', required: true }
          ]
        },
        {
          title: 'Imagen',
          fields: [
            { 
              name: 'imagen_url', 
              label: 'URL de la Imagen', 
              type: 'url', 
              placeholder: 'https://ejemplo.com/imagen.jpg' 
            }
          ]
        }
      ]
    },
    materiales: {
      required: ['nombre', 'codigo_provedor', 'cantidad_existencia', 'costo'],
      sections: [
        {
          title: 'Proveedor',
          fields: [
            { 
              name: 'codigo_provedor', 
              label: 'Proveedor', 
              type: 'select', 
              options: proveedores,
              required: true 
            }
          ]
        },
        {
          title: 'Características del Material',
          fields: [
            { name: 'tipo_material', label: 'Tipo de Material', type: 'text', placeholder: 'Metal, Piedra preciosa' },
            { name: 'tipo_piedra', label: 'Tipo de Piedra', type: 'text', placeholder: 'Diamante, Esmeralda' },
            { name: 'peso', label: 'Peso (g)', type: 'number', step: '0.01' },
            { name: 'quilates', label: 'Quilates', type: 'number', step: '0.01' },
            { name: 'pureza', label: 'Pureza', type: 'text', placeholder: '18K, 24K' },
            { name: 'color', label: 'Color', type: 'text', placeholder: 'Amarillo, Blanco' },
            { name: 'dimensiones', label: 'Dimensiones', type: 'text', placeholder: '10x5mm' }
          ]
        },
        {
          title: 'Inventario y Costo',
          fields: [
            { name: 'cantidad_existencia', label: 'Cantidad en Stock', type: 'number', required: true },
            { name: 'costo', label: 'Costo', type: 'number', step: '0.01', required: true }
          ]
        }
      ]
    },
    insumos: {
      required: ['nombre', 'codigo_provedor', 'cantidad_existencia', 'costo'],
      sections: [
        {
          title: 'Proveedor',
          fields: [
            { 
              name: 'codigo_provedor', 
              label: 'Proveedor', 
              type: 'select', 
              options: proveedores,
              required: true 
            }
          ]
        },
        {
          title: 'Clasificación',
          fields: [
            { name: 'tipo_insumo', label: 'Tipo de Insumo', type: 'text', placeholder: 'Herramienta, Químico' },
            { name: 'categoria', label: 'Categoría', type: 'text', placeholder: 'Consumible, Permanente' }
          ]
        },
        {
          title: 'Inventario y Costo',
          fields: [
            { name: 'cantidad_existencia', label: 'Cantidad', type: 'number', required: true },
            { name: 'unidad_medida', label: 'Unidad de Medida', type: 'text', placeholder: 'unidades, kg, litros' },
            { name: 'costo', label: 'Costo', type: 'number', step: '0.01', required: true }
          ]
        },
        {
          title: 'Control de Vencimiento',
          fields: [
            { name: 'fecha_vencimiento', label: 'Fecha de Vencimiento', type: 'date' },
            { 
              name: 'requiere_control_vencimiento', 
              label: 'Requiere control de vencimiento', 
              type: 'checkbox' 
            }
          ]
        }
      ]
    }
  };

  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      // Validaciones en tiempo real
      if (name === 'nombre' && value) {
        // Permitir letras, números, espacios y caracteres básicos
        if (!REGEX_PATTERNS.NOMBRE_PRODUCTO.test(value)) {
          return; // No permitir la entrada
        }
      }

      // Validación para campos numéricos enteros
      if (['cantidad_existencia'].includes(name) && value) {
        if (!/^\d*$/.test(value)) {
          return; // Solo números enteros
        }
      }

      // Validación para campos numéricos decimales
      if (['costo', 'precio_venta', 'peso', 'quilates'].includes(name) && value) {
        if (!/^\d*\.?\d{0,2}$/.test(value)) {
          return; // Solo números con máximo 2 decimales
        }
      }

      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const config = fieldConfig[type];

    // Validar campos requeridos
    config.required.forEach(field => {
      if (!formData[field] || formData[field] === '') {
        newErrors[field] = 'Este campo es requerido';
      }
    });

    // Validar nombre del producto
    if (formData.nombre) {
      const validNombre = validarNombreProducto(formData.nombre);
      if (!validNombre.valido) {
        newErrors.nombre = validNombre.error;
      }
    }

    // Validar precio_venta (solo para joyas)
    if (type === 'joyas' && formData.precio_venta) {
      const validPrecio = validarNumeroDecimal(formData.precio_venta, 0.01);
      if (!validPrecio.valido) {
        newErrors.precio_venta = 'El precio debe ser mayor a 0';
      }
    }

    // Validar costo
    if (formData.costo) {
      const validCosto = validarNumeroDecimal(formData.costo, 0.01);
      if (!validCosto.valido) {
        newErrors.costo = 'El costo debe ser mayor a 0';
      }
    }

    // Validar cantidad_existencia
    if (formData.cantidad_existencia !== undefined && formData.cantidad_existencia !== '') {
      const validCantidad = validarNumeroEntero(formData.cantidad_existencia, 0);
      if (!validCantidad.valido) {
        newErrors.cantidad_existencia = validCantidad.error;
      }
    }

    // Validar peso (si aplica)
    if (formData.peso && formData.peso !== '') {
      const validPeso = validarNumeroDecimal(formData.peso, 0);
      if (!validPeso.valido) {
        newErrors.peso = 'El peso debe ser un número válido';
      }
    }

    // Validar quilates (si aplica)
    if (formData.quilates && formData.quilates !== '') {
      const validQuilates = validarNumeroDecimal(formData.quilates, 0);
      if (!validQuilates.valido) {
        newErrors.quilates = 'Los quilates deben ser un número válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Preparar datos para enviar
      const submitData = { ...formData };

      // Limpiar campos vacíos - solo enviar los que tienen valor
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === null || submitData[key] === undefined) {
          delete submitData[key];
        }
      });

      // Asegurarse de que codigo_provedor sea un número si está presente
      if (submitData.codigo_provedor) {
        submitData.codigo_provedor = parseInt(submitData.codigo_provedor);
      }

      // Convertir valores numéricos apropiadamente
      if (submitData.cantidad_existencia !== undefined) {
        submitData.cantidad_existencia = parseInt(submitData.cantidad_existencia) || 0;
      }
      if (submitData.costo !== undefined) {
        submitData.costo = parseFloat(submitData.costo) || 0;
      }
      if (submitData.precio_venta !== undefined) {
        submitData.precio_venta = parseFloat(submitData.precio_venta) || 0;
      }
      if (submitData.peso !== undefined && submitData.peso !== '') {
        submitData.peso = parseFloat(submitData.peso);
      }
      if (submitData.quilates !== undefined && submitData.quilates !== '') {
        submitData.quilates = parseFloat(submitData.quilates);
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      // Mostrar el error al usuario
      if (error.response && error.response.data) {
        const errorMsg = typeof error.response.data === 'object'
          ? JSON.stringify(error.response.data, null, 2)
          : error.response.data;
        alert('Error al guardar: ' + errorMsg);
      } else {
        alert('Error al guardar. Verifique que todos los campos requeridos estén completos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    const { name, label, type, options, placeholder, required } = field;
    const value = formData[name] || '';
    const error = errors[name];

    switch (type) {
      case 'select':
        return (
          <div className="form-group" key={name}>
            <label className="form-label">
              {label} {required && <span className="required">*</span>}
            </label>
            <select
              name={name}
              value={value}
              onChange={handleChange}
              className={`form-select ${error ? 'error' : ''}`}
            >
              <option value="">Seleccione una opción</option>
              {options?.map(option => (
                <option key={option.codigo_provedor} value={option.codigo_provedor}>
                  {option.nombre}
                </option>
              ))}
            </select>
            {error && <span className="error-message">{error}</span>}
          </div>
        );

      case 'checkbox':
        return (
          <div className="form-group checkbox-group" key={name}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name={name}
                checked={!!value}
                onChange={handleChange}
                className="form-checkbox"
              />
              <span className="checkbox-text">
                {label} {required && <span className="required">*</span>}
              </span>
            </label>
            {error && <span className="error-message">{error}</span>}
          </div>
        );

      default:
        return (
          <div className="form-group" key={name}>
            <label className="form-label">
              {label} {required && <span className="required">*</span>}
            </label>
            <input
              type={type}
              name={name}
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              step={field.step}
              className={`form-input ${error ? 'error' : ''}`}
            />
            {error && <span className="error-message">{error}</span>}
          </div>
        );
    }
  };

  const getTitle = () => {
    const titles = {
      joyas: 'Joya',
      materiales: 'Material',
      insumos: 'Insumo'
    };
    return `${mode === 'create' ? 'Agregar' : 'Editar'} ${titles[type]}`;
  };

  return (
    <div className="inventario-form">
      <div className="form-header">
        <button type="button" onClick={onCancel} className="btn-back" disabled={loading}>
          <ArrowLeft className="btn-icon" />
        </button>
        <h2 className="form-title">{getTitle()}</h2>
        <div className="form-header-spacer" />
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        {/* Sección de información básica (común a todos) */}
        <div className="form-section">
          <h3 className="section-title">Información Básica</h3>
          <div className="form-row">
            {renderField({
              name: 'nombre',
              label: 'Nombre',
              type: 'text',
              placeholder: 'Ingrese el nombre',
              required: true
            })}
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
              className="form-textarea"
              placeholder="Ingrese una descripción (opcional)"
            />
          </div>
        </div>

        {/* Secciones específicas por tipo */}
        {fieldConfig[type]?.sections.map((section, index) => (
          <div key={index} className="form-section">
            <h3 className="section-title">{section.title}</h3>
            <div className={`form-row ${section.fields.length > 2 ? 'form-row-3' : ''}`}>
              {section.fields.map(field => renderField(field))}
            </div>
          </div>
        ))}

        {/* Botones de acción */}
        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel} 
            className="btn-cancel"
            disabled={loading}
          >
            <X className="btn-icon" />
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? (
              <div className="loading-spinner" />
            ) : (
              <Save className="btn-icon" />
            )}
            {mode === 'create' ? 'Crear' : 'Actualizar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventarioForm;