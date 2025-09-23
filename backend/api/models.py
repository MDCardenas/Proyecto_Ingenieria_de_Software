from django.db import models

# =========================
# Perfiles de Empleados
# =========================
class PerfilEmpleado(models.Model):
    id = models.IntegerField(primary_key=True, db_column='codigo_perfil')
    perfil = models.CharField(max_length=50)
    rol = models.CharField(max_length=50)

    class Meta:
        db_table = 'Perfiles_Empleados'

    def __str__(self):
        return self.perfil

# =========================
# Empleados
# =========================
class Empleado(models.Model):
    id = models.IntegerField(primary_key=True, db_column='id_empleado')
    perfil = models.ForeignKey(PerfilEmpleado, on_delete=models.PROTECT, db_column='codigo_perfil')
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)
    usuario = models.CharField(max_length=50)
    contrasena = models.CharField(max_length=100)
    telefono = models.BigIntegerField(blank=True, null=True)
    correo = models.CharField(max_length=100, blank=True, null=True)
    salario = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)

    class Meta:
        db_table = 'Tbl_Empleados'

    def __str__(self):
        return f"{self.nombre} {self.apellido}"

# =========================
# Clientes
# =========================
class Cliente(models.Model):
    id = models.IntegerField(primary_key=True, db_column='id_cliente')
    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)
    direccion = models.CharField(max_length=100, blank=True, null=True)
    correo = models.CharField(max_length=100, blank=True, null=True)
    telefono = models.BigIntegerField(blank=True, null=True)

    class Meta:
        db_table = 'Tbl_Clientes'

    def __str__(self):
        return f"{self.nombre} {self.apellido}"

# =========================
# Proveedores
# =========================
class Proveedor(models.Model):
    id = models.IntegerField(primary_key=True, db_column='codigo_provedor')
    nombre = models.CharField(max_length=50)
    telefono = models.BigIntegerField(blank=True, null=True)
    direccion = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'Tbl_Provedores'

    def __str__(self):
        return self.nombre

# =========================
# Servicios
# =========================
class Servicio(models.Model):
    id = models.IntegerField(primary_key=True, db_column='codigo_servicio')
    nombre = models.CharField(max_length=50)
    descripcion = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        db_table = 'Tbl_Servicios'

    def __str__(self):
        return self.nombre

# =========================
# Stock Insumos
# =========================
class StockInsumo(models.Model):
    id = models.IntegerField(primary_key=True, db_column='codigo_insumo')
    proveedor = models.ForeignKey(Proveedor, on_delete=models.PROTECT, db_column='codigo_provedor')
    nombre = models.CharField(max_length=50)
    tipo_insumo = models.CharField(max_length=50, blank=True, null=True)
    cantidad_existencia = models.IntegerField(blank=True, null=True)
    descripcion = models.CharField(max_length=200, blank=True, null=True)
    costo = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)

    class Meta:
        db_table = 'Tbl_StockInsumos'

    def __str__(self):
        return self.nombre

# =========================
# Stock Joyas
# =========================
class StockJoya(models.Model):
    id = models.IntegerField(primary_key=True, db_column='codigo_joya')
    nombre = models.CharField(max_length=50)
    imagen = models.BinaryField(blank=True, null=True)
    tipo = models.CharField(max_length=50, blank=True, null=True)
    peso = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    material = models.CharField(max_length=50, blank=True, null=True)
    descripcion = models.CharField(max_length=200, blank=True, null=True)
    precio_venta = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)

    class Meta:
        db_table = 'Tbl_Stock_Joyas'

    def __str__(self):
        return self.nombre

# =========================
# Ventas
# =========================
class Venta(models.Model):
    id = models.IntegerField(primary_key=True, db_column='codigo_venta')
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, db_column='id_cliente')
    empleado = models.ForeignKey(Empleado, on_delete=models.PROTECT, db_column='id_empleado')
    fecha = models.DateField(blank=True, null=True)
    subtotal = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    isv = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    total = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    estado_pago = models.IntegerField(blank=True, null=True)
    abono = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)

    class Meta:
        db_table = 'Tbl_Ventas'

    def __str__(self):
        return f"Venta {self.id}"

# =========================
# Detalles de Ventas
# =========================
class DetalleVenta(models.Model):
    id = models.IntegerField(primary_key=True, db_column='codigo_detalle_venta')
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE, db_column='codigo_venta')
    servicio = models.ForeignKey(Servicio, on_delete=models.SET_NULL, blank=True, null=True, db_column='codigo_servicio')
    joya = models.ForeignKey(StockJoya, on_delete=models.SET_NULL, blank=True, null=True, db_column='codigo_joya')
    cantidad = models.IntegerField(blank=True, null=True)
    precio_unitario = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)

    class Meta:
        db_table = 'Tbl_Detalles_Ventas'

    def __str__(self):
        return f"{self.joya or self.servicio} x {self.cantidad}"

# =========================
# Ordenes
# =========================
class Orden(models.Model):
    id = models.IntegerField(primary_key=True, db_column='codigo_orden')
    empleado = models.ForeignKey(Empleado, on_delete=models.PROTECT, db_column='id_empleado')
    venta = models.ForeignKey(Venta, on_delete=models.SET_NULL, blank=True, null=True, db_column='codigo_venta')
    fecha_inicio = models.DateField(blank=True, null=True)
    fecha_finalizacion = models.DateField(blank=True, null=True)
    costo_mano_de_obra = models.DecimalField(max_digits=18, decimal_places=2, blank=True, null=True)
    estado_orden = models.CharField(max_length=50, blank=True, null=True)
    descripcion = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        db_table = 'Tbl_Ordenes'

    def __str__(self):
        return f"Orden {self.id}"

# =========================
# Insumos por Orden (clave compuesta)
# =========================
class InsumoXOrden(models.Model):
    orden = models.ForeignKey(Orden, on_delete=models.CASCADE, db_column='codigo_orden')
    insumo = models.ForeignKey(StockInsumo, on_delete=models.PROTECT, db_column='codigo_insumo')

    class Meta:
        db_table = 'Tbl_Insumos_x_Orden'
        unique_together = (('orden', 'insumo'),)

    def __str__(self):
        return f"{self.insumo} para {self.orden}"


# =========================