// src/components/OrdenesModule.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { FaPlus, FaSearch, FaTimes } from "react-icons/fa";
import "../../styles/Ordenes.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Estados manejados por el sistema (para filtros y visual)
const ESTADOS = ["Pendiente", "En Proceso", "Completada"];

const TIPOS_ORDEN = [
  { value: "TODOS", label: "Todos los tipos" },
  { value: "FABRICACION", label: "Fabricación" },
  { value: "REPARACION", label: "Reparación" },
  { value: "AJUSTE", label: "Ajuste" },
];

// Normalizar texto
const normalize = (str) =>
  (str ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// Normalizar estado
const normalizeEstado = (s) =>
  normalize(s)
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Fecha a YYYY-MM-DD
const formatFechaCorta = (valor) => {
  if (!valor) return "—";
  const str = valor.toString();
  if (str.includes("T")) return str.split("T")[0];
  if (str.includes(" ")) return str.split(" ")[0];
  return str;
};

// Nombre completo del cliente desde los datos de la orden
const getNombreCliente = (orden) => {
  // El serializer ya manda nombre + apellido en cliente_nombre
  const nombre = orden.cliente_nombre;
  const apellido = orden.cliente_apellido; // por si luego existe aparte
  if (nombre && apellido && !nombre.includes(apellido)) {
    return `${nombre} ${apellido}`;
  }
  return nombre || apellido || "Cliente no especificado";
};

// Chip de estado
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

// Barra de progreso
const ProgresoBar = ({ estado }) => {
  const norm = normalizeEstado(estado);
  let percent = 20;
  if (norm === "en proceso") percent = 60;
  else if (norm === "completada") percent = 100;

  return (
    <div className="progress">
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  );
};

/* ========== MODAL CREAR ORDEN ========== */

function CrearOrdenModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    numero_factura: null,
    id_empleado: null,
    tipo_orden: "FABRICACION",
    descripcion: "",
    fecha_inicio: new Date().toISOString().slice(0, 10),
    fecha_estimada: "",
    estado: ESTADOS[0], // siempre "Pendiente"
    costo_mano_obra: "",
  });

  const [empleados, setEmpleados] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Autocomplete Empleado
  const [busquedaEmpleado, setBusquedaEmpleado] = useState("");
  const [mostrarResultadosEmpleado, setMostrarResultadosEmpleado] =
    useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

  // Autocomplete Factura
  const [busquedaFactura, setBusquedaFactura] = useState("");
  const [mostrarResultadosFactura, setMostrarResultadosFactura] =
    useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

  // Fecha mínima (hoy) para validaciones
  const todayStr = useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );

  const empleadoRef = useRef(null);
  const facturaRef = useRef(null);

  // Referencias para inputs de fecha (para abrir el calendario con showPicker)
  const fechaInicioRef = useRef(null);
  const fechaEstimadaRef = useRef(null);

  const abrirPicker = (ref) => {
    if (ref.current && ref.current.showPicker) {
      ref.current.showPicker();
    } else if (ref.current) {
      ref.current.focus();
    }
  };

  // Reset al abrir
  useEffect(() => {
    if (!open) return;
    setForm({
      numero_factura: null,
      id_empleado: null,
      tipo_orden: "FABRICACION",
      descripcion: "",
      fecha_inicio: todayStr,
      fecha_estimada: "",
      estado: ESTADOS[0],
      costo_mano_obra: "",
    });
    setError("");
    setFieldErrors({});
    setBusquedaEmpleado("");
    setBusquedaFactura("");
    setEmpleadoSeleccionado(null);
    setFacturaSeleccionada(null);
  }, [open, todayStr]);

  // Cargar empleados y facturas
  useEffect(() => {
    if (!open) return;
    let cancel = false;

    const loadLookups = async () => {
      try {
        setLoadingLookups(true);
        setError("");

        const [empRes, facRes] = await Promise.allSettled([
          axios.get(`${API}/api/empleados/`),
          axios.get(`${API}/api/facturas/`),
        ]);

        if (!cancel) {
          if (empRes.status === "fulfilled") {
            setEmpleados(empRes.value.data || []);
          } else {
            console.warn("No se pudieron cargar empleados", empRes.reason);
            setEmpleados([]);
          }

          if (facRes.status === "fulfilled") {
            setFacturas(facRes.value.data || []);
          } else {
            console.warn("No se pudieron cargar facturas", facRes.reason);
            setFacturas([]);
          }
        }
      } catch (err) {
        console.error(err);
        if (!cancel) setError("Error al cargar catálogos.");
      } finally {
        if (!cancel) setLoadingLookups(false);
      }
    };

    loadLookups();
    return () => {
      cancel = true;
    };
  }, [open]);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (empleadoRef.current && !empleadoRef.current.contains(e.target)) {
        setMostrarResultadosEmpleado(false);
      }
      if (facturaRef.current && !facturaRef.current.contains(e.target)) {
        setMostrarResultadosFactura(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Empleados filtrados -> solo si hay texto
  const empleadosFiltrados = useMemo(() => {
    const q = normalize(busquedaEmpleado);
    if (!q) return [];
    return empleados.filter((e) =>
      normalize(`${e.nombre} ${e.apellido} ${e.usuario}`).includes(q)
    );
  }, [empleados, busquedaEmpleado]);

  // Facturas filtradas -> solo si hay texto
  const facturasFiltradas = useMemo(() => {
    const q = normalize(busquedaFactura);
    if (!q) return [];
    return facturas.filter((f) =>
      normalize(
        `#${f.numero_factura} ${f.cliente_nombre ?? ""} ${
          f.cliente_identidad ?? ""
        }`
      ).includes(q)
    );
  }, [facturas, busquedaFactura]);

  const handleChange = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setFieldErrors((prev) => ({ ...prev, [campo]: "" }));
  };

  const validar = () => {
    const errores = {};
    if (!form.id_empleado) errores.id_empleado = "Selecciona un empleado.";
    if (!form.numero_factura)
      errores.numero_factura = "Selecciona una factura.";
    if (!form.fecha_estimada)
      errores.fecha_estimada = "Selecciona la fecha estimada de entrega.";
    if (!form.descripcion?.trim())
      errores.descripcion = "Escribe una descripción.";

    // Validar que la fecha estimada NO sea anterior a hoy
    if (form.fecha_estimada && form.fecha_estimada < todayStr) {
      errores.fecha_estimada =
        "La fecha estimada no puede ser anterior a hoy.";
    }

    // Validar que la fecha estimada NO sea anterior a la fecha de inicio
    if (
      form.fecha_estimada &&
      form.fecha_inicio &&
      form.fecha_estimada < form.fecha_inicio
    ) {
      errores.fecha_estimada =
        "La fecha estimada no puede ser anterior a la fecha de inicio.";
    }

    setFieldErrors(errores);
    return Object.keys(errores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) {
      setError("Revisa los campos marcados en rojo.");
      return;
    }

    try {
      setSaveLoading(true);
      setError("");

      const payload = {
        numero_factura: form.numero_factura,
        id_empleado: form.id_empleado,
        tipo_orden: form.tipo_orden,
        descripcion: form.descripcion,
        fecha_inicio: form.fecha_inicio,
        fecha_estimada: form.fecha_estimada || null,
        // No mandamos estado: el modelo pone el default (Pendiente)
        costo_mano_obra: form.costo_mano_obra
          ? Number(form.costo_mano_obra)
          : 0,
      };

      await axios.post(`${API}/api/ordenes-trabajo/`, payload);
      onCreated && onCreated();
      onClose && onClose();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setError(
          "Error al crear la orden: " + JSON.stringify(err.response.data)
        );
      } else {
        setError("Ocurrió un error al crear la orden.");
      }
    } finally {
      setSaveLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Crear nueva orden</h2>
          <button
            type="button"
            className="btn-close-modal"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          {loadingLookups && (
            <div className="alert info">
              Cargando empleados y facturas...
            </div>
          )}
          {error && <div className="alert error">{error}</div>}

          <div className="form-grid">
            {/* Empleado */}
            <div
              className={`form-group form-col-2 ${
                fieldErrors.id_empleado ? "campo-error" : ""
              }`}
              ref={empleadoRef}
            >
              <label>Empleado asignado</label>
              {!empleadoSeleccionado ? (
                <div className="combo-input-wrapper">
                  <FaSearch className="combo-icon-left" />
                  <input
                    type="text"
                    placeholder="Escribe para buscar empleado..."
                    value={busquedaEmpleado}
                    onChange={(e) => {
                      const value = e.target.value;
                      setBusquedaEmpleado(value);
                      setMostrarResultadosEmpleado(value.trim().length > 0);
                    }}
                  />
                  {busquedaEmpleado && (
                    <button
                      type="button"
                      className="combo-clear-btn"
                      onClick={() => {
                        setBusquedaEmpleado("");
                        setMostrarResultadosEmpleado(false);
                      }}
                    >
                      <FaTimes />
                    </button>
                  )}

                  {mostrarResultadosEmpleado &&
                    empleadosFiltrados.length > 0 && (
                      <div className="resultados-busqueda">
                        {empleadosFiltrados.map((emp) => (
                          <div
                            key={emp.id_empleado}
                            className="resultado-item"
                            onClick={() => {
                              setEmpleadoSeleccionado(emp);
                              handleChange("id_empleado", emp.id_empleado);
                              setBusquedaEmpleado("");
                              setMostrarResultadosEmpleado(false);
                            }}
                          >
                            <strong>
                              {emp.nombre} {emp.apellido}
                            </strong>
                            <div className="muted">
                              Usuario: {emp.usuario} · Tel:{" "}
                              {emp.telefono || "N/D"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {mostrarResultadosEmpleado &&
                    empleadosFiltrados.length === 0 && (
                      <div className="sin-resultados">
                        No se encontraron empleados.
                      </div>
                    )}
                </div>
              ) : (
                <div className="seleccion-mostrada">
                  <div>
                    <strong>
                      {empleadoSeleccionado.nombre}{" "}
                      {empleadoSeleccionado.apellido}
                    </strong>
                    <div className="muted">
                      Usuario: {empleadoSeleccionado.usuario}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-limpiar-seleccion"
                    onClick={() => {
                      setEmpleadoSeleccionado(null);
                      handleChange("id_empleado", null);
                    }}
                  >
                    Quitar
                  </button>
                </div>
              )}
              {fieldErrors.id_empleado && (
                <span className="mensaje-error">
                  {fieldErrors.id_empleado}
                </span>
              )}
            </div>

            {/* Número de factura */}
            <div
              className={`form-group form-col-2 ${
                fieldErrors.numero_factura ? "campo-error" : ""
              }`}
              ref={facturaRef}
            >
              <label>Número de factura</label>
              {!facturaSeleccionada ? (
                <div className="combo-input-wrapper">
                  <FaSearch className="combo-icon-left" />
                  <input
                    type="text"
                    placeholder="Escribe o busca la factura..."
                    value={busquedaFactura}
                    onChange={(e) => {
                      const value = e.target.value;
                      setBusquedaFactura(value);
                      setMostrarResultadosFactura(value.trim().length > 0);
                    }}
                  />
                  {busquedaFactura && (
                    <button
                      type="button"
                      className="combo-clear-btn"
                      onClick={() => {
                        setBusquedaFactura("");
                        setMostrarResultadosFactura(false);
                      }}
                    >
                      <FaTimes />
                    </button>
                  )}

                  {mostrarResultadosFactura &&
                    facturasFiltradas.length > 0 && (
                      <div className="resultados-busqueda">
                        {facturasFiltradas.map((fac) => (
                          <div
                            key={fac.numero_factura}
                            className="resultado-item"
                            onClick={() => {
                              setFacturaSeleccionada(fac);
                              handleChange(
                                "numero_factura",
                                fac.numero_factura
                              );
                              setBusquedaFactura("");
                              setMostrarResultadosFactura(false);
                            }}
                          >
                            <strong>Factura #{fac.numero_factura}</strong>
                            <div className="muted">
                              {fac.cliente_nombre || "Cliente sin nombre"} ·{" "}
                              {formatFechaCorta(fac.fecha) || ""}
                            </div>
                            <div className="muted">
                              Total: L.{" "}
                              {fac.total?.toLocaleString?.() || fac.total}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {mostrarResultadosFactura &&
                    facturasFiltradas.length === 0 && (
                      <div className="sin-resultados">
                        No se encontraron facturas.
                      </div>
                    )}
                </div>
              ) : (
                <div className="seleccion-mostrada">
                  <div>
                    <strong>
                      Factura #{facturaSeleccionada.numero_factura}
                    </strong>
                    <div className="muted">
                      {facturaSeleccionada.cliente_nombre ||
                        "Cliente sin nombre"}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-limpiar-seleccion"
                    onClick={() => {
                      setFacturaSeleccionada(null);
                      handleChange("numero_factura", null);
                    }}
                  >
                    Quitar
                  </button>
                </div>
              )}
              {fieldErrors.numero_factura && (
                <span className="mensaje-error">
                  {fieldErrors.numero_factura}
                </span>
              )}
            </div>

            {/* Tipo de orden */}
            <div className="form-group">
              <label>Tipo de orden</label>
              <select
                value={form.tipo_orden}
                onChange={(e) => handleChange("tipo_orden", e.target.value)}
              >
                <option value="FABRICACION">Fabricación</option>
                <option value="REPARACION">Reparación</option>
                <option value="AJUSTE">Ajuste</option>
              </select>
            </div>

            {/* Fecha inicio */}
            <div className="form-group">
              <label>Fecha de inicio</label>
              <div className="date-wrapper">
                <input
                  ref={fechaInicioRef}
                  type="date"
                  min={todayStr}
                  value={form.fecha_inicio}
                  onChange={(e) =>
                    handleChange("fecha_inicio", e.target.value)
                  }
                />
                <button
                  type="button"
                  className="date-icon-btn"
                  onClick={() => abrirPicker(fechaInicioRef)}
                >
                  📅
                </button>
              </div>
            </div>

            {/* Fecha estimada */}
            <div
              className={`form-group ${
                fieldErrors.fecha_estimada ? "campo-error" : ""
              }`}
            >
              <label>Fecha estimada de entrega</label>
              <div className="date-wrapper">
                <input
                  ref={fechaEstimadaRef}
                  type="date"
                  // mínimo: hoy o la fecha de inicio, lo que sea más reciente
                  min={
                    form.fecha_inicio && form.fecha_inicio > todayStr
                      ? form.fecha_inicio
                      : todayStr
                  }
                  value={form.fecha_estimada}
                  onChange={(e) =>
                    handleChange("fecha_estimada", e.target.value)
                  }
                />
                <button
                  type="button"
                  className="date-icon-btn"
                  onClick={() => abrirPicker(fechaEstimadaRef)}
                >
                  📅
                </button>
              </div>
              {fieldErrors.fecha_estimada && (
                <span className="mensaje-error">
                  {fieldErrors.fecha_estimada}
                </span>
              )}
            </div>

            {/* Costo mano de obra */}
            <div className="form-group">
              <label>Costo mano de obra (L.)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.costo_mano_obra}
                onChange={(e) =>
                  handleChange("costo_mano_obra", e.target.value)
                }
              />
            </div>

            {/* Descripción */}
            <div
              className={`form-group form-col-2 ${
                fieldErrors.descripcion ? "campo-error" : ""
              }`}
            >
              <label>Descripción / Detalles del trabajo</label>
              <textarea
                rows={4}
                value={form.descripcion}
                onChange={(e) =>
                  handleChange("descripcion", e.target.value)
                }
              />
              {fieldErrors.descripcion && (
                <span className="mensaje-error">
                  {fieldErrors.descripcion}
                </span>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={saveLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saveLoading}
            >
              {saveLoading ? "Guardando..." : "Guardar orden"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ========== MODAL DETALLE ORDEN ========== */

function DetalleOrdenModal({ open, orden, onClose }) {
  if (!open || !orden) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel detalle"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Detalle de orden #{String(orden.id_orden).padStart(3, "0")}</h2>
          <button
            type="button"
            className="btn-close-modal"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="modal-body detalle-body">
          <div className="detalle-grid">
            <div>
              <h3>Información principal</h3>
              <p>
                <strong>Factura:</strong> {orden.numero_factura ?? "—"}
              </p>
              <p>
                <strong>Cliente:</strong> {getNombreCliente(orden)}
              </p>
              <p>
                <strong>Empleado:</strong>{" "}
                {orden.empleado_nombre
                  ? `${orden.empleado_nombre}`
                  : `#${orden.id_empleado}`}
              </p>
              <p>
                <strong>Tipo de orden:</strong>{" "}
                {orden.tipo_orden_display || orden.tipo_orden || "—"}
              </p>
              <p>
                <strong>Estado:</strong>{" "}
                <EstadoChip estado={orden.estado} />
              </p>
            </div>

            <div>
              <h3>Fechas</h3>
              <p>
                <strong>Inicio:</strong>{" "}
                {formatFechaCorta(orden.fecha_inicio)}
              </p>
              <p>
                <strong>Entrega estimada:</strong>{" "}
                {formatFechaCorta(orden.fecha_estimada)}
              </p>
            </div>

            <div>
              <h3>Costos</h3>
              <p>
                <strong>Mano de obra:</strong>{" "}
                {orden.costo_mano_obra != null
                  ? `L. ${orden.costo_mano_obra}`
                  : "—"}
              </p>
            </div>
          </div>

          <div className="detalle-descripcion">
            <h3>Descripción del trabajo</h3>
            <p>{orden.descripcion || "Sin descripción registrada."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========== LISTADO PRINCIPAL ========== */

export default function OrdenesModule() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("TODAS");
  const [tipoFiltro, setTipoFiltro] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [openCrear, setOpenCrear] = useState(false);
  const [ordenDetalle, setOrdenDetalle] = useState(null);

  const fetchOrdenes = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(`${API}/api/ordenes-trabajo/`);
      setOrdenes(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las órdenes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const ordenesFiltradas = useMemo(() => {
    const q = normalize(busqueda);

    return ordenes.filter((o) => {
      if (
        estadoFiltro !== "TODAS" &&
        normalizeEstado(o.estado) !== normalizeEstado(estadoFiltro)
      ) {
        return false;
      }

      if (
        tipoFiltro !== "TODOS" &&
        (o.tipo_orden || "").toUpperCase() !== tipoFiltro
      ) {
        return false;
      }

      if (!q) return true;

      const texto = normalize(
        [
          o.id_orden,
          o.numero_factura,
          getNombreCliente(o),
          o.empleado_nombre,
          o.descripcion,
          o.tipo_orden_display,
          o.estado,
        ]
          .filter(Boolean)
          .join(" ")
      );

      return texto.includes(q);
    });
  }, [ordenes, estadoFiltro, tipoFiltro, busqueda]);

  // Iniciar / Completar
  const actualizarEstado = async (id_orden, nuevoEstado) => {
    try {
      await axios.post(
        `${API}/api/ordenes-trabajo/${id_orden}/actualizar-estado/`,
        { estado: nuevoEstado } // "En Proceso" o "Completada"
      );
      await fetchOrdenes();
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el estado de la orden.");
    }
  };

  return (
    <div className="ordenes-module">
      <div className="ordenes-header">
        <div>
          <h1 className="ordenes-title">Órdenes de Trabajo</h1>
          <p className="ordenes-subtitle">
            Fabricación y Reparación de Joyas.
          </p>
        </div>
        <button
          className="btn-crear-orden"
          onClick={() => setOpenCrear(true)}
        >
          <FaPlus className="icono-plus" />
          Crear nueva orden
        </button>
      </div>

      <div className="ordenes-toolbar">
        <div className="busqueda-wrapper">
          <FaSearch className="icono-busqueda" />
          <input
            type="text"
            placeholder="Buscar por número, cliente, empleado o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button
              type="button"
              className="btn-clear-search"
              onClick={() => setBusqueda("")}
            >
              <FaTimes />
            </button>
          )}
        </div>

        <div className="filters">
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            <option value="TODAS">Todos los estados</option>
            {ESTADOS.map((est) => (
              <option key={est} value={est}>
                {est}
              </option>
            ))}
          </select>

          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
          >
            {TIPOS_ORDEN.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="cargando-ordenes">
          <div className="spinner" />
          <p>Cargando órdenes...</p>
        </div>
      ) : ordenesFiltradas.length === 0 ? (
        <div className="sin-ordenes">
          No hay órdenes que coincidan con los filtros.
        </div>
      ) : (
        <div className="ordenes-grid">
          {ordenesFiltradas.map((o) => {
            const normEstado = normalizeEstado(o.estado);
            const isPendiente = normEstado === "pendiente";
            const isEnProceso = normEstado === "en proceso";
            const isCompletada = normEstado === "completada";

            return (
              <div key={o.id_orden} className="orden-card">
                <div className="orden-head">
                  <div>
                    <div className="orden-title">
                      Orden #{String(o.id_orden).padStart(3, "0")}
                    </div>
                    <div className="orden-sub">
                      {o.tipo_orden_display || o.tipo_orden || "—"}
                    </div>
                  </div>
                  <EstadoChip estado={o.estado} />
                </div>

                <div className="orden-body">
                  <div className="orden-row">
                    <span className="lbl">Cliente:</span>
                    <span className="val">{getNombreCliente(o)}</span>
                  </div>
                  <div className="orden-row">
                    <span className="lbl">Empleado:</span>
                    <span className="val">
                      {o.empleado_nombre
                        ? `${o.empleado_nombre}`
                        : `#${o.id_empleado}`}
                    </span>
                  </div>
                  <div className="orden-row">
                    <span className="lbl">Factura:</span>
                    <span className="val">
                      {o.numero_factura ? `#${o.numero_factura}` : "—"}
                    </span>
                  </div>
                  <div className="orden-row">
                    <span className="lbl">Inicio:</span>
                    <span className="val">
                      {formatFechaCorta(o.fecha_inicio)}
                    </span>
                  </div>
                  <div className="orden-row">
                    <span className="lbl">Entrega est.:</span>
                    <span className="val">
                      {formatFechaCorta(o.fecha_estimada)}
                    </span>
                  </div>
                </div>

                <ProgresoBar estado={o.estado} />

                <div className="orden-footer">
                  <button
                    type="button"
                    className="btn-detalles-orden"
                    onClick={() => setOrdenDetalle(o)}
                  >
                    Ver detalles
                  </button>

                  {isPendiente && (
                    <button
                      type="button"
                      className="btn-estado iniciar"
                      onClick={() =>
                        actualizarEstado(o.id_orden, "En Proceso")
                      }
                    >
                      Iniciar
                    </button>
                  )}

                  {isEnProceso && (
                    <button
                      type="button"
                      className="btn-estado proceso"
                      onClick={() =>
                        actualizarEstado(o.id_orden, "Completada")
                      }
                    >
                      Marcar como completada
                    </button>
                  )}

                  {isCompletada && (
                    <button
                      type="button"
                      className="btn-estado completada"
                      disabled
                    >
                      Completada
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CrearOrdenModal
        open={openCrear}
        onClose={() => setOpenCrear(false)}
        onCreated={fetchOrdenes}
      />

      <DetalleOrdenModal
        open={!!ordenDetalle}
        orden={ordenDetalle}
        onClose={() => setOrdenDetalle(null)}
      />
    </div>
  );
}
