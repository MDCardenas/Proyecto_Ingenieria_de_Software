// components/cotizacionesComponentes/CotizacionesModule.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HeaderCotizaciones from './HeaderCotizaciones';
import FiltrosCotizaciones from './FiltrosCotizaciones';
import ListaCotizaciones from './ListaCotizaciones';
import FormatoCotizacionFabricacion from '../cotizacionesComponentes/FormatoCotizacionFabricacion';
import FormatoCotizacionReparacion from '../cotizacionesComponentes/FormatoCotizacionReparacion'; // NUEVO IMPORT
import ModalSeleccionTipo from '../cotizacionesComponentes/ModalSeleccionTipo';

import "../../styles/scss/pages/_cotizacion.scss";

export default function CotizacionesModule() {
    const [cotizaciones, setCotizaciones] = useState([]);
    const [estadisticas, setEstadisticas] = useState({
        total: 0,
        activas: 0,
        vencidas: 0
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
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    
    // Estados para el modal de selección y formatos
    const [mostrarModalTipo, setMostrarModalTipo] = useState(false);
    const [mostrarFormularioFabricacion, setMostrarFormularioFabricacion] = useState(false);
    const [mostrarFormularioReparacion, setMostrarFormularioReparacion] = useState(false); // NUEVO ESTADO

    useEffect(() => {
        cargarDatos();
    }, [filtros]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            
            const params = new URLSearchParams();
            if (filtros.estado) params.append('estado', filtros.estado);
            if (filtros.cliente) params.append('cliente_id', filtros.cliente);
            if (filtros.fechaInicio) params.append('fecha_inicio', filtros.fechaInicio);
            if (filtros.fechaFin) params.append('fecha_fin', filtros.fechaFin);
            if (filtros.tipoServicio) params.append('tipo_servicio', filtros.tipoServicio);

            const cotizacionesRes = await axios.get(`/api/cotizaciones/?${params}`);
            const cotizacionesData = cotizacionesRes.data;
            
            setCotizaciones(cotizacionesData);

            const hoy = new Date().toISOString().split('T')[0];
            
            const total = cotizacionesData.length;
            const activas = cotizacionesData.filter(c => c.estado === 'ACTIVA').length;
            const vencidas = cotizacionesData.filter(c => 
                c.estado === 'ACTIVA' && c.fecha_vencimiento && c.fecha_vencimiento < hoy
            ).length;

            setEstadisticas({
                total,
                activas,
                vencidas
            });
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            alert('Error al cargar las cotizaciones');
            
            setEstadisticas({
                total: 0,
                activas: 0,
                vencidas: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFiltrosChange = (nuevosFiltros) => {
        setFiltros(nuevosFiltros);
    };

    const handleCrearCotizacion = () => {
        setMostrarModalTipo(true);
    };

    // MODIFICAR ESTA FUNCIÓN para manejar ambos tipos
    const handleSeleccionarTipo = (tipo) => {
        console.log(`Tipo de cotización seleccionado: ${tipo}`);
        
        if (tipo === 'FABRICACION') {
            // Abrir formato de fabricación
            setCotizacionSeleccionada(null);
            setModoEdicion(false);
            setMostrarFormularioFabricacion(true);
        } else if (tipo === 'REPARACION') {
            // Abrir formato de reparación
            setCotizacionSeleccionada(null);
            setModoEdicion(false);
            setMostrarFormularioReparacion(true);
        }
    };

    const handleEditarCotizacion = (cotizacion) => {
        setCotizacionSeleccionada(cotizacion);
        setModoEdicion(true);
        
        // Determinar qué formulario mostrar basado en el tipo de servicio
        if (cotizacion.tipo_servicio === 'FABRICACION') {
            setMostrarFormularioFabricacion(true);
        } else if (cotizacion.tipo_servicio === 'REPARACION') {
            setMostrarFormularioReparacion(true);
        } else {
            // Por defecto mostrar fabricación
            setMostrarFormularioFabricacion(true);
        }
    };

    const handleVerDetalle = (cotizacion) => {
        setCotizacionSeleccionada(cotizacion);
        setModoEdicion(false);
        
        // Determinar qué formulario mostrar basado en el tipo de servicio
        if (cotizacion.tipo_servicio === 'FABRICACION') {
            setMostrarFormularioFabricacion(true);
        } else if (cotizacion.tipo_servicio === 'REPARACION') {
            setMostrarFormularioReparacion(true);
        } else {
            // Por defecto mostrar fabricación
            setMostrarFormularioFabricacion(true);
        }
    };

    const handleCerrarFormularioFabricacion = () => {
        setMostrarFormularioFabricacion(false);
        setCotizacionSeleccionada(null);
        cargarDatos();
    };

    // NUEVA FUNCIÓN para cerrar formulario de reparación
    const handleCerrarFormularioReparacion = () => {
        setMostrarFormularioReparacion(false);
        setCotizacionSeleccionada(null);
        cargarDatos();
    };

    const handleEliminarCotizacion = async (cotizacion) => {
        if (!window.confirm(`¿Estás seguro de eliminar la cotización #${cotizacion.numero_cotizacion}?`)) {
            return;
        }

        try {
            await axios.delete(`/api/cotizaciones/${cotizacion.numero_cotizacion}/`);
            alert('Cotización eliminada exitosamente');
            cargarDatos();
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
            const response = await axios.post(`/api/cotizaciones/${cotizacion.numero_cotizacion}/convertir_a_factura/`);
            alert('Cotización convertida a factura exitosamente');
            console.log('Factura creada:', response.data.factura);
            cargarDatos();
        } catch (error) {
            console.error('Error convirtiendo cotización:', error);
            alert('Error al convertir la cotización a factura');
        }
    };


    // REMOVER este bloque ya que no se usa FormatoCotizacion genérico
    // if (mostrarFormulario) {
    //     return (
    //         <FormatoCotizacion
    //             cotizacion={cotizacionSeleccionada}
    //             modoEdicion={modoEdicion}
    //             onClose={handleCerrarFormulario}
    //             onSave={handleCerrarFormulario}
    //         />
    //     );
    // }

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

    // NUEVO BLOQUE para mostrar formulario de reparación
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
            
            {/* Modal de selección de tipo */}
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
                onLimpiarFiltros={() => setFiltros({
                    estado: '',
                    cliente: '',
                    fechaInicio: '',
                    fechaFin: '',
                    tipoServicio: ''
                })}
            />

            <ListaCotizaciones
                cotizaciones={cotizaciones}
                loading={loading}
                onEditar={handleEditarCotizacion}
                onVerDetalle={handleVerDetalle}
                onEliminar={handleEliminarCotizacion}
                onConvertirAFactura={handleConvertirAFactura}
            />
        </div>
    );
}