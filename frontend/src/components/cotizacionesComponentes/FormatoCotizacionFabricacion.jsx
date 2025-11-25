// components/cotizacionesComponentes/FormatoCotizacionFabricacion.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaSearch, FaTimes, FaCalculator, FaFilePdf, FaTimesCircle } from 'react-icons/fa';
import { normalizeText } from '../../utils/normalize.js';
import Producto from '../FacturacionModule/Producto.jsx';
import Material from './Material.jsx';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PDFCotizacion from './PDFCotizacion.jsx';

import "../../styles/scss/components/_cotizacionFabricacion.scss";

// ============================================
// UTILIDADES DE VALIDACIÓN CON REGEX
// ============================================
const validaciones = {
    // Solo letras, espacios, acentos y Ñ
    soloLetras: (valor) => /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]*$/.test(valor),
    
    // Solo números y puntos decimales
    soloNumeros: (valor) => /^[0-9.]*$/.test(valor),
    
    // Solo números enteros positivos
    soloEnterosPositivos: (valor) => /^[0-9]*$/.test(valor),
    
    // Código alfanumérico (letras, números, guiones)
    codigoProducto: (valor) => /^[A-Z0-9\-]*$/.test(valor),
    
    // Nombre de producto (letras, números, espacios, guiones)
    nombreProducto: (valor) => /^[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s\-]*$/.test(valor),
    
    // Email válido
    email: (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor),
    
    // Teléfono Honduras (8 dígitos, permite guión)
    telefono: (valor) => /^[0-9]{4}-?[0-9]{4}$/.test(valor),
    
    // RTN Honduras (14 dígitos con guiones)
    rtn: (valor) => /^\d{4}-\d{4}-\d{5}-\d{1}$/.test(valor),
    
    // Número de Identidad Honduras (13 dígitos con guiones)
    numeroIdentidad: (valor) => /^\d{4}-\d{4}-\d{5}$/.test(valor),
    
    // Dirección (debe contener letras, puede tener números)
    direccion: (valor) => {
        if (!valor || valor.trim() === '') return true;
        const soloNumeros = /^\d+$/;
        const contieneLetras = /[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/.test(valor);
        return contieneLetras && !soloNumeros.test(valor);
    },
    
    // Descripción/Observaciones (alfanumérico con caracteres especiales permitidos)
    textoGeneral: (valor) => /^[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,;:()\-"'¿?¡!]*$/.test(valor),
    
    // Cantidad (números enteros mayores a 0)
    cantidad: (valor) => {
        const num = parseInt(valor);
        return !isNaN(num) && num > 0 && num < 1000;
    },
    
    // Precio/Costo (números decimales mayores o iguales a 0)
    precio: (valor) => {
        const num = parseFloat(valor);
        return !isNaN(num) && num >= 0 && num < 1000000;
    },
    
    // Peso en gramos (números decimales positivos)
    peso: (valor) => {
        const num = parseFloat(valor);
        return !isNaN(num) && num > 0 && num < 10000;
    }
};

// Función para sanitizar valores
const sanitizar = {
    texto: (valor) => valor.trim().replace(/\s+/g, ' '),
    textoMayusculas: (valor) => valor.trim().toUpperCase().replace(/\s+/g, ' '),
    numero: (valor) => parseFloat(valor) || 0,
    entero: (valor) => parseInt(valor) || 0,
    telefono: (valor) => valor.replace(/[^0-9-]/g, '').slice(0, 9),
    email: (valor) => valor.trim().toLowerCase(),
    codigoProducto: (valor) => valor.toUpperCase().replace(/[^A-Z0-9\-]/g, '').slice(0, 20)
};

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
                axios.get('http://20.64.150.5:8000/api/clientes/'),
                axios.get('http://20.64.150.5:8000/api/empleados/'),
                axios.get('http://20.64.150.5:8000/api/materiales/')
            ]);

            setClientes(clientesRes.data);
            setEmpleados(empleadosRes.data);
            setMaterialesStock(materialesRes.data);
            
            console.log("✅ Clientes cargados:", clientesRes.data.length);
            console.log("✅ Empleados cargados:", empleadosRes.data.length);
            console.log("✅ Materiales cargados:", materialesRes.data.length);
            
            try {
                const productosRes = await axios.get('http://20.64.150.5:8000/api/joyas/');
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

    // ============================================
    // VALIDACIÓN DE CAMPOS CON REGEX
    // ============================================
    const validarCampo = (nombre, valor) => {
        const erroresTemp = { ...errores };

        switch (nombre) {
            case 'telefono':
                if (valor && !validaciones.telefono(valor)) {
                    erroresTemp[nombre] = 'Formato de teléfono inválido (xxxx-xxxx)';
                } else {
                    delete erroresTemp[nombre];
                }
                break;

            case 'direccion':
                if (valor && !validaciones.direccion(valor)) {
                    erroresTemp[nombre] = 'La dirección debe contener texto, no solo números';
                } else {
                    delete erroresTemp[nombre];
                }
                break;

            case 'rtn':
                if (valor && !validaciones.rtn(valor)) {
                    erroresTemp[nombre] = 'Formato de RTN inválido (xxxx-xxxx-xxxxx-x)';
                } else {
                    delete erroresTemp[nombre];
                }
                break;

            case 'costo_insumos':
            case 'mano_obra':
            case 'descuentos':
                if (!validaciones.precio(valor)) {
                    erroresTemp[nombre] = 'Ingrese un valor numérico válido';
                } else {
                    delete erroresTemp[nombre];
                }
                break;

            case 'observaciones':
                if (valor && !validaciones.textoGeneral(valor)) {
                    erroresTemp[nombre] = 'Contiene caracteres no permitidos';
                } else if (valor && valor.length > 500) {
                    erroresTemp[nombre] = 'Máximo 500 caracteres';
                } else {
                    delete erroresTemp[nombre];
                }
                break;

            default:
                break;
        }

        setErrores(erroresTemp);
        return Object.keys(erroresTemp).length === 0;
    };

    // ============================================
    // MANEJADORES CON VALIDACIÓN
    // ============================================
    const handleActualizarDatos = (campo, valor) => {
        let valorProcesado = valor;

        switch (campo) {
            case 'telefono':
                valorProcesado = sanitizar.telefono(valor);
                if (!validaciones.soloNumeros(valorProcesado.replace('-', ''))) {
                    return;
                }
                break;

            case 'direccion':
                valorProcesado = sanitizar.texto(valor);
                if (valor && !validaciones.textoGeneral(valor)) {
                    return;
                }
                break;

            case 'observaciones':
                valorProcesado = sanitizar.texto(valor);
                if (valor && !validaciones.textoGeneral(valor)) {
                    return;
                }
                if (valor.length > 500) {
                    return;
                }
                break;

            case 'costo_insumos':
            case 'mano_obra':
            case 'descuentos':
                if (valor !== '' && !validaciones.soloNumeros(valor)) {
                    return;
                }
                valorProcesado = sanitizar.numero(valor);
                if (!validaciones.precio(valorProcesado)) {
                    return;
                }
                break;

            default:
                break;
        }

        validarCampo(campo, valorProcesado);
        
        setDatosCotizacion(prev => ({
            ...prev,
            [campo]: valorProcesado
        }));
    };

    // Validar producto
    const validarProducto = (producto) => {
        if (!producto.codigo || producto.codigo.trim() === '') {
            return 'El código del producto es requerido';
        }
        if (!validaciones.codigoProducto(producto.codigo)) {
            return 'Código inválido (solo letras mayúsculas, números y guiones)';
        }
        if (!producto.producto || producto.producto.trim() === '') {
            return 'El nombre del producto es requerido';
        }
        if (!validaciones.nombreProducto(producto.producto)) {
            return 'Nombre de producto inválido';
        }
        if (!validaciones.cantidad(producto.cantidad)) {
            return 'Cantidad inválida (debe ser mayor a 0)';
        }
        if (producto.descripcion && !validaciones.textoGeneral(producto.descripcion)) {
            return 'La descripción contiene caracteres no permitidos';
        }
        if (producto.descripcion && producto.descripcion.length > 200) {
            return 'La descripción no puede exceder 200 caracteres';
        }
        return null;
    };

    // Actualizar producto con validación
    const handleActualizarProducto = (id, campo, valor) => {
        let valorProcesado = valor;

        switch (campo) {
            case 'codigo':
                valorProcesado = sanitizar.codigoProducto(valor);
                if (!validaciones.codigoProducto(valorProcesado)) {
                    return;
                }
                break;

            case 'producto':
                valorProcesado = sanitizar.texto(valor);
                if (valor && !validaciones.nombreProducto(valor)) {
                    return;
                }
                if (valor.length > 100) {
                    return;
                }
                break;

            case 'cantidad':
                if (!validaciones.soloEnterosPositivos(valor)) {
                    return;
                }
                valorProcesado = sanitizar.entero(valor);
                if (!validaciones.cantidad(valorProcesado)) {
                    return;
                }
                break;

            case 'descripcion':
                valorProcesado = sanitizar.texto(valor);
                if (valor && !validaciones.textoGeneral(valor)) {
                    return;
                }
                if (valor.length > 200) {
                    return;
                }
                break;

            default:
                break;
        }

        setDatosCotizacion(prev => ({
            ...prev,
            productos: prev.productos.map(prod => 
                prod.id === id ? { ...prod, [campo]: valorProcesado } : prod
            )
        }));
    };

    // Validar material
    const validarMaterial = (material) => {
        if (!material.tipo_material) {
            return 'Debe seleccionar un tipo de material';
        }
        if (!material.peso_gramos || !validaciones.peso(material.peso_gramos)) {
            return 'Peso inválido (debe ser mayor a 0)';
        }
        if (!material.precio_por_gramo || !validaciones.precio(material.precio_por_gramo)) {
            return 'Precio por gramo inválido';
        }
        return null;
    };

    // Actualizar material con validación
    const handleActualizarMaterial = (id, campo, valor) => {
        let valorProcesado = valor;

        switch (campo) {
            case 'peso_gramos':
            case 'precio_por_gramo':
                if (valor !== '' && !validaciones.soloNumeros(valor)) {
                    return;
                }
                valorProcesado = parseFloat(valor) || '';
                if (valorProcesado !== '' && !validaciones.precio(valorProcesado)) {
                    return;
                }
                break;

            default:
                break;
        }

        setDatosCotizacion(prev => ({
            ...prev,
            materiales: prev.materiales.map(mat => 
                mat.id === id ? { ...mat, [campo]: valorProcesado } : mat
            )
        }));
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

    // CALCULAR RESULTADOS
    const calcularResultadosFabricacion = () => {
        const subtotalProductos = datosCotizacion.productos.reduce(
            (acc, prod) => acc + ((parseFloat(prod.precio) || 0) * (parseInt(prod.cantidad) || 0)),
            0
        );

        const descuentos = parseFloat(datosCotizacion.descuentos) || 0;
        const subtotal = Math.max(0, subtotalProductos - descuentos);
        const isv = subtotal * 0.15;
        const total = subtotal + isv;
        const anticipo = total * 0.50;
        const pagoPendiente = total - anticipo;

        setResultados({
            subtotalProductos: parseFloat(subtotalProductos.toFixed(2)),
            subtotal: parseFloat(subtotal.toFixed(2)),
            isv: parseFloat(isv.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            anticipo: parseFloat(anticipo.toFixed(2)),
            pagoPendiente: parseFloat(pagoPendiente.toFixed(2))
        });
    };

    const handleCalcular = () => {
        if (!validarFormularioCompleto()) {
            alert('Por favor corrija los errores en el formulario antes de calcular');
            return;
        }

        calcularResultadosFabricacion();
        alert('✅ Cálculo realizado correctamente');
    };

    // ============================================
    // VALIDACIÓN COMPLETA DEL FORMULARIO
    // ============================================
    const validarFormularioCompleto = () => {
        const erroresTemp = {};

        // Validar cliente
        if (!datosCotizacion.id_cliente) {
            erroresTemp.id_cliente = 'Debe seleccionar un cliente';
        }

        // Validar empleado
        if (!datosCotizacion.id_empleado) {
            erroresTemp.id_empleado = 'Debe seleccionar un empleado';
        }

        // Validar teléfono
        if (datosCotizacion.telefono && !validaciones.telefono(datosCotizacion.telefono)) {
            erroresTemp.telefono = 'Formato de teléfono inválido';
        }

        // Validar dirección
        if (datosCotizacion.direccion && !validaciones.direccion(datosCotizacion.direccion)) {
            erroresTemp.direccion = 'La dirección debe contener texto';
        }

        // Validar RTN
        if (datosCotizacion.rtn && !validaciones.rtn(datosCotizacion.rtn)) {
            erroresTemp.rtn = 'Formato de RTN inválido';
        }

        // Validar productos
        datosCotizacion.productos.forEach((prod, index) => {
            const error = validarProducto(prod);
            if (error) {
                erroresTemp[`producto_${index}`] = error;
            }
        });

        // Validar materiales
        datosCotizacion.materiales.forEach((mat, index) => {
            const error = validarMaterial(mat);
            if (error) {
                erroresTemp[`material_${index}`] = error;
            }
        });

        // Validar costos
        if (!validaciones.precio(datosCotizacion.costo_insumos)) {
            erroresTemp.costo_insumos = 'Costo de insumos inválido';
        }

        if (!validaciones.precio(datosCotizacion.mano_obra)) {
            erroresTemp.mano_obra = 'Costo de mano de obra inválido';
        }

        setErrores(erroresTemp);
        return Object.keys(erroresTemp).length === 0;
    };

    // AGREGAR PRODUCTO
    const handleAgregarProducto = () => {
        setDatosCotizacion(prev => ({
            ...prev,
            productos: [...prev.productos, {
                id: Date.now(),
                codigo: '',
                producto: '',
                cantidad: 1,
                precio: 0,
                descripcion: '',
                tipoJoya: '',
                tipoReparacion: ''
            }]
        }));
    };

    // ELIMINAR PRODUCTO
    const handleEliminarProducto = (id) => {
        if (datosCotizacion.productos.length === 1) {
            alert('Debe mantener al menos un producto');
            return;
        }
        setDatosCotizacion(prev => ({
            ...prev,
            productos: prev.productos.filter(prod => prod.id !== id)
        }));
    };

    // AGREGAR MATERIAL
    const handleAgregarMaterial = () => {
        setDatosCotizacion(prev => ({
            ...prev,
            materiales: [...prev.materiales, {
                id: Date.now(),
                tipo_material: '',
                peso_gramos: '',
                precio_por_gramo: '',
                costo_total: 0
            }]
        }));
    };

    // ELIMINAR MATERIAL
    const handleEliminarMaterial = (id) => {
        if (datosCotizacion.materiales.length === 1) {
            alert('Debe mantener al menos un material');
            return;
        }
        setDatosCotizacion(prev => ({
            ...prev,
            materiales: prev.materiales.filter(mat => mat.id !== id)
        }));
    };

    // GENERAR COTIZACIÓN PDF
    const handleGenerarCotizacion = async () => {
        if (!validarFormularioCompleto()) {
            alert('❌ Por favor corrija los errores en el formulario antes de generar la cotización');
            return;
        }

        if (resultados.total === 0) {
            alert('⚠️ Debe calcular el total antes de generar la cotización');
            return;
        }

        try {
            const elemento = cotizacionRef.current;
            if (!elemento) {
                alert('❌ Error: No se pudo encontrar el elemento para generar el PDF');
                return;
            }

            const canvas = await html2canvas(elemento, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'letter');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            const nombreArchivo = `Cotizacion_Fabricacion_${Date.now()}.pdf`;
            pdf.save(nombreArchivo);

            alert('✅ Cotización generada exitosamente');
            
            if (onSave) {
                await onSave({
                    ...datosCotizacion,
                    tipo_cotizacion: 'FABRICACION',
                    resultados
                });
            }

        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('❌ Error al generar la cotización. Por favor intente nuevamente.');
        }
    };

    // OBTENER DATOS DEL CLIENTE
    const obtenerDatosCliente = () => {
        const cliente = clientes.find(c => c.id === parseInt(datosCotizacion.id_cliente));
        const empleado = empleados.find(e => e.id === parseInt(datosCotizacion.id_empleado));

        return {
            nombreCliente: cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Sin cliente',
            identidadCliente: cliente?.numero_identidad || 'N/A',
            telefonoCliente: datosCotizacion.telefono || cliente?.telefono || 'N/A',
            direccionCliente: datosCotizacion.direccion || cliente?.direccion || 'N/A',
            rtnCliente: datosCotizacion.rtn || cliente?.rtn || 'N/A',
            nombreEmpleado: empleado ? `${empleado.nombre} ${empleado.apellido}` : 'Sin empleado',
            fecha: datosCotizacion.fecha
        };
    };

    // CALCULAR RESUMEN
    const resumen = {
        totalMateriales: datosCotizacion.materiales.reduce((acc, m) => acc + (parseFloat(m.costo_total) || 0), 0),
        totalInsumos: parseFloat(datosCotizacion.costo_insumos) || 0,
        totalManoObra: parseFloat(datosCotizacion.mano_obra) || 0,
        totalDescuentos: parseFloat(datosCotizacion.descuentos) || 0,
        subtotal: 0
    };
    resumen.subtotal = Math.max(0, resumen.totalMateriales + resumen.totalInsumos + resumen.totalManoObra - resumen.totalDescuentos);

    return (
        <div className="formato-cotizacion-container">
            <div className="formato-header">
                <h1>Cotización de Fabricación</h1>
                <p className="subtitle">Complete todos los campos marcados con (*)</p>
            </div>

            {/* Sección de Cliente */}
            <div className="seccion-cotizacion">
                <div className="seccion-header">
                    <h2>Información del Cliente</h2>
                </div>
                
                <div className="seccion-contenido">
                    <div className="datos-cliente-grid">
                        {/* Selección de Cliente */}
                        <div className="campo-item">
                            <label htmlFor="id_cliente">Cliente *</label>
                            <select
                                id="id_cliente"
                                value={datosCotizacion.id_cliente}
                                onChange={(e) => handleActualizarDatos('id_cliente', e.target.value)}
                                className={errores.id_cliente ? 'campo-error' : ''}
                            >
                                <option value="">Seleccione un cliente</option>
                                {clientes.map(cliente => (
                                    <option key={cliente.id} value={cliente.id}>
                                        {cliente.nombre} {cliente.apellido} - ID: {cliente.numero_identidad}
                                    </option>
                                ))}
                            </select>
                            {errores.id_cliente && (
                                <span className="mensaje-error">{errores.id_cliente}</span>
                            )}
                        </div>

                        {/* Selección de Empleado */}
                        <div className="campo-item">
                            <label htmlFor="id_empleado">Empleado/Vendedor *</label>
                            <select
                                id="id_empleado"
                                value={datosCotizacion.id_empleado}
                                onChange={(e) => handleActualizarDatos('id_empleado', e.target.value)}
                                className={errores.id_empleado ? 'campo-error' : ''}
                            >
                                <option value="">Seleccione un empleado</option>
                                {empleados.map(empleado => (
                                    <option key={empleado.id} value={empleado.id}>
                                        {empleado.nombre} {empleado.apellido} - ID: {empleado.id} - Usuario: {empleado.usuario}
                                    </option>
                                ))}
                            </select>
                            {errores.id_empleado && (
                                <span className="mensaje-error">{errores.id_empleado}</span>
                            )}
                        </div>

                        {/* Fecha */}
                        <div className="campo-item">
                            <label htmlFor="fecha">Fecha *</label>
                            <input
                                type="date"
                                id="fecha"
                                value={datosCotizacion.fecha}
                                onChange={(e) => handleActualizarDatos('fecha', e.target.value)}
                                className={errores.fecha ? 'campo-error' : ''}
                            />
                            {errores.fecha && (
                                <span className="mensaje-error">{errores.fecha}</span>
                            )}
                        </div>

                        {/* Teléfono */}
                        <div className="campo-item">
                            <label htmlFor="telefono">Teléfono</label>
                            <input
                                type="tel"
                                id="telefono"
                                placeholder="3322-0000"
                                value={datosCotizacion.telefono}
                                onChange={(e) => handleActualizarDatos('telefono', e.target.value)}
                                className={errores.telefono ? 'campo-error' : ''}
                            />
                            {errores.telefono && (
                                <span className="mensaje-error">{errores.telefono}</span>
                            )}
                            <small className="form-hint">Formato: xxxx-xxxx</small>
                        </div>

                        {/* Dirección */}
                        <div className="campo-item campo-item-full">
                            <label htmlFor="direccion">Dirección</label>
                            <input
                                type="text"
                                id="direccion"
                                placeholder="Dirección completa"
                                value={datosCotizacion.direccion}
                                onChange={(e) => handleActualizarDatos('direccion', e.target.value)}
                                className={errores.direccion ? 'campo-error' : ''}
                            />
                            {errores.direccion && (
                                <span className="mensaje-error">{errores.direccion}</span>
                            )}
                        </div>

                        {/* RTN */}
                        <div className="campo-item">
                            <label htmlFor="rtn">RTN</label>
                            <input
                                type="text"
                                id="rtn"
                                placeholder="xxxx-xxxx-xxxxx-x"
                                value={datosCotizacion.rtn}
                                onChange={(e) => handleActualizarDatos('rtn', e.target.value)}
                                className={errores.rtn ? 'campo-error' : ''}
                            />
                            {errores.rtn && (
                                <span className="mensaje-error">{errores.rtn}</span>
                            )}
                            <small className="form-hint">Formato: xxxx-xxxx-xxxxx-x</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección de Productos */}
            <div className="seccion-cotizacion">
                <div className="seccion-header">
                    <h2>Productos a Fabricar</h2>
                    <button className="btn-agregar" onClick={handleAgregarProducto}>
                        <FaPlus /> Agregar Producto
                    </button>
                </div>
                
                <div className="seccion-contenido">
                    {datosCotizacion.productos.map((producto, index) => (
                        <Producto 
                            key={producto.id}
                            producto={producto}
                            index={index}
                            productosStock={productosStock}
                            onActualizar={handleActualizarProducto}
                            onEliminar={handleEliminarProducto}
                            mostrarBotonEliminar={datosCotizacion.productos.length > 1}
                            error={errores[`producto_${index}`]}
                            modoFabricacion={true}
                        />
                    ))}
                </div>
            </div>

            {/* Sección de Materiales y Costos */}
            <div className="seccion-cotizacion">
                <div className="seccion-header">
                    <h2>Materiales y Costos</h2>
                </div>
                
                <div className="seccion-contenido">
                    {/* Materiales */}
                    <div className="subseccion">
                        <div className="subseccion-header">
                            <h4>Materiales Utilizados</h4>
                            <button className="btn-agregar-small" onClick={handleAgregarMaterial}>
                                <FaPlus /> Agregar Material
                            </button>
                        </div>

                        {datosCotizacion.materiales.map((material, index) => (
                            <Material
                                key={material.id}
                                material={material}
                                index={index}
                                materialesStock={materialesStock}
                                onActualizar={handleActualizarMaterial}
                                onEliminar={handleEliminarMaterial}
                                mostrarBotonEliminar={datosCotizacion.materiales.length > 1}
                                error={errores[`material_${index}`]}
                            />
                        ))}
                    </div>

                    {/* Costos Adicionales */}
                    <div className="subseccion">
                        <h4>Costos Adicionales</h4>
                        <div className="campos-costos">
                            <div className="campo-item">
                                <label htmlFor="costo_insumos">Costo de Insumos (L.) *</label>
                                <input 
                                    type="number"
                                    id="costo_insumos"
                                    placeholder="Costo de insumos adicionales"
                                    value={datosCotizacion.costo_insumos}
                                    onChange={(e) => handleActualizarDatos('costo_insumos', e.target.value)}
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
                                    onChange={(e) => handleActualizarDatos('mano_obra', e.target.value)}
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
                                    onChange={(e) => handleActualizarDatos('descuentos', e.target.value)}
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
                                placeholder="Agregue observaciones adicionales aquí (opcional, máx. 500 caracteres)..."
                                value={datosCotizacion.observaciones}
                                onChange={(e) => handleActualizarDatos('observaciones', e.target.value)}
                                rows="4"
                                maxLength="500"
                                className={errores.observaciones ? 'campo-error' : ''}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                                <small className="contador-caracteres">
                                    {datosCotizacion.observaciones.length}/500 caracteres
                                </small>
                                {errores.observaciones && (
                                    <span className="mensaje-error">{errores.observaciones}</span>
                                )}
                            </div>
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