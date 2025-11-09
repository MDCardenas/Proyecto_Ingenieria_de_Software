import React from 'react';

const ListaUsuarios = ({ usuarios, onEditarEmpleado, onEliminarEmpleado }) => {
  const handleEliminar = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este empleado?")) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/empleados/eliminar/${id}/`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        alert("Empleado eliminado correctamente");
        if (onEliminarEmpleado) onEliminarEmpleado(id); // ✅ Envía el ID al padre
      } catch (error) {
        console.error("Error al eliminar empleado:", error);
        alert("Ocurrió un error al eliminar el empleado.");
      }
    }
  };

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
              onClick={() => onEditarEmpleado(empleado)}
            >
              Editar
            </button>
            <button 
              className="btn-eliminar"
              onClick={() => handleEliminar(empleado.id)}
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListaUsuarios;
