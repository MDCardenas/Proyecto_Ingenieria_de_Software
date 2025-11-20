# backend/api/views.py
#DAVID: AQUI LE IMPORTE MODELS
from django.db.models.functions import TruncDate
from django.db import models
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.db.models import Sum, Count, Q, F, Avg
from datetime import date,datetime, timedelta
from decimal import Decimal
from django.db.models import Value, CharField, DecimalField,F, ExpressionWrapper
from django.db.models.functions import Coalesce
from .models import (
    TblClientes, TblEmpleados, TblStockJoyas, TblServicios,
    TblFacturas, TblCotizaciones, TblStockInsumos, 
    TblStockMateriales, TblProvedores, PerfilesEmpleados,
    TblOrdenesTrabajo, TblDetallesFactura,TblGastos
)
from .serializers import (
    ClienteSerializer, EmpleadoSerializer, StockJoyaSerializer,
    ServicioSerializer, FacturaSerializer, CotizacionSerializer,
    StockInsumoSerializer, StockMaterialSerializer, ProvedorSerializer,
    PerfilEmpleadoSerializer, OrdenTrabajoSerializer, DetalleFacturaSerializer,
    CrearFacturaCompletaSerializer, ActualizarEstadoPagoSerializer,
    ActualizarEstadoOrdenSerializer, CrearFacturaSimpleSerializer
)

# ========================================
# VIEWSETS PRINCIPALES
# ========================================

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = TblClientes.objects.all()
    serializer_class = ClienteSerializer

class EmpleadoViewSet(viewsets.ModelViewSet):
    queryset = TblEmpleados.objects.all()
    serializer_class = EmpleadoSerializer

class StockJoyaViewSet(viewsets.ModelViewSet):
    queryset = TblStockJoyas.objects.all()
    serializer_class = StockJoyaSerializer

class ServicioViewSet(viewsets.ModelViewSet):
    queryset = TblServicios.objects.all()
    serializer_class = ServicioSerializer

class FacturaViewSet(viewsets.ModelViewSet):
    queryset = TblFacturas.objects.all()
    serializer_class = FacturaSerializer

