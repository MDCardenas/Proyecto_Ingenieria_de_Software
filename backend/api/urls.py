# backend/api/urls.py
from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from . import views
from django.conf import settings
from django.conf.urls.static import static

# Configurar router para ViewSets
router = DefaultRouter()

# ViewSets principales
router.register(r'clientes', views.ClienteViewSet, basename='clientes')
router.register(r'empleados', views.EmpleadoViewSet, basename='empleados')
router.register(r'joyas', views.StockJoyaViewSet, basename='joyas')
router.register(r'servicios', views.ServicioViewSet, basename='servicios')
router.register(r'facturas', views.FacturaViewSet, basename='facturas')
router.register(r'cotizaciones', views.CotizacionViewSet, basename='cotizaciones')
router.register(r'ordenes-trabajo', views.OrdenTrabajoViewSet, basename='ordenes-trabajo')

# ViewSets de inventario
router.register(r'insumos', views.StockInsumoViewSet, basename='insumos')
router.register(r'materiales', views.StockMaterialViewSet, basename='materiales')
router.register(r'proveedores', views.ProvedorViewSet, basename='proveedores')
router.register(r'perfiles', views.PerfilEmpleadoViewSet, basename='perfiles')

urlpatterns = [
    # ========================================
    # RUTAS DE EMPLEADOS (ORDEN CORRECTO - MUY IMPORTANTE)
    # ========================================
    path('empleados/nuevo/', views.crear_empleado, name='crear_empleado'),
    path('empleados/<int:pk>/actualizar/', views.actualizar_empleado, name='actualizar_empleado'),
    path('empleados/<int:pk>/eliminar/', views.eliminar_empleado, name='eliminar_empleado'),
    path('empleados/<int:pk>/', views.empleado_detalle, name='empleado_detalle'),
    path('empleados/', views.lista_empleados, name='lista_empleados'),
    path('perfiles/', views.lista_perfiles, name='lista_perfiles'),
    
    # ========================================
    # RUTAS DE FACTURAS (DEBEN IR ANTES DEL ROUTER)
    # ========================================
    path('facturas/completas/', views.obtener_facturas_completas, name='obtener-facturas-completas'),
    path('facturas/crear-simple/', views.crear_factura_simple, name='crear-factura-simple'),
    
    # ========================================
    # RUTAS DEL ROUTER (VIEWSETS)
    # ========================================
    path('', include(router.urls)),
    
    

    
    # ========================================
    # OTRAS RUTAS API VIEW (ENDPOINTS ESPECIALES)
    # ========================================
    
    # Sistema básico
    path('hello/', views.hello, name='hello'),
    path('db-test/', views.db_test, name='db-test'),
    path('login/', views.login, name='login'),
    
    # Dashboard y reportes
    path('dashboard/', views.dashboard_general, name='dashboard-general'),
    path('ventas/dashboard/', views.ventas_dashboard, name='ventas-dashboard'),
    path('ventas/reporte/', views.ventas_reporte_periodo, name='ventas-reporte'),
    path('ventas/top-productos/', views.ventas_top_productos, name='ventas-top-productos'),
    path('inventario/alertas/', views.inventario_alertas, name='inventario-alertas'),
    
    # ========================================
    # OTRAS RUTAS DE FACTURAS
    # ========================================
    
    # Creación de facturas completas
    path('facturas/crear-completa/', views.crear_factura_completa, name='crear-factura-completa'),
    
    # Estados y pagos
    path('facturas/<int:numero_factura>/estado-pago/', views.actualizar_estado_pago, name='actualizar-estado-pago'),
    path('facturas/<int:numero_factura>/anular/', views.anular_factura, name='anular-factura'),
    
    # Consultas específicas
    path('facturas/pendientes-pago/', views.facturas_pendientes_pago, name='facturas-pendientes-pago'),
    path('facturas/por-cliente/<int:id_cliente>/', views.facturas_por_cliente, name='facturas-por-cliente'),
    path('facturas/por-fecha/', views.facturas_por_fecha, name='facturas-por-fecha'),
    path('facturas/<int:numero_factura>/detalles/', views.obtener_detalles_factura, name='obtener-detalles-factura'),
    
    # ========================================
    # RUTAS DE COTIZACIONES (ACTUALIZADAS Y COMPLETAS)
    # ========================================
    
    # Creación y gestión básica (complementan el ViewSet)
    path('cotizaciones/crear-completa/', views.crear_cotizacion_completa, name='crear-cotizacion-completa'),
    path('cotizaciones/<int:numero_cotizacion>/actualizar/', views.actualizar_cotizacion, name='actualizar-cotizacion'),
    path('cotizaciones/<int:numero_cotizacion>/anular/', views.anular_cotizacion, name='anular-cotizacion'),
    path('cotizaciones/<int:numero_cotizacion>/convertir/', views.convertir_cotizacion_a_factura, name='convertir-cotizacion'),
    
    # Consultas y filtros específicos
    path('cotizaciones/vencidas/', views.cotizaciones_vencidas, name='cotizaciones-vencidas'),
    path('cotizaciones/activas/', views.CotizacionViewSet.as_view({'get': 'activas'}), name='cotizaciones-activas'),
    path('cotizaciones/por-cliente/', views.CotizacionViewSet.as_view({'get': 'por_cliente'}), name='cotizaciones-por-cliente'),
    
    # Dashboard y reportes
    path('cotizaciones/dashboard/', views.dashboard_cotizaciones, name='dashboard-cotizaciones'),
    
    # ========================================
    # RUTAS DE INVENTARIO
    # ========================================
    path('inventario/stock-bajo/', views.stock_bajo, name='stock-bajo'),
    path('inventario/materiales/por-tipo/', views.materiales_por_tipo, name='materiales-por-tipo'),
    path('inventario/insumos/por-categoria/', views.insumos_por_categoria, name='insumos-por-categoria'),
    path('inventario/actualizar-stock/', views.actualizar_stock_masivo, name='actualizar-stock-masivo'),
    
    # ========================================
    # RUTAS DE ÓRDENES DE TRABAJO
    # ========================================
    path('ordenes-trabajo/pendientes/', views.ordenes_trabajo_pendientes, name='ordenes-trabajo-pendientes'),
    path('ordenes-trabajo/<int:id_orden>/actualizar-estado/', views.actualizar_estado_orden_trabajo, name='actualizar-estado-orden-trabajo'),
    path('ordenes-trabajo/<int:id_orden>/completar/', views.completar_orden_trabajo, name='completar-orden-trabajo'),
    path('ordenes-trabajo/por-factura/<int:numero_factura>/', views.ordenes_trabajo_por_factura, name='ordenes-trabajo-por-factura'),
    path('ordenes-trabajo/por-empleado/<int:id_empleado>/', views.ordenes_trabajo_por_empleado, name='ordenes-trabajo-por-empleado'),
    
    # ========================================
    # RUTAS DE DETALLES DE FACTURA
    # ========================================
    path('detalles-factura/crear/', views.crear_detalle_factura, name='crear-detalle-factura'),
    path('detalles-factura/<int:id_detalle>/actualizar/', views.actualizar_detalle_factura, name='actualizar-detalle-factura'),
    path('detalles-factura/<int:id_detalle>/eliminar/', views.eliminar_detalle_factura, name='eliminar-detalle-factura'),


# ========================================
    # RUTAS DE EMPLEADOS
    # ========================================
  #  path('empleados/eliminar/<int:pk>/', views.empleado_eliminar, name='empleado_eliminar'),
  path('perfiles/', views.lista_perfiles, name='lista_perfiles'),

  # ========================================
    # RUTAS DE CONTABILIDAD
    # ========================================
    

    
path('contabilidad/resumen/', views.contabilidad_resumen, name='contabilidad-resumen'),
path('gastos/mes/', views.gastos_mes, name='gastos-mes'),

# Agregar en urls.py (después de las rutas de contabilidad)

# ========================================
# RUTAS DE PROVEEDORES
# ========================================
path('proveedores/estadisticas/', views.proveedores_estadisticas, name='proveedores-estadisticas'),
path('proveedores/buscar/', views.proveedores_buscar, name='proveedores-buscar'),
path('proveedores/<int:codigo_provedor>/detalle/', views.ProvedorViewSet.as_view({'get': 'retrieve'}), name='proveedor-detalle'),
]

# Configuración para el nombre de la app
app_name = 'api'

# SERVIR ARCHIVOS EN DESARROLLO
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)