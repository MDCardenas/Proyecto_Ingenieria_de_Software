# backend/dashboard/views.py

from django.http import JsonResponse
from django.db import connection
import calendar


def _json_no_cache(data, status=200):
    """Devuelve JSON con cabecera no-cache para evitar respuestas viejas del navegador."""
    resp = JsonResponse(data, status=status, safe=False)
    resp["Cache-Control"] = "no-store"
    return resp


def dashboard_kpis(request):
    """
    KPIs del Dashboard:
      - ventas_hoy
      - ordenes_pendientes
      - productos_en_stock
      - clientes_activos
    """
    with connection.cursor() as cur:
        # Ventas de hoy
        cur.execute("""
            SELECT COALESCE(SUM(TOTAL), 0)
            FROM TBL_VENTAS
            WHERE CAST(FECHA AS DATE) = CAST(GETDATE() AS DATE)
        """)
        ventas_hoy = float(cur.fetchone()[0] or 0)

        # Órdenes pendientes (tolerante a espacios y mayúsculas/minúsculas)
        cur.execute("""
            SELECT COUNT(*)
            FROM Tbl_Ordenes
            WHERE UPPER(LTRIM(RTRIM(estado_orden))) LIKE 'PENDIENT%'
        """)
        ordenes_pendientes = int(cur.fetchone()[0] or 0)

        # Productos en stock (joyas registradas)
        cur.execute("SELECT COUNT(*) FROM TBL_STOCK_JOYAS")
        productos_en_stock = int(cur.fetchone()[0] or 0)

        # Clientes (total)
        cur.execute("SELECT COUNT(*) FROM TBL_CLIENTES")
        clientes_activos = int(cur.fetchone()[0] or 0)

    return _json_no_cache({
        "ventas_hoy": ventas_hoy,
        "ordenes_pendientes": ordenes_pendientes,
        "productos_en_stock": productos_en_stock,
        "clientes_activos": clientes_activos,
    })


def ventas_mensuales(request):
    """
    Serie de ventas por mes (últimos 6 meses incluyendo el actual).
    Devuelve: [{"label": "Jan", "total": 12345.67}, ...]
    """
    with connection.cursor() as cur:
        cur.execute("""
            SELECT YEAR(FECHA) AS anio,
                   MONTH(FECHA) AS mes,
                   SUM(TOTAL)   AS total
            FROM TBL_VENTAS
            WHERE FECHA >= DATEADD(MONTH, -5,
                     DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
            GROUP BY YEAR(FECHA), MONTH(FECHA)
            ORDER BY anio, mes
        """)
        rows = cur.fetchall()  # [(anio, mes, total), ...]

    serie = [{"label": calendar.month_abbr[m], "total": float(t or 0)}
             for (y, m, t) in rows]

    return _json_no_cache({"ventas_mensuales": serie})


def ordenes_por_estado(request):
    """
    Conteo de órdenes por estado, normalizando variaciones:
      COMPLET*, EN PROCESO/PROCESO, PENDIENT*
    Devuelve: {"COMPLETADA": n, "EN PROCESO": m, "PENDIENTE": k}
    """
    with connection.cursor() as cur:
        cur.execute("""
            SELECT bucket, COUNT(*) AS cantidad
            FROM (
              SELECT CASE
                WHEN UPPER(LTRIM(RTRIM(estado_orden))) LIKE 'COMPLET%'   THEN 'COMPLETADA'
                WHEN UPPER(LTRIM(RTRIM(estado_orden))) LIKE 'EN PROCESO%'
                  OR UPPER(LTRIM(RTRIM(estado_orden))) = 'PROCESO'       THEN 'EN PROCESO'
                WHEN UPPER(LTRIM(RTRIM(estado_orden))) LIKE 'PENDIENT%'  THEN 'PENDIENTE'
                ELSE 'EN PROCESO'
              END AS bucket
              FROM Tbl_Ordenes
            ) x
            GROUP BY bucket
        """)
        rows = cur.fetchall()  # [('COMPLETADA', n), ('PENDIENTE', m), ...]

    buckets = {"COMPLETADA": 0, "EN PROCESO": 0, "PENDIENTE": 0}
    for bucket, cant in rows:
        buckets[bucket] = int(cant or 0)

    return _json_no_cache({"ordenes_por_estado": buckets})
