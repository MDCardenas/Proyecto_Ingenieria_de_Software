// components/cotizacionesComponentes/AccionesCotizaciones.jsx
import React, { useState } from 'react';
import { FaEye, FaFileInvoice, FaTrash } from 'react-icons/fa';
import ModalVerCotizacion from './ModalVerCotizacion.jsx';
import "../../styles/scss/pages/_cotizacion.scss";

export default function AccionesCotizaciones({ 
    cotizacion, 
    onFactura, 
    onEliminar 
}) {
    const [mostrarModal, setMostrarModal] = useState(false);

    const handleVer = () => {
        setMostrarModal(true);
    };

    const handleFactura = () => {
        if (onFactura) {
            onFactura(cotizacion);
        } else {
            alert('Funcionalidad de factura en desarrollo');
        }
    };

    const handleEliminar = () => {
        if (onEliminar) {
            onEliminar(cotizacion);
        } else {
            if (confirm(`¿Está seguro que desea eliminar la cotización ${cotizacion.numero_cotizacion}? Esta acción no se puede deshacer.`)) {
                alert('Funcionalidad de eliminar en desarrollo');
            }
        }
    };

    // Determinar qué botones mostrar según el estado
    const esConvertida = cotizacion.estado === 'CONVERTIDA' || cotizacion.estado === 'FACTURADA';
    const esActiva = cotizacion.estado === 'ACTIVA';
    const puedeEliminar = !esConvertida && cotizacion.estado !== 'ANULADA';

    return (
        <>
            <div className="acciones-cotizaciones">
                {/* Botón Ver - Siempre visible */}
                <button 
                    className="btn-accion btn-ver"
                    onClick={handleVer}
                    title="Ver detalles"
                >
                    <FaEye />
                </button>

                {/* Botón Factura - Solo para cotizaciones ACTIVAS */}
                {esActiva && (
                    <button 
                        className="btn-accion btn-factura"
                        onClick={handleFactura}
                        title="Generar factura"
                    >
                        <FaFileInvoice />
                    </button>
                )}

                {/* Botón Eliminar - Solo para cotizaciones NO CONVERTIDAS y NO ANULADAS */}
                {puedeEliminar && (
                    <button 
                        className="btn-accion btn-eliminar"
                        onClick={handleEliminar}
                        title="Eliminar cotización"
                    >
                        <FaTrash />
                    </button>
                )}
            </div>

            {/* Modal para Ver - Este es el modal nuevo y mejorado */}
            {mostrarModal && (
                <ModalVerCotizacion
                    cotizacion={cotizacion}
                    onClose={() => setMostrarModal(false)}
                />
            )}
        </>
    );
}