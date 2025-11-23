// src/pages/Login.jsx
import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/scss/main.scss";

function Login({ onLogin }) {
  const [usuarioOCorreo, setUsuarioOCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Regex corregidos para validar campos y prevenir inyección SQL
  const validarCampo = (valor) => {
    // Permite letras, números, @, ., -, _ y espacios (solo para nombres)
    // Bloquea caracteres peligrosos para SQL
    const regex = /^[a-zA-Z0-9@._\-\sáéíóúÁÉÍÓÚñÑüÜ]+$/;
    return regex.test(valor);
  };

  const validarLongitud = (valor) => {
    return valor.length >= 1 && valor.length <= 100;
  };

  const sanitizarInput = (valor) => {
    // Elimina caracteres peligrosos: ; ' " -- /* */ = ( ) < > | & \
    return valor.trim().replace(/[;'"\\=<>()&|*\/\-]/g, '');
  };

  const detectarInyeccionSQL = (valor) => {
    // Patrones comunes de inyección SQL
    const patronesPeligrosos = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR|AND|EXEC|CREATE|ALTER)\b)/i,
      /('|"|;|--|\/\*|\*\/|=|\(|\)|<|>|\|)/,
      /(\b(1=1|0=0|OR\s+'1'='1'|AND\s+'1'='1')\b)/i
    ];
    
    return patronesPeligrosos.some(patron => patron.test(valor));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validar campos vacíos
    if (!usuarioOCorreo || !contrasena) {
      setError("Debes ingresar usuario/correo y contraseña");
      setLoading(false);
      return;
    }

    // Validar longitud
    if (!validarLongitud(usuarioOCorreo) || !validarLongitud(contrasena)) {
      setError("Los campos deben tener entre 1 y 100 caracteres");
      setLoading(false);
      return;
    }

    // Validar con regex
    if (!validarCampo(usuarioOCorreo)) {
      setError("El usuario/correo contiene caracteres no permitidos");
      setLoading(false);
      return;
    }

    if (!validarCampo(contrasena)) {
      setError("La contraseña contiene caracteres no permitidos");
      setLoading(false);
      return;
    }

    // Detectar patrones de inyección SQL
    if (detectarInyeccionSQL(usuarioOCorreo) || detectarInyeccionSQL(contrasena)) {
      setError("Se detectaron patrones de seguridad no permitidos");
      setLoading(false);
      return;
    }

    try {
      // Sanitizar inputs (como capa adicional de seguridad)
      const usuarioSanitizado = sanitizarInput(usuarioOCorreo);
      const contrasenaSanitizada = sanitizarInput(contrasena);
      
      // Determinar si es correo o usuario
      const esCorreo = usuarioSanitizado.includes("@");
      
      const payload = {
        usuario: esCorreo ? "" : usuarioSanitizado,
        correo: esCorreo ? usuarioSanitizado : "",
        contrasena: contrasenaSanitizada
      };

      console.log("🔐 Enviando login a:", "/api/login/");
      const res = await api.post("/login/", payload);
      
      console.log("✅ Respuesta del servidor:", res.data);

      if (res.data.success) {
        const empleado = res.data.empleado;
        
        // Guardar en localStorage
        localStorage.setItem("empleado", JSON.stringify(empleado));
        localStorage.setItem("token", "authenticated");
        
        // Llamar a la función del padre
        onLogin(empleado);

        // DEBUG: Mostrar todos los datos disponibles para determinar el perfil
        console.log("📊 Datos del empleado:", empleado);

        // Determinar la ruta basada en el código de perfil o nombre
        let redirectPath = "/admin"; // Por defecto

        // Opción 1: Basado en codigo_perfil (numérico)
        if (empleado.codigo_perfil === 1) {
          redirectPath = "/admin";
        } else if (empleado.codigo_perfil === 2) {
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

        console.log("🔄 Redirigiendo a:", redirectPath);
        navigate(redirectPath, { replace: true });
      } else {
        setError(res.data.error || "Usuario/correo o contraseña incorrectos");
      }
    } catch (err) {
      console.error("❌ Error completo:", err);
      console.error("📡 URL intentada:", err.config?.url);
      console.error("📊 Datos enviados:", err.config?.data);
      console.error("🔧 Configuración:", err.config);
      
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