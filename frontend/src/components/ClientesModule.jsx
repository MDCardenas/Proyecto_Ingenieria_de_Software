import { useEffect, useRef, useState } from "react";
import { FaUserPlus, FaSearch, FaTrash, FaIdCard } from 'react-icons/fa';
import axios from "axios";
import "../styles/ClientesModule.css";

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
      } 
    },
  ];

  return (
    <div className="clientes-module">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Módulo de Clientes</h1>
          <p className="module-subtitle">Gestión completa de clientes</p>
        </div>
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
          <h2 className="section-title">Acciones Rápidas</h2>
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
                    disabled={loading || !!editId} // No permitir editar el número de identidad
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
                    disabled={loading || !!editId} // RTN tampoco se puede editar
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

      {/* Pantalla de buscar/eliminar */}
      {(accionActiva === "buscar" || accionActiva === "eliminar") && (
        <div className="pantalla-busqueda">
          {/* Header con título y botón volver */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
            <h2 className="form-title" style={{ margin: 0 }}>
              {accionActiva === "buscar" ? "Buscar Cliente" : "Eliminar Cliente"}
            </h2>
            <button 
              className="btn-cancel" 
              onClick={() => {
                setAccionActiva(null);
                setBusqueda("");
              }} 
              disabled={loading}
            >
              ← Volver
            </button>
          </div>
          
          {/* Barra de búsqueda horizontal */}
          <div className="search-bar-horizontal" style={{ flexShrink: 0, marginBottom: '0.8rem' }}>
            <input 
              className="input-busqueda"
              placeholder="Buscar por nombre, identidad, RTN, correo o teléfono..." 
              value={busqueda} 
              onChange={(e) => setBusqueda(e.target.value)}
              disabled={loading} 
            />
            <button 
              className="btn-buscar" 
              onClick={() => setBusqueda("")}
              disabled={loading || !busqueda}
              style={{ minWidth: '100px' }}
            >
              Limpiar
            </button>
          </div>
          
          {/* Contenedor principal con scroll */}
          <div className="contenido-con-scroll">
            {/* Lista de clientes */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {(() => {
                const clientesFiltrados = filtrarClientes();
                return clientesFiltrados.length > 0 ? (
                  <ul className="clientes-lista">
                    {clientesFiltrados.map(c => (
                      <li key={c.id_cliente}>
                        <div>
                          <strong>{c.nombre} {c.apellido}</strong>
                          <div style={{ color: "#6b7280", fontSize: "0.95rem" }}>
                            <strong>ID:</strong> {c.numero_identidad} 
                            {c.rtn && <span> • <strong>RTN:</strong> {c.rtn}</span>}
                          </div>
                          <div style={{ color: "#6b7280", fontSize: "0.95rem" }}>
                            {c.correo || "Sin correo"} • {c.telefono ? 
                            String(c.telefono).replace(/(\d{4})(\d{4})/, '$1-$2') : 
                            "Sin teléfono"}
                          </div>
                          {c.direccion && (
                            <div style={{ color: "#9ca3af", fontSize: "0.85rem", marginTop: "0.3rem" }}>
                              {c.direccion}
                            </div>
                          )}
                        </div>
                        <div>
                          {accionActiva === "buscar" && (
                            <button onClick={() => handleEdit(c)} className="btn-editar" disabled={loading}>
                              Editar
                            </button>
                          )}
                          {accionActiva === "eliminar" && (
                            <button onClick={() => handleDelete(c.id_cliente)} className="btn-eliminar" disabled={loading}>
                              Eliminar
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem', 
                    color: '#6b7280',
                    fontStyle: 'italic',
                    flexShrink: 0
                  }}>
                    {busqueda ? 'No se encontraron clientes que coincidan con la búsqueda' : 'No hay clientes registrados'}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Footer con información */}
          <div style={{ 
            textAlign: 'center', 
            padding: '0.7rem 0', 
            color: '#6b7280',
            fontSize: '0.85rem',
            borderTop: '1px solid #e5e7eb',
            flexShrink: 0,
            marginTop: '0.5rem'
          }}>
            {(() => {
              const clientesFiltrados = filtrarClientes();
              if (busqueda) {
                return `${clientesFiltrados.length} de ${clientes.length} cliente${clientes.length !== 1 ? 's' : ''}`;
              }
              return `Total: ${clientes.length} cliente${clientes.length !== 1 ? 's' : ''}`;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}