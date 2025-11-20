// src/components/InventarioModule/components/ActionBar.jsx
import React from 'react';
import { Search, Filter, Plus } from 'lucide-react';

const ActionBar = ({ 
  searchTerm, 
  onSearchChange, 
  filterType, 
  onFilterChange, 
  filterOptions,
  onCreateClick 
}) => {
  return (
    <div className="action-bar">
      <div className="action-bar-content">
        {/* Búsqueda */}
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
        
        {/* Filtro */}
        <div className="filter-container">
          <Filter className="filter-icon" size={20} />
          <select
            value={filterType}
            onChange={(e) => onFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos los tipos</option>
            {filterOptions.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        {/* Botón agregar */}
        <button onClick={onCreateClick} className="btn-add">
          <Plus className="btn-icon" size={20} />
          <span>Agregar Nuevo</span>
        </button>
      </div>
    </div>
  );
};

export default ActionBar;