import React from "react";
import TarjetaUsuario from "./TarjetaUsuario";

const ListaUsuarios = ({ usuarios, onEditarEmpleado, onEmpleadoEliminado, onVerDetalles }) => {
  return (
    <div className="usuarios-grid-compact">
      {usuarios.map((empleado) => (
        <TarjetaUsuario
          key={empleado.id_empleado}
          empleado={empleado}
          onEditar={onEditarEmpleado}
          onEliminado={onEmpleadoEliminado}
          onVerDetalles={onVerDetalles}
        />
      ))}
    </div>
  );
};

export default ListaUsuarios;