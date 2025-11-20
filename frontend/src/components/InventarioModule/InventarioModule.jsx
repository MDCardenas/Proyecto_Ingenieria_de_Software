// src/components/InventarioModule/InventarioModule.jsx
import React, { useState, useEffect } from 'react';
import { Gem, Package, Wrench, AlertTriangle } from 'lucide-react';
import JoyasView from './JoyasView';
import MaterialesView from './MaterialesView';
import InsumosView from './InsumosView';
import InventarioForm from './InventarioForm';
import AlertasBanner from './AlertasBanner';
import TabNavigation from './TabNavigation';
import ActionBar from './ActionBar';
import '../../styles/scss/main.scss';

const API_URL = 'http://localhost:8000/api';

const InventarioModule = () => {
  const [activeTab, setActiveTab] = useState('joyas');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Estados para datos
  const [joyas, setJoyas] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  
  // Estado para alertas
  const [alertas, setAlertas] = useState({ 
    materiales_stock_bajo: [], 
    insumos_stock_bajo: [], 
    insumos_proximos_vencer: [] 
  });
  
  // Estado del formulario
  const [formData, setFormData] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);

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
    setFormMode('create');
    setSelectedItem(null);
    setFormData({});
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setFormMode('edit');
    setSelectedItem(item);
    setFormData(item);
    setShowForm(true);
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

  const handleFormSubmit = async (data) => {
    try {
      let endpoint = '';
      let method = formMode === 'create' ? 'POST' : 'PUT';
      
      switch(activeTab) {
        case 'joyas':
          endpoint = formMode === 'create' 
            ? `${API_URL}/joyas/`
            : `${API_URL}/joyas/${selectedItem.codigo_joya}/`;
          break;
        case 'materiales':
          endpoint = formMode === 'create'
            ? `${API_URL}/materiales/`
            : `${API_URL}/materiales/${selectedItem.codigo_material}/`;
          break;
        case 'insumos':
          endpoint = formMode === 'create'
            ? `${API_URL}/insumos/`
            : `${API_URL}/insumos/${selectedItem.codigo_insumo}/`;
          break;
      }
      
      await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      setShowForm(false);
      cargarDatos();
    } catch (error) {
      console.error('Error guardando:', error);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedItem(null);
    setFormData({});
  };

  const filteredData = () => {
    let data = [];
    switch(activeTab) {
      case 'joyas': data = joyas; break;
      case 'materiales': data = materiales; break;
      case 'insumos': data = insumos; break;
    }
    
    if (searchTerm) {
      data = data.filter(item => 
        item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
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
    switch(activeTab) {
      case 'joyas': return [...new Set(joyas.map(j => j.tipo))].filter(Boolean);
      case 'materiales': return [...new Set(materiales.map(m => m.tipo_material))].filter(Boolean);
      case 'insumos': return [...new Set(insumos.map(i => i.categoria))].filter(Boolean);
      default: return [];
    }
  };

  const getCounts = () => ({
    joyas: joyas.length,
    materiales: materiales.length,
    insumos: insumos.length
  });

  return (
    <div className="inventario-module">
      <div className="inventario-container">
        {/* Banner de alertas */}
        <AlertasBanner alertas={alertas} />

        {/* Navegación por tabs */}
        <TabNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={getCounts()}
        />

        {/* Barra de acciones */}
        {!showForm && (
          <ActionBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterType={filterType}
            onFilterChange={setFilterType}
            filterOptions={getUniqueTypes()}
            onCreateClick={handleCreate}
          />
        )}

        {/* Contenido principal */}
        <div className="inventario-content">
          {showForm ? (
            <InventarioForm
              mode={formMode}
              activeTab={activeTab}
              formData={formData}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              proveedores={proveedores}
            />
          ) : (
            <>
              {activeTab === 'joyas' && (
                <JoyasView 
                  data={filteredData()} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                />
              )}
              {activeTab === 'materiales' && (
                <MaterialesView 
                  data={filteredData()} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                />
              )}
              {activeTab === 'insumos' && (
                <InsumosView 
                  data={filteredData()} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete}
                  alertas={alertas}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventarioModule;