# 🚀 Guía de Configuración - Joyas Charlys

## ✅ Configuración Completada

El proyecto ahora está **100% configurado** para funcionar tanto en modo local como en red. Todos los archivos han sido actualizados para usar variables de entorno.

## Cambiar entre modo LOCAL y NETWORK

Para cambiar entre modo local (localhost) y modo red (20.64.150.5), solo necesitas **editar UNA línea** en el archivo `.env`:

### 📝 Archivo: `frontend/.env`

```env
# Para trabajar en LOCAL (localhost):
VITE_ENVIRONMENT=local

# Para trabajar en RED (20.64.150.5):
VITE_ENVIRONMENT=network
```

¡Eso es todo! Solo cambia esa línea y reinicia el servidor.

---

## 🎯 Comandos Disponibles

### Modo LOCAL (localhost)
```bash
cd frontend
npm start
```
Este comando:
- ✅ Inicia el frontend en `http://localhost:5173`
- ✅ Inicia el backend en `http://localhost:8000`
- ✅ Funciona con `VITE_ENVIRONMENT=local`

### Modo NETWORK (red)
```bash
cd frontend
npm run start:full
```
Este comando:
- ✅ Inicia el frontend en `http://0.0.0.0:5173` (accesible desde la red)
- ✅ Inicia el backend en `http://0.0.0.0:8000` (accesible desde la red)
- ✅ Funciona con `VITE_ENVIRONMENT=network`

### Solo Frontend
```bash
cd frontend
npm run dev
```

### Solo Backend
```bash
cd frontend
npm run backend-only
```

---

## 🔧 Configuración Completa

El archivo `.env` contiene todas las configuraciones:

```env
# CONFIGURACIÓN DEL ENTORNO
# Cambia esta línea entre 'local' o 'network' según necesites
VITE_ENVIRONMENT=local

# Configuración LOCAL (localhost)
VITE_API_URL_LOCAL=http://localhost:8000/api
VITE_BACKEND_URL_LOCAL=http://localhost:8000

# Configuración NETWORK (red)
VITE_API_URL_NETWORK=http://20.64.150.5:8000/api
VITE_BACKEND_URL_NETWORK=http://20.64.150.5:8000

# Puerto del frontend
VITE_PORT=5173
```

---

## 📋 Checklist de Inicio

1. ✅ Asegúrate de tener el archivo `.env` en `frontend/`
2. ✅ Verifica que `VITE_ENVIRONMENT` esté configurado correctamente
3. ✅ Ejecuta el comando según el modo que necesites
4. ✅ Verifica en la consola que aparezca el mensaje correcto:
   - `🚀 Modo: LOCAL` o `🚀 Modo: NETWORK`

---

## 🐛 Solución de Problemas

### El proyecto no arranca
- Verifica que el archivo `.env` exista en `frontend/`
- Asegúrate de haber ejecutado `npm install` en `frontend/`
- Verifica que Python y el entorno virtual estén activos para el backend

### No se conecta a la API
- Verifica que `VITE_ENVIRONMENT` esté configurado correctamente
- Revisa la consola del navegador, debe mostrar el mensaje con la URL de la API
- Asegúrate de que el backend esté corriendo

### Cambié el .env pero no funciona
- Detén el servidor (Ctrl+C)
- Reinicia el servidor con `npm start` o `npm run start:full`
- Los cambios en `.env` requieren reiniciar Vite

---

## 📌 Notas Importantes

- El archivo `.env` **NO** debe subirse a Git (ya está en `.gitignore`)
- Usa `.env.example` como plantilla si necesitas crear un nuevo `.env`
- La base de datos siempre apunta a Azure, independiente del modo
- Los cambios en `.env` requieren reiniciar el servidor

---

## 🎉 Resumen Rápido

**Para trabajar en LOCAL:**
1. Abre `frontend/.env`
2. Cambia a `VITE_ENVIRONMENT=local`
3. Ejecuta `npm start`

**Para trabajar en RED:**
1. Abre `frontend/.env`
2. Cambia a `VITE_ENVIRONMENT=network`
3. Ejecuta `npm run start:full`
