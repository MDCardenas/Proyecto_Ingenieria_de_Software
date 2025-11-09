import React from "react";

export default function FormatoFactura({
  tipoFactura,
  datosCliente,
  productos,
  materiales,
  resultados,
  descuentos,
  datosFactura
}) {
  // Usar fecha de la factura si existe, sino usar fecha actual
  const fechaFactura = datosFactura?.fecha 
    ? new Date(datosFactura.fecha).toLocaleDateString('es-HN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    : new Date().toLocaleDateString('es-HN');

  // Usar número de factura real si existe, sino generar uno temporal
  const numeroFactura = datosFactura?.numero_factura 
    ? `FAC-${tipoFactura}-${String(datosFactura.numero_factura).padStart(6, '0')}`
    : `FAC-${tipoFactura}-${Date.now().toString().slice(-6)}`;

  return (
    <div className="formato-factura-pdf">
      {/* Encabezado moderno */}
      <div className="encabezado-moderno">
        <div className="membrete-empresa">
          <div className="logo-empresa">
            <h1>JOYERÍA LA ELEGANCIA</h1>
            <div className="linea-decorativa"></div>
          </div>
          <div className="info-empresa">
            <p><strong>Especialistas en Joyería Fina</strong></p>
            <p>Centro Comercial Galerías, Tegucigalpa</p>
            <p>Tel: +504 2233-4455 | Email: info@joyerialaelegancia.com</p>
            <p>RTN: 0801-1990-12345</p>
          </div>
        </div>
        
        <div className="encabezado-derecho">
          <div className="badge-tipo">{tipoFactura}</div>
          <div className="info-factura">
            <h2>FACTURA</h2>
            <div className="datos-factura">
              <div className="dato-factura">
                <span className="etiqueta">No.:</span>
                <span className="valor">{numeroFactura}</span>
              </div>
              <div className="dato-factura">
                <span className="etiqueta">Fecha:</span>
                <span className="valor">{fechaFactura}</span>
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

      {/* Detalles según tipo de factura */}
      {tipoFactura === "VENTA" && (
        <div className="seccion-detalles">
          <div className="titulo-seccion">
            <span>DETALLES DE VENTA</span>
          </div>
          <div className="contenido-seccion">
            <table className="tabla-moderna">
              <thead>
                <tr>
                  <th width="12%">Código</th>
                  <th width="20%">Producto</th>
                  <th width="28%">Descripción</th>
                  <th width="10%">Cantidad</th>
                  <th width="15%">Precio Unit.</th>
                  <th width="15%">Total</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto, index) => (
                  <tr key={index}>
                    <td className="texto-centro">{producto.codigo || 'N/A'}</td>
                    <td className="texto-izquierda">{producto.producto || 'Producto no especificado'}</td>
                    <td className="texto-izquierda">{producto.descripcion || 'Sin descripción'}</td>
                    <td className="texto-centro">{producto.cantidad}</td>
                    <td className="texto-derecha">L. {parseFloat(producto.precio || 0).toFixed(2)}</td>
                    <td className="texto-derecha">L. {(parseFloat(producto.cantidad || 0) * parseFloat(producto.precio || 0)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tipoFactura === "FABRICACION" && (
        <div className="seccion-detalles">
          <div className="titulo-seccion">
            <span>DETALLES DE FABRICACIÓN</span>
          </div>
          <div className="contenido-seccion">
            <div className="descripcion-boceto">
              <h4>Descripción del Boceto:</h4>
              <div className="contenido-descripcion">
                {productos[0]?.descripcion || 'No se proporcionó descripción'}
              </div>
            </div>

            {materiales && materiales.length > 0 && (
              <div className="materiales-utilizados">
                <h4>Materiales Utilizados:</h4>
                <table className="tabla-moderna">
                  <thead>
                    <tr>
                      <th width="40%">Tipo</th>
                      <th width="20%">Peso (gr)</th>
                      <th width="20%">Precio por gr</th>
                      <th width="20%">Costo Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materiales.map((material, index) => (
                      <tr key={index}>
                        <td className="texto-izquierda">{material.tipo || 'No especificado'}</td>
                        <td className="texto-derecha">{parseFloat(material.peso || 0).toFixed(2)}</td>
                        <td className="texto-derecha">L. {parseFloat(material.precio || 0).toFixed(2)}</td>
                        <td className="texto-derecha">L. {parseFloat(material.costo || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tipoFactura === "REPARACION" && (
        <div className="seccion-detalles">
          <div className="titulo-seccion">
            <span>DETALLES DE REPARACIÓN</span>
          </div>
          <div className="contenido-seccion">
            <div className="info-reparacion">
              <div className="grid-reparacion">
                <div className="campo-reparacion">
                  <span className="etiqueta">Tipo de Joya:</span>
                  <span className="valor">{productos[0]?.tipoJoya || 'No especificado'}</span>
                </div>
                <div className="campo-reparacion">
                  <span className="etiqueta">Tipo de Reparación:</span>
                  <span className="valor">{productos[0]?.tipoReparacion || 'No especificado'}</span>
                </div>
              </div>
              <div className="descripcion-dano">
                <span className="etiqueta">Descripción del Daño:</span>
                <div className="contenido-descripcion">
                  {productos[0]?.descripcion || 'No se proporcionó descripción'}
                </div>
              </div>
            </div>

            {materiales && materiales.length > 0 && (
              <div className="materiales-utilizados">
                <h4>Materiales Utilizados en Reparación:</h4>
                <table className="tabla-moderna">
                  <thead>
                    <tr>
                      <th width="40%">Tipo</th>
                      <th width="20%">Peso (gr)</th>
                      <th width="20%">Precio por gr</th>
                      <th width="20%">Costo Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materiales.map((material, index) => (
                      <tr key={index}>
                        <td className="texto-izquierda">{material.tipo || 'No especificado'}</td>
                        <td className="texto-derecha">{parseFloat(material.peso || 0).toFixed(2)}</td>
                        <td className="texto-derecha">L. {parseFloat(material.precio || 0).toFixed(2)}</td>
                        <td className="texto-derecha">L. {parseFloat(material.costo || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

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
              <span><strong>TOTAL:</strong></span>
              <span><strong>L. {parseFloat(resultados.total || 0).toFixed(2)}</strong></span>
            </div>
            
            {(tipoFactura === "FABRICACION" || tipoFactura === "REPARACION") && (
              <>
                <div className="linea-resumen anticipo">
                  <span>Anticipo (50%):</span>
                  <span>L. {parseFloat(resultados.anticipo || 0).toFixed(2)}</span>
                </div>
                <div className="linea-resumen pendiente">
                  <span>Pago Pendiente:</span>
                  <span>L. {parseFloat(resultados.pagoPendiente || 0).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Observaciones y firmas */}
      <div className="seccion-final">
        <div className="observaciones">
          <div className="titulo-seccion">
            <span>OBSERVACIONES</span>
          </div>
          <div className="contenido-observaciones">
            <p>{datosFactura?.observaciones || 'Ninguna'}</p>
          </div>
        </div>
        
        <div className="firmas">
          <div className="firma-cliente">
            <div className="linea-firma"></div>
            <p>Firma del Cliente</p>
          </div>
          <div className="firma-empresa">
            <div className="linea-firma"></div>
            <p>JOYERÍA LA ELEGANCIA</p>
          </div>
        </div>
      </div>

      {/* Pie de página */}
      <div className="pie-pagina">
        <p><strong><em>"Gracias por su preferencia. Joyas que cuentan historias, elegancia que perdura."</em></strong></p>
        <p>Para consultas o aclaraciones contactar al: +504 2233-4455</p>
      </div>
    </div>
  );
}