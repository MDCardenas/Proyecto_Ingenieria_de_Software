#!/bin/bash
echo "🧹 Limpiando puertos 5173 y 8000..."
sudo pkill -f "runserver 0.0.0.0:8000" || true
sudo pkill -f "vite" || true
sudo pkill -f "node.*5173" || true
sleep 2

echo "📦 Verificando dependencias del backend..."
cd ~/Proyecto_Ingenieria_de_Software/backend
./venv/bin/python manage.py collectstatic --noinput

echo "🚀 Iniciando aplicación..."
echo "📍 Frontend: http://20.64.150.5:5173"
echo "📍 Backend: http://20.64.150.5:8000"
echo "📍 Admin: http://20.64.150.5:8000/admin/"

cd ../frontend
npm run start:full