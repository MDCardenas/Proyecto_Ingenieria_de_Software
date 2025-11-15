// components/cotizacionesComponentes/ModalSeleccionTipo.jsx
import React from 'react';
import { FaTools, FaIndustry, FaTimes } from 'react-icons/fa';
import "../../styles/scss/components/_modalSeleccionTipo.scss";

export default function ModalSeleccionTipo({ isOpen, onClose, onSeleccionarTipo }) {
    if (!isOpen) return null;

    const opciones = [
        {
            tipo: 'FABRICACION',
            titulo: 'Cotización de Fabricación',
            descripcion: 'Para proyectos de fabricación de nuevos productos o componentes',
            icono: FaIndustry,
            color: '#3498db',
            bgColor: '#ebf5fb'
        },
        {
            tipo: 'REPARACION',
            titulo: 'Cotización de Reparación',
            descripcion: 'Para servicios de reparación y mantenimiento de equipos',
            icono: FaTools,
            color: '#e67e22',
            bgColor: '#fef9e7'
        }
    ];

    const handleSeleccionar = (tipo) => {
        onSeleccionarTipo(tipo);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-seleccion-tipo">
                <div className="modal-header">
                    <h2>Seleccionar Tipo de Cotización</h2>
                    <button className="btn-cerrar" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                
                <div className="modal-body">
                    <p className="modal-descripcion">
                        Selecciona el tipo de cotización que deseas crear:
                    </p>
                    
                    <div className="opciones-grid">
                        {opciones.map((opcion, index) => {
                            const IconComponent = opcion.icono;
                            return (
                                <div 
                                    key={opcion.tipo}
                                    className="opcion-card"
                                    onClick={() => handleSeleccionar(opcion.tipo)}
                                >
                                    <div 
                                        className="opcion-icon"
                                        style={{
                                            backgroundColor: opcion.bgColor,
                                            color: opcion.color
                                        }}
                                    >
                                        <IconComponent />
                                    </div>
                                    <div className="opcion-content">
                                        <h3>{opcion.titulo}</h3>
                                        <p>{opcion.descripcion}</p>
                                    </div>
                                    <div className="opcion-arrow">
                                        →
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                <div className="modal-footer">
                    <button className="btn-cancelar" onClick={onClose}>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}