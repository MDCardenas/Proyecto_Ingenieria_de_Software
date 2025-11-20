// HeaderCotizaciones.jsx
import React from 'react';
import { FaFileInvoiceDollar, FaClock, FaCheck, FaExclamationTriangle, FaPlus } from 'react-icons/fa';
import "../../styles/scss/components/_headerCotizaciones.scss";

export default function HeaderCotizaciones({ estadisticas, onCrearCotizacion, loading }) {
    const {
        total = 0,
        activas = 0,
        vencidas = 0
    } = estadisticas;

    const cards = [
        {
            title: 'Total Cotizaciones',
            value: total,
            icon: FaFileInvoiceDollar,
            color: '#3498db',
            bgColor: '#ebf5fb'
        },
        {
            title: 'Activas',
            value: activas,
            icon: FaClock,
            color: '#27ae60',
            bgColor: '#eafaf1'
        },
        {
            title: 'Vencidas',
            value: vencidas,
            icon: FaExclamationTriangle,
            color: '#e74c3c',
            bgColor: '#fdedec'
        }
    ];

    return (
        <div className="header-cotizaciones">
            <div className="stats-grid">
                {cards.map((card, index) => {
                    const IconComponent = card.icon;
                    return (
                        <div key={index} className="stat-card">
                            <div 
                                className="stat-icon" 
                                style={{ 
                                    backgroundColor: card.bgColor,
                                    color: card.color
                                }}
                            >
                                <IconComponent />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">
                                    {loading ? (
                                        <div className="loading-pulse">---</div>
                                    ) : (
                                        card.value
                                    )}
                                </div>
                                <div className="stat-title">{card.title}</div>
                            </div>
                        </div>
                    );
                })}
                
                {/* Card de acción - Nueva Cotización */}
                <div className="action-card" onClick={onCrearCotizacion}>
                    <div className="action-icon">
                        <FaPlus />
                    </div>
                    <div className="action-content">
                        <div className="action-title">Nueva Cotización</div>
                        <div className="action-subtitle">Crear nueva cotización</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
