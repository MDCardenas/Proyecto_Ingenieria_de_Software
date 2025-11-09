import React, { useRef } from "react";
import { FaTimes, FaDownload, FaPrint } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import FormatoFactura from "./FormatoFactura";

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

  const handleDescargarPDF = async () => {
    try {
      // Crear overlay temporal para captura
      const overlay = document.createElement('div');
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

      // Clonar el contenido
      const facturaContent = facturaRef.current.cloneNode(true);
      
      facturaContent.style.visibility = 'visible';
      facturaContent.style.opacity = '1';
      facturaContent.style.position = 'relative';
      facturaContent.style.width = '8.5in';
      facturaContent.style.minHeight = '11in';
      facturaContent.style.backgroundColor = 'white';
      facturaContent.style.padding = '0.4in';
      facturaContent.style.boxSizing = 'border-box';

      overlay.appendChild(facturaContent);
      document.body.appendChild(overlay);

      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(facturaContent, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: 816,
        height: 1056
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

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'MEDIUM');
      pdf.save(`factura_${factura.tipo_servicio}_${factura.numero_factura}.pdf`);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF');
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
    
    // Obtener el contenido de la factura
    const contenidoImprimir = facturaRef.current.innerHTML;
    
    // Crear el documento HTML para imprimir
    iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Factura ${factura.numero_factura}</title>
            <style>
            body { 
                margin: 0; 
                padding: 20px; 
                background: white;
                font-family: Arial, sans-serif;
                font-size: 12px;
                color: black;
            }
            .formato-factura-pdf { 
                width: 100% !important;
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
            @media print {
                body { margin: 0; padding: 0; }
                .formato-factura-pdf { 
                width: 100% !important;
                transform: none !important;
                }
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
          {/* Referencia para PDF (oculta) */}
          <div ref={facturaRef} style={{ display: 'none' }}>
            <FormatoFactura 
              datosCliente={datosCliente}
              productos={productos}
              materiales={materiales}
              resultados={resultados}
              datosFactura={datosFactura}
              tipoServicio={factura.tipo_servicio}
            />
          </div>
          
          {/* Vista previa visible */}
          <div className="vista-previa-factura">
            <FormatoFactura 
              datosCliente={datosCliente}
              productos={productos}
              materiales={materiales}
              resultados={resultados}
              datosFactura={datosFactura}
              tipoServicio={factura.tipo_servicio}
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
          <button onClick={onCerrar} className="btn-cerrar">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
