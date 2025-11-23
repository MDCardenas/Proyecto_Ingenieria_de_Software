from django.urls import path, include
from django.contrib import admin
from django.http import HttpResponseRedirect
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Redirige al frontend en lugar del admin
    path('', lambda request: HttpResponseRedirect('http://20.64.150.5:5173/')),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/dashboard/', include('dashboard.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)