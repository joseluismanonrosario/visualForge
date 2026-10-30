---
name: appToProduccion
description: >-
  Convierte la aplicación web VisualForge Studio (React 19 + Vite) en un ejecutable nativo .exe para Windows (instalador y versión portable independiente) usando Electron y Electron Builder.
  Úsalo ÚNICA Y EXCLUSIVAMENTE cuando el usuario lo invoque o solicite de forma explícita llamando a 'appToProduccion' o pidiendo compilar/empaquetar esta aplicación a .exe para producción.
---

# Skill: appToProduccion (VisualForge Studio -> Windows .EXE)

Este skill proporciona el procedimiento completo y automatizado para empaquetar **VisualForge Studio** (aplicación web desarrollada en React 19, Vite y Tailwind CSS v4) en una aplicación de escritorio de alto rendimiento para Windows con binarios ejecutables `.exe` independientes (instalador NSIS y ejecutable portable).

> [!IMPORTANT]
> **Condición de Ejecución**: Este skill está configurado bajo demanda progresiva. Se ejecuta **única y exclusivamente** cuando el usuario lo llame de forma explícita (ej. `"ejecuta appToProduccion"`, `"appToProduccion"` o `"convierte la app a .exe"`). No debe ejecutarse automáticamente ni por iniciativa propia.

---

## 1. Arquitectura de Empaquetado

- **Motor de Conversión**: **Electron** + **Electron Builder**.
- **Compatibilidad con Iconify y Assets**: El proceso principal de Electron (`electron/main.cjs`) incluye un servidor local HTTP ultraligero embebido en loopback (`127.0.0.1:<random-port>`) que sirve la carpeta `dist/` e intercepta las peticiones `/@iconify/` y `/api/iconify/`, garantizando que todo el catálogo de más de 400.000 iconos locales funcione al 100% sin conexión a internet y sin bloqueos de seguridad por protocolo `file://`.
- **Binarios Generados**:
  1. **VisualForge Studio Setup <versión>.exe**: Instalador estándar NSIS para Windows de 64 bits con accesos directos en escritorio y menú inicio.
  2. **VisualForge Studio <versión>.exe**: Ejecutable portable autocontenido que no requiere instalación.

---

## 2. Flujo de Ejecución Paso a Paso

Cuando el usuario invoque el skill, sigue estos pasos:

### Paso 1: Ejecutar el script automatizado
Ejecuta el script PowerShell preparado en `scripts/build-exe.ps1`:
```powershell
powershell -ExecutionPolicy Bypass -File .agents/skills/appToProduccion/scripts/build-exe.ps1
```

O si el usuario solicita únicamente la versión portable:
```powershell
powershell -ExecutionPolicy Bypass -File .agents/skills/appToProduccion/scripts/build-exe.ps1 -PortableOnly
```

### Paso 2: Flujo manual equivalente (si se requiere depuración paso a paso)
Si por alguna razón se prefiere ejecutar los pasos de forma individual:

1. **Crear la carpeta `electron/` y el archivo de proceso principal `electron/main.cjs`**:
   Copiar desde `.agents/skills/appToProduccion/resources/main.cjs` a `electron/main.cjs`.

2. **Configurar `electron-builder.json` en la raíz del proyecto**:
   Copiar desde `.agents/skills/appToProduccion/resources/electron-builder.json` a `electron-builder.json`.

3. **Verificar `package.json`**:
   Asegurar que `package.json` cuente con:
   ```json
   {
     "main": "electron/main.cjs",
     "scripts": {
       "electron:build": "tsc -b && vite build && electron-builder --win"
     }
   }
   ```

4. **Instalar dependencias de empaquetado**:
   ```bash
   npm install --save-dev electron electron-builder
   ```

5. **Compilar el frontend con Vite**:
   ```bash
   npm run build
   ```

6. **Empaquetar para Windows con Electron Builder**:
   ```bash
   npx electron-builder --win
   ```

---

## 3. Verificación y Resultados

Tras finalizar el proceso:
1. Revisa los archivos generados en la carpeta `release/`:
   - `release/VisualForge Studio Setup 1.0.0.exe` (Instalador NSIS)
   - `release/VisualForge Studio 1.0.0.exe` (Portable)
2. Reporta al usuario la ruta completa de los ejecutables y su tamaño en MB.

---

## 4. Recursos del Skill

- Script ejecutable: [build-exe.ps1](./scripts/build-exe.ps1)
- Plantilla Main Process: [main.cjs](./resources/main.cjs)
- Plantilla Builder Config: [electron-builder.json](./resources/electron-builder.json)
