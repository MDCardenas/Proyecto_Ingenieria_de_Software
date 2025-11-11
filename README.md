# Joyas Charlys - Sistema de Gestión

Este proyecto incluye un backend en Django y un frontend en React para la gestión de joyería.

## Requisitos

- Python 3.11+ y pip
- Node.js 18+ y npm
- SQL Server (con la base de datos `JOYERIA` y las tablas necesarias)
- ODBC Driver 18 for SQL Server (para conexión Django-SQL Server)
- Powershell (Windows recomendado)

## Instalación

### 1. Clona el repositorio

```sh
git clone https://github.com/MDCardenas/Proyecto_Ingenieria_de_Software
cd Proyecto_Ingenieria_de_Software
```

## iniciar el entorno virtual y las dependencias del backend

```sh
en el directorio principal
abrir una terminal y ejecutar:
python -m venv env
.\env\Scripts\activate  # Windows
una vez activado el entorno virtual, instalar las dependencias:
pip install -r backend/requirements.txt

pueden crear un script en powershell para automatizar este proceso.
# ejemplo de script setup_env.ps1
.\env\Scripts\activate
```

## Configura la base de datos

```sh
Asegúrate de tener SQL Server instalado y en ejecución.
se usara el driver ODBC Driver 18 for SQL Server asi que debe estar instalado.
importante: restaturar la base de datos JOYERIA con las tablas necesarias.
Configura las credenciales de la base de datos en `backend/joyeria/settings.py`.
DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': 'JOYERIA',
        'USER': 'tu_usuario',
        'PASSWORD': 'tu_contraseña',    
        'HOST': 'localhost',
        'PORT': '1433',
        'OPTIONS': {
            'driver': 'ODBC Driver 18 for SQL Server',
            'extra_params': 'TrustServerCertificate=yes;',
        },

```

### 3. Ejecuta las migraciones

```sh
cd backend
python manage.py migrate
```

### 4. Instala las dependencias del frontend

```sh
cd frontend
npm install
```

### 5. Ejecuta el servidor de desarrollo

```sh
cd /frontend
npm start
```


## 🧾 Nuevas dependencias agregadas

Se han agregado las siguientes dependencias al proyecto:

- [`jspdf`](https://www.npmjs.com/package/jspdf): permite generar archivos PDF directamente desde el navegador.
- [`html2canvas`](https://www.npmjs.com/package/html2canvas): convierte elementos HTML en imágenes para integrarlos en los PDF.
- [`react-icons`](https://www.npmjs.com/package/react-icons): provee una amplia colección de íconos listos para usar en componentes React.

### 🔧 Instalación

Después de actualizar el repositorio, ejecuten el siguiente comando para instalar las nuevas dependencias:

```bash
npm install jspdf html2canvas react-icons
```

## 🧾 Nuevas dependencias agregadas

Se han agregado las siguientes dependencias el Dashboard:

- [`rechart`](https://www.npmjs.com/package/recharts): El objetivo principal de esta biblioteca es ayudarle a escribir gráficos en aplicaciones React sin ningún problema.

```bash
npm install recharts
```
Tambien es necesario instalar dependencia para Django, con el entorno activo ejecutamos el siguiente comando:

```bash
pip install django-cors-headers
```
