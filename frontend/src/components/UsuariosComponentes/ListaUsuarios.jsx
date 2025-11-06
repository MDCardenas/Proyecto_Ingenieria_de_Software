import React from 'react';

const ListaUsuarios = ({ usuarios, onEditarEmpleado }) => {
  console.log('>>> ListaUsuarios recibió onEditarEmpleado:', typeof onEditarEmpleado);
  
  return (
    <div className="lista-usuarios">
      {usuarios.map((empleado) => (
        <div key={empleado.id} className="usuario-card">
          <div className="usuario-header">
            <h3>{empleado.nombre_completo}</h3>
            <span className="usuario-email">{empleado.email || 'Sin correo electrónico'}</span>
          </div>
          
          <div className="usuario-info">
            <div className="info-item">
              <span className="info-label">Rol:</span>
              <span className="rol-info">{empleado.rol}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Estado:</span>
              <span className={`estado-badge ${empleado.estado?.toLowerCase() || 'inactive'}`}>
                {empleado.estado}
              </span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Último acceso:</span>
              <span className="acceso-info">{empleado.ultimo_acceso}</span>
            </div>
          </div>

          <div className="separador-interno"></div>

          <div className="usuario-acciones">
            <button 
              className="btn-editar"
              onClick={() => {
                console.log('>>> Click en Editar para:', empleado);
                onEditarEmpleado(empleado);
              }}
            >
              Editar
            </button>
            <button className="btn-permisos">Permisos</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListaUsuarios;