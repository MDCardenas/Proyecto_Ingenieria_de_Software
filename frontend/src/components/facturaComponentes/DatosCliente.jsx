import React from "react";

export default function DatosCliente({ errores, onCambioCampo }) {
  return (
    <div className="formulario-factura">
      <div className="fila-formulario">
        <div className="campo-formulario">
          <label htmlFor="nombre">Nombre Completo del Cliente</label>
          <input 
            type="text" 
            id="nombre" 
            placeholder="Ingrese el nombre completo" 
            required 
            onChange={() => onCambioCampo && onCambioCampo('nombre')}
            className={errores?.nombre ? 'campo-error' : ''}
          />
          {errores?.nombre && <span className="mensaje-error">{errores.nombre}</span>}
        </div>
        <div className="campo-formulario">
          <label htmlFor="fecha">Fecha</label>
          <input 
            type="date" 
            id="fecha" 
            required 
            onChange={() => onCambioCampo && onCambioCampo('fecha')}
            className={errores?.fecha ? 'campo-error' : ''}
          />
          {errores?.fecha && <span className="mensaje-error">{errores.fecha}</span>}
        </div>
      </div>

      <div className="fila-formulario">
        <div className="campo-formulario">
          <label htmlFor="direccion">Dirección</label>
          <input 
            type="text" 
            id="direccion" 
            placeholder="Ingrese la dirección" 
            required 
            onChange={() => onCambioCampo && onCambioCampo('direccion')}
            className={errores?.direccion ? 'campo-error' : ''}
          />
          {errores?.direccion && <span className="mensaje-error">{errores.direccion}</span>}
        </div>
        <div className="campo-formulario">
          <label htmlFor="telefono">Número de teléfono</label>
          <input 
            type="tel" 
            id="telefono" 
            placeholder="Ingrese el teléfono" 
            required 
            onChange={() => onCambioCampo && onCambioCampo('telefono')}
            className={errores?.telefono ? 'campo-error' : ''}
          />
          {errores?.telefono && <span className="mensaje-error">{errores.telefono}</span>}
        </div>
      </div>

      <div className="fila-formulario">
        <div className="campo-formulario">
          <label htmlFor="rtn">RTN (opcional)</label>
          <input type="text" id="rtn" placeholder="Ingrese el RTN" />
        </div>
      </div>
    </div>
  );
}