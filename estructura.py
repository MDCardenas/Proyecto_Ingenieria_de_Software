import os

# Ajusta estas rutas según la ubicación de tus carpetas
BACKEND_DIR = "backend"
FRONTEND_DIR = "frontend"
OUTPUT_FILE = "estructura_directorio.txt"

def listar_backend(ruta_base):
    estructura = []
    for root, dirs, files in os.walk(ruta_base):
        nivel = root.replace(ruta_base, "").count(os.sep)
        indent = "    " * nivel
        estructura.append(f"{indent}{os.path.basename(root)}/")
        for f in files:
            estructura.append(f"{indent}    {f}")
    return estructura

def listar_frontend(ruta_base):
    estructura = [os.path.basename(ruta_base) + "/"]

    for item in os.listdir(ruta_base):
        ruta_item = os.path.join(ruta_base, item)

        # Si es la carpeta src -> recorrer completamente
        if item.lower() == "src":
            for root, dirs, files in os.walk(ruta_item):
                nivel = root.replace(ruta_base, "").count(os.sep)
                indent = "    " * nivel
                estructura.append(f"{indent}{os.path.basename(root)}/")
                for f in files:
                    estructura.append(f"{indent}    {f}")

        # Si es un archivo suelto -> agregarlo directamente
        elif os.path.isfile(ruta_item):
            estructura.append(f"    {item}")

        # Si es una carpeta que NO es src -> no entrar
        else:
            estructura.append(f"    {item}/  (omitida)")

    return estructura

def generar_archivo():
    estructura_final = ["ESTRUCTURA DE DIRECTORIO\n"]

    # Backend
    estructura_final.append("\n[BACKEND]\n")
    estructura_final += listar_backend(BACKEND_DIR)

    # Frontend
    estructura_final.append("\n\n[FRONTEND]\n")
    estructura_final += listar_frontend(FRONTEND_DIR)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(estructura_final))

    print(f"Estructura generada en: {OUTPUT_FILE}")

# Ejecutar
if __name__ == "__main__":
    generar_archivo()
