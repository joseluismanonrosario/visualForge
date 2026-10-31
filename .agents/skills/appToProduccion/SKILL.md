---
name: appToProduccion
description: >-
  Convierte la aplicación web VisualForge Studio (React 19 + Vite) en un ejecutable nativo .exe para Windows (instalador y versión portable independiente) usando Electron y Electron Builder.
  Incluye la regla obligatoria de evaluación y actualización de versión SemVer en la app (package.json, CHANGELOG.md, README.md, especificaciones) antes de empaquetar.
  Úsalo ÚNICA Y EXCLUSIVAMENTE cuando el usuario lo invoque o solicite de forma explícita llamando a 'appToProduccion' o pidiendo compilar/empaquetar esta aplicación a .exe para producción.
---

# Skill: appToProduccion (VisualForge Studio -> Windows .EXE)

Este skill proporciona el procedimiento completo y automatizado para empaquetar **VisualForge Studio** (aplicación web desarrollada en React 19, Vite y Tailwind CSS v4) en una aplicación de escritorio de alto rendimiento para Windows con binarios ejecutables `.exe` independientes (instalador NSIS y ejecutable portable).

> [!IMPORTANT]
> **Condición de Ejecución**: Este skill está configurado bajo demanda progresiva. Se ejecuta **única y exclusivamente** cuando el usuario lo llame de forma explícita (ej. `"ejecuta appToProduccion"`, `"appToProduccion"` o `"convierte la app a .exe"`). No debe ejecutarse automáticamente ni por iniciativa propia.

---

## 1. Regla Obligatoria de Evaluación y Actualización de Versión (SemVer Auto-Bump)

> [!CAUTION]
> **REGLA MANDATORIA**: Antes de compilar el frontend (`npm run build`) y lanzar Electron Builder, es **obligatorio** evaluar si los cambios acumulados en el código, funcionalidades, componentes o correcciones ameritan un cambio de versión según las directrices de Versionado Semántico (SemVer 2.0.0: `MAJOR.MINOR.PATCH`). Si amerita un cambio de versión (o si la versión en `package.json` está desactualizada respecto a los últimos cambios o a `CHANGELOG.md`), **se debe cambiar la versión en la app inmediatamente antes de empaquetar**.

### Criterios de Evaluación SemVer:
1. **MAJOR (`X.0.0`)**: Se incrementa cuando existen cambios incompatibles con versiones anteriores (ruptura de retrocompatibilidad), tales como cambios estructurales en el formato de guardado `.vforge`, eliminación o alteración de esquemas clave en `CanvasNode`, o rediseños de la API interna que impidan abrir proyectos antiguos.
2. **MINOR (`0.X.0`)**: Se incrementa cuando se agregan nuevas funcionalidades, herramientas o componentes de diseño manteniendo 100% la compatibilidad hacia atrás (ej. nuevos tipos de componentes en el catálogo, nuevos paneles, soporte para desacoplamiento responsivo, proyectos recientes, historial extendido a 100 pasos).
3. **PATCH (`0.0.X`)**: Se incrementa cuando se aplican correcciones de errores (*bug fixes*), ajustes cosméticos o mejoras de interfaz sin alterar la estructura del proyecto ni introducir nuevas APIs mayores (ej. ajustes en el Splash Screen, alineación de iconos en la barra superior, ajuste de botones en status bar, correcciones de espaciado o eliminación de alertas no deseadas).

### Acciones de Sincronización en la App al Detectar Cambio de Versión:
Cuando se determine un incremento de versión:
1. **Actualizar `package.json`**: Modificar el campo `"version": "X.Y.Z"` con el nuevo número de versión. Electron Builder toma este valor directamente para generar y bautizar los ejecutables `.exe`.
2. **Actualizar `CHANGELOG.md`**: Añadir la sección correspondiente a la nueva versión (`## [X.Y.Z] - AAAA-MM-DD`) especificando las adiciones, cambios y correcciones realizadas.
3. **Actualizar `README.md`**: Reflejar el nuevo número de versión en las referencias e insignias de versión.
4. **Actualizar `especificaciones_del_proyecto.md`**: Sincronizar la sección 11 para documentar la nueva versión y el historial de cambios, cumpliendo la *Regla de Sincronización Obligatoria de Especificaciones*.

---

## 2. Arquitectura de Empaquetado

- **Motor de Conversión**: **Electron** + **Electron Builder**.
- **Compatibilidad con Iconify y Assets**: El proceso principal de Electron (`electron/main.cjs`) incluye un servidor local HTTP ultraligero embebido en loopback (`127.0.0.1:<random-port>`) que sirve la carpeta `dist/` e intercepta las peticiones `/@iconify/` y `/api/iconify/`, garantizando que todo el catálogo de más de 400.000 iconos locales funcione al 100% sin conexión a internet y sin bloqueos de seguridad por protocolo `file://`.
- **Binarios Generados**:
  1. **VisualForge Studio Setup <versión>.exe**: Instalador estándar NSIS para Windows de 64 bits con accesos directos en escritorio y menú inicio.
  2. **VisualForge Studio <versión>.exe**: Ejecutable portable autocontenido que no requiere instalación.

---

## 3. Flujo de Ejecución Paso a Paso

Cuando el usuario invoque el skill, sigue estrictamente estos pasos en orden:

### Paso 0: Verificación y Actualización de Versión (SemVer)
1. Analizar los cambios pendientes o recientes introducidos en la app.
2. Si amerita un salto de versión (MAJOR, MINOR o PATCH) o si `package.json` difiere de la versión esperada:
   - Incrementar `"version"` en `package.json`.
   - Documentar la versión en `CHANGELOG.md`.
   - Actualizar las menciones en `README.md`.
   - Registrar la actualización en `especificaciones_del_proyecto.md`.

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
Si se requiere ejecutar los pasos de forma individual:

1. **Verificar y sincronizar versión en `package.json`**:
   Asegurar que `"version": "X.Y.Z"` tenga el valor correspondiente al release deseado.

2. **Crear la carpeta `electron/` y el archivo de proceso principal `electron/main.cjs`**:
   Copiar desde `.agents/skills/appToProduccion/resources/main.cjs` a `electron/main.cjs`.

3. **Configurar `electron-builder.json` en la raíz del proyecto**:
   Copiar desde `.agents/skills/appToProduccion/resources/electron-builder.json` a `electron-builder.json`.

4. **Verificar scripts de `package.json`**:
   Asegurar que `package.json` cuente con:
   ```json
   {
     "main": "electron/main.cjs",
     "scripts": {
       "electron:build": "tsc -b && vite build && electron-builder --win"
     }
   }
   ```

5. **Instalar dependencias de empaquetado**:
   ```bash
   npm install --save-dev electron electron-builder
   ```

6. **Compilar el frontend con Vite**:
   ```bash
   npm run build
   ```

7. **Empaquetar para Windows con Electron Builder**:
   ```bash
   npx electron-builder --win
   ```

---

## 4. Verificación y Resultados

Tras finalizar el proceso:
1. Revisa los archivos generados en la carpeta `release/`:
   - `release/VisualForge Studio Setup <versión>.exe` (Instalador NSIS)
   - `release/VisualForge Studio <versión>.exe` (Portable)
2. Reporta al usuario la ruta completa de los ejecutables, su versión exacta y su tamaño en MB.

---

## 5. Recursos del Skill

- Script ejecutable: [build-exe.ps1](./scripts/build-exe.ps1)
- Plantilla Main Process: [main.cjs](./resources/main.cjs)
- Plantilla Builder Config: [electron-builder.json](./resources/electron-builder.json)
