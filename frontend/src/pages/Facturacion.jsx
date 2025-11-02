import React, { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; 
import "../styles/Facturacion.css";

export default function Facturacion({ onCancel }) {
  const navigate = useNavigate();
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [tipoFactura, setTipoFactura] = useState(null);

  // Estado para los productos
  const [productos, setProductos] = useState(() => [{ 
    id: generarId(), 
    cantidad: 0, 
    precio: 0, 
    codigo: "", 
    producto: "", 
    descripcion: "" 
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

  function generarId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

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

  // Actualizar producto
  const actualizarProducto = (id, campo, valor) => {
    setProductos(prev => prev.map(p => p.id === id ? {...p, [campo]: valor} : p));
  };

  // Actualizar material
  const actualizarMaterial = (index, campo, valor) => {
    setMateriales((prev) =>
      prev.map((m, i) => {
        if (i === index) {
          const nuevoMaterial = { ...m, [campo]: valor };
          
          // Recalcular costo automáticamente cuando cambia peso o precio
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
  const calcularResultados = () => {
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
      } else if (tipoFactura === "Reparación") {
        // Para reparación: el precio ya viene incluido en el campo precio del producto
        // (aunque no se muestre en la interfaz)
        subtotalProductos = productos.reduce(
          (acc, p) => acc + (parseFloat(p.precio) || 0),
          0
        );
      }

      // Subtotal materiales: sumatoria de costos de materiales
      const subtotalMateriales = materiales.reduce(
        (acc, m) => acc + (parseFloat(m.costo) || 0),
        0
      );

      // Total parcial = productos + materiales + insumos + mano de obra
      const totalParcial = subtotalProductos + subtotalMateriales + 
                          (parseFloat(costoInsumos) || 0) + 
                          (parseFloat(manoObra) || 0);

      // Aplicar descuento
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
    } 
  };

  const handleCalcular = () => {
    const nuevosResultados = calcularResultados();
    setResultados(nuevosResultados);
  };

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
            <DatosCliente />

            <h3>{tipoFactura === "Reparación" ? "Detalles de Reparación" : "Detalles del Producto"}</h3>
            
            {productos.map((p) => (
              <Producto
                key={p.id}
                id={p.id}
                tipoFactura={tipoFactura}
                cantidad={p.cantidad}
                precio={p.precio}
                codigo={p.codigo}
                producto={p.producto}
                descripcion={p.descripcion}
                onActualizar={actualizarProducto}
                onBorrar={borrarProducto}
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
                <button className="boton-generar">Generar Factura</button>
              </div>
            </div>

            <h3>Resultados</h3>
            <div className="tabla-resultados">
              <table>
                <tbody>
                  <tr>
                    <td>Subtotal:</td>
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
    </div>
  );
}

// Componente DatosCliente (sin cambios)
function DatosCliente() {
  return (
    <div className="formulario-factura">
      <div className="fila-formulario">
        <div className="campo-formulario">
          <label htmlFor="nombre">Nombre Completo del Cliente</label>
          <input type="text" id="nombre" placeholder="Ingrese el nombre completo" />
        </div>
        <div className="campo-formulario">
          <label htmlFor="fecha">Fecha</label>
          <input type="date" id="fecha" />
        </div>
      </div>

      <div className="fila-formulario">
        <div className="campo-formulario">
          <label htmlFor="direccion">Dirección</label>
          <input type="text" id="direccion" placeholder="Ingrese la dirección" />
        </div>
        <div className="campo-formulario">
          <label htmlFor="telefono">Número de teléfono</label>
          <input type="tel" id="telefono" placeholder="Ingrese el teléfono" />
        </div>
      </div>

      <div className="fila-formulario">
        <div className="campo-formulario">
          <label htmlFor="rtn">RTN (opcional)</label>
          <input type="text" id="rtn" placeholder="Ingrese el RTN" />
        </div>
      </div>
    </div>
  );
}

// Componente Producto CORREGIDO
function Producto({ 
  id, 
  tipoFactura, 
  cantidad, 
  precio, 
  codigo, 
  producto, 
  descripcion, 
  onActualizar, 
  onBorrar 
}) {
  const [eliminando, setEliminando] = useState(false);
  // Estado específico para reparación
  const [tipoJoya, setTipoJoya] = useState("");
  const [tipoReparacion, setTipoReparacion] = useState("");

  const handleBorrar = () => {
    setEliminando(true);
    setTimeout(() => {
      onBorrar(id);
    }, 300);
  };

  // Función para manejar cambios en campos de reparación
  const handleCambioReparacion = (campo, valor) => {
    if (campo === "tipoJoya") {
      setTipoJoya(valor);
    } else if (campo === "tipoReparacion") {
      setTipoReparacion(valor);
    }
  };

  return (
    <div className={`producto-bloque ${eliminando ? "producto-eliminando" : ""}`}>
      <div className="producto-contenido">

        {/* PARA VENTA Y FABRICACIÓN: Mostrar fila normal */}
        {(tipoFactura === "Venta" || tipoFactura === "Fabricación") && (
          <div className="producto-fila">
            <div className="campo-producto">
              <label>Código Producto</label>
              <input 
                type="text" 
                placeholder="Ingrese el código del producto"
                value={codigo}
                onChange={(e) => onActualizar(id, "codigo", e.target.value)}
              />
            </div>
            <div className="campo-producto">
              <label>Producto</label>
              <input 
                type="text" 
                placeholder="Ingrese el producto"
                value={producto}
                onChange={(e) => onActualizar(id, "producto", e.target.value)}
              />
            </div>
            <div className="campo-producto">
              <label>Cantidad</label>
              <input 
                type="number" 
                min="0" 
                placeholder="0"
                value={cantidad}
                onChange={(e) => onActualizar(id, "cantidad", e.target.value)}
              />
            </div>
            <div className="campo-producto">
              <label>Precio</label>
              <input 
                type="number" 
                min="0" 
                step="0.01"
                placeholder="0" 
                value={precio}
                onChange={(e) => onActualizar(id, "precio", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* PARA REPARACIÓN: Mostrar campos específicos */}
        {tipoFactura === "Reparación" && (
          <div className="producto-fila">
            <div className="campo-producto">
              <label>Tipo de Joya</label>
              <input 
                type="text" 
                placeholder="Ej: Anillo, Collar, Pulsera, etc."
                value={tipoJoya}
                onChange={(e) => handleCambioReparacion("tipoJoya", e.target.value)}
              />
            </div>
            <div className="campo-producto">
              <label>Tipo de Reparación</label>
              <select 
                
                value={tipoReparacion}
                onChange={(e) => handleCambioReparacion("tipoReparacion", e.target.value)}
              >
                <option value="">Seleccione un tipo</option>
                <option value="Soldadura">Soldadura</option>
                <option value="Cambio de Piedra">Cambio de Piedra</option>
                <option value="Limpieza">Limpieza</option>
              </select>
            </div>
            {/* Estos campos se mantienen ocultos pero necesarios para cálculos */}
            <input type="hidden" value={cantidad} />
            <input type="hidden" value={precio} />
          </div>
        )}

        {/* Segunda fila: Descripción (se mantiene para todos) */}
        <div className="producto-fila">
          <div className="campo-descripcion">
            <label>Descripción</label>
            <textarea 
              rows="3" 
              placeholder="Ingrese una descripción del producto"
              value={descripcion}
              onChange={(e) => onActualizar(id, "descripcion", e.target.value)}
            />
          </div>
        </div>

        {tipoFactura === "Fabricación" && (
          <div className="producto-fila">
            <div className="campo-producto">
              <label>Materiales</label>
              <textarea rows="2" placeholder="Ingrese los materiales a utilizar" />
            </div>
            <div className="campo-producto">
              <label>Boceto (imagen)</label>
              <input type="file" accept="image/*" />
            </div>
          </div>
        )}

        {tipoFactura === "Reparación" && (
          <div className="producto-fila">
            <div className="campo-producto">
              <label>Materiales</label>
              <textarea rows="2" placeholder="Ingrese los materiales a utilizar" />
            </div>
            <div className="campo-producto">
              <label>Imagen de la pieza a reparar</label>
              <input type="file" accept="image/*" />
            </div>
          </div>
        )}
      </div>

      <div className="producto-borrar">
        <button onClick={handleBorrar}>
          <FaTrash size={30} color="white" />
        </button>
      </div>
    </div>
  );
}

// Componente DatosAdicionales CORREGIDO (sin estado interno duplicado)
function DatosAdicionales({
  materiales,
  actualizarMaterial,
  agregarMaterial,
  borrarMaterial,
  costoInsumos,
  setCostoInsumos,
  manoObra,
  setManoObra,
  descuentos,
  setDescuentos
}) {
  return (
    <div className="producto-bloque">
      <div className="producto-contenido">
        {materiales.map((m, index) => (
          <div
            key={index}
            className={`producto-fila ${m.eliminando ? "producto-eliminando" : ""}`}
            style={{ alignItems: "flex-end" }}
          >
            <div className="campo-producto">
              <label>Tipo de Material</label>
              <input
                type="text"
                placeholder="Ingrese el tipo de material"
                value={m.tipo}
                onChange={(e) => actualizarMaterial(index, "tipo", e.target.value)}
              />
            </div>
            <div className="campo-producto">
              <label>Peso del Material (gramos)</label>
              <input
                type="number"
                placeholder="Ingrese el peso del material"
                min="0"
                step="0.01"
                value={m.peso}
                onChange={(e) => actualizarMaterial(index, "peso", e.target.value)}
              />
            </div>
            <div className="campo-producto">
              <label>Precio del Material</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Ingrese el precio del material"
                value={m.precio}
                onChange={(e) => actualizarMaterial(index, "precio", e.target.value)}
              />
            </div>
            <div className="campo-producto">
              <label>Costo del Material</label>
              <input
                type="number"
                value={m.costo.toFixed(2)}
                readOnly
                className="input-readonly"
                placeholder="Costo calculado automáticamente"
              />
            </div>

            <div className="producto-borrar">
              <button type="button" onClick={() => borrarMaterial(index)}>
                <FaTrash size={18} color="white" />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="boton-agregar-material"
          onClick={agregarMaterial}
        >
          <FaPlus className="icono-plus" /> Agregar Material
        </button>

        <div className="producto-fila" style={{ marginTop: "15px" }}>
          <div className="campo-producto">
            <label>Costo de Insumos</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Ingrese el costo de los insumos"
              value={costoInsumos}
              onChange={(e) => setCostoInsumos(e.target.value)}
            />
          </div>
          <div className="campo-producto">
            <label>Costo de la Mano de Obra</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Ingrese el costo de la mano de obra"
              value={manoObra}
              onChange={(e) => setManoObra(e.target.value)}
            />
          </div>
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
  );
}





