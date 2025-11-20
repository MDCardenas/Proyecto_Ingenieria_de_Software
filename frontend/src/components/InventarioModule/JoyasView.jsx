// src/components/InventarioModule/views/JoyasView.jsx
import React from 'react';
import { Gem, Edit, Trash2, Weight, DollarSign, Eye } from 'lucide-react';

const JoyasView = ({ data, onEdit, onDelete }) => {
  const handleView = (joya) => {
    // Función para ver detalles de la joya (puedes implementar un modal o navegación)
    console.log('Ver detalles de joya:', joya);
    // TODO: Implementar vista de detalles
  };

  if (data.length === 0) {
    return (
      <div className="empty-state">
        <Gem className="empty-icon" />
        <h3>No hay joyas registradas</h3>
        <p>Comienza agregando tu primera joya al inventario</p>
      </div>
    );
  }

  return (
    <div className="joyas-grid">
      {data.map(joya => (
        <div key={joya.codigo_joya} className="joya-card">
          {/* Imagen */}
          <div className="joya-image">
            {joya.imagen_base64 ? (
              <img 
                src={`data:image/jpeg;base64,${joya.imagen_base64}`} 
                alt={joya.nombre} 
              />
            ) : (
              <div className="joya-placeholder">
                <Gem className="placeholder-icon" />
              </div>
            )}
            
            {/* Acciones flotantes sobre la imagen */}
            <div className="joya-actions-overlay">
              <button 
                onClick={() => handleView(joya)} 
                className="btn-action btn-view"
                title="Ver detalles"
              >
                <Eye size={16} />
              </button>
              <button 
                onClick={() => onEdit(joya)} 
                className="btn-action btn-edit"
                title="Editar"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => onDelete(joya.codigo_joya)} 
                className="btn-action btn-delete"
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="joya-body">
            <div className="joya-header">
              <h3 className="joya-title">{joya.nombre}</h3>
              <span className="joya-type">{joya.tipo || 'Sin tipo'}</span>
            </div>

            <div className="joya-info">
              <div className="info-row">
                <span className="info-label">Material:</span>
                <span className="info-value">{joya.material || 'N/A'}</span>
              </div>
              
              {joya.peso && (
                <div className="info-row">
                  <Weight className="info-icon" size={14} />
                  <span className="info-value">{joya.peso}g</span>
                </div>
              )}
              
              <div className="info-row price-row">
                <DollarSign className="info-icon" size={14} />
                <span className="info-value price">
                  L. {parseFloat(joya.precio_venta || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {joya.descripcion && (
              <p className="joya-description">{joya.descripcion}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default JoyasView;