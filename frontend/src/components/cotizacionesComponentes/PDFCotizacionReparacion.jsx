// components/cotizacionesComponentes/PDFCotizacionReparacion.jsx
import React from "react";
import '../../styles/scss/components/_formatoReparacion.scss';
import '../../styles/scss/components/_modaldetalle.scss';

export default function PDFCotizacionReparacion({
  tipoCotizacion,
  datosCliente,
  productos,
  materiales,
  resultados,
  descuentos,
  datosCotizacion,
  costoInsumos,
  manoObra,
  imagen_referencia // NUEVO: Prop para la imagen
}) {
  console.log("📄 DEBUG - En PDF component:");
  console.log("🖼️ imagen_referencia recibida:", imagen_referencia ? "EXISTE" : "NO EXISTE");
  
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
    ? `COT-REP-${String(datosCotizacion.numero_cotizacion).padStart(6, '0')}`
    : `COT-REP-${Date.now().toString().slice(-6)}`;

  // Función para formatear tipo de joya
  const formatearTipoJoya = (tipo) => {
    const tipos = {
      'ANILLO': 'Anillo',
      'CADENA': 'Cadena', 
      'PULSERA': 'Pulsera',
      'ARETES': 'Aretes',
      'DIJE': 'Dije',
      'OTRO': 'Otro'
    };
    return tipos[tipo] || tipo;
  };

  // Función para formatear tipo de reparación
  const formatearTipoReparacion = (tipo) => {
    const tipos = {
      'SOLDADURA': 'Soldadura',
      'LIMPIEZA_PROFESIONAL': 'Limpieza',
      'ENGARSE_PIEDRAS': 'Engarse',
      'PULIDO_BRILLADO': 'Pulido',
      'AJUSTE_TAMAÑO': 'Ajuste',
      'OTRO': 'Otro'
    };
    return tipos[tipo] || tipo;
  };

  return (
    <div className="formato-factura-pdf">
      {/* PRIMERA PÁGINA - Contenido original */}
      <div className="pagina-1">
        {/* Encabezado moderno CON DIRECCIÓN */}
        <div className="encabezado-moderno">
          <div className="membrete-empresa">
            <div className="logo-empresa">
              <h1>JOYAS CHARLY'S</h1>
              <div className="linea-decorativa"></div>
            </div>
            <div className="info-empresa">
              <p><strong>Especialistas en Joyería Fina</strong></p>
              <p>Bo. El Centro, Ave Máximo Jerez, Casa 820, Tegucigalpa</p>
              <p>Tel: +504 9971-7820 | +504 9833-2595</p>
              <p>Email: joyascharlys@gmail.com | RTN: 0801-1990-12345</p>
            </div>
          </div>
          
          <div className="encabezado-derecho">
            <div className="badge-tipo" style={{backgroundColor: '#D35400'}}>COTIZACIÓN</div>
            <div className="info-factura">
              <h2 style={{color: '#D35400'}}>COTIZACIÓN DE REPARACIÓN</h2>
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
                  <span className="etiqueta">Válida:</span>
                  <span className="valor">30 días</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información del cliente CON DIRECCIÓN */}
        <div className="seccion-cliente">
          <div className="titulo-seccion">
            <span>INFORMACIÓN DEL CLIENTE</span>
          </div>
          <div className="contenido-seccion compacto">
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

        {/* Detalles de la cotización de reparación */}
        <div className="seccion-detalles">
          <div className="titulo-seccion">
            <span>DETALLES DE LA REPARACIÓN</span>
          </div>
          <div className="contenido-seccion compacto">
            
            {/* Joyas a Reparar */}
            <div className="joyas-reparar">
              <h4>Joyas a Reparar:</h4>
              <table className="tabla-moderna compacta">
                <thead>
                  <tr>
                    <th width="20%">Tipo</th>
                    <th width="20%">Reparación</th>
                    <th width="10%">Cant</th>
                    <th width="50%">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto, index) => (
                    <tr key={index}>
                      <td className="texto-centro">{formatearTipoJoya(producto.tipoJoya)}</td>
                      <td className="texto-centro">{formatearTipoReparacion(producto.tipoReparacion)}</td>
                      <td className="texto-centro">{producto.cantidad || 1}</td>
                      <td className="texto-izquierda">{producto.descripcion || 'Sin descripción'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Materiales a utilizar */}
            {materiales && materiales.length > 0 && (
              <div className="materiales-utilizados">
                <h4>Materiales:</h4>
                <table className="tabla-moderna compacta">
                  <thead>
                    <tr>
                      <th width="50%">Material</th>
                      <th width="15%">Peso (gr)</th>
                      <th width="35%">Costo Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materiales.map((material, index) => (
                      <tr key={index}>
                        <td className="texto-izquierda">{material.tipo_material || material.tipo || 'No especificado'}</td>
                        <td className="texto-derecha">{parseFloat(material.peso_gramos || material.peso || 0).toFixed(2)}</td>
                        <td className="texto-derecha">L. {parseFloat(material.costo_total || material.costo || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="total-materiales">
                      <td colSpan="2" className="texto-derecha"><strong>Total Materiales:</strong></td>
                      <td className="texto-derecha">
                        <strong>L. {materiales.reduce((sum, material) => sum + parseFloat(material.costo_total || material.costo || 0), 0).toFixed(2)}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Costos adicionales */}
            <div className="costos-adicionales compacto">
              <h4>Costos Adicionales:</h4>
              <div className="grid-costos">
                <div className="costo-item">
                  <span>Insumos:</span>
                  <span>L. {parseFloat(costoInsumos || 0).toFixed(2)}</span>
                </div>
                <div className="costo-item">
                  <span>Mano de Obra:</span>
                  <span>L. {parseFloat(manoObra || 0).toFixed(2)}</span>
                </div>
                {parseFloat(descuentos || 0) > 0 && (
                  <div className="costo-item descuento">
                    <span>Descuento:</span>
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
          <div className="contenido-seccion compacto">
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
              
              {/* Condiciones de pago compactas */}
              <div className="condiciones-pago compacto">
                <div className="linea-resumen anticipo">
                  <span>Anticipo (50%):</span>
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

        {/* Términos y condiciones COMPACTOS */}
        <div className="seccion-terminos compacto">
          <div className="titulo-seccion">
            <span>CONDICIONES</span>
          </div>
          <div className="contenido-seccion">
            <div className="terminos-compactos">
              <div className="linea-termino">
                <span className="icono">📅</span>
                <span><strong>Válidez:</strong> 30 días</span>
              </div>
              <div className="linea-termino">
                <span className="icono">💰</span>
                <span><strong>Anticipo:</strong> 50% para iniciar</span>
              </div>
              <div className="linea-termino">
                <span className="icono">⏱️</span>
                <span><strong>Tiempo:</strong> 7-15 días hábiles</span>
              </div>
              <div className="linea-termino">
                <span className="icono">🛡️</span>
                <span><strong>Garantía:</strong> 90 días en reparación</span>
              </div>
              <div className="linea-termino">
                <span className="icono">💳</span>
                <span><strong>Saldo:</strong> Al retirar | <strong>ISV:</strong> Incluido 15%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Observaciones y firmas */}
        <div className="seccion-final compacto">
          <div className="observaciones">
            <div className="titulo-seccion">
              <span>OBSERVACIONES</span>
            </div>
            <div className="contenido-observaciones">
              <p>{datosCotizacion?.observaciones || 'Cliente acepta los términos y condiciones establecidos.'}</p>
            </div>
          </div>
          
          <div className="firmas">
            <div className="firma-cliente">
              <div className="linea-firma"></div>
              <p>Aceptación del Cliente</p>
              <p>Fecha: ___________________</p>
            </div>
            <div className="firma-empresa">
              <div className="linea-firma"></div>
              <p>JOYAS CHARLY'S</p>
              <p>Técnico Especializado</p>
            </div>
          </div>
        </div>

        {/* Pie de página compacto */}
        <div className="pie-pagina compacto">
          <p><strong>Joyas Charly's - Recuperamos el brillo de sus joyas</strong></p>
          <p>📞 Contacto: +504 9971-7820 | +504 9833-2595</p>
        </div>
      </div>

      {/* SEGUNDA PÁGINA - Solo para imagen de referencia */}
      {imagen_referencia && (
        <div className="pagina-2">
          {/* Encabezado de la segunda página */}
          <div className="encabezado-moderno">
            <div className="membrete-empresa">
              <div className="logo-empresa">
                <h1>JOYAS CHARLY'S</h1>
                <div className="linea-decorativa"></div>
              </div>
              <div className="info-empresa">
                <p><strong>Especialistas en Joyería Fina</strong></p>
                <p>Bo. El Centro, Ave Máximo Jerez, Casa 820, Tegucigalpa</p>
              </div>
            </div>
            
            <div className="encabezado-derecho">
              <div className="badge-tipo" style={{backgroundColor: '#D35400'}}>ANEXO</div>
              <div className="info-factura">
                <h2 style={{color: '#D35400'}}>IMAGEN DE REFERENCIA</h2>
                <div className="datos-factura">
                  <div className="dato-factura">
                    <span className="etiqueta">No.:</span>
                    <span className="valor">{numeroCotizacion}</span>
                  </div>
                  <div className="dato-factura">
                    <span className="etiqueta">Página:</span>
                    <span className="valor">2 de 2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido de la imagen */}
          <div className="seccion-imagen-referencia">
            <div className="titulo-seccion">
              <span>IMAGEN DE LA JOYA A REPARAR</span>
            </div>
            <div className="contenido-imagen">
              <div className="imagen-container">
                <img 
                  src={imagen_referencia} 
                  alt="Imagen de referencia de la joya a reparar"
                  className="imagen-referencia"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    document.querySelector('.imagen-no-disponible').style.display = 'block';
                  }}
                />
                <div className="imagen-no-disponible" style={{display: 'none'}}>
                  <div className="mensaje-sin-imagen">
                    <span className="icono-imagen">🖼️</span>
                    <h3>Imagen no disponible</h3>
                    <p>La imagen de referencia no pudo cargarse</p>
                  </div>
                </div>
              </div>
              
              <div className="info-imagen">
                <div className="campo-info">
                  <span className="etiqueta">Cliente:</span>
                  <span className="valor">{datosCliente.nombre || 'No especificado'}</span>
                </div>
                <div className="campo-info">
                  <span className="etiqueta">Cotización:</span>
                  <span className="valor">{numeroCotizacion}</span>
                </div>
                <div className="campo-info">
                  <span className="etiqueta">Fecha:</span>
                  <span className="valor">{fechaCotizacion}</span>
                </div>
                <div className="campo-info">
                  <span className="etiqueta">Descripción:</span>
                  <span className="valor">
                    {productos.length > 0 ? productos[0].descripcion : 'Reparación de joya'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pie de página de la segunda página */}
          <div className="pie-pagina compacto">
            <p><strong>Joyas Charly's - Documento de referencia para reparación</strong></p>
            <p>📞 Contacto: +504 9971-7820 | +504 9833-2595</p>
          </div>
        </div>
      )}
    </div>
  );
}