import React, { useRef, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import DatosCliente from "../components/facturaComponentes/DatosCliente";
import Producto from "../components/facturaComponentes/Producto";
import DatosAdicionales from "../components/facturaComponentes/DatosAdicionales";
import FormatoFactura from "../components/facturaComponentes/FormatoFactura";

import "../styles/Facturacion.css";

export default function Facturacion({ onCancel }) {
  const facturaRef = useRef();
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [tipoFactura, setTipoFactura] = useState(null);

  // Estado para los productos
  const [productos, setProductos] = useState(() => [{ 
    id: generarId(), 
    cantidad: 0, 
    precio: 0, 
    codigo: "", 
    producto: "", 
    descripcion: "",
    tipoJoya: "",
    tipoReparacion: "" 
  }]);

  // Estado para detalles adicionales (materiales y costos)
  const [materiales, setMateriales] = useState([{ 
    tipo: "", 
    peso: "", 
    precio: "", 
    costo: 0, 
    eliminando: false 
  }]);
  const [costoInsumos, setCostoInsumos] = useState(0);
  const [manoObra, setManoObra] = useState(0);
  const [descuentos, setDescuentos] = useState(0);

  // Estado para guardar los resultados calculados
  const [resultados, setResultados] = useState({
    subtotal: 0,
    isv: 0,
    total: 0,
    anticipo: 0,
    pagoPendiente: 0,
  });

  // Agregar estado para errores de validación
  const [errores, setErrores] = useState({});

  // Función para validar todos los campos requeridos
  const validarCampos = () => {
    const nuevosErrores = {};

    // Validar datos del cliente
    const nombre = document.getElementById('nombre')?.value;
    const fecha = document.getElementById('fecha')?.value;
    const direccion = document.getElementById('direccion')?.value;
    const telefono = document.getElementById('telefono')?.value;

    if (!nombre) nuevosErrores.nombre = "El nombre del cliente es requerido";
    if (!fecha) nuevosErrores.fecha = "La fecha es requerida";
    if (!direccion) nuevosErrores.direccion = "La dirección es requerida";
    if (!telefono) nuevosErrores.telefono = "El teléfono es requerido";

    // Validar productos según el tipo de factura
    if (tipoFactura === "Venta" || tipoFactura === "Fabricación") {
      productos.forEach((producto, index) => {
        if (!producto.codigo) nuevosErrores[`producto-${index}-codigo`] = "Código del producto requerido";
        if (!producto.producto) nuevosErrores[`producto-${index}-producto`] = "Nombre del producto requerido";
        if (!producto.cantidad || producto.cantidad <= 0) nuevosErrores[`producto-${index}-cantidad`] = "Cantidad debe ser mayor a 0";
        
        // SOLO validar precio para Venta, NO para Fabricación
        if (tipoFactura === "Venta" && (!producto.precio || producto.precio <= 0)) {
          nuevosErrores[`producto-${index}-precio`] = "Precio debe ser mayor a 0";
        }
        
        if (!producto.descripcion) nuevosErrores[`producto-${index}-descripcion`] = "Descripción requerida";
      });
    }

    if (tipoFactura === "Reparación") {
      productos.forEach((producto, index) => {
        const tipoJoya = document.querySelector(`[data-id="${producto.id}"] [data-campo="tipoJoya"]`)?.value;
        const tipoReparacion = document.querySelector(`[data-id="${producto.id}"] [data-campo="tipoReparacion"]`)?.value;
        
        if (!tipoJoya) nuevosErrores[`producto-${index}-tipoJoya`] = "Tipo de joya requerido";
        if (!tipoReparacion) nuevosErrores[`producto-${index}-tipoReparacion`] = "Tipo de reparación requerido";
        if (!producto.descripcion) nuevosErrores[`producto-${index}-descripcion`] = "Descripción requerida";
      });
    }

    // Validar detalles adicionales para Fabricación y Reparación
    if (tipoFactura === "Fabricación" || tipoFactura === "Reparación") {
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

  // Función para limpiar errores de un campo específico
  const limpiarError = (campo) => {
    setErrores(prev => {
      const nuevosErrores = { ...prev };
      delete nuevosErrores[campo];
      return nuevosErrores;
    });
  };



  // Función para generar PDF con validación
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
      const element = facturaRef.current;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`factura_${tipoFactura}_${Date.now()}.pdf`);
      
      alert("Factura generada exitosamente!");
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar la factura. Intente nuevamente.");
    }
  };

  // Función para obtener datos del cliente (actualizada para validación)
  const obtenerDatosCliente = () => {
    return {
      nombre: document.getElementById('nombre')?.value || '',
      direccion: document.getElementById('direccion')?.value || '',
      telefono: document.getElementById('telefono')?.value || '',
      rtn: document.getElementById('rtn')?.value || ''
    };
  };




  function generarId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }


  // HandleGenerarFactura actualizado
  const handleGenerarFactura = () => {
    generarPDF();
  };


  const handleNuevaFactura = () => {
    setMostrarOpciones(true);
    setTipoFactura(null);
    // Reiniciamos todos los estados al crear nueva factura
    setProductos([{ 
      id: generarId(), 
      cantidad: 0, 
      precio: 0, 
      codigo: "", 
      producto: "", 
      descripcion: "" 
    }]);
    setMateriales([{ 
      tipo: "", 
      peso: "", 
      precio: "", 
      costo: 0, 
      eliminando: false 
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
  };

  const handleSeleccion = (tipo) => {
    setTipoFactura(tipo);
    setMostrarOpciones(false);
    
    // Si es fabricación, inicializar el precio automáticamente
    if (tipo === "Fabricación") {
      setTimeout(() => {
        const precioInicial = calcularPrecioAutomatico();
        setProductos(prev => prev.map(p => ({
          ...p,
          precio: precioInicial
        })));
      }, 100);
    }
  };

  // Agregar nuevo producto
  const agregarProducto = () => {
    setProductos((prev) => [...prev, { 
      id: generarId(), 
      cantidad: 0, 
      precio: 0, 
      codigo: "", 
      producto: "", 
      descripcion: ""

    }]);
  };

  // Borrar producto por id
  const borrarProducto = (id) => {
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  // Actualizar producto con limpieza de errores
  const actualizarProducto = (id, campo, valor) => {
    setProductos(prev => prev.map(p => p.id === id ? {...p, [campo]: valor} : p));
    // Limpiar error del campo actualizado
    const productoIndex = productos.findIndex(p => p.id === id);
    if (productoIndex !== -1) {
      limpiarError(`producto-${productoIndex}-${campo}`);
    }
  };

  // Actualizar material con limpieza de errores
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
          return nuevoMaterial;
        }
        return m;
      })
    );
    
    limpiarError(`material-${index}-${campo}`);
  };

  // Agregar nuevo material
  const agregarMaterial = () => {
    setMateriales((prev) => [
      ...prev,
      { tipo: "", peso: "", precio: "", costo: 0, eliminando: false },
    ]);
  };

  // Eliminar material
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

  // Función para calcular resultados - DIFERENTE PARA VENTA
  /*const calcularResultados = () => {
    if (tipoFactura === "Venta") {
      // CÁLCULO SIMPLIFICADO PARA VENTA
      const subtotalProductos = productos.reduce(
        (acc, p) => acc + (parseFloat(p.cantidad) || 0) * (parseFloat(p.precio) || 0),
        0
      );

      // Aplicar descuento directamente
      const totalConDescuento = subtotalProductos - (parseFloat(descuentos) || 0);

      // ISV 15%
      const isv = totalConDescuento * 0.15;

      // Total final
      const total = totalConDescuento + isv;

      return {
        subtotal: totalConDescuento,
        isv,
        total,
        anticipo: 0,
        pagoPendiente: 0,
      };
    } else {
      // CÁLCULO COMPLETO PARA FABRICACIÓN Y REPARACIÓN
      let subtotalProductos = 0;

      if (tipoFactura === "Fabricación") {
        // Para fabricación: calcular cantidad × precio
        subtotalProductos = productos.reduce(
          (acc, p) => acc + (parseFloat(p.cantidad) || 0) * (parseFloat(p.precio) || 0),
          0
        );

        // Aplicar descuento
        const totalConDescuentoFa = subtotalProductos - (parseFloat(descuentos) || 0);

        // ISV 15%
        const isv = totalConDescuentoFa * 0.15;

        // Total final
        const total = totalConDescuentoFa + isv;

        // Anticipo: 50% del total
        const anticipo = total * 0.5;

        // Pago pendiente
        const pagoPendiente = total - anticipo;

        return {
          subtotal: totalConDescuentoFa,
          isv,
          total,
          anticipo,
          pagoPendiente,
        };

        




      } //else if (tipoFactura === "Reparación") {
        // Para reparación: el precio ya viene incluido en el campo precio del producto
        // (aunque no se muestre en la interfaz)
        //subtotalProductos = productos.reduce(
        //  (acc, p) => acc + (parseFloat(p.precio) || 0),
        //  0
        //);

        // Subtotal materiales: sumatoria de costos de materiales
        //const subtotalMateriales = materiales.reduce(
        //  (acc, m) => acc + (parseFloat(m.costo) || 0),
        ////  0
        //);

        // Total parcial = materiales + insumos + mano de obra
       // const totalParcial = subtotalMateriales + 
       ////                     (parseFloat(costoInsumos) || 0) + 
         //                   (parseFloat(manoObra) || 0);

        
  


      //}

      
      
      
    } 
  };*/


  // Agrega esta función después de calcularSubtotalProductos()
  /*const calcularSubtotalReparacion = () => {
    if (tipoFactura !== "Reparación") return 0;
    
    const subtotalMateriales = materiales.reduce(
      (acc, m) => acc + (parseFloat(m.costo) || 0),
      0
    );

    const totalParcial = subtotalMateriales + 
          (parseFloat(costoInsumos) || 0) + 
          (parseFloat(manoObra) || 0);

    const totalConDescuento = totalParcial - (parseFloat(descuentos) || 0);

    // ISV 15%
        const isv = totalConDescuento * 0.15;

        // Total final
        const total = totalConDescuento + isv;

        // Anticipo: 50% del total
        const anticipo = total * 0.5;

        // Pago pendiente
        const pagoPendiente = total - anticipo;

        return {
          subtotal: totalConDescuento,
          isv,
          total,
          anticipo,
          pagoPendiente,
        };

  };*/



  // FUNCION PARA VENTA
  const calcularResultadosVenta = () => {
    // CÁLCULO SIMPLIFICADO PARA VENTA
    const subtotalProductos = productos.reduce(
      (acc, p) => acc + (parseFloat(p.cantidad) || 0) * (parseFloat(p.precio) || 0),
      0
    );

    // Aplicar descuento directamente
    const totalConDescuento = subtotalProductos - (parseFloat(descuentos) || 0);

    // ISV 15%
    const isv = totalConDescuento * 0.15;

    // Total final
    const total = totalConDescuento + isv;

    return {
      subtotal: totalConDescuento,
      isv,
      total,
      anticipo: 0,
      pagoPendiente: 0,
    };
  };

  // FUNCION PARA FABRICACION
  const calcularResultadosFabricacion = () => {
    // Primero calcular el precio automático
    const precioCalculado = calcularPrecioAutomatico();
    
    // Calcular subtotal con el nuevo precio
    const subtotalProductos = productos.reduce(
      (acc, p) => acc + (parseFloat(p.cantidad) || 0) * precioCalculado,
      0
    );

    // Aplicar descuento
    const totalConDescuento = subtotalProductos - (parseFloat(descuentos) || 0);

    // ISV 15%
    const isv = totalConDescuento * 0.15;

    // Total final
    const total = totalConDescuento + isv;

    // Anticipo: 50% del total
    const anticipo = total * 0.5;

    // Pago pendiente
    const pagoPendiente = total - anticipo;

    // Actualizar el precio en el estado
    setProductos(prev => prev.map(p => ({
      ...p,
      precio: precioCalculado
    })));

    return {
      subtotal: totalConDescuento,
      isv,
      total,
      anticipo,
      pagoPendiente,
      subtotalProductos // ← Agregar esto para la tabla
    };
  };

  // FUNCION PARA REPARACION
  const calcularResultadosReparacion = () => {
    // Para reparación: el subtotal es materiales + insumos + mano de obra
    const subtotalMateriales = materiales.reduce(
      (acc, m) => acc + (parseFloat(m.costo) || 0),
      0
    );

    // Total parcial = materiales + insumos + mano de obra
    const totalParcial = subtotalMateriales + 
                        (parseFloat(costoInsumos) || 0) + 
                        (parseFloat(manoObra) || 0);

    const totalConDescuento = totalParcial - (parseFloat(descuentos) || 0);
    const isv = totalConDescuento * 0.15;
    const total = totalConDescuento + isv;
    const anticipo = total * 0.5;
    const pagoPendiente = total - anticipo;

    return {
      subtotal: totalConDescuento,
      isv,
      total,
      anticipo,
      pagoPendiente,
    };
  };

  // HANDLECALCULAR
  const handleCalcular = () => {
    if (!validarCampos()) {
      alert("Por favor, complete todos los campos requeridos antes de calcular");
      return;
    }

    let nuevosResultados;

    // Usar la función correcta según el tipo de factura
    if (tipoFactura === "Venta") {
      nuevosResultados = calcularResultadosVenta();
    } else if (tipoFactura === "Fabricación") {
      
      nuevosResultados = calcularResultadosFabricacion();
    } else if (tipoFactura === "Reparación") {
      nuevosResultados = calcularResultadosReparacion();
    }

    setResultados(nuevosResultados);
  };

  const calcularSubtotalProductos = () => {
    if (tipoFactura === "Venta") {
      return productos.reduce(
        (acc, p) => acc + (parseFloat(p.cantidad) || 0) * (parseFloat(p.precio) || 0),
        0
      );
    } else if (tipoFactura === "Fabricación") {
      return resultados.subtotalProductos || productos.reduce(
        (acc, p) => acc + (parseFloat(p.cantidad) || 0) * (parseFloat(p.precio) || 0),
        0
      );
    } else if (tipoFactura === "Reparación") {
      // Para reparación: mostrar el total que incluye todo
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












  // Funcion para calcular el subtotal de los productos
  /*const calcularSubtotalProductos = () => {
    if (tipoFactura === "Venta") {
      return productos.reduce(
        (acc, p) => acc + (parseFloat(p.cantidad) || 0) * (parseFloat(p.precio) || 0),
        0
      );
    } else if (tipoFactura === "Fabricación") {
      return productos.reduce(
        (acc, p) => acc + (parseFloat(p.cantidad) || 0) * (parseFloat(p.precio) || 0),
        0
      );
    } else if (tipoFactura === "Reparación") {
      return productos.reduce(
        (acc, p) => acc + (parseFloat(p.precio) || 0),
        0
      );
    }
    return 0;
  };*/


  const calcularPrecioAutomatico = () => {
    if (tipoFactura !== "Fabricación") return 0;
    
    // Calcular costo total de materiales (suma de todos los materiales)
    const costoMateriales = materiales.reduce(
      (acc, m) => acc + (parseFloat(m.costo) || 0), 
      0
    );

    console.log("Costo Materiales:", costoMateriales); // Para debug
    console.log("Costo Insumos:", costoInsumos); // Para debug
    console.log("Mano de Obra:", manoObra); // Para debug
    
    // Calcular precio por unidad
    const precioCalculado = costoMateriales + 
                          (parseFloat(costoInsumos) || 0) + 
                          (parseFloat(manoObra) || 0);
    
    console.log("Precio Calculado:", precioCalculado); // Para debug
    return precioCalculado;
  };

  





  // HandleCalcular actualizado con validación
  /*const handleCalcular = () => {
    if (!validarCampos()) {
      alert("Por favor, complete todos los campos requeridos antes de calcular");
      return;
    }

    // Si es fabricación, calcular el precio automático antes de los resultados
    if (tipoFactura === "Fabricación") {
      const precioCalculado = calcularPrecioAutomatico();
      // Actualizar el precio de todos los productos
      setProductos(prev => prev.map(p => ({
        ...p,
        precio: precioCalculado
      })));
      
      // Recalcular resultados con el nuevo precio
      const nuevosResultados = calcularResultados();
      setResultados(nuevosResultados);
    } else {
      // Para otros tipos de factura, cálculo normal
      //const nuevosResultados = calcularResultados();
      //setResultados(nuevosResultados);

      if (tipoFactura === "Reparación") {
        nuevosResultados = calcularSubtotalReparacion();
      } else {
        nuevosResultados = calcularResultados();
      
      }
      setResultados(nuevosResultados);
    }
  };*/


  const handleCancelar = () => {
    if (onCancel) {
      onCancel(); // Esto ejecutará la función que cambia a "Ventas"
    } else {
      console.log("Función onCancel no disponible");
      // Como fallback, podrías resetear el estado
      setTipoFactura(null);
      setMostrarOpciones(false);
    }
  };






  // ----------------------------- INTERFAZ ----------------------------------------
  return (
    <div className="contenedor-principal">
      <div className="contenedor-superior">
        <div className="texto-superior">
          <span className="titulo">Facturación</span>
          <p className="subtitulo">Gestión de Facturas y Ventas</p>
        </div>
        <button 
          type="button"
          className="boton-nueva-factura"
          onClick={handleNuevaFactura}
        >
          <FaPlus className="icono-plus" /> Nueva Factura
        </button>
      </div>

      <div className="contenedor-factura">
        {mostrarOpciones && (
          <div className="opciones-factura">
            <button type="button" onClick={() => handleSeleccion("Venta")} className="btn-opcion">
              VENTA
            </button>
            <button type="button" onClick={() => handleSeleccion("Fabricación")} className="btn-opcion">
              FABRICACIÓN
            </button>
            <button type="button" onClick={() => handleSeleccion("Reparación")} className="btn-opcion">
              REPARACIÓN
            </button>
          </div>
        )}

        {tipoFactura && (
          <div className="factura-contenido">
            <h2 className="titulo-factura">Nueva Factura de {tipoFactura}</h2>

            <h3>Datos del Cliente</h3>
            <DatosCliente 
              errores={errores}
              onCambioCampo={limpiarError}
            />

            <h3>{tipoFactura === "Reparación" ? "Detalles de Reparación" : "Detalles del Producto"}</h3>
            
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
              />
            ))}

            <button className="boton-agregar-producto" onClick={agregarProducto}>
              <FaPlus className="icono-plus" /> Agregar Producto
            </button>

            {/* MOSTRAR DETALLES ADICIONALES SOLO PARA FABRICACIÓN Y REPARACIÓN */}
            {(tipoFactura === "Fabricación" || tipoFactura === "Reparación") && (
              <>
                <h3>Detalles Adicionales</h3>
                <DatosAdicionales 
                  materiales={materiales}
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
                />
              </>
            )}

            {/* PARA VENTA: MOSTRAR SOLO EL CAMPO DE DESCUENTOS */}
            {tipoFactura === "Venta" && (
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



            <div className="fila-botones">
              <div className="botones-izquierda">
                <button className="boton-calcular" onClick={handleCalcular}>Calcular Total</button>
                <button className="boton-cancelar" onClick={handleCancelar}>Cancelar</button>
                <button className="boton-generar" onClick={handleGenerarFactura}>Generar Factura</button>
              </div>
            </div>

            {/* Resultados */}
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

                  {/* MOSTRAR ANTICIPO Y PAGO PENDIENTE SOLO PARA FABRICACIÓN Y REPARACIÓN */}
                  {(tipoFactura === "Fabricación" || tipoFactura === "Reparación") && (
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
        )}

        {!mostrarOpciones && !tipoFactura && (
          <div className="placeholder-factura">
            <p>Presione el botón <strong>“Nueva Factura”</strong> para generar una nueva factura.</p>
          </div>
        )}
      </div>

      {/* Este div estará oculto pero contendrá el formato para el PDF */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={facturaRef}>
          <FormatoFactura
            tipoFactura={tipoFactura}
            datosCliente={obtenerDatosCliente()}
            productos={productos}
            materiales={materiales}
            resultados={resultados}
            descuentos={descuentos}
          />
        </div>
      </div>

    </div>
  );
}
