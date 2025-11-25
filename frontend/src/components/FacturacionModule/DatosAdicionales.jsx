import React, { useState, useEffect } from "react";
import { FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import { normalizeText, normalizeSearch } from "../../utils/normalize";

export default function DatosAdicionales({
  materiales,
  materialesStock,
  actualizarMaterial,
  agregarMaterial,
  borrarMaterial,
  costoInsumos,
  setCostoInsumos,
  manoObra,
  setManoObra,
  descuentos,
  setDescuentos,
  tipoFactura,
  errores,
  soloDescuentos = false
}) {
  // Estado para búsqueda de materiales
  const [busquedaMaterial, setBusquedaMaterial] = useState("");
  const [mostrarResultadosMaterial, setMostrarResultadosMaterial] = useState(false);
  const [materialesEncontrados, setMaterialesEncontrados] = useState([]);
  const [materialIndexActivo, setMaterialIndexActivo] = useState(null);
  
  // Estado para el dropdown de descuentos
  const [mostrarDropdownDescuentos, setMostrarDropdownDescuentos] = useState(false);

  // Opciones de descuento
  const opcionesDescuento = [
    { valor: 0, label: "0%" },
    { valor: 5, label: "5%" },
    { valor: 10, label: "10%" },
    { valor: 15, label: "15%" },
    { valor: 20, label: "20%" },
    { valor: 30, label: "30%" },
    { valor: 35, label: "35% (Cuarta Edad)" }
  ];

  // Buscar materiales cuando se escribe
  useEffect(() => {
    if (busquedaMaterial.trim() === "" || !materialesStock.length) {
      setMaterialesEncontrados([]);
      setMostrarResultadosMaterial(false);
      return;
    }

    const searchNormalized = normalizeText(busquedaMaterial);
    
    const encontrados = materialesStock.filter(m => {
      const codigoMaterial = normalizeText(m.codigo_material?.toString() || '');
      const nombreMaterial = normalizeSearch(m.nombre || '');
      const tipoMaterial = normalizeSearch(m.tipo_material || '');
      
      return codigoMaterial.includes(searchNormalized) ||
             nombreMaterial.includes(searchNormalized) ||
             tipoMaterial.includes(searchNormalized);
    });

    setMaterialesEncontrados(encontrados);
    setMostrarResultadosMaterial(encontrados.length > 0);
  }, [busquedaMaterial, materialesStock]);

  // Autocompletar material seleccionado
  const handleSeleccionarMaterial = (materialStock, index) => {
    actualizarMaterial(index, "tipo", materialStock.nombre);
    actualizarMaterial(index, "precio", materialStock.costo || 0);
    actualizarMaterial(index, "codigo_material", materialStock.codigo_material);
    
    // Calcular costo automáticamente si hay peso
    const pesoActual = materiales[index]?.peso || 0;
    if (pesoActual && materialStock.costo) {
      const costo = parseFloat(pesoActual) * parseFloat(materialStock.costo);
      actualizarMaterial(index, "costo", costo);
    }
    
    setBusquedaMaterial("");
    setMostrarResultadosMaterial(false);
    setMaterialIndexActivo(null);
  };

  // Manejar selección de descuento
  const handleSeleccionarDescuento = (valor) => {
    setDescuentos(valor);
    setMostrarDropdownDescuentos(false);
  };

  // Obtener la etiqueta del descuento seleccionado
  const getDescuentoLabel = () => {
    const opcion = opcionesDescuento.find(op => op.valor === parseFloat(descuentos));
    return opcion ? opcion.label : "Seleccionar descuento";
  };

  return (
    <div className="datos-adicionales">
      {/* MATERIALES - MEJORADO */}
      <div className="materiales-seccion">
        <h4>Materiales Utilizados</h4>
        {materiales.map((material, index) => (
          <div 
            key={index} 
            className={`material-bloque ${material.eliminando ? 'eliminando' : ''}`}
          >
            <div className="material-contenido">
              <div className="material-fila">
                <div className="campo-material" style={{ position: 'relative' }}>
                  <label>Tipo de Material *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Buscar material por código, nombre..."
                      value={
                        materialIndexActivo === index 
                          ? busquedaMaterial 
                          : material.tipo || busquedaMaterial
                      }
                      onChange={(e) => {
                        setBusquedaMaterial(e.target.value);
                        setMaterialIndexActivo(index);
                      }}
                      onFocus={() => {
                        setMaterialIndexActivo(index);
                        if (busquedaMaterial) setMostrarResultadosMaterial(true);
                      }}
                      className={errores?.[`material-${index}-tipo`] ? 'campo-error' : ''}
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

                  {/* Resultados de búsqueda de materiales */}
                  {mostrarResultadosMaterial && materialIndexActivo === index && materialesEncontrados.length > 0 && (
                    <div className="resultados-busqueda">
                      {materialesEncontrados.map(mat => (
                        <div 
                          key={mat.codigo_material}
                          className="resultado-item"
                          onClick={() => handleSeleccionarMaterial(mat, index)}
                        >
                          <div>
                            <strong>{mat.nombre}</strong>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                              Código: {mat.codigo_material} | Precio: L. {mat.costo}/gr
                              {mat.tipo_material && ` | Tipo: ${mat.tipo_material}`}
                            </div>
                            {mat.descripcion && (
                              <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                {mat.descripcion}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {busquedaMaterial && materialIndexActivo === index && !mostrarResultadosMaterial && materialesEncontrados.length === 0 && (
                    <div className="sin-resultados">
                      No se encontraron materiales
                    </div>
                  )}

                  {errores?.[`material-${index}-tipo`] && (
                    <span className="mensaje-error">{errores[`material-${index}-tipo`]}</span>
                  )}
                </div>

                <div className="campo-material">
                  <label>Peso (gr) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Peso en gramos"
                    value={material.peso}
                    onChange={(e) => {
                      actualizarMaterial(index, "peso", e.target.value);
                      // Recalcular costo automáticamente
                      if (material.precio && e.target.value) {
                        const costo = parseFloat(e.target.value) * parseFloat(material.precio);
                        actualizarMaterial(index, "costo", costo);
                      }
                    }}
                    className={errores?.[`material-${index}-peso`] ? 'campo-error' : ''}
                  />
                  {errores?.[`material-${index}-peso`] && (
                    <span className="mensaje-error">{errores[`material-${index}-peso`]}</span>
                  )}
                </div>

                <div className="campo-material">
                  <label>Precio por gr *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Precio por gramo"
                    value={material.precio}
                    onChange={(e) => {
                      actualizarMaterial(index, "precio", e.target.value);
                      // Recalcular costo automáticamente
                      if (material.peso && e.target.value) {
                        const costo = parseFloat(material.peso) * parseFloat(e.target.value);
                        actualizarMaterial(index, "costo", costo);
                      }
                    }}
                    className={errores?.[`material-${index}-precio`] ? 'campo-error' : ''}
                  />
                  {errores?.[`material-${index}-precio`] && (
                    <span className="mensaje-error">{errores[`material-${index}-precio`]}</span>
                  )}
                </div>

                <div className="campo-material costo-material">
                  <label>Costo Total</label>
                  <input
                    type="number"
                    value={material.costo || 0}
                    readOnly
                    className="campo-solo-lectura"
                  />
                </div>

                <div className="acciones-material">
                  <button
                    type="button"
                    className="btn-eliminar-material"
                    onClick={() => borrarMaterial(index)}
                    disabled={materiales.length === 1}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
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
      </div>

      {/* COSTOS ADICIONALES */}
      <div className="costos-adicionales">
        <div className="fila-costos">
          <div className="campo-costo">
            <label>Costo de Insumos *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Costo de insumos adicionales"
              value={costoInsumos}
              onChange={(e) => setCostoInsumos(e.target.value)}
              className={errores?.costoInsumos ? 'campo-error' : ''}
            />
            {errores?.costoInsumos && (
              <span className="mensaje-error">{errores.costoInsumos}</span>
            )}
          </div>
          <div className="campo-costo">
            <label>Mano de Obra *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Costo de mano de obra"
              value={manoObra}
              onChange={(e) => setManoObra(e.target.value)}
              className={errores?.manoObra ? 'campo-error' : ''}
            />
            {errores?.manoObra && (
              <span className="mensaje-error">{errores.manoObra}</span>
            )}
          </div>
          <div className="campo-costo">
            <label>Descuentos o Rebajas</label>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="dropdown-trigger"
                onClick={() => setMostrarDropdownDescuentos(!mostrarDropdownDescuentos)}
              >
                {getDescuentoLabel()}
                <span style={{ float: 'right', marginLeft: '8px' }}>▼</span>
              </button>
              
              {mostrarDropdownDescuentos && (
                <>
                  {/* Overlay para cerrar al hacer clic fuera */}
                  <div 
                    className="dropdown-overlay"
                    onClick={() => setMostrarDropdownDescuentos(false)}
                  />
                  <div className="dropdown-menu">
                    {opcionesDescuento.map((opcion) => (
                      <div
                        key={opcion.valor}
                        className={`dropdown-option ${
                          parseFloat(descuentos) === opcion.valor ? 'selected' : ''
                        }`}
                        data-value={opcion.valor}
                        onClick={() => handleSeleccionarDescuento(opcion.valor)}
                      >
                        {opcion.label}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RESUMEN DE COSTOS */}
      <div className="resumen-costos">
        <h4>Resumen de Costos</h4>
        <div className="costos-totales">
          <div className="costo-total">
            <span>Total Materiales:</span>
            <span>L. {materiales.reduce((acc, m) => acc + (parseFloat(m.costo) || 0), 0).toFixed(2)}</span>
          </div>
          <div className="costo-total">
            <span>Total Insumos:</span>
            <span>L. {parseFloat(costoInsumos || 0).toFixed(2)}</span>
          </div>
          <div className="costo-total">
            <span>Mano de Obra:</span>
            <span>L. {parseFloat(manoObra || 0).toFixed(2)}</span>
          </div>
          {descuentos > 0 && (
            <div className="costo-total descuento-aplicado">
              <span>Descuento ({descuentos}%):</span>
              <span>- L. {(
                (materiales.reduce((acc, m) => acc + (parseFloat(m.costo) || 0), 0) +
                parseFloat(costoInsumos || 0) +
                parseFloat(manoObra || 0)) * (parseFloat(descuentos) / 100)
              ).toFixed(2)}</span>
            </div>
          )}
          <div className="costo-total total-final">
            <span>Subtotal:</span>
            <span>L. {(
              (materiales.reduce((acc, m) => acc + (parseFloat(m.costo) || 0), 0) +
              parseFloat(costoInsumos || 0) +
              parseFloat(manoObra || 0)) * (1 - (parseFloat(descuentos) / 100))
            ).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}