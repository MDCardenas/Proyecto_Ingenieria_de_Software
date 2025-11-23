import React, { useEffect, useMemo, useState, useRef } from "react";
import { FaPlus, FaSearch, FaTimes, FaCalendarAlt, FaArrowLeft, FaSave } from "react-icons/fa";
import "../../styles/scss/main.scss";
import api from "../../services/api";

// Constantes
const ESTADOS = ["Pendiente", "En Proceso", "Completada"];
const TIPOS_ORDEN = [
  { value: "TODOS", label: "Todos los tipos" },
  { value: "FABRICACION", label: "Fabricación" },
  { value: "REPARACION", label: "Reparación" },
  { value: "AJUSTE", label: "Ajuste" },
];

/* ================= UTILIDADES ================= */
const normalize = (str) =>
  (str ?? "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const normalizeEstado = (s) =>
  normalize(s).replace(/_/g, " ").replace(/\s+/g, " ").trim();

const formatFechaCorta = (valor) => {
  if (!valor) return "—";
  const str = valor.toString();
  return str.split("T")[0].split(" ")[0];
};

const getNombreCliente = (orden) => {
  const nombre = orden.cliente_nombre;
  const apellido = orden.cliente_apellido;
  if (nombre && apellido && !nombre.includes(apellido)) return `${nombre} ${apellido}`;
  return nombre || apellido || "Cliente no especificado";
};

/* ================= COMPONENTES UI ================= */
const EstadoChip = ({ estado }) => {
  const norm = normalizeEstado(estado);
  let label = "Pendiente";
  let className = "chip chip-danger";

  if (norm === "en proceso") {
    label = "En Proceso";
    className = "chip chip-warning";
  } else if (norm === "completada") {
    label = "Completada";
    className = "chip chip-success";
  }

  return <span className={className}>{label}</span>;
};

const ProgresoBar = ({ estado }) => {
  const norm = normalizeEstado(estado);
  let percent = 20;
  let colorClass = "";
  
  if (norm === "en proceso") {
    percent = 60;
    colorClass = "proceso";
  } else if (norm === "completada") {
    percent = 100;
    colorClass = "completada";
  }

  return (
    <div className="progress-container">
      <div className="progress">
        <div className={`progress-fill ${colorClass}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

/* ================= FORMULARIO INLINE (REEMPLAZO DE MODAL) ================= */
function CrearOrdenForm({ onCancel, onCreated }) {
  const [form, setForm] = useState({
    numero_factura: null,
    id_empleado: null,
    tipo_orden: "FABRICACION",
    descripcion: "",
    fecha_inicio: new Date().toISOString().slice(0, 10),
    fecha_estimada: "",
    estado: ESTADOS[0],
    costo_mano_obra: "",
  });

  // Estados de carga y datos
  const [empleados, setEmpleados] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Autocomplete
  const [busquedaEmpleado, setBusquedaEmpleado] = useState("");
  const [mostrarResultadosEmpleado, setMostrarResultadosEmpleado] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

  const [busquedaFactura, setBusquedaFactura] = useState("");
  const [mostrarResultadosFactura, setMostrarResultadosFactura] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const empleadoRef = useRef(null);
  const facturaRef = useRef(null);
  const fechaInicioRef = useRef(null);
  const fechaEstimadaRef = useRef(null);

  // Cargar datos iniciales
  useEffect(() => {
    let cancel = false;
    const loadLookups = async () => {
      try {
        setLoadingLookups(true);
        const [empRes, facRes] = await Promise.allSettled([
          api.get("/empleados/"),
          api.get("/facturas/"),
        ]);
        if (!cancel) {
          setEmpleados(empRes.status === "fulfilled" ? empRes.value.data || [] : []);
          setFacturas(facRes.status === "fulfilled" ? facRes.value.data || [] : []);
        }
      } catch (err) {
        if (!cancel) setError("Error al cargar catálogos.");
      } finally {
        if (!cancel) setLoadingLookups(false);
      }
    };
    loadLookups();
    return () => { cancel = true; };
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (empleadoRef.current && !empleadoRef.current.contains(e.target)) setMostrarResultadosEmpleado(false);
      if (facturaRef.current && !facturaRef.current.contains(e.target)) setMostrarResultadosFactura(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtros memoizados
  const empleadosFiltrados = useMemo(() => {
    const q = normalize(busquedaEmpleado);
    if (!q) return [];
    return empleados.filter((e) => normalize(`${e.nombre} ${e.apellido} ${e.usuario}`).includes(q));
  }, [empleados, busquedaEmpleado]);

  const facturasFiltradas = useMemo(() => {
    const q = normalize(busquedaFactura);
    if (!q) return [];
    return facturas.filter((f) => normalize(`#${f.numero_factura} ${f.cliente_nombre ?? ""}`).includes(q));
  }, [facturas, busquedaFactura]);

  const handleChange = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setFieldErrors((prev) => ({ ...prev, [campo]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errores = {};
    if (!form.id_empleado) errores.id_empleado = "Selecciona un empleado.";
    if (!form.numero_factura) errores.numero_factura = "Selecciona una factura.";
    if (!form.fecha_estimada) errores.fecha_estimada = "Selecciona la fecha estimada.";
    if (!form.descripcion?.trim()) errores.descripcion = "Escribe una descripción.";
    if (form.fecha_estimada && form.fecha_estimada < todayStr) errores.fecha_estimada = "Fecha inválida.";
    
    if (Object.keys(errores).length > 0) {
      setFieldErrors(errores);
      setError("Por favor completa los campos requeridos.");
      return;
    }

    try {
      setSaveLoading(true);
      const payload = { ...form, costo_mano_obra: Number(form.costo_mano_obra) || 0 };
      await api.post("/ordenes-trabajo/", payload);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Error al crear la orden.");
    } finally {
      setSaveLoading(false);
    }
  };

  const abrirPicker = (ref) => ref.current?.showPicker ? ref.current.showPicker() : ref.current?.focus();

  return (
    <div className="crear-orden-form-container">
      <div className="form-header">
        <div>
          <h2>Nueva Orden de Trabajo</h2>
          <p>Complete la información para registrar una nueva orden en el sistema.</p>
        </div>
        <button type="button" className="btn-cancel" onClick={onCancel} style={{width: 'auto', minWidth: 'auto'}}>
          <FaTimes size={20} />
        </button>
      </div>

      {error && <div className="alert error" style={{marginBottom: '1rem'}}>{error}</div>}

      <form onSubmit={handleSubmit} className="form-grid-layout">
        {/* Selector Empleado */}
        <div className="form-group" ref={empleadoRef}>
          <label>Empleado Asignado</label>
          {!empleadoSeleccionado ? (
            <div className="input-wrapper-icon">
              <input
                type="text"
                placeholder="Buscar empleado..."
                value={busquedaEmpleado}
                onChange={(e) => {
                  setBusquedaEmpleado(e.target.value);
                  setMostrarResultadosEmpleado(true);
                }}
                className={fieldErrors.id_empleado ? "error" : ""}
              />
              <button type="button" className="icon-action" onClick={() => setBusquedaEmpleado("")}>
                {busquedaEmpleado ? <FaTimes /> : <FaSearch />}
              </button>
              {mostrarResultadosEmpleado && busquedaEmpleado && (
                <div className="resultados-busqueda">
                  {empleadosFiltrados.length > 0 ? empleadosFiltrados.map(emp => (
                    <div key={emp.id_empleado} className="resultado-item" onClick={() => {
                      setEmpleadoSeleccionado(emp);
                      handleChange("id_empleado", emp.id_empleado);
                      setMostrarResultadosEmpleado(false);
                    }}>
                      <strong>{emp.nombre} {emp.apellido}</strong>
                      <div className="muted">{emp.usuario}</div>
                    </div>
                  )) : <div className="sin-resultados">No encontrado</div>}
                </div>
              )}
            </div>
          ) : (
            <div className="seleccion-mostrada">
              <div className="info-seleccion">
                <strong>{empleadoSeleccionado.nombre} {empleadoSeleccionado.apellido}</strong>
                <span className="muted">Empleado seleccionado</span>
              </div>
              <button type="button" className="btn-limpiar-seleccion" onClick={() => {
                setEmpleadoSeleccionado(null);
                handleChange("id_empleado", null);
              }}><FaTimes /></button>
            </div>
          )}
          {fieldErrors.id_empleado && <span className="mensaje-error">{fieldErrors.id_empleado}</span>}
        </div>

        {/* Selector Factura */}
        <div className="form-group" ref={facturaRef}>
          <label>Factura Vinculada</label>
          {!facturaSeleccionada ? (
            <div className="input-wrapper-icon">
              <input
                type="text"
                placeholder="Buscar factura..."
                value={busquedaFactura}
                onChange={(e) => {
                  setBusquedaFactura(e.target.value);
                  setMostrarResultadosFactura(true);
                }}
                className={fieldErrors.numero_factura ? "error" : ""}
              />
              <button type="button" className="icon-action" onClick={() => setBusquedaFactura("")}>
                {busquedaFactura ? <FaTimes /> : <FaSearch />}
              </button>
              {mostrarResultadosFactura && busquedaFactura && (
                <div className="resultados-busqueda">
                  {facturasFiltradas.length > 0 ? facturasFiltradas.map(fac => (
                    <div key={fac.numero_factura} className="resultado-item" onClick={() => {
                      setFacturaSeleccionada(fac);
                      handleChange("numero_factura", fac.numero_factura);
                      setMostrarResultadosFactura(false);
                    }}>
                      <strong>Factura #{fac.numero_factura}</strong>
                      <div className="muted">{fac.cliente_nombre}</div>
                    </div>
                  )) : <div className="sin-resultados">No encontrada</div>}
                </div>
              )}
            </div>
          ) : (
            <div className="seleccion-mostrada">
              <div className="info-seleccion">
                <strong>Factura #{facturaSeleccionada.numero_factura}</strong>
                <span className="muted">{facturaSeleccionada.cliente_nombre}</span>
              </div>
              <button type="button" className="btn-limpiar-seleccion" onClick={() => {
                setFacturaSeleccionada(null);
                handleChange("numero_factura", null);
              }}><FaTimes /></button>
            </div>
          )}
          {fieldErrors.numero_factura && <span className="mensaje-error">{fieldErrors.numero_factura}</span>}
        </div>

        {/* Tipo de Orden */}
        <div className="form-group">
          <label>Tipo de Trabajo</label>
          <select value={form.tipo_orden} onChange={(e) => handleChange("tipo_orden", e.target.value)}>
            <option value="FABRICACION">Fabricación</option>
            <option value="REPARACION">Reparación</option>
            <option value="AJUSTE">Ajuste</option>
          </select>
        </div>

        {/* Costo */}
        <div className="form-group">
          <label>Costo Mano de Obra (L.)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.costo_mano_obra}
            onChange={(e) => handleChange("costo_mano_obra", e.target.value)}
          />
        </div>

        {/* Fechas */}
        <div className="form-group">
          <label>Fecha Inicio</label>
          <div className="input-wrapper-icon">
            <input
              ref={fechaInicioRef}
              type="date"
              value={form.fecha_inicio}
              onChange={(e) => handleChange("fecha_inicio", e.target.value)}
            />
            <button type="button" className="icon-action" onClick={() => abrirPicker(fechaInicioRef)}>
              <FaCalendarAlt />
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Fecha Estimada Entrega</label>
          <div className="input-wrapper-icon">
            <input
              ref={fechaEstimadaRef}
              type="date"
              min={form.fecha_inicio || todayStr}
              value={form.fecha_estimada}
              onChange={(e) => handleChange("fecha_estimada", e.target.value)}
              className={fieldErrors.fecha_estimada ? "error" : ""}
            />
            <button type="button" className="icon-action" onClick={() => abrirPicker(fechaEstimadaRef)}>
              <FaCalendarAlt />
            </button>
          </div>
          {fieldErrors.fecha_estimada && <span className="mensaje-error">{fieldErrors.fecha_estimada}</span>}
        </div>

        {/* Descripción - Full Width */}
        <div className="form-group full-width">
          <label>Descripción del Trabajo</label>
          <textarea
            rows={4}
            value={form.descripcion}
            onChange={(e) => handleChange("descripcion", e.target.value)}
            className={fieldErrors.descripcion ? "error" : ""}
            placeholder="Detalles específicos de la joya, reparaciones necesarias, medidas, etc."
          />
          {fieldErrors.descripcion && <span className="mensaje-error">{fieldErrors.descripcion}</span>}
        </div>

        <div className="form-actions full-width">
          <button type="button" className="btn-cancel" onClick={onCancel} disabled={saveLoading}>
            Cancelar
          </button>
          <button type="submit" className="btn-save" disabled={saveLoading}>
            {saveLoading ? "Guardando..." : (
              <>
                <FaSave style={{marginRight: '8px'}} /> Guardar Orden
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ================= MODAL DETALLE (Aún necesario) ================= */
function DetalleOrdenModal({ open, orden, onClose }) {
  if (!open || !orden) return null;
  return (
    <div className="image-modal-overlay" onClick={onClose} style={{zIndex: 1050}}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()} style={{textAlign: 'left', maxWidth: '600px'}}>
        <button className="btn-close-modal" onClick={onClose}><FaTimes /></button>
        
        <h2 style={{marginBottom: '1rem', color: 'var(--primary-color)'}}>
          Orden #{String(orden.id_orden).padStart(3, "0")}
        </h2>
        
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
          <div>
            <strong>Cliente:</strong>
            <p>{getNombreCliente(orden)}</p>
          </div>
          <div>
            <strong>Estado:</strong>
            <div style={{marginTop: '4px'}}><EstadoChip estado={orden.estado} /></div>
          </div>
          <div>
            <strong>Factura:</strong>
            <p>{orden.numero_factura ? `#${orden.numero_factura}` : "—"}</p>
          </div>
          <div>
             <strong>Tipo:</strong>
             <p>{orden.tipo_orden_display || orden.tipo_orden}</p>
          </div>
          <div style={{gridColumn: '1/-1', marginTop: '1rem'}}>
            <strong>Descripción:</strong>
            <p style={{background: '#f9fafb', padding: '0.5rem', borderRadius: '8px'}}>{orden.descripcion}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTE PRINCIPAL ================= */
export default function OrdenesModule() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Estados de Vista
  const [viewMode, setViewMode] = useState("list");
  
  // Filtros
  const [estadoFiltro, setEstadoFiltro] = useState("TODAS");
  const [tipoFiltro, setTipoFiltro] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  
  const [ordenDetalle, setOrdenDetalle] = useState(null);

  const fetchOrdenes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/ordenes-trabajo/");
      setOrdenes(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError("No se pudieron cargar las órdenes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrdenes(); }, []);

  const handleCreateSuccess = () => {
    setViewMode("list");
    fetchOrdenes();
  };

  const actualizarEstado = async (id_orden, nuevoEstado) => {
    try {
      await api.post(`/ordenes-trabajo/${id_orden}/actualizar-estado/`, { estado: nuevoEstado });
      fetchOrdenes();
    } catch (err) {
      alert("Error al actualizar estado");
    }
  };

  const ordenesFiltradas = useMemo(() => {
    const q = normalize(busqueda);
    return ordenes.filter((o) => {
      if (estadoFiltro !== "TODAS" && normalizeEstado(o.estado) !== normalizeEstado(estadoFiltro)) return false;
      if (tipoFiltro !== "TODOS" && (o.tipo_orden || "").toUpperCase() !== tipoFiltro) return false;
      if (!q) return true;
      const texto = normalize([o.id_orden, o.numero_factura, getNombreCliente(o), o.empleado_nombre].join(" "));
      return texto.includes(q);
    });
  }, [ordenes, estadoFiltro, tipoFiltro, busqueda]);

  return (
    <div className="ordenes-module">
      {/* CONTENIDO PRINCIPAL */}
      {viewMode === "create" ? (
        <>
          {/* HEADER SIMPLIFICADO PARA MODO CREACIÓN */}
          <div className="ordenes-header">
            <button className="btn-crear-orden" style={{background: '#6b7280'}} onClick={() => setViewMode("list")}>
              <FaArrowLeft /> Volver al listado
            </button>
          </div>
          <CrearOrdenForm onCancel={() => setViewMode("list")} onCreated={handleCreateSuccess} />
        </>
      ) : (
        <>
          {/* TOOLBAR UNIFICADA CON BOTÓN */}
          <div className="ordenes-toolbar">
            <div className="busqueda-wrapper">
              <FaSearch className="icono-busqueda" />
              <input
                type="text"
                placeholder="Buscar por cliente, factura, ID..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              {busqueda && (
                <button className="btn-clear-search" onClick={() => setBusqueda("")}>
                  <FaTimes />
                </button>
              )}
            </div>

            <div className="filters">
              <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
                <option value="TODAS">Todos los estados</option>
                {ESTADOS.map((est) => <option key={est} value={est}>{est}</option>)}
              </select>
              <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
                {TIPOS_ORDEN.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              
              {/* BOTÓN AGREGADO EN LA MISMA FILA */}
              <button className="btn-crear-orden" onClick={() => setViewMode("create")}>
                <FaPlus /> Nueva Orden
              </button>
            </div>
          </div>

          {/* LISTADO GRID */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Cargando órdenes...</p>
            </div>
          ) : ordenesFiltradas.length === 0 ? (
            <div className="empty-state">
              <p>No hay órdenes registradas con estos filtros.</p>
            </div>
          ) : (
            <div className="ordenes-grid">
              {ordenesFiltradas.map((o) => {
                const normEstado = normalizeEstado(o.estado);
                return (
                  <div key={o.id_orden} className="orden-card">
                    <div className="orden-head">
                      <div>
                        <div className="orden-title">#{String(o.id_orden).padStart(3, "0")}</div>
                        <div className="orden-sub">{o.tipo_orden}</div>
                      </div>
                      <EstadoChip estado={o.estado} />
                    </div>

                    <div className="orden-body">
                      <div className="orden-row">
                        <span className="lbl">Cliente</span>
                        <span className="val">{getNombreCliente(o)}</span>
                      </div>
                      <div className="orden-row">
                        <span className="lbl">Empleado</span>
                        <span className="val">{o.empleado_nombre || o.id_empleado}</span>
                      </div>
                      <div className="orden-row">
                        <span className="lbl">Fecha</span>
                        <span className="val">{formatFechaCorta(o.fecha_inicio)}</span>
                      </div>
                    </div>

                    <ProgresoBar estado={o.estado} />

                    <div className="orden-footer">
                      <button className="btn-detalles" onClick={() => setOrdenDetalle(o)}>Ver</button>
                      
                      {normEstado === "pendiente" && (
                        <button className="btn-accion iniciar" onClick={() => actualizarEstado(o.id_orden, "En Proceso")}>
                          Iniciar
                        </button>
                      )}
                      {normEstado === "en proceso" && (
                        <button className="btn-accion proceso" onClick={() => actualizarEstado(o.id_orden, "Completada")}>
                          Finalizar
                        </button>
                      )}
                      {normEstado === "completada" && (
                        <button className="btn-accion completada" disabled>Completado</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* MODAL DE DETALLES */}
      <DetalleOrdenModal open={!!ordenDetalle} orden={ordenDetalle} onClose={() => setOrdenDetalle(null)} />
    </div>
  );
}