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
        {/* Búsqueda Pill */}
        <div className="search-pill">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="search-pill-icon"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-pill-input"
            aria-label="Buscar inventario"
          />
        </div>
        
        {/* Filtro Pill */}
        <div className="filter-pill">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="filter-pill-icon"
            aria-hidden="true"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <select
            value={filterType}
            onChange={(e) => onFilterChange(e.target.value)}
            className="filter-pill-select"
            aria-label="Filtrar por tipo"
          >
            <option value="all">Todos los tipos</option>
            {filterOptions.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        {/* Botón Agregar Pill */}
        <button 
          onClick={onCreateClick} 
          className="btn-add-pill"
          aria-label="Agregar nuevo item"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Agregar Nuevo</span>
        </button>
      </div>
    </div>
  );
};

export default ActionBar;