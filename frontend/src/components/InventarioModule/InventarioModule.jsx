import React, { useState, useEffect } from 'react';
import { Gem, Package, Wrench } from 'lucide-react';
import ActionBar from './ActionBar';
import AlertasBanner from './AlertasBanner';
import TabNavigation from './TabNavigation';
import ItemsGrid from './ItemsGrid';
import InventarioForm from './InventarioForm';
import useInventario from './Hooks/useinventario';
import '../../styles/scss/main.scss';

const InventarioModule = () => {
  const [activeTab, setActiveTab] = useState('joyas');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedItem, setSelectedItem] = useState(null);

  const {
    data,
    alertas,
    proveedores,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    loading,
    cargarDatos,
    handleDelete,
    handleFormSubmit
  } = useInventario(activeTab);

  // Agregar estados separados para los contadores de cada pestaña
  const [counts, setCounts] = useState({
    joyas: 0,
    materiales: 0,
    insumos: 0
  });

  const tabs = [
    { id: 'joyas', label: 'Joyas', icon: Gem, count: counts.joyas },
    { id: 'materiales', label: 'Materiales', icon: Package, count: counts.materiales },
    { id: 'insumos', label: 'Insumos', icon: Wrench, count: counts.insumos }
  ];

  // Efecto para actualizar los contadores cuando cambian los datos
  useEffect(() => {
    // Aquí deberías cargar los contadores reales de cada categoría
    // Por ahora, usaremos data.length como ejemplo
    setCounts({
      joyas: activeTab === 'joyas' ? data.length : counts.joyas,
      materiales: activeTab === 'materiales' ? data.length : counts.materiales,
      insumos: activeTab === 'insumos' ? data.length : counts.insumos
    });
  }, [data, activeTab]);

  const openForm = (mode, item = null) => {
    setFormMode(mode);
    setSelectedItem(item);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedItem(null);
  };

  const handleSubmit = async (formData) => {
    await handleFormSubmit(formData, formMode, selectedItem);
    closeForm();
  };

  return (
    <div className="inventario-module">
      <div className="inventario-container">
        <AlertasBanner alertas={alertas} />
        
        <TabNavigation 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts} // Pasar los contadores
        />

        {!showForm && (
          <ActionBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterType={filterType}
            onFilterChange={setFilterType}
            filterOptions={[...new Set(data.map(item => item.tipo || item.categoria).filter(Boolean))]}
            onCreateClick={() => openForm('create')}
          />
        )}

        <div className="inventario-content">
          {showForm ? (
            <InventarioForm
              mode={formMode}
              type={activeTab}
              initialData={selectedItem || {}}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              proveedores={proveedores}
            />
          ) : (
            <ItemsGrid
              type={activeTab}
              data={data}
              alertas={alertas}
              onEdit={(item) => openForm('edit', item)}
              onDelete={handleDelete}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default InventarioModule;