# backend/dashboard/urls.py
from django.urls import path
from . import views

app_name = "dashboard"

urlpatterns = [
    path("kpis/", views.dashboard_kpis, name="kpis"),
    path("ventas-mensuales/", views.ventas_mensuales, name="ventas_mensuales"),
    path("ordenes-estado/", views.ordenes_por_estado, name="ordenes_estado"),
]
