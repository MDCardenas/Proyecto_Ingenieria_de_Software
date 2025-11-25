// components/cotizacionesComponentes/CotizacionesModule.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import HeaderCotizaciones from './HeaderCotizaciones';
import FiltrosCotizaciones from './FiltrosCotizaciones';
import ListaCotizaciones from './ListaCotizaciones';
import FormatoCotizacionFabricacion from '../cotizacionesComponentes/FormatoCotizacionFabricacion';
import FormatoCotizacionReparacion from '../cotizacionesComponentes/FormatoCotizacionReparacion';
import ModalSeleccionTipo from '../cotizacionesComponentes/ModalSeleccionTipo';

import "../../styles/scss/pages/_cotizacion.scss";

export default function CotizacionesModule() {
    const [cotizaciones, setCotizaciones] = useState([]);
    const [cotizacionesOriginales, setCotizacionesOriginales] = useState([]);
    const [estadisticas, setEstadisticas] = useState({
        total: 0,
        activas: 0,
        vencidas: 0,
        convertidas: 0
    });
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState({
        estado: '',
        cliente: '',
        fechaInicio: '',
        fechaFin: '',
        tipoServicio: ''
    });
    const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    
    const [mostrarModalTipo, setMostrarModalTipo] = useState(false);
    const [mostrarFormularioFabricacion, setMostrarFormularioFabricacion] = useState(false);
    const [mostrarFormularioReparacion, setMostrarFormularioReparacion] = useState(false);

    // Cargar todas las cotizaciones al inicio
    useEffect(() => {
        cargarTodasLasCotizaciones();
    }, []);

    // Aplicar filtros cuando cambien
    useEffect(() => {
        aplicarFiltros();
    }, [filtros, cotizacionesOriginales]);

    const cargarTodasLasCotizaciones = async () => {
        try {
            setLoading(true);
            const cotizacionesRes = await api.get('/cotizaciones/');
            const cotizacionesData = cotizacionesRes.data;

            setCotizacionesOriginales(cotizacionesData);
            calcularEstadisticas(cotizacionesData);

        } catch (error) {
            console.error('Error cargando cotizaciones:', error);
            alert('Error al cargar las cotizaciones');
            setEstadisticas({ total: 0, activas: 0, vencidas: 0, convertidas: 0 });
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = () => {
        let cotizacionesFiltradas = [...cotizacionesOriginales];

        // Filtro por búsqueda general
        if (filtros.busqueda) {
            cotizacionesFiltradas = cotizacionesFiltradas.filter(cot => 
                cot.numero_cotizacion.toString().includes(filtros.busqueda) ||
                cot.cliente_nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
                (cot.id_cliente?.nombre + ' ' + cot.id_cliente?.apellido)?.toLowerCase().includes(filtros.busqueda.toLowerCase())
            );
        }

        // Filtro por estado
        if (filtros.estado) {
            if (filtros.estado === 'VENCIDA') {
                const hoy = new Date().toISOString().split('T')[0];
                cotizacionesFiltradas = cotizacionesFiltradas.filter(cot => 
                    cot.estado === 'ACTIVA' && 
                    cot.fecha_vencimiento && 
                    cot.fecha_vencimiento < hoy
                );
            } else {
                cotizacionesFiltradas = cotizacionesFiltradas.filter(cot => 
                    cot.estado === filtros.estado
                );
            }
        }

        // Filtro por cliente
        if (filtros.cliente) {
            cotizacionesFiltradas = cotizacionesFiltradas.filter(cot => 
                cot.id_cliente == filtros.cliente
            );
        }

        // Filtro por tipo de servicio
        if (filtros.tipoServicio) {
            cotizacionesFiltradas = cotizacionesFiltradas.filter(cot => 
                cot.tipo_servicio === filtros.tipoServicio
            );
        }

        // Filtros por fecha
        if (filtros.fechaInicio) {
            cotizacionesFiltradas = cotizacionesFiltradas.filter(cot => 
                cot.fecha_creacion >= filtros.fechaInicio
            );
        }

        if (filtros.fechaFin) {
            cotizacionesFiltradas = cotizacionesFiltradas.filter(cot => 
                cot.fecha_creacion <= filtros.fechaFin
            );
        }

        setCotizaciones(cotizacionesFiltradas);
        calcularEstadisticas(cotizacionesFiltradas);
    };

    const calcularEstadisticas = (cotizacionesData) => {
        const hoy = new Date().toISOString().split('T')[0];
        
        const total = cotizacionesData.length;
        const activas = cotizacionesData.filter(c => c.estado === 'ACTIVA').length;
        const convertidas = cotizacionesData.filter(c => c.estado === 'CONVERTIDA').length;
        const vencidas = cotizacionesData.filter(c => 
            c.estado === 'ACTIVA' && c.fecha_vencimiento && c.fecha_vencimiento < hoy
        ).length;

        setEstadisticas({ total, activas, vencidas, convertidas });
    };

    const handleFiltrosChange = (nuevosFiltros) => {
        console.log('Nuevos filtros aplicados:', nuevosFiltros);
        setFiltros(nuevosFiltros);
    };

    const handleLimpiarFiltros = () => {
        setFiltros({
            estado: '',
            cliente: '',
            fechaInicio: '',
            fechaFin: '',
            tipoServicio: ''
        });
    };

    const handleCrearCotizacion = () => {
        setMostrarModalTipo(true);
    };

    const handleSeleccionarTipo = (tipo) => {
        if (tipo === 'FABRICACION') {
            setCotizacionSeleccionada(null);
            setModoEdicion(false);
            setMostrarFormularioFabricacion(true);
        } else if (tipo === 'REPARACION') {
            setCotizacionSeleccionada(null);
            setModoEdicion(false);
            setMostrarFormularioReparacion(true);
        }
    };

    const handleCerrarFormularioFabricacion = () => {
        setMostrarFormularioFabricacion(false);
        setCotizacionSeleccionada(null);
        cargarTodasLasCotizaciones();
    };

    const handleCerrarFormularioReparacion = () => {
        setMostrarFormularioReparacion(false);
        setCotizacionSeleccionada(null);
        cargarTodasLasCotizaciones();
    };

    const handleEliminarCotizacion = async (cotizacion) => {
        if (!window.confirm(`¿Estás seguro de eliminar la cotización #${cotizacion.numero_cotizacion}?`)) {
            return;
        }

        try {
            await api.delete(`/cotizaciones/${cotizacion.numero_cotizacion}/`);
            alert('Cotización eliminada exitosamente');
            cargarTodasLasCotizaciones();
        } catch (error) {
            console.error('Error eliminando cotización:', error);
            alert('Error al eliminar la cotización');
        }
    };

    const handleConvertirAFactura = async (cotizacion) => {
        if (!window.confirm(`¿Convertir cotización #${cotizacion.numero_cotizacion} a factura?`)) {
            return;
        }

        try {
            const response = await api.post(`/cotizaciones/${cotizacion.numero_cotizacion}/convertir_a_factura/`);
            alert(`Cotización convertida a factura #${response.data.numero_factura} exitosamente`);
            cargarTodasLasCotizaciones();
        } catch (error) {
            console.error('Error convirtiendo cotización:', error);
            const errorMsg = error.response?.data?.error || 'Error al convertir la cotización a factura';
            alert(errorMsg);
        }
    };

    if (mostrarFormularioFabricacion) {
        return (
            <FormatoCotizacionFabricacion
                cotizacion={cotizacionSeleccionada}
                modoEdicion={modoEdicion}
                onClose={handleCerrarFormularioFabricacion}
                onSave={handleCerrarFormularioFabricacion}
            />
        );
    }

    if (mostrarFormularioReparacion) {
        return (
            <FormatoCotizacionReparacion
                cotizacion={cotizacionSeleccionada}
                modoEdicion={modoEdicion}
                onClose={handleCerrarFormularioReparacion}
                onSave={handleCerrarFormularioReparacion}
            />
        );
    }

    return (
        <div className="cotizaciones-module">
            <ModalSeleccionTipo
                isOpen={mostrarModalTipo}
                onClose={() => setMostrarModalTipo(false)}
                onSeleccionarTipo={handleSeleccionarTipo}
            />

            <HeaderCotizaciones 
                estadisticas={estadisticas}
                onCrearCotizacion={handleCrearCotizacion}
                loading={loading}
            />

            <FiltrosCotizaciones
                filtros={filtros}
                onFiltrosChange={handleFiltrosChange}
                onLimpiarFiltros={handleLimpiarFiltros}
            />

            <ListaCotizaciones
                cotizaciones={cotizaciones} // <- Ahora pasa las cotizaciones ya filtradas
                loading={loading}
                onEliminar={handleEliminarCotizacion}
                onConvertirAFactura={handleConvertirAFactura}
            />
        </div>
    );
}