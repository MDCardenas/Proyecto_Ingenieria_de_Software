import { useState } from "react";
import axios from "axios";
import "../styles/Login.css";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }) {
  const [usuarioOCorreo, setUsuarioOCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  if (!usuarioOCorreo || !contrasena) {
    setError("Debes ingresar usuario/correo y contraseña");
    return;
  }

  try {
    // Determinar si es correo o usuario
    const esCorreo = usuarioOCorreo.includes("@");
    
    // Preparar payload según lo que espera el backend
    const payload = {
      usuario: esCorreo ? '' : usuarioOCorreo,
      correo: esCorreo ? usuarioOCorreo : '',
      contrasena: contrasena
    };

    console.log("Enviando datos de login:", payload);

    const res = await axios.post("http://127.0.0.1:8000/api/login/", payload);
    console.log("Respuesta del servidor:", res.data);

    if (res.data.success) {
      const empleado = res.data.empleado;
      // Guardar usuario en localStorage
      localStorage.setItem("empleado", JSON.stringify(empleado));
      // Llamar a la función del padre
      onLogin(empleado);

      // Redirigir según rol
      switch (empleado.rol) {
        case "admin":
          navigate("/admin");
          break;
        case "empleado":
          navigate("/empleado");
          break;
        case "cliente":
          navigate("/gerente");
          break;
        default:
          navigate("/dashboard"); // Ruta por defecto
      }
    } else {
      setError(res.data.message || "Usuario/correo o contraseña incorrectos");
    }
  } catch (err) {
    console.error("Error completo:", err);
    console.error("Respuesta del error:", err.response?.data);
    
    if (err.response?.data?.message) {
      setError(err.response.data.message);
    } else {
      setError("Error al conectarse con el servidor");
    }
  }
};
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">
          <span role="img" aria-label="joya" style={{ fontSize: "2.5rem" }}>💎</span>
        </div>
        <h2>Joyas Charlys</h2>
        <p className="login-subtitle">Sistema de acceso a la joyería</p>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="usuarioOCorreo">Usuario o correo</label>
            <input
              id="usuarioOCorreo"
              type="text"
              placeholder="Ingresa tu usuario o correo"
              value={usuarioOCorreo}
              onChange={(e) => setUsuarioOCorreo(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
          </div>
          <button type="submit" className="login-btn">Iniciar Sesión</button>
          {error && <p className="error">{error}</p>}
        </form>
        <div className="login-links">
          <span>¿Olvidaste tu contraseña? <a href="#">Recuperar acceso</a></span>
        </div>
      </div>
      <footer className="login-footer">
        © {new Date().getFullYear()} Joyas Charlys - Sistema de Acceso
      </footer>
    </div>
  );
}

export default Login;
