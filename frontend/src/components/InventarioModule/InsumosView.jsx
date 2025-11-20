// src/components/InventarioModule/views/InsumosView.jsx
import React from 'react';
import { Wrench, Edit, Trash2, AlertTriangle, User, Package as PackageIcon, DollarSign, Calendar, CheckCircle, XCircle } from 'lucide-react';

const InsumosView = ({ data, onEdit, onDelete, alertas }) => {
  if (data.length === 0) {
    return (
      <div className="empty-state">
        <Wrench className="empty-icon" />
        <h3>No hay insumos registrados</h3>
        <p>Registra insumos para gestionar tus herramientas y materiales</p>
      </div>
    );
  }

  return (
    <div className="items-list">
      {data.map(insumo => {
        const stockBajo = insumo.cantidad_existencia < 5;
        const proximoVencer = alertas.insumos_proximos_vencer?.some(
          i => i.codigo_insumo === insumo.codigo_insumo
        );
        
        return (
          <div 
            key={insumo.codigo_insumo} 
            className={`item-card ${stockBajo ? 'stock-alert' : ''} ${proximoVencer ? 'expiry-alert' : ''}`}
          >
            <div className="item-header">
              <div className="item-icon-wrapper">
                <Wrench className="item-icon" />
              </div>
              
              <div className="item-title-section">
                <div className="title-with-badges">
                  <h3 className="item-title">{insumo.nombre}</h3>
                  {stockBajo && (
                    <span className="badge badge-danger" title="Stock bajo">
                      <AlertTriangle className="badge-icon" />
                    </span>
                  )}
                  {proximoVencer && (
                    <span className="badge badge-warning" title="Próximo a vencer">
                      <AlertTriangle className="badge-icon" />
                    </span>
                  )}
                </div>
                <p className="item-subtitle">
                  {insumo.tipo_insumo || 'Sin tipo'} • {insumo.categoria || 'Sin categoría'}
                </p>
              </div>

              <div className="item-actions">
                <button 
                  onClick={() => onEdit(insumo)} 
                  className="btn-action btn-edit"
                  title="Editar"
                >
                  <Edit className="btn-icon" />
                </button>
                <button 
                  onClick={() => onDelete(insumo.codigo_insumo)} 
                  className="btn-action btn-delete"
                  title="Eliminar"
                >
                  <Trash2 className="btn-icon" />
                </button>
              </div>
            </div>

            <div className="item-body">
              <div className="item-details">
                <div className="detail-card">
                  <User className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Proveedor</span>
                    <span className="detail-value">{insumo.provedor_nombre || 'N/A'}</span>
                  </div>
                </div>

                <div className={`detail-card ${stockBajo ? 'alert' : ''}`}>
                  <PackageIcon className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Stock</span>
                    <span className="detail-value">
                      {insumo.cantidad_existencia || 0} {insumo.unidad_medida || 'uds'}
                    </span>
                  </div>
                </div>

                <div className="detail-card">
                  <DollarSign className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Costo</span>
                    <span className="detail-value">L. {parseFloat(insumo.costo || 0).toFixed(2)}</span>
                  </div>
                </div>

                {insumo.fecha_vencimiento && (
                  <div className={`detail-card ${proximoVencer ? 'alert' : ''}`}>
                    <Calendar className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">Vencimiento</span>
                      <span className="detail-value">
                        {new Date(insumo.fecha_vencimiento).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="detail-card">
                  {insumo.requiere_control_vencimiento ? (
                    <CheckCircle className="detail-icon success" />
                  ) : (
                    <XCircle className="detail-icon muted" />
                  )}
                  <div className="detail-content">
                    <span className="detail-label">Control</span>
                    <span className="detail-value">
                      {insumo.requiere_control_vencimiento ? 'Sí' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {insumo.descripcion && (
                <p className="item-description">{insumo.descripcion}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InsumosView;