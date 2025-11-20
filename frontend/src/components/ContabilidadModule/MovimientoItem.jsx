// src/components/contabilidadComponents/MovimientoItem.jsx
export default function MovimientoItem({
    fecha,
    descripcion,
    tipo_venta,
    monto,
    estado,
    tipo // ingreso | gasto
}) {
    
    // Formato bonito de dinero
    const formatoDinero = (valor) => {
        return parseFloat(valor).toLocaleString("es-HN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // Colores para el estado
    const estadoStyle = {
        Completada: {
            backgroundColor: "#28a745", // verde
            color: "white",
            padding: "4px 10px",
            borderRadius: "6px",
            fontWeight: "600",
            display: "inline-block"
        },
        Pendiente: {
            backgroundColor: "#ffc107", // amarillo
            color: "#333",
            padding: "4px 10px",
            borderRadius: "6px",
            fontWeight: "600",
            display: "inline-block"
        }
    };

    // Color del monto según tipo
    const montoStyle = {
        color: tipo === "ingreso" ? "#28a745" : "#dc3545",
        fontWeight: 600
    };

    return (
        <tr>
            <td>{fecha}</td>
            <td>{descripcion}</td>
            <td>{tipo_venta}</td>
            <td style={montoStyle}>
                {tipo === "ingreso" ? "+" : "-"}{formatoDinero(monto)}
            </td>
            <td>
                <span style={estadoStyle[estado] || {}}>{estado}</span>
            </td>
        </tr>
    );
}
