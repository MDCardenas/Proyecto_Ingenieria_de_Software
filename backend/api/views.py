from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.db import connection
from django.db import models
from api.models import Empleado
from django.db import models

@api_view(['GET'])
def hello(request):
    return Response({"message": "Hola desde Django API 🚀"})

@api_view(['GET'])
def db_test(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT @@VERSION;")
        version = cursor.fetchone()
    return JsonResponse({"sql_server_version": version[0]})

# Endpoint de login usando ORM
@api_view(['POST'])
def login(request):
    usuario = request.data.get('usuario', '')
    correo = request.data.get('correo', '')
    contrasena = request.data.get('contrasena', '')
    empleado = None
    if not (usuario or correo) or not contrasena:
        return JsonResponse({"success": False, "error": "Debes ingresar usuario/correo y contraseña"})
    try:
        empleado_obj = Empleado.objects.filter(
            contrasena=contrasena
        ).filter(
            models.Q(usuario=usuario) | models.Q(correo=correo)
        ).select_related("perfil").first()

        if empleado_obj:
            empleado = {
            "id_empleado": empleado_obj.id,
            "nombre": empleado_obj.nombre,
            "apellido": empleado_obj.apellido,
            "usuario": empleado_obj.usuario,
            "correo": empleado_obj.correo,
            "telefono": empleado_obj.telefono,
            "salario": float(empleado_obj.salario) if empleado_obj.salario else None,
            "codigo_perfil": empleado_obj.perfil.id if empleado_obj.perfil else None,
            "perfil": empleado_obj.perfil.perfil if empleado_obj.perfil else None,
            "rol": empleado_obj.perfil.rol if empleado_obj.perfil else None,
     }   


            return JsonResponse({"success": True, "empleado": empleado})
        else:
            return JsonResponse({"success": False, "error": "Credenciales inválidas"})

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)})