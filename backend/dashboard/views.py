# backend/dashboard/views.py
from django.http import JsonResponse
from django.db import connection


def _json_ok(data, safe=True):
    """Respuesta JSON sin caché del navegador."""
    resp = JsonResponse(data, safe=safe)
    resp["Cache-Control"] = "no-store"
    return resp


# =========================================================
#  KPIs (tarjetas superiores)
# =========================================================
def dashboard_kpis(request):
    """
    - Ventas Hoy: suma de Tbl_Facturas.total para el día local (Honduras).
      Tolera si 'fecha' está guardada en hora local o en UTC.
    - Órdenes Pendientes: estado LIKE 'PENDIENTE%'.
    - Productos en stock: COUNT(*) Tbl_Stock_Joyas.
    - Clientes activos: COUNT(*) Tbl_Clientes o DISTINCT en Facturas si no existe.
    """
    debug = request.GET.get("debug")

    with connection.cursor() as cur:
        # Día local de Honduras (00:00 a 24:00)
        cur.execute("""
            DECLARE @tz NVARCHAR(50) = 'Central America Standard Time';
            SELECT CAST(SYSDATETIMEOFFSET() AT TIME ZONE @tz AS DATE);
        """)
        hoy_local = str(cur.fetchone()[0])

        # 1) Si 'fecha' ya está guardada en HORA LOCAL: compara por DATE
        cur.execute(f"""
            DECLARE @hoy DATE = '{hoy_local}';
            SELECT ISNULL(SUM(CAST(total AS DECIMAL(18,2))), 0)
            FROM dbo.Tbl_Facturas
            WHERE CAST(fecha AS DATE) = @hoy;
        """)
        total_local = float(cur.fetchone()[0] or 0)

        # 2) Si 'fecha' está en UTC: conviértela a Honduras y compara por DATE
        cur.execute(f"""
            DECLARE @tz NVARCHAR(50) = 'Central America Standard Time';
            DECLARE @hoy DATE = '{hoy_local}';
            SELECT ISNULL(SUM(CAST(total AS DECIMAL(18,2))), 0)
            FROM dbo.Tbl_Facturas
            WHERE CAST(((fecha AT TIME ZONE 'UTC') AT TIME ZONE @tz) AS DATE) = @hoy;
        """)
        total_as_utc = float(cur.fetchone()[0] or 0)

        ventas_hoy = total_local if total_local > 0 else total_as_utc

        # Órdenes PENDIENTES
        cur.execute("""
            SELECT COUNT(*)
            FROM dbo.Tbl_Ordenes_Trabajo
            WHERE UPPER(LTRIM(RTRIM(estado))) LIKE 'PENDIENTE%';
        """)
        ordenes_pendientes = int(cur.fetchone()[0] or 0)

        # Productos en stock (joyas registradas)
        cur.execute("SELECT COUNT(*) FROM dbo.Tbl_Stock_Joyas;")
        productos_en_stock = int(cur.fetchone()[0] or 0)

        # Clientes activos (fallback si no existe Tbl_Clientes)
        try:
            cur.execute("SELECT COUNT(*) FROM dbo.Tbl_Clientes;")
            clientes_activos = int(cur.fetchone()[0] or 0)
        except Exception:
            cur.execute("SELECT COUNT(DISTINCT id_cliente) FROM dbo.Tbl_Facturas;")
            clientes_activos = int(cur.fetchone()[0] or 0)

        extra = {}
        if debug:
            cur.execute("SELECT SYSDATETIMEOFFSET();")
            server_now = str(cur.fetchone()[0])
            extra = {
                "diag": {
                    "server_now": server_now,
                    "hoy_local": hoy_local,
                    "total_local": total_local,
                    "total_as_utc": total_as_utc,
                    "modo": "local" if total_local > 0 else "utc",
                }
            }

    return _json_ok({
        "ventas_hoy": round(ventas_hoy, 2),
        "ordenes_pendientes": ordenes_pendientes,
        "productos_en_stock": productos_en_stock,
        "clientes_activos": clientes_activos,
        **extra,
    })


# =========================================================
#  Serie "Ventas Mensuales" (Ene..Dic)
#  Usa el juego (local/UTC) que tenga datos (o mayor suma).
# =========================================================
def ventas_mensuales(request):
    def _rows_to_map(rows):
        return {int(m): float(t or 0.0) for m, t in rows}

    with connection.cursor() as cur:
        # Agrupación asumiendo HORA LOCAL
        cur.execute("""
            DECLARE @tz NVARCHAR(50) = 'Central America Standard Time';
            DECLARE @anio INT = YEAR(CAST(SYSDATETIMEOFFSET() AT TIME ZONE @tz AS DATE));
            SELECT MONTH(fecha) AS mes, SUM(CAST(total AS DECIMAL(18,2))) AS total
            FROM dbo.Tbl_Facturas
            WHERE YEAR(fecha) = @anio
            GROUP BY MONTH(fecha)
            ORDER BY mes;
        """)
        rows_local = cur.fetchall()

        # Agrupación asumiendo UTC → Honduras
        cur.execute("""
            DECLARE @tz NVARCHAR(50) = 'Central America Standard Time';
            DECLARE @anio INT = YEAR(CAST(SYSDATETIMEOFFSET() AT TIME ZONE @tz AS DATE));
            SELECT MONTH(CAST(((fecha AT TIME ZONE 'UTC') AT TIME ZONE @tz) AS DATE)) AS mes,
                   SUM(CAST(total AS DECIMAL(18,2))) AS total
            FROM dbo.Tbl_Facturas
            WHERE YEAR(CAST(((fecha AT TIME ZONE 'UTC') AT TIME ZONE @tz) AS DATE)) = @anio
            GROUP BY MONTH(CAST(((fecha AT TIME ZONE 'UTC') AT TIME ZONE @tz) AS DATE))
            ORDER BY mes;
        """)
        rows_utc = cur.fetchall()

    sum_local = sum(float(t or 0) for _, t in rows_local) if rows_local else 0.0
    sum_utc = sum(float(t or 0) for _, t in rows_utc) if rows_utc else 0.0
    rows = rows_local if sum_local >= sum_utc else rows_utc

    mapa = _rows_to_map(rows)
    etiquetas = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
    serie = [{"label": etiquetas[i-1], "total": round(mapa.get(i, 0.0), 2)} for i in range(1, 13)]

    return _json_ok({"ventas_mensuales": serie})


# =========================================================
#  Donut "Órdenes por Estado"
# =========================================================
def ordenes_por_estado(request):
    with connection.cursor() as cur:
        cur.execute("""
            SELECT UPPER(LTRIM(RTRIM(estado))) AS estado, COUNT(*) AS cantidad
            FROM dbo.Tbl_Ordenes_Trabajo
            GROUP BY UPPER(LTRIM(RTRIM(estado)));
        """)
        rows = cur.fetchall()

    buckets = {"COMPLETADA": 0, "EN PROCESO": 0, "PENDIENTE": 0}
    for estado, cantidad in rows:
        e = (estado or "").upper()
        n = int(cantidad or 0)
        if e.startswith("COMPLETAD"):  # COMPLETADO/COMPLETADA/...
            buckets["COMPLETADA"] += n
        elif e.startswith("PENDIENT"):
            buckets["PENDIENTE"] += n
        elif e.startswith("EN PROCES") or e.startswith("PROCES"):
            buckets["EN PROCESO"] += n
        else:
            buckets["EN PROCESO"] += n  # bucket por defecto

    return _json_ok({"ordenes_por_estado": buckets})
