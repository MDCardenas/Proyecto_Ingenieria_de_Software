// src/components/InventarioModule/components/AlertasBanner.jsx
import React from 'react';
import { AlertTriangle, TrendingDown, Clock } from 'lucide-react';

const AlertasBanner = ({ alertas }) => {
  const hasAlerts = 
    alertas.materiales_stock_bajo?.length > 0 || 
    alertas.insumos_stock_bajo?.length > 0 || 
    alertas.insumos_proximos_vencer?.length > 0;

  if (!hasAlerts) return null;

  return (
    <div className="alertas-banner">
      {alertas.materiales_stock_bajo?.length > 0 && (
        <div className="alerta-item alerta-danger">
          <div className="alerta-icon-wrapper">
            <TrendingDown className="alerta-icon" />
          </div>
          <div className="alerta-content">
            <span className="alerta-count">{alertas.materiales_stock_bajo.length}</span>
            <span className="alerta-text">materiales con stock bajo</span>
          </div>
        </div>
      )}
      
      {alertas.insumos_stock_bajo?.length > 0 && (
        <div className="alerta-item alerta-warning">
          <div className="alerta-icon-wrapper">
            <AlertTriangle className="alerta-icon" />
          </div>
          <div className="alerta-content">
            <span className="alerta-count">{alertas.insumos_stock_bajo.length}</span>
            <span className="alerta-text">insumos con stock bajo</span>
          </div>
        </div>
      )}
      
      {alertas.insumos_proximos_vencer?.length > 0 && (
        <div className="alerta-item alerta-info">
          <div className="alerta-icon-wrapper">
            <Clock className="alerta-icon" />
          </div>
          <div className="alerta-content">
            <span className="alerta-count">{alertas.insumos_proximos_vencer.length}</span>
            <span className="alerta-text">insumos próximos a vencer</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertasBanner;