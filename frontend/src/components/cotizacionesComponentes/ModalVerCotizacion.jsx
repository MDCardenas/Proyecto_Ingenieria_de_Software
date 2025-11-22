// components/cotizacionesComponentes/ModalVerCotizacion.jsx
import React from 'react';
import { 
    FaTimes, 
    FaDownload, 
    FaPrint, 
    FaUser, 
    FaCalendar, 
    FaDollarSign, 
    FaInfoCircle, 
    FaBox, 
    FaTools,
    FaUsers,
    FaTag,
    FaListAlt,
    FaImage
} from 'react-icons/fa';
import "../../styles/scss/components/_modales.scss";

export default function ModalVerCotizacion({ cotizacion, onClose }) {
    // Agregar estos console.log al inicio del componente
    console.log('📦 Datos completos de cotización:', cotizacion);
    console.log('🔍 Campo descripción:', cotizacion.descripcion);
    console.log('🖼️ Campo imagen_url:', cotizacion.imagen_url);
    console.log('🎯 Tipo servicio:', cotizacion.tipo_servicio);

    // Función para formatear fecha
    const formatearFecha = (fecha) => {
        if (!fecha) return 'No especificada';
        return new Date(fecha).toLocaleDateString('es-HN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Función para formatear estado con colores
    const formatearEstado = (estado) => {
        const estados = {
            'ACTIVA': { texto: 'Activa', clase: 'estado-activa' },
            'ANULADA': { texto: 'Anulada', clase: 'estado-anulada' },
            'FACTURADA': { texto: 'Facturada', clase: 'estado-facturada' },
            'VENCIDA': { texto: 'Vencida', clase: 'estado-vencida' },
            'CONVERTIDA': { texto: 'Convertida', clase: 'estado-convertida' }
        };
        
        const estadoInfo = estados[estado] || { texto: estado, clase: 'estado-default' };
        return estadoInfo;
    };

    const estadoInfo = formatearEstado(cotizacion.estado);

    // Función segura para parsear números
    const parsearNumero = (valor) => {
        if (!valor) return 0;
        const numero = parseFloat(valor);
        return isNaN(numero) ? 0 : numero;
    };

    // Obtener datos estructurados - VERSIÓN MEJORADA
    const obtenerProductos = () => {
        console.log('📋 Buscando productos en cotización:', {
            allKeys: Object.keys(cotizacion)
        });
        
        // PRIMERO: Buscar en arrays existentes
        if (cotizacion.productos && Array.isArray(cotizacion.productos) && cotizacion.productos.length > 0) {
            console.log('✅ Usando array de productos');
            return cotizacion.productos;
        }
        
        if (cotizacion.detalles_productos && Array.isArray(cotizacion.detalles_productos) && cotizacion.detalles_productos.length > 0) {
            console.log('✅ Usando array de detalles_productos');
            return cotizacion.detalles_productos;
        }
        
        // SEGUNDO: Crear descripción basada en el tipo de servicio
        let descripcion = '';
        
        if (cotizacion.tipo_servicio === 'REPARACION') {
            descripcion = 'Servicio de reparación de equipo/artículo';
            if (cotizacion.observaciones) {
                descripcion += `. ${cotizacion.observaciones}`;
            }
        } else if (cotizacion.tipo_servicio === 'FABRICACION') {
            descripcion = 'Servicio de fabricación personalizada';
            if (cotizacion.observaciones) {
                descripcion += `. ${cotizacion.observaciones}`;
            }
        } else {
            descripcion = cotizacion.observaciones || 'Servicio general';
        }
        
        console.log('🔍 Descripción generada:', descripcion);
        
        // Crear producto desde datos principales
        return [{
            id: 1,
            nombre: `Cotización ${cotizacion.tipo_servicio === 'REPARACION' ? 'Reparación' : 'Fabricación'} #${cotizacion.numero_cotizacion}`,
            descripcion: descripcion,
            cantidad: 1,
            precio_unitario: parsearNumero(cotizacion.subtotal) || 0,
            subtotal: parsearNumero(cotizacion.subtotal) || 0
        }];
    };


    const obtenerInsumos = () => {
        return cotizacion.insumos || cotizacion.materiales || [];
    };

    const obtenerManoObra = () => {
        return cotizacion.mano_obra || cotizacion.horas_trabajo || [];
    };

    const obtenerDescuentos = () => {
        return cotizacion.descuentos || (cotizacion.descuento ? [{
            tipo: 'Descuento general',
            monto: parsearNumero(cotizacion.descuento),
            porcentaje: ((parsearNumero(cotizacion.descuento) / parsearNumero(cotizacion.subtotal)) * 100).toFixed(2)
        }] : []);
    };

    // Función para construir la URL - VERSIÓN FINAL (ya funciona)
    const obtenerUrlImagen = () => {
        if (!cotizacion.imagen_referencia) {
            return null;
        }
        
        // Ya que Django está sirviendo las imágenes correctamente
        const baseUrl = 'http://localhost:8000';
        const urlImagen = `${baseUrl}/media/${cotizacion.imagen_referencia}`;
        
        console.log('✅ URL imagen funcionando:', urlImagen);
        return urlImagen;
    };

    const productos = obtenerProductos();
    const insumos = obtenerInsumos();
    const manoObra = obtenerManoObra();
    const descuentos = obtenerDescuentos();
    const urlImagen = obtenerUrlImagen();
    const mostrarImagen = cotizacion.tipo_servicio === 'REPARACION' && urlImagen;

    // Calcular totales de forma segura
    const calcularSubtotal = (items) => {
        return items.reduce((sum, item) => {
            const cantidad = parsearNumero(item.cantidad) || 1;
            const precio = parsearNumero(item.precio_unitario || item.precio || item.tarifa_hora);
            const subtotalItem = parsearNumero(item.subtotal) || (cantidad * precio);
            return sum + subtotalItem;
        }, 0);
    };

    const subtotalProductos = calcularSubtotal(productos);
    const subtotalInsumos = calcularSubtotal(insumos);
    const subtotalManoObra = calcularSubtotal(manoObra);
    const totalDescuentos = descuentos.reduce((sum, desc) => sum + parsearNumero(desc.monto), 0);
    
    const subtotalGeneral = subtotalProductos + subtotalInsumos + subtotalManoObra;
    const subtotalDespuesDescuento = Math.max(0, subtotalGeneral - totalDescuentos);
    const isv = parsearNumero(cotizacion.isv) || (subtotalDespuesDescuento * 0.15);
    const total = parsearNumero(cotizacion.total) || (subtotalDespuesDescuento + isv);

    // Función para formatear moneda
    const formatearMoneda = (monto) => {
        return `L. ${parsearNumero(monto).toFixed(2)}`;
    };

    return (
        <div className="modal-overlay active">
            <div className="modal-contenido modal-ver-cotizacion-completa">
                {/* Header del Modal */}
                <div className="modal-header">
                    <div className="header-principal">
                        <h2>Cotización #{cotizacion.numero_cotizacion}</h2>
                        <span className={`badge-estado ${estadoInfo.clase}`}>
                            {estadoInfo.texto}
                        </span>
                    </div>
                    <button className="btn-cerrar" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                {/* Contenido del Modal */}
                <div className="modal-body-completo">
                    {/* Información General */}
                    <div className="seccion-informacion">
                        <div className="info-grid">
                            {/* Información del Cliente */}
                            <div className="info-card">
                                <div className="info-card-header">
                                    <FaUser className="icono" />
                                    <h3>Información del Cliente</h3>
                                </div>
                                <div className="info-card-body">
                                    <div className="info-line">
                                        <strong>Nombre:</strong>
                                        <span>{cotizacion.cliente_nombre || 'No especificado'}</span>
                                    </div>
                                    <div className="info-line">
                                        <strong>Teléfono:</strong>
                                        <span>{cotizacion.telefono || 'No especificado'}</span>
                                    </div>
                                    <div className="info-line">
                                        <strong>RTN:</strong>
                                        <span>{cotizacion.rtn || 'No especificado'}</span>
                                    </div>
                                    <div className="info-line">
                                        <strong>Dirección:</strong>
                                        <span>{cotizacion.direccion || 'No especificada'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Información de la Cotización */}
                            <div className="info-card">
                                <div className="info-card-header">
                                    <FaCalendar className="icono" />
                                    <h3>Información de la Cotización</h3>
                                </div>
                                <div className="info-card-body">
                                    <div className="info-line">
                                        <strong>Fecha Creación:</strong>
                                        <span>{formatearFecha(cotizacion.fecha_creacion)}</span>
                                    </div>
                                    <div className="info-line">
                                        <strong>Fecha Vencimiento:</strong>
                                        <span>{formatearFecha(cotizacion.fecha_vencimiento)}</span>
                                    </div>
                                    <div className="info-line">
                                        <strong>Tipo Servicio:</strong>
                                        <span>{cotizacion.tipo_servicio === 'FABRICACION' ? 'Fabricación' : 'Reparación'}</span>
                                    </div>
                                    <div className="info-line">
                                        <strong>Válido por:</strong>
                                        <span>{cotizacion.dias_validez || 30} días</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN DE IMAGEN - SOLO PARA REPARACIONES */}
                    {mostrarImagen && (
                        <div className="seccion-imagen">
                            <div className="seccion-header">
                                <FaImage className="icono" />
                                <h3>Imagen del Equipo/Artículo</h3>
                            </div>
                            <div className="imagen-container">
                                <img 
                                    src={urlImagen} 
                                    alt="Imagen del equipo o artículo a reparar"
                                    className="imagen-cotizacion"
                                    onError={(e) => {
                                        console.log('❌ Error cargando imagen, pero debería funcionar');
                                        e.target.style.display = 'none';
                                    }}
                                    onLoad={(e) => {
                                        console.log('✅ Imagen cargada correctamente');
                                    }}
                                />
                            </div>
                        </div>
                    )}


                    {/* Detalles del Producto */}
                    <div className="seccion-detalles">
                        <div className="seccion-header">
                            <FaListAlt className="icono" />
                            <h3>Detalles del Producto</h3>
                        </div>
                        <div className="tabla-detalles">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Producto/Servicio</th>
                                        <th>Descripción</th>
                                        <th>Cantidad</th>
                                        <th>Precio Unitario</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productos.map((producto, index) => (
                                        <tr key={producto.id || index}>
                                            <td>
                                                <div className="producto-nombre">
                                                    {producto.nombre || producto.producto || 'Producto/Servicio'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="producto-descripcion">
                                                    {producto.descripcion || producto.detalles_adicionales || 'Sin descripción'}
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                {parsearNumero(producto.cantidad) || 1}
                                            </td>
                                            <td className="text-right">
                                                {formatearMoneda(producto.precio_unitario || producto.precio)}
                                            </td>
                                            <td className="text-right">
                                                {formatearMoneda(producto.subtotal || (parsearNumero(producto.cantidad) * parsearNumero(producto.precio_unitario)))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Insumos y Materiales */}
                    {insumos.length > 0 && (
                        <div className="seccion-detalles">
                            <div className="seccion-header">
                                <FaBox className="icono" />
                                <h3>Insumos y Materiales</h3>
                            </div>
                            <div className="tabla-detalles">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Material</th>
                                            <th>Descripción</th>
                                            <th>Cantidad</th>
                                            <th>Precio Unitario</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {insumos.map((insumo, index) => (
                                            <tr key={insumo.id || index}>
                                                <td>{insumo.nombre || insumo.material || 'Material'}</td>
                                                <td>{insumo.descripcion || 'Sin descripción'}</td>
                                                <td className="text-center">{parsearNumero(insumo.cantidad) || 1}</td>
                                                <td className="text-right">{formatearMoneda(insumo.precio_unitario || insumo.precio)}</td>
                                                <td className="text-right">{formatearMoneda(insumo.subtotal || (parsearNumero(insumo.cantidad) * parsearNumero(insumo.precio_unitario)))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Mano de Obra */}
                    {manoObra.length > 0 && (
                        <div className="seccion-detalles">
                            <div className="seccion-header">
                                <FaUsers className="icono" />
                                <h3>Mano de Obra</h3>
                            </div>
                            <div className="tabla-detalles">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Descripción</th>
                                            <th>Horas</th>
                                            <th>Tarifa/Hora</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {manoObra.map((trabajo, index) => (
                                            <tr key={trabajo.id || index}>
                                                <td>{trabajo.descripcion || 'Trabajo general'}</td>
                                                <td className="text-center">{parsearNumero(trabajo.horas) || 1}</td>
                                                <td className="text-right">{formatearMoneda(trabajo.tarifa_hora || trabajo.precio_hora)}</td>
                                                <td className="text-right">{formatearMoneda(trabajo.subtotal || (parsearNumero(trabajo.horas) * parsearNumero(trabajo.tarifa_hora)))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Descuentos */}
                    {descuentos.length > 0 && (
                        <div className="seccion-detalles">
                            <div className="seccion-header">
                                <FaTag className="icono" />
                                <h3>Descuentos Aplicados</h3>
                            </div>
                            <div className="tabla-detalles">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Concepto</th>
                                            <th>Porcentaje</th>
                                            <th>Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {descuentos.map((descuento, index) => (
                                            <tr key={index}>
                                                <td>{descuento.tipo || descuento.concepto || 'Descuento'}</td>
                                                <td className="text-center">{descuento.porcentaje || '0.00'}%</td>
                                                <td className="text-right">{formatearMoneda(descuento.monto)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Resumen Financiero */}
                    <div className="seccion-resumen">
                        <div className="seccion-header">
                            <FaDollarSign className="icono" />
                            <h3>Resumen Financiero</h3>
                        </div>
                        <div className="resumen-grid">
                            <div className="resumen-col">
                                <div className="resumen-line">
                                    <span>Subtotal Productos:</span>
                                    <span>{formatearMoneda(subtotalProductos)}</span>
                                </div>
                                {insumos.length > 0 && (
                                    <div className="resumen-line">
                                        <span>Subtotal Insumos:</span>
                                        <span>{formatearMoneda(subtotalInsumos)}</span>
                                    </div>
                                )}
                                {manoObra.length > 0 && (
                                    <div className="resumen-line">
                                        <span>Subtotal Mano Obra:</span>
                                        <span>{formatearMoneda(subtotalManoObra)}</span>
                                    </div>
                                )}
                                <div className="resumen-line subtotal">
                                    <strong>Subtotal General:</strong>
                                    <strong>{formatearMoneda(subtotalGeneral)}</strong>
                                </div>
                            </div>
                            <div className="resumen-col">
                                {descuentos.length > 0 && (
                                    <div className="resumen-line descuento">
                                        <span>Descuentos:</span>
                                        <span>- {formatearMoneda(totalDescuentos)}</span>
                                    </div>
                                )}
                                <div className="resumen-line">
                                    <span>Subtotal después descuento:</span>
                                    <span>{formatearMoneda(subtotalDespuesDescuento)}</span>
                                </div>
                                <div className="resumen-line">
                                    <span>ISV (15%):</span>
                                    <span>{formatearMoneda(isv)}</span>
                                </div>
                                <div className="resumen-line total">
                                    <strong>Total:</strong>
                                    <strong>{formatearMoneda(total)}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Observaciones y Detalles Adicionales */}
                    {(cotizacion.observaciones || cotizacion.detalles_adicionales) && (
                        <div className="seccion-observaciones">
                            <div className="seccion-header">
                                <FaInfoCircle className="icono" />
                                <h3>Observaciones y Detalles Adicionales</h3>
                            </div>
                            <div className="observaciones-content">
                                {cotizacion.observaciones && (
                                    <div className="observacion-item">
                                        <strong>Observaciones:</strong>
                                        <p>{cotizacion.observaciones}</p>
                                    </div>
                                )}
                                {cotizacion.detalles_adicionales && (
                                    <div className="observacion-item">
                                        <strong>Detalles Adicionales:</strong>
                                        <p>{cotizacion.detalles_adicionales}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer del Modal */}
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};