import { useState } from "react";
import Login from "./Login";

function App() {
  const [empleado, setEmpleado] = useState(null);

  const handleLogin = (empleadoData) => {
    setEmpleado(empleadoData);
  };

  return (
    <div>
      {empleado ? (
        <h1>Bienvenido {empleado.nombre}</h1>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
