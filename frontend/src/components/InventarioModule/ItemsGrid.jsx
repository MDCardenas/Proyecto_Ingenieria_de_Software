import React, { useState } from 'react';
import { Gem, Package, Wrench, Edit, Trash2, Eye, AlertTriangle, X } from 'lucide-react';

// Función para verificar alertas
const checkAlerts = (type, item, alertas) => {
  if (!alertas) return false;

  const stockBajo = 
    (type === 'materiales' && alertas.materiales_stock_bajo?.some(m => m.codigo_material === item.codigo_material)) ||
    (type === 'insumos' && alertas.insumos_stock_bajo?.some(i => i.codigo_insumo === item.codigo_insumo));

  const proximoVencer = 
    type === 'insumos' && 
    alertas.insumos_proximos_vencer?.some(i => i.codigo_insumo === item.codigo_insumo);

  return stockBajo || proximoVencer;
};

const ItemsGrid = ({ type, data, alertas, onEdit, onDelete, loading }) => {
  const config = {
    joyas: { icon: Gem, title: 'joyas', fields: ['material', 'peso', 'precio_venta'] },
    materiales: { icon: Package, title: 'materiales', fields: ['proveedor', 'peso', 'costo'] },
    insumos: { icon: Wrench, title: 'insumos', fields: ['proveedor', 'stock', 'costo'] }
  };

  const { icon: Icon, title } = config[type];

  if (loading) {
    return <div className="loading-state">Cargando...</div>;
  }

  if (data.length === 0) {
    return (
      <div className="empty-state">
        <Icon className="empty-icon" />
        <h3>No hay {title} registrados</h3>
        <p>Comienza agregando tu primer elemento al inventario</p>
      </div>
    );
  }

  return (
    <div className={`items-grid ${type}-grid`}>
      {data.map(item => (
        <ItemCard
          key={item[`codigo_${type.slice(0, -1)}`]}
          type={type}
          item={item}
          alertas={alertas}
          onEdit={onEdit}
          onDelete={onDelete}
          config={config[type]}
        />
      ))}
    </div>
  );
};

