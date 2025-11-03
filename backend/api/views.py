from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
from rest_framework import viewsets
from api.models import Cliente, StockJoya, Venta, DetalleVenta, Empleado, Servicio
from .serializers import (
    ClienteSerializer, StockJoyaSerializer, VentaSerializer, 
    VentaCreateSerializer, ServicioSerializer
)




# =========================
# Dashboard de Ventas
# =========================
@api_view(['GET'])
def ventas_dashboard(request):
    """Obtener estadísticas del dashboard de ventas"""
    hoy = timezone.now().date()
    
    # Ventas del día (estado_pago = 1 significa pagado)
    ventas_hoy = Venta.objects.filter(
        fecha=hoy,
        estado_pago=1
    ).aggregate(
        total=Sum('total'),
        cantidad=Count('id')
    )
    
    # Ticket promedio
    total_ventas = ventas_hoy['total'] or Decimal('0.00')
    cantidad_ventas = ventas_hoy['cantidad'] or 0
    ticket_promedio = total_ventas / cantidad_ventas if cantidad_ventas > 0 else Decimal('0.00')
    
    return Response({
        'ventas_hoy': float(total_ventas),
        'transacciones': cantidad_ventas,
        'ticket_promedio': float(ticket_promedio)
    })


# =========================
# Clientes
# =========================
@api_view(['POST'])
def clientes_create(request):
    """Crear nuevo cliente"""
    try:
        print("=== CREAR CLIENTE ===")
        print("Datos recibidos:", request.data)
        
        # Obtener el último ID
        ultimo_cliente = Cliente.objects.order_by('-id').first()
        nuevo_id = 1 if not ultimo_cliente else ultimo_cliente.id + 1
        
        # Preparar datos
        data = request.data.copy()
        data['id'] = nuevo_id
        
        # Limpiar el teléfono
        if 'telefono' in data and data['telefono']:
            telefono = str(data['telefono']).replace('+504', '').replace(' ', '').replace('-', '').strip()
            data['telefono'] = int(telefono) if telefono.isdigit() and telefono else None
        else:
            data['telefono'] = None
        
        print("Datos procesados:", data)
        
        serializer = ClienteSerializer(data=data)
        if serializer.is_valid():
            cliente = serializer.save()
            print("Cliente creado exitosamente:", cliente.id)
            return Response(serializer.data, status=201)
        
        print("Errores de validación:", serializer.errors)
        return Response({
            'error': 'Error de validación',
            'detalles': serializer.errors
        }, status=400)
        
    except Exception as e:
        import traceback
        print(f"Error al crear cliente: {str(e)}")
        print(traceback.format_exc())
        return Response({
            'error': f'Error al crear cliente: {str(e)}'
        }, status=500)


