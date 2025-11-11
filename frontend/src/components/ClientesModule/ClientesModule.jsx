import { useEffect, useRef, useState } from "react";
import { FaSync } from 'react-icons/fa';
import axios from "axios";

// Importar componentes modulares
import AccionesRapidas from './AccionesRapidas';
import ClientesRegistrar from './ClientesResgistrar';
import ClientesBuscar from './ClientesBuscar';
import ClientesEliminar from './ClientesEliminar';
import "../../styles/scss/main.scss";

export default function ClientesModule({ setVistaActual }) {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({
    numero_identidad: "",
    rtn: "",
    nombre: "",
    apellido: "",
    direccion: "",
    correo: "",
    telefono: ""
  });
  const [editId, setEditId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [accionActiva, setAccionActiva] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [clientesPorPagina] = useState(10);

  // Ref para el formulario
  const formRef = useRef(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      console.log("🔄 Cargando clientes...");
      const res = await axios.get("http://localhost:8000/api/clientes/");
      console.log("✅ Clientes cargados:", res.data);
      setClientes(res.data);
      setError(null);
    } catch (err) {
      console.error("❌ Error al cargar clientes:", err);
      setError("Error al cargar los clientes. Verifica la conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Función para normalizar texto (quitar tildes y convertir a minúsculas)
  const normalizarTexto = (texto) => {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "telefono") {
      // Formato: xxxx-xxxx (8 dígitos)
      const soloNumeros = value.replace(/[^\d]/g, '').slice(0, 8);
      let visual = soloNumeros;
      if (soloNumeros.length > 4) {
        visual = soloNumeros.slice(0, 4) + '-' + soloNumeros.slice(4);
      }
      setForm({ ...form, [name]: visual });
      
    } else if (name === "numero_identidad") {
      // Formato: xxxx-xxxx-xxxxx (13 dígitos)
      const soloNumeros = value.replace(/[^\d]/g, '').slice(0, 13);
      let visual = soloNumeros;
      if (soloNumeros.length > 4) {
        visual = soloNumeros.slice(0, 4) + '-' + soloNumeros.slice(4);
      }
      if (soloNumeros.length > 8) {
        visual = visual.slice(0, 9) + '-' + soloNumeros.slice(8);
      }
      setForm({ ...form, [name]: visual });
      
    } else if (name === "rtn") {
      // Formato: xxxx-xxxx-xxxxx-x (14 dígitos)
      const soloNumeros = value.replace(/[^\d]/g, '').slice(0, 14);
      let visual = soloNumeros;
      
      if (soloNumeros.length > 4) {
        visual = soloNumeros.slice(0, 4) + '-' + soloNumeros.slice(4);
      }
      
      if (soloNumeros.length > 8) {
        visual = soloNumeros.slice(0, 4) + '-' + 
                 soloNumeros.slice(4, 8) + '-' + 
                 soloNumeros.slice(8);
      }
      
      if (soloNumeros.length > 13) {
        visual = soloNumeros.slice(0, 4) + '-' + 
                 soloNumeros.slice(4, 8) + '-' + 
                 soloNumeros.slice(8, 13) + '-' + 
                 soloNumeros.slice(13);
      }
      
      setForm({ ...form, [name]: visual });
      
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validaciones de campos obligatorios
      if (!form.numero_identidad.trim()) {
        throw new Error("El número de identidad es obligatorio");
      }
      if (!form.nombre.trim()) {
        throw new Error("El nombre es obligatorio");
      }
      if (!form.apellido.trim()) {
        throw new Error("El apellido es obligatorio");
      }

      // Validar formato de número de identidad (13 dígitos)
      const identidadLimpia = form.numero_identidad.replace(/-/g, '');
      if (identidadLimpia.length !== 13) {
        throw new Error("El número de identidad debe tener 13 dígitos");
      }

      // Validar formato de RTN si se proporciona (14 dígitos)
      if (form.rtn && form.rtn.replace(/-/g, '').length !== 14) {
        throw new Error("El RTN debe tener 14 dígitos");
      }

      // Validar formato de teléfono si se proporciona (8 dígitos)
      if (form.telefono && form.telefono.replace(/-/g, '').length !== 8) {
        throw new Error("El teléfono debe tener 8 dígitos");
      }

      // Preparar datos para enviar
      const dataToSend = {
        numero_identidad: identidadLimpia,
        rtn: form.rtn ? form.rtn.replace(/-/g, '') : '',
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        direccion: form.direccion.trim() || '',
        correo: form.correo.trim() || '',
        telefono: form.telefono ? parseInt(form.telefono.replace(/-/g, '')) : null
      };

      console.log("📤 Enviando datos:", dataToSend);

      let response;
      if (editId) {
        response = await axios.put(`http://localhost:8000/api/clientes/${editId}/`, dataToSend);
        setSuccess("¡Cliente actualizado exitosamente!");
      } else {
        response = await axios.post("http://localhost:8000/api/clientes/", dataToSend);
        setSuccess("¡Cliente registrado exitosamente!");
      }

      console.log("✅ Respuesta del servidor:", response.data);

      // Limpiar formulario
      setForm({ 
        numero_identidad: "", 
        rtn: "", 
        nombre: "", 
        apellido: "", 
        direccion: "", 
        correo: "", 
        telefono: "" 
      });
      setEditId(null);
      await fetchClientes();
      
    } catch (err) {
      console.error("❌ Error al guardar cliente:", err);
      let mensajeError = "Error al guardar el cliente.";
      
      if (err.response) {
        console.error("📋 Detalles del error:", err.response.data);
        
        if (err.response.status === 400) {
          const errores = err.response.data;
          if (typeof errores === 'object') {
            const mensajes = Object.values(errores).flat();
            mensajeError = "Errores de validación: " + mensajes.join(', ');
          } else {
            mensajeError = "Error de validación: " + JSON.stringify(errores);
          }
        } else if (err.response.status === 405) {
          mensajeError = "Método no permitido. Verifica backend.";
        } else {
          mensajeError = `Error del servidor: ${err.response.status} - ${err.response.statusText}`;
        }
      } else if (err.request) {
        mensajeError = "No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.";
      } else {
        mensajeError = err.message;
      }
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cliente) => {
    setForm({
      numero_identidad: cliente.numero_identidad || "",
      rtn: cliente.rtn || "",
      nombre: cliente.nombre || "",
      apellido: cliente.apellido || "",
      direccion: cliente.direccion || "",
      correo: cliente.correo || "",
      telefono: cliente.telefono
        ? String(cliente.telefono).padStart(8, '0').replace(/(\d{4})(\d{0,4})/, '$1-$2')
        : ""
    });
    setEditId(cliente.id_cliente);
    setAccionActiva("registrar");
    setError(null);
    setSuccess(null);

    setTimeout(() => {
      const firstInput = formRef.current?.querySelector('input[name="numero_identidad"]');
      if (firstInput && typeof firstInput.scrollIntoView === "function") {
        firstInput.scrollIntoView({ behavior: "smooth", block: "center" });
        firstInput.focus({ preventScroll: true });
      }
    }, 150);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar este cliente?")) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:8000/api/clientes/${id}/`);
        await fetchClientes();
        setError(null);
        setSuccess("¡Cliente eliminado exitosamente!");
      } catch (err) {
        console.error("Error al eliminar cliente:", err);
        setError("Error al eliminar el cliente.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Función para filtrar clientes localmente
  const filtrarClientes = () => {
    if (!busqueda.trim()) {
      return clientes;
    }
    
    const searchNormalized = normalizarTexto(busqueda.trim());
    
    return clientes.filter(c => {
      const nombreCompleto = normalizarTexto(`${c.nombre} ${c.apellido}`);
      const numeroIdentidad = normalizarTexto(c.numero_identidad || '');
      const rtn = normalizarTexto(c.rtn || '');
      const correo = normalizarTexto(c.correo || '');
      const telefono = c.telefono ? String(c.telefono) : '';
      
      return nombreCompleto.includes(searchNormalized) || 
             numeroIdentidad.includes(searchNormalized) ||
             rtn.includes(searchNormalized) ||
             correo.includes(searchNormalized) || 
             telefono.includes(searchNormalized);
    });
  };

  // Obtener clientes para la página actual
  const obtenerClientesPagina = () => {
    const clientesFiltrados = filtrarClientes();
    const indexUltimoCliente = paginaActual * clientesPorPagina;
    const indexPrimerCliente = indexUltimoCliente - clientesPorPagina;
    return clientesFiltrados.slice(indexPrimerCliente, indexUltimoCliente);
  };

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  // Función para formatear número de identidad con guiones
  const formatearIdentidad = (identidad) => {
    if (!identidad) return "N/A";
    const soloNumeros = identidad.replace(/\D/g, '');
    if (soloNumeros.length === 13) {
      return soloNumeros.replace(/(\d{4})(\d{4})(\d{5})/, '$1-$2-$3');
    }
    return identidad;
  };

  // Función para formatear RTN con guiones
  const formatearRTN = (rtn) => {
    if (!rtn) return "N/A";
    const soloNumeros = rtn.replace(/\D/g, '');
    if (soloNumeros.length === 14) {
      return soloNumeros.replace(/(\d{4})(\d{4})(\d{5})(\d{1})/, '$1-$2-$3-$4');
    }
    return rtn;
  };

  // Manejar selección de acción rápida
  const handleAccionSeleccionada = (accion) => {
    setAccionActiva(accion);
    setError(null);
    setSuccess(null);
    if (accion !== "registrar") {
      setPaginaActual(1);
    }
  };

  const clientesFiltrados = filtrarClientes();
  const clientesPagina = obtenerClientesPagina();
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);

  return (
    <div className="clientes-module">
      {/* Header */}
      <div className="module-header">
        <button onClick={() => setVistaActual("dashboard")} className="btn-volver">
          ← Volver al Dashboard
        </button>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
          <button onClick={() => setSuccess(null)} className="success-close">×</button>
        </div>
      )}

      {/* Acciones rápidas */}
      {!accionActiva && (
        <AccionesRapidas onAccionSeleccionada={handleAccionSeleccionada} />
      )}

      {/* Vistas modulares */}
      {accionActiva === "registrar" && (
        <ClientesRegistrar
          form={form}
          editId={editId}
          loading={loading}
          onFieldChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={() => setAccionActiva(null)}
        />
      )}

      {accionActiva === "buscar" && (
        <ClientesBuscar
          clientes={clientes}
          clientesFiltrados={clientesFiltrados}
          clientesPagina={clientesPagina}
          loading={loading}
          busqueda={busqueda}
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onBusquedaChange={setBusqueda}
          onPaginaChange={cambiarPagina}
          onVolver={() => setAccionActiva(null)}
          onRefresh={fetchClientes}
          onEdit={handleEdit}
          formatearIdentidad={formatearIdentidad}
          formatearRTN={formatearRTN}
        />
      )}

      {accionActiva === "eliminar" && (
        <ClientesEliminar
          clientes={clientes}
          clientesFiltrados={clientesFiltrados}
          clientesPagina={clientesPagina}
          loading={loading}
          busqueda={busqueda}
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onBusquedaChange={setBusqueda}
          onPaginaChange={cambiarPagina}
          onVolver={() => setAccionActiva(null)}
          onRefresh={fetchClientes}
          onDelete={handleDelete}
          formatearIdentidad={formatearIdentidad}
          formatearRTN={formatearRTN}
        />
      )}
    </div>
  );
}