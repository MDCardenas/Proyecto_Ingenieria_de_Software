import React, { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaUserTag,
  FaCheckCircle,
  FaTimesCircle,
  FaTrash,
} from "react-icons/fa";
import api from "../../services/api";

const ListaUsuarios = ({ usuarios, onEditarEmpleado, onEmpleadoEliminado }) => {
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  // 🔹 Abrir modal de confirmación
  const handleEliminarClick = (empleado) => {
    setEmpleadoSeleccionado(empleado);
    setMostrarConfirmacion(true);
  };

  // 🔹 Confirmar eliminación
  // 🔹 Confirmar eliminación (versión mejorada con api)
const confirmarEliminar = async () => {
  if (!empleadoSeleccionado) return;
  setEliminando(true);

  try {
    // ✅ USANDO EL SERVICIO API (más limpio)
    const response = await api.delete(`/empleados/${empleadoSeleccionado.id_empleado}/eliminar/`);

    if (response.status === 200) {
      onEmpleadoEliminado();
      setMostrarConfirmacion(false);
    } else {
      console.error("Error al eliminar empleado");
    }
  } catch (error) {
    console.error("Error al eliminar empleado:", error);
  } finally {
    setEliminando(false);
  }
};

  const styles = {
    gridContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "25px",
      padding: "25px",
      justifyItems: "center",
    },
    card: {
      background: "linear-gradient(145deg, #ffffff, #f5f6fa)",
      borderRadius: "16px",
      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
      width: "100%",
      maxWidth: "280px",
      padding: "20px",
      transition: "all 0.3s ease",
      position: "relative",
      overflow: "hidden",
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "15px",
      borderBottom: "2px solid #eee",
      paddingBottom: "10px",
    },
    avatar: {
      width: "55px",
      height: "55px",
      borderRadius: "50%",
      objectFit: "cover",
      border: "3px solid #667eea",
    },
    name: {
      fontSize: "1.1em",
      fontWeight: "700",
      color: "#2c3e50",
      margin: 0,
    },
    email: {
      fontSize: "0.9em",
      color: "#6c757d",
      margin: 0,
    },
    infoItem: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "10px",
      color: "#333",
      fontSize: "0.9em",
    },
    icon: {
      color: "#667eea",
      fontSize: "1em",
    },
    estadoContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      marginTop: "10px",
    },
    estadoActivo: {
      backgroundColor: "#d4edda",
      color: "#155724",
      padding: "4px 10px",
      borderRadius: "8px",
      fontSize: "0.8em",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "5px",
    },
    estadoInactivo: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      padding: "4px 10px",
      borderRadius: "8px",
      fontSize: "0.8em",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "5px",
    },
    actions: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "15px",
    },
    btnEditar: {
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      color: "white",
      border: "none",
      padding: "8px 15px",
      borderRadius: "8px",
      fontSize: "0.85em",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    btnEliminar: {
      background: "linear-gradient(135deg, #e53935, #b71c1c)",
      color: "white",
      border: "none",
      padding: "8px 15px",
      borderRadius: "8px",
      fontSize: "0.85em",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    // 🔹 Estilos del modal de confirmación
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modalContent: {
      background: "#fff",
      borderRadius: "10px",
      padding: "30px 40px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      maxWidth: "420px",
      textAlign: "center",
      animation: "fadeIn 0.3s ease",
    },
    modalButtons: {
      display: "flex",
      justifyContent: "center",
      gap: "15px",
      marginTop: "20px",
    },
    btnCancelar: {
      background: "#6c757d",
      color: "#fff",
      border: "none",
      padding: "10px 25px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
    },
    btnConfirmar: {
      background: "linear-gradient(135deg, #e53935, #b71c1c)",
      color: "#fff",
      border: "none",
      padding: "10px 25px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
    },
  };

  return (
    <>
      <div style={styles.gridContainer}>
        {usuarios.map((empleado) => (
          <div key={empleado.id_empleado} style={styles.card}>
            {/* Encabezado */}
            <div style={styles.header}>
              <img
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                alt="Avatar"
                style={styles.avatar}
              />
              <div>
                <h3 style={styles.name}>{empleado.nombre_completo}</h3>
                <p style={styles.email}>{empleado.correo || "Sin correo"}</p>
              </div>
            </div>

            {/* Perfil */}
            <div style={styles.infoItem}>
              <FaUserTag style={styles.icon} />
              <span>
                <strong>Perfil:</strong> {empleado.perfil || "Sin perfil"}
              </span>
            </div>

            {/* Teléfono */}
            <div style={styles.infoItem}>
              <FaEnvelope style={styles.icon} />
              <span>
                <strong>Teléfono:</strong> {empleado.telefono || "—"}
              </span>
            </div>

            {/* Estado */}
            <div style={styles.estadoContainer}>
              <strong>Estado:</strong>
              <span
                style={
                  empleado.estado === "Activo"
                    ? styles.estadoActivo
                    : styles.estadoInactivo
                }
              >
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

            {/* Botones */}
            <div style={styles.actions}>
              <button style={styles.btnEditar} onClick={() => onEditarEmpleado(empleado)}>
                Editar
              </button>
              <button style={styles.btnEliminar} onClick={() => handleEliminarClick(empleado)}>
                <FaTrash /> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de confirmación */}
      {mostrarConfirmacion && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>¿Eliminar empleado?</h3>
            <p>
              ¿Estás seguro de eliminar a <strong>{empleadoSeleccionado?.nombre_completo}</strong>?
            </p>

            <div style={styles.modalButtons}>
              <button
                style={styles.btnCancelar}
                onClick={() => setMostrarConfirmacion(false)}
              >
                Cancelar
              </button>
              <button
                style={styles.btnConfirmar}
                onClick={confirmarEliminar}
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

export default ListaUsuarios;