@api_view(['PUT', 'DELETE'])
def clientes_detail(request, pk):
    """Actualizar o eliminar un cliente"""
    try:
        cliente = Cliente.objects.get(pk=pk)
    except Cliente.DoesNotExist:
        return Response({'error': 'Cliente no encontrado'}, status=404)

    if request.method == 'PUT':
        try:
            print("=== ACTUALIZAR CLIENTE ===")
            print("Datos recibidos:", request.data)
            
            data = request.data.copy()
            
            # Limpiar el teléfono
            if 'telefono' in data and data['telefono']:
                telefono = str(data['telefono']).replace('+504', '').replace(' ', '').replace('-', '').strip()
                data['telefono'] = int(telefono) if telefono.isdigit() and telefono else None
            else:
                data['telefono'] = None
            
            # No enviar el ID en la actualización
            if 'id' in data:
                del data['id']
            
            print("Datos procesados:", data)
            
            serializer = ClienteSerializer(cliente, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                print("Cliente actualizado exitosamente")
                return Response(serializer.data)
            
            print("Errores de validación:", serializer.errors)
            return Response({
                'error': 'Error de validación',
                'detalles': serializer.errors
            }, status=400)
            
        except Exception as e:
            import traceback
            print(f"Error al actualizar cliente: {str(e)}")
            print(traceback.format_exc())
            return Response({
                'error': f'Error al actualizar cliente: {str(e)}'
            }, status=500)

    elif request.method == 'DELETE':
        try:
            cliente.delete()
            return Response({'message': 'Cliente eliminado exitosamente'}, status=204)
        except Exception as e:
            print(f"Error al eliminar cliente: {str(e)}")
            return Response({
                'error': f'Error al eliminar cliente: {str(e)}'
            }, status=500)
            
            
# =========================
# Productos (Joyas)
# =========================
@api_view(['GET'])
def joyas_list(request):
    """Listar todas las joyas"""
    joyas = StockJoya.objects.all().order_by('-id')
    serializer = StockJoyaSerializer(joyas, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def joyas_buscar(request):
    """Buscar joyas por nombre o tipo"""
    query = request.GET.get('q', '')
    
    if not query:
        return Response([])
    
    joyas = StockJoya.objects.filter(
        Q(nombre__icontains=query) |
        Q(tipo__icontains=query) |
        Q(material__icontains=query)
    )[:10]
    
    serializer = StockJoyaSerializer(joyas, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def joyas_detalle(request, pk):
    """Obtener detalle de una joya"""
    try:
        joya = StockJoya.objects.get(pk=pk)
        serializer = StockJoyaSerializer(joya)
        return Response(serializer.data)
    except StockJoya.DoesNotExist:
        return Response({'error': 'Joya no encontrada'}, status=404)


# =========================
# Servicios
# =========================
@api_view(['GET'])
def servicios_list(request):
    """Listar todos los servicios"""
    servicios = Servicio.objects.all()
    serializer = ServicioSerializer(servicios, many=True)
    return Response(serializer.data)


# =========================
# Ventas
# =========================
@api_view(['GET'])
def ventas_list(request):
    """Listar todas las ventas"""
    # Filtros opcionales
    fecha_inicio = request.GET.get('fecha_inicio')
    fecha_fin = request.GET.get('fecha_fin')
    estado_pago = request.GET.get('estado_pago')
    
    ventas = Venta.objects.all()
    
    if fecha_inicio:
        ventas = ventas.filter(fecha__gte=fecha_inicio)
    if fecha_fin:
        ventas = ventas.filter(fecha__lte=fecha_fin)
    if estado_pago is not None:
        ventas = ventas.filter(estado_pago=estado_pago)
    
    ventas = ventas.order_by('-fecha', '-id')[:50]  # Últimas 50 ventas
    serializer = VentaSerializer(ventas, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def ventas_detalle(request, pk):
    """Obtener detalle de una venta"""
    try:
        venta = Venta.objects.get(pk=pk)
        serializer = VentaSerializer(venta)
        return Response(serializer.data)
    except Venta.DoesNotExist:
        return Response({'error': 'Venta no encontrada'}, status=404)


@api_view(['POST'])
def ventas_create(request):
    """Crear nueva venta"""
    serializer = VentaCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        venta = serializer.save()
        venta_serializer = VentaSerializer(venta)
        return Response(venta_serializer.data, status=201)
    
    return Response(serializer.errors, status=400)


@api_view(['PUT'])
def ventas_update(request, pk):
    """Actualizar una venta existente"""
    try:
        venta = Venta.objects.get(pk=pk)
    except Venta.DoesNotExist:
        return Response({'error': 'Venta no encontrada'}, status=404)
    
    # Actualizar campos básicos
    venta.estado_pago = request.data.get('estado_pago', venta.estado_pago)
    venta.abono = request.data.get('abono', venta.abono)
    venta.save()
    
    serializer = VentaSerializer(venta)
    return Response(serializer.data)


@api_view(['DELETE'])
def ventas_delete(request, pk):
    """Eliminar una venta (solo si estado_pago = 0)"""
    try:
        venta = Venta.objects.get(pk=pk)
        
        if venta.estado_pago == 1:
            return Response(
                {'error': 'No se puede eliminar una venta pagada'},
                status=400
            )
        
        venta.delete()
        return Response({'message': 'Venta eliminada exitosamente'})
    except Venta.DoesNotExist:
        return Response({'error': 'Venta no encontrada'}, status=404)


# =========================
# Reportes
# =========================
@api_view(['GET'])
def ventas_reporte_periodo(request):
    """Reporte de ventas por período"""
    fecha_inicio = request.GET.get('fecha_inicio')
    fecha_fin = request.GET.get('fecha_fin')
    
    if not fecha_inicio or not fecha_fin:
        return Response(
            {'error': 'Se requieren fecha_inicio y fecha_fin'},
            status=400
        )
    
    ventas = Venta.objects.filter(
        fecha__gte=fecha_inicio,
        fecha__lte=fecha_fin,
        estado_pago=1  # Solo ventas pagadas
    ).aggregate(
        total_ventas=Sum('total'),
        subtotal_ventas=Sum('subtotal'),
        isv_total=Sum('isv'),
        cantidad_ventas=Count('id'),
        ticket_promedio=Avg('total')
    )
    
    return Response({
        'fecha_inicio': fecha_inicio,
        'fecha_fin': fecha_fin,
        'total_ventas': float(ventas['total_ventas'] or 0),
        'subtotal_ventas': float(ventas['subtotal_ventas'] or 0),
        'isv_total': float(ventas['isv_total'] or 0),
        'cantidad_ventas': ventas['cantidad_ventas'] or 0,
        'ticket_promedio': float(ventas['ticket_promedio'] or 0)
    })


@api_view(['GET'])
def ventas_top_productos(request):
    """Productos más vendidos"""
    dias = int(request.GET.get('dias', 30))
    fecha_inicio = timezone.now().date() - timedelta(days=dias)
    
    # Productos más vendidos
    productos_top = DetalleVenta.objects.filter(
        venta__fecha__gte=fecha_inicio,
        venta__estado_pago=1,
        joya__isnull=False
    ).values(
        'joya__id',
        'joya__nombre',
        'joya__tipo'
    ).annotate(
        total_vendido=Sum('cantidad'),
        ingreso_total=Sum('precio_unitario')
    ).order_by('-total_vendido')[:10]
    
    return Response(list(productos_top))


@api_view(['GET'])
def dashboard_general(request):
    """Dashboard general con múltiples métricas"""
    hoy = timezone.now().date()
    mes_actual = timezone.now().month
    año_actual = timezone.now().year
    
    # Ventas del día
    ventas_hoy = Venta.objects.filter(
        fecha=hoy,
        estado_pago=1
    ).aggregate(
        total=Sum('total'),
        cantidad=Count('id')
    )
    
    # Ventas del mes
    ventas_mes = Venta.objects.filter(
        fecha__month=mes_actual,
        fecha__year=año_actual,
        estado_pago=1
    ).aggregate(
        total=Sum('total'),
        cantidad=Count('id')
    )
    
    # Ventas pendientes (estado_pago = 0)
    ventas_pendientes = Venta.objects.filter(
        estado_pago=0
    ).aggregate(
        total=Sum('total'),
        cantidad=Count('id')
    )
    
    # Total de clientes
    total_clientes = Cliente.objects.count()
    
    # Total de productos
    total_joyas = StockJoya.objects.count()
    
    return Response({
        'ventas_hoy': {
            'total': float(ventas_hoy['total'] or 0),
            'cantidad': ventas_hoy['cantidad'] or 0
        },
        'ventas_mes': {
            'total': float(ventas_mes['total'] or 0),
            'cantidad': ventas_mes['cantidad'] or 0
        },
        'ventas_pendientes': {
            'total': float(ventas_pendientes['total'] or 0),
            'cantidad': ventas_pendientes['cantidad'] or 0
        },
        'total_clientes': total_clientes,
        'total_joyas': total_joyas
    })

# backend/api/views.py
# ===== MANTÉN TUS VISTAS EXISTENTES (hello, db_test, login) =====
# ===== AGREGAR ESTAS IMPORTACIONES AL INICIO =====

from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from .models import Cliente, StockJoya, Venta, DetalleVenta, Servicio
from .serializers import (
    ClienteSerializer, StockJoyaSerializer, VentaSerializer, 
    VentaCreateSerializer, ServicioSerializer
)

# ===== AGREGAR ESTAS NUEVAS VISTAS AL FINAL DEL ARCHIVO =====

@api_view(['GET'])
def ventas_dashboard(request):
    """Obtener estadísticas del dashboard de ventas"""
    hoy = timezone.now().date()
    
    ventas_hoy = Venta.objects.filter(
        fecha=hoy,
        estado_pago=1
    ).aggregate(
        total=Sum('total'),
        cantidad=Count('id')
    )
    
    total_ventas = ventas_hoy['total'] or Decimal('0.00')
    cantidad_ventas = ventas_hoy['cantidad'] or 0
    ticket_promedio = total_ventas / cantidad_ventas if cantidad_ventas > 0 else Decimal('0.00')
    
    return Response({
        'ventas_hoy': float(total_ventas),
        'transacciones': cantidad_ventas,
        'ticket_promedio': float(ticket_promedio)
    })


@api_view(['GET'])
def clientes_list(request):
    """Listar todos los clientes"""
    clientes = Cliente.objects.all().order_by('-id')[:50]
    serializer = ClienteSerializer(clientes, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def clientes_create(request):
    """Crear nuevo cliente"""
    ultimo_cliente = Cliente.objects.order_by('-id').first()
    nuevo_id = 1 if not ultimo_cliente else ultimo_cliente.id + 1
    
    data = request.data.copy()
    data['id'] = nuevo_id
    
    serializer = ClienteSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
def clientes_buscar(request):
    """Buscar cliente por nombre, apellido o teléfono"""
    query = request.GET.get('q', '')
    
    if not query:
        return Response([])
    
    clientes = Cliente.objects.filter(
        Q(nombre__icontains=query) |
        Q(apellido__icontains=query) |
        Q(telefono__icontains=query)
    )[:10]
    
    serializer = ClienteSerializer(clientes, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def joyas_list(request):
    """Listar todas las joyas"""
    joyas = StockJoya.objects.all().order_by('-id')
    serializer = StockJoyaSerializer(joyas, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def joyas_buscar(request):
    """Buscar joyas por nombre o tipo"""
    query = request.GET.get('q', '')
    
    if not query:
        return Response([])
    
    joyas = StockJoya.objects.filter(
        Q(nombre__icontains=query) |
        Q(tipo__icontains=query) |
        Q(material__icontains=query)
    )[:10]
    
    serializer = StockJoyaSerializer(joyas, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def joyas_detalle(request, pk):
    """Obtener detalle de una joya"""
    try:
        joya = StockJoya.objects.get(pk=pk)
        serializer = StockJoyaSerializer(joya)
        return Response(serializer.data)
    except StockJoya.DoesNotExist:
        return Response({'error': 'Joya no encontrada'}, status=404)


@api_view(['GET'])
def servicios_list(request):
    """Listar todos los servicios"""
    servicios = Servicio.objects.all()
    serializer = ServicioSerializer(servicios, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def ventas_list(request):
    """Listar todas las ventas"""
    fecha_inicio = request.GET.get('fecha_inicio')
    fecha_fin = request.GET.get('fecha_fin')
    estado_pago = request.GET.get('estado_pago')
    
    ventas = Venta.objects.all()
    
    if fecha_inicio:
        ventas = ventas.filter(fecha__gte=fecha_inicio)
    if fecha_fin:
        ventas = ventas.filter(fecha__lte=fecha_fin)
    if estado_pago is not None:
        ventas = ventas.filter(estado_pago=estado_pago)
    
    ventas = ventas.order_by('-fecha', '-id')[:50]
    serializer = VentaSerializer(ventas, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def ventas_detalle(request, pk):
    """Obtener detalle de una venta"""
    try:
        venta = Venta.objects.get(pk=pk)
        serializer = VentaSerializer(venta)
        return Response(serializer.data)
    except Venta.DoesNotExist:
        return Response({'error': 'Venta no encontrada'}, status=404)


@api_view(['POST'])
def ventas_create(request):
    """Crear nueva venta"""
    serializer = VentaCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        venta = serializer.save()
        venta_serializer = VentaSerializer(venta)
        return Response(venta_serializer.data, status=201)
    
    return Response(serializer.errors, status=400)


@api_view(['PUT'])
def ventas_update(request, pk):
    """Actualizar una venta existente"""
    try:
        venta = Venta.objects.get(pk=pk)
    except Venta.DoesNotExist:
        return Response({'error': 'Venta no encontrada'}, status=404)
    
    venta.estado_pago = request.data.get('estado_pago', venta.estado_pago)
    venta.abono = request.data.get('abono', venta.abono)
    venta.save()
    
    serializer = VentaSerializer(venta)
    return Response(serializer.data)


@api_view(['DELETE'])
def ventas_delete(request, pk):
    """Eliminar una venta (solo si estado_pago = 0)"""
    try:
        venta = Venta.objects.get(pk=pk)
        
        if venta.estado_pago == 1:
            return Response(
                {'error': 'No se puede eliminar una venta pagada'},
                status=400
            )
        
        venta.delete()
        return Response({'message': 'Venta eliminada exitosamente'})
    except Venta.DoesNotExist:
        return Response({'error': 'Venta no encontrada'}, status=404)


@api_view(['GET'])
def ventas_reporte_periodo(request):
    """Reporte de ventas por período"""
    fecha_inicio = request.GET.get('fecha_inicio')
    fecha_fin = request.GET.get('fecha_fin')
    
    if not fecha_inicio or not fecha_fin:
        return Response(
            {'error': 'Se requieren fecha_inicio y fecha_fin'},
            status=400
        )
    
    ventas = Venta.objects.filter(
        fecha__gte=fecha_inicio,
        fecha__lte=fecha_fin,
        estado_pago=1
    ).aggregate(
        total_ventas=Sum('total'),
        subtotal_ventas=Sum('subtotal'),
        isv_total=Sum('isv'),
        cantidad_ventas=Count('id'),
        ticket_promedio=Avg('total')
    )
    
    return Response({
        'fecha_inicio': fecha_inicio,
        'fecha_fin': fecha_fin,
        'total_ventas': float(ventas['total_ventas'] or 0),
        'subtotal_ventas': float(ventas['subtotal_ventas'] or 0),
        'isv_total': float(ventas['isv_total'] or 0),
        'cantidad_ventas': ventas['cantidad_ventas'] or 0,
        'ticket_promedio': float(ventas['ticket_promedio'] or 0)
    })


@api_view(['GET'])
def ventas_top_productos(request):
    """Productos más vendidos"""
    dias = int(request.GET.get('dias', 30))
    fecha_inicio = timezone.now().date() - timedelta(days=dias)
    
    productos_top = DetalleVenta.objects.filter(
        venta__fecha__gte=fecha_inicio,
        venta__estado_pago=1,
        joya__isnull=False
    ).values(
        'joya__id',
        'joya__nombre',
        'joya__tipo'
    ).annotate(
        total_vendido=Sum('cantidad'),
        ingreso_total=Sum('precio_unitario')
    ).order_by('-total_vendido')[:10]
    
    return Response(list(productos_top))


@api_view(['GET'])
def dashboard_general(request):
    """Dashboard general con múltiples métricas"""
    hoy = timezone.now().date()
    mes_actual = timezone.now().month
    año_actual = timezone.now().year
    
    ventas_hoy = Venta.objects.filter(
        fecha=hoy,
        estado_pago=1
    ).aggregate(
        total=Sum('total'),
        cantidad=Count('id')
    )
    
    ventas_mes = Venta.objects.filter(
        fecha__month=mes_actual,
        fecha__year=año_actual,
        estado_pago=1
    ).aggregate(
        total=Sum('total'),
        cantidad=Count('id')
    )
    
    ventas_pendientes = Venta.objects.filter(
        estado_pago=0
    ).aggregate(
        total=Sum('total'),
        cantidad=Count('id')
    )
    
    total_clientes = Cliente.objects.count()
    total_joyas = StockJoya.objects.count()
    
    return Response({
        'ventas_hoy': {
            'total': float(ventas_hoy['total'] or 0),
            'cantidad': ventas_hoy['cantidad'] or 0
        },
        'ventas_mes': {
            'total': float(ventas_mes['total'] or 0),
            'cantidad': ventas_mes['cantidad'] or 0
        },
        'ventas_pendientes': {
            'total': float(ventas_pendientes['total'] or 0),
            'cantidad': ventas_pendientes['cantidad'] or 0
        },
        'total_clientes': total_clientes,
        'total_joyas': total_joyas
    })
    
    # =========================
# Funciones básicas del sistema (para compatibilidad)
# =========================
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@api_view(['GET'])
def db_test(request):
    """
    Endpoint para probar la conexión a la base de datos
    """
    try:
        # Probar conexión a la base de datos contando algunos registros
        clientes_count = Cliente.objects.count()
        ventas_count = Venta.objects.count()
        joyas_count = StockJoya.objects.count()
        
        return Response({
            "status": "success", 
            "message": "Database connection OK",
            "data": {
                "clientes": clientes_count,
                "ventas": ventas_count,
                "joyas": joyas_count
            }
        })
    except Exception as e:
        return Response({
            "status": "error", 
            "message": f"Database error: {str(e)}"
        }, status=500)

@api_view(['POST'])
def login(request):
    """
    Endpoint para autenticación de usuarios - consulta base de datos real
    """
    print("=== DATOS RECIBIDOS EN LOGIN ===")
    print("Request data:", request.data)

    if request.method == 'POST':
        try:
            data = request.data
            # Aceptar múltiples nombres de campos
            usuario_input = data.get('usuario', '').strip()
            correo_input = data.get('correo', '').strip()
            username_input = data.get('username', '').strip()
            email_input = data.get('email', '').strip()
            contrasena_input = data.get('contrasena', '').strip()
            password_input = data.get('password', '').strip()

            # Determinar el identificador y contraseña
            identificador = usuario_input or correo_input or username_input or email_input
            contrasena = contrasena_input or password_input

            print(f"Identificador recibido: '{identificador}'")
            print(f"Contraseña recibida: '{contrasena}'")

            # Validaciones básicas
            if not identificador or not contrasena:
                print("Error: Identificador o contraseña vacíos")
                return Response({
                    "success": False,
                    "message": "Usuario/Email y contraseña son requeridos"
                }, status=400)

            # Buscar empleado en la base de datos
            try:
                # Buscar por usuario o correo
                empleado = Empleado.objects.get(
                    Q(usuario=identificador) | Q(correo=identificador)
                )
                
                # Verificar contraseña (en texto plano según tu modelo)
                if empleado.contrasena == contrasena:
                    # Obtener el perfil para el rol
                    perfil = empleado.perfil
                    
                    # Preparar datos del empleado para la respuesta
                    empleado_data = {
                        "id_empleado": empleado.id,
                        "nombre": empleado.nombre,
                        "apellido": empleado.apellido,
                        "usuario": empleado.usuario,
                        "correo": empleado.correo,
                        "telefono": empleado.telefono,
                        "rol": perfil.rol if perfil else "empleado",
                        "perfil": perfil.perfil if perfil else "Empleado"
                    }
                    
                    print(f"Login exitoso para: {empleado.nombre} {empleado.apellido}")
                    return Response({
                        "success": True,
                        "message": "Login exitoso",
                        "empleado": empleado_data
                    })
                else:
                    print("Error: Contraseña incorrecta")
                    return Response({
                        "success": False,
                        "message": "Usuario/Email o contraseña incorrectos"
                    }, status=401)
                    
            except Empleado.DoesNotExist:
                print("Error: Empleado no encontrado")
                return Response({
                    "success": False,
                    "message": "Usuario/Email o contraseña incorrectos"
                }, status=401)
                
        except Exception as e:
            print(f"Error en login: {str(e)}")
            return Response({
                "success": False,
                "message": f"Error interno del servidor: {str(e)}"
            }, status=500)
    
    return Response({
        "success": False,
        "message": "Método no permitido. Use POST."
    }, status=405)

@api_view(['GET'])
def hello(request):
    """
    Endpoint de prueba simple
    """
    return Response({
        "message": "¡Hola desde JoyaSystem API!",
        "status": "success",
        "timestamp": timezone.now().isoformat()
    })
    
## backend/api/views.py


