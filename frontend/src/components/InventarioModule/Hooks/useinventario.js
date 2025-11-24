import { useState, useEffect, useMemo } from 'react';
import api from '../../../services/api';

const useInventario = (activeTab) => {
  const [data, setData] = useState([]);
  const [alertas, setAlertas] = useState({});
  const [proveedores, setProveedores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);

  const endpoints = {
    joyas: '/joyas/',
    materiales: '/materiales/',
    insumos: '/insumos/'
  };

  const cargarDatos = async () => {
    if (!endpoints[activeTab]) return;
    
    setLoading(true);
    try {
      const [dataRes, alertasRes, proveedoresRes] = await Promise.all([
        api.get(endpoints[activeTab]),
        api.get('/inventario/alertas/'),
        api.get('/proveedores/')
      ]);

      setData(dataRes.data);
      setAlertas(alertasRes.data);
      setProveedores(proveedoresRes.data);
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
      await api.delete(`${endpoints[activeTab]}${id}/`);
      cargarDatos();
    } catch (error) {
      console.error('Error eliminando:', error);
    }
  };

  const handleFormSubmit = async (formData, mode, selectedItem) => {
    try {
      if (mode === 'create') {
        await api.post(endpoints[activeTab], formData);
      } else {
        // Mapeo correcto de IDs por tipo
        const idFieldMap = {
          joyas: 'codigo_joya',
          materiales: 'codigo_material',
          insumos: 'codigo_insumo'
        };

        const idField = idFieldMap[activeTab];
        const itemId = selectedItem[idField];

        if (!itemId) {
          throw new Error(`No se encontró el ID del item (${idField})`);
        }

        console.log(`Actualizando ${activeTab}/${itemId}`, formData);
        await api.put(`${endpoints[activeTab]}${itemId}/`, formData);
      }

      cargarDatos();
    } catch (error) {
      console.error('Error guardando:', error);
      throw error; // Propagar el error para manejarlo en el componente
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