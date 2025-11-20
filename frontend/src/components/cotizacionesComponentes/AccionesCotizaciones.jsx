// components/cotizacionesComponentes/AccionesCotizaciones.jsx
import React, { useState } from 'react';
import { FaEye, FaEdit, FaFileInvoice, FaBan, FaTrash } from 'react-icons/fa';
import ModalVerCotizacion from './ModalVerCotizacion.jsx';

import "../../styles/scss/pages/_cotizacion.scss";

export default function AccionesCotizaciones({ 
    cotizacion, 
    onEditar, 
    onFactura, 
    onAnular, 
    onEliminar 
}) {
    const [mostrarModal, setMostrarModal] = useState(false);

    const handleVer = () => {
        setMostrarModal(true);
    };

    const handleEditar = () => {
        if (onEditar) {
            onEditar(cotizacion);
        }
    };

    const handleFactura = () => {
        if (onFactura) {
            onFactura(cotizacion);
        } else {
            alert('Funcionalidad de factura en desarrollo');
        }
    };

    const handleAnular = () => {
        if (onAnular) {
            onAnular(cotizacion);
        } else {
            if (confirm(`¿Está seguro que desea anular la cotización ${cotizacion.numero_cotizacion}?`)) {
                alert('Funcionalidad de anular en desarrollo');
            }
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

    return (
        <>
            <div className="acciones-cotizaciones">
                {/* Botón Ver */}
                <button 
                    className="btn-accion btn-ver"
                    onClick={handleVer}
                    title="Ver detalles"
                >
                    <FaEye />
                </button>

                {/* Botón Editar */}
                <button 
                    className="btn-accion btn-editar"
                    onClick={handleEditar}
                    title="Editar cotización"
                >
                    <FaEdit />
                </button>

                {/* Botón Factura */}
                <button 
                    className="btn-accion btn-factura"
                    onClick={handleFactura}
                    title="Generar factura"
                >
                    <FaFileInvoice />
                </button>

                {/* Botón Anular */}
                <button 
                    className="btn-accion btn-anular"
                    onClick={handleAnular}
                    title="Anular cotización"
                >
                    <FaBan />
                </button>

                {/* Botón Eliminar */}
                <button 
                    className="btn-accion btn-eliminar"
                    onClick={handleEliminar}
                    title="Eliminar cotización"
                >
                    <FaTrash />
                </button>
            </div>

            {/* Modal para Ver */}
            {mostrarModal && (
                <ModalVerCotizacion
                    cotizacion={cotizacion}
                    onClose={() => setMostrarModal(false)}
                />
            )}
        </>
    );
}