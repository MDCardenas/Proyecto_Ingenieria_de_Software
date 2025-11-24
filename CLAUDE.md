# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Joyas Charlys** - Full-stack jewelry management system with Django REST Framework backend and React frontend for managing inventory, sales, quotations, invoices, and work orders.

## Tech Stack

- **Backend**: Django 5.2.6 + Django REST Framework + mssql-django
- **Frontend**: React 19 + Vite + SCSS
- **Database**: SQL Server (Azure-hosted: joyas-app.database.windows.net)
- **Key Libraries**: axios, jspdf, html2canvas, recharts, react-hook-form, react-hot-toast

## Development Commands

### Backend (Django)

```bash
# Activate virtual environment
.\env\Scripts\activate  # Windows
source env/bin/activate # Linux/Mac

# Install dependencies
pip install -r backend/requirements.txt

# Run development server
cd backend
python manage.py runserver 0.0.0.0:8000

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Access admin panel
# http://localhost:8000/admin/
```

### Frontend (React + Vite)

```bash
# Install dependencies
cd frontend
npm install

# Run development server (port 5173)
npm run dev

# Run both frontend and backend concurrently
npm run start:full

# Build for production
npm build

# Lint code
npm run lint
```

### Full Project Startup

From the frontend directory:
```bash
npm run start:full
```
This concurrently starts both the Vite dev server (port 5173) and Django backend (port 8000).

## Architecture

### Backend Structure

The Django backend uses **database-first design** with unmanaged models (`managed = False`). Models are auto-generated from existing SQL Server tables and should not be modified to create/alter tables.

**Key Apps:**
- **api/**: Main application containing all business logic
  - `models.py`: Auto-generated Django models mirroring SQL Server schema (11 main business models + Django auth models)
  - `serializers.py`: DRF serializers for API responses
  - `views.py`: ViewSets and API views for all endpoints
  - `urls.py`: URL routing using DefaultRouter + custom endpoints

- **dashboard/**: Dashboard-specific views and analytics
  - Dashboard endpoints for business metrics
  - Sales reports and inventory alerts

**Important Model Relationships:**
- `TblClientes` (customers) → used in `TblFacturas` and `TblCotizaciones`
- `TblEmpleados` (employees) → links to `PerfilesEmpleados` (roles/profiles)
- `TblFacturas` (invoices) → has `TblDetallesFactura` (line items) and generates `TblOrdenesTrabajo` (work orders)
- `TblCotizaciones` (quotations) → can be converted to `TblFacturas` via `numero_factura_conversion`
- Inventory models: `TblStockJoyas`, `TblStockMateriales`, `TblStockInsumos` → all link to `TblProvedores` (suppliers)

**Key Backend Patterns:**
- ViewSets registered in router for CRUD operations
- Custom endpoints for complex operations (conversion, estado_pago, anular)
- File uploads handled via `MEDIA_ROOT` (backend/media/)
- CORS enabled for all origins in development

### Frontend Structure

React SPA with modular component architecture organized by business domain:

**Pages (Role-based panels):**
- `Adminpanel.jsx`: Administrator view
- `Gerente.jsx`: Manager view
- `EmployeePanel.jsx`: Employee view
- `Login.jsx`: Authentication

**Module Organization:**
Each business domain has its own module directory under `src/components/`:
- `ClientesModule/`: Customer management (register, search, delete, quick actions)
- `CotizacionesModule/`: Quotation workflow (headers, filters, lists, product selection, additional data)
- `FacturacionModule/`: Invoicing (customer data, products, invoice format, detail modal)
- `InventarioModule/`: Inventory management (joyas, materiales, insumos) with custom hooks
- `VentasModule/`: Sales tracking and lists
- `ContabilidadModule/`: Accounting (movement items, summary cards)
- `DashboardModule/`: Analytics dashboard with recharts
- `OrdenesModule/`: Work order management
- `ProveedoresModule/`: Supplier management
- `UsuariosModule/`: User/employee management

**Special Components:**
- `cotizacionesComponentes/`: PDF generation components using jspdf + html2canvas
  - Separate formats for fabrication (`FormatoCotizacionFabricacion`) and repair (`FormatoCotizacionReparacion`)
  - Modal for quotation type selection and viewing

**Shared Components:**
- `Navegation.jsx`: Top navigation bar
- `Sidebar.jsx`: Side menu with role-based items

**Services:**
- `api.js`: Axios instance configured for backend communication (baseURL: http://20.64.150.5:8000/api)
- `menuItems.js`: Menu configuration for different user roles

**Styling:**
- SCSS architecture in `styles/scss/`:
  - `abstracts/`: variables, mixins
  - `base/`: reset styles
  - `components/`: component-specific styles (30+ partial files)
  - `pages/`: page-level styles
  - Main entry: `main.scss`

### Database Schema Notes

**Critical constraints:**
- `numero_identidad` is unique in `Tbl_Clientes`
- Models use `db_collation='Modern_Spanish_CI_AS'`
- Auto-increment PKs: `id_cliente`, `numero_factura`, `numero_cotizacion`, etc.
- `managed = False` on all business models - Django does NOT create/modify these tables

**Estado/Status fields:**
- `TblCotizaciones.estado`: ACTIVA (default) or ANULADA
- `TblFacturas.estado_pago`: PENDIENTE (default), PAGADA, CANCELADA
- `TblOrdenesTrabajo.estado`: PENDIENTE, EN_PROCESO, COMPLETADA, CANCELADA

**Important computed fields:**
- All financial documents calculate: `subtotal`, `descuento`, `isv` (tax), `total`
- Inventory tracks `cantidad_existencia`, `costo`, `precio_venta`

## Configuration Notes

**Database Connection (backend/backend/settings.py):**
- Engine: `mssql` (via mssql-django)
- Driver: ODBC Driver 18 for SQL Server
- Connection requires: `TrustServerCertificate=yes`
- Currently configured for Azure SQL Server

**API Communication:**
- Backend serves on: `http://20.64.150.5:8000`
- Frontend dev server: `http://20.64.150.5:5173`
- API base path: `/api/`
- Vite proxy configured for `/api` requests

**CORS:**
- `CORS_ALLOW_ALL_ORIGINS = True` in development
- All standard HTTP methods allowed
- Custom headers configured for CSRF and auth

## Common Workflows

### Adding a New Endpoint

1. Define view in `backend/api/views.py` (ViewSet or APIView)
2. Create serializer in `backend/api/serializers.py` if needed
3. Register in `backend/api/urls.py` (router or urlpatterns)
4. Call from frontend via `api.js` axios instance

### Adding a New Inventory Item Type

1. Verify table exists in SQL Server
2. Add model in `backend/api/models.py` with `managed = False`
3. Create serializer and ViewSet
4. Add to router and update frontend forms

### Creating PDF Documents

Use the pattern in `cotizacionesComponentes/`:
1. Create HTML template component
2. Use `html2canvas` to capture as image
3. Generate PDF with `jspdf`
4. Download or upload to backend `/media/`

## Testing

No automated test suite currently configured. Manual testing through the UI and Django admin panel.

## Deployment

The `startproject.sh` script:
- Kills existing processes on ports 5173 and 8000
- Runs `collectstatic`
- Starts both frontend and backend
- Configured for deployment at IP 20.64.150.5
