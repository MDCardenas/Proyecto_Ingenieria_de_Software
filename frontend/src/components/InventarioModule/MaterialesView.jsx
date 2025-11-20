// src/components/InventarioModule/views/MaterialesView.jsx
import React from 'react';
import { Package, Edit, Trash2, TrendingDown, User, Weight, Gem as GemIcon } from 'lucide-react';

const MaterialesView = ({ data, onEdit, onDelete }) => {
  if (data.length === 0) {
    return (
      <div className="empty-state">
        <Package className="empty-icon" />
        <h3>No hay materiales registrados</h3>
        <p>Agrega materiales para comenzar a gestionar tu inventario</p>
      </div>
    );
  }

  return (
    <div className="items-list">
      {data.map(material => {
        const stockBajo = material.cantidad_existencia < 10;
        
        return (
          <div 
            key={material.codigo_material} 
            className={`item-card ${stockBajo ? 'stock-alert' : ''}`}
          >
            <div className="item-header">
              <div className="item-icon-wrapper">
                <Package className="item-icon" />
              </div>
              
              <div className="item-title-section">
                <h3 className="item-title">{material.nombre}</h3>
                <p className="item-subtitle">{material.tipo_material || 'Sin tipo'}</p>
              </div>

              <div className="item-actions">
                <button 
                  onClick={() => onEdit(material)} 
                  className="btn-action btn-edit"
                  title="Editar"
                >
                  <Edit className="btn-icon" />
                </button>
                <button 
                  onClick={() => onDelete(material.codigo_material)} 
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
                    <span className="detail-value">{material.provedor_nombre || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-card">
                  <Weight className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Peso</span>
                    <span className="detail-value">{material.peso ? `${material.peso}g` : 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-card">
                  <GemIcon className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Quilates</span>
                    <span className="detail-value">{material.quilates || 'N/A'}</span>
                  </div>
                </div>

                <div className={`detail-card ${stockBajo ? 'alert' : ''}`}>
                  <div className="detail-content">
                    <span className="detail-label">Stock</span>
                    <span className="detail-value stock-value">
                      {material.cantidad_existencia || 0} unidades
                      {stockBajo && <TrendingDown className="stock-icon" />}
                    </span>
                  </div>
                </div>
              </div>

              <div className="item-footer">
                <div className="cost-badge">
                  <span className="cost-label">Costo:</span>
                  <span className="cost-value">L. {parseFloat(material.costo || 0).toFixed(2)}</span>
                </div>

                {material.pureza && (
                  <span className="info-tag">Pureza: {material.pureza}</span>
                )}
                {material.color && (
                  <span className="info-tag">Color: {material.color}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MaterialesView;