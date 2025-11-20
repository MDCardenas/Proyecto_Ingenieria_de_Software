// components/cotizacionesComponentes/Material.jsx
import React, { useState, useEffect } from "react";
import { FaTrash, FaSearch, FaTimes } from "react-icons/fa";
import { normalizeText } from "../../utils/normalize";
import "../../styles/scss/components/_cotizacionFabricacion.scss";

export default function Material({
  id,
  tipo_material,
  peso_gramos,
  precio_por_gramo,
  costo_total,
  onActualizar,
  onBorrar,
  errores,
  materialIndex,
  materialesStock = []
}) {
  // Estados para búsqueda inteligente de materiales
  const [busquedaMaterial, setBusquedaMaterial] = useState("");
  const [mostrarResultadosMaterial, setMostrarResultadosMaterial] = useState(false);
  const [materialesEncontrados, setMaterialesEncontrados] = useState([]);

  // Buscar materiales cuando se escribe en el campo
  useEffect(() => {
    if (busquedaMaterial.trim() === "" || !materialesStock.length) {
      setMaterialesEncontrados([]);
      setMostrarResultadosMaterial(false);
      return;
    }

    const searchNormalized = normalizeText(busquedaMaterial);
    
    const encontrados = materialesStock.filter(m => {
      const codigoMat = normalizeText(m.codigo_material?.toString() || '');
      const nombreMat = normalizeText(m.nombre || m.tipo_material || '');
      const tipoMat = normalizeText(m.tipo_material || '');
      const descripcionMat = normalizeText(m.descripcion || '');
      const proveedorMat = normalizeText(m.provedor_nombre || '');
      
      return codigoMat.includes(searchNormalized) ||
             nombreMat.includes(searchNormalized) ||
             tipoMat.includes(searchNormalized) ||
             descripcionMat.includes(searchNormalized) ||
             proveedorMat.includes(searchNormalized);
    });

    setMaterialesEncontrados(encontrados);
    setMostrarResultadosMaterial(encontrados.length > 0);
  }, [busquedaMaterial, materialesStock]);

  // Autocompletar cuando se selecciona un material
  const handleSeleccionarMaterial = (materialStock) => {
    console.log("Material seleccionado para autocompletar:", materialStock);
    
    // Obtener nombre del material
    const nombreMaterial = materialStock.nombre || materialStock.tipo_material || '';
    
    // Obtener precio - USAR LA PROPIEDAD CORRECTA "costo"
    let precioMaterial = 0;
    
    // Buscar en diferentes propiedades de precio
    if (materialStock.costo !== undefined && materialStock.costo !== null) {
      precioMaterial = parseFloat(materialStock.costo) || 0;
    } else if (materialStock.precio_por_gramo !== undefined) {
      precioMaterial = materialStock.precio_por_gramo;
    } else if (materialStock.precio !== undefined) {
      precioMaterial = materialStock.precio;
    } else if (materialStock.precio_gramo !== undefined) {
      precioMaterial = materialStock.precio_gramo;
    } else if (materialStock.precio_unitario !== undefined) {
      precioMaterial = materialStock.precio_unitario;
    } else if (materialStock.valor !== undefined) {
      precioMaterial = materialStock.valor;
    }
    
    console.log("Nombre material:", nombreMaterial);
    console.log("Precio material (costo):", precioMaterial);
    
    onActualizar(id, "tipo_material", nombreMaterial);
    onActualizar(id, "precio_por_gramo", precioMaterial);
    
    setBusquedaMaterial("");
    setMostrarResultadosMaterial(false);
  };

  // Manejar cambio en el campo de búsqueda
  const handleBusquedaChange = (value) => {
    setBusquedaMaterial(value);
    // Si el campo está vacío, limpiar también el tipo de material
    if (!value.trim()) {
      onActualizar(id, "tipo_material", "");
      onActualizar(id, "precio_por_gramo", "");
    }
  };

  // Limpiar selección de material
  const limpiarMaterial = () => {
    onActualizar(id, "tipo_material", "");
    onActualizar(id, "precio_por_gramo", "");
    setBusquedaMaterial("");
    setMostrarResultadosMaterial(false);
  };

  // Función para obtener el precio de un material (para mostrar en resultados)
  const obtenerPrecioMaterial = (material) => {
    // PRIORIDAD: usar la propiedad "costo" que es la que existe en los datos
    if (material.costo !== undefined && material.costo !== null) {
      return parseFloat(material.costo) || 0;
    }
    if (material.precio_por_gramo !== undefined) return material.precio_por_gramo;
    if (material.precio !== undefined) return material.precio;
    if (material.precio_gramo !== undefined) return material.precio_gramo;
    if (material.precio_unitario !== undefined) return material.precio_unitario;
    if (material.valor !== undefined) return material.valor;
    return 0;
  };

  // Función para obtener información adicional del material
  const obtenerInfoAdicional = (material) => {
    const info = [];
    
    if (material.tipo_material) {
      info.push(`Tipo: ${material.tipo_material}`);
    }
    if (material.quilates) {
      info.push(`Quilates: ${material.quilates}`);
    }
    if (material.pureza) {
      info.push(`Pureza: ${material.pureza}`);
    }
    if (material.provedor_nombre) {
      info.push(`Proveedor: ${material.provedor_nombre}`);
    }
    if (material.cantidad_existencia !== undefined) {
      info.push(`Stock: ${material.cantidad_existencia}g`);
    }
    
    return info.join(' | ');
  };

  return (
    <div className="material-bloque">
      <div className="material-contenido">
        <div className="material-header">
          <h3>Material #{materialIndex + 1}</h3>
          <button
            type="button"
            className="btn-eliminar-material"
            onClick={() => onBorrar(id)}
          >
            <FaTrash />
          </button>
        </div>

        <div className="material-grid">
          {/* CAMPO DE BÚSQUEDA DE MATERIAL */}
          <div className="campo-material-full">
            <label>Tipo de Material *</label>
            {!tipo_material ? (
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Buscar material por nombre, código o tipo..."
                    value={busquedaMaterial}
                    onChange={(e) => handleBusquedaChange(e.target.value)}
                    onFocus={() => busquedaMaterial && setMostrarResultadosMaterial(true)}
                    className={errores?.[`material-${materialIndex}-tipo_material`] ? 'campo-error' : ''}
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
                {mostrarResultadosMaterial && materialesEncontrados.length > 0 && (
                  <div className="resultados-busqueda">
                    {materialesEncontrados.map((mat, index) => {
                      const precio = obtenerPrecioMaterial(mat);
                      const infoAdicional = obtenerInfoAdicional(mat);
                      
                      return (
                        <div 
                          key={mat.codigo_material || mat.id || index}
                          className="resultado-item"
                          onClick={() => handleSeleccionarMaterial(mat)}
                        >
                          <div>
                            <strong>{mat.nombre || mat.tipo_material || 'Material sin nombre'}</strong>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                              Código: {mat.codigo_material || 'N/A'} | Precio: L. {precio.toFixed(2)}/g
                            </div>
                            {infoAdicional && (
                              <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                {infoAdicional}
                              </div>
                            )}
                            {mat.descripcion && (
                              <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                {mat.descripcion}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {busquedaMaterial && !mostrarResultadosMaterial && materialesEncontrados.length === 0 && (
                  <div className="sin-resultados">
                    No se encontraron materiales con "{busquedaMaterial}"
                  </div>
                )}

                {errores?.[`material-${materialIndex}-tipo_material`] && (
                  <span className="mensaje-error">{errores[`material-${materialIndex}-tipo_material`]}</span>
                )}
              </div>
            ) : (
              <div className="seleccion-mostrada">
                <div style={{ flex: 1 }}>
                  <strong>{tipo_material}</strong>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    Precio: L. {precio_por_gramo}/g
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={limpiarMaterial}
                  className="btn-limpiar-seleccion"
                  title="Cambiar material"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>

          {/* PESO EN GRAMOS */}
          <div className="campo-material">
            <label>Peso (gramos) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Peso en gramos"
              value={peso_gramos}
              onChange={(e) => onActualizar(id, "peso_gramos", parseFloat(e.target.value) || 0)}
              className={errores?.[`material-${materialIndex}-peso_gramos`] ? 'campo-error' : ''}
            />
            {errores?.[`material-${materialIndex}-peso_gramos`] && (
              <span className="mensaje-error">{errores[`material-${materialIndex}-peso_gramos`]}</span>
            )}
          </div>

          {/* PRECIO POR GRAMO */}
          <div className="campo-material">
            <label>Precio por Gramo (L.) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Precio por gramo"
              value={precio_por_gramo}
              onChange={(e) => onActualizar(id, "precio_por_gramo", parseFloat(e.target.value) || 0)}
              className={
                errores?.[`material-${materialIndex}-precio_por_gramo`] ? 'campo-error' : ''
              }
            />
            {errores?.[`material-${materialIndex}-precio_por_gramo`] && (
              <span className="mensaje-error">{errores[`material-${materialIndex}-precio_por_gramo`]}</span>
            )}
            {tipo_material && (
              <small className="form-hint" style={{ color: '#059669' }}>
                ✓ Precio cargado desde el inventario
              </small>
            )}
          </div>

          {/* COSTO TOTAL (CALCULADO) */}
          <div className="campo-material">
            <label>Costo Total (L.)</label>
            <input
              type="text"
              value={`L. ${costo_total.toFixed(2)}`}
              readOnly
              className="campo-calculado"
            />
            <small className="form-hint">✓ Calculado automáticamente (Peso × Precio)</small>
          </div>
        </div>
      </div>
    </div>
  );
}