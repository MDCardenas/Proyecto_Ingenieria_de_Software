import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";

export default function ProductoCotizacion({
  id,
  tipoCotizacion,
  cantidad,
  precio,
  codigo,
  producto,
  descripcion,
  tipoJoya,
  tipoReparacion,
  onActualizar,
  onBorrar,
  errores,
  productoIndex,
}) {

  return (
    <div className="producto-bloque">
      <div className="producto-contenido">
        <div className="producto-fila">
          {tipoCotizacion === "FABRICACION" && (
            <>
              <div className="campo-producto">
                <label>Código Boceto *</label>
                <input
                  type="text"
                  placeholder="Código del boceto"
                  value={codigo}
                  onChange={(e) => onActualizar(id, "codigo", e.target.value)}
                  className={errores?.[`producto-${productoIndex}-codigo`] ? 'campo-error' : ''}
                />
                {errores?.[`producto-${productoIndex}-codigo`] && (
                  <span className="mensaje-error">{errores[`producto-${productoIndex}-codigo`]}</span>
                )}
              </div>
              <div className="campo-producto">
                <label>Nombre del Diseño *</label>
                <input
                  type="text"
                  placeholder="Nombre del diseño"
                  value={producto}
                  onChange={(e) => onActualizar(id, "producto", e.target.value)}
                  className={errores?.[`producto-${productoIndex}-producto`] ? 'campo-error' : ''}
                />
                {errores?.[`producto-${productoIndex}-producto`] && (
                  <span className="mensaje-error">{errores[`producto-${productoIndex}-producto`]}</span>
                )}
              </div>
            </>
          )}

          {tipoCotizacion === "REPARACION" && (
            <>
              <div className="campo-producto">
                <label>Tipo de Joya *</label>
                <select
                  value={tipoJoya}
                  onChange={(e) => onActualizar(id, "tipoJoya", e.target.value)}
                  className={errores?.[`producto-${productoIndex}-tipoJoya`] ? 'campo-error' : ''}
                >
                  <option value="">Seleccione tipo</option>
                  <option value="ANILLO">Anillo</option>
                  <option value="CADENA">Cadena</option>
                  <option value="PULSERA">Pulsera</option>
                  <option value="ARETES">Aretes</option>
                  <option value="DIJE">Dije</option>
                  <option value="OTRO">Otro</option>
                </select>
                {errores?.[`producto-${productoIndex}-tipoJoya`] && (
                  <span className="mensaje-error">{errores[`producto-${productoIndex}-tipoJoya`]}</span>
                )}
              </div>
              <div className="campo-producto">
                <label>Tipo de Reparación *</label>
                <select
                  value={tipoReparacion}
                  onChange={(e) => onActualizar(id, "tipoReparacion", e.target.value)}
                  className={errores?.[`producto-${productoIndex}-tipoReparacion`] ? 'campo-error' : ''}
                >
                  <option value="">Seleccione tipo</option>
                  <option value="SOLDADURA">Soldadura</option>
                  <option value="LIMPIEZA">Limpieza Profesional</option>
                  <option value="ENGARCE">Engarce de Piedras</option>
                  <option value="PULIDO">Pulido y Brillado</option>
                  <option value="AJUSTE">Ajuste de Tamaño</option>
                  <option value="OTRO">Otro</option>
                </select>
                {errores?.[`producto-${productoIndex}-tipoReparacion`] && (
                  <span className="mensaje-error">{errores[`producto-${productoIndex}-tipoReparacion`]}</span>
                )}
              </div>
            </>
          )}

          <div className="campo-producto">
            <label>Cantidad *</label>
            <input
              type="number"
              min="1"
              placeholder="Cantidad"
              value={cantidad}
              onChange={(e) => onActualizar(id, "cantidad", e.target.value)}
              className={errores?.[`producto-${productoIndex}-cantidad`] ? 'campo-error' : ''}
            />
            {errores?.[`producto-${productoIndex}-cantidad`] && (
              <span className="mensaje-error">{errores[`producto-${productoIndex}-cantidad`]}</span>
            )}
          </div>

          {tipoCotizacion === "FABRICACION" && (
            <div className="campo-producto">
              <label>Precio Unitario (Calculado)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Precio unitario"
                value={precio}
                readOnly
                className="campo-solo-lectura"
              />
              <small className="form-hint">
                ✓ Precio calculado automáticamente
              </small>
            </div>
          )}

          <div className="acciones-producto">
            <button
              type="button"
              className="btn-eliminar-producto"
              onClick={() => onBorrar(id)}
            >
              <FaTrash />
            </button>
          </div>
        </div>

        {/* DESCRIPCIÓN - COMÚN PARA TODOS */}
        <div className="campo-descripcion">
          <label>
            {tipoCotizacion === "FABRICACION" && "Descripción del Boceto *"}
            {tipoCotizacion === "REPARACION" && "Descripción del Daño *"}
          </label>
          <textarea
            rows="3"
            placeholder={
              tipoCotizacion === "FABRICACION" ? "Descripción detallada del boceto y especificaciones..." :
              "Descripción detallada del daño y trabajo requerido..."
            }
            value={descripcion}
            onChange={(e) => onActualizar(id, "descripcion", e.target.value)}
            className={errores?.[`producto-${productoIndex}-descripcion`] ? 'campo-error' : ''}
          />
          {errores?.[`producto-${productoIndex}-descripcion`] && (
            <span className="mensaje-error">{errores[`producto-${productoIndex}-descripcion`]}</span>
          )}
        </div>
      </div>
    </div>
  );
}