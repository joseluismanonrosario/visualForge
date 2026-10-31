# VisualForge Studio

<p align="center">
  <img src="public/logos/logo-blue.png" alt="VisualForge Logo" width="80" height="80" />
</p>

<p align="center">
  <strong>Entorno Visual de Maquetación y Prototipado Web de Nueva Generación estilo Figma</strong>
</p>

<p align="center">
  <a href="https://github.com/joseluismanonrosario/visualForge.git">
    <img src="https://img.shields.io/badge/GitHub-joseluismanonrosario%2FvisualForge-181717?style=flat-square&logo=github" alt="GitHub Repository" />
  </a>
  <img src="https://img.shields.io/badge/React-19.0.0-61dafb?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.7.3-3178c6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4.0.9-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Vite-6.2.0-646cff?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Electron-45.1.0-47848F?style=flat-square&logo=electron" alt="Electron" />
  <img src="https://img.shields.io/badge/Version-1.4.7-emerald?style=flat-square" alt="Version 1.4.7" />
</p>

---

## 📌 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Características Principales](#-características-principales)
- [Formato de Archivo Personalizado (`.vforge`)](#-formato-de-archivo-personalizado-vforge)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Uso](#-instalación-y-uso)
  - [Requisitos Previos](#requisitos-previos)
  - [Entorno de Desarrollo Web](#entorno-de-desarrollo-web)
  - [Compilación para Producción](#compilación-para-producción)
  - [Generación de Ejecutables Nativos (.exe)](#generación-de-ejecutables-nativos-exe)
- [Directrices de Versionado Semántico (SemVer)](#-directrices-de-versionado-semántico-semver)
  - [1. Versión MAJOR (X.0.0)](#1-versión-major-x00)
  - [2. Versión MINOR (0.X.0)](#2-versión-minor-0x0)
  - [3. Versión PATCH (0.0.X)](#3-versión-patch-00x)
- [Control de Versiones y Changelog](#-control-de-versiones-y-changelog)
- [Repositorio y Enlaces](#-repositorio-y-enlaces)
- [Licencia](#-licencia)

---

## 🚀 Descripción General

**VisualForge Studio** es una aplicación de maquetación y diseño visual drag-and-drop con interfaz inspirada en herramientas modernas como Figma. Permite construir interfaces web de alta fidelidad basadas en componentes de **shadcn/ui**, **Bootstrap 5/6**, iconos vectoriales (**Lucide** y **FontAwesome 5 Free**), diseño responsivo independiente desacoplado por dispositivo, persistencia en disco con extensión propia `.vforge`, e integración especializada para hardware y proyectos IoT con microcontroladores **ESP32**.

La aplicación funciona tanto en el navegador web estándar como en versión de escritorio nativa independiente para Windows empaquetada mediante **Electron** y **Electron Builder**.

---

## ✨ Características Principales

- **Lienzo Visual con Drag-and-Drop Inteligente**:
  - Inserción directa de elementos tanto en el lienzo raíz como anidados en contenedores existentes.
  - Delineado limpio de selección única (sin duplicidad de trazos).
  - Pan y Zoom fluido (40% a 200%) con controles dedicados y restablecimiento rápido a 100%.

- **Diseño Responsivo con Breakpoints Desacoplados**:
  - Tres contextos de pantalla independientes: **Desktop (1440px)**, **Tablet (768px)** y **Móvil (375px)**.
  - Aislamiento total de estilos, dimensiones, posicionamiento y visibilidad por dispositivo sin alterar la vista Desktop ni sobreescribir configuraciones previas.

- **Persistencia de Proyectos `.vforge`**:
  - Serialización y deserialización completa del estado en memoria a formato JSON estructurado.
  - Guardado directo en disco para archivos con ruta establecida y diálogo interactivo nativo para proyectos nuevos o "Guardar como..." (`Ctrl+Shift+S`).
  - Detección precisa de cambios no guardados con indicador dinámico (puntico azul conmutante a equis en hover) y flujo inteligente de cierre con confirmación.

- **Motor de Historial Avanzado (Undo / Redo)**:
  - Pila de historial de hasta 100 pasos hacia atrás (`Ctrl+Z` / `Ctrl+Shift+Z` o `Ctrl+Y`).
  - Detección del punto guardado: el indicador de cambios no grabados se desactiva si se retrocede hasta el estado exacto coincidente con el archivo en disco.

- **Barra de Estado Inferior Multifunción**:
  - Conmutador integrado de dispositivos de pantalla (*Desktop*, *Tablet*, *Móvil*) ubicado en el centro del status bar.
  - Controles de zoom con botones de aumento/reducción y porcentaje monoespaciado en la esquina derecha.
  - Indicador de estado "Listo" y recuento en tiempo real de nodos en el lienzo.

- **Pantalla de Bienvenida y Proyectos Recientes**:
  - Lista optimizada en dos líneas: Línea 1 para el nombre completo con efecto hover marquee fluido; Línea 2 para el tipo de proyecto y fecha en tipografía homogénea compacta.
  - Ordenación dinámica al hacer clic en columnas (por fecha o alfabéticamente por nombre).
  - Apertura directa e instantánea con un clic.
  - Límite optimizado de hasta 15 proyectos para rendimiento óptimo.

- **Soporte de Hardware & IoT (ESP32)**:
  - Biblioteca de componentes especializados: interruptores de relé, sliders PWM, status badges, medidores analógicos y displays de telemetría.
  - Mapeo de pines GPIO, tópicos MQTT y endpoints REST integrados con exportación a sketch de Arduino C++.

- **Exportación Multiformato Limpia**:
  - Generación de código nativo para **HTML5 / CSS / Vanilla JS**, **React Web (Tailwind / Lucide)** y **ESP32 C++ (Arduino WebServer)**.

- **Splash Screen Compacto**:
  - Animación de carga proporcionada con tipografía uniforme y barra de progreso delimitada a su contenedor.

---

## 📄 Formato de Archivo Personalizado (`.vforge`)

Los proyectos se guardan en texto plano estructurado bajo formato JSON con la extensión `.vforge`:

```json
{
  "format": "visualforge",
  "version": "1.0",
  "generator": "VisualForge Studio",
  "createdAt": "2026-10-31T00:00:00.000Z",
  "updatedAt": "2026-10-31T00:00:00.000Z",
  "project": {
    "name": "MiProyecto",
    "type": "react"
  },
  "canvas": {
    "settings": {
      "width": 1440,
      "height": 900,
      "background": "#ffffff"
    },
    "viewportMode": "desktop",
    "zoom": 1.0
  },
  "elements": [
    {
      "id": "node_1",
      "type": "container",
      "name": "Hero Section",
      "style": { "display": "flex", "padding": "24px" },
      "responsiveStyles": {
        "tablet": { "flexDirection": "column" },
        "mobile": { "padding": "12px", "width": "100%" }
      },
      "hiddenIn": [],
      "props": {},
      "children": []
    }
  ]
}
```

---

## 📂 Estructura del Proyecto

```text
winWebFormApp/
├── electron/
│   ├── main.cjs               # Proceso principal de Electron (IPC, ventanas frameless)
│   └── preload.cjs            # Script puente seguro con contextBridge
├── public/
│   ├── logos/                 # Isotipos dinámicos según el tema activo
│   ├── splash-bg.png          # Fondo gráfico del Splash Screen
│   └── favicon.ico
├── src/
│   ├── components/            # Componentes de interfaz de usuario
│   │   ├── TopBar.tsx         # Cabecera con marca, nombre centrado y acciones
│   │   ├── Canvas.tsx         # Lienzo de diseño drag-and-drop
│   │   ├── LeftSidebar.tsx    # Árbol de capas y catálogo de componentes
│   │   ├── RightSidebar.tsx   # Inspector de estilos CSS y propiedades de nodos
│   │   ├── FloatingToolbox.tsx# Barra flotante de herramientas de selección y diseño
│   │   ├── SplashScreen.tsx   # Pantalla de carga compacta inicial
│   │   └── ProjectCreationScreen.tsx # Pantalla de inicio, creación y recientes
│   ├── types/                 # Definiciones de TypeScript y modelos de datos
│   ├── utils/                 # Utilidades (persistencia, árbol, historial, exportación)
│   ├── data/                  # Catálogo de componentes y plantillas
│   ├── App.tsx                # Componente raíz y orquestador del estado global
│   ├── main.tsx               # Punto de entrada de React 19
│   └── index.css              # Estilos base de Tailwind CSS v4 y animaciones
├── especificaciones_del_proyecto.md # Documento de sincronización mandatoria
├── package.json               # Dependencias y scripts de compilación
├── README.md                  # Este documento
└── CHANGELOG.md               # Registro histórico de versiones
```

---

## 🛠 Instalación y Uso

### Requisitos Previos

- **Node.js**: v18.0.0 o superior (recomendado v20+ o v24).
- **npm**: v9.0.0 o superior.

### Entorno de Desarrollo Web

Clonar el repositorio e instalar las dependencias:

```bash
# Clonar el repositorio
git clone https://github.com/joseluismanonrosario/visualForge.git

# Acceder al directorio
cd visualForge

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo con Vite
npm run dev
```

La aplicación estará disponible localmente en `http://localhost:5173`.

### Compilación para Producción

Para compilar el proyecto optimizado para la web:

```bash
npm run build
```

Genera los archivos minificados y empaquetados en el directorio `dist/`.

### Generación de Ejecutables Nativos (.exe)

Para compilar la aplicación de escritorio nativa para Windows (instalador y versión portable):

```bash
npm run electron:build
```

Los instaladores e imágenes portables se generarán en la carpeta `release/`.

---

## 📐 Directrices de Versionado Semántico (SemVer)

VisualForge Studio sigue estrictamente el estándar de **Versionado Semántico 2.0.0** (`MAJOR.MINOR.PATCH`). Desde la perspectiva del desarrollador y del mantenimiento del motor de diseño, se aplican las siguientes reglas determinantes:

### 1. Versión MAJOR (X.0.0)

El incremento de la versión **MAJOR** indica cambios incompatibles hacia atrás que rompen la interoperabilidad con versiones previas del software o con proyectos guardados en versiones anteriores.

**Criterios determinantes para subir versión MAJOR:**
- **Ruptura del esquema del archivo `.vforge`**:
  - Modificación estructural de la raíz del JSON (por ejemplo, renombrar `elements` a `nodes` o cambiar la estructura jerárquica de árbol a un grafo plano sin migrador de compatibilidad).
  - Cambio en el identificador obligatorio de formato (`"format": "visualforge"`).
  - Eliminación o renombramiento destructivo de campos esenciales del modelo `CanvasNode` (como `id`, `type`, o `responsiveStyles`).
- **Incompatibilidad del motor de renderizado**:
  - Cambios fundamentales en cómo se interpretan las coordenadas, anclajes o unidades base (por ejemplo, pasar de píxeles absolutos/relativos a un sistema de coordenadas vectoriales incompatibles).
- **Eliminación o reemplazo de librerías base de componentes sin capa de fallback**:
  - Deprecación de familias enteras de componentes de modo que un proyecto antiguo no pueda dibujarse o crashee al deserializarse.
- **Cambio de paradigma en persistencia**:
  - Reemplazo del formato JSON por esquemas binarios o incompatibles sin mecanismo automático de migración hacia atrás.

**Ejemplos de escenarios MAJOR:**
- `v1.4.1` → `v2.0.0`: Se reestructura el modelo de datos de nodos para admitir un motor de layout 3D/Canvas WebGL donde los nodos ya no poseen propiedades CSS planas sino matrices de transformación que no pueden ser interpretadas por `v1.x`.
- Se elimina el soporte para deserializar archivos `.vforge` generados bajo versiones beta tempranas que no poseían la propiedad `version: "1.0"`.

---

### 2. Versión MINOR (0.X.0)

El incremento de la versión **MINOR** indica la incorporación de nuevas funcionalidades, capacidades o mejoras que **mantienen 100% la compatibilidad hacia atrás**. Los archivos `.vforge` creados en versiones anteriores continúan abriéndose, editándose y renderizándose de forma idéntica.

**Criterios determinantes para subir versión MINOR:**
- **Nuevas características y herramientas de edición**:
  - Incorporación de nuevas vistas de dispositivos o breakpoints (por ejemplo, soporte para *Ultra-Wide 4K* o *Smartwatch*) con valores por defecto que no alteran los tres breakpoints existentes.
  - Adición de nuevos componentes al catálogo (`componentCatalog.ts`), como nuevos sensores IoT o componentes de interfaz shadcn/ui adicionales.
  - Nuevos motores de exportación de código (por ejemplo, exportación a *Next.js App Router*, *Vue 3* o *Svelte 5*).
- **Extensiones no destructivas al modelo de datos**:
  - Nuevos atributos opcionales dentro de `props` o `responsiveStyles` (por ejemplo, `animation`, `customEvents`, `zDepth`) con fallbacks seguros en caso de estar ausentes en archivos antiguos.
- **Nuevas capacidades en la gestión de proyectos**:
  - Funcionalidades como historial de proyectos recientes, filtros de búsqueda avanzados, gestión de paletas de color personalizadas o integración con repositorios remotos.

**Ejemplos de escenarios MINOR:**
- `v1.1.0`: Introducción del sistema de persistencia y serialización `.vforge` nativo con cuadros de diálogo del sistema operativo.
- `v1.2.0`: Incorporación de la arquitectura de diseño responsivo desacoplado por breakpoints (*Desktop*, *Tablet*, *Móvil*).
- `v1.3.0`: Sistema de proyectos recientes con ordenación dinámica y apertura directa con un clic.
- `v1.4.0`: Motor de historial con hasta 100 pasos de Deshacer/Rehacer y máquina de estados de cambios no guardados.

---

### 3. Versión PATCH (0.0.X)

El incremento de la versión **PATCH** corresponde a correcciones de errores (*bug fixes*), ajustes cosméticos, optimizaciones de rendimiento y refinamientos de interfaz que no introducen nuevas características principales ni alteran la compatibilidad de datos.

**Criterios determinantes para subir versión PATCH:**
- **Corrección de errores funcionales o visuales**:
  - Eliminar delineados dobles no deseados en la selección del lienzo.
  - Corregir cálculos de coordenadas al arrastrar elementos o al redimensionar.
  - Subsanar desbordamientos visuales (por ejemplo, ajustar la barra de carga del Splash Screen para que no sobresalga de su contenedor).
- **Ajustes de texto, etiquetas y microinteracciones**:
  - Modificar el texto de un botón (por ejemplo, cambiar "Siguiente" a "Crear").
  - Ocultar alertas emergentes (*toasts*) no solicitadas o redundantes.
  - Ajustar tamaños de tipografía para mantener uniformidad visual.
- **Refinamientos de diseño y ergonomía visual**:
  - Centrar geométricamente el grupo de título, icono e indicador de estado en la barra superior.
  - Reubicar controles en barras de estado para mejorar el espacio de trabajo.
  - Implementar animaciones de desplazamiento suave (*marquee*) en textos largos durante el estado hover.
- **Optimizaciones de rendimiento**:
  - Reducción de repintados innecesarios en el lienzo o memoización de selectores del árbol.

**Ejemplos de escenarios PATCH:**
- `v1.3.1`: Corrección del doble borde en selección de lienzo, inserción directa sin selección previa y remoción de alertas al limpiar el lienzo.
- `v1.4.1`: Traslado de los botones de dispositivos a la barra de estado inferior, centrado integral del grupo de nombre de proyecto en la cabecera, reducción del Splash Screen y animación hover marquee en archivos recientes.
- `v1.4.2`: Visualización de la versión activa en el Splash Screen, reubicación de los botones de tipo de pantalla al borde derecho de la barra de estado e incorporación de la regla de evaluación SemVer en `appToProduccion`.
- `v1.4.3`: Adopción del icono `icomoon-free:html-five2` para HTML5 y corrección del bloqueo por spinner infinito en el selector de iconos mediante cancelación asíncrona (`AbortController`), timeouts y servidor local con caché en memoria y `Content-Length`.
- `v1.4.4`: Persistencia física de proyectos recientes en disco local (`userData/recent-projects.json`) y estabilización del puerto de localhost (`48321`), asegurando que la lista de proyectos recientes se preserve fielmente al cerrar y volver a abrir la aplicación de escritorio.
- `v1.4.5`: Implementación de token criptográfico de sesión secreta en Electron contra accesos externos no autorizados (`403 Forbidden`), optimización masiva de velocidad de carga mediante code-splitting / streaming de chunks con Rollup, lazy loading del modal de exportación y gestión de memoria RAM con caché LRU acotada a 25 colecciones y 50 pasos de deshacer/rehacer.
- `v1.4.7`: Blindaje integral de seguridad: eliminación de script-src unsafe-inline en CSP, protección contra Prototype Pollution en deserialización de .vforge, sanitización profunda SVG contra XSS/XXE, encabezados HTTP de seguridad OWASP, restricción de métodos HTTP a GET/HEAD y revocación total de permisos del sistema en Electron.
- `v1.4.6`: Corrección de desplazamiento residual al ingresar al proyecto que dejaba las partes superiores de Layers y Propiedades ocultas bajo la barra superior, aislando los nodos con claves únicas (`key`), forzando `h-full` en barras laterales para prevenir desbordamientos de 24px frente a la barra de estado y restableciendo el scroll a cero en la transición.

---

## 📜 Control de Versiones y Changelog

Para consultar el registro cronológico completo de cambios, mejoras y correcciones implementadas en cada versión del proyecto, consulte el archivo [CHANGELOG.md](file:///C:/Users/manom/OneDrive/Desktop/Workspace/winWebFormApp/CHANGELOG.md).

---

## 🔗 Repositorio y Enlaces

- **Repositorio Oficial de GitHub**: [https://github.com/joseluismanonrosario/visualForge.git](https://github.com/joseluismanonrosario/visualForge.git)
- **Documento de Especificaciones Técnicas**: [especificaciones_del_proyecto.md](file:///C:/Users/manom/OneDrive/Desktop/Workspace/winWebFormApp/especificaciones_del_proyecto.md)
- **Autor y Mantenedor**: José Luis Mañón Rosario ([@joseluismanonrosario](https://github.com/joseluismanonrosario))

---

## 📄 Licencia

Este proyecto está desarrollado bajo licencia privada y comercial para **VisualForge Studio**. Todos los derechos reservados © 2026.
