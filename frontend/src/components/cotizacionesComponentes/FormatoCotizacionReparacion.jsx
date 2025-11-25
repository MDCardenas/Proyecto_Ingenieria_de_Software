// components/cotizacionesComponentes/FormatoCotizacionReparacion.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaCalculator, FaTimesCircle, FaFilePdf } from 'react-icons/fa';
import DatosCliente from '../FacturacionModule/DatosCliente.jsx';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import PDFCotizacionReparacion from './PDFCotizacionReparacion.jsx';
import Material from './Material.jsx';
import "../../styles/scss/components/_cotizacionReparacion.scss";

export default function FormatoCotizacionReparacion({ 
    cotizacion, 
    modoEdicion, 
    onClose, 
    onSave 
}) {
    // REF para el PDF
    const cotizacionRef = useRef();

    // OPCIONES PARA LOS SELECT
    const opcionesTipoJoya = [
        { value: '', label: 'Seleccione tipo de joya' },
        { value: 'ANILLO', label: 'Anillo' },
        { value: 'CADENA', label: 'Cadena' },
        { value: 'PULSERA', label: 'Pulsera' },
        { value: 'ARETES', label: 'Aretes' },
        { value: 'DIJE', label: 'Dije' },
        { value: 'OTRO', label: 'Otro' }
    ];

    const opcionesTipoReparacion = [
        { value: '', label: 'Seleccione tipo de reparación' },
        { value: 'SOLDADURA', label: 'Soldadura' },
        { value: 'LIMPIEZA_PROFESIONAL', label: 'Limpieza Profesional' },
        { value: 'ENGARSE_PIEDRAS', label: 'Engarse de Piedras' },
        { value: 'PULIDO_BRILLADO', label: 'Pulido y Brillado' },
        { value: 'AJUSTE_TAMAÑO', label: 'Ajuste de Tamaño' },
        { value: 'OTRO', label: 'Otro' }
    ];

    const [datosCotizacion, setDatosCotizacion] = useState({
        id_cliente: '',
        id_empleado: '',
        fecha: new Date().toISOString().split('T')[0],
        telefono: '',
        direccion: '',
        rtn: '',
        productos: [{
            id: Date.now(),
            tipoJoya: '',
            tipoReparacion: '',
            cantidad: 1,
            descripcion: ''
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
        observaciones: '',
        imagen_referencia: null,
        imagen_preview: null
    });

    // Estado para resultados
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
    const [loading, setLoading] = useState(true);
    const [errores, setErrores] = useState({});

    // Cargar datos iniciales
    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    // Si estamos editando, cargar los datos de la cotización
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
                    tipoJoya: prod.tipoJoya || '',
                    tipoReparacion: prod.tipoReparacion || '',
                    cantidad: prod.cantidad || 1,
                    descripcion: prod.descripcion || ''
                })) || [{
                    id: Date.now(),
                    tipoJoya: '',
                    tipoReparacion: '',
                    cantidad: 1,
                    descripcion: ''
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
            
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            setMaterialesStock([]);
        } finally {
            setLoading(false);
        }
    };

    // CALCULOS AUTOMATICOS
    const calcularCostos = useCallback(() => {
        const materialesActualizados = datosCotizacion.materiales.map(material => ({
            ...material,
            costo_total: (parseFloat(material.peso_gramos) || 0) * (parseFloat(material.precio_por_gramo) || 0)
        }));

        const materialesCambiaron = JSON.stringify(materialesActualizados) !== JSON.stringify(datosCotizacion.materiales);

        if (materialesCambiaron) {
            setDatosCotizacion(prev => ({
                ...prev,
                materiales: materialesActualizados
            }));
        }
    }, [datosCotizacion.materiales]);

    useEffect(() => {
        calcularCostos();
    }, [calcularCostos]);

    // CALCULAR RESULTADOS PARA REPARACIÓN
    const calcularResultadosReparacion = () => {
        // Calcular costo total de materiales
        const costoMateriales = datosCotizacion.materiales.reduce(
            (acc, m) => acc + (parseFloat(m.costo_total) || 0), 
            0
        );

        // Calcular costo total (materiales + insumos + mano de obra)
        const costoTotal = costoMateriales + 
                          (parseFloat(datosCotizacion.costo_insumos) || 0) + 
                          (parseFloat(datosCotizacion.mano_obra) || 0);

        // Aplicar descuentos
        const descuentos = parseFloat(datosCotizacion.descuentos) || 0;
        const subtotalConDescuento = Math.max(0, costoTotal - descuentos);
        
        // Calcular ISV (15%)
        const isv = subtotalConDescuento * 0.15;
        
        // Calcular total
        const total = subtotalConDescuento + isv;
        
        // Calcular anticipo (50%) y pago pendiente
        const anticipo = total * 0.5;
        const pagoPendiente = total - anticipo;

        // Redondear resultados
        const redondear = (valor) => Math.round(valor * 100) / 100;

        return {
            subtotal: redondear(subtotalConDescuento),
            isv: redondear(isv),
            total: redondear(total),
            anticipo: redondear(anticipo),
            pagoPendiente: redondear(pagoPendiente)
        };
    };

    const handleCalcular = () => {
        if (!validarDatos()) {
            alert("Por favor, complete todos los campos requeridos antes de calcular");
            return;
        }

        const nuevosResultados = calcularResultadosReparacion();
        setResultados(nuevosResultados);
    };

    // FUNCIONES PARA MANEJAR DATOS GENERALES
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
        const clienteSeleccionado = clientes.find(c => c.id_cliente === parseInt(idCliente));
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

    // FUNCIONES PARA MANEJAR PRODUCTOS (REPARACIONES)
    const handleAgregarProducto = () => {
        setDatosCotizacion(prev => ({
            ...prev,
            productos: [
                ...prev.productos,
                {
                    id: Date.now(),
                    tipoJoya: '',
                    tipoReparacion: '',
                    cantidad: 1,
                    descripcion: ''
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

    // FUNCIONES PARA MANEJAR MATERIALES
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

    // VALIDACIÓN DE DATOS
    const validarDatos = () => {
        const nuevosErrores = {};
        
        // Validar datos del cliente
        if (!datosCotizacion.id_cliente) nuevosErrores.id_cliente = 'Cliente es requerido';
        if (!datosCotizacion.id_empleado) nuevosErrores.id_empleado = 'Empleado es requerido';
        if (!datosCotizacion.fecha) nuevosErrores.fecha = 'Fecha es requerida';
        if (!datosCotizacion.telefono) nuevosErrores.telefono = 'Teléfono es requerido';
        if (!datosCotizacion.direccion) nuevosErrores.direccion = 'Dirección es requerida';
        
        // Validar productos (reparaciones)
        datosCotizacion.productos.forEach((producto) => {
            if (!producto.tipoJoya) nuevosErrores[`producto_${producto.id}_tipoJoya`] = 'Tipo de joya es requerido';
            if (!producto.tipoReparacion) nuevosErrores[`producto_${producto.id}_tipoReparacion`] = 'Tipo de reparación es requerido';
            if (!producto.cantidad || producto.cantidad <= 0) nuevosErrores[`producto_${producto.id}_cantidad`] = 'Cantidad debe ser mayor a 0';
            if (!producto.descripcion) nuevosErrores[`producto_${producto.id}_descripcion`] = 'Descripción del daño es requerida';
        });

        // Validar materiales
        datosCotizacion.materiales.forEach((material) => {
            if (!material.tipo_material) nuevosErrores[`material_${material.id}_tipo_material`] = 'Tipo de material es requerido';
            if (!material.peso_gramos || material.peso_gramos <= 0) nuevosErrores[`material_${material.id}_peso_gramos`] = 'Peso en gramos es requerido';
            if (!material.precio_por_gramo || material.precio_por_gramo <= 0) nuevosErrores[`material_${material.id}_precio_por_gramo`] = 'Precio por gramo es requerido';
        });

        // Validar costos adicionales
        if (!datosCotizacion.costo_insumos || datosCotizacion.costo_insumos < 0) nuevosErrores.costo_insumos = 'Costo de insumos es requerido';
        if (!datosCotizacion.mano_obra || datosCotizacion.mano_obra < 0) nuevosErrores.mano_obra = 'Mano de obra es requerida';

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    // CÁLCULOS PARA EL RESUMEN
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

    // FUNCIONES PARA GUARDAR Y GENERAR PDF
    const guardarCotizacionEnBD = async () => {
        try {
            console.log("Preparando datos para guardar cotización de reparación...");
            
            if (!datosCotizacion.id_cliente || !datosCotizacion.id_empleado) {
                throw new Error("Cliente y empleado son requeridos");
            }

            // Calcular fecha de vencimiento (30 días desde hoy)
            const fechaVencimiento = new Date();
            fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
            const fechaVencimientoFormatted = fechaVencimiento.toISOString().split('T')[0];

            // ✅ CORREGIR: Usar SOLO FormData, eliminar cotizacionData
            const formData = new FormData();

            // Agregar datos básicos
            formData.append('id_cliente', datosCotizacion.id_cliente);
            formData.append('id_empleado', datosCotizacion.id_empleado);
            formData.append('fecha_vencimiento', fechaVencimientoFormatted);
            formData.append('direccion', datosCotizacion.direccion || "No especificada");
            formData.append('telefono', datosCotizacion.telefono || "No especificado");
            formData.append('rtn', datosCotizacion.rtn || "");
            formData.append('subtotal', resultados.subtotal.toFixed(2));
            formData.append('descuento', (parseFloat(datosCotizacion.descuentos) || 0).toFixed(2));
            formData.append('isv', resultados.isv.toFixed(2));
            formData.append('total', resultados.total.toFixed(2));
            formData.append('tipo_servicio', "REPARACION");
            formData.append('observaciones', datosCotizacion.observaciones || '');
            formData.append('estado', "ACTIVA");

            // ✅ CORREGIR: Agregar imagen si existe
            if (datosCotizacion.imagen_referencia) {
                formData.append('imagen_referencia', datosCotizacion.imagen_referencia);
                console.log("✅ Imagen incluida en FormData");
            }

            console.log("Enviando FormData con imagen...");

            const endpoint = 'http://20.64.150.5:8000/api/cotizaciones/';
            
            // ✅ CORREGIR: Usar fetch correctamente con FormData
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData
                // NO incluir Content-Type header - el browser lo setea automáticamente
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error del servidor:", response.status, errorText);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const responseData = await response.json();
            console.log('✅ Cotización de reparación guardada en BD:', responseData);
            return responseData;
            
        } catch (error) {
            console.error('Error guardando cotización de reparación:', error);
            throw error;
        }
    };

    const handleGenerarCotizacion = async () => {
        if (!validarDatos()) {
            alert('Por favor complete todos los campos requeridos antes de generar la cotización');
            return;
        }

        try {
            // Calcular resultados antes de generar
            handleCalcular();

            // Crear overlay para la generación del PDF
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
            overlay.style.flexDirection = 'column';
            overlay.style.alignItems = 'center';
            overlay.style.overflow = 'auto';
            overlay.style.padding = '20px';

            // Crear contenedores separados para cada página
            const pagina1Container = document.createElement('div');
            pagina1Container.style.width = '8.5in';
            pagina1Container.style.minHeight = '11in';
            pagina1Container.style.backgroundColor = 'white';
            pagina1Container.style.padding = '0.4in';
            pagina1Container.style.boxSizing = 'border-box';
            pagina1Container.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
            pagina1Container.style.marginBottom = '20px';

            const pagina2Container = document.createElement('div');
            if (datosCotizacion.imagen_preview) {
                pagina2Container.style.width = '8.5in';
                pagina2Container.style.minHeight = '11in';
                pagina2Container.style.backgroundColor = 'white';
                pagina2Container.style.padding = '0.4in';
                pagina2Container.style.boxSizing = 'border-box';
                pagina2Container.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
            }

            // Clonar el contenido
            const cotizacionContent = cotizacionRef.current.cloneNode(true);
            
            // Separar las páginas
            const pagina1 = cotizacionContent.querySelector('.pagina-1');
            const pagina2 = cotizacionContent.querySelector('.pagina-2');

            // Asegurar que las páginas sean visibles
            if (pagina1) {
                pagina1.style.visibility = 'visible';
                pagina1.style.opacity = '1';
                pagina1.style.position = 'relative';
                pagina1.style.left = '0';
                pagina1.style.top = '0';
                pagina1Container.appendChild(pagina1);
            }

            overlay.appendChild(pagina1Container);

            if (pagina2 && datosCotizacion.imagen_preview) {
                pagina2.style.visibility = 'visible';
                pagina2.style.opacity = '1';
                pagina2.style.position = 'relative';
                pagina2.style.left = '0';
                pagina2.style.top = '0';
                pagina2Container.appendChild(pagina2);
                overlay.appendChild(pagina2Container);
            }

            document.body.appendChild(overlay);

            await new Promise(resolve => setTimeout(resolve, 500));

            // Crear PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'in',
                format: 'letter'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Convertir página 1
            const canvas1 = await html2canvas(pagina1Container, {
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

            const imgData1 = canvas1.toDataURL('image/jpeg', 0.95);
            pdf.addImage(imgData1, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'MEDIUM');

            // Convertir página 2 si existe
            if (pagina2 && datosCotizacion.imagen_preview) {
                pdf.addPage();
                const canvas2 = await html2canvas(pagina2Container, {
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
                const imgData2 = canvas2.toDataURL('image/jpeg', 0.95);
                pdf.addImage(imgData2, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'MEDIUM');
            }

            document.body.removeChild(overlay);

            // GUARDAR EN BASE DE DATOS
            let cotizacionGuardada = null;
            let guardadoExitoso = false;
            
            try {
                cotizacionGuardada = await guardarCotizacionEnBD();
                guardadoExitoso = true;
                
            } catch (dbError) {
                console.warn("Cotización no se pudo guardar en BD, pero se generará PDF:", dbError);
                guardadoExitoso = false;
            }

            // Descargar PDF
            const nombreArchivo = cotizacionGuardada 
                ? `cotizacion_reparacion_${cotizacionGuardada.numero_cotizacion}.pdf`
                : `cotizacion_reparacion_${Date.now()}.pdf`;
            
            pdf.save(nombreArchivo);
            
            // Mostrar mensaje apropiado
            if (guardadoExitoso && cotizacionGuardada) {
                alert(`✅ Cotización de reparación generada y guardada exitosamente!\nNúmero: ${cotizacionGuardada.numero_cotizacion}\nLa cotización ahora aparece en la lista de cotizaciones.`);
                
                setTimeout(() => {
                    if (onClose) onClose();
                }, 2000);
                
            } else {
                alert(`⚠️ Cotización generada exitosamente! (No se pudo guardar en la base de datos)\nEl formulario se mantiene para que pueda corregir y reintentar.`);
            }
            
        } catch (error) {
            console.error("Error al generar cotización:", error);
            const existingOverlay = document.querySelector('.overlay-pdf');
            if (existingOverlay) {
                document.body.removeChild(existingOverlay);
            }
            alert(`❌ Error al generar la cotización: ${error.message}\nEl formulario se mantiene para que pueda corregir los errores.`);
        }
    };

    // Función para obtener datos del cliente
    const obtenerDatosCliente = () => {
        const clienteSeleccionado = clientes.find(c => c.id_cliente === parseInt(datosCotizacion.id_cliente));
        return {
            nombre: clienteSeleccionado ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}` : '',
            direccion: datosCotizacion.direccion,
            telefono: datosCotizacion.telefono,
            rtn: datosCotizacion.rtn
        };
    };

    // FUNCIÓN PARA MANEJAR LA IMAGEN
    const handleImagenChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar que sea una imagen
            if (!file.type.startsWith('image/')) {
                alert('Por favor seleccione un archivo de imagen válido');
                return;
            }

            // Validar tamaño (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('La imagen no debe superar los 5MB');
                return;
            }

            // Crear preview Y guardar el archivo
            const reader = new FileReader();
            reader.onload = (e) => {
                setDatosCotizacion(prev => ({
                    ...prev,
                    imagen_referencia: file, // ✅ GUARDAR EL ARCHIVO, no el base64
                    imagen_preview: e.target.result // Preview para mostrar
                }));
            };
            reader.readAsDataURL(file);
            
            console.log("📁 Archivo seleccionado:", file.name, file.size, file.type);
        }
    };

    // FUNCIÓN PARA ELIMINAR LA IMAGEN
    const handleEliminarImagen = () => {
        setDatosCotizacion(prev => ({
            ...prev,
            imagen_referenciada: null,
            imagen_preview: null
        }));
    };

    if (loading) {
        return (
            <div className="cotizacion-reparacion-loading">
                <div className="loading-spinner"></div>
                <p>Cargando formato de cotización de reparación...</p>
            </div>
        );
    }

    return (
        <div className="cotizacion-reparacion">
            {/* Header */}
            <div className="cotizacion-header">
                <h1>
                    {modoEdicion ? 'Editar Cotización de Reparación' : 
                     cotizacion ? 'Ver Cotización de Reparación' : 'Nueva Cotización de Reparación'}
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

            {/* Sección de Detalles de Reparación */}
            <div className="seccion-cotizacion">
                <div className="seccion-header">
                    <h2>Detalles de Reparación</h2>
                    <button 
                        type="button"
                        className="btn-agregar"
                        onClick={handleAgregarProducto}
                    >
                        <FaPlus />
                        Agregar Joya
                    </button>
                </div>
                
                <div className="seccion-contenido">
                    {datosCotizacion.productos.map((producto, index) => (
                        <div key={producto.id} className="producto-bloque">
                            <div className="producto-header">
                                <h4>Joya #{index + 1}</h4>
                                {datosCotizacion.productos.length > 1 && (
                                    <button 
                                        type="button"
                                        className="btn-eliminar"
                                        onClick={() => handleEliminarProducto(producto.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                            
                            <div className="producto-contenido">
                                <div className="producto-fila">
                                    <div className="campo-producto">
                                        <label>Tipo de Joya *</label>
                                        <select
                                            value={producto.tipoJoya}
                                            onChange={(e) => handleActualizarProducto(producto.id, 'tipoJoya', e.target.value)}
                                            className={errores[`producto_${producto.id}_tipoJoya`] ? 'campo-error' : ''}
                                        >
                                            {opcionesTipoJoya.map(opcion => (
                                                <option key={opcion.value} value={opcion.value}>
                                                    {opcion.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errores[`producto_${producto.id}_tipoJoya`] && (
                                            <span className="mensaje-error">{errores[`producto_${producto.id}_tipoJoya`]}</span>
                                        )}
                                    </div>

                                    <div className="campo-producto">
                                        <label>Tipo de Reparación *</label>
                                        <select
                                            value={producto.tipoReparacion}
                                            onChange={(e) => handleActualizarProducto(producto.id, 'tipoReparacion', e.target.value)}
                                            className={errores[`producto_${producto.id}_tipoReparacion`] ? 'campo-error' : ''}
                                        >
                                            {opcionesTipoReparacion.map(opcion => (
                                                <option key={opcion.value} value={opcion.value}>
                                                    {opcion.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errores[`producto_${producto.id}_tipoReparacion`] && (
                                            <span className="mensaje-error">{errores[`producto_${producto.id}_tipoReparacion`]}</span>
                                        )}
                                    </div>

                                    <div className="campo-producto">
                                        <label>Cantidad *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={producto.cantidad}
                                            onChange={(e) => handleActualizarProducto(producto.id, 'cantidad', parseInt(e.target.value) || 1)}
                                            className={errores[`producto_${producto.id}_cantidad`] ? 'campo-error' : ''}
                                        />
                                        {errores[`producto_${producto.id}_cantidad`] && (
                                            <span className="mensaje-error">{errores[`producto_${producto.id}_cantidad`]}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="campo-descripcion">
                                    <label>Descripción del Daño *</label>
                                    <textarea 
                                        rows="3" 
                                        placeholder="Describa el daño o problema de la joya..."
                                        value={producto.descripcion}
                                        onChange={(e) => handleActualizarProducto(producto.id, 'descripcion', e.target.value)}
                                        className={errores[`producto_${producto.id}_descripcion`] ? 'campo-error' : ''}
                                    />
                                    {errores[`producto_${producto.id}_descripcion`] && (
                                        <span className="mensaje-error">{errores[`producto_${producto.id}_descripcion`]}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sección de Imagen de Referencia */}
            <div className="seccion-cotizacion">
                <div className="seccion-header">
                    <h2>Imagen de Referencia</h2>
                </div>
                
                <div className="seccion-contenido">
                    <div className="subseccion">
                        <div className="campo-imagen">
                            <label htmlFor="imagen_referencia" className="label-imagen">
                                Subir imagen de la joya a reparar
                                <span className="texto-ayuda">(Opcional - Formatos: JPG, PNG, GIF - Máx: 5MB)</span>
                            </label>
                            
                            <input
                                type="file"
                                id="imagen_referencia"
                                accept="image/*"
                                onChange={handleImagenChange}
                                className="input-imagen"
                            />
                            
                            {/* Preview de la imagen */}
                            {datosCotizacion.imagen_preview && (
                                <div className="imagen-preview-container">
                                    <div className="imagen-preview-header">
                                        <span>Vista previa:</span>
                                        <button 
                                            type="button"
                                            className="btn-eliminar-imagen"
                                            onClick={handleEliminarImagen}
                                        >
                                            <FaTrash />
                                            Eliminar
                                        </button>
                                    </div>
                                    <img 
                                        src={datosCotizacion.imagen_preview} 
                                        alt="Preview de la joya a reparar"
                                        className="imagen-preview"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
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
                                    <td>Subtotal:</td>
                                    <td>L. {resultados.subtotal.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Descuentos:</td>
                                    <td>L. {parseFloat(datosCotizacion.descuentos || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Subtotal con Descuento:</td>
                                    <td>L. {resultados.subtotal.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>ISV (15%):</td>
                                    <td>L. {resultados.isv.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Total:</td>
                                    <td>L. {resultados.total.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Anticipo (50%):</td>
                                    <td>L. {resultados.anticipo.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Pago Pendiente:</td>
                                    <td>L. {resultados.pagoPendiente.toFixed(2)}</td>
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
                    <PDFCotizacionReparacion
                        tipoCotizacion="REPARACION"
                        datosCliente={obtenerDatosCliente()}
                        productos={datosCotizacion.productos}
                        materiales={datosCotizacion.materiales}
                        resultados={resultados}
                        descuentos={datosCotizacion.descuentos}
                        datosCotizacion={datosCotizacion}
                        costoInsumos={datosCotizacion.costo_insumos}
                        manoObra={datosCotizacion.mano_obra}
                        imagen_referencia={datosCotizacion.imagen_preview}
                    />
                </div>
            </div>
        </div>
    );
}