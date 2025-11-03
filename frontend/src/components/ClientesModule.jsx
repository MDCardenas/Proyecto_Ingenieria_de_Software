import { useEffect, useRef, useState } from "react";
import { FaUserPlus, FaSearch, FaTrash } from 'react-icons/fa';
import axios from "axios";
import "../styles/ClientesModule.css";
import "../styles/BaseLayout.css";

export default function ClientesModule({ setVistaActual }) {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({
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
      const res = await axios.get("http://localhost:8000/api/clientes/");
      setClientes(res.data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
      setError("Error al cargar los clientes. Verifica la conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "telefono") {
      const soloNumeros = value.replace(/[^\d]/g, '').slice(0, 8);
      let visual = soloNumeros;
      if (soloNumeros.length > 4) visual = soloNumeros.slice(0, 4) + '-' + soloNumeros.slice(4);
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
      const dataToSend = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        direccion: form.direccion.trim() || null,
        correo: form.correo.trim() || null,
        telefono: form.telefono ? parseInt(form.telefono.replace('-', '')) : null
      };

      if (editId) {
        await axios.put(`http://localhost:8000/api/clientes/${editId}/`, dataToSend);
        setSuccess("¡Cliente actualizado exitosamente!");
      } else {
        await axios.post("http://localhost:8000/api/clientes/crear/", dataToSend);
        setSuccess("¡Cliente registrado exitosamente!");
      }

      // Limpiar formulario pero mantenernos en la misma pantalla
      setForm({ nombre: "", apellido: "", direccion: "", correo: "", telefono: "" });
      setEditId(null);
      await fetchClientes();
      
    } catch (err) {
      console.error("Error al guardar cliente:", err);
      let mensajeError = "Error al guardar el cliente.";
      if (err.response) {
        if (err.response.status === 400) {
          const detalles = err.response.data?.detalles || err.response.data;
          mensajeError = "Error de validación: " + JSON.stringify(detalles);
        } else if (err.response.status === 405) {
          mensajeError = "Método no permitido. Verifica backend.";
        } else {
          mensajeError = `Error del servidor: ${err.response.status} - ${err.response.statusText}`;
        }
      } else if (err.request) {
        mensajeError = "No se pudo conectar con el servidor.";
      }
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cliente) => {
    setForm({
      nombre: cliente.nombre || "",
      apellido: cliente.apellido || "",
      direccion: cliente.direccion || "",
      correo: cliente.correo || "",
      telefono: cliente.telefono
        ? String(cliente.telefono).padStart(8, '0').replace(/(\d{4})(\d{0,4})/, '$1-$2')
        : ""
    });
    setEditId(cliente.id);
    setAccionActiva("registrar");
    setError(null);
    setSuccess(null);

    setTimeout(() => {
      const firstInput = formRef.current?.querySelector('input[name="nombre"]');
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

  // Función para filtrar clientes localmente (búsqueda en tiempo real)
  const filtrarClientes = () => {
    if (!busqueda.trim()) {
      return clientes;
    }
    
    const searchLower = busqueda.toLowerCase().trim();
    return clientes.filter(c => {
      const nombreCompleto = `${c.nombre} ${c.apellido}`.toLowerCase();
      const correo = (c.correo || '').toLowerCase();
      const telefono = c.telefono ? String(c.telefono) : '';
      
      return nombreCompleto.includes(searchLower) || 
             correo.includes(searchLower) || 
             telefono.includes(searchLower);
    });
  };

  const accionesRapidas = [
    {
      id: 1, icon: FaUserPlus, title: "Registrar Cliente", description: "Agregar nuevo cliente", color: "#10b981",
      action: () => {
        setEditId(null);
        setForm({ nombre: "", apellido: "", direccion: "", correo: "", telefono: "" });
        setAccionActiva("registrar");
        setError(null);
        setSuccess(null);
      }
    },
    { id: 2, icon: FaSearch, title: "Buscar Cliente", description: "Buscar por nombre o correo", color: "#3b82f6", action: () => { setAccionActiva("buscar"); setError(null); setSuccess(null); } },
    { id: 3, icon: FaTrash, title: "Eliminar Cliente", description: "Eliminar cliente seleccionado", color: "#ef4444", action: () => { setAccionActiva("eliminar"); setError(null); setSuccess(null); } },
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
                  placeholder="meza@example.com" 
                  value={form.correo} 
                  onChange={handleChange} 
                  disabled={loading} 
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="telefono">Teléfono (8 dígitos)</label>
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
                <small className="form-hint">Solo números, formato xxxx-xxxx</small>
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

            {/* BOTONES MÁS PEQUEÑOS */}
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
          
          {/* Barra de búsqueda horizontal - FUERA del scroll */}
          <div className="search-bar-horizontal" style={{ flexShrink: 0, marginBottom: '0.8rem' }}>
            <input 
              className="input-busqueda"
              placeholder="Buscar por nombre, apellido, correo o teléfono..." 
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
          
          {/* CONTENEDOR PRINCIPAL CON SCROLL */}
          <div className="contenido-con-scroll">
            {/* Lista de clientes */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {(() => {
                const clientesFiltrados = filtrarClientes();
                return clientesFiltrados.length > 0 ? (
                  <ul className="clientes-lista">
                    {clientesFiltrados.map(c => (
                      <li key={c.id}>
                        <div>
                          <strong>{c.nombre} {c.apellido}</strong>
                          <div style={{ color: "#6b7280", fontSize: "0.95rem" }}>
                            {c.correo || "Sin correo"} · {c.telefono ? 
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
                            <button onClick={() => handleDelete(c.id)} className="btn-eliminar" disabled={loading}>
                              Eliminar
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  /* Mensaje si no hay clientes */
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