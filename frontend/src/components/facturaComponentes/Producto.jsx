import React, { useState, useEffect } from "react";
import { FaTrash, FaSearch } from "react-icons/fa";
import { normalizeText, normalizeSearch } from "../../utils/normalize";

export default function Producto({
  id,
  tipoFactura,
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
  productosStock = []
}) {
  // Estados para búsqueda inteligente
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [mostrarResultadosProducto, setMostrarResultadosProducto] = useState(false);
  const [productosEncontrados, setProductosEncontrados] = useState([]);

  // Buscar productos cuando se escribe en el campo de código o producto
  useEffect(() => {
    if (busquedaProducto.trim() === "" || !productosStock.length) {
      setProductosEncontrados([]);
      setMostrarResultadosProducto(false);
      return;
    }

    const searchNormalized = normalizeText(busquedaProducto);
    
    const encontrados = productosStock.filter(p => {
      const codigoProd = normalizeText(p.codigo_joya?.toString() || '');
      const nombreProd = normalizeSearch(p.nombre || '');
      const descripcionProd = normalizeSearch(p.descripcion || '');
      
      return codigoProd.includes(searchNormalized) ||
             nombreProd.includes(searchNormalized) ||
             descripcionProd.includes(searchNormalized);
    });

    setProductosEncontrados(encontrados);
    setMostrarResultadosProducto(encontrados.length > 0);
  }, [busquedaProducto, productosStock]);

  // Autocompletar cuando se selecciona un producto
  const handleSeleccionarProducto = (productoStock) => {
    onActualizar(id, "codigo", productoStock.codigo_joya);
    onActualizar(id, "producto", productoStock.nombre);
    onActualizar(id, "precio", productoStock.precio_venta || 0);
    onActualizar(id, "descripcion", productoStock.descripcion || '');
    
    setBusquedaProducto("");
    setMostrarResultadosProducto(false);
  };

  // Manejar cambio en el campo de búsqueda
  const handleBusquedaChange = (value) => {
    setBusquedaProducto(value);
    // Si el campo está vacío, limpiar también el código
    if (!value.trim()) {
      onActualizar(id, "codigo", "");
    }
  };

  return (
    <div className="producto-bloque">
      <div className="producto-contenido">
        <div className="producto-fila">
          {tipoFactura === "VENTA" && (
            <>
              {/* CAMPO DE CÓDIGO/PRODUCTO MEJORADO */}
              <div className="campo-producto" style={{ position: 'relative' }}>
                <label>Código o Producto *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Buscar por código, nombre..."
                    value={busquedaProducto || codigo || producto || ''}
                    onChange={(e) => handleBusquedaChange(e.target.value)}
                    onFocus={() => busquedaProducto && setMostrarResultadosProducto(true)}
                    className={errores?.[`producto-${productoIndex}-codigo`] ? 'campo-error' : ''}
                    style={{ paddingRight: '40px' }}
                  />
                  <FaSearch style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7280',
                    pointerEvents: 'none'
                  }} />
                </div>

                {/* Resultados de búsqueda de productos */}
                {mostrarResultadosProducto && productosEncontrados.length > 0 && (
                  <div className="resultados-busqueda">
                    {productosEncontrados.map(prod => (
                      <div 
                        key={prod.codigo_joya}
                        className="resultado-item"
                        onClick={() => handleSeleccionarProducto(prod)}
                      >
                        <div>
                          <strong>{prod.nombre}</strong>
                          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                            Código: {prod.codigo_joya} | Precio: L. {prod.precio_venta}
                          </div>
                          {prod.descripcion && (
                            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                              {prod.descripcion}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {busquedaProducto && !mostrarResultadosProducto && productosEncontrados.length === 0 && (
                  <div className="sin-resultados">
                    No se encontraron productos
                  </div>
                )}

                {errores?.[`producto-${productoIndex}-codigo`] && (
                  <span className="mensaje-error">{errores[`producto-${productoIndex}-codigo`]}</span>
                )}
              </div>

              {/* Campo de precio ahora es de solo lectura cuando hay producto seleccionado */}
              <div className="campo-producto">
                <label>Precio Unitario *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Precio unitario"
                  value={precio}
                  onChange={(e) => onActualizar(id, "precio", e.target.value)}
                  readOnly={!!codigo} // Solo lectura si ya hay un producto seleccionado
                  className={
                    (errores?.[`producto-${productoIndex}-precio`] ? 'campo-error' : '') +
                    (codigo ? ' campo-solo-lectura' : '')
                  }
                />
                {errores?.[`producto-${productoIndex}-precio`] && (
                  <span className="mensaje-error">{errores[`producto-${productoIndex}-precio`]}</span>
                )}
                {codigo && (
                  <small className="form-hint" style={{ color: '#059669' }}>
                    ✓ Precio cargado automáticamente
                  </small>
                )}
              </div>
            </>
          )}

          {tipoFactura === "FABRICACION" && (
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

          {tipoFactura === "REPARACION" && (
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

          {(tipoFactura === "FABRICACION") && (
            <div className="campo-producto">
              <label>Precio Unitario (Calculado)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Precio unitario"
                value={precio}
                onChange={(e) => onActualizar(id, "precio", e.target.value)}
                readOnly={tipoFactura === "FABRICACION"}
                className={
                  (errores?.[`producto-${productoIndex}-precio`] ? 'campo-error' : '') +
                  (tipoFactura === "FABRICACION" ? ' campo-solo-lectura' : '')
                }
              />
              {errores?.[`producto-${productoIndex}-precio`] && (
                <span className="mensaje-error">{errores[`producto-${productoIndex}-precio`]}</span>
              )}
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
            {tipoFactura === "VENTA" && "Descripción del Producto *"}
            {tipoFactura === "FABRICACION" && "Descripción del Boceto *"}
            {tipoFactura === "REPARACION" && "Descripción del Daño *"}
          </label>
          <textarea
            rows="3"
            placeholder={
              tipoFactura === "VENTA" ? "Descripción detallada del producto..." :
              tipoFactura === "FABRICACION" ? "Descripción detallada del boceto y especificaciones..." :
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