import React from 'react';
import { 
  FaTimes, 
  FaUserCircle, 
  FaEnvelope, 
  FaPhone, 
  FaUserTag, 
  FaUser, 
  FaIdCard, 
  FaCalendarAlt 
} from 'react-icons/fa';

// Si el CSS no se importa globalmente, descomenta la siguiente línea:
// import '../../styles/Usuarios.css';

const ModalDetallesEmpleado = ({ empleado, onClose }) => {
  if (!empleado) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-detalles" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera */}
        <div className="modal-header">
          <h2>Detalles del Empleado</h2>
          <button className="btn-close" onClick={onClose} title="Cerrar">
            <FaTimes />
          </button>
        </div>

        {/* Contenido */}
        <div className="modal-body">
          {/* Sección Perfil */}
          <div className="perfil-header">
            <div className="perfil-avatar-large">
              <FaUserCircle />
            </div>
            <div className="perfil-titulos">
              <h3>{empleado.nombre_completo}</h3>
              <span className={`badge-estado ${empleado.estado?.toLowerCase() || 'inactivo'}`}>
                {empleado.estado || 'Desconocido'}
              </span>
            </div>
          </div>

          {/* Grilla de Información */}
          <div className="detalles-grid">
            <div className="detalle-item">
              <div className="label"><FaUser /> Usuario</div>
              <div className="valor">{empleado.usuario}</div>
            </div>

            <div className="detalle-item">
              <div className="label"><FaEnvelope /> Correo Electrónico</div>
              <div className="valor">{empleado.correo || "No registrado"}</div>
            </div>

            <div className="detalle-item">
              <div className="label"><FaUserTag /> Perfil / Rol</div>
              <div className="valor">{empleado.perfil || "Sin asignar"}</div>
            </div>

            <div className="detalle-item">
              <div className="label"><FaPhone /> Teléfono</div>
              <div className="valor">{empleado.telefono || "No registrado"}</div>
            </div>

            <div className="detalle-item">
              <div className="label"><FaIdCard /> ID Sistema</div>
              <div className="valor">#{empleado.id_empleado}</div>
            </div>

            {/* Ejemplo de campo condicional para fecha */}
            <div className="detalle-item">
              <div className="label"><FaCalendarAlt /> Última Actualización</div>
              <div className="valor">
                 {/* Simulación de fecha si no viene del back */}
                 {new Date().toLocaleDateString()} 
              </div>
            </div>
          </div>
        </div>

        {/* Pie con botón */}
        <div className="modal-footer">
          <button className="btn-pill primary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetallesEmpleado;