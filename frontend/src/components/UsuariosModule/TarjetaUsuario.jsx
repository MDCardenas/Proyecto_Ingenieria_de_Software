import React, { useState } from 'react'; 
import { 
  FaUser, 
  FaEnvelope, 
  FaUserTag, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaTrash,
  FaEdit,
  FaPhone
} from 'react-icons/fa';
import api from '../../services/api';

const TarjetaUsuario = ({ empleado, onEditar, onEliminado }) => {
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const handleEliminar = async () => {
    setEliminando(true);
    try {
      await api.delete(`/empleados/${empleado.id_empleado}/eliminar/`);
      onEliminado();
      setMostrarConfirmacion(false);
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <>
      <div className="usuario-card">
        <div className="usuario-card-header">
          <div className="usuario-avatar">
            <FaUser />
          </div>
          <div className="usuario-info-principal">
            <h3 className="usuario-nombre">{empleado.nombre_completo}</h3>
            <p className="usuario-email">
              <FaEnvelope /> {empleado.correo || "Sin correo"}
            </p>
          </div>
        </div>

        <div className="usuario-detalles">
          <div className="detalle-item">
            <FaUserTag className="detalle-icon" />
            <div className="detalle-content">
              <span className="detalle-label">Perfil</span>
              <span className="detalle-valor perfil-badge">
                {empleado.perfil || "Sin perfil"}
              </span>
            </div>
          </div>

          <div className="detalle-item">
            <FaPhone className="detalle-icon" />
            <div className="detalle-content">
              <span className="detalle-label">Teléfono</span>
              <span className="detalle-valor">{empleado.telefono || "—"}</span>
            </div>
          </div>

          <div className="detalle-item">
            <div className="detalle-content estado-content">
              <span className="detalle-label">Estado</span>
              <span className={`estado-badge ${empleado.estado?.toLowerCase()}`}>
                {empleado.estado === "Activo" ? (
                  <>
                    <FaCheckCircle /> Activo
                  </>
                ) : (
                  <>
                    <FaTimesCircle /> Inactivo
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="usuario-acciones">
          <button 
            className="btn-pill btn-pill-info btn-accion"
            onClick={() => onEditar(empleado)}
          >
            <FaEdit /> Editar
          </button>
          <button 
            className="btn-pill btn-pill-danger btn-accion"
            onClick={() => setMostrarConfirmacion(true)}
          >
            <FaTrash /> Eliminar
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      {mostrarConfirmacion && (
        <div className="modal-overlay" onClick={() => setMostrarConfirmacion(false)}>
          <div className="modal-confirmacion" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-warning">⚠️</div>
            <h3>¿Eliminar empleado?</h3>
            <p>
              ¿Estás seguro de eliminar a <strong>{empleado.nombre_completo}</strong>?
              <br />
              Esta acción no se puede deshacer.
            </p>
            <div className="modal-acciones">
              <button
                className="btn-pill btn-pill-secondary"
                onClick={() => setMostrarConfirmacion(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-pill btn-pill-danger"
                onClick={handleEliminar}
                disabled={eliminando}
              >
                {eliminando ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TarjetaUsuario;