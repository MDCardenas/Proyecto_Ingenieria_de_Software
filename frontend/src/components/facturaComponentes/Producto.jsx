import React, { useState} from "react";
import { FaTrash } from "react-icons/fa";

export default function Producto({ 
  id, 
  tipoFactura, 
  cantidad, 
  precio, 
  codigo, 
  producto, 
  descripcion, 
  onActualizar, 
  onBorrar,
  errores,
  productoIndex
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
      onActualizar(id, "tipoJoya", valor);
    } else if (campo === "tipoReparacion") {
      setTipoReparacion(valor);
      onActualizar(id, "tipoReparacion", valor);
    }
  };

  return (
    <div className={`producto-bloque ${eliminando ? "producto-eliminando" : ""}`} data-id={id}>
      <div className="producto-contenido">
        {(tipoFactura === "Venta" || tipoFactura === "Fabricación") && (
          <div className="producto-fila">
            <div className="campo-producto">
              <label>Código Producto</label>
              <input 
                type="text" 
                placeholder="Ingrese el código del producto"
                value={codigo}
                onChange={(e) => onActualizar(id, "codigo", e.target.value)}
                required
                className={errores?.[`producto-${productoIndex}-codigo`] ? 'campo-error' : ''}
              />
              {errores?.[`producto-${productoIndex}-codigo`] && 
                <span className="mensaje-error">{errores[`producto-${productoIndex}-codigo`]}</span>}
            </div>
            <div className="campo-producto">
              <label>Producto</label>
              <input 
                type="text" 
                placeholder="Ingrese el producto"
                value={producto}
                onChange={(e) => onActualizar(id, "producto", e.target.value)}
                required
                className={errores?.[`producto-${productoIndex}-producto`] ? 'campo-error' : ''}
              />
              {errores?.[`producto-${productoIndex}-producto`] && 
                <span className="mensaje-error">{errores[`producto-${productoIndex}-producto`]}</span>}
            </div>
            <div className="campo-producto">
              <label>Cantidad</label>
              <input 
                type="number" 
                min="0" 
                placeholder="0"
                value={cantidad}
                onChange={(e) => onActualizar(id, "cantidad", e.target.value)}
                required
                className={errores?.[`producto-${productoIndex}-cantidad`] ? 'campo-error' : ''}
              />
              {errores?.[`producto-${productoIndex}-cantidad`] && 
                <span className="mensaje-error">{errores[`producto-${productoIndex}-cantidad`]}</span>}
            </div>
            <div className="campo-producto">
              <label>Precio {tipoFactura === "Fabricación"}</label>
              <input 
                type="number" 
                min="0" 
                step="0.01"
                placeholder="0" 
                value={precio}
                onChange={(e) => onActualizar(id, "precio", e.target.value)}
                readOnly={tipoFactura === "Fabricación"} // <- Esta línea hace que sea de solo lectura
                /*required*/
                className={`${errores?.[`producto-${productoIndex}-precio`] ? 'campo-error' : ''} ${tipoFactura === "Fabricación" ? 'input-readonly' : ''}`}
              />
              {errores?.[`producto-${productoIndex}-precio`] && 
                <span className="mensaje-error">{errores[`producto-${productoIndex}-precio`]}</span>}
              {tipoFactura === "Fabricación" && (
                <span className="mensaje-info">El precio se calculará automáticamente al hacer clic en "Calcular Total"</span>
              )}
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
                required
                data-campo="tipoJoya"
                className={errores?.[`producto-${productoIndex}-tipoJoya`] ? 'campo-error' : ''}
              />
              {errores?.[`producto-${productoIndex}-tipoJoya`] && 
                <span className="mensaje-error">{errores[`producto-${productoIndex}-tipoJoya`]}</span>}
            </div>
            <div className="campo-producto">
              <label>Tipo de Reparación</label>
              <select 
                value={tipoReparacion}
                onChange={(e) => handleCambioReparacion("tipoReparacion", e.target.value)}
                required
                data-campo="tipoReparacion"
                className={errores?.[`producto-${productoIndex}-tipoReparacion`] ? 'campo-error' : ''}
              >
                <option value="">Seleccione un tipo</option>
                <option value="Soldadura">Soldadura</option>
                <option value="Cambio de Piedra">Cambio de Piedra</option>
                <option value="Limpieza">Limpieza</option>
              </select>
              {errores?.[`producto-${productoIndex}-tipoReparacion`] && 
                <span className="mensaje-error">{errores[`producto-${productoIndex}-tipoReparacion`]}</span>}
            </div>
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
              required
              className={errores?.[`producto-${productoIndex}-descripcion`] ? 'campo-error' : ''}
            />
            {errores?.[`producto-${productoIndex}-descripcion`] && 
              <span className="mensaje-error">{errores[`producto-${productoIndex}-descripcion`]}</span>}
          </div>
        </div>

        {tipoFactura === "Fabricación" && (
          <div className="producto-fila">
            <div className="campo-producto">
              <label>Materiales</label>
              <textarea rows="2" placeholder="Ingrese los materiales a utilizar" required />
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
              <textarea rows="2" placeholder="Ingrese los materiales a utilizar" required />
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