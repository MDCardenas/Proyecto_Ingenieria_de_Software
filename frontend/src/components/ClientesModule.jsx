import { useEffect, useRef, useState } from "react";
import { FaUserPlus, FaSearch, FaTrash, FaIdCard, FaSync, FaUsers, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import axios from "axios";
import "../styles/scss/main.scss";

export default function ClientesModule({ setVistaActual }) {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({
    numero_identidad: "",
    rtn: "",
    nombre: "",
    apellido: "",
    direccion: "",
    correo: "",
    telefono: ""
  });
  const [editId, setEditId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [accionActiva, setAccionActiva] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [clientesPorPagina] = useState(10);

  // Ref para el formulario
  const formRef = useRef(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      console.log("🔄 Cargando clientes...");
      const res = await axios.get("http://localhost:8000/api/clientes/");
      console.log("✅ Clientes cargados:", res.data);
      setClientes(res.data);
      setError(null);
    } catch (err) {
      console.error("❌ Error al cargar clientes:", err);
      setError("Error al cargar los clientes. Verifica la conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Función para normalizar texto (quitar tildes y convertir a minúsculas)
  const normalizarTexto = (texto) => {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "telefono") {
      // Formato: xxxx-xxxx (8 dígitos)
      const soloNumeros = value.replace(/[^\d]/g, '').slice(0, 8);
      let visual = soloNumeros;
      if (soloNumeros.length > 4) {
        visual = soloNumeros.slice(0, 4) + '-' + soloNumeros.slice(4);
      }
      setForm({ ...form, [name]: visual });
      
    } else if (name === "numero_identidad") {
      // Formato: xxxx-xxxx-xxxxx (13 dígitos)
      const soloNumeros = value.replace(/[^\d]/g, '').slice(0, 13);
      let visual = soloNumeros;
      if (soloNumeros.length > 4) {
        visual = soloNumeros.slice(0, 4) + '-' + soloNumeros.slice(4);
      }
      if (soloNumeros.length > 8) {
        visual = visual.slice(0, 9) + '-' + soloNumeros.slice(8);
      }
      setForm({ ...form, [name]: visual });
      
    } else if (name === "rtn") {
      // Formato: xxxx-xxxx-xxxxx-x (14 dígitos)
      // Ejemplo: 0801-2003-00814-1
      const soloNumeros = value.replace(/[^\d]/g, '').slice(0, 14);
      let visual = soloNumeros;
      
      // Primer guión después de 4 dígitos
      if (soloNumeros.length > 4) {
        visual = soloNumeros.slice(0, 4) + '-' + soloNumeros.slice(4);
      }
      
      // Segundo guión después de 8 dígitos (posición 9 con el primer guión)
      if (soloNumeros.length > 8) {
        visual = soloNumeros.slice(0, 4) + '-' + 
                 soloNumeros.slice(4, 8) + '-' + 
                 soloNumeros.slice(8);
      }
      
      // Tercer guión después de 13 dígitos (posición 15 con los otros guiones)
      if (soloNumeros.length > 13) {
        visual = soloNumeros.slice(0, 4) + '-' + 
                 soloNumeros.slice(4, 8) + '-' + 
                 soloNumeros.slice(8, 13) + '-' + 
                 soloNumeros.slice(13);
      }
      
      setForm({ ...form, [name]: visual });
      
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validaciones de campos obligatorios
      if (!form.numero_identidad.trim()) {
        throw new Error("El número de identidad es obligatorio");
      }
      if (!form.nombre.trim()) {
        throw new Error("El nombre es obligatorio");
      }
      if (!form.apellido.trim()) {
        throw new Error("El apellido es obligatorio");
      }

      // Validar formato de número de identidad (13 dígitos)
      const identidadLimpia = form.numero_identidad.replace(/-/g, '');
      if (identidadLimpia.length !== 13) {
        throw new Error("El número de identidad debe tener 13 dígitos");
      }

      // Validar formato de RTN si se proporciona (14 dígitos)
      if (form.rtn && form.rtn.replace(/-/g, '').length !== 14) {
        throw new Error("El RTN debe tener 14 dígitos");
      }

      // Validar formato de teléfono si se proporciona (8 dígitos)
      if (form.telefono && form.telefono.replace(/-/g, '').length !== 8) {
        throw new Error("El teléfono debe tener 8 dígitos");
      }

      // Preparar datos para enviar
      const dataToSend = {
        numero_identidad: identidadLimpia,
        rtn: form.rtn ? form.rtn.replace(/-/g, '') : '',
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        direccion: form.direccion.trim() || '',
        correo: form.correo.trim() || '',
        telefono: form.telefono ? parseInt(form.telefono.replace(/-/g, '')) : null
      };

      console.log("📤 Enviando datos:", dataToSend);

      let response;
      if (editId) {
        response = await axios.put(`http://localhost:8000/api/clientes/${editId}/`, dataToSend);
        setSuccess("¡Cliente actualizado exitosamente!");
      } else {
        response = await axios.post("http://localhost:8000/api/clientes/", dataToSend);
        setSuccess("¡Cliente registrado exitosamente!");
      }

      console.log("✅ Respuesta del servidor:", response.data);

      // Limpiar formulario
      setForm({ 
        numero_identidad: "", 
        rtn: "", 
        nombre: "", 
        apellido: "", 
        direccion: "", 
        correo: "", 
        telefono: "" 
      });
      setEditId(null);
      await fetchClientes();
      
    } catch (err) {
      console.error("❌ Error al guardar cliente:", err);
      let mensajeError = "Error al guardar el cliente.";
      
      if (err.response) {
        console.error("📋 Detalles del error:", err.response.data);
        
        if (err.response.status === 400) {
          // Manejar errores de validación del backend
          const errores = err.response.data;
          if (typeof errores === 'object') {
            // Unir todos los mensajes de error
            const mensajes = Object.values(errores).flat();
            mensajeError = "Errores de validación: " + mensajes.join(', ');
          } else {
            mensajeError = "Error de validación: " + JSON.stringify(errores);
          }
        } else if (err.response.status === 405) {
          mensajeError = "Método no permitido. Verifica backend.";
        } else {
          mensajeError = `Error del servidor: ${err.response.status} - ${err.response.statusText}`;
        }
      } else if (err.request) {
        mensajeError = "No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.";
      } else {
        mensajeError = err.message;
      }
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cliente) => {
    setForm({
      numero_identidad: cliente.numero_identidad || "",
      rtn: cliente.rtn || "",
      nombre: cliente.nombre || "",
      apellido: cliente.apellido || "",
      direccion: cliente.direccion || "",
      correo: cliente.correo || "",
      telefono: cliente.telefono
        ? String(cliente.telefono).padStart(8, '0').replace(/(\d{4})(\d{0,4})/, '$1-$2')
        : ""
    });
    setEditId(cliente.id_cliente);
    setAccionActiva("registrar");
    setError(null);
    setSuccess(null);

    setTimeout(() => {
      const firstInput = formRef.current?.querySelector('input[name="numero_identidad"]');
      if (firstInput && typeof firstInput.scrollIntoView === "function") {
        firstInput.scrollIntoView({ behavior: "smooth", block: "center" });
        firstInput.focus({ preventScroll: true });
      }
    }, 150);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar este cliente?")) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:8000/api/clientes/${id}/`);
        await fetchClientes();
        setError(null);
        setSuccess("¡Cliente eliminado exitosamente!");
      } catch (err) {
        console.error("Error al eliminar cliente:", err);
        setError("Error al eliminar el cliente.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Función para filtrar clientes localmente - MEJORADA para ser insensible a tildes
  const filtrarClientes = () => {
    if (!busqueda.trim()) {
      return clientes;
    }
    
    const searchNormalized = normalizarTexto(busqueda.trim());
    
    return clientes.filter(c => {
      const nombreCompleto = normalizarTexto(`${c.nombre} ${c.apellido}`);
      const numeroIdentidad = normalizarTexto(c.numero_identidad || '');
      const rtn = normalizarTexto(c.rtn || '');
      const correo = normalizarTexto(c.correo || '');
      const telefono = c.telefono ? String(c.telefono) : '';
      
      return nombreCompleto.includes(searchNormalized) || 
             numeroIdentidad.includes(searchNormalized) ||
             rtn.includes(searchNormalized) ||
             correo.includes(searchNormalized) || 
             telefono.includes(searchNormalized);
    });
  };

  // Obtener clientes para la página actual
  const obtenerClientesPagina = () => {
    const clientesFiltrados = filtrarClientes();
    const indexUltimoCliente = paginaActual * clientesPorPagina;
    const indexPrimerCliente = indexUltimoCliente - clientesPorPagina;
    return clientesFiltrados.slice(indexPrimerCliente, indexUltimoCliente);
  };

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  // Función para formatear número de identidad con guiones
  const formatearIdentidad = (identidad) => {
    if (!identidad) return "N/A";
    const soloNumeros = identidad.replace(/\D/g, '');
    if (soloNumeros.length === 13) {
      return soloNumeros.replace(/(\d{4})(\d{4})(\d{5})/, '$1-$2-$3');
    }
    return identidad;
  };

  // Función para formatear RTN con guiones
  const formatearRTN = (rtn) => {
    if (!rtn) return "N/A";
    const soloNumeros = rtn.replace(/\D/g, '');
    if (soloNumeros.length === 14) {
      return soloNumeros.replace(/(\d{4})(\d{4})(\d{5})(\d{1})/, '$1-$2-$3-$4');
    }
    return rtn;
  };

  const accionesRapidas = [
    {
      id: 1, 
      icon: FaUserPlus, 
      title: "Registrar Cliente", 
      description: "Agregar nuevo cliente", 
      color: "#10b981",
      action: () => {
        setEditId(null);
        setForm({ 
          numero_identidad: "", 
          rtn: "", 
          nombre: "", 
          apellido: "", 
          direccion: "", 
          correo: "", 
          telefono: "" 
        });
        setAccionActiva("registrar");
        setError(null);
        setSuccess(null);
      }
    },
    { 
      id: 2, 
      icon: FaSearch, 
      title: "Buscar Cliente", 
      description: "Buscar por nombre o identidad", 
      color: "#3b82f6", 
      action: () => { 
        setAccionActiva("buscar"); 
        setError(null); 
        setSuccess(null); 
        setPaginaActual(1);
      } 
    },
    { 
      id: 3, 
      icon: FaTrash, 
      title: "Eliminar Cliente", 
      description: "Eliminar cliente seleccionado", 
      color: "#ef4444", 
      action: () => { 
        setAccionActiva("eliminar"); 
        setError(null); 
        setSuccess(null); 
        setPaginaActual(1);
      } 
    },
  ];

  const clientesFiltrados = filtrarClientes();
  const clientesPagina = obtenerClientesPagina();
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);

  return (
    <div className="clientes-module">
      {/* Header */}
      <div className="module-header">
        <button onClick={() => setVistaActual("dashboard")} className="btn-volver">
          ← Volver al Dashboard
        </button>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
          <button onClick={() => setSuccess(null)} className="success-close">×</button>
        </div>
      )}

      {/* Acciones rápidas */}
      {!accionActiva && (
        <div className="acciones-section">
          <h2 className="section-title">Gestión de Clientes</h2>
          <div className="acciones-grid">
            {accionesRapidas.map((accion) => {
              const Icon = accion.icon;
              return (
                <div key={accion.id} className="accion-card" onClick={accion.action}>
                  <div className="accion-icon-wrapper" style={{ backgroundColor: `${accion.color}15` }}>
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
      )}

      {/* PANTALLAS */}
      {accionActiva === "registrar" && (
        <div className="pantalla-accion">
          <h2 className="form-title">{editId ? "Editar Cliente" : "Registrar Cliente"}</h2>

          <form className="form-cliente" onSubmit={handleSubmit} ref={formRef}>
            <div className="form-campos">
              {/* Campos de identificación */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="numero_identidad">
                    Número de Identidad *
                    <FaIdCard style={{ marginLeft: '8px', color: '#6b7280', fontSize: '0.9rem' }} />
                  </label>
                  <input 
                    className="form-input"
                    id="numero_identidad" 
                    name="numero_identidad" 
                    placeholder="xxxx-xxxx-xxxxx" 
                    value={form.numero_identidad} 
                    onChange={handleChange} 
                    required 
                    disabled={loading || !!editId}
                  />
                  <small className="form-hint">Formato: xxxx-xxxx-xxxxx (13 dígitos)</small>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="rtn">RTN</label>
                  <input 
                    className="form-input"
                    id="rtn" 
                    name="rtn" 
                    placeholder="xxxx-xxxx-xxxxx-x" 
                    value={form.rtn} 
                    onChange={handleChange} 
                    disabled={loading || !!editId}
                  />
                  <small className="form-hint">Formato: xxxx-xxxx-xxxxx-x (14 dígitos)</small>
                </div>
              </div>

              {/* Campos personales */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="nombre">Nombre *</label>
                  <input 
                    className="form-input"
                    id="nombre" 
                    name="nombre" 
                    placeholder="Nombre" 
                    value={form.nombre} 
                    onChange={handleChange} 
                    required 
                    disabled={loading} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="apellido">Apellido *</label>
                  <input 
                    className="form-input"
                    id="apellido" 
                    name="apellido" 
                    placeholder="Apellido" 
                    value={form.apellido} 
                    onChange={handleChange} 
                    required 
                    disabled={loading} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="correo">Email</label>
                <input 
                  className="form-input"
                  id="correo" 
                  name="correo" 
                  type="email" 
                  placeholder="cliente@example.com" 
                  value={form.correo} 
                  onChange={handleChange} 
                  disabled={loading} 
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="telefono">Teléfono</label>
                <input 
                  className="form-input"
                  id="telefono" 
                  name="telefono" 
                  type="tel" 
                  placeholder="3322-0000" 
                  value={form.telefono} 
                  onChange={handleChange} 
                  disabled={loading} 
                />
                <small className="form-hint">Formato: xxxx-xxxx (8 dígitos)</small>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="direccion">Dirección</label>
                <input 
                  className="form-input"
                  id="direccion" 
                  name="direccion" 
                  placeholder="Dirección completa" 
                  value={form.direccion} 
                  onChange={handleChange} 
                  disabled={loading} 
                />
              </div>
            </div>

            {/* Botones */}
            <div className="botones-container">
              <button 
                type="submit" 
                className="btn-submit" 
                disabled={loading}
              >
                {loading ? "Procesando..." : (editId ? "Actualizar" : "Registrar")}
              </button>
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={() => setAccionActiva(null)} 
                disabled={loading}
              >
                Volver
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pantalla de buscar/eliminar - ESTILO MEJORADO */}
      {(accionActiva === "buscar" || accionActiva === "eliminar") && (
        <div className="pantalla-busqueda-mejorada">
          {/* Header */}
          <div className="list-header">
            <div className="header-left">
              <h2>
                {accionActiva === "buscar" ? "Buscar Clientes" : "Eliminar Clientes"}
              </h2>
              <p className="subtitle">
                {accionActiva === "buscar" 
                  ? "Busca y gestiona clientes registrados" 
                  : "Elimina clientes del sistema"}
              </p>
            </div>
            <div className="header-actions">
              <button 
                onClick={() => setAccionActiva(null)}
                className="btn-volver"
              >
                ← Volver
              </button>
              <button 
                onClick={fetchClientes}
                className="btn-refresh"
                disabled={loading}
              >
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
                  placeholder="Buscar por nombre, identidad, RTN, correo o teléfono..."
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPaginaActual(1);
                  }}
                  className="input-busqueda"
                />
              </div>
              {busqueda && (
                <button 
                  onClick={() => setBusqueda("")}
                  className="btn-limpiar"
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="estadisticas-rapidas">
              <span>Mostrando: {clientesPagina.length} de {clientesFiltrados.length} clientes</span>
              {busqueda && (
                <span className="filtro-activo">
                  Búsqueda: "{busqueda}"
                </span>
              )}
            </div>
          </div>

          {/* Lista de clientes - ESTILO TABLA MEJORADA */}
          {loading ? (
            <div className="loading-message">Cargando clientes...</div>
          ) : (
            <div className="tabla-container">
              <table className="tabla-clientes">
                <thead>
                  <tr>
                    <th>Información Personal</th>
                    <th>Documentos</th>
                    <th>Información de Contacto</th>
                    <th>Dirección</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesPagina.length > 0 ? (
                    clientesPagina.map(cliente => (
                      <tr key={cliente.id_cliente} className="fila-cliente">
                        <td className="cliente-info-personal">
                          <div className="nombre-completo">
                            <strong>{cliente.nombre} {cliente.apellido}</strong>
                          </div>
                          <div className="cliente-id">
                            <small>ID: {cliente.id_cliente}</small>
                          </div>
                        </td>
                        <td className="cliente-documentos">
                          <div className="documento-item">
                            <FaIdCard className="documento-icon" />
                            <span className="documento-label">Identidad:</span>
                            <span className="documento-valor">{formatearIdentidad(cliente.numero_identidad)}</span>
                          </div>
                          <div className="documento-item">
                            <FaIdCard className="documento-icon" />
                            <span className="documento-label">RTN:</span>
                            <span className="documento-valor">{formatearRTN(cliente.rtn)}</span>
                          </div>
                        </td>
                        <td className="cliente-contacto">
                          <div className="contacto-item">
                            <FaEnvelope className="contacto-icon" />
                            <span className="contacto-label">Email:</span>
                            <span className="contacto-valor">{cliente.correo || "No especificado"}</span>
                          </div>
                          <div className="contacto-item">
                            <FaPhone className="contacto-icon" />
                            <span className="contacto-label">Teléfono:</span>
                            <span className="contacto-valor">
                              {cliente.telefono ? 
                                String(cliente.telefono).replace(/(\d{4})(\d{4})/, '$1-$2') : 
                                "No especificado"}
                            </span>
                          </div>
                        </td>
                        <td className="cliente-direccion">
                          <div className="direccion-item">
                            <FaMapMarkerAlt className="direccion-icon" />
                            <span className="direccion-texto">
                              {cliente.direccion || "No especificada"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="acciones-tabla">
                            {accionActiva === "buscar" && (
                              <button 
                                onClick={() => handleEdit(cliente)} 
                                className="btn-editar"
                                disabled={loading}
                              >
                                Editar
                              </button>
                            )}
                            {accionActiva === "eliminar" && (
                              <button 
                                onClick={() => handleDelete(cliente.id_cliente)} 
                                className="btn-eliminar"
                                disabled={loading}
                              >
                                Eliminar
                              </button>
                            )}
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
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="btn-paginacion"
              >
                Anterior
              </button>
              
              <span className="info-paginacion">
                Página {paginaActual} de {totalPaginas}
              </span>
              
              <button 
                onClick={() => cambiarPagina(paginaActual + 1)}
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
      )}
    </div>
  );
}