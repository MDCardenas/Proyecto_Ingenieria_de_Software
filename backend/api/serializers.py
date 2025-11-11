# backend/api/serializers.py
from rest_framework import serializers
from django.db import transaction
from decimal import Decimal
from datetime import timezone
from .models import (
    TblClientes, TblDetallesFactura, TblEmpleados, TblStockJoyas,
    TblServicios, TblFacturas, TblCotizaciones, TblStockInsumos, 
    TblStockMateriales, TblProvedores, PerfilesEmpleados,
    TblOrdenesTrabajo
)

class ClienteSerializer(serializers.ModelSerializer):
    telefono_display = serializers.CharField(
        source='telefono', 
        required=False, 
        allow_blank=True,
        allow_null=True,
        write_only=True
    )
    
    class Meta:
        model = TblClientes
        fields = [
            'id_cliente', 
            'numero_identidad', 
            'rtn', 
            'nombre', 
            'apellido', 
            'direccion', 
            'correo', 
            'telefono', 
            'telefono_display'
        ]
        extra_kwargs = {
            'telefono': {'required': False, 'allow_null': True},
            'rtn': {'required': False, 'allow_null': True, 'allow_blank': True}
        }
    
    def validate_numero_identidad(self, value):
        if not value:
            raise serializers.ValidationError("El número de identidad es obligatorio")
        
        numero_limpio = value.replace('-', '').strip()
        
        if len(numero_limpio) != 13:
            raise serializers.ValidationError("El número de identidad debe tener 13 dígitos")
        
        if not numero_limpio.isdigit():
            raise serializers.ValidationError("El número de identidad solo puede contener dígitos")
        
        return numero_limpio
    
    def validate_rtn(self, value):
        if not value:
            return None
        
        rtn_limpio = value.replace('-', '').strip()
        
        if len(rtn_limpio) != 14:
            raise serializers.ValidationError("El RTN debe tener 14 dígitos")
        
        if not rtn_limpio.isdigit():
            raise serializers.ValidationError("El RTN solo puede contener dígitos")
        
        return rtn_limpio
    
    def validate_telefono_display(self, value):
        if not value:
            return None
        
        telefono_limpio = str(value).replace('+504', '').replace(' ', '').replace('-', '').strip()
        
        if not telefono_limpio:
            return None
        
        try:
            return int(telefono_limpio)
        except ValueError:
            raise serializers.ValidationError("Formato de teléfono inválido")
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        if instance.numero_identidad and len(instance.numero_identidad) == 13:
            representation['numero_identidad'] = f"{instance.numero_identidad[:4]}-{instance.numero_identidad[4:8]}-{instance.numero_identidad[8:]}"

        if instance.rtn and len(instance.rtn) == 14:
            representation['rtn'] = f"{instance.rtn[:4]}-{instance.rtn[4:8]}-{instance.rtn[8:13]}-{instance.rtn[13]}"

        if instance.telefono:
            telefono_str = str(instance.telefono).zfill(8)
            representation['telefono'] = f"{telefono_str[:4]}-{telefono_str[4:]}"
        
        return representation

class EmpleadoSerializer(serializers.ModelSerializer):
    perfil_nombre = serializers.CharField(source='codigo_perfil.perfil', read_only=True)
    
    class Meta:
        model = TblEmpleados
        fields = [
            'id_empleado', 'codigo_perfil', 'perfil_nombre', 'nombre', 
            'apellido', 'usuario', 'telefono', 'correo', 'salario'
        ]
        extra_kwargs = {
            'contrasena': {'write_only': True}
        }

class StockJoyaSerializer(serializers.ModelSerializer):
    imagen_base64 = serializers.SerializerMethodField()
    
    class Meta:
        model = TblStockJoyas
        fields = [
            'codigo_joya', 'nombre', 'imagen', 'imagen_base64', 'tipo', 
            'peso', 'material', 'descripcion', 'precio_venta'
        ]
    
    def get_imagen_base64(self, obj):
        if obj.imagen:
            import base64
            return base64.b64encode(obj.imagen).decode('utf-8')
        return None

class ServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = TblServicios
        fields = ['codigo_servicio', 'nombre_servicio', 'descripcion', 'precio_base']

