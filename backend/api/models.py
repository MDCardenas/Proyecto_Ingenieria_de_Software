# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class PerfilesEmpleados(models.Model):
    codigo_perfil = models.IntegerField(primary_key=True)
    perfil = models.CharField(max_length=50, db_collation='Modern_Spanish_CI_AS')
    rol = models.CharField(max_length=50, db_collation='Modern_Spanish_CI_AS')

    class Meta:
        managed = False
        db_table = 'Perfiles_Empleados'


class TblClientes(models.Model):
    id_cliente = models.AutoField(primary_key=True)
    numero_identidad = models.CharField(unique=True, max_length=20, db_collation='Modern_Spanish_CI_AS')
    rtn = models.CharField(max_length=20, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    nombre = models.CharField(max_length=50, db_collation='Modern_Spanish_CI_AS')
    apellido = models.CharField(max_length=50, db_collation='Modern_Spanish_CI_AS')
    direccion = models.CharField(max_length=100, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    correo = models.CharField(max_length=100, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    telefono = models.BigIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Tbl_Clientes'

    def __str__(self):
        return f"{self.nombre} {self.apellido}"


class TblProvedores(models.Model):
    codigo_provedor = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50, db_collation='Modern_Spanish_CI_AS')
    telefono = models.BigIntegerField(blank=True, null=True)
    direccion = models.CharField(max_length=100, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Tbl_Provedores'

    def __str__(self):
        return self.nombre


class TblEmpleados(models.Model):
    id_empleado = models.AutoField(primary_key=True)
    codigo_perfil = models.ForeignKey(PerfilesEmpleados, models.DO_NOTHING, db_column='codigo_perfil')
    nombre = models.CharField(max_length=50, db_collation='Modern_Spanish_CI_AS')
    apellido = models.CharField(max_length=50, db_collation='Modern_Spanish_CI_AS')
    usuario = models.CharField(max_length=50, db_collation='Modern_Spanish_CI_AS')
    contrasena = models.CharField(max_length=100, db_collation='Modern_Spanish_CI_AS')
    telefono = models.BigIntegerField(blank=True, null=True)
    correo = models.CharField(max_length=100, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    salario = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Tbl_Empleados'

    def __str__(self):
        return f"{self.nombre} {self.apellido}"


class TblServicios(models.Model):
    codigo_servicio = models.AutoField(primary_key=True)
    nombre_servicio = models.CharField(max_length=50, db_collation='Modern_Spanish_CI_AS')
    descripcion = models.CharField(max_length=200, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    precio_base = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Tbl_Servicios'

    def __str__(self):
        return self.nombre_servicio


# En la clase TblStockJoyas, agregar el campo costo:
class TblStockJoyas(models.Model):
    codigo_joya = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50, db_collation='Modern_Spanish_CI_AS')
    imagen_url = models.CharField(max_length=200, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    tipo = models.CharField(max_length=50, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    peso = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    material = models.CharField(max_length=50, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    descripcion = models.CharField(max_length=200, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    precio_venta = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    costo = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    cantidad_existencia = models.IntegerField(blank=True, null=True, default=0)

    class Meta:
        managed = False
        db_table = 'Tbl_Stock_Joyas'

    def __str__(self):
        return self.nombre


class TblStockMateriales(models.Model):
    codigo_material = models.AutoField(primary_key=True)
    codigo_provedor = models.ForeignKey(TblProvedores, models.DO_NOTHING, db_column='codigo_provedor')
    nombre = models.CharField(max_length=50, db_collation='Modern_Spanish_CI_AS')
    tipo_material = models.CharField(max_length=50, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    peso = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    quilates = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    pureza = models.CharField(max_length=20, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    tipo_piedra = models.CharField(max_length=50, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    color = models.CharField(max_length=30, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    dimensiones = models.CharField(max_length=50, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    cantidad_existencia = models.IntegerField(blank=True, null=True)
    descripcion = models.CharField(max_length=200, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    costo = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Tbl_Stock_Materiales'

    def __str__(self):
        return self.nombre


class TblStockInsumos(models.Model):
    codigo_insumo = models.AutoField(primary_key=True)
    codigo_provedor = models.ForeignKey(TblProvedores, models.DO_NOTHING, db_column='codigo_provedor')
    nombre = models.CharField(max_length=50, db_collation='Modern_Spanish_CI_AS')
    tipo_insumo = models.CharField(max_length=50, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    categoria = models.CharField(max_length=50, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    cantidad_existencia = models.IntegerField(blank=True, null=True)
    unidad_medida = models.CharField(max_length=20, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    descripcion = models.CharField(max_length=200, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    costo = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    fecha_vencimiento = models.DateField(blank=True, null=True)
    requiere_control_vencimiento = models.BooleanField(default=False)

    class Meta:
        managed = False
        db_table = 'Tbl_Stock_Insumos'

    def __str__(self):
        return self.nombre


class TblCotizaciones(models.Model):
    numero_cotizacion = models.AutoField(primary_key=True)
    id_cliente = models.ForeignKey(TblClientes, models.DO_NOTHING, db_column='id_cliente')
    id_empleado = models.ForeignKey(TblEmpleados, models.DO_NOTHING, db_column='id_empleado')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_vencimiento = models.DateField(blank=True, null=True)
    direccion = models.CharField(max_length=200, db_collation='Modern_Spanish_CI_AS')
    telefono = models.CharField(max_length=15, db_collation='Modern_Spanish_CI_AS')
    rtn = models.CharField(max_length=20, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    subtotal = models.DecimalField(max_digits=18, decimal_places=2)
    descuento = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True, default=0)
    isv = models.DecimalField(max_digits=18, decimal_places=2)
    total = models.DecimalField(max_digits=18, decimal_places=2)
    tipo_servicio = models.CharField(max_length=20, db_collation='Modern_Spanish_CI_AS')
    estado = models.CharField(max_length=20, db_collation='Modern_Spanish_CI_AS', default='ACTIVA')
    observaciones = models.CharField(max_length=500, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    numero_factura_conversion = models.ForeignKey('TblFacturas', models.DO_NOTHING, db_column='numero_factura_conversion', blank=True, null=True)
    fecha_conversion = models.DateTimeField(blank=True, null=True)
    imagen_referencia = models.CharField(max_length=500, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Tbl_Cotizaciones'

    def __str__(self):
        return f"Cotización #{self.numero_cotizacion} - {self.id_cliente}"


class TblFacturas(models.Model):
    TIPO_VENTA_CHOICES = [
        ('VENTA', 'Venta'),
        ('FABRICACION', 'Fabricación'),
        ('REPARACION', 'Reparación'),
    ]
    
    ESTADO_PAGO_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('PAGADA', 'Pagada'),
        ('CANCELADA', 'Cancelada'),
    ]

    numero_factura = models.AutoField(primary_key=True)
    id_cliente = models.ForeignKey(TblClientes, models.DO_NOTHING, db_column='id_cliente')
    id_empleado = models.ForeignKey(TblEmpleados, models.DO_NOTHING, db_column='id_empleado')
    fecha = models.DateTimeField(auto_now_add=True)
    direccion = models.CharField(max_length=200, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    telefono = models.CharField(max_length=15, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    rtn = models.CharField(max_length=20, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    subtotal = models.DecimalField(max_digits=18, decimal_places=2)
    descuento = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True, default=0)
    isv = models.DecimalField(max_digits=18, decimal_places=2)
    total = models.DecimalField(max_digits=18, decimal_places=2)
    tipo_venta = models.CharField(max_length=20, db_collation='Modern_Spanish_CI_AS', choices=TIPO_VENTA_CHOICES, default='VENTA')
    observaciones = models.CharField(max_length=500, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    estado_pago = models.CharField(max_length=20, db_collation='Modern_Spanish_CI_AS', choices=ESTADO_PAGO_CHOICES, default='PENDIENTE')
    fecha_pago = models.DateTimeField(blank=True, null=True)
    metodo_pago = models.CharField(max_length=50, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Tbl_Facturas'

    def __str__(self):
        return f"Factura #{self.numero_factura} - {self.id_cliente}"


class TblDetallesFactura(models.Model):
    TIPO_ITEM_CHOICES = [
        ('JOYA', 'Joya'),
        ('SERVICIO', 'Servicio'),
        ('MATERIAL', 'Material'),
        ('INSUMO', 'Insumo'),
    ]

    id_detalle = models.AutoField(primary_key=True)
    numero_factura = models.ForeignKey(TblFacturas, models.DO_NOTHING, db_column='numero_factura')
    tipo_item = models.CharField(max_length=20, db_collation='Modern_Spanish_CI_AS', choices=TIPO_ITEM_CHOICES)
    codigo_item = models.IntegerField()
    descripcion = models.CharField(max_length=300, db_collation='Modern_Spanish_CI_AS')
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=18, decimal_places=2)
    descuento = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True, default=0)

    class Meta:
        managed = False
        db_table = 'Tbl_Detalles_Factura'

    def __str__(self):
        return f"Detalle #{self.id_detalle} - Factura {self.numero_factura}"


class TblOrdenesTrabajo(models.Model):
    TIPO_ORDEN_CHOICES = [
        ('FABRICACION', 'Fabricación'),
        ('REPARACION', 'Reparación'),
    ]
    
    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('EN_PROCESO', 'En Proceso'),
        ('COMPLETADA', 'Completada'),
        ('CANCELADA', 'Cancelada'),
    ]

    id_orden = models.AutoField(primary_key=True)
    numero_factura = models.ForeignKey(TblFacturas, models.DO_NOTHING, db_column='numero_factura')
    id_empleado = models.ForeignKey(TblEmpleados, models.DO_NOTHING, db_column='id_empleado')
    tipo_orden = models.CharField(max_length=20, db_collation='Modern_Spanish_CI_AS', choices=TIPO_ORDEN_CHOICES)
    descripcion = models.CharField(max_length=500, db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    fecha_inicio = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    fecha_estimada = models.DateField(blank=True, null=True)
    estado = models.CharField(max_length=20, db_collation='Modern_Spanish_CI_AS', choices=ESTADO_CHOICES, default='PENDIENTE')
    costo_mano_obra = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True, default=0)

    class Meta:
        managed = False
        db_table = 'Tbl_Ordenes_Trabajo'

    def __str__(self):
        return f"Orden #{self.id_orden} - {self.tipo_orden}"




#AQUI AGREGUE EL MODELO DE GASTOS PARA CONTABILIDAD
class TblGastos(models.Model):
    id_gasto = models.AutoField(primary_key=True)
    fecha_gasto = models.DateField()
    tipo_gasto = models.CharField(max_length=50)
    descripcion = models.CharField(max_length=300)
    monto = models.DecimalField(max_digits=18, decimal_places=2)
    proveedor = models.CharField(max_length=100, null=True, blank=True)
    id_empleado = models.IntegerField(null=True, blank=True)
    observaciones = models.CharField(max_length=500, null=True, blank=True)

    class Meta:
        db_table = 'Tbl_Gastos'

    def __str__(self):
        return f"Gasto #{self.id_gasto} - {self.tipo_gasto}"




# =============================================
# MODELOS ELIMINADOS (porque ya no existen en la BD)
# =============================================

# Los siguientes modelos fueron eliminados porque ya no existen en la nueva estructura:
# - TblDetallesVentas
# - TblFabricacion  
# - TblInsumosFactura
# - TblInsumosXOrden
# - TblMaterialesFactura
# - TblOrdenes (reemplazado por TblOrdenesTrabajo)
# - TblReparaciones
# - TblVentas

# =============================================
# MODELOS DE DJANGO (mantenidos para compatibilidad)
# =============================================

class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150, db_collation='Modern_Spanish_CI_AS')

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'


class AuthPermission(models.Model):
    name = models.CharField(max_length=255, db_collation='Modern_Spanish_CI_AS')
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100, db_collation='Modern_Spanish_CI_AS')

    class Meta:
        managed = False
        db_table = 'auth_permission'


class AuthUser(models.Model):
    password = models.CharField(max_length=128, db_collation='Modern_Spanish_CI_AS')
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150, db_collation='Modern_Spanish_CI_AS')
    first_name = models.CharField(max_length=150, db_collation='Modern_Spanish_CI_AS')
    last_name = models.CharField(max_length=150, db_collation='Modern_Spanish_CI_AS')
    email = models.CharField(max_length=254, db_collation='Modern_Spanish_CI_AS')
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(db_collation='Modern_Spanish_CI_AS', blank=True, null=True)
    object_repr = models.CharField(max_length=200, db_collation='Modern_Spanish_CI_AS')
    action_flag = models.SmallIntegerField()
    change_message = models.TextField(db_collation='Modern_Spanish_CI_AS')
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100, db_collation='Modern_Spanish_CI_AS')
    model = models.CharField(max_length=100, db_collation='Modern_Spanish_CI_AS')

    class Meta:
        managed = False
        db_table = 'django_content_type'


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255, db_collation='Modern_Spanish_CI_AS')
    name = models.CharField(max_length=255, db_collation='Modern_Spanish_CI_AS')
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40, db_collation='Modern_Spanish_CI_AS')
    session_data = models.TextField(db_collation='Modern_Spanish_CI_AS')
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'