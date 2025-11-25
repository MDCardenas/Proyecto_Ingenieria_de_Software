import "../../styles/Contabilidad.css";

export default function ResumenCard({ titulo, valor, tipo }) {
    return (
        <div className={`resumen-card border-${tipo}`}>
            <p className="resumen-titulo">{titulo}</p>
            <p className={`resumen-valor ${tipo}`}>
                L.{valor.toLocaleString()}
            </p>
        </div>
    );
}