class DetalleFacturaSerializer(serializers.ModelSerializer):
    subtotal_calculado = serializers.SerializerMethodField()
    total_calculado = serializers.SerializerMethodField()
    
    # Campos para mostrar información relacionada
    joya_nombre = serializers.SerializerMethodField()
    servicio_nombre = serializers.SerializerMethodField()
    material_nombre = serializers.SerializerMethodField()
    insumo_nombre = serializers.SerializerMethodField()

    class Meta:
        model = TblDetallesFactura
        fields = [
            'id_detalle', 'numero_factura', 'tipo_item', 'codigo_item',
            'descripcion', 'cantidad', 'precio_unitario', 'descuento',
            'subtotal_calculado', 'total_calculado',
            'joya_nombre', 'servicio_nombre', 'material_nombre', 'insumo_nombre'
        ]

    def get_subtotal_calculado(self, obj):
        subtotal = obj.cantidad * obj.precio_unitario
        return float(subtotal)

    def get_total_calculado(self, obj):
        subtotal = obj.cantidad * obj.precio_unitario
        descuento = obj.descuento or 0
        total = subtotal - descuento
        return float(total)
    
    def get_joya_nombre(self, obj):
        if obj.tipo_item == 'JOYA':
            try:
                joya = TblStockJoyas.objects.get(codigo_joya=obj.codigo_item)
                return joya.nombre
            except TblStockJoyas.DoesNotExist:
                return "Joya no encontrada"
        return None
    
    def get_servicio_nombre(self, obj):
        if obj.tipo_item == 'SERVICIO':
            try:
                servicio = TblServicios.objects.get(codigo_servicio=obj.codigo_item)
                return servicio.nombre_servicio
            except TblServicios.DoesNotExist:
                return "Servicio no encontrado"
        return None
    
    def get_material_nombre(self, obj):
        if obj.tipo_item == 'MATERIAL':
            try:
                material = TblStockMateriales.objects.get(codigo_material=obj.codigo_item)
                return material.nombre
            except TblStockMateriales.DoesNotExist:
                return "Material no encontrado"
        return None
    
    def get_insumo_nombre(self, obj):
        if obj.tipo_item == 'INSUMO':
            try:
                insumo = TblStockInsumos.objects.get(codigo_insumo=obj.codigo_item)
                return insumo.nombre
            except TblStockInsumos.DoesNotExist:
                return "Insumo no encontrado"
        return None

class FacturaSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.SerializerMethodField()
    cliente_identidad = serializers.CharField(source='id_cliente.numero_identidad', read_only=True)
    empleado_nombre = serializers.SerializerMethodField()
    detalles = DetalleFacturaSerializer(many=True, read_only=True, source='tbldetallesfactura_set')
    tipo_servicio_display = serializers.CharField(source='get_tipo_venta_display', read_only=True)
    estado_pago_display = serializers.CharField(source='get_estado_pago_display', read_only=True)

    class Meta:
        model = TblFacturas
        fields = [
            'numero_factura', 'id_cliente', 'cliente_nombre', 'cliente_identidad',
            'id_empleado', 'empleado_nombre', 'fecha', 'direccion', 'telefono', 'rtn',
            'subtotal', 'descuento', 'isv', 'total', 'tipo_venta', 'tipo_servicio_display',
            'observaciones', 'estado_pago', 'estado_pago_display', 'fecha_pago', 'metodo_pago',
            'detalles'
        ]

    def get_cliente_nombre(self, obj):
        return f"{obj.id_cliente.nombre} {obj.id_cliente.apellido}"

    def get_empleado_nombre(self, obj):
        return f"{obj.id_empleado.nombre} {obj.id_empleado.apellido}"

class FacturaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TblFacturas
        fields = [
            'id_cliente', 'id_empleado', 'fecha', 'direccion', 'telefono', 'rtn',
            'subtotal', 'descuento', 'isv', 'total', 'tipo_venta', 'observaciones'
        ]

class FacturaEstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TblFacturas
        fields = ['estado_pago', 'fecha_pago', 'metodo_pago', 'observaciones']

class CotizacionSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.SerializerMethodField()
    empleado_nombre = serializers.SerializerMethodField()
    tipo_servicio_display = serializers.CharField(source='get_tipo_servicio_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    # Campos para mostrar información completa de relaciones
    cliente_info = ClienteSerializer(source='id_cliente', read_only=True)
    empleado_info = EmpleadoSerializer(source='id_empleado', read_only=True)
    
    # Campos calculados
    dias_para_vencimiento = serializers.SerializerMethodField()
    puede_convertir = serializers.SerializerMethodField()

    class Meta:
        model = TblCotizaciones
        fields = [
            'numero_cotizacion', 'id_cliente', 'cliente_nombre', 'cliente_info',
            'id_empleado', 'empleado_nombre', 'empleado_info',
            'fecha_creacion', 'fecha_vencimiento', 'dias_para_vencimiento',
            'direccion', 'telefono', 'rtn',
            'subtotal', 'descuento', 'isv', 'total', 
            'tipo_servicio', 'tipo_servicio_display',
            'estado', 'estado_display', 'puede_convertir',
            'observaciones', 'numero_factura_conversion', 'fecha_conversion'
        ]
        read_only_fields = ['numero_cotizacion', 'fecha_creacion', 'numero_factura_conversion', 'fecha_conversion']

    def get_cliente_nombre(self, obj):
        return f"{obj.id_cliente.nombre} {obj.id_cliente.apellido}"

    def get_empleado_nombre(self, obj):
        return f"{obj.id_empleado.nombre} {obj.id_empleado.apellido}"
    
    def get_dias_para_vencimiento(self, obj):
        if obj.fecha_vencimiento:
            from datetime import date
            hoy = date.today()
            delta = obj.fecha_vencimiento - hoy
            return delta.days
        return None
    
    def get_puede_convertir(self, obj):
        """Determinar si la cotización puede convertirse a factura"""
        return obj.estado == 'ACTIVA' and obj.numero_factura_conversion is None
    
    def validate_fecha_vencimiento(self, value):
        """Validar que la fecha de vencimiento sea futura"""
        from datetime import date
        if value and value < date.today():
            raise serializers.ValidationError("La fecha de vencimiento no puede ser en el pasado")
        return value
    
    def validate(self, data):
        """Validaciones personalizadas para la cotización"""
        # Validar que el total sea positivo
        total = data.get('total')
        if total and total <= 0:
            raise serializers.ValidationError({
                'total': 'El total debe ser mayor a cero'
            })
        
        # Validar que subtotal - descuento + isv = total
        subtotal = data.get('subtotal', Decimal('0'))
        descuento = data.get('descuento', Decimal('0'))
        isv = data.get('isv', Decimal('0'))
        total_calculado = subtotal - descuento + isv
        
        if total and abs(total - total_calculado) > Decimal('0.01'):
            raise serializers.ValidationError({
                'total': f'El total calculado ({total_calculado}) no coincide con el total proporcionado ({total})'
            })
        
        return data
    
class CrearCotizacionSerializer(serializers.ModelSerializer):
    """Serializer para crear nuevas cotizaciones"""
    
    class Meta:
        model = TblCotizaciones
        fields = [
            'id_cliente', 'id_empleado', 'fecha_vencimiento',
            'direccion', 'telefono', 'rtn',
            'subtotal', 'descuento', 'isv', 'total',
            'tipo_servicio', 'observaciones'
        ]
    
    def validate(self, data):
        """Validaciones para creación de cotizaciones"""
        # Validar que cliente existe
        try:
            TblClientes.objects.get(id_cliente=data['id_cliente'].id_cliente)
        except TblClientes.DoesNotExist:
            raise serializers.ValidationError({
                'id_cliente': 'El cliente no existe'
            })
        
        # Validar que empleado existe
        try:
            TblEmpleados.objects.get(id_empleado=data['id_empleado'].id_empleado)
        except TblEmpleados.DoesNotExist:
            raise serializers.ValidationError({
                'id_empleado': 'El empleado no existe'
            })
        
        # Validar total positivo
        if data.get('total', Decimal('0')) <= 0:
            raise serializers.ValidationError({
                'total': 'El total debe ser mayor a cero'
            })
        
        return data
    
    def create(self, validated_data):
        """Crear cotización con estado ACTIVA por defecto"""
        validated_data['estado'] = 'ACTIVA'
        return super().create(validated_data)

class ActualizarCotizacionSerializer(serializers.ModelSerializer):
    """Serializer para actualizar cotizaciones existentes"""
    
    class Meta:
        model = TblCotizaciones
        fields = [
            'fecha_vencimiento', 'direccion', 'telefono', 'rtn',
            'subtotal', 'descuento', 'isv', 'total',
            'tipo_servicio', 'observaciones', 'estado'
        ]
        read_only_fields = ['numero_cotizacion', 'id_cliente', 'id_empleado', 'fecha_creacion']
    
    def validate_estado(self, value):
        """Validar cambios de estado"""
        instance = getattr(self, 'instance', None)
        
        if instance and instance.estado == 'CONVERTIDA' and value != 'CONVERTIDA':
            raise serializers.ValidationError(
                "No se puede modificar el estado de una cotización ya convertida a factura"
            )
        
        return value

class ConvertirCotizacionSerializer(serializers.Serializer):
    """Serializer para convertir cotización a factura"""
    id_empleado = serializers.IntegerField(required=False)
    observaciones = serializers.CharField(required=False, allow_blank=True)
    
    def validate_id_empleado(self, value):
        """Validar que el empleado existe"""
        if value:
            try:
                TblEmpleados.objects.get(id_empleado=value)
                return value
            except TblEmpleados.DoesNotExist:
                raise serializers.ValidationError("El empleado no existe")
        return value

class CotizacionEstadisticasSerializer(serializers.Serializer):
    """Serializer para estadísticas de cotizaciones"""
    total_cotizaciones = serializers.IntegerField()
    cotizaciones_activas = serializers.IntegerField()
    cotizaciones_convertidas = serializers.IntegerField()
    cotizaciones_mes_actual = serializers.IntegerField()
    valor_total_mes = serializers.DecimalField(max_digits=18, decimal_places=2)
    cotizaciones_proximas_vencer = serializers.IntegerField()
    tasa_conversion = serializers.FloatField()

class OrdenTrabajoSerializer(serializers.ModelSerializer):
    empleado_nombre = serializers.SerializerMethodField()
    cliente_nombre = serializers.CharField(source='numero_factura.id_cliente.nombre', read_only=True)
    tipo_orden_display = serializers.CharField(source='get_tipo_orden_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)

    class Meta:
        model = TblOrdenesTrabajo
        fields = [
            'id_orden', 'numero_factura', 'id_empleado', 'empleado_nombre', 'cliente_nombre',
            'tipo_orden', 'tipo_orden_display', 'descripcion', 'fecha_inicio', 
            'fecha_estimada', 'estado', 'estado_display', 'costo_mano_obra'
        ]

    def get_empleado_nombre(self, obj):
        return f"{obj.id_empleado.nombre} {obj.id_empleado.apellido}"

class StockInsumoSerializer(serializers.ModelSerializer):
    provedor_nombre = serializers.CharField(source='codigo_provedor.nombre', read_only=True)

    class Meta:
        model = TblStockInsumos
        fields = [
            'codigo_insumo', 'codigo_provedor', 'provedor_nombre', 'nombre',
            'tipo_insumo', 'categoria', 'cantidad_existencia', 'unidad_medida',
            'descripcion', 'costo', 'fecha_vencimiento', 'requiere_control_vencimiento'
        ]

class StockMaterialSerializer(serializers.ModelSerializer):
    provedor_nombre = serializers.CharField(source='codigo_provedor.nombre', read_only=True)

    class Meta:
        model = TblStockMateriales
        fields = [
            'codigo_material', 'codigo_provedor', 'provedor_nombre', 'nombre',
            'tipo_material', 'peso', 'quilates', 'pureza', 'tipo_piedra',
            'color', 'dimensiones', 'cantidad_existencia', 'descripcion', 'costo'
        ]

class ProvedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = TblProvedores
        fields = ['codigo_provedor', 'nombre', 'telefono', 'direccion']

class PerfilEmpleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilesEmpleados
        fields = ['codigo_perfil', 'perfil', 'rol']

# ========================================
# SERIALIZADORES PARA CREACIÓN DE FACTURA (ACTUALIZADOS)
# ========================================

class CrearDetalleFacturaSerializer(serializers.Serializer):
    """Serializer para crear un detalle de factura"""
    tipo_item = serializers.ChoiceField(choices=[
        ('JOYA', 'Joya'),
        ('SERVICIO', 'Servicio'), 
        ('MATERIAL', 'Material'),
        ('INSUMO', 'Insumo')
    ])
    codigo_item = serializers.IntegerField()
    descripcion = serializers.CharField(max_length=300)
    cantidad = serializers.IntegerField(min_value=1)
    precio_unitario = serializers.DecimalField(max_digits=18, decimal_places=2)
    descuento = serializers.DecimalField(max_digits=18, decimal_places=2, required=False, default=Decimal('0'))

class CrearOrdenTrabajoSerializer(serializers.Serializer):
    """Serializer para crear orden de trabajo"""
    tipo_orden = serializers.ChoiceField(choices=[('FABRICACION', 'Fabricación'), ('REPARACION', 'Reparación')])
    descripcion = serializers.CharField(max_length=500, required=False, allow_blank=True)
    fecha_estimada = serializers.DateField(required=False, allow_null=True)
    costo_mano_obra = serializers.DecimalField(max_digits=18, decimal_places=2, required=False, default=Decimal('0'))

class CrearFacturaCompletaSerializer(serializers.Serializer):
    """
    Serializer principal para crear una factura completa con todos sus detalles.
    ACTUALIZADO: Compatible con la nueva estructura de modelos
    """
    # Datos básicos de la factura
    id_cliente = serializers.IntegerField()
    id_empleado = serializers.IntegerField()
    fecha = serializers.DateField(required=False)
    direccion = serializers.CharField(max_length=200)
    telefono = serializers.CharField(max_length=15)
    rtn = serializers.CharField(max_length=20, required=False, allow_blank=True, allow_null=True)
    tipo_venta = serializers.ChoiceField(choices=[
        ('VENTA', 'Venta'),
        ('FABRICACION', 'Fabricación'), 
        ('REPARACION', 'Reparación')
    ])
    observaciones = serializers.CharField(max_length=500, required=False, allow_blank=True)
    descuento = serializers.DecimalField(max_digits=18, decimal_places=2, required=False, default=Decimal('0'))
    
    # Detalles relacionados
    detalles = CrearDetalleFacturaSerializer(many=True, required=False)
    orden_trabajo = CrearOrdenTrabajoSerializer(required=False)

    def validate(self, data):
        """Validaciones personalizadas"""
        tipo_venta = data.get('tipo_venta')
        
        # Validar que haya al menos un detalle
        if not data.get('detalles'):
            raise serializers.ValidationError({
                'detalles': 'Debe incluir al menos un detalle en la factura'
            })
        
        # Para FABRICACION y REPARACION, se requiere orden de trabajo
        if tipo_venta in ['FABRICACION', 'REPARACION'] and not data.get('orden_trabajo'):
            raise serializers.ValidationError({
                'orden_trabajo': f'La orden de trabajo es requerida para tipo de venta {tipo_venta}'
            })
        
        return data

    def validate_id_cliente(self, value):
        """Verificar que el cliente existe"""
        try:
            TblClientes.objects.get(id_cliente=value)
            return value
        except TblClientes.DoesNotExist:
            raise serializers.ValidationError("El cliente no existe")

    def validate_id_empleado(self, value):
        """Verificar que el empleado existe"""
        try:
            TblEmpleados.objects.get(id_empleado=value)
            return value
        except TblEmpleados.DoesNotExist:
            raise serializers.ValidationError("El empleado no existe")

    @transaction.atomic
    def create(self, validated_data):
        """
        Crear factura completa con todas sus relaciones.
        ACTUALIZADO: Compatible con nueva estructura
        """
        try:
            print("Iniciando creación de factura...")
            
            # Extraer datos relacionados
            detalles_data = validated_data.pop('detalles', [])
            orden_trabajo_data = validated_data.pop('orden_trabajo', None)
            
            # Calcular totales
            subtotal = Decimal('0')
            
            # Sumar detalles
            for detalle in detalles_data:
                cantidad = Decimal(str(detalle.get('cantidad', 1)))
                precio = Decimal(str(detalle.get('precio_unitario', 0)))
                descuento_detalle = Decimal(str(detalle.get('descuento', 0)))
                subtotal += (cantidad * precio) - descuento_detalle
            
            # Aplicar descuento general
            descuento_general = Decimal(str(validated_data.get('descuento', 0)))
            subtotal_con_descuento = max(subtotal - descuento_general, Decimal('0'))
            
            # Calcular ISV (15%)
            isv = subtotal_con_descuento * Decimal('0.15')
            total = subtotal_con_descuento + isv
            
            print(f"Cálculos: Subtotal={subtotal}, Descuento={descuento_general}, ISV={isv}, Total={total}")
            
            # Crear la factura principal
            fecha_factura = validated_data.get('fecha')
            
            factura = TblFacturas.objects.create(
                id_cliente_id=validated_data['id_cliente'],
                id_empleado_id=validated_data['id_empleado'],
                fecha=fecha_factura,
                direccion=validated_data.get('direccion', 'No especificada'),
                telefono=validated_data.get('telefono', 'No especificado'),
                rtn=validated_data.get('rtn', ''),
                subtotal=subtotal_con_descuento,
                descuento=descuento_general,
                isv=isv,
                total=total,
                tipo_venta=validated_data['tipo_venta'],
                estado_pago='PENDIENTE',
                observaciones=validated_data.get('observaciones', '')
            )
            
            print(f"Factura principal creada: #{factura.numero_factura}")
            
            # Crear detalles de factura
            for detalle_data in detalles_data:
                try:
                    TblDetallesFactura.objects.create(
                        numero_factura=factura,
                        tipo_item=detalle_data.get('tipo_item'),
                        codigo_item=detalle_data.get('codigo_item'),
                        descripcion=detalle_data.get('descripcion', ''),
                        cantidad=detalle_data.get('cantidad', 1),
                        precio_unitario=detalle_data.get('precio_unitario', 0),
                        descuento=detalle_data.get('descuento', 0)
                    )
                    
                    # Descontar del inventario si es material o insumo
                    tipo_item = detalle_data.get('tipo_item')
                    codigo_item = detalle_data.get('codigo_item')
                    cantidad = detalle_data.get('cantidad', 0)
                    
                    if tipo_item == 'MATERIAL':
                        try:
                            material = TblStockMateriales.objects.get(codigo_material=codigo_item)
                            if material.cantidad_existencia >= cantidad:
                                material.cantidad_existencia -= cantidad
                                material.save()
                                print(f" Material {codigo_item} descontado del inventario")
                            else:
                                print(f" Stock insuficiente para material {codigo_item}")
                        except TblStockMateriales.DoesNotExist:
                            print(f" Material {codigo_item} no encontrado en inventario")
                    
                    elif tipo_item == 'INSUMO':
                        try:
                            insumo = TblStockInsumos.objects.get(codigo_insumo=codigo_item)
                            if insumo.cantidad_existencia >= cantidad:
                                insumo.cantidad_existencia -= cantidad
                                insumo.save()
                                print(f"Insumo {codigo_item} descontado del inventario")
                            else:
                                print(f"Stock insuficiente para insumo {codigo_item}")
                        except TblStockInsumos.DoesNotExist:
                            print(f"Insumo {codigo_item} no encontrado en inventario")
                            
                except Exception as e:
                    print(f"Error creando detalle: {e}")
                    continue
            
            # Crear orden de trabajo si aplica
            if orden_trabajo_data and validated_data['tipo_venta'] in ['FABRICACION', 'REPARACION']:
                try:
                    TblOrdenesTrabajo.objects.create(
                        numero_factura=factura,
                        id_empleado_id=validated_data['id_empleado'],
                        tipo_orden=orden_trabajo_data.get('tipo_orden', validated_data['tipo_venta']),
                        descripcion=orden_trabajo_data.get('descripcion', ''),
                        fecha_estimada=orden_trabajo_data.get('fecha_estimada'),
                        costo_mano_obra=orden_trabajo_data.get('costo_mano_obra', 0),
                        estado='PENDIENTE'
                    )
                    print("Orden de trabajo creada")
                except Exception as e:
                    print(f" Error creando orden de trabajo: {e}")

            print(f" Factura #{factura.numero_factura} creada exitosamente")
            return factura
            
        except Exception as e:
            print(f" Error crítico en transacción: {e}")
            raise serializers.ValidationError({
                'error': f'Error al crear la factura: {str(e)}',
                'detalles': 'Revise los datos e intente nuevamente'
            })

class ActualizarEstadoPagoSerializer(serializers.Serializer):
    """Serializer para actualizar el estado de pago de una factura"""
    estado_pago = serializers.ChoiceField(choices=['PENDIENTE', 'PAGADA', 'CANCELADA'])
    metodo_pago = serializers.CharField(max_length=50, required=False, allow_blank=True)
    fecha_pago = serializers.DateTimeField(required=False, allow_null=True)
    
    def validate(self, data):
        if data.get('estado_pago') == 'PAGADA' and not data.get('metodo_pago'):
            raise serializers.ValidationError({
                'metodo_pago': 'El método de pago es requerido cuando se marca como pagada'
            })
        return data

class ActualizarEstadoOrdenSerializer(serializers.Serializer):
    """Serializer para actualizar el estado de una orden de trabajo"""
    estado = serializers.ChoiceField(choices=[
        ('PENDIENTE', 'Pendiente'),
        ('EN_PROCESO', 'En Proceso'), 
        ('COMPLETADA', 'Completada'),
        ('CANCELADA', 'Cancelada')
    ])
    descripcion = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    


class CrearFacturaSimpleSerializer(serializers.Serializer):
    """Serializer simplificado para crear facturas desde el frontend"""
    id_cliente = serializers.IntegerField()
    id_empleado = serializers.IntegerField()
    fecha = serializers.DateField(required=False)
    direccion = serializers.CharField(max_length=200)
    telefono = serializers.CharField(max_length=15)
    rtn = serializers.CharField(max_length=20, required=False, allow_blank=True)
    subtotal = serializers.DecimalField(max_digits=18, decimal_places=2)
    descuento = serializers.DecimalField(max_digits=18, decimal_places=2, required=False, default=0)
    isv = serializers.DecimalField(max_digits=18, decimal_places=2)
    total = serializers.DecimalField(max_digits=18, decimal_places=2)
    tipo_venta = serializers.ChoiceField(choices=[
        ('VENTA', 'Venta'),
        ('FABRICACION', 'Fabricación'), 
        ('REPARACION', 'Reparación')
    ])
    observaciones = serializers.CharField(required=False, allow_blank=True)
    productos = serializers.ListField(child=serializers.DictField(), required=False)
    materiales = serializers.ListField(child=serializers.DictField(), required=False)

    def validate_id_cliente(self, value):
        try:
            TblClientes.objects.get(id_cliente=value)
            return value
        except TblClientes.DoesNotExist:
            raise serializers.ValidationError("El cliente no existe")

    def validate_id_empleado(self, value):
        try:
            TblEmpleados.objects.get(id_empleado=value)
            return value
        except TblEmpleados.DoesNotExist:
            raise serializers.ValidationError("El empleado no existe")

    @transaction.atomic
    def create(self, validated_data):
        try:
            print("Creando factura simple...")
            
            # Extraer datos
            productos_data = validated_data.pop('productos', [])
            materiales_data = validated_data.pop('materiales', [])
            
            print("Datos validados:", validated_data)
            print("Productos:", len(productos_data))
            print("Materiales:", len(materiales_data))
            
            # Crear factura principal
            factura = TblFacturas.objects.create(
                id_cliente_id=validated_data['id_cliente'],
                id_empleado_id=validated_data['id_empleado'],
                fecha=validated_data.get('fecha'),
                direccion=validated_data.get('direccion', 'No especificada'),
                telefono=validated_data.get('telefono', 'No especificado'),
                rtn=validated_data.get('rtn', ''),
                subtotal=validated_data.get('subtotal', 0),
                descuento=validated_data.get('descuento', 0),
                isv=validated_data.get('isv', 0),
                total=validated_data.get('total', 0),
                tipo_venta=validated_data.get('tipo_venta', 'VENTA'),
                observaciones=validated_data.get('observaciones', ''),
                estado_pago='PENDIENTE'
            )
            
            print("Factura #{} creada".format(factura.numero_factura))
            
            # Crear detalles de productos - USAR 'JOYA' EN LUGAR DE 'PRODUCTO'
            for index, producto in enumerate(productos_data):
                TblDetallesFactura.objects.create(
                    numero_factura=factura,
                    tipo_item='JOYA',  # CAMBIADO: 'PRODUCTO' → 'JOYA'
                    codigo_item=producto.get('codigo', index + 1),
                    descripcion="{} - {}".format(
                        producto.get('producto', 'Producto sin nombre'),
                        producto.get('descripcion', 'Sin descripcion')
                    ),
                    cantidad=producto.get('cantidad', 1),
                    precio_unitario=producto.get('precio', 0)
                )
                print("Producto {} agregado como JOYA".format(index + 1))
            
            # Crear detalles de materiales
            for index, material in enumerate(materiales_data):
                TblDetallesFactura.objects.create(
                    numero_factura=factura,
                    tipo_item='MATERIAL',
                    codigo_item=material.get('codigo_material', index + 1000),
                    descripcion="{} - {}gr".format(
                        material.get('tipo', 'Material'),
                        material.get('peso', 0)
                    ),
                    cantidad=1,
                    precio_unitario=material.get('costo', 0)
                )
                print("Material {} agregado".format(index + 1))
            
            return factura
            
        except Exception as e:
            print("Error creando factura simple:", str(e))
            raise serializers.ValidationError("Error al crear factura: {}".format(str(e)))