import React, { useState } from 'react';
import {
  FaUser,
  FaEnvelope,
  FaUserTag,
  FaCheckCircle,
  FaTimesCircle,
  FaTrash,
  FaEdit,
  FaPhone,
  FaUserCircle,
  FaEye // <--- Importar icono de ojo
} from 'react-icons/fa';
import { ENDPOINTS } from '../../config/config';

const TarjetaUsuario = ({ empleado, onEditar, onEliminado, onVerDetalles }) => {
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const handleEliminar = async () => {
    setEliminando(true);
    try {
      const response = await fetch(
        `${ENDPOINTS.empleados}${empleado.id_empleado}/eliminar/`,
        { method: "DELETE" }
      );

      if (response.ok) {
        onEliminado();
        setMostrarConfirmacion(false);
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <>
      <div className="usuario-card-compact">
        {/* Header super compacto */}
        <div className="usuario-header-super-compact">
          <div className="avatar-mini">
            <FaUserCircle />
          </div>
          <div className="usuario-info-super-compact">
            <h4 className="nombre-super-compact">{empleado.nombre_completo}</h4>
            <div className="info-lineas">
              <span className="info-linea">
                <FaEnvelope /> {empleado.correo || "Sin correo"}
              </span>
              <span className="info-linea">
                <FaUser /> {empleado.usuario || "Sin usuario"}
              </span>
            </div>
          </div>
          <div className={`estado-mini ${empleado.estado?.toLowerCase() === 'activo' ? 'activo' : 'inactivo'}`}>
            {empleado.estado?.toLowerCase() === 'activo' ? <FaCheckCircle /> : <FaTimesCircle />}
          </div>
        </div>

        {/* Detalles en línea */}
        <div className="detalles-linea">
          <div className="detalle-chip">
            <FaUserTag className="icono-chip" />
            <span>{empleado.perfil || "Sin perfil"}</span>
          </div>
          <div className="detalle-chip">
            <FaPhone className="icono-chip" />
            <span>{empleado.telefono || "Sin teléfono"}</span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="acciones-compact">
          {/* Botón VER DETALLES */}
          <button 
            className="btn-mini btn-ver" 
            onClick={() => onVerDetalles(empleado)}
            title="Ver detalles completos"
          >
            <FaEye />
          </button>

          <button 
            className="btn-mini btn-editar-azul" 
            onClick={() => onEditar(empleado)}
            title="Editar empleado"
          >
            <FaEdit />
          </button>
          
          <button 
            className="btn-mini btn-eliminar" 
            onClick={() => setMostrarConfirmacion(true)}
            title="Eliminar empleado"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
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
                className="btn-pill secondary"
                onClick={() => setMostrarConfirmacion(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-pill danger"
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