// src/pages/Login.jsx
import { useState } from "react";
import axios from "axios";
import "../styles/scss/main.scss";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }) {
  const [usuarioOCorreo, setUsuarioOCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!usuarioOCorreo || !contrasena) {
      setError("Debes ingresar usuario/correo y contraseña");
      setLoading(false);
      return;
    }

    try {
      // Determinar si es correo o usuario
      const esCorreo = usuarioOCorreo.includes("@");
      
      const payload = {
        usuario: esCorreo ? "" : usuarioOCorreo,
        correo: esCorreo ? usuarioOCorreo : "",
        contrasena: contrasena
      };

      console.log("Enviando datos de login:", payload);

      const res = await axios.post("http://127.0.0.1:8000/api/login/", payload);
      console.log("Respuesta completa del servidor:", res);

      if (res.data.success) {
        const empleado = res.data.empleado;
        
        // DEBUG: Mostrar estructura completa
        console.log("=== DATOS DEL EMPLEADO ===");
        console.log("Empleado completo:", empleado);
        console.log("Keys del objeto:", Object.keys(empleado));
        console.log("perfil_nombre:", empleado.perfil_nombre);
        console.log("codigo_perfil:", empleado.codigo_perfil);
        console.log("rol:", empleado.rol);
        console.log("nombre:", empleado.nombre);
        console.log("==========================");
        
        // Guardar en localStorage
        localStorage.setItem("empleado", JSON.stringify(empleado));
        localStorage.setItem("token", "authenticated");
        
        // Llamar a la función del padre
        onLogin(empleado);

        // DEBUG: Mostrar todos los datos disponibles para determinar el perfil
        console.log("=== DATOS COMPLETOS DEL EMPLEADO ===");
        console.log("Empleado:", empleado);
        console.log("codigo_perfil:", empleado.codigo_perfil);
        console.log("perfil_nombre:", empleado.perfil_nombre);
        console.log("rol:", empleado.rol);
        console.log("==========================");

        // Determinar la ruta basada en el código de perfil o nombre
        let redirectPath = "/admin"; // Por defecto

        // Opción 1: Basado en codigo_perfil (numérico)
        if (empleado.codigo_perfil === 1) {
          redirectPath = "/admin";
        } else if (empleado.codigo_perfil === 1) {
          redirectPath = "/gerente";
        } else if (empleado.codigo_perfil === 3) {
          redirectPath = "/empleado";
        } 
        // Opción 2: Basado en perfil_nombre (texto)
        else if (empleado.perfil_nombre) {
          const perfilLower = empleado.perfil_nombre.toLowerCase();
          if (perfilLower.includes("admin")) {
            redirectPath = "/admin";
          } else if (perfilLower.includes("gerente")) {
            redirectPath = "/gerente";
          } else if (perfilLower.includes("empleado") || perfilLower.includes("vendedor")) {
            redirectPath = "/empleado";
          }
        }
        // Opción 3: Basado en rol (texto)
        else if (empleado.rol) {
          const rolLower = empleado.rol.toLowerCase();
          if (rolLower.includes("admin")) {
            redirectPath = "/admin";
          } else if (rolLower.includes("gerente")) {
            redirectPath = "/gerente";
          } else if (rolLower.includes("empleado") || rolLower.includes("vendedor")) {
            redirectPath = "/empleado";
          }
        }

        console.log("Redirigiendo a:", redirectPath);
        navigate(redirectPath, { replace: true });
      } else {
        setError(res.data.error || "Usuario/correo o contraseña incorrectos");
      }
    } catch (err) {
      console.error("Error completo:", err);
      console.error("Respuesta del error:", err.response?.data);
      
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === "NETWORK_ERROR" || !err.response) {
        setError("Error de conexión. Verifica que el servidor esté funcionando.");
      } else {
        setError("Error al conectarse con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">
          <span role="img" aria-label="joya" style={{ fontSize: "2.5rem" }}>💎</span>
        </div>
        <h2>Joyas Charlys</h2>
        <p className="login-subtitle">Sistema de Gestión de Joyería</p>
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="usuarioOCorreo">Usuario o Correo</label>
            <input
              id="usuarioOCorreo"
              type="text"
              placeholder="Ingresa tu usuario o correo electrónico"
              value={usuarioOCorreo}
              onChange={(e) => setUsuarioOCorreo(e.target.value)}
              disabled={loading}
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
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className={`login-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
        
        <div className="login-links">
          <span>¿Olvidaste tu contraseña? <a href="#">Contactar al administrador</a></span>
        </div>
      </div>
      <footer className="login-footer">
        © {new Date().getFullYear()} Joyas Charlys - Sistema de Gestión
      </footer>
    </div>
  );
}

export default Login;