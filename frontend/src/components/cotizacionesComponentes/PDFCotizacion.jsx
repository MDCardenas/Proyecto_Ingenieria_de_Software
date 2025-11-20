// components/cotizacionesComponentes/PDFCotizacion.jsx
import React from "react";
import '../../styles/scss/components/_formatofactura.scss';
import '../../styles/scss/components/_modaldetalle.scss';

export default function PDFCotizacion({
  tipoCotizacion,
  datosCliente,
  productos,
  materiales,
  resultados,
  descuentos,
  datosCotizacion,
  costoInsumos,
  manoObra
}) {
  // Usar fecha de la cotización si existe, sino usar fecha actual
  const fechaCotizacion = datosCotizacion?.fecha 
    ? new Date(datosCotizacion.fecha).toLocaleDateString('es-HN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    : new Date().toLocaleDateString('es-HN');

  // Generar número de cotización
  const numeroCotizacion = datosCotizacion?.numero_cotizacion 
    ? `COT-FAB-${String(datosCotizacion.numero_cotizacion).padStart(6, '0')}`
    : `COT-FAB-${Date.now().toString().slice(-6)}`;

  return (
    <div className="formato-factura-pdf">
      {/* Encabezado moderno */}
      <div className="encabezado-moderno">
        <div className="membrete-empresa">
          <div className="logo-empresa">
            <h1>JOYAS CHARLY'S</h1>
            <div className="linea-decorativa"></div>
          </div>
          <div className="info-empresa">
            <p><strong>Especialistas en Joyería Fina</strong></p>
            <p>Bo. El Centro, Ave Máximo Jerez, Casa 820, Tegucigalpa. </p>
            <p>Tel: +504 9971-7820 y +504 9833-2595 | Email: joyascharlys@gmail.com</p>
            <p>RTN: 0801-1990-12345</p>
          </div>
        </div>
        
        <div className="encabezado-derecho">
          <div className="badge-tipo" style={{backgroundColor: '#2E7D32'}}>COTIZACIÓN</div>
          <div className="info-factura">
            <h2 style={{color: '#2E7D32'}}>COTIZACIÓN DE FABRICACIÓN</h2>
            <div className="datos-factura">
              <div className="dato-factura">
                <span className="etiqueta">No.:</span>
                <span className="valor">{numeroCotizacion}</span>
              </div>
              <div className="dato-factura">
                <span className="etiqueta">Fecha:</span>
                <span className="valor">{fechaCotizacion}</span>
              </div>
              <div className="dato-factura">
                <span className="etiqueta">Válida hasta:</span>
                <span className="valor">
                  {new Date(new Date().setDate(new Date().getDate() + 30)).toLocaleDateString('es-HN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información del cliente */}
      <div className="seccion-cliente">
        <div className="titulo-seccion">
          <span>INFORMACIÓN DEL CLIENTE</span>
        </div>
        <div className="contenido-seccion">
          <div className="grid-cliente">
            <div className="campo-cliente">
              <span className="etiqueta">Nombre:</span>
              <span className="valor">{datosCliente.nombre || 'No especificado'}</span>
            </div>
            <div className="campo-cliente">
              <span className="etiqueta">Dirección:</span>
              <span className="valor">{datosCliente.direccion || 'No especificada'}</span>
            </div>
            <div className="campo-cliente">
              <span className="etiqueta">Teléfono:</span>
              <span className="valor">{datosCliente.telefono || 'No especificado'}</span>
            </div>
            <div className="campo-cliente">
              <span className="etiqueta">RTN:</span>
              <span className="valor">{datosCliente.rtn || 'No especificado'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detalles de la cotización de fabricación */}
      <div className="seccion-detalles">
        <div className="titulo-seccion">
          <span>DETALLES DE LA COTIZACIÓN</span>
        </div>
        <div className="contenido-seccion">
          
          {/* Productos/Servicios cotizados */}
          <div className="productos-cotizados">
            <h4>Producto(s) a Fabricar:</h4>
            <table className="tabla-moderna">
              <thead>
                <tr>
                  <th width="15%">Código Boceto</th>
                  <th width="25%">Nombre del Diseño</th>
                  <th width="10%">Cantidad</th>
                  <th width="25%">Descripción</th>
                  <th width="15%">Precio Unitario</th>
                  <th width="10%">Total</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto, index) => (
                  <tr key={index}>
                    <td className="texto-centro">{producto.codigo || 'N/A'}</td>
                    <td className="texto-izquierda">{producto.producto || 'Producto no especificado'}</td>
                    <td className="texto-centro">{producto.cantidad}</td>
                    <td className="texto-izquierda">{producto.descripcion || 'Sin descripción'}</td>
                    <td className="texto-derecha">L. {parseFloat(producto.precio || 0).toFixed(2)}</td>
                    <td className="texto-derecha">L. {(parseFloat(producto.cantidad || 0) * parseFloat(producto.precio || 0)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Materiales a utilizar */}
          {materiales && materiales.length > 0 && (
            <div className="materiales-utilizados">
              <h4>Materiales a Utilizar:</h4>
              <table className="tabla-moderna">
                <thead>
                  <tr>
                    <th width="40%">Tipo de Material</th>
                    <th width="15%">Peso (gr)</th>
                    <th width="20%">Precio por gr</th>
                    <th width="25%">Costo Total</th>
                  </tr>
                </thead>
                <tbody>
                  {materiales.map((material, index) => (
                    <tr key={index}>
                      <td className="texto-izquierda">{material.tipo_material || material.tipo || 'No especificado'}</td>
                      <td className="texto-derecha">{parseFloat(material.peso_gramos || material.peso || 0).toFixed(2)}</td>
                      <td className="texto-derecha">L. {parseFloat(material.precio_por_gramo || material.precio || 0).toFixed(2)}</td>
                      <td className="texto-derecha">L. {parseFloat(material.costo_total || material.costo || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="total-materiales">
                    <td colSpan="3" className="texto-derecha"><strong>Total Materiales:</strong></td>
                    <td className="texto-derecha">
                      <strong>L. {materiales.reduce((sum, material) => sum + parseFloat(material.costo_total || material.costo || 0), 0).toFixed(2)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Costos adicionales */}
          <div className="costos-adicionales">
            <h4>Costos Adicionales:</h4>
            <div className="grid-costos">
              <div className="costo-item">
                <span>Costo de Insumos:</span>
                <span>L. {parseFloat(costoInsumos || 0).toFixed(2)}</span>
              </div>
              <div className="costo-item">
                <span>Mano de Obra:</span>
                <span>L. {parseFloat(manoObra || 0).toFixed(2)}</span>
              </div>
              {parseFloat(descuentos || 0) > 0 && (
                <div className="costo-item descuento">
                  <span>Descuentos Aplicados:</span>
                  <span>- L. {parseFloat(descuentos || 0).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resumen financiero */}
      <div className="seccion-resumen">
        <div className="titulo-seccion">
          <span>RESUMEN FINANCIERO</span>
        </div>
        <div className="contenido-seccion">
          <div className="resumen-grid">
            <div className="linea-resumen">
              <span>Subtotal:</span>
              <span>L. {parseFloat(resultados.subtotal || 0).toFixed(2)}</span>
            </div>
            {parseFloat(descuentos || 0) > 0 && (
              <div className="linea-resumen descuento">
                <span>Descuentos:</span>
                <span>- L. {parseFloat(descuentos || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="linea-resumen">
              <span>ISV (15%):</span>
              <span>L. {parseFloat(resultados.isv || 0).toFixed(2)}</span>
            </div>
            <div className="linea-resumen total">
              <span><strong>TOTAL COTIZACIÓN:</strong></span>
              <span><strong>L. {parseFloat(resultados.total || 0).toFixed(2)}</strong></span>
            </div>
            
            {/* Condiciones de pago para fabricación */}
            <div className="condiciones-pago">
              <div className="linea-resumen anticipo">
                <span>Anticipo Requerido (50%):</span>
                <span>L. {parseFloat(resultados.anticipo || 0).toFixed(2)}</span>
              </div>
              <div className="linea-resumen pendiente">
                <span>Saldo Pendiente:</span>
                <span>L. {parseFloat(resultados.pagoPendiente || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Términos y condiciones */}
      <div className="seccion-terminos">
        <div className="titulo-seccion">
          <span>TÉRMINOS Y CONDICIONES</span>
        </div>
        <div className="contenido-seccion">
          <div className="terminos-lista">
            <p>1. Esta cotización es válida por 30 días a partir de la fecha de emisión.</p>
            <p>2. Para iniciar la fabricación se requiere el 50% de anticipo.</p>
            <p>3. El tiempo de fabricación estimado es de 15-20 días hábiles.</p>
            <p>4. El saldo pendiente debe cancelarse al momento de la entrega.</p>
            <p>5. Los precios incluyen ISV (15%).</p>
            <p>6. Cualquier modificación al diseño puede afectar el precio final.</p>
          </div>
        </div>
      </div>

      {/* Observaciones */}
      <div className="seccion-final">
        <div className="observaciones">
          <div className="titulo-seccion">
            <span>OBSERVACIONES</span>
          </div>
          <div className="contenido-observaciones">
            <p>{datosCotizacion?.observaciones || 'Ninguna observación adicional.'}</p>
          </div>
        </div>
        
        <div className="firmas">
          <div className="firma-cliente">
            <div className="linea-firma"></div>
            <p>Aceptación del Cliente</p>
          </div>
          <div className="firma-empresa">
            <div className="linea-firma"></div>
            <p>JOYAS CHARLY'S</p>
            <p>Representante Autorizado</p>
          </div>
        </div>
      </div>

      {/* Pie de página */}
      <div className="pie-pagina">
        <p><strong><em>"Cotización sujeta a aprobación. Joyas que cuentan historias, elegancia que perdura."</em></strong></p>
        <p>Para consultas o aprobación de esta cotización contactar al: +504 9971-7820</p>
      </div>
    </div>
  );
}