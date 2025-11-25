// src/components/ProveedoresModule/ProveedoresModule.jsx
import { useState, useEffect } from 'react';
import {
  FaSearch, FaPlus, FaEdit, FaTrash, FaBox, FaSync,
  FaPhone, FaMapMarkerAlt, FaUser, FaTimes, FaCheck,
  FaTruck
} from 'react-icons/fa';
import { normalizeSearch } from '../../utils/normalize';
import {
  validarFormularioProveedor,
  formatearTelefono,
  REGEX_PATTERNS
} from '../../utils/validaciones';
import '../../styles/scss/main.scss';

const ProveedoresModule = ({ setActiveButton }) => {
  const [proveedores, setProveedores] = useState([]);
  const [filteredProveedores, setFilteredProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list'); // 'list', 'form', 'detail'
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: ''
  });

  // Estado para errores de validación
  const [erroresCampos, setErroresCampos] = useState({});

  // Cargar proveedores
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

  // Filtrar proveedores
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProveedores(proveedores);
    } else {
      const normalizedSearch = normalizeSearch(searchTerm);
      const filtered = proveedores.filter(proveedor =>
        normalizeSearch(proveedor.nombre).includes(normalizedSearch) ||
        normalizeSearch(proveedor.telefono || '').includes(normalizedSearch) ||
        normalizeSearch(proveedor.direccion || '').includes(normalizedSearch)
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

  const handleCreate = () => {
    resetForm();
    setView('form');
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

    // Formateo automático de teléfono
    if (name === 'telefono' && value) {
      value = formatearTelefono(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario escribe
    if (erroresCampos[name]) {
      setErroresCampos(prev => {
        const nuevos = { ...prev };
        delete nuevos[name];
        return nuevos;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErroresCampos({});

    // Validar formulario antes de enviar
    const validacion = validarFormularioProveedor(formData);

    if (!validacion.valido) {
      setErroresCampos(validacion.errores);
      showAlert('error', 'Por favor corrija los errores en el formulario');
      return;
    }

    setLoading(true);

    try {
      const url = selectedProveedor
        ? `/api/proveedores/${selectedProveedor.codigo_provedor}/`
        : '/api/proveedores/';

      const method = selectedProveedor ? 'PUT' : 'POST';

      const dataToSend = {
        nombre: formData.nombre.trim(),
        telefono: formData.telefono ? formData.telefono.replace(/-/g, '') : null,
        direccion: formData.direccion ? formData.direccion.trim() : null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        showAlert('success',
          selectedProveedor ? 'Proveedor actualizado exitosamente' : 'Proveedor creado exitosamente'
        );
        fetchProveedores();
        setView('list');
        resetForm();
      } else {
        const error = await response.json();
        showAlert('error', error.detail || 'Error al guardar proveedor');
      }
    } catch (error) {
      showAlert('error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (codigoProveedor) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este proveedor?')) {
      return;
    }

    try {
      const response = await fetch(`/api/proveedores/${codigoProveedor}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showAlert('success', 'Proveedor eliminado exitosamente');
        fetchProveedores();
      } else {
        showAlert('error', 'Error al eliminar proveedor');
      }
    } catch (error) {
      showAlert('error', 'Error de conexión');
    }
  };

  const handleViewDetail = async (proveedor) => {
    setSelectedProveedor(proveedor);
    setView('detail');
  };

  // Renderizar vistas
  const renderListView = () => (
    <div className="proveedores-list">
      {/* Barra de búsqueda y acciones */}
      <div className="search-actions-container">
        <div className="search-pill-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
              title="Limpiar búsqueda"
            >
              <FaTimes />
            </button>
          )}
        </div>
        
        <div className="action-pills">
          <button className="btn-pill btn-pill-secondary" onClick={fetchProveedores}>
            <FaSync /> Actualizar
          </button>
          <button className="btn-pill btn-pill-success" onClick={handleCreate}>
            <FaPlus /> Nuevo Proveedor
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando proveedores...</p>
        </div>
      ) : (
        <div className="proveedores-grid">
          {filteredProveedores.map(proveedor => (
            <div key={proveedor.codigo_provedor} className="proveedor-card">
              <div className="card-header-pill">
                <div className="proveedor-avatar">
                  <FaTruck />
                </div>
                <div className="proveedor-title">
                  <h3>{proveedor.nombre}</h3>
                  <span className="proveedor-code">#{proveedor.codigo_provedor}</span>
                </div>
              </div>
              
              <div className="card-body">
                <div className="info-row">
                  <FaPhone className="info-icon" />
                  <span>{proveedor.telefono || 'No especificado'}</span>
                </div>
                <div className="info-row">
                  <FaMapMarkerAlt className="info-icon" />
                  <span>{proveedor.direccion || 'No especificada'}</span>
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="btn-pill-mini btn-pill-info"
                  onClick={() => handleViewDetail(proveedor)}
                  title="Ver detalle"
                >
                  <FaBox /> Detalle
                </button>
                <button 
                  className="btn-pill-mini btn-pill-warning"
                  onClick={() => handleEdit(proveedor)}
                  title="Editar"
                >
                  <FaEdit /> Editar
                </button>
                <button 
                  className="btn-pill-mini btn-pill-danger"
                  onClick={() => handleDelete(proveedor.codigo_provedor)}
                  title="Eliminar"
                >
                  <FaTrash /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredProveedores.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">
            <FaTruck />
          </div>
          <h3>{searchTerm ? 'No se encontraron proveedores' : 'No hay proveedores registrados'}</h3>
          <p>{searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer proveedor'}</p>
          {!searchTerm && (
            <button className="btn-pill btn-pill-success" onClick={handleCreate}>
              <FaPlus /> Crear Primer Proveedor
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderFormView = () => (
    <div className="proveedor-form-modern">
      <div className="form-header-pill">
        <button className="btn-pill btn-pill-secondary" onClick={() => setView('list')}>
          <FaTimes /> Cancelar
        </button>
        <h2>{selectedProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
        <div></div>
      </div>

      <form className="form-modern" onSubmit={handleSubmit}>
        <div className="form-card">
          <div className="form-section-header">
            <FaUser className="section-icon" />
            <h3>Información del Proveedor</h3>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="nombre">
                <FaUser /> Nombre del Proveedor *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Ej: Distribuidora Central S.A."
                className={`input-pill ${erroresCampos.nombre ? 'input-error' : ''}`}
              />
              {erroresCampos.nombre && (
                <span className="error-message">{erroresCampos.nombre}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="telefono">
                <FaPhone /> Teléfono de Contacto
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ej: 9999-9999"
                maxLength="9"
                className={`input-pill ${erroresCampos.telefono ? 'input-error' : ''}`}
              />
              {erroresCampos.telefono && (
                <span className="error-message">{erroresCampos.telefono}</span>
              )}
            </div>

            <div className="form-field full-width">
              <label htmlFor="direccion">
                <FaMapMarkerAlt /> Dirección Completa
              </label>
              <textarea
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                rows="3"
                placeholder="Dirección completa del proveedor..."
                className={`input-pill ${erroresCampos.direccion ? 'input-error' : ''}`}
              />
              {erroresCampos.direccion && (
                <span className="error-message">{erroresCampos.direccion}</span>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions-pill">
          <button 
            type="button" 
            className="btn-pill btn-pill-secondary" 
            onClick={() => setView('list')}
          >
            <FaTimes /> Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-pill btn-pill-success" 
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="btn-spinner"></div> Guardando...
              </>
            ) : (
              <>
                <FaCheck /> {selectedProveedor ? 'Actualizar' : 'Crear Proveedor'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderDetailView = () => {
    if (!selectedProveedor) return null;

    return (
      <div className="proveedor-detail-modern">
        <div className="detail-header-pill">
          <button className="btn-pill btn-pill-secondary" onClick={() => setView('list')}>
            <FaTimes /> Volver
          </button>
          <h2>Detalle del Proveedor</h2>
          <button className="btn-pill btn-pill-warning" onClick={() => handleEdit(selectedProveedor)}>
            <FaEdit /> Editar
          </button>
        </div>

        <div className="detail-content-modern">
          <div className="detail-main-card">
            <div className="detail-avatar-section">
              <div className="detail-avatar-large">
                <FaTruck />
              </div>
              <div className="detail-title-section">
                <h3>{selectedProveedor.nombre}</h3>
                <span className="detail-code">Código: #{selectedProveedor.codigo_provedor}</span>
              </div>
            </div>

            <div className="detail-info-grid">
              <div className="detail-info-card">
                <div className="info-card-icon phone">
                  <FaPhone />
                </div>
                <div className="info-card-content">
                  <label>Teléfono</label>
                  <span>{selectedProveedor.telefono || 'No especificado'}</span>
                </div>
              </div>

              <div className="detail-info-card">
                <div className="info-card-icon location">
                  <FaMapMarkerAlt />
                </div>
                <div className="info-card-content">
                  <label>Dirección</label>
                  <span>{selectedProveedor.direccion || 'No especificada'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="proveedores-module-modern">
      {alert.message && (
        <div className={`alert-pill alert-${alert.type}`}>
          <div className="alert-content">
            {alert.type === 'success' ? <FaCheck /> : <FaTimes />}
            <span>{alert.message}</span>
          </div>
          <button onClick={() => setAlert({ type: '', message: '' })}>
            <FaTimes />
          </button>
        </div>
      )}

      {view === 'list' && renderListView()}
      {view === 'form' && renderFormView()}
      {view === 'detail' && renderDetailView()}
    </div>
  );
};

export default ProveedoresModule;