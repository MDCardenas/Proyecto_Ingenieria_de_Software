// src/components/InventarioModule/components/TabNavigation.jsx
import React from 'react';
import { Gem, Package, Wrench } from 'lucide-react';

const TabNavigation = ({ activeTab, onTabChange, counts }) => {
  const tabs = [
    { id: 'joyas', label: 'Joyas', icon: Gem, count: counts.joyas },
    { id: 'materiales', label: 'Materiales', icon: Package, count: counts.materiales },
    { id: 'insumos', label: 'Insumos', icon: Wrench, count: counts.insumos }
  ];

  return (
    <div className="tab-navigation">
      <div className="tab-list">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            >
              <Icon className="tab-icon" />
              <span className="tab-label">{tab.label}</span>
              <span className="tab-count">{tab.count}</span>
            </button>
          );
        })}
      </div>
      <div className="tab-indicator" />
    </div>
  );
};

export default TabNavigation;