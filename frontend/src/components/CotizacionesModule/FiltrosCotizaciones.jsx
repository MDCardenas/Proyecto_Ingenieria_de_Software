// FiltrosCotizaciones.jsx
import React, { useState, useEffect } from 'react';
import { FaFilter, FaEraser, FaSearch } from 'react-icons/fa';

import '../../styles/scss/components/_filtrosCotizaciones.scss';

export default function FiltrosCotizaciones({ filtros, onFiltrosChange, onLimpiarFiltros }) {
    const [filtrosLocales, setFiltrosLocales] = useState(filtros);
    const [clientes, setClientes] = useState([]);
    const [cargandoClientes, setCargandoClientes] = useState(false);

    useEffect(() => {
        setFiltrosLocales(filtros);
    }, [filtros]);

    useEffect(() => {
        cargarClientes();
    }, []);

    const cargarClientes = async () => {
        try {
            setCargandoClientes(true);
            const response = await fetch('/api/clientes/');
            if (response.ok) {
                const data = await response.json();
                setClientes(data);
            }
        } catch (error) {
            console.error('Error cargando clientes:', error);
        } finally {
            setCargandoClientes(false);
        }
    };

    const handleFiltroChange = (campo, valor) => {
        const nuevosFiltros = {
            ...filtrosLocales,
            [campo]: valor
        };
        setFiltrosLocales(nuevosFiltros);
    };

    const handleAplicarFiltros = () => {
        onFiltrosChange(filtrosLocales);
    };

    const handleLimpiarFiltros = () => {
        const filtrosLimpiados = {
            estado: '',
            cliente: '',
            fechaInicio: '',
            fechaFin: '',
            tipoServicio: ''
        };
        setFiltrosLocales(filtrosLimpiados);
        onLimpiarFiltros();
    };

    const hayFiltrosActivos = () => {
        return Object.values(filtrosLocales).some(valor => valor !== '');
    };

    return (
        <div className="filtros-cotizaciones">
            <div className="filtros-header">
                <h3>
                    <FaFilter style={{ marginRight: '8px' }} />
                    Filtros de Búsqueda
                </h3>
                {hayFiltrosActivos() && (
                    <span style={{ 
                        fontSize: '12px', 
                        color: '#666', 
                        fontStyle: 'italic' 
                    }}>
                        Filtros activos
                    </span>
                )}
            </div>

            <div className="filtros-grid">
                <div className="filtro-group">
                    <label htmlFor="filtro-estado">Estado</label>
                    <select
                        id="filtro-estado"
                        value={filtrosLocales.estado}
                        onChange={(e) => handleFiltroChange('estado', e.target.value)}
                    >
                        <option value="">Todos los estados</option>
                        <option value="ACTIVA">Activas</option>
                        <option value="ANULADA">Anuladas</option>
                        <option value="VENCIDA">Vencidas</option>
                    </select>
                </div>

                <div className="filtro-group">
                    <label htmlFor="filtro-cliente">Cliente</label>
                    <select
                        id="filtro-cliente"
                        value={filtrosLocales.cliente}
                        onChange={(e) => handleFiltroChange('cliente', e.target.value)}
                        disabled={cargandoClientes}
                    >
                        <option value="">Todos los clientes</option>
                        {cargandoClientes ? (
                            <option value="">Cargando clientes...</option>
                        ) : (
                            clientes.map(cliente => (
                                <option key={cliente.id_cliente} value={cliente.id_cliente}>
                                    {cliente.nombre} {cliente.apellido}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                <div className="filtro-group">
                    <label htmlFor="filtro-tipo-servicio">Tipo de Servicio</label>
                    <select
                        id="filtro-tipo-servicio"
                        value={filtrosLocales.tipoServicio}
                        onChange={(e) => handleFiltroChange('tipoServicio', e.target.value)}
                    >
                        <option value="">Todos los servicios</option>
                        <option value="REPARACION">Reparación</option>
                        <option value="FABRICACION">Fabricación</option>
                    </select>
                </div>

                <div className="filtro-group">
                    <label htmlFor="filtro-fecha-inicio">Fecha Desde</label>
                    <input
                        type="date"
                        id="filtro-fecha-inicio"
                        value={filtrosLocales.fechaInicio}
                        onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
                    />
                </div>

                <div className="filtro-group">
                    <label htmlFor="filtro-fecha-fin">Fecha Hasta</label>
                    <input
                        type="date"
                        id="filtro-fecha-fin"
                        value={filtrosLocales.fechaFin}
                        onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
                    />
                </div>
            </div>

            <div className="filtros-actions">
                <button
                    type="button"
                    className="btn-limpiar"
                    onClick={handleLimpiarFiltros}
                    disabled={!hayFiltrosActivos()}
                >
                    <FaEraser style={{ marginRight: '6px' }} />
                    Limpiar Filtros
                </button>
                
                <button
                    type="button"
                    className="btn-aplicar"
                    onClick={handleAplicarFiltros}
                >
                    <FaSearch style={{ marginRight: '6px' }} />
                    Aplicar Filtros
                </button>
            </div>

            {hayFiltrosActivos() && (
                <div style={{ 
                    marginTop: '16px', 
                    padding: '12px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px',
                    border: '1px solid #e9ecef',
                    fontSize: '14px'
                }}>
                    <strong>Filtros aplicados:</strong>
                    <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {filtrosLocales.estado && (
                            <span style={{ 
                                backgroundColor: '#e3f2fd', 
                                padding: '2px 8px', 
                                borderRadius: '12px', 
                                fontSize: '12px',
                                color: '#1976d2'
                            }}>
                                Estado: {filtrosLocales.estado}
                            </span>
                        )}
                        {filtrosLocales.cliente && (
                            <span style={{ 
                                backgroundColor: '#e8f5e8', 
                                padding: '2px 8px', 
                                borderRadius: '12px', 
                                fontSize: '12px',
                                color: '#2e7d32'
                            }}>
                                Cliente: {clientes.find(c => c.id_cliente == filtrosLocales.cliente)?.nombre || 'Cliente'}
                            </span>
                        )}
                        {filtrosLocales.tipoServicio && (
                            <span style={{ 
                                backgroundColor: '#fff3e0', 
                                padding: '2px 8px', 
                                borderRadius: '12px', 
                                fontSize: '12px',
                                color: '#f57c00'
                            }}>
                                Servicio: {filtrosLocales.tipoServicio}
                            </span>
                        )}
                        {filtrosLocales.fechaInicio && (
                            <span style={{ 
                                backgroundColor: '#f3e5f5', 
                                padding: '2px 8px', 
                                borderRadius: '12px', 
                                fontSize: '12px',
                                color: '#7b1fa2'
                            }}>
                                Desde: {filtrosLocales.fechaInicio}
                            </span>
                        )}
                        {filtrosLocales.fechaFin && (
                            <span style={{ 
                                backgroundColor: '#e0f2f1', 
                                padding: '2px 8px', 
                                borderRadius: '12px', 
                                fontSize: '12px',
                                color: '#00796b'
                            }}>
                                Hasta: {filtrosLocales.fechaFin}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}