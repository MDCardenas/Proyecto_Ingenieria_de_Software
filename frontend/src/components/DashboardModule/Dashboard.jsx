import React, { useEffect, useState, useMemo } from "react";
import "../../styles/Dashboard.css";

// Recharts
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Paleta (coincide con tus variables de CSS)
const COLORS = {
  primary:  "#7c3aed", // línea del gráfico
  success:  "#22c55e", // completadas
  warning:  "#f59e0b", // en proceso
  danger:   "#ef4444", // pendientes
};

export default function Dashboard({ setActiveButton }) {
  const [kpis, setKpis] = useState({
    ventas_hoy: 0,
    ordenes_pendientes: 0,
    productos_en_stock: 0,
    clientes_activos: 0,
  });
  const [ventas, setVentas] = useState([]); // [{label:'Ene', total:123}]
  const [estados, setEstados] = useState({ "COMPLETADA":0, "EN PROCESO":0, "PENDIENTE":0 });
  const [loading, setLoading] = useState(true);

  // Navegación desde las tarjetas (sin cambiar estilos ni iconos)
  const go = (dest) => {
    if (typeof setActiveButton !== "function") return;
    // Normaliza a los ids de tu Sidebar
    const map = {
      Ventas: "Ventas",
      Ordenes: "Ordenes", "Órdenes": "Ordenes",
      Inventario: "Inventario",
      Clientes: "Clientes",
    };
    setActiveButton(map[dest] || "Dashboard");
  };
  const keyAsClick = (e, cb) => {
    if (e.key === "Enter" || e.key === " ") cb();

  };

  // Formateador de moneda HNL
  const fmtHNL = (n) => {
    try {
      return Number(n || 0).toLocaleString("es-HN", { style: "currency", currency: "HNL" });
    } catch {
      return n;
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [r1, r2, r3] = await Promise.all([
          fetch(`${API}/api/dashboard/kpis/`),
          fetch(`${API}/api/dashboard/ventas-mensuales/`),
          fetch(`${API}/api/dashboard/ordenes-estado/`),
        ]);
        const [k, vm, oe] = await Promise.all([r1.json(), r2.json(), r3.json()]);
        setKpis(k);
        setVentas(vm?.ventas_mensuales || []);
        setEstados(oe?.ordenes_por_estado || {});
      } catch (e) {
        console.error("Error cargando dashboard:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Datos para los charts
  const ventasData = useMemo(
    () => (ventas || []).map(m => ({ label: m.label, total: Number(m.total || 0) })),
    [ventas]
  );

  const pieData = useMemo(() => ([
    { name: "Completadas", value: Number(estados["COMPLETADA"] || 0), color: COLORS.success },
    { name: "En Proceso",  value: Number(estados["EN PROCESO"]  || 0), color: COLORS.warning },
    { name: "Pendientes",  value: Number(estados["PENDIENTE"]   || 0), color: COLORS.danger  },
  ]), [estados]);

  return (
    <div className="dashboard">

      <div className="kpi-grid">
        {/* Ventas -> Ventas */}
        <article
          className="kpi-card"
          tabIndex={0}
          role="button"
          onClick={() => go("Ventas")}
          onKeyDown={(e) => keyAsClick(e, () => go("Ventas"))}
          title="Ir a Ventas"
        >
          <div>
            <p className="kpi-title">Ventas Hoy</p>
            <p className="kpi-value">{fmtHNL(kpis.ventas_hoy)}</p>
          </div>
          <div className="kpi-icon purple" aria-label="Ventas Hoy">💲</div>
        </article>

        {/* Órdenes Pendientes -> Ordenes */}
        <article
          className="kpi-card"
          tabIndex={0}
          role="button"
          onClick={() => go("Ordenes")}
          onKeyDown={(e) => keyAsClick(e, () => go("Ordenes"))}
          title="Ir a Órdenes"
        >
          <div>
            <p className="kpi-title">Órdenes Pendientes</p>
            <p className="kpi-value">{kpis.ordenes_pendientes}</p>
          </div>
          <div className="kpi-icon warning" aria-label="Órdenes Pendientes">⏱</div>
        </article>

        {/* Productos en Stock -> Inventario */}
        <article
          className="kpi-card"
          tabIndex={0}
          role="button"
          onClick={() => go("Inventario")}
          onKeyDown={(e) => keyAsClick(e, () => go("Inventario"))}
          title="Ir a Inventario"
        >
          <div>
            <p className="kpi-title">Productos en Stock</p>
            <p className="kpi-value">{Number(kpis.productos_en_stock || 0).toLocaleString("es-HN")}</p>
          </div>
          <div className="kpi-icon info" aria-label="Productos en Stock">📦</div>
        </article>

        {/* Clientes Activos -> Clientes */}
        <article
          className="kpi-card"
          tabIndex={0}
          role="button"
          onClick={() => go("Clientes")}
          onKeyDown={(e) => keyAsClick(e, () => go("Clientes"))}
          title="Ir a Clientes"
        >
          <div>
            <p className="kpi-title">Clientes Activos</p>
            <p className="kpi-value">{Number(kpis.clientes_activos || 0).toLocaleString("es-HN")}</p>
          </div>
          <div className="kpi-icon success" aria-label="Clientes Activos">👥</div>
        </article>
      </div>

      <div className="chart-grid">
        {/* ---- Gráfico de líneas: Ventas Mensuales ---- */}
        <section className="chart-card" tabIndex={0}>
          <div className="chart-header">Ventas Mensuales</div>
          <div className="chart-body" role="img" aria-label="Gráfico de líneas de Ventas Mensuales">
            {loading ? (
              <div className="muted" style={{padding: 8}}>Cargando…</div>
            ) : ventasData.length === 0 ? (
              <div className="muted" style={{padding: 8}}>Sin datos</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ventasData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => fmtHNL(value)}
                    labelFormatter={(l) => `Mes: ${l}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke={COLORS.primary}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* ---- Gráfico de dona: Órdenes por Estado ---- */}
        <section className="chart-card" tabIndex={0}>
          <div className="chart-header">Órdenes por Estado</div>
          <div className="chart-body" role="img" aria-label="Gráfico de dona de Órdenes por Estado">
            {loading ? (
              <div className="muted" style={{padding: 8}}>Cargando…</div>
            ) : (pieData.every(d => d.value === 0)) ? (
              <div className="muted" style={{padding: 8}}>Sin datos</div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="50%"
                    outerRadius="100%"
                    padAngle={2}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value}`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Leyenda custom (ya está estilizada por tu CSS) */}
          <div className="legend" aria-label="Leyenda del gráfico de órdenes">
            <span className="legend-item"><i className="legend-dot success" />Completadas</span>
            <span className="legend-item"><i className="legend-dot warning" />En Proceso</span>
            <span className="legend-item"><i className="legend-dot danger"  />Pendientes</span>
          </div>
        </section>
      </div>
    </div>
  );
}
