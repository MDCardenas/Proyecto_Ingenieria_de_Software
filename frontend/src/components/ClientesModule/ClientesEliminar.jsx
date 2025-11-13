
import { FaSync, FaSearch, FaEnvelope, FaPhone, FaTrash } from 'react-icons/fa';
import "../../styles/scss/pages/_clientes.scss";

const ClientesEliminar = ({
  clientes,
  clientesFiltrados,
  clientesPagina,
  loading,
  busqueda,
  paginaActual,
  totalPaginas,
  onBusquedaChange,
  onPaginaChange,
  onVolver,
  onRefresh,
  onDelete,
  formatearIdentidad
}) => {
  return (
    <div className="pantalla-busqueda-mejorada">
      {/* Header */}
      <div className="list-header">
        <div className="header-left">
          <h2>Eliminar Clientes</h2>
          <p className="subtitle">Elimina clientes del sistema</p>
        </div>
        <div className="header-actions">
          <button onClick={onVolver} className="btn-volver">
            ← Volver
          </button>
          <button onClick={onRefresh} className="btn-refresh" disabled={loading}>
            <FaSync className={loading ? "spin" : ""} />
            {loading ? "Cargando..." : "Actualizar"}
          </button>
        </div>
      </div>

      {/* Barra de búsqueda y estadísticas */}
      <div className="filtros-container">
        <div className="search-section">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input 
              type="text"
              placeholder="Buscar por nombre, identidad, correo o teléfono..."
              value={busqueda}
              onChange={(e) => {
                onBusquedaChange(e.target.value);
                onPaginaChange(1);
              }}
              className="input-busqueda"
            />
          </div>
          {busqueda && (
            <button onClick={() => onBusquedaChange("")} className="btn-limpiar">
              Limpiar
            </button>
          )}
        </div>

        <div className="estadisticas-rapidas">
          <span>Mostrando: {clientesPagina.length} de {clientesFiltrados.length} clientes</span>
          {busqueda && (
            <span className="filtro-activo">Búsqueda: "{busqueda}"</span>
          )}
        </div>
      </div>

      {/* Lista de clientes - TABLA SIMPLIFICADA */}
      {loading ? (
        <div className="loading-message">Cargando clientes...</div>
      ) : (
        <div className="tabla-container">
          <table className="tabla-clientes-simple">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Número de Identidad</th>
                <th>Correo Electrónico</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesPagina.length > 0 ? (
                clientesPagina.map(cliente => (
                  <tr key={cliente.id_cliente} className="fila-cliente">
                    <td className="cliente-nombre">
                      <div className="nombre-completo">
                        <strong>{cliente.nombre} {cliente.apellido}</strong>
                      </div>
                      <div className="cliente-id">
                        <small>ID: {cliente.id_cliente}</small>
                      </div>
                    </td>
                    <td className="cliente-identidad">
                      <span className="identidad-valor">
                        {formatearIdentidad(cliente.numero_identidad)}
                      </span>
                    </td>
                    <td className="cliente-correo">
                      <div className="correo-item">
                        <FaEnvelope className="correo-icon" />
                        <span className="correo-valor">
                          {cliente.correo || "No especificado"}
                        </span>
                      </div>
                    </td>
                    <td className="cliente-telefono">
                      <div className="telefono-item">
                        <FaPhone className="telefono-icon" />
                        <span className="telefono-valor">
                          {cliente.telefono ? 
                            String(cliente.telefono).replace(/(\d{4})(\d{4})/, '$1-$2') : 
                            "No especificado"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="acciones-tabla">
                        <button 
                          onClick={() => onDelete(cliente.id_cliente)} 
                          className="btn-eliminar"
                          disabled={loading}
                          title="Eliminar cliente"
                        >
                          <FaTrash />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="sin-resultados">
                    {busqueda 
                      ? 'No se encontraron clientes que coincidan con la búsqueda'
                      : 'No hay clientes registrados'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="paginacion">
          <button 
            onClick={() => onPaginaChange(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="btn-paginacion"
          >
            Anterior
          </button>
          
          <span className="info-paginacion">
            Página {paginaActual} de {totalPaginas}
          </span>
          
          <button 
            onClick={() => onPaginaChange(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="btn-paginacion"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Resumen final */}
      <div className="resumen-final">
        <div className="resumen-stats">
          <span>
            Clientes mostrados: <strong>{clientesPagina.length}</strong> | 
            Total en sistema: <strong>{clientes.length}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClientesEliminar;
