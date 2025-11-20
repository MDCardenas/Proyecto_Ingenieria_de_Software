import { useState, useEffect, useMemo } from 'react';

const API_URL = 'http://localhost:8000/api';

const useInventario = (activeTab) => {
  const [data, setData] = useState([]);
  const [alertas, setAlertas] = useState({});
  const [proveedores, setProveedores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);

  const endpoints = {
    joyas: `${API_URL}/joyas/`,
    materiales: `${API_URL}/materiales/`,
    insumos: `${API_URL}/insumos/`
  };

  const cargarDatos = async () => {
    if (!endpoints[activeTab]) return;
    
    setLoading(true);
    try {
      const [dataRes, alertasRes, proveedoresRes] = await Promise.all([
        fetch(endpoints[activeTab]),
        fetch(`${API_URL}/inventario/alertas/`),
        fetch(`${API_URL}/proveedores/`)
      ]);

      // Verificar si las respuestas son OK
      if (!dataRes.ok || !alertasRes.ok || !proveedoresRes.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const [dataJson, alertasJson, proveedoresJson] = await Promise.all([
        dataRes.json(),
        alertasRes.json(),
        proveedoresRes.json()
      ]);

      setData(dataJson);
      setAlertas(alertasJson);
      setProveedores(proveedoresJson);
    } catch (error) {
      console.error('Error cargando datos:', error);
      // Inicializar estados vacíos en caso de error
      setData([]);
      setAlertas({});
      setProveedores([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = !searchTerm || 
        item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterType === 'all' || 
        item.tipo === filterType || 
        item.categoria === filterType ||
        item.tipo_material === filterType;

      return matchesSearch && matchesFilter;
    });
  }, [data, searchTerm, filterType]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este elemento?')) return;
    
    try {
      await fetch(`${endpoints[activeTab]}${id}/`, { method: 'DELETE' });
      cargarDatos();
    } catch (error) {
      console.error('Error eliminando:', error);
    }
  };

  const handleFormSubmit = async (formData, mode, selectedItem) => {
    try {
      const url = mode === 'create' 
        ? endpoints[activeTab] 
        : `${endpoints[activeTab]}${selectedItem[`codigo_${activeTab.slice(0, -1)}`]}/`;

      await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      cargarDatos();
    } catch (error) {
      console.error('Error guardando:', error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  return {
    data: filteredData,
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
  };
};

export default useInventario;