import { useEffect, useState } from "react";
import "../../styles/Contabilidad.css";
import ResumenCard from "./ResumenCard";
import MovimientoItem from "./MovimientoItem";

export default function Contabilidad() {
    const [ingresosMes, setIngresosMes] = useState(0);
    const [gastosMes, setGastosMes] = useState(0);
    const [utilidad, setUtilidad] = useState(0);

    const [movIngresos, setMovIngresos] = useState([]);
    const [movGastos, setMovGastos] = useState([]);

    useEffect(() => {
        cargarContabilidad();
    }, []);

    const cargarContabilidad = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/contabilidad/resumen/");
            const data = await res.json();

            const ingresos = data.ingresos_mes || 0;
            const gastos = data.gastos_mes || 0;

            setIngresosMes(ingresos);
            setGastosMes(gastos);
            setUtilidad(ingresos - gastos);

            setMovIngresos(data.ingresos_movimientos || []);
            setMovGastos(data.gastos_movimientos || []);

        } catch (error) {
            console.error("Error Contabilidad:", error);
        }
    };

    // ⭐ Convierte estado_pago → "Completada" / "Pendiente"
    const traducirEstado = (estado) => {
        if (!estado) return "Pendiente";

        const e = estado.toLowerCase();

        if (e === "pagada" || e === "completada" || e === "completo")
            return "Completada";

        return "Pendiente";
    };

    // ⭐ Devuelve color segun estado
    const colorEstado = (estado) => {
        const e = traducirEstado(estado);

        if (e === "Completada") return "var(--verde)";
        if (e === "Pendiente") return "var(--amarillo)";
        return "var(--gris)";
    };

    return (
        <div>

            {/* TARJETAS SUPERIORES */}
            <div className="resumen-container">
                <ResumenCard titulo="Ingresos del Mes" valor={ingresosMes} tipo="ingreso" />
                <ResumenCard titulo="Gastos del Mes" valor={gastosMes} tipo="gasto" />
                <ResumenCard titulo="Utilidad Neta" valor={utilidad} tipo="util" />
            </div>

            {/* ========== MOVIMIENTOS DE INGRESOS ========== */}
            <div className="movimientos-card">
                <div className="movimientos-header">
                    <h2>Ingresos Recientes</h2>
                </div>

                <div className="movimientos-list">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Descripción</th>
                                <th>Tipo</th>
                                <th>Monto</th>
                                <th>Estado</th>
                            </tr>
                        </thead>

                        <tbody>
                            {movIngresos.length === 0 ? (
                                <tr><td colSpan="5">No hay ingresos recientes...</td></tr>
                            ) : (
                                movIngresos.map((m, i) => {
                                    const estadoTraducido = traducirEstado(m.estado_pago);
                                    return (
                                        <MovimientoItem
                                            key={i}
                                            fecha={m.fecha.split("T")[0]}
                                            descripcion={`Factura #${m.numero_factura}`}
                                            tipo_venta={m.tipo_venta}
                                            monto={m.total}
                                            estado={estadoTraducido}
                                            colorEstado={colorEstado(estadoTraducido)}
                                            tipo="ingreso"
                                        />
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========== MOVIMIENTOS DE GASTOS ========== */}
            <div className="movimientos-card" style={{ marginTop: "25px" }}>
                <div className="movimientos-header">
                    <h2>Gastos Recientes</h2>
                </div>

                <div className="movimientos-list">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Descripción</th>
                                <th>Tipo</th>
                                <th>Monto</th>
                                <th>Proveedor</th>
                            </tr>
                        </thead>

                        <tbody>
                            {movGastos.length === 0 ? (
                                <tr><td colSpan="5">No hay gastos recientes...</td></tr>
                            ) : (
                                movGastos.map((m, i) => (
                                    <tr key={i}>
                                        <td>{m.fecha_gasto}</td>
                                        <td>{m.descripcion}</td>
                                        <td>{m.tipo_gasto}</td>

                                        {/* ⭐ Monto en ROJO y bonito */}
                                        <td style={{
                                            color: "var(--rojo)",
                                            fontWeight: "700"
                                        }}>
                                            - L {Number(m.monto).toFixed(2)}
                                        </td>

                                        <td>{m.proveedor}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
