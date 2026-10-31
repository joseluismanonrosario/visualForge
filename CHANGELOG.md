# Changelog (Registro de Cambios)

Todos los cambios notables realizados en el proyecto **VisualForge Studio** estarán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto se adhiere a [Semantic Versioning (SemVer)](https://semver.org/lang/es/).

---

## [1.4.6] - 2026-10-31

### Corregido
- **Corrección de Desplazamiento Residual y Solapamiento de Paneles Bajo la Barra Superior**:
  - **Aislamiento de Nodos DOM con Claves Únicas (`key`)**: Asignación de `key="project-creation-container"` al contenedor de bienvenida y `key="studio-workspace-container"` al espacio de trabajo del estudio en `src/App.tsx`. Esto evita que React reutilice el mismo elemento `div` del DOM y preserve su posición de desplazamiento (`scrollTop`) al pasar de la pantalla de bienvenida al editor.
  - **Restablecimiento Forzado de Scroll (`useEffect`)**: Implementación de un hook reactivo que resetea a cero `window.scrollTo(0, 0)`, `document.documentElement.scrollTop`, `document.body.scrollTop` y el contenedor raíz `rootAppRef` al conmutar entre pantallas.
  - **Ajuste de Altura de Paneles Laterales a `h-full`**: Corrección de la altura de `LeftSidebar` y `RightSidebar` (de `h-[calc(100vh-44px)]` a `h-full`), eliminando el desbordamiento de 24px generado por la presencia de la barra de estado inferior (`StatusBar` `h-6`) y asegurando que las cabeceras de *Layers* y *Propiedades* permanezcan fijas y visibles inmediatamente bajo la barra superior.
  - **Bloqueo de Desbordamiento en `index.html`**: Configuración de `h-full overflow-hidden` en las etiquetas `html`, `body` y `#root` para imposibilitar desplazamientos no deseados a nivel de ventana.

---

## [1.4.5] - 2026-10-31

### Seguridad
- **Token de Sesión Secreta Criptográfico en Electron (`X-VF-Token` / `vf_token`)**:
  - **Aislamiento y Protección del Servidor Local**: Generación de un token criptográfico aleatorio de alta entropía (192 bits / 24 bytes en hex) en cada arranque de la app de escritorio.
  - **Bloqueo de Navegadores Externos (403 Forbidden)**: Cualquier intento de conexión no autorizada hacia `http://127.0.0.1:<port>` desde navegadores externos (Chrome, Edge, Firefox, scripts locales u otros procesos en la misma máquina) es rechazado inmediatamente con error `403 Forbidden`.
  - **Inyección Transparente Interna**: Se configuró `session.defaultSession.webRequest.onBeforeSendHeaders` en Electron para inyectar automáticamente el encabezado de autenticación `X-VF-Token` en todas las solicitudes internas, acompañado de una cookie de sesión `HttpOnly` (`vf_token`) y parámetro de consulta inicial seguro.

### Rendimiento y Optimización
- **Optimización de Velocidad de Carga mediante Code-Splitting y Streaming de Chunks (Web y Desktop)**:
  - **División de Paquetes en Rollup/Vite**: Configuración de `manualChunks` en `vite.config.ts` para segregar el bundle monolítico de 3.1 MB en fragmentos independientes optimizados para procesamiento en paralelo: `vendor-react` (280 kB), `vendor-iconify` (739 kB), `data-catalog` (1.35 MB) e `index` central (635 kB).
  - **Carga Perezosa (Lazy Loading) de Módulos Pesados**: Transformación de `ExportModal` y del motor generador de código `exportEngine` en un componente dinámico con `React.lazy()` y `Suspense`, excluyéndolos de la carga inicial hasta que el usuario decida exportar.
  - **Tiempo de Compilación Reducido**: Reducción del tiempo de empaquetado de producción en más del 30% (de 15.8s a 10.7s).
- **Gestión Avanzada de Memoria RAM**:
  - **Caché LRU con Límite de Capacidad en `iconifyManager.ts`**: Implementación de un límite máximo de 25 colecciones en memoria (`MAX_COLLECTION_CACHE`), descartando automáticamente las colecciones menos utilizadas para prevenir fugas de RAM al explorar múltiples sets de iconos.
  - **Optimización de Pila de Deshacer/Rehacer**: Reducción de la retención histórica a 50 estados (`MAX_HISTORY = 50`), reduciendo a la mitad el consumo de memoria de árboles clonados en sesiones prolongadas.

---

## [1.4.4] - 2026-10-31

### Corregido
- **Persistencia Permanente de Proyectos Recientes en Aplicación de Escritorio**:
  - **Almacenamiento Nativo en Disco (`userData/recent-projects.json`)**: Implementación de controladores IPC (`project-get-recents` y `project-save-recents`) en Electron para persistir físicamente los proyectos recientes en la carpeta de datos del usuario, independientemente de la sesión del navegador.
  - **Sincronización Reactiva Bidireccional**: Función `syncRecentProjectsFromElectron()` para sincronizar automáticamente el archivo local con el estado de React y `localStorage` al iniciar y renderizar la pantalla de bienvenida.
  - **Fijación de Puerto Preferido Local (`48321`)**: Reemplazo de puerto efímero 0 por un puerto local estable preferido (`48321`) con fallback dinámico, evitando la partición de origen de Chromium y garantizando que el almacenamiento web y preferencias de tema permanezcan intactos entre cierres y aperturas sucesivas.

---

## [1.4.3] - 2026-10-31

### Agregado
- **Icono Oficial de HTML5 (`icomoon-free:html-five2`)**: Reemplazo del isotipo genérico de escudo en la cabecera (`TopBar.tsx`) y en la pantalla de bienvenida (`ProjectCreationScreen.tsx`) por el icono oficial de HTML5 de la colección IcoMoon Free (`icomoon-free:html-five2`).

### Corregido
- **Solución al Spinner Infinito y Bloqueo en Carga Rápida de Colecciones de Iconos**:
  - **Cancelación con AbortController en Frontend**: Implementación de señales de aborto (`AbortController`) al conmutar colecciones en el inspector lateral (`RightSidebar.tsx`) y timeout de seguridad de 8 segundos en `iconifyManager.ts`. Las solicitudes previas se cancelan al instante, liberando inmediatamente los sockets HTTP del cliente Chromium.
  - **Garantía de Finalización de Estado**: Incorporación de bloques `.catch()` y `.finally()` en la carga de colecciones para asegurar que `isLoadingCollection` siempre se restablezca a `false`, previniendo bloqueos de spinner infinito.
  - **Servidor HTTP Local Robusto en Electron**: Reemplazo de streams sin control por lectura segura asíncrona con encabezado `Content-Length`, soporte de Keep-Alive, manejo de eventos de error de sockets y caché en memoria (`ICON_CACHE` para hasta 40 colecciones) en `electron/main.cjs` y en el plugin de Vite.

---

## [1.4.2] - 2026-10-31

### Agregado
- **Indicador de Versión en Splash Screen**: Muestra la versión actual de la aplicación (`v1.4.2`) en la esquina inferior derecha de la tarjeta de bienvenida con fondo traslúcido y tipografía monospace (`text-[10.5px] font-mono`).
- **Regla de Evaluación y Actualización SemVer en Skill `appToProduccion`**: Incorporación de directriz obligatoria para evaluar cambios acumulados y sincronizar automáticamente la versión en la app (`package.json`, `README.md`, `CHANGELOG.md`, `especificaciones_del_proyecto.md`) antes de compilar y empaquetar los ejecutables nativos `.exe`.
- **Publicación Automática de Release en GitHub**: Integración de regla y paso automatizado en `appToProduccion` para publicar un nuevo Release oficial en GitHub (`git push origin v<versión>`) siempre y cuando haya un cambio de versión en la aplicación.

### Cambiado
- **Reubicación de Botones de Pantalla en Status Bar**: Los botones selectores de dispositivo (*Desktop*, *Tablet*, *Móvil*) se trasladaron al borde derecho de la barra de estado inferior, integrados junto a los controles de zoom para una interfaz más despejada y ergonómica.

---

## [1.4.1] - 2026-10-31

### Agregado
- **Controles de Pantalla en Status Bar**: Integración del selector de dispositivos (*Desktop 1440px*, *Tablet 768px*, *Móvil 375px*) en el centro de la barra de estado inferior.
- **Estructura Optimizada de Proyectos Recientes en Dos Líneas**:
  - Línea 1: Icono de archivo fijo (`FileCode2`) con el 100% del ancho asignado al nombre del proyecto.
  - Efecto de desplazamiento suave hacia la izquierda (*marquee hover*) para nombres largos cuando sobrepasan el contenedor.
  - Línea 2: Tipo de proyecto (*HTML / CSS*, *React Web*, *ESP32 / IoT*) y fecha de modificación en tipografía homogénea compacta (`text-[8px] font-mono`).
- **Conexión de Repositorio Remoto**: Vinculación oficial del repositorio Git a `https://github.com/joseluismanonrosario/visualForge.git`.
- **Documentación y Guías SemVer**: Creación de `README.md` completo y `CHANGELOG.md` con directrices de versionado semántico para desarrolladores.

### Cambiado
- **Centrado Geométrico en Cabecera (TopBar)**:
  - Isotipo del tipo de proyecto ahora se muestra sin recuadros ni bordes aislantes, en color blanco/adaptativo al tema (`text-zinc-100` / `text-zinc-700`), situado inmediatamente junto al nombre como parte integral del mismo.
  - Todo el conjunto `[Icono + Nombre de archivo + Indicador/Equis]` se encuentra centrado como bloque unificado en la cabecera.
- **Botón de Creación**: Cambio del texto del botón principal en la pantalla de bienvenida de "Siguiente" a **"Crear"**.
- **Splash Screen Refinado**:
  - Tamaño de texto de carga homogeneizado (`text-[9.5px] sm:text-[10px] text-zinc-400 font-sans tracking-tight`) para armonizar con la tipografía de la tarjeta.
  - Barra de progreso delimitada a un ancho proporcional estricto (`width: '28%'`), impidiendo desbordamientos fuera de su bloque ilustrado.
- **Límite de Proyectos Recientes**: Capped a un máximo de 15 proyectos recientes con espaciado vertical compacto (`py-1`, `space-y-0.5`, `max-h-[215px]`) para albergar 5-6 elementos antes de requerir scroll.

### Eliminado
- Eliminación del toolbox flotante superior pegado debajo de la cabecera (reemplazado por los controles integrados en el status bar).
- Supresión de notificaciones emergentes innecesarias (*toasts*) al abrir proyectos guardados o recientes, y al cerrar proyectos.

---

## [1.4.0] - 2026-10-30

### Agregado
- **Motor de Historial Extendido (100 Pasos)**:
  - Capacidad de deshacer y rehacer hasta 100 estados en memoria (`MAX_HISTORY = 100`) con atajos de teclado globales (`Ctrl+Z` / `Ctrl+Shift+Z` o `Ctrl+Y`).
- **Detección Dinámica de Estado Guardado en Historial**:
  - Si el usuario deshace cambios hasta el punto donde guardó el archivo o al estado inicial, el indicador de cambios no grabados (puntico azul) se desactiva automáticamente mostrando la equis (`X`) de cierre directo.
- **Confirmación al Crear Proyecto Nuevo**:
  - Al presionar el botón `+` (Nuevo) con un proyecto modificado, el sistema solicita confirmación de guardado previo.

### Cambiado
- **Modal de Confirmación Simplificado**:
  - Modal minimalista titulado "¿Desea guardar?" con botones directos "Sí" y "No" y equis en la esquina superior para cancelar y permanecer en el proyecto actual.

---

## [1.3.1] - 2026-10-30

### Corregido
- **Delineado Único en Lienzo**: Eliminación del doble trazo de selección en el lienzo raíz para mantener paridad visual uniforme con los componentes secundarios.
- **Inserción Directa en Canvas**: Corrección en el flujo de inserción para permitir agregar componentes directamente al lienzo sin requerir selección previa forzada.
- **Eliminación de Mensajes Redundantes**: Remoción del toast de alerta al limpiar el lienzo desde el toolbox flotante.

---

## [1.3.0] - 2026-10-30

### Agregado
- **Sistema de Proyectos Recientes**:
  - Registro automatizado de proyectos al abrir o guardar en disco con persistencia en `localStorage` (`vf_recent_projects`).
  - Ordenación dinámica interactiva: clic en la cabecera de **Nombre** conmuta orden alfabético ascendente/descendente; clic en **Fecha** conmuta orden cronológico.
  - Apertura directa e instantánea con un solo clic sobre cualquier elemento de la lista.
- **Lógica de Guardado Directo vs. Diálogo ("Sin nombre")**:
  - Proyectos nuevos se inicializan como `"Sin nombre"` y abren forzosamente el cuadro de diálogo del sistema operativo al guardar por primera vez.
  - Proyectos con ruta establecida guardan directamente en disco sin solicitar confirmación redundante.
  - Nuevo botón "Guardar como..." (`Ctrl+Shift+S`) que abre el explorador con el nombre actual prellenado.
- **Botonera Agrupada de Proyecto**:
  - Contenedor unificado en la cabecera reuniendo `+` (Nuevo), `FolderOpen` (Abrir), `Save` (Guardar) y `SaveAll` (Guardar como).

---

## [1.2.0] - 2026-10-30

### Agregado
- **Diseño Responsivo con Breakpoints Desacoplados**:
  - Soporte para tres contextos independientes de pantalla: **Desktop (1440px)**, **Tablet (768px)** y **Móvil (375px)**.
  - Aislamiento estricto de estilos visuales, coordenadas `x/y`, dimensiones, paddings, tipografía y visibilidad (`hiddenIn`) por dispositivo.
  - Actualización del modelo de datos de nodos (`CanvasNode.responsiveStyles`) para persistir personalizaciones por dispositivo sin sobreescribir la vista principal Desktop.

---

## [1.1.0] - 2026-10-30

### Agregado
- **Sistema de Persistencia Nativa `.vforge`**:
  - Motor de serialización y deserialización JSON estructurado (`serializeProject` y `deserializeProject`).
  - Integración con el explorador nativo de archivos del sistema operativo mediante la API de Electron (`showSaveDialog`, `showOpenDialog`) y fallback web (`showSaveFilePicker`, `<input type="file">`).
  - Restauración completa y reactiva del lienzo, configuraciones de canvas, jerarquía de nodos, modo de dispositivo y nivel de zoom.
  - Atajos de teclado para guardar (`Ctrl+S`) y abrir proyectos (`Ctrl+O`).

---

## [1.0.0] - 2026-10-30

### Agregado
- **Lanzamiento Inicial de VisualForge Studio**:
  - Arquitectura moderna de diseño estilo Figma construida con React 19, Tailwind CSS v4, TypeScript y Lucide Icons.
  - Lienzo interactivo drag-and-drop con cuadrícula de micro-puntos e inspector de propiedades en tiempo real.
  - Panel izquierdo con árbol de capas jerárquico recursivo (`Layers`) y catálogo temático de componentes (`Assets`).
  - Catálogo de componentes integrando elementos de **shadcn/ui**, **Bootstrap 5/6**, iconos vectoriales FontAwesome 5 Free (58 categorías temáticas) y Lucide Icons.
  - Soporte avanzado para proyectos de hardware y telemetría IoT basados en microcontroladores **ESP32** (pestaña GPIO, interruptores de relé, sliders PWM, medidores analógicos y status badges).
  - Selector de temas visuales de la aplicación: **Oscuro (`dark`)**, **Claro (`light`)**, **Azul (`blue`)** y **Automático (`system`)** con sincronización reactiva de favicons e isotipos oficiales.
  - Modos de edición y vista previa interactiva (`Preview / Present Mode`).
  - Motor de exportación limpia de código a múltiples formatos: **HTML5 / CSS / Vanilla JS**, **React Web (Tailwind / Lucide)** y **ESP32 C++ (Arduino WebServer)**.
  - Integración para empaquetado nativo de escritorio como ejecutable Windows (`.exe`) independiente mediante Electron.
