
import { useState } from "react";
import axios from "axios";
import "./Login.css";

function Login({ onLogin }) {
  const [usuarioOCorreo, setUsuarioOCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
      if (!usuarioOCorreo && !contrasena) {
        setError("Debes ingresar usuario/correo y contraseña");
        return;
      }
      try {
        // Detectar si es correo o usuario
        const esCorreo = usuarioOCorreo.includes("@") && usuarioOCorreo.includes(".");
        const payload = esCorreo
          ? { correo: usuarioOCorreo, contrasena }
          : { usuario: usuarioOCorreo, contrasena };
        const res = await axios.post("http://127.0.0.1:8000/api/login/", payload);
        if (res.data.success) {
          onLogin(res.data.empleado);
        } else {
          setError("Usuario/correo o contraseña incorrectos");
        }
      } catch (err) {
        console.error(err);
        setError("Error al conectarse con el servidor");
      }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">
          {/* Puedes cambiar el emoji por un SVG de diamante si lo prefieres */}
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
