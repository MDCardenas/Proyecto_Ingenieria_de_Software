// components/cotizacionesComponentes/ModalVerCotizacion.jsx
import React from 'react';
import { FaTimes, FaDownload, FaPrint } from 'react-icons/fa';
import PDFCotizacion from './PDFCotizacion.jsx';
import PDFCotizacionReparacion from './PDFCotizacionReparacion.jsx';
import "../../styles/scss/components/_modales.scss";

export default function ModalVerCotizacion({ cotizacion, onClose }) {
    // Función para formatear fecha
    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-HN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Función para formatear tipo de servicio
    const formatearTipoServicio = (tipo) => {
        const tipos = {
            'FABRICACION': 'Fabricación',
            'REPARACION': 'Reparación'
        };
        return tipos[tipo] || tipo;
    };

    // Función para formatear estado
    const formatearEstado = (estado) => {
        const estados = {
            'ACTIVA': 'Activa',
            'ANULADA': 'Anulada',
            'FACTURADA': 'Facturada',
            'VENCIDA': 'Vencida'
        };
        return estados[estado] || estado;
    };

    // Función para obtener datos del cliente para el PDF
    const obtenerDatosCliente = () => {
        return {
            nombre: cotizacion.cliente_nombre || 'No especificado',
            direccion: cotizacion.direccion || 'No especificada',
            telefono: cotizacion.telefono || 'No especificado',
            rtn: cotizacion.rtn || 'No especificado'
        };
    };

    // Función para simular datos de productos (en una implementación real vendrían de la API)
    const obtenerProductos = () => {
        // Esto es temporal - en producción vendría de la API
        return cotizacion.productos || [{
            id: 1,
            producto: 'Producto de ejemplo',
            cantidad: 1,
            precio: cotizacion.subtotal,
            descripcion: 'Descripción del producto'
        }];
    };

    // Función para simular datos de materiales (en una implementación real vendrían de la API)
    const obtenerMateriales = () => {
        // Esto es temporal - en producción vendría de la API
        return cotizacion.materiales || [];
    };

    // Función para obtener resultados
    const obtenerResultados = () => {
        return {
            subtotal: cotizacion.subtotal || 0,
            isv: cotizacion.isv || 0,
            total: cotizacion.total || 0,
            anticipo: (cotizacion.total * 0.5) || 0,
            pagoPendiente: (cotizacion.total * 0.5) || 0
        };
    };

    return (
        <div className="modal-overlay">
            <div className="modal-contenido modal-ver-cotizacion">
                {/* Header del Modal */}
                <div className="modal-header">
                    <h2>Detalles de Cotización</h2>
                    <button className="btn-cerrar" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                {/* Contenido del Modal */}
                <div className="modal-body">
                    {/* Información General */}
                    <div className="seccion-info">
                        <h3>Información General</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <strong>Número:</strong>
                                <span>{cotizacion.numero_cotizacion}</span>
                            </div>
                            <div className="info-item">
                                <strong>Fecha:</strong>
                                <span>{formatearFecha(cotizacion.fecha_creacion)}</span>
                            </div>
                            <div className="info-item">
                                <strong>Vencimiento:</strong>
                                <span>{formatearFecha(cotizacion.fecha_vencimiento)}</span>
                            </div>
                            <div className="info-item">
                                <strong>Tipo:</strong>
                                <span>{formatearTipoServicio(cotizacion.tipo_servicio)}</span>
                            </div>
                            <div className="info-item">
                                <strong>Estado:</strong>
                                <span className={`estado ${cotizacion.estado?.toLowerCase()}`}>
                                    {formatearEstado(cotizacion.estado)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Información del Cliente */}
                    <div className="seccion-info">
                        <h3>Información del Cliente</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <strong>Cliente:</strong>
                                <span>{cotizacion.cliente_nombre || 'No especificado'}</span>
                            </div>
                            <div className="info-item">
                                <strong>Teléfono:</strong>
                                <span>{cotizacion.telefono || 'No especificado'}</span>
                            </div>
                            <div className="info-item">
                                <strong>Dirección:</strong>
                                <span>{cotizacion.direccion || 'No especificada'}</span>
                            </div>
                            <div className="info-item">
                                <strong>RTN:</strong>
                                <span>{cotizacion.rtn || 'No especificado'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Resumen Financiero */}
                    <div className="seccion-info">
                        <h3>Resumen Financiero</h3>
                        <div className="resumen-financiero">
                            <div className="linea-resumen">
                                <span>Subtotal:</span>
                                <span>L. {parseFloat(cotizacion.subtotal || 0).toFixed(2)}</span>
                            </div>
                            <div className="linea-resumen">
                                <span>Descuentos:</span>
                                <span>L. {parseFloat(cotizacion.descuento || 0).toFixed(2)}</span>
                            </div>
                            <div className="linea-resumen">
                                <span>ISV (15%):</span>
                                <span>L. {parseFloat(cotizacion.isv || 0).toFixed(2)}</span>
                            </div>
                            <div className="linea-resumen total">
                                <strong>Total:</strong>
                                <strong>L. {parseFloat(cotizacion.total || 0).toFixed(2)}</strong>
                            </div>
                            <div className="linea-resumen">
                                <span>Anticipo (50%):</span>
                                <span>L. {((cotizacion.total || 0) * 0.5).toFixed(2)}</span>
                            </div>
                            <div className="linea-resumen">
                                <span>Saldo Pendiente:</span>
                                <span>L. {((cotizacion.total || 0) * 0.5).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Observaciones */}
                    {cotizacion.observaciones && (
                        <div className="seccion-info">
                            <h3>Observaciones</h3>
                            <div className="observaciones">
                                <p>{cotizacion.observaciones}</p>
                            </div>
                        </div>
                    )}

                    {/* Vista Previa del PDF (Opcional) */}
                    <div className="seccion-info">
                        <h3>Vista Previa</h3>
                        <div className="vista-previa-pdf">
                            {cotizacion.tipo_servicio === 'FABRICACION' ? (
                                <PDFCotizacion
                                    tipoCotizacion="FABRICACION"
                                    datosCliente={obtenerDatosCliente()}
                                    productos={obtenerProductos()}
                                    materiales={obtenerMateriales()}
                                    resultados={obtenerResultados()}
                                    descuentos={cotizacion.descuento}
                                    datosCotizacion={cotizacion}
                                />
                            ) : (
                                <PDFCotizacionReparacion
                                    tipoCotizacion="REPARACION"
                                    datosCliente={obtenerDatosCliente()}
                                    productos={obtenerProductos()}
                                    materiales={obtenerMateriales()}
                                    resultados={obtenerResultados()}
                                    descuentos={cotizacion.descuento}
                                    datosCotizacion={cotizacion}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer del Modal */}
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cerrar
                    </button>
                    <button className="btn btn-primary">
                        <FaDownload /> Descargar PDF
                    </button>
                    <button className="btn btn-primary">
                        <FaPrint /> Imprimir
                    </button>
                </div>
            </div>
        </div>
    );
}