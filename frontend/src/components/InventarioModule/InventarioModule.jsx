// src/components/InventarioModule.jsx
import React, { useState, useEffect } from 'react';
import { Package, Gem, Wrench, Plus, Search, AlertTriangle, Edit, Trash2, X, Save, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import '../../styles/InventarioModule.css';

const API_URL = 'http://localhost:8000/api';

const InventarioModule = () => {
  const [activeTab, setActiveTab] = useState('joyas');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Estados para datos
  const [joyas, setJoyas] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  
  // Estado para alertas
  const [alertas, setAlertas] = useState({ materiales: [], insumos: [], insumos_vencer: [] });
  
  // Estado del formulario
  const [formData, setFormData] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
    cargarAlertas();
    cargarProveedores();
  }, [activeTab]);

  const cargarDatos = async () => {
    try {
      let endpoint = '';
      let setter = null;
      
      switch(activeTab) {
        case 'joyas':
          endpoint = `${API_URL}/joyas/`;
          setter = setJoyas;
          break;
        case 'materiales':
          endpoint = `${API_URL}/materiales/`;
          setter = setMateriales;
          break;
        case 'insumos':
          endpoint = `${API_URL}/insumos/`;
          setter = setInsumos;
          break;
      }
      
      const response = await fetch(endpoint);
      const data = await response.json();
      setter(data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const cargarAlertas = async () => {
    try {
      const response = await fetch(`${API_URL}/inventario/alertas/`);
      const data = await response.json();
      setAlertas(data);
    } catch (error) {
      console.error('Error cargando alertas:', error);
    }
  };

  const cargarProveedores = async () => {
    try {
      const response = await fetch(`${API_URL}/proveedores/`);
      const data = await response.json();
      setProveedores(data);
    } catch (error) {
      console.error('Error cargando proveedores:', error);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalMode('edit');
    setSelectedItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este elemento?')) return;
    
    try {
      let endpoint = '';
      switch(activeTab) {
        case 'joyas':
          endpoint = `${API_URL}/joyas/${id}/`;
          break;
        case 'materiales':
          endpoint = `${API_URL}/materiales/${id}/`;
          break;
        case 'insumos':
          endpoint = `${API_URL}/insumos/${id}/`;
          break;
      }
      
      await fetch(endpoint, { method: 'DELETE' });
      cargarDatos();
    } catch (error) {
      console.error('Error eliminando:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let endpoint = '';
      let method = modalMode === 'create' ? 'POST' : 'PUT';
      
      switch(activeTab) {
        case 'joyas':
          endpoint = modalMode === 'create' 
            ? `${API_URL}/joyas/`
            : `${API_URL}/joyas/${selectedItem.codigo_joya}/`;
          break;
        case 'materiales':
          endpoint = modalMode === 'create'
            ? `${API_URL}/materiales/`
            : `${API_URL}/materiales/${selectedItem.codigo_material}/`;
          break;
        case 'insumos':
          endpoint = modalMode === 'create'
            ? `${API_URL}/insumos/`
            : `${API_URL}/insumos/${selectedItem.codigo_insumo}/`;
          break;
      }
      
      await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      setShowModal(false);
      cargarDatos();
    } catch (error) {
      console.error('Error guardando:', error);
    }
  };

  const filteredData = () => {
    let data = [];
    switch(activeTab) {
      case 'joyas': data = joyas; break;
      case 'materiales': data = materiales; break;
      case 'insumos': data = insumos; break;
    }
    
    // Filtrar por búsqueda
    if (searchTerm) {
      data = data.filter(item => 
        item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por tipo
    if (filterType !== 'all') {
      if (activeTab === 'joyas') {
        data = data.filter(item => item.tipo === filterType);
      } else if (activeTab === 'materiales') {
        data = data.filter(item => item.tipo_material === filterType);
      } else if (activeTab === 'insumos') {
        data = data.filter(item => item.categoria === filterType);
      }
    }
    
    return data;
  };

  const getUniqueTypes = () => {
    let data = [];
    switch(activeTab) {
      case 'joyas': return [...new Set(joyas.map(j => j.tipo))].filter(Boolean);
      case 'materiales': return [...new Set(materiales.map(m => m.tipo_material))].filter(Boolean);
      case 'insumos': return [...new Set(insumos.map(i => i.categoria))].filter(Boolean);
      default: return [];
    }
  };

  return (
    <div className="inventario-container">
      {/* Header */}
      <div className="inventario-max-width inventario-header">
        
          
          {/* Alertas rápidas */}
          <div className="inventario-alertas">
            {alertas.materiales_stock_bajo?.length > 0 && (
              <div className="alerta-badge">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="alert-icon" />
                  <span className="font-semibold">{alertas.materiales_stock_bajo.length}</span>
                  <span className="text-sm">materiales con stock bajo</span>
                </div>
              </div>
            )}
            {alertas.insumos_stock_bajo?.length > 0 && (
              <div className="alerta-badge warning">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="warning-icon" />
                  <span className="font-semibold">{alertas.insumos_stock_bajo.length}</span>
                  <span className="text-sm">insumos con stock bajo</span>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Tabs */}
      <div className="inventario-max-width inventario-tabs">
        <div className="tabs-container">
          <button
            onClick={() => setActiveTab('joyas')}
            className={`tab-button ${activeTab === 'joyas' ? 'active' : ''}`}
          >
            <Gem className="tab-icon" />
            Joyas ({joyas.length})
          </button>
          <button
            onClick={() => setActiveTab('materiales')}
            className={`tab-button ${activeTab === 'materiales' ? 'active' : ''}`}
          >
            <Package className="tab-icon" />
            Materiales ({materiales.length})
          </button>
          <button
            onClick={() => setActiveTab('insumos')}
            className={`tab-button ${activeTab === 'insumos' ? 'active' : ''}`}
          >
            <Wrench className="tab-icon" />
            Insumos ({insumos.length})
          </button>
        </div>
      </div>

      {/* Barra de acciones */}
      <div className="inventario-max-width inventario-actions">
        <div className="actions-container">
          <div className="actions-content">
            <div className="search-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-wrapper">
              <Filter className="filter-icon" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todos los tipos</option>
                {getUniqueTypes().map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleCreate}
              className="btn-add"
            >
              <Plus className="w-5 h-5" />
              Agregar Nuevo
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="inventario-max-width">
        {activeTab === 'joyas' && <JoyasView data={filteredData()} onEdit={handleEdit} onDelete={handleDelete} />}
        {activeTab === 'materiales' && <MaterialesView data={filteredData()} onEdit={handleEdit} onDelete={handleDelete} />}
        {activeTab === 'insumos' && <InsumosView data={filteredData()} onEdit={handleEdit} onDelete={handleDelete} alertas={alertas} />}
      </div>

      {/* Modal */}
      {showModal && (
        <InventarioModal
          mode={modalMode}
          activeTab={activeTab}
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          proveedores={proveedores}
        />
      )}
    </div>
  );
};

// Vista de Joyas
const JoyasView = ({ data, onEdit, onDelete }) => (
  <div className="joyas-grid">
    {data.map(joya => (
      <div key={joya.codigo_joya} className="joya-card">
        <div className="joya-image-container">
          {joya.imagen_base64 ? (
            <img src={`data:image/jpeg;base64,${joya.imagen_base64}`} alt={joya.nombre} />
          ) : (
            <Gem className="joya-placeholder-icon" />
          )}
        </div>
        
        <div className="joya-content">
          <div className="joya-header">
            <div className="joya-info">
              <h3>{joya.nombre}</h3>
              <p>{joya.tipo || 'Sin tipo'}</p>
            </div>
            <div className="joya-actions">
              <button onClick={() => onEdit(joya)} className="btn-icon btn-edit">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(joya.codigo_joya)} className="btn-icon btn-delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="joya-details">
            <div className="joya-detail-row">
              <span>Material:</span>
              <span>{joya.material || 'N/A'}</span>
            </div>
            <div className="joya-detail-row">
              <span>Peso:</span>
              <span>{joya.peso ? `${joya.peso}g` : 'N/A'}</span>
            </div>
            <div className="joya-detail-row">
              <span>Precio:</span>
              <span className="joya-price">L. {parseFloat(joya.precio_venta || 0).toFixed(2)}</span>
            </div>
          </div>
          
          {joya.descripcion && (
            <p className="joya-description">{joya.descripcion}</p>
          )}
        </div>
      </div>
    ))}
  </div>
);

// Vista de Materiales
const MaterialesView = ({ data, onEdit, onDelete }) => (
  <div className="items-list">
    {data.map(material => (
      <div key={material.codigo_material} className="item-card">
        <div className="item-main">
          <div className="item-content">
            <div className="item-header">
              <Package className="item-icon" />
              <div className="item-title">
                <h3>{material.nombre}</h3>
                <p>{material.tipo_material || 'Sin tipo'}</p>
              </div>
            </div>
            
            <div className="item-details-grid">
              <div className="detail-box">
                <p>Proveedor</p>
                <p>{material.provedor_nombre || 'N/A'}</p>
              </div>
              <div className="detail-box">
                <p>Peso</p>
                <p>{material.peso ? `${material.peso}g` : 'N/A'}</p>
              </div>
              <div className="detail-box">
                <p>Quilates</p>
                <p>{material.quilates || 'N/A'}</p>
              </div>
              <div className="detail-box">
                <p>Stock</p>
                <p className={material.cantidad_existencia < 10 ? 'stock-low' : 'stock-ok'}>
                  {material.cantidad_existencia || 0} unidades
                  {material.cantidad_existencia < 10 && <TrendingDown className="inline w-4 h-4 ml-1" />}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="cost-badge">
                <span>Costo: </span>
                <span>L. {parseFloat(material.costo || 0).toFixed(2)}</span>
              </div>
              
              {material.pureza && (
                <div className="text-sm">Pureza: <span>{material.pureza}</span></div>
              )}
              {material.color && (
                <div className="text-sm">Color: <span>{material.color}</span></div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => onEdit(material)} className="btn-icon btn-edit">
              <Edit className="w-5 h-5" />
            </button>
            <button onClick={() => onDelete(material.codigo_material)} className="btn-icon btn-delete">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Vista de Insumos
const InsumosView = ({ data, onEdit, onDelete, alertas }) => (
  <div className="items-list">
    {data.map(insumo => {
      const stockBajo = insumo.cantidad_existencia < 5;
      const proximoVencer = alertas.insumos_proximos_vencer?.some(i => i.codigo_insumo === insumo.codigo_insumo);
      
      return (
        <div key={insumo.codigo_insumo} className={`item-card ${stockBajo ? 'alert' : proximoVencer ? 'warning' : ''}`}>
          <div className="item-main">
            <div className="item-content">
              <div className="item-header">
                <Wrench className="item-icon" />
                <div className="item-title">
                  <div className="flex items-center gap-2">
                    <h3>{insumo.nombre}</h3>
                    {stockBajo && <AlertTriangle className="alert-icon" />}
                    {proximoVencer && <AlertTriangle className="warning-icon" />}
                  </div>
                  <p>{insumo.tipo_insumo || 'Sin tipo'} - {insumo.categoria || 'Sin categoría'}</p>
                </div>
              </div>
              
              <div className="item-details-grid">
                <div className="detail-box">
                  <p>Proveedor</p>
                  <p>{insumo.provedor_nombre || 'N/A'}</p>
                </div>
                <div className="detail-box">
                  <p>Stock</p>
                  <p className={stockBajo ? 'stock-low' : 'stock-ok'}>
                    {insumo.cantidad_existencia || 0} {insumo.unidad_medida || 'uds'}
                  </p>
                </div>
                <div className="detail-box">
                  <p>Costo</p>
                  <p>L. {parseFloat(insumo.costo || 0).toFixed(2)}</p>
                </div>
                {insumo.fecha_vencimiento && (
                  <div className="detail-box">
                    <p>Vencimiento</p>
                    <p className={proximoVencer ? 'stock-low' : ''}>
                      {new Date(insumo.fecha_vencimiento).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div className="detail-box">
                  <p>Control</p>
                  <p>{insumo.requiere_control_vencimiento ? '✓ Sí' : '✗ No'}</p>
                </div>
              </div>
              
              {insumo.descripcion && (
                <p className="text-sm">{insumo.descripcion}</p>
              )}
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => onEdit(insumo)} className="btn-icon btn-edit">
                <Edit className="w-5 h-5" />
              </button>
              <button onClick={() => onDelete(insumo.codigo_insumo)} className="btn-icon btn-delete">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

// Modal de formulario
const InventarioModal = ({ mode, activeTab, formData, setFormData, onClose, onSubmit, proveedores }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>
            {mode === 'create' ? 'Agregar' : 'Editar'} {activeTab === 'joyas' ? 'Joya' : activeTab === 'materiales' ? 'Material' : 'Insumo'}
          </h2>
          <button onClick={onClose} className="btn-close">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="modal-form">
          {/* Campos comunes */}
          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre || ''}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion || ''}
              onChange={handleChange}
              rows="3"
              className="form-textarea"
            />
          </div>

          {/* Campos específicos de Joyas */}
          {activeTab === 'joyas' && (
            <>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <input
                    type="text"
                    name="tipo"
                    value={formData.tipo || ''}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Material</label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material || ''}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Peso (gramos)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="peso"
                    value={formData.peso || ''}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Precio de Venta *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio_venta"
                    value={formData.precio_venta || ''}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>
            </>
          )}

          {/* Campos específicos de Materiales */}
          {activeTab === 'materiales' && (
            <>
              <div className="form-group">
                <label className="form-label">Proveedor *</label>
                <select
                  name="codigo_provedor"
                  value={formData.codigo_provedor || ''}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="">Seleccione un proveedor</option>
                  {proveedores.map(p => (
                    <option key={p.codigo_provedor} value={p.codigo_provedor}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Tipo de Material</label>
                  <input
                    type="text"
                    name="tipo_material"
                    value={formData.tipo_material || ''}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo de Piedra</label>
                  <input
                    type="text"
                    name="tipo_piedra"
                    value={formData.tipo_piedra || ''}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Peso (g)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="peso"
                    value={formData.peso || ''}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Quilates</label>
                  <input
                    type="number"
                    step="0.01"
                    name="quilates"
                    value={formData.quilates || ''}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pureza</label>
                  <input
                    type="text"
                    name="pureza"
                    value={formData.pureza || ''}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color || ''}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Dimensiones</label>
                  <input
                    type="text"
                    name="dimensiones"
                    value={formData.dimensiones || ''}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Cantidad en Stock *</label>
                  <input
                    type="number"
                    name="cantidad_existencia"
                    value={formData.cantidad_existencia || ''}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Costo *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="costo"
                    value={formData.costo || ''}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>
            </>
          )}

          {/* Campos específicos de Insumos */}
          {activeTab === 'insumos' && (
            <>
              <div className="form-group">
                <label className="form-label">Proveedor *</label>
                <select
                  name="codigo_provedor"
                  value={formData.codigo_provedor || ''}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="">Seleccione un proveedor</option>
                  {proveedores.map(p => (
                    <option key={p.codigo_provedor} value={p.codigo_provedor}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Tipo de Insumo</label>
                  <input
                    type="text"
                    name="tipo_insumo"
                    value={formData.tipo_insumo || ''}
                    onChange={handleChange}
                    placeholder="Ej: Herramienta, Químico"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <input
                    type="text"
                    name="categoria"
                    value={formData.categoria || ''}
                    onChange={handleChange}
                    placeholder="Ej: Consumible, Permanente"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Cantidad *</label>
                  <input
                    type="number"
                    name="cantidad_existencia"
                    value={formData.cantidad_existencia || ''}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Unidad</label>
                  <input
                    type="text"
                    name="unidad_medida"
                    value={formData.unidad_medida || ''}
                    onChange={handleChange}
                    placeholder="Ej: unidades, kg, litros"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Costo *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="costo"
                    value={formData.costo || ''}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    name="fecha_vencimiento"
                    value={formData.fecha_vencimiento || ''}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-checkbox-wrapper">
                  <label className="form-checkbox-label">
                    <input
                      type="checkbox"
                      name="requiere_control_vencimiento"
                      checked={formData.requiere_control_vencimiento || false}
                      onChange={handleChange}
                      className="form-checkbox"
                    />
                    <span>Requiere control de vencimiento</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Botones */}
          <div className="modal-buttons">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
            >
              <Save className="w-5 h-5" />
              {mode === 'create' ? 'Crear' : 'Actualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventarioModule;