import React, { useRef } from "react";
import { FaTimes, FaDownload, FaPrint } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import FormatoFactura from "./FormatoFactura";
import "../../styles/scss/components/_modaldetalle.scss";
import "../../styles/scss/components/_formatofactura.scss";

export default function ModalDetalleFactura({ factura, onCerrar }) {
  const facturaRef = useRef();

  if (!factura) return null;

  // Preparar datos del cliente
  const datosCliente = {
    nombre: factura.cliente_nombre || 'No especificado',
    direccion: factura.direccion || 'No especificada',
    telefono: factura.telefono || 'No especificado',
    rtn: factura.cliente_rtn || factura.rtn || 'No especificado'
  };

  // Preparar productos
  const productos = factura.detalles?.map(detalle => ({
    id: detalle.id_detalle,
    codigo: detalle.codigo_producto,
    producto: detalle.nombre_producto,
    descripcion: detalle.descripcion,
    cantidad: detalle.cantidad,
    precio: detalle.precio_unitario
  })) || [];

  // Preparar materiales
  const materiales = factura.materiales?.map(material => ({
    tipo: material.nombre_material,
    peso: material.cantidad,
    precio: material.costo_unitario,
    costo: material.costo_total
  })) || [];

  // Preparar resultados
  const resultados = {
    subtotal: parseFloat(factura.subtotal || 0),
    isv: parseFloat(factura.isv || 0),
    total: parseFloat(factura.total || 0),
    anticipo: parseFloat(factura.total || 0) * 0.5,
    pagoPendiente: parseFloat(factura.total || 0) * 0.5
  };

  // Datos de la factura
  const datosFactura = {
    observaciones: factura.observaciones || 'Ninguna',
    numero_factura: factura.numero_factura,
    fecha: factura.fecha,
    id_cliente: factura.cliente?.id_cliente,
    id_empleado: factura.empleado?.id_empleado
  };

  // CORRECCIÓN: Usar tipoFactura en lugar de tipoServicio
  const tipoFactura = factura.tipo_servicio?.toUpperCase() || "VENTA";

  const handleDescargarPDF = async () => {
    try {
      // Crear overlay temporal para captura con la clase overlay-pdf
      const overlay = document.createElement('div');
      overlay.className = 'overlay-pdf';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.backgroundColor = 'white';
      overlay.style.zIndex = '9999';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'flex-start';
      overlay.style.overflow = 'auto';
      overlay.style.padding = '20px';

      // Clonar el contenido de la vista previa visible
      const facturaContent = document.querySelector('.vista-previa-factura .formato-factura-pdf').cloneNode(true);
      
      // Aplicar estilos específicos para PDF
      facturaContent.style.visibility = 'visible';
      facturaContent.style.opacity = '1';
      facturaContent.style.position = 'relative';
      facturaContent.style.width = '8.5in';
      facturaContent.style.minHeight = '11in';
      facturaContent.style.backgroundColor = 'white';
      facturaContent.style.padding = '0.4in';
      facturaContent.style.boxSizing = 'border-box';
      facturaContent.style.transform = 'none';

      overlay.appendChild(facturaContent);
      document.body.appendChild(overlay);

      // Esperar a que se renderice
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = await html2canvas(facturaContent, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: 816, // 8.5in * 96 dpi
        height: 1056, // 11in * 96 dpi
        onclone: function(clonedDoc) {
          // Asegurar que los estilos se apliquen en el clon
          const clonedElement = clonedDoc.querySelector('.formato-factura-pdf');
          if (clonedElement) {
            clonedElement.style.visibility = 'visible';
            clonedElement.style.opacity = '1';
            clonedElement.style.transform = 'none';
          }
        }
      });

      document.body.removeChild(overlay);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`factura_${tipoFactura}_${factura.numero_factura}.pdf`);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF: ' + error.message);
    }
  };

  const handleImprimir = () => {
    console.log("🔄 Iniciando impresión...");
    
    // Crear un iframe para la impresión
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    
    // Obtener el contenido de la factura visible
    const contenidoOriginal = document.querySelector('.vista-previa-factura .formato-factura-pdf');
    const contenidoImprimir = contenidoOriginal ? contenidoOriginal.outerHTML : '';
    
    // Crear el documento HTML para imprimir con estilos optimizados para una página
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura ${factura.numero_factura}</title>
        <meta charset="utf-8">
        <style>
          @media print {
            body { 
              margin: 0 !important; 
              padding: 0 !important; 
              background: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              width: 8.5in !important;
              height: 11in !important;
            }
            .formato-factura-pdf { 
              width: 8.5in !important;
              min-height: 11in !important;
              max-height: 11in !important;
              padding: 0.3in !important;
              background: white !important;
              box-sizing: border-box !important;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
              color: #333 !important;
              line-height: 1.1 !important;
              font-size: 10px !important;
              margin: 0 auto !important;
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
              position: relative !important;
              left: 0 !important;
              top: 0 !important;
              transform: none !important;
              overflow: hidden !important;
            }
            .formato-factura-pdf * {
              box-sizing: border-box !important;
              margin: 0 !important;
              padding: 0 !important;
              font-family: inherit !important;
              color: inherit !important;
              line-height: inherit !important;
              visibility: visible !important;
              opacity: 1 !important;
            }
            
            /* Encabezado más compacto */
            .encabezado-moderno {
              display: flex !important;
              justify-content: space-between !important;
              align-items: flex-start !important;
              margin-bottom: 8px !important;
              padding-bottom: 6px !important;
              border-bottom: 1px solid #e0e0e0 !important;
              width: 100% !important;
            }
            .logo-empresa h1 {
              font-size: 16px !important;
              margin: 0 0 3px 0 !important;
            }
            .linea-decorativa {
              width: 35px !important;
              height: 1px !important;
              margin-bottom: 4px !important;
            }
            .info-empresa p {
              margin: 1px 0 !important;
              font-size: 8px !important;
            }
            .badge-tipo {
              padding: 3px 10px !important;
              font-size: 8px !important;
              margin-bottom: 4px !important;
            }
            .info-factura h2 {
              font-size: 14px !important;
              margin: 0 0 6px 0 !important;
            }
            .datos-factura {
              gap: 2px !important;
            }
            .dato-factura {
              font-size: 8px !important;
            }
            
            /* Secciones más compactas */
            .titulo-seccion {
              padding: 4px 8px !important;
              margin: 6px 0 4px 0 !important;
              font-size: 9px !important;
              letter-spacing: 0.2px !important;
            }
            
            /* Cliente más compacto */
            .grid-cliente {
              gap: 2px 8px !important;
            }
            .campo-cliente {
              padding: 2px 0 !important;
              font-size: 8px !important;
            }
            
            /* Tablas ultra compactas */
            .tabla-moderna {
              margin: 4px 0 !important;
              font-size: 8px !important;
            }
            .tabla-moderna th {
              padding: 3px 2px !important;
              font-size: 7px !important;
            }
            .tabla-moderna td {
              padding: 2px !important;
              font-size: 7px !important;
            }
            
            /* Materiales compactos */
            .materiales-utilizados {
              margin-top: 6px !important;
            }
            .materiales-utilizados h4 {
              margin: 0 0 3px 0 !important;
              font-size: 9px !important;
            }
            
            /* Descripciones compactas */
            .descripcion-boceto h4,
            .descripcion-dano .etiqueta {
              font-size: 9px !important;
              margin: 0 0 3px 0 !important;
            }
            .contenido-descripcion {
              padding: 4px !important;
              font-size: 8px !important;
              margin-bottom: 4px !important;
              border-left: 2px solid #667eea !important;
            }
            
            /* Resumen financiero compacto */
            .resumen-grid {
              max-width: 250px !important;
            }
            .linea-resumen {
              padding: 2px 0 !important;
              font-size: 8px !important;
            }
            .linea-resumen.total {
              padding-top: 4px !important;
              margin-top: 2px !important;
              font-size: 9px !important;
            }
            
            /* Firmas compactas */
            .seccion-final {
              margin-top: 10px !important;
              padding-top: 8px !important;
            }
            .contenido-observaciones {
              padding: 4px !important;
              min-height: 25px !important;
              font-size: 8px !important;
              margin-bottom: 6px !important;
            }
            .firmas {
              margin-top: 15px !important;
            }
            .firmas p {
              font-size: 7px !important;
            }
            
            /* Pie de página compacto */
            .pie-pagina {
              margin-top: 10px !important;
              padding-top: 4px !important;
              font-size: 7px !important;
            }
            
            /* Ocultar elementos innecesarios para impresión si existen */
            .no-print {
              display: none !important;
            }
          }
          
          /* Estilos para vista previa en el iframe */
          body { 
            margin: 0; 
            padding: 10px; 
            background: white;
            font-family: Arial, sans-serif;
            font-size: 10px;
            color: black;
          }
          .formato-factura-pdf { 
            width: 8.5in !important;
            background: white !important;
            color: black !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            transform: none !important;
          }
          .formato-factura-pdf * {
            visibility: visible !important;
            opacity: 1 !important;
            color: black !important;
          }
        </style>
      </head>
      <body>
        ${contenidoImprimir}
      </body>
      </html>
    `);
    
    iframeDoc.close();
    
    // Esperar a que el iframe cargue y luego imprimir
    iframe.onload = function() {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        
        // Limpiar después de imprimir
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    };
  };

  return (
    <div className="modal-overlay-factura modal-overlay-factura--open">
      <div className="modal-contenido-factura">
        <div className="modal-header-factura">
          <h2>Factura #{factura.numero_factura}</h2>
          <button onClick={onCerrar} className="btn-cerrar">
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body-factura">
          {/* Referencia para PDF (ahora visible pero fuera de pantalla) */}
          <div 
            ref={facturaRef} 
            style={{ 
              position: 'absolute', 
              left: '-9999px', 
              top: 0,
              width: '8.5in',
              minHeight: '11in',
              padding: '0.4in',
              backgroundColor: 'white'
            }}
          >
            <div className="overlay-pdf">
              <FormatoFactura 
                tipoFactura={tipoFactura}
                datosCliente={datosCliente}
                productos={productos}
                materiales={materiales}
                resultados={resultados}
                datosFactura={datosFactura}
                descuentos={factura.descuentos || 0}
              />
            </div>
          </div>
          
          {/* Vista previa visible */}
          <div className="vista-previa-factura">
            <FormatoFactura 
              tipoFactura={tipoFactura}
              datosCliente={datosCliente}
              productos={productos}
              materiales={materiales}
              resultados={resultados}
              datosFactura={datosFactura}
              descuentos={factura.descuentos || 0}
            />
          </div>
        </div>
        
        <div className="modal-footer-factura">
          <button onClick={handleDescargarPDF} className="btn-descargar">
            <FaDownload /> Descargar PDF
          </button>
          <button onClick={handleImprimir} className="btn-imprimir">
            <FaPrint /> Imprimir
          </button>
          <button onClick={onCerrar} className="btn-cerrar-footer">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}