// components/cotizacionesComponentes/FormatoCotizacionFabricacion.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaSearch, FaTimes, FaCalculator, FaFilePdf, FaTimesCircle } from 'react-icons/fa';
import { normalizeText } from '../../utils/normalize.js';
import DatosCliente from '../FacturacionModule/DatosCliente.jsx';
import Producto from '../FacturacionModule/Producto.jsx';
import Material from './Material.jsx';
import { ENDPOINTS } from '../../config/config';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PDFCotizacion from './PDFCotizacion.jsx';

import "../../styles/scss/components/_cotizacionFabricacion.scss";

export default function FormatoCotizacionFabricacion({ 
    cotizacion, 
    modoEdicion, 
    onClose, 
    onSave 
}) {
    const [datosCotizacion, setDatosCotizacion] = useState({
        id_cliente: '',
        id_empleado: '',
        fecha: new Date().toISOString().split('T')[0],
        telefono: '',
        direccion: '',
        rtn: '',
        productos: [{
            id: Date.now(),
            codigo: '',
            producto: '',
            cantidad: 1,
            precio: 0,
            descripcion: '',
            tipoJoya: '',
            tipoReparacion: ''
        }],
        materiales: [{
            id: Date.now(),
            tipo_material: '',
            peso_gramos: '',
            precio_por_gramo: '',
            costo_total: 0
        }],
        costo_insumos: 0,
        mano_obra: 0,
        descuentos: 0,
        observaciones: ''
    });

    const [resultados, setResultados] = useState({
        subtotal: 0,
        isv: 0,
        total: 0,
        anticipo: 0,
        pagoPendiente: 0,
    });

    const [clientes, setClientes] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [materialesStock, setMaterialesStock] = useState([]);
    const [productosStock, setProductosStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errores, setErrores] = useState({});

    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    const cotizacionRef = useRef();

    useEffect(() => {
        if (cotizacion) {
            setDatosCotizacion({
                id_cliente: cotizacion.id_cliente || '',
                id_empleado: cotizacion.id_empleado || '',
                fecha: cotizacion.fecha_creacion?.split('T')[0] || new Date().toISOString().split('T')[0],
                telefono: cotizacion.telefono || '',
                direccion: cotizacion.direccion || '',
                rtn: cotizacion.rtn || '',
                productos: cotizacion.productos?.map((prod, index) => ({
                    id: prod.id || Date.now() + index,
                    codigo: prod.codigo_boceto || prod.codigo || '',
                    producto: prod.nombre_diseno || prod.producto || '',
                    cantidad: prod.cantidad || 1,
                    precio: prod.precio_unitario || prod.precio || 0,
                    descripcion: prod.descripcion_boceto || prod.descripcion || '',
                    tipoJoya: prod.tipoJoya || '',
                    tipoReparacion: prod.tipoReparacion || ''
                })) || [{
                    id: Date.now(),
                    codigo: '',
                    producto: '',
                    cantidad: 1,
                    precio: 0,
                    descripcion: '',
                    tipoJoya: '',
                    tipoReparacion: ''
                }],
                materiales: cotizacion.materiales?.map((mat, index) => ({
                    id: mat.id || Date.now() + index + 1000,
                    tipo_material: mat.tipo_material || '',
                    peso_gramos: mat.peso_gramos || '',
                    precio_por_gramo: mat.precio_por_gramo || '',
                    costo_total: mat.costo_total || 0
                })) || [{
                    id: Date.now(),
                    tipo_material: '',
                    peso_gramos: '',
                    precio_por_gramo: '',
                    costo_total: 0
                }],
                costo_insumos: cotizacion.costo_insumos || 0,
                mano_obra: cotizacion.mano_obra || 0,
                descuentos: cotizacion.descuentos || 0,
                observaciones: cotizacion.observaciones || ''
            });
        }
    }, [cotizacion]);

    const cargarDatosIniciales = async () => {
        try {
            setLoading(true);
            
            const [clientesRes, empleadosRes, materialesRes] = await Promise.all([
                axios.get(ENDPOINTS.clientes),
                axios.get(ENDPOINTS.empleados),
                axios.get(ENDPOINTS.materiales)
            ]);

            setClientes(clientesRes.data);
            setEmpleados(empleadosRes.data);
            setMaterialesStock(materialesRes.data);
            
            console.log("✅ Clientes cargados:", clientesRes.data.length);
            console.log("✅ Empleados cargados:", empleadosRes.data.length);
            console.log("✅ Materiales cargados:", materialesRes.data.length);
            
            try {
                const productosRes = await axios.get(ENDPOINTS.joyas);
                setProductosStock(productosRes.data);
                console.log("✅ Productos cargados:", productosRes.data.length);
            } catch (productosError) {
                console.log("ℹ️ API de productos no disponible, usando array vacío");
                setProductosStock([]);
            }
            
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            setMaterialesStock([]);
            setProductosStock([]);
        } finally {
            setLoading(false);
        }
    };

    const calcularCostos = useCallback(() => {
        const materialesActualizados = datosCotizacion.materiales.map(material => ({
            ...material,
            costo_total: (parseFloat(material.peso_gramos) || 0) * (parseFloat(material.precio_por_gramo) || 0)
        }));

        const totalMateriales = materialesActualizados.reduce((sum, material) => sum + material.costo_total, 0);
        
        const subtotal = totalMateriales + 
                        (parseFloat(datosCotizacion.costo_insumos) || 0) + 
                        (parseFloat(datosCotizacion.mano_obra) || 0) - 
                        (parseFloat(datosCotizacion.descuentos) || 0);

        const productosActualizados = datosCotizacion.productos.map(producto => ({
            ...producto,
            precio: Math.max(0, subtotal)
        }));

        const materialesCambiaron = JSON.stringify(materialesActualizados) !== JSON.stringify(datosCotizacion.materiales);
        const productosCambiaron = JSON.stringify(productosActualizados) !== JSON.stringify(datosCotizacion.productos);

        if (materialesCambiaron || productosCambiaron) {
            setDatosCotizacion(prev => ({
                ...prev,
                materiales: materialesActualizados,
                productos: productosActualizados
            }));
        }
    }, [datosCotizacion.materiales, datosCotizacion.productos, datosCotizacion.costo_insumos, datosCotizacion.mano_obra, datosCotizacion.descuentos]);

    useEffect(() => {
        calcularCostos();
    }, [calcularCostos]);

    const calcularResultadosFabricacion = () => {
        console.log("=== CÁLCULO PARA COTIZACIÓN ===");
        
        const costoMateriales = datosCotizacion.materiales.reduce((acc, m) => {
            const peso = parseFloat(m.peso_gramos) || 0;
            const precioGramo = parseFloat(m.precio_por_gramo) || 0;
            return acc + (peso * precioGramo);
        }, 0);
        
        const costoTotalProduccion = costoMateriales + 
                                (parseFloat(datosCotizacion.costo_insumos) || 0) + 
                                (parseFloat(datosCotizacion.mano_obra) || 0);

        console.log("Costo materiales:", costoMateriales);
        console.log("Costo total producción:", costoTotalProduccion);

        const subtotalProductos = datosCotizacion.productos.reduce((acc, p) => {
            const cantidad = parseInt(p.cantidad) || 0;
            const precioUnitario = costoTotalProduccion;
            return acc + (cantidad * precioUnitario);
        }, 0);


        const descuentos = parseFloat(datosCotizacion.descuentos) || 0;
        const subtotalConDescuento = subtotalProductos - descuentos;

        const isv = subtotalConDescuento * 0.15;


        const total = subtotalConDescuento + isv;


        const redondear = (valor) => Math.round(valor * 100) / 100;

        const resultadosFinales = {
            subtotal: redondear(subtotalConDescuento),
            isv: redondear(isv),
            total: redondear(total),
            anticipo: redondear(total * 0.5),
            pagoPendiente: redondear(total * 0.5),
            subtotalProductos: redondear(subtotalProductos)
        };

       

        return resultadosFinales;
    };

    const handleCalcular = () => {
        if (!validarDatos()) {
            alert("Por favor, complete todos los campos requeridos antes de calcular");
            return;
        }

        const nuevosResultados = calcularResultadosFabricacion();
        setResultados(nuevosResultados);
    };

    const guardarCotizacionEnBD = async () => {
        try {
            console.log("🔄 Guardando cotización...");
            
            if (!datosCotizacion.id_cliente || !datosCotizacion.id_empleado) {
                throw new Error("Cliente y empleado son requeridos");
            }

            const resultadosCalculados = calcularResultadosFabricacion();
            setResultados(resultadosCalculados);

            const fechaVencimiento = new Date();
            fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
            
            const cotizacionData = {
                id_cliente: parseInt(datosCotizacion.id_cliente),
                id_empleado: parseInt(datosCotizacion.id_empleado),
                fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
                direccion: datosCotizacion.direccion || "No especificada",
                telefono: datosCotizacion.telefono || "No especificado",
                rtn: datosCotizacion.rtn || "",
                subtotal: resultadosCalculados.subtotal.toFixed(2),
                descuento: (parseFloat(datosCotizacion.descuentos) || 0).toFixed(2),
                isv: resultadosCalculados.isv.toFixed(2),
                total: resultadosCalculados.total.toFixed(2),
                tipo_servicio: "FABRICACION",
                observaciones: datosCotizacion.observaciones || '',
                estado: "ACTIVA"
            };

            console.log("📤 Enviando datos:", cotizacionData);

            const endpoint = ENDPOINTS.cotizaciones;
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cotizacionData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Error del servidor:", errorText);
                throw new Error(`Error ${response.status}: No se pudo guardar la cotización`);
            }

            const responseData = await response.json();
            console.log('✅ Cotización guardada:', responseData);
            return responseData;
            
        } catch (error) {
            console.error('❌ Error:', error);
            throw error;
        }
    };

    const handleGenerarCotizacion = async () => {
        if (!validarDatos()) {
            alert('Por favor complete todos los campos requeridos antes de generar la cotización');
            return;
        }

        try {
            console.log("🚀 Iniciando generación de cotización...");
            handleCalcular();
            await new Promise(resolve => setTimeout(resolve, 100));

            let cotizacionGuardada = null;
            try {
                cotizacionGuardada = await guardarCotizacionEnBD();
                console.log("✅ Cotización guardada en BD:", cotizacionGuardada);
                
            } catch (dbError) {
                console.error("❌ Error al guardar en BD:", dbError);
            }

            const overlay = document.createElement('div');
            overlay.className = 'overlay-pdf';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.backgroundColor = 'white';
            overlay.style.zIndex = '9999';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'flex-start';
            overlay.style.overflow = 'auto';
            overlay.style.padding = '20px';

            const cotizacionContent = cotizacionRef.current.cloneNode(true);
            cotizacionContent.style.visibility = 'visible';
            cotizacionContent.style.opacity = '1';
            cotizacionContent.style.position = 'relative';
            cotizacionContent.style.left = '0';
            cotizacionContent.style.top = '0';
            cotizacionContent.style.width = '8.5in';
            cotizacionContent.style.minHeight = '11in';
            cotizacionContent.style.backgroundColor = 'white';
            cotizacionContent.style.padding = '0.4in';
            cotizacionContent.style.boxSizing = 'border-box';
            cotizacionContent.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';

            overlay.appendChild(cotizacionContent);
            document.body.appendChild(overlay);

            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(cotizacionContent, {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                logging: false,
                width: 816,
                height: 1056,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 816,
                windowHeight: 1056
            });

            document.body.removeChild(overlay);

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'in',
                format: 'letter'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'MEDIUM');
            
            const nombreArchivo = cotizacionGuardada 
                ? `cotizacion_${cotizacionGuardada.numero_cotizacion}.pdf`
                : `cotizacion_${Date.now()}.pdf`;
            
            pdf.save(nombreArchivo);
            
            if (cotizacionGuardada) {
                alert(`✅ Cotización generada y guardada exitosamente!\nNúmero: ${cotizacionGuardada.numero_cotizacion}\nLa cotización ahora aparece en la lista.`);
                
                setTimeout(() => {
                    if (onClose) onClose();
                }, 2000);
            } else {
                alert(`⚠️ PDF generado exitosamente, pero no se pudo guardar en la base de datos.\nError: ${dbError?.message || 'Desconocido'}`);
            }
            
        } catch (error) {
            console.error("❌ Error crítico:", error);
            alert(`❌ Error al generar la cotización: ${error.message}`);
        }
    };

    const obtenerDatosCliente = () => {
        const clienteSeleccionado = clientes.find(c => c.id_cliente === parseInt(datosCotizacion.id_cliente));
        return {
            nombre: clienteSeleccionado ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}` : '',
            direccion: datosCotizacion.direccion,
            telefono: datosCotizacion.telefono,
            rtn: datosCotizacion.rtn
        };
    };

    const handleActualizarDatos = (campo, valor) => {
        setDatosCotizacion(prev => ({
            ...prev,
            [campo]: valor
        }));
        
        if (errores[campo]) {
            setErrores(prev => ({
                ...prev,
                [campo]: ''
            }));
        }
    };

    const handleClienteChange = (idCliente) => {
        const clienteSeleccionado = clientes.find(c => c.id_cliente === idCliente);
        if (clienteSeleccionado) {
            setDatosCotizacion(prev => ({
                ...prev,
                id_cliente: idCliente,
                telefono: clienteSeleccionado.telefono || '',
                direccion: clienteSeleccionado.direccion || '',
                rtn: clienteSeleccionado.rtn || ''
            }));
        }
    };

    const handleAgregarProducto = () => {
        setDatosCotizacion(prev => ({
            ...prev,
            productos: [
                ...prev.productos,
                {
                    id: Date.now(),
                    codigo: '',
                    producto: '',
                    cantidad: 1,
                    precio: prev.productos[0]?.precio || 0,
                    descripcion: '',
                    tipoJoya: '',
                    tipoReparacion: ''
                }
            ]
        }));
    };

    const handleEliminarProducto = (id) => {
        if (datosCotizacion.productos.length === 1) return;
        setDatosCotizacion(prev => ({
            ...prev,
            productos: prev.productos.filter(producto => producto.id !== id)
        }));
    };

    const handleActualizarProducto = (id, campo, valor) => {
        setDatosCotizacion(prev => ({
            ...prev,
            productos: prev.productos.map(producto => 
                producto.id === id ? { ...producto, [campo]: valor } : producto
            )
        }));

        const errorKey = `producto_${id}_${campo}`;
        if (errores[errorKey]) {
            setErrores(prev => ({ ...prev, [errorKey]: '' }));
        }
    };

    const handleAgregarMaterial = () => {
        setDatosCotizacion(prev => ({
            ...prev,
            materiales: [
                ...prev.materiales,
                {
                    id: Date.now(),
                    tipo_material: '',
                    peso_gramos: '',
                    precio_por_gramo: '',
                    costo_total: 0
                }
            ]
        }));
    };

    const handleEliminarMaterial = (id) => {
        if (datosCotizacion.materiales.length === 1) return;
        setDatosCotizacion(prev => ({
            ...prev,
            materiales: prev.materiales.filter(material => material.id !== id)
        }));
    };

    const handleActualizarMaterial = (id, campo, valor) => {
        setDatosCotizacion(prev => ({
            ...prev,
            materiales: prev.materiales.map(material => 
                material.id === id ? { ...material, [campo]: valor } : material
            )
        }));

        const errorKey = `material_${id}_${campo}`;
        if (errores[errorKey]) {
            setErrores(prev => ({ ...prev, [errorKey]: '' }));
        }
    };

    const validarDatos = () => {
        const nuevosErrores = {};
        
        if (!datosCotizacion.id_cliente) nuevosErrores.id_cliente = 'Cliente es requerido';
        if (!datosCotizacion.id_empleado) nuevosErrores.id_empleado = 'Empleado es requerido';
        if (!datosCotizacion.fecha) nuevosErrores.fecha = 'Fecha es requerida';
        if (!datosCotizacion.telefono) nuevosErrores.telefono = 'Teléfono es requerido';
        if (!datosCotizacion.direccion) nuevosErrores.direccion = 'Dirección es requerida';
        
        datosCotizacion.productos.forEach((producto) => {
            if (!producto.codigo) nuevosErrores[`producto_${producto.id}_codigo`] = 'Código boceto es requerido';
            if (!producto.producto) nuevosErrores[`producto_${producto.id}_producto`] = 'Nombre del diseño es requerido';
            if (!producto.cantidad || producto.cantidad <= 0) nuevosErrores[`producto_${producto.id}_cantidad`] = 'Cantidad debe ser mayor a 0';
            if (!producto.descripcion) nuevosErrores[`producto_${producto.id}_descripcion`] = 'Descripción del boceto es requerida';
        });

        datosCotizacion.materiales.forEach((material) => {
            if (!material.tipo_material) nuevosErrores[`material_${material.id}_tipo_material`] = 'Tipo de material es requerido';
            if (!material.peso_gramos || material.peso_gramos <= 0) nuevosErrores[`material_${material.id}_peso_gramos`] = 'Peso en gramos es requerido';
            if (!material.precio_por_gramo || material.precio_por_gramo <= 0) nuevosErrores[`material_${material.id}_precio_por_gramo`] = 'Precio por gramo es requerido';
        });

        if (!datosCotizacion.costo_insumos || datosCotizacion.costo_insumos < 0) nuevosErrores.costo_insumos = 'Costo de insumos es requerido';
        if (!datosCotizacion.mano_obra || datosCotizacion.mano_obra < 0) nuevosErrores.mano_obra = 'Mano de obra es requerida';

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const calcularResumen = () => {
        const totalMateriales = datosCotizacion.materiales.reduce((sum, material) => sum + material.costo_total, 0);
        const totalInsumos = parseFloat(datosCotizacion.costo_insumos) || 0;
        const totalManoObra = parseFloat(datosCotizacion.mano_obra) || 0;
        const totalDescuentos = parseFloat(datosCotizacion.descuentos) || 0;
        const subtotal = totalMateriales + totalInsumos + totalManoObra - totalDescuentos;

        return {
            totalMateriales,
            totalInsumos,
            totalManoObra,
            totalDescuentos,
            subtotal: Math.max(0, subtotal)
        };
    };

    const resumen = calcularResumen();

    if (loading) {
        return (
            <div className="cotizacion-fabricacion-loading">
                <div className="loading-spinner"></div>
                <p>Cargando formato de cotización...</p>
            </div>
        );
    }

    return (
        <div className="cotizacion-fabricacion">
            {/* Header */}
            <div className="cotizacion-header">
                <h1>
                    {modoEdicion ? 'Editar Cotización de Fabricación' : 
                     cotizacion ? 'Ver Cotización de Fabricación' : 'Nueva Cotización de Fabricación'}
                </h1>
            </div>

            {/* Sección de Datos del Cliente */}
            <div className="seccion-cotizacion">
                <div className="seccion-header">
                    <h2>Datos del Cliente</h2>
                </div>
                
                <div className="seccion-contenido">
                    <DatosCliente
                        datosFactura={datosCotizacion}
                        clientes={clientes}
                        empleados={empleados}
                        onActualizar={handleActualizarDatos}
                        onClienteChange={handleClienteChange}
                        errores={errores}
                        onCambioCampo={(campo) => console.log(`Campo cambiado: ${campo}`)}
                    />
                </div>
            </div>

            {/* Sección de Detalle del Producto */}
            <div className="seccion-cotizacion">
                <div className="seccion-header">
                    <h2>Detalle del Producto</h2>
                    <button 
                        type="button"
                        className="btn-agregar"
                        onClick={handleAgregarProducto}
                    >
                        <FaPlus />
                        Agregar Producto
                    </button>
                </div>
                
                <div className="seccion-contenido">
                    {datosCotizacion.productos.map((producto, index) => (
                        <Producto
                            key={producto.id}
                            id={producto.id}
                            tipoFactura="FABRICACION"
                            cantidad={producto.cantidad}
                            precio={producto.precio}
                            codigo={producto.codigo}
                            producto={producto.producto}
                            descripcion={producto.descripcion}
                            tipoJoya={producto.tipoJoya}
                            tipoReparacion={producto.tipoReparacion}
                            onActualizar={handleActualizarProducto}
                            onBorrar={handleEliminarProducto}
                            errores={errores}
                            productoIndex={index}
                            productosStock={productosStock}
                        />
                    ))}
                </div>
            </div>

            {/* Sección de Detalles Adicionales */}
            <div className="seccion-cotizacion">
                <div className="seccion-header">
                    <h2>Detalles Adicionales</h2>
                </div>
                
                <div className="seccion-contenido">
                    {/* Materiales Utilizados */}
                    <div className="subseccion">
                        <div className="subseccion-header">
                            <h4>Materiales Utilizados</h4>
                            <button 
                                type="button"
                                className="btn-agregar"
                                onClick={handleAgregarMaterial}
                            >
                                <FaPlus />
                                Agregar Material
                            </button>
                        </div>

                        {datosCotizacion.materiales.map((material, index) => (
                            <Material
                                key={material.id}
                                id={material.id}
                                tipo_material={material.tipo_material}
                                peso_gramos={material.peso_gramos}
                                precio_por_gramo={material.precio_por_gramo}
                                costo_total={material.costo_total}
                                onActualizar={handleActualizarMaterial}
                                onBorrar={handleEliminarMaterial}
                                errores={errores}
                                materialIndex={index}
                                materialesStock={materialesStock}
                            />
                        ))}
                    </div>

                    {/* Costos Adicionales */}
                    <div className="subseccion">
                        <h4>Costos Adicionales</h4>
                        <div className="costos-adicionales-grid">
                            <div className="campo-item">
                                <label htmlFor="costo_insumos">Costo de Insumos (L.) *</label>
                                <input 
                                    type="number"
                                    id="costo_insumos"
                                    placeholder="Costo de insumos"
                                    value={datosCotizacion.costo_insumos}
                                    onChange={(e) => handleActualizarDatos('costo_insumos', parseFloat(e.target.value) || 0)}
                                    min="0"
                                    step="0.01"
                                    className={errores.costo_insumos ? 'campo-error' : ''}
                                />
                                {errores.costo_insumos && (
                                    <span className="mensaje-error">{errores.costo_insumos}</span>
                                )}
                            </div>

                            <div className="campo-item">
                                <label htmlFor="mano_obra">Mano de Obra (L.) *</label>
                                <input 
                                    type="number"
                                    id="mano_obra"
                                    placeholder="Costo de mano de obra"
                                    value={datosCotizacion.mano_obra}
                                    onChange={(e) => handleActualizarDatos('mano_obra', parseFloat(e.target.value) || 0)}
                                    min="0"
                                    step="0.01"
                                    className={errores.mano_obra ? 'campo-error' : ''}
                                />
                                {errores.mano_obra && (
                                    <span className="mensaje-error">{errores.mano_obra}</span>
                                )}
                            </div>

                            <div className="campo-item">
                                <label htmlFor="descuentos">Descuentos o Rebajas (L.)</label>
                                <input 
                                    type="number"
                                    id="descuentos"
                                    placeholder="Descuentos aplicados"
                                    value={datosCotizacion.descuentos}
                                    onChange={(e) => handleActualizarDatos('descuentos', parseFloat(e.target.value) || 0)}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Resumen de Costos */}
                    <div className="subseccion">
                        <h4>Resumen de Costos</h4>
                        <div className="resumen-costos">
                            <div className="costos-totales">
                                <div className="costo-total">
                                    <span>Total Materiales:</span>
                                    <span>L. {resumen.totalMateriales.toFixed(2)}</span>
                                </div>
                                <div className="costo-total">
                                    <span>Total Insumos:</span>
                                    <span>L. {resumen.totalInsumos.toFixed(2)}</span>
                                </div>
                                <div className="costo-total">
                                    <span>Mano de Obra:</span>
                                    <span>L. {resumen.totalManoObra.toFixed(2)}</span>
                                </div>
                                {resumen.totalDescuentos > 0 && (
                                    <div className="costo-total descuento">
                                        <span>Descuentos:</span>
                                        <span>- L. {resumen.totalDescuentos.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="costo-total total-final">
                                    <span>SUBTOTAL:</span>
                                    <span>L. {resumen.subtotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div className="subseccion">
                        <h4>Observaciones</h4>
                        <div className="campo-item-full">
                            <textarea 
                                id="observaciones"
                                placeholder="Agregue observaciones adicionales aquí (opcional)..."
                                value={datosCotizacion.observaciones}
                                onChange={(e) => handleActualizarDatos('observaciones', e.target.value)}
                                rows="4"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección de Resultados */}
            <div className="seccion-cotizacion">
                <div className="seccion-header">
                    <h2>Resultados</h2>
                </div>
                
                <div className="seccion-contenido">
                    <div className="tabla-resultados">
                        <table>
                            <tbody>
                                <tr>
                                    <td>Subtotal Productos:</td>
                                    <td>L. {(resultados.subtotalProductos || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Descuentos:</td>
                                    <td>L. {parseFloat(datosCotizacion.descuentos || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Subtotal con Descuento:</td>
                                    <td>L. {(resultados.subtotal || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>ISV (15%):</td>
                                    <td>L. {(resultados.isv || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Total:</td>
                                    <td>L. {(resultados.total || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Anticipo (50%):</td>
                                    <td>L. {(resultados.anticipo || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Pago Pendiente:</td>
                                    <td>L. {(resultados.pagoPendiente || 0).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Botones con estilo PILL */}
            <div className="seccion-cotizacion">
                <div className="seccion-contenido">
                    <div className="botones-cotizacion-container">
                        <button className="btn-pill btn-pill-secondary" onClick={handleCalcular}>
                            <FaCalculator />
                            Calcular Total
                        </button>
                        <button className="btn-pill btn-pill-danger" onClick={onClose}>
                            <FaTimesCircle />
                            Cancelar
                        </button>
                        <button className="btn-pill btn-pill-success" onClick={handleGenerarCotizacion}>
                            <FaFilePdf />
                            Generar Cotización
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenedor para PDF (oculto) */}
            <div style={{ 
                position: 'fixed',
                top: '0',
                left: '0', 
                width: '8.5in',
                minHeight: '11in',
                backgroundColor: 'white',
                zIndex: '9998',
                visibility: 'hidden',
                pointerEvents: 'none'
            }}>
                <div ref={cotizacionRef} style={{ visibility: 'visible' }}>
                    <PDFCotizacion
                        tipoCotizacion="FABRICACION"
                        datosCliente={obtenerDatosCliente()}
                        productos={datosCotizacion.productos}
                        materiales={datosCotizacion.materiales}
                        resultados={resultados}
                        descuentos={datosCotizacion.descuentos}
                        datosCotizacion={datosCotizacion}
                        costoInsumos={datosCotizacion.costo_insumos}
                        manoObra={datosCotizacion.mano_obra}
                    />
                </div>
            </div>
        </div>
    );
}