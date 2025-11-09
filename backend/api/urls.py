# backend/api/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Dashboard
    path('ventas/dashboard/', views.ventas_dashboard, name='ventas-dashboard'),
    path('dashboard/', views.dashboard_general, name='dashboard-general'),
    
    # Clientes - CORREGIDO
    path('clientes/', views.clientes_list, name='clientes-list'),  # GET para listar
    path('clientes/crear/', views.clientes_create, name='clientes-create'),  # POST para crear
    path('clientes/<int:pk>/', views.clientes_detail, name='clientes-detail'),  # PUT y DELETE
    path('clientes/buscar/', views.clientes_buscar, name='clientes-buscar'),
    
    # Joyas
    path('joyas/', views.joyas_list, name='joyas-list'),
    path('joyas/buscar/', views.joyas_buscar, name='joyas-buscar'),
    path('joyas/<int:pk>/', views.joyas_detalle, name='joyas-detalle'),
    
    # Servicios
    path('servicios/', views.servicios_list, name='servicios-list'),
    
    # Ventas
    path('ventas/', views.ventas_list, name='ventas-list'),
    path('ventas/crear/', views.ventas_create, name='ventas-create'),
    path('ventas/<int:pk>/', views.ventas_detalle, name='ventas-detalle'),
    path('ventas/<int:pk>/actualizar/', views.ventas_update, name='ventas-update'),
    path('ventas/<int:pk>/eliminar/', views.ventas_delete, name='ventas-delete'),
    
    # Reportes
    path('ventas/reporte/', views.ventas_reporte_periodo, name='ventas-reporte'),
    path('ventas/top-productos/', views.ventas_top_productos, name='ventas-top-productos'),

    path('empleados/',views.lista_empleados, name='lista_empleados'),
    path('empleados/crear/', views.crear_empleado, name='crear_empleado'),


    # ... tus otras URLs existentes ...
    
    # GET para listar empleados
    path('empleados/', views.lista_empleados, name='lista_empleados'),
    
    # POST para crear empleados
    path('empleados/crear/', views.crear_empleado, name='crear_empleado'),

    path('empleados/<int:pk>/', views.empleado_detalle, name='empleado_detalle'),

    path('empleados/eliminar/<int:pk>/', views.empleado_eliminar, name='empleado_eliminar'),


    #PUT PARA EDITAR EMPLEADOS
    
    
    # NUEVA: Para ver perfiles disponibles (temporal)
  # path('perfiles/', views.lista_perfiles, name='lista_perfiles'),
    
    

]