class CotizacionViewSet(viewsets.ModelViewSet):
    queryset = TblCotizaciones.objects.all()
    serializer_class = CotizacionSerializer


    # Metodos Personalizados

    def get_queryset(self):
        """Filtrar cotizaciones por estado si se proporciona"""
        queryset = TblCotizaciones.objects.all()
        estado = self.request.query_params.get('estado', None)
        
        if estado:
            queryset = queryset.filter(estado=estado)
        
        return queryset.order_by('-fecha_creacion')
    
    @action(detail=True, methods=['post'])
    def convertir_a_factura(self, request, pk=None):
        """Convertir cotización a factura - acción personalizada"""
        cotizacion = self.get_object()
        
        try:
            # Crear factura a partir de la cotización
            factura = TblFacturas.objects.create(
                id_cliente=cotizacion.id_cliente,
                id_empleado=cotizacion.id_empleado,
                fecha=datetime.now(),
                direccion=cotizacion.direccion,
                telefono=cotizacion.telefono,
                rtn=cotizacion.rtn,
                subtotal=cotizacion.subtotal,
                descuento=cotizacion.descuento,
                isv=cotizacion.isv,
                total=cotizacion.total,
                tipo_venta=cotizacion.tipo_servicio,
                observaciones=cotizacion.observaciones,
                estado_pago='PENDIENTE'
            )
            
            # Actualizar cotización
            cotizacion.numero_factura_conversion = factura
            cotizacion.fecha_conversion = datetime.now()
            cotizacion.estado = 'CONVERTIDA'
            cotizacion.save()
            
            return Response({
                'success': True,
                'message': 'Cotización convertida a factura exitosamente',
                'factura': FacturaSerializer(factura).data,
                'numero_factura': factura.numero_factura
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Error al convertir cotización: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=False, methods=['get'])
    def activas(self, request):
        """Obtener solo cotizaciones activas"""
        cotizaciones = TblCotizaciones.objects.filter(estado='ACTIVA').order_by('-fecha_creacion')
        serializer = self.get_serializer(cotizaciones, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def vencidas(self, request):
        """Obtener cotizaciones vencidas"""
        hoy = datetime.now().date()
        cotizaciones = TblCotizaciones.objects.filter(
            fecha_vencimiento__lt=hoy,
            estado='ACTIVA'
        ).order_by('-fecha_creacion')
        serializer = self.get_serializer(cotizaciones, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def por_cliente(self, request):
        """Obtener cotizaciones por cliente"""
        id_cliente = request.query_params.get('cliente_id')
        if not id_cliente:
            return Response({
                'error': 'Parámetro cliente_id es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        cotizaciones = TblCotizaciones.objects.filter(id_cliente=id_cliente)
        serializer = self.get_serializer(cotizaciones, many=True)
        return Response(serializer.data)








class OrdenTrabajoViewSet(viewsets.ModelViewSet):
    queryset = TblOrdenesTrabajo.objects.all()
    serializer_class = OrdenTrabajoSerializer

# ViewSets de inventario
class StockInsumoViewSet(viewsets.ModelViewSet):
    queryset = TblStockInsumos.objects.all()
    serializer_class = StockInsumoSerializer

class StockMaterialViewSet(viewsets.ModelViewSet):
    queryset = TblStockMateriales.objects.all()
    serializer_class = StockMaterialSerializer

class ProvedorViewSet(viewsets.ModelViewSet):
    queryset = TblProvedores.objects.all()
    serializer_class = ProvedorSerializer

class PerfilEmpleadoViewSet(viewsets.ModelViewSet):
    queryset = PerfilesEmpleados.objects.all()
    serializer_class = PerfilEmpleadoSerializer

# ========================================
# VISTAS ESPECIALES (API VIEWS)
# ========================================

@api_view(['GET'])
def hello(request):
    return Response({'message': '¡API de Joyería funcionando!'})

@api_view(['GET'])
def db_test(request):
    """Test de conexión a la base de datos"""
    try:
        clientes_count = TblClientes.objects.count()
        empleados_count = TblEmpleados.objects.count()
        facturas_count = TblFacturas.objects.count()
        
        return Response({
            'status': 'success',
            'message': 'Conexión a la base de datos exitosa',
            'data': {
                'clientes': clientes_count,
                'empleados': empleados_count,
                'facturas': facturas_count
            }
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error en la base de datos: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def login(request):
    """Login de empleados - acepta usuario o correo"""
    try:
        usuario = request.data.get('usuario', '')
        correo = request.data.get('correo', '')
        contrasena = request.data.get('contrasena')
        
        # Validar que se proporcione al menos usuario o correo
        if not usuario and not correo:
            return Response({
                'success': False,
                'error': 'Usuario o correo es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not contrasena:
            return Response({
                'success': False,
                'error': 'Contraseña es requerida'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Buscar empleado por usuario O correo
            if usuario:
                empleado = TblEmpleados.objects.get(usuario=usuario, contrasena=contrasena)
            else:
                empleado = TblEmpleados.objects.get(correo=correo, contrasena=contrasena)
            
            serializer = EmpleadoSerializer(empleado)
            
            return Response({
                'success': True,
                'message': 'Login exitoso',
                'empleado': serializer.data
            })
            
        except TblEmpleados.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Usuario/correo o contraseña incorrectos'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Error en el login: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
# ========================================
# DASHBOARD Y REPORTES
# ========================================

@api_view(['GET'])
def dashboard_general(request):
    """Dashboard general del sistema"""
    try:
        # Estadísticas básicas
        total_clientes = TblClientes.objects.count()
        total_empleados = TblEmpleados.objects.count()
        total_facturas = TblFacturas.objects.count()
        
        # Ventas del mes actual
        hoy = datetime.now()
        primer_dia_mes = hoy.replace(day=1)
        ventas_mes = TblFacturas.objects.filter(
            fecha__gte=primer_dia_mes
        ).aggregate(
            total_ventas=Sum('total'),
            cantidad_ventas=Count('numero_factura')
        )
        
        # Facturas pendientes de pago
        facturas_pendientes = TblFacturas.objects.filter(
            estado_pago='PENDIENTE'
        ).count()
        
        # Órdenes de trabajo pendientes
        ordenes_pendientes = TblOrdenesTrabajo.objects.filter(
            estado='PENDIENTE'
        ).count()
        
        return Response({
            'estadisticas': {
                'total_clientes': total_clientes,
                'total_empleados': total_empleados,
                'total_facturas': total_facturas,
                'ventas_mes_actual': ventas_mes['total_ventas'] or 0,
                'cantidad_ventas_mes': ventas_mes['cantidad_ventas'] or 0,
                'facturas_pendientes_pago': facturas_pendientes,
                'ordenes_trabajo_pendientes': ordenes_pendientes
            }
        })
        
    except Exception as e:
        return Response({
            'error': f'Error al generar dashboard: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def ventas_dashboard(request):
    """Dashboard específico de ventas"""
    try:
        # Ventas por tipo
        ventas_por_tipo = TblFacturas.objects.values('tipo_venta').annotate(
            total=Sum('total'),
            cantidad=Count('numero_factura')
        )
        
        # Ventas últimos 7 días
        fecha_inicio = datetime.now() - timedelta(days=7)
        ventas_ultima_semana = TblFacturas.objects.filter(
            fecha__gte=fecha_inicio
        ).values('fecha__date').annotate(
            total_dia=Sum('total')
        ).order_by('fecha__date')
        
        # Top productos más vendidos (a través de detalles de factura)
        top_productos = TblDetallesFactura.objects.values(
            'tipo_item', 'codigo_item', 'descripcion'
        ).annotate(
            total_vendido=Sum('cantidad'),
            ingresos_totales=Sum('precio_unitario')
        ).order_by('-total_vendido')[:10]
        
        return Response({
            'ventas_por_tipo': list(ventas_por_tipo),
            'ventas_ultima_semana': list(ventas_ultima_semana),
            'top_productos': list(top_productos)
        })
        
    except Exception as e:
        return Response({
            'error': f'Error en dashboard de ventas: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def ventas_reporte_periodo(request):
    """Reporte de ventas por período"""
    try:
        fecha_inicio = request.data.get('fecha_inicio')
        fecha_fin = request.data.get('fecha_fin')
        
        if not fecha_inicio or not fecha_fin:
            return Response({
                'error': 'Fecha inicio y fecha fin son requeridas'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Convertir fechas
        fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d')
        fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d')
        
        ventas_periodo = TblFacturas.objects.filter(
            fecha__date__gte=fecha_inicio,
            fecha__date__lte=fecha_fin
        )
        
        total_ventas = ventas_periodo.aggregate(
            total=Sum('total'),
            cantidad=Count('numero_factura'),
            promedio=Avg('total')
        )
        
        ventas_por_dia = ventas_periodo.values('fecha__date').annotate(
            total_dia=Sum('total'),
            cantidad_dia=Count('numero_factura')
        ).order_by('fecha__date')
        
        return Response({
            'periodo': {
                'fecha_inicio': fecha_inicio.strftime('%Y-%m-%d'),
                'fecha_fin': fecha_fin.strftime('%Y-%m-%d')
            },
            'resumen': total_ventas,
            'ventas_por_dia': list(ventas_por_dia)
        })
        
    except Exception as e:
        return Response({
            'error': f'Error en reporte de ventas: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def ventas_top_productos(request):
    """Top productos más vendidos"""
    try:
        top_productos = TblDetallesFactura.objects.values(
            'tipo_item', 'codigo_item', 'descripcion'
        ).annotate(
            total_vendido=Sum('cantidad'),
            ingresos_totales=Sum('precio_unitario')
        ).order_by('-total_vendido')[:10]
        
        return Response({
            'top_productos': list(top_productos)
        })
        
    except Exception as e:
        return Response({
            'error': f'Error al obtener top productos: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def inventario_alertas(request):
    """Alertas de inventario (stock bajo)"""
    try:
        # Materiales con stock bajo (menos de 10 unidades)
        materiales_stock_bajo = TblStockMateriales.objects.filter(
            cantidad_existencia__lt=10
        ).values('codigo_material', 'nombre', 'cantidad_existencia')
        
        # Insumos con stock bajo (menos de 5 unidades)
        insumos_stock_bajo = TblStockInsumos.objects.filter(
            cantidad_existencia__lt=5
        ).values('codigo_insumo', 'nombre', 'cantidad_existencia')
        
        # Insumos próximos a vencer (en los próximos 30 días)
        hoy = datetime.now().date()
        fecha_limite = hoy + timedelta(days=30)
        insumos_proximos_vencer = TblStockInsumos.objects.filter(
            fecha_vencimiento__gte=hoy,
            fecha_vencimiento__lte=fecha_limite,
            requiere_control_vencimiento=True
        ).values('codigo_insumo', 'nombre', 'fecha_vencimiento', 'cantidad_existencia')
        
        return Response({
            'materiales_stock_bajo': list(materiales_stock_bajo),
            'insumos_stock_bajo': list(insumos_stock_bajo),
            'insumos_proximos_vencer': list(insumos_proximos_vencer)
        })
        
    except Exception as e:
        return Response({
            'error': f'Error al obtener alertas de inventario: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ========================================
# FACTURAS - ENDPOINTS ESPECIALES
# ========================================

@api_view(['POST'])
def crear_factura_completa(request):
    """Crear factura completa con detalles"""
    serializer = CrearFacturaCompletaSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            factura = serializer.save()
            factura_serializer = FacturaSerializer(factura)
            
            return Response({
                'success': True,
                'message': 'Factura creada exitosamente',
                'factura': factura_serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def actualizar_estado_pago(request, numero_factura):
    """Actualizar estado de pago de una factura"""
    try:
        factura = TblFacturas.objects.get(numero_factura=numero_factura)
    except TblFacturas.DoesNotExist:
        return Response({
            'error': 'Factura no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = ActualizarEstadoPagoSerializer(data=request.data)
    
    if serializer.is_valid():
        factura.estado_pago = serializer.validated_data['estado_pago']
        factura.metodo_pago = serializer.validated_data.get('metodo_pago', '')
        factura.fecha_pago = serializer.validated_data.get('fecha_pago')
        factura.save()
        
        return Response({
            'success': True,
            'message': 'Estado de pago actualizado',
            'factura': FacturaSerializer(factura).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def anular_factura(request, numero_factura):
    """Anular una factura"""
    try:
        factura = TblFacturas.objects.get(numero_factura=numero_factura)
        factura.estado_pago = 'CANCELADA'
        factura.observaciones = request.data.get('observaciones', 'Factura anulada')
        factura.save()
        
        return Response({
            'success': True,
            'message': 'Factura anulada exitosamente'
        })
        
    except TblFacturas.DoesNotExist:
        return Response({
            'error': 'Factura no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def obtener_facturas_completas(request):
    """Obtener facturas con todos sus detalles"""
    facturas = TblFacturas.objects.all().prefetch_related('tbldetallesfactura_set')
    serializer = FacturaSerializer(facturas, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def facturas_pendientes_pago(request):
    """Obtener facturas pendientes de pago"""
    facturas = TblFacturas.objects.filter(estado_pago='PENDIENTE')
    serializer = FacturaSerializer(facturas, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def facturas_por_cliente(request, id_cliente):
    """Obtener facturas por cliente"""
    facturas = TblFacturas.objects.filter(id_cliente=id_cliente)
    serializer = FacturaSerializer(facturas, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def facturas_por_fecha(request):
    """Obtener facturas por rango de fechas"""
    fecha_inicio = request.data.get('fecha_inicio')
    fecha_fin = request.data.get('fecha_fin')
    
    if not fecha_inicio or not fecha_fin:
        return Response({
            'error': 'Fecha inicio y fecha fin son requeridas'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    facturas = TblFacturas.objects.filter(
        fecha__date__gte=fecha_inicio,
        fecha__date__lte=fecha_fin
    )
    serializer = FacturaSerializer(facturas, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def obtener_detalles_factura(request, numero_factura):
    """Obtener detalles de una factura específica"""
    detalles = TblDetallesFactura.objects.filter(numero_factura=numero_factura)
    serializer = DetalleFacturaSerializer(detalles, many=True)
    return Response(serializer.data)

# ========================================
# COTIZACIONES - ENDPOINTS ADICIONALES
# ========================================

@api_view(['POST'])
def convertir_cotizacion_a_factura(request, numero_cotizacion):
    """Convertir cotización a factura"""
    try:
        cotizacion = TblCotizaciones.objects.get(numero_cotizacion=numero_cotizacion)
        
        # Crear factura a partir de la cotización
        factura = TblFacturas.objects.create(
            id_cliente=cotizacion.id_cliente,
            id_empleado=cotizacion.id_empleado,
            fecha=datetime.now(),
            direccion=cotizacion.direccion,
            telefono=cotizacion.telefono,
            rtn=cotizacion.rtn,
            subtotal=cotizacion.subtotal,
            descuento=cotizacion.descuento,
            isv=cotizacion.isv,
            total=cotizacion.total,
            tipo_venta=cotizacion.tipo_servicio,
            observaciones=cotizacion.observaciones,
            estado_pago='PENDIENTE'
        )
        
        # Actualizar cotización
        cotizacion.numero_factura_conversion = factura
        cotizacion.fecha_conversion = datetime.now()
        cotizacion.estado = 'CONVERTIDA'
        cotizacion.save()
        
        return Response({
            'success': True,
            'message': 'Cotización convertida a factura exitosamente',
            'factura': FacturaSerializer(factura).data
        })
        
    except TblCotizaciones.DoesNotExist:
        return Response({
            'error': 'Cotización no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def cotizaciones_vencidas(request):
    """Obtener cotizaciones vencidas"""
    hoy = datetime.now().date()
    cotizaciones = TblCotizaciones.objects.filter(
        fecha_vencimiento__lt=hoy,
        estado='ACTIVA'
    )
    serializer = CotizacionSerializer(cotizaciones, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def crear_cotizacion_completa(request):
    """Crear cotización completa con validación"""
    try:
        # Validar datos requeridos
        required_fields = ['id_cliente', 'id_empleado', 'subtotal', 'isv', 'total']
        for field in required_fields:
            if field not in request.data:
                return Response({
                    'success': False,
                    'error': f'Campo requerido faltante: {field}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear cotización
        cotizacion_data = {
            'id_cliente_id': request.data['id_cliente'],
            'id_empleado_id': request.data['id_empleado'],
            'fecha_vencimiento': request.data.get('fecha_vencimiento'),
            'direccion': request.data.get('direccion', ''),
            'telefono': request.data.get('telefono', ''),
            'rtn': request.data.get('rtn', ''),
            'subtotal': Decimal(str(request.data['subtotal'])),
            'descuento': Decimal(str(request.data.get('descuento', 0))),
            'isv': Decimal(str(request.data['isv'])),
            'total': Decimal(str(request.data['total'])),
            'tipo_servicio': request.data.get('tipo_servicio', 'REPARACIÓN'),
            'observaciones': request.data.get('observaciones', '')
        }
        
        cotizacion = TblCotizaciones.objects.create(**cotizacion_data)
        
        return Response({
            'success': True,
            'message': 'Cotización creada exitosamente',
            'cotizacion': CotizacionSerializer(cotizacion).data,
            'numero_cotizacion': cotizacion.numero_cotizacion
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Error al crear cotización: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['PUT'])
def actualizar_cotizacion(request, numero_cotizacion):
    """Actualizar una cotización existente"""
    try:
        cotizacion = TblCotizaciones.objects.get(numero_cotizacion=numero_cotizacion)
    except TblCotizaciones.DoesNotExist:
        return Response({
            'error': 'Cotización no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = CotizacionSerializer(cotizacion, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'message': 'Cotización actualizada exitosamente',
            'cotizacion': serializer.data
        })
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def anular_cotizacion(request, numero_cotizacion):
    """Anular una cotización"""
    try:
        cotizacion = TblCotizaciones.objects.get(numero_cotizacion=numero_cotizacion)
        
        if cotizacion.estado == 'CONVERTIDA':
            return Response({
                'success': False,
                'error': 'No se puede anular una cotización ya convertida a factura'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        cotizacion.estado = 'ANULADA'
        cotizacion.observaciones = request.data.get('observaciones', 'Cotización anulada')
        cotizacion.save()
        
        return Response({
            'success': True,
            'message': 'Cotización anulada exitosamente'
        })
        
    except TblCotizaciones.DoesNotExist:
        return Response({
            'error': 'Cotización no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def dashboard_cotizaciones(request):
    """Dashboard específico para cotizaciones"""
    try:
        # Estadísticas generales
        total_cotizaciones = TblCotizaciones.objects.count()
        cotizaciones_activas = TblCotizaciones.objects.filter(estado='ACTIVA').count()
        cotizaciones_convertidas = TblCotizaciones.objects.filter(estado='CONVERTIDA').count()
        
        # Cotizaciones del mes actual
        hoy = datetime.now()
        primer_dia_mes = hoy.replace(day=1)
        cotizaciones_mes = TblCotizaciones.objects.filter(
            fecha_creacion__gte=primer_dia_mes
        ).aggregate(
            total=Count('numero_cotizacion'),
            valor_total=Sum('total')
        )
        
        # Cotizaciones próximas a vencer (próximos 7 días)
        fecha_limite = hoy.date() + timedelta(days=7)
        cotizaciones_proximas_vencer = TblCotizaciones.objects.filter(
            fecha_vencimiento__gte=hoy.date(),
            fecha_vencimiento__lte=fecha_limite,
            estado='ACTIVA'
        ).count()
        
        # Tasa de conversión (cotizaciones convertidas vs total)
        tasa_conversion = 0
        if total_cotizaciones > 0:
            tasa_conversion = (cotizaciones_convertidas / total_cotizaciones) * 100
        
        return Response({
            'estadisticas': {
                'total_cotizaciones': total_cotizaciones,
                'cotizaciones_activas': cotizaciones_activas,
                'cotizaciones_convertidas': cotizaciones_convertidas,
                'cotizaciones_mes_actual': cotizaciones_mes['total'] or 0,
                'valor_total_mes': float(cotizaciones_mes['valor_total'] or 0),
                'cotizaciones_proximas_vencer': cotizaciones_proximas_vencer,
                'tasa_conversion': round(tasa_conversion, 2)
            }
        })
        
    except Exception as e:
        return Response({
            'error': f'Error al generar dashboard: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ========================================
# INVENTARIO
# ========================================

@api_view(['GET'])
def stock_bajo(request):
    """Obtener items con stock bajo"""
    materiales = TblStockMateriales.objects.filter(cantidad_existencia__lt=10)
    insumos = TblStockInsumos.objects.filter(cantidad_existencia__lt=5)
    
    return Response({
        'materiales': StockMaterialSerializer(materiales, many=True).data,
        'insumos': StockInsumoSerializer(insumos, many=True).data
    })

@api_view(['GET'])
def materiales_por_tipo(request):
    """Obtener materiales agrupados por tipo"""
    materiales_por_tipo = TblStockMateriales.objects.values('tipo_material').annotate(
        total=Count('codigo_material'),
        stock_total=Sum('cantidad_existencia')
    )
    return Response(list(materiales_por_tipo))

@api_view(['GET'])
def insumos_por_categoria(request):
    """Obtener insumos agrupados por categoría"""
    insumos_por_categoria = TblStockInsumos.objects.values('categoria').annotate(
        total=Count('codigo_insumo'),
        stock_total=Sum('cantidad_existencia')
    )
    return Response(list(insumos_por_categoria))

@api_view(['POST'])
def actualizar_stock_masivo(request):
    """Actualizar stock de múltiples items"""
    try:
        updates = request.data.get('updates', [])
        
        for update in updates:
            tipo = update.get('tipo')
            codigo = update.get('codigo')
            cantidad = update.get('cantidad')
            
            if tipo == 'material':
                item = TblStockMateriales.objects.get(codigo_material=codigo)
            elif tipo == 'insumo':
                item = TblStockInsumos.objects.get(codigo_insumo=codigo)
            else:
                continue
                
            item.cantidad_existencia = cantidad
            item.save()
        
        return Response({
            'success': True,
            'message': 'Stock actualizado exitosamente'
        })
        
    except Exception as e:
        return Response({
            'error': f'Error al actualizar stock: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)

# ========================================
# ÓRDENES DE TRABAJO
# ========================================

@api_view(['GET'])
def ordenes_trabajo_pendientes(request):
    """Obtener órdenes de trabajo pendientes"""
    ordenes = TblOrdenesTrabajo.objects.filter(estado='PENDIENTE')
    serializer = OrdenTrabajoSerializer(ordenes, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def actualizar_estado_orden_trabajo(request, id_orden):
    """Actualizar estado de una orden de trabajo"""
    try:
        orden = TblOrdenesTrabajo.objects.get(id_orden=id_orden)
    except TblOrdenesTrabajo.DoesNotExist:
        return Response({
            'error': 'Orden de trabajo no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = ActualizarEstadoOrdenSerializer(data=request.data)
    
    if serializer.is_valid():
        orden.estado = serializer.validated_data['estado']
        if serializer.validated_data.get('descripcion'):
            orden.descripcion = serializer.validated_data['descripcion']
        orden.save()
        
        return Response({
            'success': True,
            'message': 'Estado de orden actualizado',
            'orden': OrdenTrabajoSerializer(orden).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def completar_orden_trabajo(request, id_orden):
    """Completar una orden de trabajo"""
    try:
        orden = TblOrdenesTrabajo.objects.get(id_orden=id_orden)
        orden.estado = 'COMPLETADA'
        orden.save()
        
        return Response({
            'success': True,
            'message': 'Orden de trabajo completada'
        })
        
    except TblOrdenesTrabajo.DoesNotExist:
        return Response({
            'error': 'Orden de trabajo no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def ordenes_trabajo_por_factura(request, numero_factura):
    """Obtener órdenes de trabajo por factura"""
    ordenes = TblOrdenesTrabajo.objects.filter(numero_factura=numero_factura)
    serializer = OrdenTrabajoSerializer(ordenes, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def ordenes_trabajo_por_empleado(request, id_empleado):
    """Obtener órdenes de trabajo por empleado"""
    ordenes = TblOrdenesTrabajo.objects.filter(id_empleado=id_empleado)
    serializer = OrdenTrabajoSerializer(ordenes, many=True)
    return Response(serializer.data)

# ========================================
# DETALLES DE FACTURA
# ========================================

@api_view(['POST'])
def crear_detalle_factura(request):
    """Crear un detalle de factura"""
    serializer = DetalleFacturaSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'message': 'Detalle de factura creado',
            'detalle': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def actualizar_detalle_factura(request, id_detalle):
    """Actualizar un detalle de factura"""
    try:
        detalle = TblDetallesFactura.objects.get(id_detalle=id_detalle)
    except TblDetallesFactura.DoesNotExist:
        return Response({
            'error': 'Detalle de factura no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = DetalleFacturaSerializer(detalle, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'message': 'Detalle de factura actualizado',
            'detalle': serializer.data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def eliminar_detalle_factura(request, id_detalle):
    """Eliminar un detalle de factura"""
    try:
        detalle = TblDetallesFactura.objects.get(id_detalle=id_detalle)
        detalle.delete()
        
        return Response({
            'success': True,
            'message': 'Detalle de factura eliminado'
        })
        
    except TblDetallesFactura.DoesNotExist:
        return Response({
            'error': 'Detalle de factura no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)

# ========================================
# VISTAS DE COMPATIBILIDAD (PARA FRONTEND EXISTENTE)
# ========================================

# backend/api/views.py

# backend/api/views.py - AGREGAR ESTA VISTA
# En views.py, actualizar la vista:

@api_view(['POST'])
def crear_factura_simple(request):
    """Crear factura simple desde el frontend"""
    try:
        print("INFO: Recibiendo datos para factura simple")
        print("Datos recibidos:", request.data)
        
        # Usar el serializer corregido
        serializer = CrearFacturaSimpleSerializer(data=request.data)
        
        if serializer.is_valid():
            factura = serializer.save()
            
            print("INFO: Factura {} creada exitosamente".format(factura.numero_factura))
            
            # Serializar la respuesta
            factura_data = {
                'numero_factura': factura.numero_factura,
                'fecha': factura.fecha.strftime('%Y-%m-%d'),
                'cliente': f"{factura.id_cliente.nombre} {factura.id_cliente.apellido}",
                'empleado': f"{factura.id_empleado.nombre} {factura.id_empleado.apellido}",
                'subtotal': float(factura.subtotal),
                'descuento': float(factura.descuento),
                'isv': float(factura.isv),
                'total': float(factura.total),
                'tipo_venta': factura.tipo_venta,
                'estado_pago': factura.estado_pago
            }
            
            return Response({
                'success': True,
                'message': 'Factura creada exitosamente',
                'numero_factura': factura.numero_factura,
                'factura': factura_data
            }, status=status.HTTP_201_CREATED)
        else:
            print("ERROR: Errores de validacion:", serializer.errors)
            return Response({
                'success': False,
                'error': 'Datos invalidos',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        print("ERROR: Exception en crear_factura_simple:", str(e))
        return Response({
            'success': False,
            'error': 'Error del servidor: {}'.format(str(e))
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
@api_view(['GET'])
def listar_facturas(request):
    """Listar facturas (compatibilidad)"""
    return obtener_facturas_completas(request)

@api_view(['GET'])
def obtener_factura_detalle(request, numero_factura):
    """Obtener detalle de factura (compatibilidad)"""
    try:
        factura = TblFacturas.objects.get(numero_factura=numero_factura)
        serializer = FacturaSerializer(factura)
        return Response(serializer.data)
    except TblFacturas.DoesNotExist:
        return Response({
            'error': 'Factura no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def crear_factura_frontend(request):
    """Crear factura desde frontend (compatibilidad)"""
    return crear_factura_completa(request)



@api_view(['GET'])
def lista_empleados(request):
    """Endpoint para listar empleados con perfil y rol"""
    try:
        empleados = TblEmpleados.objects.all().select_related('codigo_perfil')

        data = []
        for emp in empleados:
            perfil_obj = getattr(emp, 'codigo_perfil', None)

            data.append({
                'id_empleado': emp.id_empleado,
                'nombre_completo': f"{emp.nombre} {emp.apellido}",
                'correo': emp.correo,
                'telefono': emp.telefono,
                'usuario': emp.usuario,
                'salario': str(emp.salario),
                'perfil': perfil_obj.perfil if perfil_obj else 'Sin perfil',
                'rol': perfil_obj.rol if perfil_obj else 'Sin rol',
                'estado': 'Activo' if emp.correo else 'Inactivo'
            })

        # ✅ Ahora devuelve lista directa
        return Response(data, status=200)

    except Exception as e:
        print(">>> Error al obtener empleados:", str(e))
        import traceback
        print(traceback.format_exc())
        return Response({'error': str(e)}, status=500)


#LISTAR PERFILES DE EMPLEADOS
@api_view(['GET'])
def lista_perfiles(request):
    """Endpoint para listar los perfiles disponibles desde Perfiles_Empleados."""
    try:
        perfiles = TblPerfilesEmpleado.objects.all().order_by('id')
        print(f">>> Se encontraron {perfiles.count()} perfiles")

        data = [
            {
                'id': perfil.id,
                'perfil': perfil.perfil,
                'descripcion': getattr(perfil, 'descripcion', ''),
            }
            for perfil in perfiles
        ]

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        print(f">>> Error al listar perfiles: {str(e)}")
        return Response(
            {'error': f'Error al obtener perfiles: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def empleado_detalle(request, pk):
    """Obtener un empleado específico por ID"""
    try:
        empleado = TblEmpleados.objects.select_related('codigo_perfil').get(pk=pk)
        
        data = {
            'id_empleado': empleado.id_empleado,
            'nombre': empleado.nombre,
            'apellido': empleado.apellido,
            'correo': empleado.correo,
            'usuario': empleado.usuario,
            'telefono': empleado.telefono,
            'salario': str(empleado.salario),
            'perfil': empleado.codigo_perfil.perfil if empleado.codigo_perfil else 'Sin perfil',
            'rol': empleado.codigo_perfil.rol if empleado.codigo_perfil else 'Sin rol'
        }

        return Response(data, status=200)
    
    except TblEmpleados.DoesNotExist:
        return Response({'error': f'Empleado con ID {pk} no existe'}, status=404)
    
    except Exception as e:
        print(">>> Error:", str(e))
        return Response({'error': str(e)}, status=500)




@api_view(['POST'])
def crear_empleado(request):
    try:
        data = request.data
        print(">>> Recibido en backend:", data)

        # Validar campos
        required = ['nombre', 'apellido', 'usuario', 'contrasena', 'correo']
        for f in required:
            if f not in data or not data[f]:
                return Response({'error': f'Campo {f} es obligatorio'}, status=400)

        # Buscar perfil (CORREGIDO)
        perfil_id = data.get('codigo_perfil')
        try:
            perfil = PerfilesEmpleados.objects.get(codigo_perfil=perfil_id)
        except PerfilesEmpleados.DoesNotExist:
            return Response({'error': f'Perfil con código {perfil_id} no existe'}, status=400)

        # Crear empleado
        empleado = TblEmpleados.objects.create(
            codigo_perfil=perfil,
            nombre=data['nombre'],
            apellido=data['apellido'],
            usuario=data['usuario'],
            contrasena=data['contrasena'],
            telefono=data.get('telefono', ''),
            correo=data['correo'],
            salario=data.get('salario', 0)
        )

        return Response({
            'message': 'Empleado creado exitosamente',
            'empleado': {
                'id_empleado': empleado.id_empleado,
                'nombre': empleado.nombre,
                'apellido': empleado.apellido,
                'correo': empleado.correo
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(">>> Error:", str(e))
        return Response({'error': str(e)}, status=500)


@api_view(['PUT'])
def actualizar_empleado(request, pk):
    try:
        empleado = TblEmpleados.objects.get(pk=pk)
    except TblEmpleados.DoesNotExist:
        return Response({'error': 'Empleado no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data.copy()

    if 'contrasena' in data and (data['contrasena'] is None or data['contrasena'].strip() == ''):
        data.pop('contrasena')

    serializer = EmpleadoSerializer(empleado, data=data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#ELIMINAR EMPLEADO
@api_view(['DELETE'])
def eliminar_empleado(request, pk):
    try:
        empleado = TblEmpleados.objects.get(pk=pk)
        empleado.delete()
        return Response({'mensaje': 'Empleado eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
    except TblEmpleados.DoesNotExist:
        return Response({'error': 'Empleado no encontrado'}, status=status.HTTP_404_NOT_FOUND)





#PARA TRAER LOS GASTOS
@api_view(['GET'])
def gastos_mes(request):
    try:
        hoy = datetime.now()
        inicio_mes = hoy.replace(day=1)

        gastos = TblGastos.objects.filter(
            fecha_gasto__gte=inicio_mes
        ).values(
            'id_gasto',
            'fecha_gasto',
            'tipo_gasto',
            'descripcion',
            'monto',
            'proveedor',
            'id_empleado',
            'observaciones'
        )

        total_gastos = TblGastos.objects.filter(
            fecha_gasto__gte=inicio_mes
        ).aggregate(
            total=Sum('monto')
        )['total'] or 0

        return Response({
            "total_gastos_mes": total_gastos,
            "gastos": list(gastos)
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)


#RESUMEN CONTABILIDAD - REPORTES

@api_view(['GET'])
def contabilidad_resumen(request):
    """Resumen contable: ingresos, gastos y movimientos recientes."""

    hoy = datetime.now().date()
    inicio_mes = hoy.replace(day=1)

    # ========== INGRESOS DEL MES ==========
    ingresos_mes = TblFacturas.objects.filter(
        fecha__date__gte=inicio_mes
    ).aggregate(
        suma=Sum('total')
    )['suma'] or 0

    # ========== GASTOS DEL MES ==========
    gastos_mes = TblGastos.objects.filter(
        fecha_gasto__gte=inicio_mes
    ).aggregate(
        suma=Sum('monto')
    )['suma'] or 0

    # ========== MOVIMIENTOS ==========
    # ÚLTIMAS 10 FACTURAS (INGRESOS)
    ingresos_movs = TblFacturas.objects.order_by('-fecha').values(
        'numero_factura',
        'fecha',
        'total',
        'tipo_venta',
        'estado_pago',
        'metodo_pago'
    )[:10]

    # ÚLTIMOS 10 GASTOS
    gastos_movs = TblGastos.objects.order_by('-fecha_gasto').values(
        'id_gasto',
        'fecha_gasto',
        'tipo_gasto',
        'descripcion',
        'monto',
        'proveedor',
        'observaciones'
    )[:10]

    return Response({
        "ingresos_mes": ingresos_mes,
        "gastos_mes": gastos_mes,
        "utilidad_neta": ingresos_mes - gastos_mes,
        "ingresos_movimientos": list(ingresos_movs),
        "gastos_movimientos": list(gastos_movs)
    })