const ItemCard = ({ type, item, alertas, onEdit, onDelete, config }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const hasAlerts = checkAlerts(type, item, alertas);

  const renderDetails = () => {
    switch (type) {
      case 'joyas':
        return (
          <div className="joya-details-list">
            {item.material && (
              <div className="detail-row">
                <span className="detail-label">Material:</span>
                <span className="detail-value">{item.material}</span>
              </div>
            )}
            {item.peso && (
              <div className="detail-row">
                <span className="detail-label">Peso:</span>
                <span className="detail-value">{item.peso}g</span>
              </div>
            )}
            {item.precio_venta && (
              <div className="detail-row">
                <span className="detail-label">Precio Venta:</span>
                <span className="detail-value price">L. {item.precio_venta}</span>
              </div>
            )}
            {item.descripcion && (
              <div className="detail-row full-width">
                <span className="detail-label">Descripción:</span>
                <span className="detail-value">{item.descripcion}</span>
              </div>
            )}
          </div>
        );

      case 'materiales':
        return (
          <div className="details-list">
            {item.tipo_material && (
              <div className="detail-item">
                <strong>Tipo:</strong>
                <span>{item.tipo_material}</span>
              </div>
            )}
            {item.peso && (
              <div className="detail-item">
                <strong>Peso:</strong>
                <span>{item.peso}g</span>
              </div>
            )}
            {item.cantidad_existencia !== undefined && (
              <div className="detail-item">
                <strong>Stock:</strong>
                <span>{item.cantidad_existencia}</span>
              </div>
            )}
            {item.costo && (
              <div className="detail-item">
                <strong>Costo:</strong>
                <span>${item.costo}</span>
              </div>
            )}
            {item.proveedor && (
              <div className="detail-item">
                <strong>Proveedor:</strong>
                <span>{item.proveedor}</span>
              </div>
            )}
          </div>
        );

      case 'insumos':
        return (
          <div className="details-list">
            {item.tipo_insumo && (
              <div className="detail-item">
                <strong>Tipo:</strong>
                <span>{item.tipo_insumo}</span>
              </div>
            )}
            {item.cantidad_existencia !== undefined && (
              <div className="detail-item">
                <strong>Stock:</strong>
                <span>{item.cantidad_existencia} {item.unidad_medida || ''}</span>
              </div>
            )}
            {item.costo && (
              <div className="detail-item">
                <strong>Costo:</strong>
                <span>${item.costo}</span>
              </div>
            )}
            {item.fecha_vencimiento && (
              <div className="detail-item">
                <strong>Vence:</strong>
                <span>{new Date(item.fecha_vencimiento).toLocaleDateString()}</span>
              </div>
            )}
            {item.proveedor && (
              <div className="detail-item">
                <strong>Proveedor:</strong>
                <span>{item.proveedor}</span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Modal para ver imagen en grande
  if (showImageModal && type === 'joyas' && item.imagen_url) {
    return (
      <div className="image-modal-overlay" onClick={() => setShowImageModal(false)}>
        <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
          <button 
            className="btn-close-modal"
            onClick={() => setShowImageModal(false)}
            title="Cerrar"
          >
            <X size={24} />
          </button>
          <img src={item.imagen_url} alt={item.nombre} className="modal-image" />
          <p className="modal-title">{item.nombre}</p>
        </div>
      </div>
    );
  }

  // Renderizado para JOYAS
  if (type === 'joyas') {
    return (
      <div className={`item-card joya-card ${hasAlerts ? 'with-alerts' : ''}`}>
        {hasAlerts && (
          <div className="item-alert-badge">
            <AlertTriangle size={16} />
          </div>
        )}

        {/* Imagen */}
        <div className="joya-image-container">
          {item.imagen_url ? (
            <div className="joya-image-wrapper">
              <img 
                src={item.imagen_url} 
                alt={item.nombre} 
                className="joya-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="joya-image-fallback">
                <Gem size={32} />
                <span>Imagen no disponible</span>
              </div>
            </div>
          ) : (
            <div className="joya-image-placeholder">
              <Gem size={48} />
              <span>Sin imagen</span>
            </div>
          )}

          {/* Overlay de acciones */}
          <div className="joya-image-overlay">
            <div className="overlay-actions">
              {item.imagen_url && (
                <button 
                  className="btn-overlay-action btn-view" 
                  onClick={() => setShowImageModal(true)}
                  title="Ver imagen"
                >
                  <Eye size={20} />
                </button>
              )}
              <button 
                className="btn-overlay-action btn-edit" 
                onClick={() => onEdit(item)}
                title="Editar"
              >
                <Edit size={20} />
              </button>
              <button 
                className="btn-overlay-action btn-delete" 
                onClick={() => onDelete(item.codigo_joya)}
                title="Eliminar"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="joya-content">
          <div className="joya-header">
            <h3 className="joya-name">{item.nombre}</h3>
            {item.material && <span className="joya-category">{item.material}</span>}
          </div>

          <div className="joya-details">
            {renderDetails()}
          </div>
        </div>

        {hasAlerts && (
          <div className="item-alert-message">
            <AlertTriangle size={14} />
            <span>Requiere atención</span>
          </div>
        )}
      </div>
    );
  }

  // Renderizado para MATERIALES E INSUMOS
  return (
    <div className={`item-card ${hasAlerts ? 'with-alerts' : ''}`}>
      {hasAlerts && (
        <div className="item-alert-badge">
          <AlertTriangle size={16} />
        </div>
      )}

      <div className="item-header">
        <div className="item-icon">
          <config.icon />
        </div>
        <div className="item-info">
          <h3 className="item-name">{item.nombre}</h3>
          <p className="item-description">{item.descripcion || 'Sin descripción'}</p>
        </div>
        <div className="item-actions">
          <button 
            className="btn-edit" 
            onClick={() => onEdit(item)}
            title="Editar"
          >
            <Edit size={16} />
          </button>
          <button 
            className="btn-delete" 
            onClick={() => onDelete(item[`codigo_${type.slice(0, -1)}`])}
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="item-details">
        {renderDetails()}
      </div>

      {hasAlerts && (
        <div className="item-alert-message">
          <AlertTriangle size={14} />
          <span>Requiere atención</span>
        </div>
      )}
    </div>
  );
};

export default ItemsGrid;