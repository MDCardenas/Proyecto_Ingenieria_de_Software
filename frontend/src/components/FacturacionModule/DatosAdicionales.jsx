import React, { useState, useEffect } from "react";
import { FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import { normalizeText, normalizeSearch } from "../../utils/normalize";

// ============================================
// UTILIDADES DE VALIDACIÓN CON REGEX
// ============================================
const validaciones = {
    // Solo números y puntos decimales
    soloNumeros: (valor) => /^[0-9.]*$/.test(valor),
    
    // Peso en gramos (números decimales positivos)
    peso: (valor) => {
        const num = parseFloat(valor);
        return !isNaN(num) && num > 0 && num < 10000;
    },
    
    // Precio/Costo (números decimales mayores o iguales a 0)
    precio: (valor) => {
        const num = parseFloat(valor);
        return !isNaN(num) && num >= 0 && num < 1000000;
    },
    
    // Texto general (sin caracteres peligrosos)
    textoSeguro: (valor) => /^[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,;:()\-"'¿?¡!]*$/.test(valor),
};

// Función para sanitizar valores
const sanitizar = {
    numero: (valor) => parseFloat(valor) || 0,
    texto: (valor) => valor.trim().replace(/\s+/g, ' '),
};

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
  errores
}) {
  // Estado para búsqueda de materiales
  const [busquedaMaterial, setBusquedaMaterial] = useState("");
  const [mostrarResultadosMaterial, setMostrarResultadosMaterial] = useState(false);
  const [materialesEncontrados, setMaterialesEncontrados] = useState([]);
  const [materialIndexActivo, setMaterialIndexActivo] = useState(null);
  
  // Estados para validación local
  const [erroresLocal, setErroresLocal] = useState({});

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

  // Validar campo de material
  const validarCampoMaterial = (index, campo, valor) => {
    const erroresTemp = { ...erroresLocal };
    const key = `material-${index}-${campo}`;

    switch (campo) {
      case 'tipo':
        if (!valor || valor.trim() === '') {
          erroresTemp[key] = 'Debe seleccionar un tipo de material';
        } else {
          delete erroresTemp[key];
        }
        break;

      case 'peso':
        if (!valor || !validaciones.peso(valor)) {
          erroresTemp[key] = 'Peso inválido (debe ser mayor a 0 y menor a 10,000)';
        } else {
          delete erroresTemp[key];
        }
        break;

      case 'precio':
        if (!valor || !validaciones.precio(valor)) {
          erroresTemp[key] = 'Precio inválido (debe ser mayor o igual a 0)';
        } else {
          delete erroresTemp[key];
        }
        break;

      default:
        break;
    }

    setErroresLocal(erroresTemp);
    return Object.keys(erroresTemp).length === 0;
  };

  // Validar campo de costo
  const validarCampoCosto = (campo, valor) => {
    const erroresTemp = { ...erroresLocal };

    if (!validaciones.precio(valor)) {
      erroresTemp[campo] = 'Ingrese un valor numérico válido (0 - 999,999)';
    } else {
      delete erroresTemp[campo];
    }

    setErroresLocal(erroresTemp);
    return Object.keys(erroresTemp).length === 0;
  };

  // Manejar actualización de peso con validación
  const handlePesoChange = (index, valor) => {
    // Solo permitir números y punto decimal
    if (valor !== '' && !validaciones.soloNumeros(valor)) {
      return; // Bloquear caracteres inválidos
    }

    const valorNumerico = parseFloat(valor) || '';
    
    if (valorNumerico !== '' && !validaciones.peso(valorNumerico)) {
      return; // Bloquear si excede límites
    }

    validarCampoMaterial(index, 'peso', valorNumerico);
    actualizarMaterial(index, "peso", valor);
    
    // Recalcular costo automáticamente
    const material = materiales[index];
    if (material?.precio && valor) {
      const costo = parseFloat(valor) * parseFloat(material.precio);
      actualizarMaterial(index, "costo", costo);
    }
  };

  // Manejar actualización de precio con validación
  const handlePrecioChange = (index, valor) => {
    // Solo permitir números y punto decimal
    if (valor !== '' && !validaciones.soloNumeros(valor)) {
      return; // Bloquear caracteres inválidos
    }

    const valorNumerico = parseFloat(valor) || '';
    
    if (valorNumerico !== '' && !validaciones.precio(valorNumerico)) {
      return; // Bloquear si excede límites
    }

    validarCampoMaterial(index, 'precio', valorNumerico);
    actualizarMaterial(index, "precio", valor);
    
    // Recalcular costo automáticamente
    const material = materiales[index];
    if (material?.peso && valor) {
      const costo = parseFloat(material.peso) * parseFloat(valor);
      actualizarMaterial(index, "costo", costo);
    }
  };

  // Manejar actualización de costo con validación
  const handleCostoChange = (campo, setValue, valor) => {
    // Solo permitir números y punto decimal
    if (valor !== '' && !validaciones.soloNumeros(valor)) {
      return; // Bloquear caracteres inválidos
    }

    const valorNumerico = parseFloat(valor) || '';
    
    if (valorNumerico !== '' && !validaciones.precio(valorNumerico)) {
      return; // Bloquear si excede límites
    }

    validarCampoCosto(campo, valorNumerico);
    setValue(valor);
  };

  // Autocompletar material seleccionado
  const handleSeleccionarMaterial = (materialStock, index) => {
    actualizarMaterial(index, "tipo", materialStock.nombre);
    actualizarMaterial(index, "precio", materialStock.costo || 0);
    actualizarMaterial(index, "codigo_material", materialStock.codigo_material);
    
    // Validar que el material fue seleccionado
    validarCampoMaterial(index, 'tipo', materialStock.nombre);
    validarCampoMaterial(index, 'precio', materialStock.costo);
    
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

  // Combinar errores externos e internos
  const erroresCombinados = { ...errores, ...erroresLocal };

  // Calcular totales
  const totalMateriales = materiales.reduce((acc, m) => acc + (parseFloat(m.costo) || 0), 0);
  const totalInsumos = parseFloat(costoInsumos || 0);
  const totalManoObra = parseFloat(manoObra || 0);
  const totalDescuentos = parseFloat(descuentos || 0);
  const subtotal = totalMateriales + totalInsumos + totalManoObra - totalDescuentos;

  return (
    <div className="datos-adicionales">
      {/* MATERIALES - MEJORADO CON VALIDACIONES */}
      <div className="materiales-seccion">
        <h4>Materiales Utilizados</h4>
        {materiales.map((material, index) => (
          <div 
            key={index} 
            className={`material-bloque ${material.eliminando ? 'eliminando' : ''}`}
          >
            <div className="material-contenido">
              <div className="material-fila">
                {/* Tipo de Material con Búsqueda */}
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
                        const valor = e.target.value;
                        // Validar texto seguro
                        if (valor && !validaciones.textoSeguro(valor)) {
                          return; // Bloquear caracteres peligrosos
                        }
                        setBusquedaMaterial(valor);
                        setMaterialIndexActivo(index);
                      }}
                      onFocus={() => {
                        setMaterialIndexActivo(index);
                        if (busquedaMaterial) setMostrarResultadosMaterial(true);
                      }}
                      onBlur={() => {
                        // Validar cuando sale del campo
                        setTimeout(() => {
                          if (materialIndexActivo === index) {
                            validarCampoMaterial(index, 'tipo', material.tipo);
                          }
                        }, 200);
                      }}
                      className={erroresCombinados?.[`material-${index}-tipo`] ? 'campo-error' : ''}
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

                  {erroresCombinados?.[`material-${index}-tipo`] && (
                    <span className="mensaje-error">{erroresCombinados[`material-${index}-tipo`]}</span>
                  )}
                </div>

                {/* Peso con Validación */}
                <div className="campo-material">
                  <label>Peso (gr) *</label>
                  <input
                    type="number"
                    min="0"
                    max="9999.99"
                    step="0.01"
                    placeholder="Peso en gramos"
                    value={material.peso}
                    onChange={(e) => handlePesoChange(index, e.target.value)}
                    onBlur={() => validarCampoMaterial(index, 'peso', material.peso)}
                    className={erroresCombinados?.[`material-${index}-peso`] ? 'campo-error' : ''}
                  />
                  {erroresCombinados?.[`material-${index}-peso`] && (
                    <span className="mensaje-error">{erroresCombinados[`material-${index}-peso`]}</span>
                  )}
                  {!erroresCombinados?.[`material-${index}-peso`] && (
                    <small className="form-hint">Máx: 9,999.99 gr</small>
                  )}
                </div>

                {/* Precio con Validación */}
                <div className="campo-material">
                  <label>Precio por gr *</label>
                  <input
                    type="number"
                    min="0"
                    max="999999.99"
                    step="0.01"
                    placeholder="Precio por gramo"
                    value={material.precio}
                    onChange={(e) => handlePrecioChange(index, e.target.value)}
                    onBlur={() => validarCampoMaterial(index, 'precio', material.precio)}
                    className={erroresCombinados?.[`material-${index}-precio`] ? 'campo-error' : ''}
                  />
                  {erroresCombinados?.[`material-${index}-precio`] && (
                    <span className="mensaje-error">{erroresCombinados[`material-${index}-precio`]}</span>
                  )}
                  {!erroresCombinados?.[`material-${index}-precio`] && (
                    <small className="form-hint">Máx: L. 999,999.99</small>
                  )}
                </div>

                {/* Costo Total (Solo Lectura) */}
                <div className="campo-material costo-material">
                  <label>Costo Total</label>
                  <input
                    type="number"
                    value={(material.costo || 0).toFixed(2)}
                    readOnly
                    className="campo-solo-lectura"
                  />
                  <small className="form-hint" style={{ color: '#059669' }}>
                    ✓ Calculado automáticamente
                  </small>
                </div>

                {/* Botón Eliminar */}
                <div className="acciones-material">
                  <button
                    type="button"
                    className="btn-eliminar-material"
                    onClick={() => borrarMaterial(index)}
                    disabled={materiales.length === 1}
                    title={materiales.length === 1 ? "Debe mantener al menos un material" : "Eliminar material"}
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

      {/* COSTOS ADICIONALES CON VALIDACIÓN */}
      <div className="costos-adicionales">
        <h4>Costos Adicionales</h4>
        <div className="fila-costos">
          {/* Costo de Insumos */}
          <div className="campo-costo">
            <label>Costo de Insumos (L.) *</label>
            <input
              type="number"
              min="0"
              max="999999.99"
              step="0.01"
              placeholder="0.00"
              value={costoInsumos}
              onChange={(e) => handleCostoChange('costoInsumos', setCostoInsumos, e.target.value)}
              onBlur={() => validarCampoCosto('costoInsumos', costoInsumos)}
              className={erroresCombinados?.costoInsumos ? 'campo-error' : ''}
            />
            {erroresCombinados?.costoInsumos && (
              <span className="mensaje-error">{erroresCombinados.costoInsumos}</span>
            )}
            {!erroresCombinados?.costoInsumos && (
              <small className="form-hint">Máx: L. 999,999.99</small>
            )}
          </div>

          {/* Mano de Obra */}
          <div className="campo-costo">
            <label>Mano de Obra (L.) *</label>
            <input
              type="number"
              min="0"
              max="999999.99"
              step="0.01"
              placeholder="0.00"
              value={manoObra}
              onChange={(e) => handleCostoChange('manoObra', setManoObra, e.target.value)}
              onBlur={() => validarCampoCosto('manoObra', manoObra)}
              className={erroresCombinados?.manoObra ? 'campo-error' : ''}
            />
            {erroresCombinados?.manoObra && (
              <span className="mensaje-error">{erroresCombinados.manoObra}</span>
            )}
            {!erroresCombinados?.manoObra && (
              <small className="form-hint">Máx: L. 999,999.99</small>
            )}
          </div>

          {/* Descuentos */}
          <div className="campo-costo">
            <label>Descuentos o Rebajas (L.)</label>
            <input
              type="number"
              min="0"
              max="999999.99"
              step="0.01"
              placeholder="0.00"
              value={descuentos}
              onChange={(e) => handleCostoChange('descuentos', setDescuentos, e.target.value)}
              className={erroresCombinados?.descuentos ? 'campo-error' : ''}
            />
            {erroresCombinados?.descuentos && (
              <span className="mensaje-error">{erroresCombinados.descuentos}</span>
            )}
            {!erroresCombinados?.descuentos && (
              <small className="form-hint">Opcional - Máx: L. 999,999.99</small>
            )}
          </div>
        </div>
      </div>

      {/* RESUMEN DE COSTOS */}
      <div className="resumen-costos">
        <h4>Resumen de Costos</h4>
        <div className="costos-totales">
          <div className="costo-total">
            <span>Total Materiales:</span>
            <span>L. {totalMateriales.toFixed(2)}</span>
          </div>
          <div className="costo-total">
            <span>Total Insumos:</span>
            <span>L. {totalInsumos.toFixed(2)}</span>
          </div>
          <div className="costo-total">
            <span>Mano de Obra:</span>
            <span>L. {totalManoObra.toFixed(2)}</span>
          </div>
          {totalDescuentos > 0 && (
            <div className="costo-total descuento">
              <span>Descuentos:</span>
              <span className="texto-descuento">- L. {totalDescuentos.toFixed(2)}</span>
            </div>
          )}
          <div className="costo-total total-final">
            <span>SUBTOTAL:</span>
            <span className="monto-subtotal">L. {Math.max(0, subtotal).toFixed(2)}</span>
          </div>
        </div>

        {/* Indicador visual si hay errores */}
        {Object.keys(erroresCombinados).length > 0 && (
          <div className="alerta-validacion">
            <span>⚠️ Por favor corrija los errores antes de continuar</span>
          </div>
        )}
      </div>
    </div>
  );
}