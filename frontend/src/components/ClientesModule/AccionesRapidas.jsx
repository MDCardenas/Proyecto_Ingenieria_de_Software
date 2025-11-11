import { FaUserPlus, FaSearch, FaTrash } from 'react-icons/fa';
import "../../styles/scss/pages/_clientes.scss";
const AccionesRapidas = ({ onAccionSeleccionada }) => {
  const acciones = [
    {
      id: 1, 
      icon: FaUserPlus, 
      title: "Registrar Cliente", 
      description: "Agregar nuevo cliente", 
      color: "#10b981",
      action: "registrar"
    },
    { 
      id: 2, 
      icon: FaSearch, 
      title: "Buscar Cliente", 
      description: "Buscar por nombre o identidad", 
      color: "#3b82f6", 
      action: "buscar" 
    },
    { 
      id: 3, 
      icon: FaTrash, 
      title: "Eliminar Cliente", 
      description: "Eliminar cliente seleccionado", 
      color: "#ef4444", 
      action: "eliminar" 
    },
  ];

  return (
    <div className="acciones-section">
      <h2 className="section-title">Gestión de Clientes</h2>
      <div className="acciones-grid">
        {acciones.map((accion) => {
          const Icon = accion.icon;
          return (
            <div 
              key={accion.id} 
              className="accion-card" 
              onClick={() => onAccionSeleccionada(accion.action)}
            >
              <div 
                className="accion-icon-wrapper" 
                style={{ backgroundColor: `${accion.color}15` }}
              >
                <Icon className="accion-icon" style={{ color: accion.color }} />
              </div>
              <div className="accion-content">
                <h3 className="accion-title">{accion.title}</h3>
                <p className="accion-description">{accion.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccionesRapidas;