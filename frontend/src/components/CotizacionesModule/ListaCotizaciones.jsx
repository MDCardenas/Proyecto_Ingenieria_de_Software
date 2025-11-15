// ListaCotizaciones.jsx
import React from 'react';
import { FaEye, FaTrash, FaFileInvoiceDollar, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

import '../../styles/scss/components/_listaCotizaciones.scss';

export default function ListaCotizaciones({ 
    cotizaciones, 
    loading, 
    onVerDetalle, 
    onEliminar, 
    onConvertirAFactura 
}) {

    const formatearFecha = (fechaString) => {
        if (!fechaString) return '-';
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-HN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatearMoneda = (monto) => {
        return new Intl.NumberFormat('es-HN', {
            style: 'currency',
            currency: 'HNL',
            minimumFractionDigits: 2
        }).format(monto);
    };

    const getEstadoBadge = (estado, fechaVencimiento) => {
        const hoy = new Date();
        const vencimiento = new Date(fechaVencimiento);
        
        if (estado === 'ACTIVA' && fechaVencimiento && vencimiento < hoy) {
            return (
                <span className="estado-vencida">
                    <FaExclamationTriangle style={{ marginRight: '4px' }} />
                    Vencida
                </span>
            );
        }

        switch (estado) {
            case 'ACTIVA':
                return (
                    <span className="estado-activa">
                        <FaClock style={{ marginRight: '4px' }} />
                        Activa
                    </span>
                );
            case 'CONVERTIDA':
                return (
                    <span className="estado-convertida">
                        <FaCheckCircle style={{ marginRight: '4px' }} />
                        Convertida
                    </span>
                );
            case 'ANULADA':
                return (
                    <span className="estado-anulada">
                        <FaBan style={{ marginRight: '4px' }} />
                        Anulada
                    </span>
                );
            default:
                return <span className="estado-activa">{estado}</span>;
        }
    };

    const getTipoServicioTexto = (tipoServicio) => {
        const tipos = {
            'REPARACION': 'Reparación',
            'FABRICACION': 'Fabricación',
            'MANTENIMIENTO': 'Mantenimiento',
            'VENTA': 'Venta'
        };
        return tipos[tipoServicio] || tipoServicio;
    };

    if (loading) {
        return (
            <div className="lista-cotizaciones">
                <div className="lista-loading">
                    <div className="loading-spinner"></div>
                    <p>Cargando cotizaciones...</p>
                </div>
            </div>
        );
    }

    if (!cotizaciones || cotizaciones.length === 0) {
        return (
            <div className="lista-cotizaciones">
                <div className="lista-empty">
                    <div className="empty-icon">📄</div>
                    <h4>No hay cotizaciones</h4>
                    <p>No se encontraron cotizaciones con los filtros aplicados.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="lista-cotizaciones">
            <div className="lista-header">
                <h3>Lista de Cotizaciones</h3>
                <div className="lista-info">
                    {cotizaciones.length} cotizaciones encontradas
                </div>
            </div>

            <div className="lista-body">
                <table className="tabla-cotizaciones">
                    <thead>
                        <tr>
                            <th># Cotización</th>
                            <th>Cliente</th>
                            <th>Fecha Creación</th>
                            <th>Vencimiento</th>
                            <th>Tipo Servicio</th>
                            <th>Estado</th>
                            <th>Total</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cotizaciones.map((cotizacion) => (
                            <tr key={cotizacion.numero_cotizacion}>
                                <td data-label="# Cotización">
                                    <span className="numero-cotizacion">
                                        #{cotizacion.numero_cotizacion}
                                    </span>
                                </td>

                                <td data-label="Cliente">
                                    <span className="cliente-nombre">
                                        {cotizacion.cliente_nombre || 
                                         `${cotizacion.id_cliente?.nombre || ''} ${cotizacion.id_cliente?.apellido || ''}`}
                                    </span>
                                </td>

                                <td data-label="Fecha Creación">
                                    <span className="fecha">
                                        {formatearFecha(cotizacion.fecha_creacion)}
                                    </span>
                                </td>

                                <td data-label="Vencimiento">
                                    <span className="fecha">
                                        {formatearFecha(cotizacion.fecha_vencimiento)}
                                    </span>
                                </td>

                                <td data-label="Tipo Servicio">
                                    {getTipoServicioTexto(cotizacion.tipo_servicio)}
                                </td>

                                <td data-label="Estado">
                                    {getEstadoBadge(cotizacion.estado, cotizacion.fecha_vencimiento)}
                                </td>

                                <td data-label="Total" className="total">
                                    {formatearMoneda(cotizacion.total)}
                                </td>

                                <td className="acciones-cell" data-label="Acciones">
                                    {/* Botón Ver - Siempre visible */}
                                    <button
                                        className="btn-accion btn-ver"
                                        onClick={() => onVerDetalle(cotizacion)}
                                        title="Ver detalle"
                                    >
                                        <FaEye />
                                        Ver
                                    </button>

                                    {/* Botón Factura - Solo para cotizaciones ACTIVAS */}
                                    {cotizacion.estado === 'ACTIVA' && (
                                        <button
                                            className="btn-accion btn-convertir"
                                            onClick={() => onConvertirAFactura(cotizacion)}
                                            title="Convertir a factura"
                                        >
                                            <FaFileInvoiceDollar />
                                            Factura
                                        </button>
                                    )}

                                    {/* Botón Eliminar - Solo para cotizaciones NO CONVERTIDAS */}
                                    {cotizacion.estado !== 'CONVERTIDA' && (
                                        <button
                                            className="btn-accion btn-eliminar"
                                            onClick={() => onEliminar(cotizacion)}
                                            title="Eliminar cotización"
                                        >
                                            <FaTrash />
                                            Eliminar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}