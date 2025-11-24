import React, { useRef, useState, useEffect } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import DatosCliente from "./DatosCliente";
import Producto from "./Producto";
import DatosAdicionales from "./DatosAdicionales";
import FormatoFactura from "./FormatoFactura";
import ListaFacturas from "./ListaFacturas";

import "../../styles/scss/main.scss";
import "../../styles/scss/components/_formatofactura.scss";

export default function Facturacion({ onCancel }) {
  const facturaRef = useRef();
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [tipoFactura, setTipoFactura] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [materialesStock, setMaterialesStock] = useState([]);
  const [productosStock, setProductosStock] = useState([]);
  const [insumosStock, setInsumosStock] = useState([]);
  const [mostrarLista, setMostrarLista] = useState(true);

  // Estado para controlar la visualización del formato de factura
  const [mostrarFormatoFactura, setMostrarFormatoFactura] = useState(false);

  // Estado para los productos
  const [productos, setProductos] = useState(() => [{ 
    id: generarId(), 
    cantidad: 1, 
    precio: 0, 
    codigo: "", 
    producto: "", 
    descripcion: "",
    tipoJoya: "",
    tipoReparacion: "" 
  }]);

  // Estado para detalles adicionales
  const [materiales, setMateriales] = useState([{ 
    tipo: "", 
    peso: "", 
    precio: "", 
    costo: 0, 
    eliminando: false,
    codigo_material: null
  }]);
  const [costoInsumos, setCostoInsumos] = useState(0);
  const [manoObra, setManoObra] = useState(0);
  const [descuentos, setDescuentos] = useState(0);

  // Estado para resultados calculados
  const [resultados, setResultados] = useState({
    subtotal: 0,
    isv: 0,
    total: 0,
    anticipo: 0,
    pagoPendiente: 0,
  });

  // Estado para datos del formulario
  const [datosFactura, setDatosFactura] = useState({
    id_cliente: "",
    id_empleado: "",
    fecha: new Date().toISOString().split('T')[0],
    direccion: "",
    telefono: "",
    rtn: "",
    observaciones: ""
  });

  // Estado para errores de validación
  const [errores, setErrores] = useState({});

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      console.log("Iniciando carga de datos para facturación...");
      
      const endpoints = {
        clientes: 'http://localhost:8000/api/clientes/',
        empleados: 'http://localhost:8000/api/empleados/',
        materiales: 'http://localhost:8000/api/materiales/',
        productos: 'http://localhost:8000/api/joyas/'
      };

      const [clientesRes, empleadosRes, materialesRes, productosRes] = await Promise.all([
        fetch(endpoints.clientes).then(res => {
          if (!res.ok) throw new Error('Error al cargar clientes');
          return res.json();
        }),
        fetch(endpoints.empleados).then(res => {
          if (!res.ok) {
            console.warn("API de empleados no disponible");
            return [];
          }
          return res.json();
        }),
        fetch(endpoints.materiales).then(res => {
          if (!res.ok) {
            console.warn("API de materiales no disponible");
            return [];
          }
          return res.json();
        }),
        fetch(endpoints.productos).then(res => {
          if (!res.ok) {
            console.warn("API de productos no disponible");
            return [];
          }
          return res.json();
        })
      ]);

      console.log("Clientes cargados:", clientesRes.length);
      console.log("Empleados cargados:", empleadosRes.length);
      console.log("Materiales cargados:", materialesRes.length);
      console.log("Productos cargados:", productosRes.length);

      setClientes(clientesRes);
      setEmpleados(empleadosRes);
      setMaterialesStock(materialesRes);
      setProductosStock(productosRes);
      
    } catch (error) {
      console.error("Error cargando datos:", error);
      alert("Error al cargar los datos necesarios. Verifica la conexión con el servidor.");
    }
  };

  // Función para limpiar completamente el formulario
  const limpiarFormulario = () => {
    console.log("Limpiando formulario...");
    
    setProductos([{ 
      id: generarId(), 
      cantidad: 1, 
      precio: 0, 
      codigo: "", 
      producto: "", 
      descripcion: "",
      tipoJoya: "",
      tipoReparacion: "" 
    }]);

    setMateriales([{ 
      tipo: "", 
      peso: "", 
      precio: "", 
      costo: 0, 
      eliminando: false,
      codigo_material: null
    }]);

    setCostoInsumos(0);
    setManoObra(0);
    setDescuentos(0);

    setResultados({
      subtotal: 0,
      isv: 0,
      total: 0,
      anticipo: 0,
      pagoPendiente: 0,
    });

    setDatosFactura({
      id_cliente: "",
      id_empleado: "",
      fecha: new Date().toISOString().split('T')[0],
      direccion: "",
      telefono: "",
      rtn: "",
      observaciones: ""
    });

    setErrores({});

    console.log("Formulario limpiado exitosamente");
  };

  const validarCampos = () => {
    const nuevosErrores = {};

    if (!datosFactura.id_cliente) nuevosErrores.id_cliente = "Seleccione un cliente";
    if (!datosFactura.fecha) nuevosErrores.fecha = "La fecha es requerida";
    if (!datosFactura.direccion) nuevosErrores.direccion = "La dirección es requerida";
    if (!datosFactura.telefono) nuevosErrores.telefono = "El teléfono es requerido";

    if (tipoFactura === "VENTA" || tipoFactura === "FABRICACION") {
      productos.forEach((producto, index) => {
        if (!producto.codigo) nuevosErrores[`producto-${index}-codigo`] = "Código del producto requerido";
        if (!producto.producto) nuevosErrores[`producto-${index}-producto`] = "Nombre del producto requerido";
        if (!producto.cantidad || producto.cantidad <= 0) nuevosErrores[`producto-${index}-cantidad`] = "Cantidad debe ser mayor a 0";
        
        if (tipoFactura === "VENTA" && (!producto.precio || producto.precio <= 0)) {
          nuevosErrores[`producto-${index}-precio`] = "Precio debe ser mayor a 0";
        }
        
        if (!producto.descripcion) nuevosErrores[`producto-${index}-descripcion`] = "Descripción requerida";
      });
    }

    if (tipoFactura === "REPARACION") {
      productos.forEach((producto, index) => {
        if (!producto.tipoJoya) nuevosErrores[`producto-${index}-tipoJoya`] = "Tipo de joya requerido";
        if (!producto.tipoReparacion) nuevosErrores[`producto-${index}-tipoReparacion`] = "Tipo de reparación requerido";
        if (!producto.descripcion) nuevosErrores[`producto-${index}-descripcion`] = "Descripción requerida";
      });
    }

    if (tipoFactura === "FABRICACION" || tipoFactura === "REPARACION") {
      materiales.forEach((material, index) => {
        if (!material.tipo) nuevosErrores[`material-${index}-tipo`] = "Tipo de material requerido";
        if (!material.peso || material.peso <= 0) nuevosErrores[`material-${index}-peso`] = "Peso debe ser mayor a 0";
        if (!material.precio || material.precio <= 0) nuevosErrores[`material-${index}-precio`] = "Precio debe ser mayor a 0";
      });

      if (!costoInsumos || costoInsumos < 0) nuevosErrores.costoInsumos = "Costo de insumos requerido";
      if (!manoObra || manoObra < 0) nuevosErrores.manoObra = "Costo de mano de obra requerido";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const limpiarError = (campo) => {
    setErrores(prev => {
      const nuevosErrores = { ...prev };
      delete nuevosErrores[campo];
      return nuevosErrores;
    });
  };

  const guardarFacturaEnBD = async () => {
    try {
      console.log("Preparando datos para guardar factura...");
      
      if (!datosFactura.id_cliente || !datosFactura.id_empleado) {
        throw new Error("Cliente y empleado son requeridos");
      }

      const subtotalProductos = productos.reduce(
        (acc, p) => acc + (parseFloat(p.cantidad) || 0) * (parseFloat(p.precio) || 0),
        0
      );

      const descuento = parseFloat(descuentos) || 0;
      const subtotalConDescuento = subtotalProductos - descuento;
      
      // CORREGIR: Asegurar máximo 2 decimales
      const isv = parseFloat((subtotalConDescuento * 0.15).toFixed(2));
      const total = parseFloat((subtotalConDescuento + isv).toFixed(2));

      const facturaData = {
        id_cliente: parseInt(datosFactura.id_cliente),
        id_empleado: parseInt(datosFactura.id_empleado),
        fecha: datosFactura.fecha || new Date().toISOString().split('T')[0],
        direccion: datosFactura.direccion || "No especificada",
        telefono: datosFactura.telefono || "No especificado",
        rtn: datosFactura.rtn || "",
        subtotal: parseFloat(subtotalConDescuento.toFixed(2)), // También asegurar 2 decimales
        descuento: parseFloat(descuento.toFixed(2)),
        isv: isv,
        total: total,
        tipo_venta: tipoFactura,
        observaciones: datosFactura.observaciones || '',
        productos: productos.map(p => ({
          codigo: p.codigo || 1,
          producto: p.producto || 'Producto sin nombre',
          cantidad: parseInt(p.cantidad) || 1,
          precio: parseFloat((parseFloat(p.precio) || 0).toFixed(2)), // Asegurar 2 decimales
          descripcion: p.descripcion || 'Sin descripción'
        })),
        materiales: materiales.filter(m => m.tipo && m.peso && m.precio).map(m => ({
          tipo: m.tipo,
          peso: parseFloat((parseFloat(m.peso) || 0).toFixed(2)),
          precio: parseFloat((parseFloat(m.precio) || 0).toFixed(2)),
          costo: parseFloat((parseFloat(m.costo) || 0).toFixed(2))
        }))
      };

      console.log("Enviando datos de factura:", JSON.stringify(facturaData, null, 2));

      const endpoint = 'http://localhost:8000/api/facturas/crear-simple/';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(facturaData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error del servidor:", response.status, errorText);
        
        // Intentar parsear como JSON para ver el error detallado
        try {
          const errorJson = JSON.parse(errorText);
          console.error("Error detallado del backend:", errorJson);
        } catch {
          console.error("Error en texto plano:", errorText);
        }
        
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Factura guardada en BD:', responseData);
      return responseData;
      
    } catch (error) {
      console.error('Error guardando factura:', error);
      throw error;
    }
  };

  const generarPDF = async () => {
    if (!tipoFactura) {
      alert("Por favor, seleccione un tipo de factura primero");
      return;
    }

    if (!validarCampos()) {
      alert("Por favor, complete todos los campos requeridos antes de generar la factura");
      return;
    }

    try {
      handleCalcular();

      // Mostrar temporalmente el formato de factura para captura
      setMostrarFormatoFactura(true);
      
      // Esperar a que se renderice el componente
      await new Promise(resolve => setTimeout(resolve, 500));

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

      const facturaContent = facturaRef.current.cloneNode(true);
      facturaContent.style.visibility = 'visible';
      facturaContent.style.opacity = '1';
      facturaContent.style.position = 'relative';
      facturaContent.style.left = '0';
      facturaContent.style.top = '0';
      facturaContent.style.width = '8.5in';
      facturaContent.style.minHeight = '11in';
      facturaContent.style.backgroundColor = 'white';
      facturaContent.style.padding = '0.4in';
      facturaContent.style.boxSizing = 'border-box';
      facturaContent.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';

      overlay.appendChild(facturaContent);
      document.body.appendChild(overlay);

      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(facturaContent, {
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
      
      // Ocultar el formato de factura después de la captura
      setMostrarFormatoFactura(false);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'MEDIUM');
      
      let resultadoBD = null;
      let facturaGuardada = false;
      
      try {
        resultadoBD = await guardarFacturaEnBD();
        facturaGuardada = true;
      } catch (dbError) {
        console.warn("Factura no se pudo guardar en BD, pero se generará PDF:", dbError);
        facturaGuardada = false;
      }

      const nombreArchivo = resultadoBD 
        ? `factura_${tipoFactura}_${resultadoBD.numero_factura}.pdf`
        : `factura_${tipoFactura}_${Date.now()}.pdf`;
      
      pdf.save(nombreArchivo);
      
      if (resultadoBD) {
        alert(`✅ Factura generada y guardada exitosamente! Número: ${resultadoBD.numero_factura}\nEl formulario se ha limpiado para una nueva factura.`);
        
        setTimeout(() => {
          limpiarFormulario();
        }, 1000);
        
      } else {
        alert(`⚠️ Factura generada exitosamente! (No se pudo guardar en la base de datos)\nEl formulario se mantiene por si desea corregir y reintentar.`);
      }
      
    } catch (error) {
      console.error("Error al generar factura:", error);
      const existingOverlay = document.querySelector('.overlay-pdf');
      if (existingOverlay) {
        document.body.removeChild(existingOverlay);
      }
      // Asegurarse de ocultar el formato de factura en caso de error
      setMostrarFormatoFactura(false);
      alert(`❌ Error al generar la factura: ${error.message}\nEl formulario se mantiene para que pueda corregir los errores.`);
    }
  };

  function generarId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  const handleGenerarFactura = () => {
    generarPDF();
  };

  const handleNuevaFactura = () => {
    setMostrarLista(false);
    setMostrarOpciones(true);
    setTipoFactura(null);
    limpiarFormulario();
  };

  const handleSeleccion = (tipo) => {
    setTipoFactura(tipo);
    setMostrarOpciones(false);
  };

  const agregarProducto = () => {
    setProductos((prev) => [...prev, { 
      id: generarId(), 
      cantidad: 1, 
      precio: 0, 
      codigo: "", 
      producto: "", 
      descripcion: ""
    }]);
  };

  const borrarProducto = (id) => {
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  const actualizarProducto = (id, campo, valor) => {
    setProductos(prev => prev.map(p => p.id === id ? {...p, [campo]: valor} : p));
    const productoIndex = productos.findIndex(p => p.id === id);
    if (productoIndex !== -1) {
      limpiarError(`producto-${productoIndex}-${campo}`);
    }
  };

  const actualizarDatosFactura = (campo, valor) => {
    setDatosFactura(prev => ({ ...prev, [campo]: valor }));
    limpiarError(campo);
  };

  const actualizarMaterial = (index, campo, valor) => {
    setMateriales((prev) =>
      prev.map((m, i) => {
        if (i === index) {
          const nuevoMaterial = { ...m, [campo]: valor };
          
          if (campo === "peso" || campo === "precio") {
            const pesoNum = parseFloat(campo === "peso" ? valor : nuevoMaterial.peso) || 0;
            const precioNum = parseFloat(campo === "precio" ? valor : nuevoMaterial.precio) || 0;
            nuevoMaterial.costo = pesoNum * precioNum;
          }
          
          if (campo === "tipo" && valor) {
            const materialStock = materialesStock.find(mat => mat.nombre === valor);
            if (materialStock) {
              nuevoMaterial.codigo_material = materialStock.codigo_material;
              nuevoMaterial.precio = materialStock.costo || "";
            }
          }
          
          return nuevoMaterial;
        }
        return m;
      })
    );
    
    limpiarError(`material-${index}-${campo}`);
  };

  const agregarMaterial = () => {
    setMateriales((prev) => [
      ...prev,
      { tipo: "", peso: "", precio: "", costo: 0, eliminando: false, codigo_material: null },
    ]);
  };

  const borrarMaterial = (index) => {
    setMateriales((prev) =>
      prev.map((m, i) =>
        i === index ? { ...m, eliminando: true } : m
      )
    );
    setTimeout(() => {
      setMateriales((prev) => prev.filter((_, i) => i !== index));
    }, 300);
  };

  const calcularResultadosVenta = () => {
    const subtotalProductos = productos.reduce(
      (acc, p) => acc + (parseFloat(p.cantidad) || 0) * (parseFloat(p.precio) || 0),
      0
    );

    const totalConDescuento = subtotalProductos - (parseFloat(descuentos) || 0);
    const isv = parseFloat((totalConDescuento * 0.15).toFixed(2));
    const total = parseFloat((totalConDescuento + isv).toFixed(2));

    return {
      subtotal: parseFloat(totalConDescuento.toFixed(2)),
      isv,
      total,
      anticipo: 0,
      pagoPendiente: 0,
    };
  };

  const calcularResultadosFabricacion = () => {
    const precioCalculado = parseFloat(calcularPrecioAutomatico().toFixed(2));
    
    const subtotalProductos = productos.reduce(
      (acc, p) => acc + (parseFloat(p.cantidad) || 0) * precioCalculado,
      0
    );

    const totalConDescuento = subtotalProductos - (parseFloat(descuentos) || 0);
    const isv = parseFloat((totalConDescuento * 0.15).toFixed(2));
    const total = parseFloat((totalConDescuento + isv).toFixed(2));
    const anticipo = parseFloat((total * 0.5).toFixed(2));
    const pagoPendiente = parseFloat((total - anticipo).toFixed(2));

    setProductos(prev => prev.map(p => ({
      ...p,
      precio: precioCalculado
    })));

    return {
      subtotal: parseFloat(totalConDescuento.toFixed(2)),
      isv,
      total,
      anticipo,
      pagoPendiente,
      subtotalProductos: parseFloat(subtotalProductos.toFixed(2))
    };
  };

  const calcularResultadosReparacion = () => {
    const subtotalMateriales = materiales.reduce(
      (acc, m) => acc + (parseFloat(m.costo) || 0),
      0
    );

    const totalParcial = subtotalMateriales + 
                        (parseFloat(costoInsumos) || 0) + 
                        (parseFloat(manoObra) || 0);

    const totalConDescuento = totalParcial - (parseFloat(descuentos) || 0);
    const isv = parseFloat((totalConDescuento * 0.15).toFixed(2));
    const total = parseFloat((totalConDescuento + isv).toFixed(2));
    const anticipo = parseFloat((total * 0.5).toFixed(2));
    const pagoPendiente = parseFloat((total - anticipo).toFixed(2));

    return {
      subtotal: parseFloat(totalConDescuento.toFixed(2)),
      isv,
      total,
      anticipo,
      pagoPendiente,
    };
  };

  const handleCalcular = () => {
    if (!validarCampos()) {
      alert("Por favor, complete todos los campos requeridos antes de calcular");
      return;
    }

    let nuevosResultados;

    if (tipoFactura === "VENTA") {
      nuevosResultados = calcularResultadosVenta();
    } else if (tipoFactura === "FABRICACION") {
      nuevosResultados = calcularResultadosFabricacion();
    } else if (tipoFactura === "REPARACION") {
      nuevosResultados = calcularResultadosReparacion();
    }

    setResultados(nuevosResultados);
  };

  const calcularSubtotalProductos = () => {
    if (tipoFactura === "VENTA") {
      return productos.reduce(
        (acc, p) => acc + (parseFloat(p.cantidad) || 0) * (parseFloat(p.precio) || 0),
        0
      );
    } else if (tipoFactura === "FABRICACION") {
      return resultados.subtotalProductos || productos.reduce(
        (acc, p) => acc + (parseFloat(p.cantidad) || 0) * (parseFloat(p.precio) || 0),
        0
      );
    } else if (tipoFactura === "REPARACION") {
      const subtotalMateriales = materiales.reduce(
        (acc, m) => acc + (parseFloat(m.costo) || 0),
        0
      );

      return subtotalMateriales + 
            (parseFloat(costoInsumos) || 0) + 
            (parseFloat(manoObra) || 0);
    }
    return 0;
  };

  const calcularPrecioAutomatico = () => {
    if (tipoFactura !== "FABRICACION") return 0;
    
    const costoMateriales = materiales.reduce(
      (acc, m) => acc + (parseFloat(m.costo) || 0), 
      0
    );

    const precioCalculado = costoMateriales + 
                          (parseFloat(costoInsumos) || 0) + 
                          (parseFloat(manoObra) || 0);
    
    return parseFloat(precioCalculado.toFixed(2));
  };

  const handleCancelar = () => {
    setMostrarLista(true);
    setTipoFactura(null);
    setMostrarOpciones(false);
    limpiarFormulario();
  };

  const handleClienteChange = (clienteId) => {
    actualizarDatosFactura('id_cliente', clienteId);
    const cliente = clientes.find(c => c.id_cliente === parseInt(clienteId));
    if (cliente) {
      setDatosFactura(prev => ({
        ...prev,
        direccion: cliente.direccion || '',
        telefono: cliente.telefono ? cliente.telefono.toString() : '',
        rtn: cliente.rtn || ''
      }));
    }
  };

  const obtenerDatosCliente = () => {
    const clienteSeleccionado = clientes.find(c => c.id_cliente === parseInt(datosFactura.id_cliente));
    return {
      nombre: clienteSeleccionado ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}` : '',
      direccion: datosFactura.direccion,
      telefono: datosFactura.telefono,
      rtn: datosFactura.rtn
    };
  };

  return (
    <div className="facturacion-module">
      {/* Header */}
      <div className="facturacion-header">
        <div className="texto-header">
          <h1 className="facturacion-title"></h1>
          <p className="facturacion-subtitle"></p>
        </div>
        <div className="botones-header">
          {mostrarLista && (
            <button 
              type="button"
              className="boton-nueva-factura"
              onClick={handleNuevaFactura}
            >
              <FaPlus className="icono-plus" /> Nueva Factura
            </button>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="pantalla-accion">
      {mostrarLista ? (
        <div>
          <ListaFacturas />
        </div> 
      ) : (
          <>
            {mostrarOpciones && (
              <div className="opciones-factura">
                <button type="button" onClick={() => handleSeleccion("VENTA")} className="btn-opcion">
                  VENTA
                </button>
                <button type="button" onClick={() => handleSeleccion("FABRICACION")} className="btn-opcion">
                  FABRICACIÓN
                </button>
                <button type="button" onClick={() => handleSeleccion("REPARACION")} className="btn-opcion">
                  REPARACIÓN
                </button>
              </div>
            )}

            {tipoFactura && (
              <div className="factura-contenido">
                <h2 className="form-title">Nueva Factura de {tipoFactura}</h2>
                
                <div className="contenido-con-scroll">
                  <div className="form-factura">
                    <div className="form-campos">
                      <h3>Datos del Cliente</h3>
                      <DatosCliente 
                        datosFactura={datosFactura}
                        clientes={clientes}
                        empleados={empleados}
                        onActualizar={actualizarDatosFactura}
                        onClienteChange={handleClienteChange}
                        errores={errores}
                        onCambioCampo={limpiarError}
                      />

                      <h3>{tipoFactura === "REPARACION" ? "Detalles de Reparación" : "Detalles del Producto"}</h3>
                      
                      {productos.map((p, index) => (
                        <Producto
                          key={p.id}
                          id={p.id}
                          tipoFactura={tipoFactura}
                          cantidad={p.cantidad}
                          precio={p.precio}
                          codigo={p.codigo}
                          producto={p.producto}
                          descripcion={p.descripcion}
                          tipoJoya={p.tipoJoya}
                          tipoReparacion={p.tipoReparacion}
                          onActualizar={actualizarProducto}
                          onBorrar={borrarProducto}
                          errores={errores}
                          productoIndex={index}
                          productosStock={productosStock}
                        />
                      ))}

                      <button className="boton-agregar-producto" onClick={agregarProducto}>
                        <FaPlus className="icono-plus" /> Agregar Producto
                      </button>

                      {(tipoFactura === "FABRICACION" || tipoFactura === "REPARACION") && (
                        <>
                          <h3>Detalles Adicionales</h3>
                          <DatosAdicionales 
                            materiales={materiales}
                            materialesStock={materialesStock}
                            actualizarMaterial={actualizarMaterial}
                            agregarMaterial={agregarMaterial}
                            borrarMaterial={borrarMaterial}
                            costoInsumos={costoInsumos}
                            setCostoInsumos={setCostoInsumos}
                            manoObra={manoObra}
                            setManoObra={setManoObra}
                            descuentos={descuentos}
                            setDescuentos={setDescuentos}
                            tipoFactura={tipoFactura}
                            errores={errores}
                          />
                        </>
                      )}

                      {tipoFactura === "VENTA" && (
                        <>
                          <h3>Descuentos</h3>
                          <div className="producto-bloque">
                            <div className="producto-contenido">
                              <div className="producto-fila">
                                <div className="campo-producto">
                                  <label>Descuentos o Rebajas</label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Ingrese el descuento o rebaja"
                                    value={descuentos}
                                    onChange={(e) => setDescuentos(e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <h3>Observaciones</h3>
                      <div className="producto-bloque">
                        <div className="producto-contenido">
                          <div className="campo-descripcion">
                            <textarea 
                              rows="3" 
                              placeholder="Ingrese observaciones adicionales..."
                              value={datosFactura.observaciones}
                              onChange={(e) => actualizarDatosFactura('observaciones', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <h3>Resultados</h3>
                      <div className="tabla-resultados">
                        <table>
                          <tbody>
                            <tr>
                              <td>Subtotal Productos:</td>
                              <td>L. {calcularSubtotalProductos().toFixed(2)}</td>
                            </tr>
                            <tr>
                              <td>Descuentos:</td>
                              <td>L. {parseFloat(descuentos || 0).toFixed(2)}</td>
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

                            {(tipoFactura === "FABRICACION" || tipoFactura === "REPARACION") && (
                              <>
                                <tr>
                                  <td>Anticipo (50%):</td>
                                  <td>L. {resultados.anticipo.toFixed(2)}</td>
                                </tr>
                                <tr>
                                  <td>Pago Pendiente:</td>
                                  <td>L. {resultados.pagoPendiente.toFixed(2)}</td>
                                </tr>
                              </>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="botones-container">
                      <button className="btn-submit" onClick={handleCalcular}>
                        Calcular Total
                      </button>
                      <button className="btn-cancel" onClick={handleCancelar}>
                        Cancelar
                      </button>
                      <button className="btn-submit" onClick={handleGenerarFactura}>
                        Generar Factura
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!mostrarOpciones && !tipoFactura && (
              <div className="placeholder-factura">
                <p>Presione el botón <strong>"Nueva Factura"</strong> para generar una nueva factura.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Contenedor para PDF - MEJORADO: Solo se muestra cuando es necesario */}
      {mostrarFormatoFactura && (
        <div style={{ 
          position: 'fixed',
          top: '0',
          left: '0', 
          width: '8.5in',
          minHeight: '11in',
          backgroundColor: 'white',
          zIndex: '9998',
          visibility: 'visible',
          pointerEvents: 'none'
        }}>
          <div ref={facturaRef} style={{ visibility: 'visible' }}>
            <FormatoFactura
              tipoFactura={tipoFactura}
              datosCliente={obtenerDatosCliente()}
              productos={productos}
              materiales={materiales}
              resultados={resultados}
              descuentos={descuentos}
              datosFactura={datosFactura}
            />
          </div>
        </div>
      )}
    </div>
  );
}