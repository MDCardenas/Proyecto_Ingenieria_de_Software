import React, { useRef } from "react";
import { FaTimes, FaDownload, FaPrint } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import FormatoFactura from "./FormatoFactura";
import "../../styles/scss/components/_modaldetalle.scss";
import "../../styles/scss/components/_formatofactura.scss"; 

export default function ModalDetalleFactura({ factura, onCerrar }) {
  const facturaRefPDF = useRef(); // Para generar PDF e imprimir

  if (!factura) return null;

  // --- PREPARACIÓN DE DATOS ---
  const datosCliente = {
    nombre: factura.cliente_nombre || 'No especificado',
    direccion: factura.direccion || 'No especificada',
    telefono: factura.telefono || 'No especificado',
    rtn: factura.cliente_rtn || factura.rtn || 'No especificado'
  };

  const productos = factura.detalles?.map(detalle => ({
    id: detalle.id_detalle,
    codigo: detalle.codigo_producto,
    producto: detalle.nombre_producto,
    descripcion: detalle.descripcion,
    cantidad: detalle.cantidad,
    precio: detalle.precio_unitario
  })) || [];

  const materiales = factura.materiales?.map(material => ({
    tipo: material.nombre_material,
    peso: material.cantidad,
    precio: material.costo_unitario,
    costo: material.costo_total
  })) || [];

  const resultados = {
    subtotal: parseFloat(factura.subtotal || 0),
    isv: parseFloat(factura.isv || 0),
    total: parseFloat(factura.total || 0),
    anticipo: parseFloat(factura.total || 0) * 0.5,
    pagoPendiente: parseFloat(factura.total || 0) * 0.5
  };

  const datosFactura = {
    observaciones: factura.observaciones || 'Ninguna',
    numero_factura: factura.numero_factura,
    fecha: factura.fecha,
    id_cliente: factura.cliente?.id_cliente,
    id_empleado: factura.empleado?.id_empleado
  };

  const tipoFactura = factura.tipo_servicio?.toUpperCase() || "VENTA";

  // --- FUNCIÓN COMPARTIDA: GENERA PDF DEL FORMATO CORRECTO ---
  const generarPDFCanvas = async () => {
    const overlay = document.createElement('div');
    overlay.className = 'overlay-pdf';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'white';
    overlay.style.zIndex = '99999';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'flex-start';
    overlay.style.overflow = 'auto';
    overlay.style.padding = '20px';

    const facturaContent = facturaRefPDF.current.cloneNode(true);
    facturaContent.style.visibility = 'visible';
    facturaContent.style.opacity = '1';
    facturaContent.style.position = 'relative';
    facturaContent.style.left = '0';
    facturaContent.style.top = '0';
    facturaContent.style.width = '8.5in';
    facturaContent.style.minHeight = '11in';
    facturaContent.style.height = '11in';
    facturaContent.style.overflow = 'hidden';
    facturaContent.style.backgroundColor = 'white';
    facturaContent.style.padding = '0.4in';
    facturaContent.style.boxSizing = 'border-box';
    facturaContent.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';

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
      height: 1056,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 816,
      windowHeight: 1056
    });

    document.body.removeChild(overlay);

    return canvas;
  };

  // --- DESCARGAR PDF ---
  const handleDescargarPDF = async () => {
    try {
      const canvas = await generarPDFCanvas();
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'MEDIUM');
      pdf.save(`factura_${tipoFactura}_${factura.numero_factura}.pdf`);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      const existingOverlay = document.querySelector('.overlay-pdf');
      if (existingOverlay) document.body.removeChild(existingOverlay);
      alert('Error al generar el PDF: ' + error.message);
    }
  };

  // --- IMPRIMIR PDF (CONVIERTE A IMAGEN Y USA IFRAME) ---
  const handleImprimir = async () => {
    try {
      const canvas = await generarPDFCanvas();
      const imgData = canvas.toDataURL('image/png');

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Factura ${factura.numero_factura}</title>
          <meta charset="utf-8">
          <style>
            @media print {
              @page {
                size: letter;
                margin: 0;
              }
              
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: 8.5in;
                height: 11in;
              }

              img {
                width: 8.5in !important;
                height: 11in !important;
                display: block !important;
                margin: 0 !important;
                padding: 0 !important;
              }
            }

            body {
              margin: 0;
              padding: 0;
            }

            img {
              width: 100%;
              height: auto;
              display: block;
            }
          </style>
        </head>
        <body>
          <img src="${imgData}" alt="Factura">
        </body>
        </html>
      `);
      
      iframeDoc.close();
      
      iframe.onload = function() {
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          setTimeout(() => document.body.removeChild(iframe), 1000);
        }, 800);
      };
      
    } catch (error) {
      console.error('Error al imprimir:', error);
      alert('Error al imprimir: ' + error.message);
    }
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
          {/* VERSIÓN OCULTA PARA PDF/IMPRESIÓN (con formato real de _formatofactura.scss) */}
          <div style={{ display: 'none' }}>
            <div ref={facturaRefPDF}>
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
          
          {/* VERSIÓN VISIBLE PARA VISTA PREVIA (con estilos de _modaldetalle.scss) */}
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