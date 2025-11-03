import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

export default function DatosAdicionales({
  materiales,
  actualizarMaterial,
  agregarMaterial,
  borrarMaterial,
  costoInsumos,
  setCostoInsumos,
  manoObra,
  setManoObra,
  descuentos,
  setDescuentos,
  tipoFactura
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
                required
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
                required
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
                required
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
                required
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
              required
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
              required
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