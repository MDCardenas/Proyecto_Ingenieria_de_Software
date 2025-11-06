# backend/api/serializers.py
from rest_framework import serializers
from .models import Cliente, StockJoya, Venta, DetalleVenta, Empleado, Servicio

class ClienteSerializer(serializers.ModelSerializer):
    # Campo personalizado para recibir teléfono como string
    telefono_display = serializers.CharField(
        source='telefono', 
        required=False, 
        allow_blank=True,
        allow_null=True
    )
    
    class Meta:
        model = Cliente
        fields = ['id', 'nombre', 'apellido', 'direccion', 'correo', 'telefono', 'telefono_display']
        extra_kwargs = {
            'telefono': {'required': False, 'allow_null': True}
        }
    
    def validate_telefono_display(self, value):
        """Convertir teléfono de string a entero"""
        if not value:
            return None
        
        # Limpiar el teléfono
        telefono_limpio = str(value).replace('+504', '').replace(' ', '').replace('-', '').strip()
        
        if not telefono_limpio:
            return None
        
        try:
            return int(telefono_limpio)
        except ValueError:
            raise serializers.ValidationError("Formato de teléfono inválido")
    
    def to_representation(self, instance):
        """Mostrar teléfono con formato +504"""
        representation = super().to_representation(instance)
        if instance.telefono:
            representation['telefono'] = f"+504 {instance.telefono}"
        return representation

class StockJoyaSerializer(serializers.ModelSerializer):
    imagen_base64 = serializers.SerializerMethodField()
    
    class Meta:
        model = StockJoya
        fields = ['id', 'nombre', 'tipo', 'peso', 'material', 
                  'descripcion', 'precio_venta', 'imagen', 'imagen_base64']
    
    def get_imagen_base64(self, obj):
        if obj.imagen:
            import base64
            return base64.b64encode(obj.imagen).decode('utf-8')
        return None


class ServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        fields = ['id', 'nombre', 'descripcion']


class DetalleVentaSerializer(serializers.ModelSerializer):
    joya_nombre = serializers.CharField(source='joya.nombre', read_only=True)
    servicio_nombre = serializers.CharField(source='servicio.nombre', read_only=True)
    subtotal_calculado = serializers.SerializerMethodField()

    class Meta:
        model = DetalleVenta
        fields = ['id', 'joya', 'joya_nombre', 'servicio', 'servicio_nombre',
                  'cantidad', 'precio_unitario', 'subtotal_calculado']
    
    def get_subtotal_calculado(self, obj):
        if obj.cantidad and obj.precio_unitario:
            return obj.cantidad * obj.precio_unitario
        return 0


class VentaSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    cliente_apellido = serializers.CharField(source='cliente.apellido', read_only=True)
    empleado_nombre = serializers.CharField(source='empleado.nombre', read_only=True)
    empleado_apellido = serializers.CharField(source='empleado.apellido', read_only=True)
    detalles = DetalleVentaSerializer(source='detalleventa_set', many=True, read_only=True)
    estado_pago_texto = serializers.SerializerMethodField()

    class Meta:
        model = Venta
        fields = ['id', 'cliente', 'cliente_nombre', 'cliente_apellido',
                  'empleado', 'empleado_nombre', 'empleado_apellido', 
                  'fecha', 'subtotal', 'isv', 'total', 'estado_pago', 
                  'estado_pago_texto', 'abono', 'detalles']
    
    def get_estado_pago_texto(self, obj):
        if obj.estado_pago == 1:
            return "Pagado"
        elif obj.estado_pago == 0:
            return "Pendiente"
        return "Desconocido"


class VentaCreateSerializer(serializers.Serializer):
    cliente_id = serializers.IntegerField()
    empleado_id = serializers.IntegerField()
    fecha = serializers.DateField()
    estado_pago = serializers.IntegerField(default=0)
    abono = serializers.DecimalField(max_digits=18, decimal_places=2, default=0)
    detalles = serializers.ListField(child=serializers.DictField())

    def create(self, validated_data):
        from decimal import Decimal
        from django.db import transaction
        
        detalles_data = validated_data.pop('detalles')
        
        with transaction.atomic():
            ultima_venta = Venta.objects.order_by('-id').first()
            nuevo_id = 1 if not ultima_venta else ultima_venta.id + 1
            
            venta = Venta.objects.create(
                id=nuevo_id,
                cliente_id=validated_data['cliente_id'],
                empleado_id=validated_data['empleado_id'],
                fecha=validated_data['fecha'],
                estado_pago=validated_data['estado_pago'],
                abono=validated_data.get('abono', Decimal('0.00')),
                subtotal=Decimal('0.00'),
                isv=Decimal('0.00'),
                total=Decimal('0.00')
            )
            
            ultimo_detalle = DetalleVenta.objects.order_by('-id').first()
            nuevo_id_detalle = 1 if not ultimo_detalle else ultimo_detalle.id + 1
            subtotal = Decimal('0.00')
            
            for detalle_data in detalles_data:
                cantidad = detalle_data.get('cantidad', 1)
                precio_unitario = Decimal(str(detalle_data.get('precio_unitario', 0)))
                
                DetalleVenta.objects.create(
                    id=nuevo_id_detalle,
                    venta=venta,
                    joya_id=detalle_data.get('joya_id'),
                    servicio_id=detalle_data.get('servicio_id'),
                    cantidad=cantidad,
                    precio_unitario=precio_unitario
                )
                
                subtotal += cantidad * precio_unitario
                nuevo_id_detalle += 1
            
            venta.subtotal = subtotal
            venta.isv = subtotal * Decimal('0.15')
            venta.total = venta.subtotal + venta.isv
            venta.save()
            
            return venta
         






# Serializer EXISTENTE - para GET (lectura)
class EmpleadoSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.SerializerMethodField()
    rol = serializers.SerializerMethodField()
    email = serializers.CharField(source='correo')
    estado = serializers.SerializerMethodField()
    ultimo_acceso = serializers.SerializerMethodField()

    class Meta:
        model = Empleado
        fields = [
            'id', 
            'nombre_completo', 
            'email', 
            'rol', 
            'estado', 
            'ultimo_acceso',
            'telefono',
            'salario',
            'usuario'
        ]

    def get_nombre_completo(self, obj):
        return f"{obj.nombre} {obj.apellido}"

    def get_rol(self, obj):
        if hasattr(obj, 'perfil') and obj.perfil:
            return obj.perfil.rol
        return "Sin rol"

    def get_estado(self, obj):
        if obj.correo and obj.telefono:
            return "Active"
        return "Inactive"

    def get_ultimo_acceso(self, obj):
        return "Hoy"

# Serializer NUEVO - para POST (creación)
class EmpleadoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = ['codigo_perfil', 'nombre', 'apellido', 'usuario', 'contrasena', 'telefono', 'correo', 'salario']
        extra_kwargs = {
            'contrasena': {'write_only': True}
        }
    
    def validate_usuario(self, value):
        if Empleado.objects.filter(usuario=value).exists():
            raise serializers.ValidationError("Este usuario ya existe")
        return value
    
    def validate_correo(self, value):
        if Empleado.objects.filter(correo=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado")
        return value