// components/FormatoFactura.jsx
import React from "react";

export default function FormatoFactura({ 
  tipoFactura, 
  datosCliente, 
  productos, 
  materiales, 
  resultados,
  descuentos 
}) {
  const fechaActual = new Date().toLocaleDateString();
  
  return (
    <div id="formato-factura" style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* Encabezado */}
      <div style={{ textAlign: "center", marginBottom: "20px", borderBottom: "2px solid #000", paddingBottom: "10px" }}>
        <h1>JOYERÍA CHARLY'S</h1>
        <p>Bo. La Ronda, Ave. Maximo Jerez, media cuadra arriba del Instituto
           Guillen Zelaya, Casa N.820, Correo: joyascharlys@gmail.com 
        </p>
        <p>RTN: 15011976000344 | Tel: 2222-5218 y 9971-7820</p>
        <h2>FACTURA DE {tipoFactura?.toUpperCase()}</h2>
        <p>No. Factura: {Date.now().toString().slice(-6)}</p>
        <p>Fecha: {fechaActual}</p>
      </div>

      {/* Datos del Cliente */}
      <div style={{ marginBottom: "20px" }}>
        <h3>DATOS DEL CLIENTE</h3>
        <p><strong>Nombre:</strong> {datosCliente.nombre || "No especificado"}</p>
        <p><strong>Dirección:</strong> {datosCliente.direccion || "No especificado"}</p>
        <p><strong>Teléfono:</strong> {datosCliente.telefono || "No especificado"}</p>
        <p><strong>RTN:</strong> {datosCliente.rtn || "No especificado"}</p>
      </div>

      {/* Detalles según tipo de factura */}
      {tipoFactura === "Venta" && (
        <div style={{ marginBottom: "20px" }}>
          <h3>DETALLES DE VENTA</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Producto</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Descripción</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Cantidad</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Precio Unit.</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{producto.producto}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px", maxWidth: "200px" }}>
                    {producto.descripcion || "Sin descripción"}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{producto.cantidad}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>L. {parseFloat(producto.precio || 0).toFixed(2)}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    L. {((parseFloat(producto.cantidad) || 0) * (parseFloat(producto.precio) || 0)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tipoFactura === "Fabricación" && (
        <div style={{ marginBottom: "20px" }}>
          <h3>DETALLES DE FABRICACIÓN</h3>
          {/* Tabla de productos */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Producto</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Descripción</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Cantidad</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Precio Unit.</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{producto.producto}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px", maxWidth: "200px" }}>
                    {producto.descripcion || "Sin descripción"}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{producto.cantidad}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>L. {parseFloat(producto.precio || 0).toFixed(2)}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    L. {((parseFloat(producto.cantidad) || 0) * (parseFloat(producto.precio) || 0)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tabla de materiales */}
          <h4>Materiales Utilizados</h4>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Material</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Peso (g)</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Precio/g</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Costo</th>
              </tr>
            </thead>
            <tbody>
              {materiales.map((material, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{material.tipo || "No especificado"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{material.peso || "0"}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>L. {parseFloat(material.precio || 0).toFixed(2)}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>L. {parseFloat(material.costo || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tipoFactura === "Reparación" && (
        <div style={{ marginBottom: "20px" }}>
          <h3>DETALLES DE REPARACIÓN</h3>
          {/* Información específica de reparación */}
          <div style={{ marginBottom: "15px" }}>
            <p><strong>Tipo de Joya:</strong> {productos[0]?.tipoJoya || "No especificado"}</p>
            <p><strong>Tipo de Reparación:</strong> {productos[0]?.tipoReparacion || "No especificado"}</p>
            <p><strong>Descripción:</strong> {productos[0]?.descripcion || "No especificado"}</p>
          </div>
          
          {/* Tabla de materiales si existen */}
          {materiales.length > 0 && materiales.some(m => m.tipo) && (
            <>
              <h4>Materiales Utilizados</h4>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Material</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Peso (g)</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Precio/g</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Costo</th>
                  </tr>
                </thead>
                <tbody>
                  {materiales.filter(material => material.tipo).map((material, index) => (
                    <tr key={index}>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{material.tipo}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{material.peso || "0"}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>L. {parseFloat(material.precio || 0).toFixed(2)}</td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>L. {parseFloat(material.costo || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* Totales */}
      <div style={{ marginTop: "20px", borderTop: "2px solid #000", paddingTop: "10px" }}>
        <h3>RESUMEN DE PAGO</h3>
        <p><strong>Descuentos:</strong> L. {parseFloat(descuentos || 0).toFixed(2)}</p>
        <p><strong>Subtotal con Descuento:</strong> L. {resultados.subtotal?.toFixed(2) || "0.00"}</p>
        <p><strong>ISV (15%):</strong> L. {resultados.isv?.toFixed(2) || "0.00"}</p>
        <p><strong>Total:</strong> L. {resultados.total?.toFixed(2) || "0.00"}</p>
        
        {(tipoFactura === "Fabricación" || tipoFactura === "Reparación") && (
            <>
            <p><strong>Anticipo (50%):</strong> L. {resultados.anticipo?.toFixed(2) || "0.00"}</p>
            <p><strong>Pago Pendiente:</strong> L. {resultados.pagoPendiente?.toFixed(2) || "0.00"}</p>
            </>
        )}
        </div>

      {/* Pie de página */}
      <div style={{ marginTop: "30px", textAlign: "center", fontSize: "12px", color: "#666" }}>
        <p>¡Gracias por su compra!</p>
        <p>Para reclamos o devoluciones presentar esta factura</p>
        <p>Joyería Charly's - Su joyería de confianza</p>
      </div>
    </div>
  );
}