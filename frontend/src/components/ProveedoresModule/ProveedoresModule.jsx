// ProveedoresModule.jsx
// Archivo completo con validaciones Regex integradas

import { useState, useEffect } from 'react';
import {
  FaSearch, FaPlus, FaEdit, FaTrash, FaBox, FaSync,
  FaPhone, FaMapMarkerAlt, FaUser, FaTimes, FaCheck,
  FaTruck
} from 'react-icons/fa';
import { normalizeSearch } from '../../utils/normalize';
import {
  formatearTelefono
} from '../../utils/validaciones';
import '../../styles/scss/main.scss';

// ===============================
// REGEX añadidas según tu petición
// ===============================
const REGEX_PATTERNS = {
  nombre: /^(?!\s*$)(?!.*\d)[a-zA-ZÀ-ÿ\u00f1\u00d1\s\.,&-]+$/,
  direccion: /^(?!\d+$)[a-zA-Z0-9À-ÿ\u00f1\u00d1\s\.,#-]+$/
};

const ProveedoresModule = ({ setActiveButton }) => {
  const [proveedores, setProveedores] = useState([]);
  const [filteredProveedores, setFilteredProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list');
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: ''
  });

  const [erroresCampos, setErroresCampos] = useState({});

  const fetchProveedores = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/proveedores/');
      if (response.ok) {
        const data = await response.json();
        setProveedores(data);
        setFilteredProveedores(data);
      }
    } catch (error) {
      showAlert('error', 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredProveedores(proveedores);
    } else {
      const normalized = normalizeSearch(searchTerm);
      const filtered = proveedores.filter(proveedor =>
        normalizeSearch(proveedor.nombre).includes(normalized) ||
        normalizeSearch(proveedor.telefono || '').includes(normalized) ||
        normalizeSearch(proveedor.direccion || '').includes(normalized)
      );
      setFilteredProveedores(filtered);
    }
  }, [searchTerm, proveedores]);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: '', message: '' }), 5000);
  };

  const resetForm = () => {
    setFormData({ nombre: '', telefono: '', direccion: '' });
    setSelectedProveedor(null);
    setErroresCampos({});
  };

  const handleEdit = (proveedor) => {
    setFormData({
      nombre: proveedor.nombre,
      telefono: proveedor.telefono || '',
      direccion: proveedor.direccion || ''
    });
    setSelectedProveedor(proveedor);
    setErroresCampos({});
    setView('form');
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === 'telefono') value = formatearTelefono(value);

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (erroresCampos[name]) {
      setErroresCampos(prev => {
        const nuevo = { ...prev };
        delete nuevo[name];
        return nuevo;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errores = {};

    if (!REGEX_PATTERNS.nombre.test(formData.nombre.trim())) {
      errores.nombre = "El nombre no puede contener números ni ser vacío.";
    }

    if (formData.direccion.trim() && !REGEX_PATTERNS.direccion.test(formData.direccion.trim())) {
      errores.direccion = "La dirección no puede ser solo números.";
    }

    if (Object.keys(errores).length > 0) {
      setErroresCampos(errores);
      return showAlert("error", "Corrige los errores del formulario.");
    }

    setErroresCampos({});
    setLoading(true);

    try {
      const url = selectedProveedor
        ? `/api/proveedores/${selectedProveedor.codigo_provedor}/`
        : '/api/proveedores/';

      const method = selectedProveedor ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          telefono: formData.telefono ? formData.telefono.replace(/-/g, '') : null,
          direccion: formData.direccion.trim()
        }),
      });

      if (response.ok) {
        showAlert('success', selectedProveedor ? 'Proveedor actualizado' : 'Proveedor creado');
        fetchProveedores();
        resetForm();
        setView('list');
      } else {
        const err = await response.json();
        showAlert('error', err.detail || "Error al guardar proveedor");
      }
    } catch (error) {
      showAlert("error", "Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const renderListView = () => (
    <div className="proveedores-container">
      <div className="top-bar">
        <h2><FaTruck /> Proveedores</h2>
        <button className="btn-agregar" onClick={() => { resetForm(); setView('form'); }}>
          <FaPlus /> Nuevo Proveedor
        </button>
      </div>

      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Buscar proveedor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn-refresh" onClick={fetchProveedores}>
          <FaSync />
        </button>
      </div>

      {alert.message && (
        <div className={`alert ${alert.type}`}>{alert.message}</div>
      )}

      <div className="lista-proveedores">
        {filteredProveedores.map((prov) => (
          <div key={prov.codigo_provedor} className="proveedor-card">
            <h3><FaUser /> {prov.nombre}</h3>
            <p><FaPhone /> {prov.telefono || 'N/A'}</p>
            <p><FaMapMarkerAlt /> {prov.direccion || 'Sin dirección'}</p>

            <div className="acciones">
              <button className="btn-editar" onClick={() => handleEdit(prov)}><FaEdit /></button>
              <button className="btn-eliminar"><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFormView = () => (
    <div className="form-container">
      <h2>{selectedProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>

      <form onSubmit={handleSubmit}>
        <label>Nombre</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className={erroresCampos.nombre ? 'error' : ''}
        />
        {erroresCampos.nombre && <p className="mensaje-error">{erroresCampos.nombre}</p>}

        <label>Teléfono</label>
        <input
          type="text"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
        />

        <label>Dirección</label>
        <input
          type="text"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          className={erroresCampos.direccion ? 'error' : ''}
        />
        {erroresCampos.direccion && <p className="mensaje-error">{erroresCampos.direccion}</p>}

        <div className="form-buttons">
          <button type="submit" className="btn-guardar"><FaCheck /> Guardar</button>
          <button type="button" className="btn-cancelar" onClick={() => setView('list')}><FaTimes /> Cancelar</button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="proveedores-module">
      {view === 'list' && renderListView()}
      {view === 'form' && renderFormView()}
    </div>
  );
};

export default ProveedoresModule;
