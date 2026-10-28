# SYSTEM PROMPT & SPECIFICATION DOCUMENT: VISUALFORGE STUDIO (FIGMA STYLE)

Eres un Ingeniero Frontend Principal y Diseñador de Sistemas UI/UX. Tu objetivo es construir desde cero una aplicación web completa y lista para producción en **React 19**, **Tailwind CSS v4** y **Lucide Icons** llamada **VisualForge Studio**.

La aplicación es un **constructor visual de páginas web drag-and-drop con interfaz moderna estilo Figma**, que combina componentes de **shadcn/ui** y **Bootstrap 5 (incluidas novedades de v6)**, auto-layout avanzado, gestión de estilos CSS completa, iconos FontAwesome 5 Free (58 categorías temáticas), árbol de capas jerárquico y exportación a múltiples formatos de código listos para producción.

---

## 1. ARQUITECTURA GENERAL Y LAYOUT (FIGMA STYLE STUDIO)

La pantalla se distribuye en una interfaz fija estilo herramienta de diseño moderna (`h-screen w-screen bg-[#1e1e1e] text-zinc-100 overflow-hidden flex flex-col font-sans select-none`):

1. **Top Bar / Barra Superior de Figma (`h-11 bg-[#2c2c2c] border-b border-[#383838] px-3 flex items-center justify-between`)**:
   - **Izquierda**:
     - Botón de Menú Figma (ícono menú / logo degradado violeta/azul con nombre "VisualForge").
     - Herramientas principales estilo Figma en pill container:
       - **Move Tool (`V`)**: Herramienta de selección y movimiento.
       - **Hand Tool (`H`)**: Modo de navegación / arrastre del lienzo (Pan).
       - **Frame / Device Selector**: Menú desplegable para alternar viewports (*Desktop 1440px*, *Tablet 768px*, *Mobile 375px*).
   - **Centro**:
     - Título del proyecto editable en línea (ej. `Landing Page - v1`).
     - Indicador de guardado y estado.
   - **Derecha**:
     - Historial de Estados (Undo `Ctrl+Z` / Redo `Ctrl+Shift+Z` o `Ctrl+Y`).
     - Selector de Nivel de Zoom (`50%`, `75%`, `100%`, `Zoom to fit`).
     - **Botón Present / Preview (Play `▶`)**: Alterna a modo vista previa interactiva sin guías ni tiradores de selección.
     - **Botón Share / Export Code**: Abre el modal de exportación en múltiples formatos.

2. **Panel Lateral Izquierdo: Capas & Assets (`w-72 bg-[#252526] border-r border-[#383838] flex flex-col`)**:
   - Cabecera con pestañas conmutables estilo Figma:
     - **Layers (Capas)**:
       - Vista en árbol jerárquico recursivo de todos los elementos del lienzo.
       - Iconos semánticos por tipo de nodo (Frame, Componente, Texto, Imagen, etc.).
       - Indicadores de visibilidad (icono de ojo para ocultar/mostrar) y candado (bloquear edición).
       - Arrastrar capas dentro del árbol para reordenar o anidar jerarquías.
     - **Assets (Componentes & Catálogo)**:
       - Catálogo de componentes de **shadcn/ui** y **Bootstrap 5 + v6**.
       - Barra de búsqueda en tiempo real y filtros rápidos (**All**, **shadcn**, **Bootstrap**).
       - Vistas en tarjeta compacta arrastrables directamente al lienzo o al árbol de capas.
   - Pestaña colapsable con atajo `Ctrl+\` / `Cmd+\` para maximizar el lienzo.

3. **Lienzo Central (Infinite Canvas & Artboard Viewport)**:
   - Fondo de lienzo estilo Figma (`bg-[#1e1e1e]`) con cuadrícula sutil opcional (patrón de puntos o rejilla de 8px).
   - Soporte para **Pan** (arrastre con rueda del ratón o barra espaciadora/Hand Tool) y **Zoom** fluido (`Ctrl + rueda`).
   - El diseño se aloja dentro de un **Artboard / Frame central** con sombra flotante y etiqueta superior (ej. *"Desktop - 1440 × 900"*).
   - **Selección Estilo Figma**:
     - Borde de selección azul/violeta (`border-[#0d99ff]` o `ring-2 ring-violet-500`).
     - 8 tiradores de redimensionamiento (corners y bordes) con esquinas redondeadas.
     - Etiqueta flotante con dimensiones en tiempo real (ej. `w: 320px h: 48px`).

4. **Panel Lateral Derecho: Inspector de Diseño (Figma Design & Inspect Panel, `w-80 bg-[#252526] border-l border-[#383838] flex flex-col`)**:
   - Pestañas superiores:
     - **Design (Diseño)**: Control de alineación, Auto-layout, dimensiones, tipografía, rellenos, bordes y sombras.
     - **Inspect / Code (Inspección)**: Vista previa instantánea del código CSS / Tailwind generado del elemento seleccionado.
   - Colapsable para enfoque en pantalla completa.

---

## 2. CATÁLOGO COMPLETO DE COMPONENTES (SHADCN/UI & BOOTSTRAP 5 + V6)

Organizado como librería de Assets de Figma por categorías oficiales, con búsqueda instantánea y filtros por librería:

### Categorías de Assets:
1. **Layout & Frames**:
   - `container` (Flexbox / Auto-layout Frame)
   - `grid` (CSS Grid con columnas configurables)
   - `columns` (Columns & Gutters de Bootstrap)
   - `stack` (HStack / VStack con gap configurable)
   - `aspect_ratio` (Frame 16:9, 4:3, 1:1)
   - `scroll_area` (Área de scroll estilizada)
   - `resizable` (Paneles divisores ajustables)
   - `separator` (Divisor / Línea horizontal o vertical)

2. **Navigation**:
   - `navbar` (Navbar responsivo con slots para logo, enlaces y botones de acción)
   - `navigation_menu` (Menú de navegación avanzado shadcn)
   - `menubar` (Menubar estilo aplicación desktop)
   - `nav_tabs` (Pestañas de navegación con switch de pestaña activa)
   - `breadcrumb` (Migas de pan con separadores configurables)
   - `pagination` (Controles de paginación)

3. **Forms & Inputs**:
   - `button` (Botón con variantes Primary, Secondary, Outline, Ghost, Link)
   - `button_group` (Grupo de botones contiguos de Bootstrap)
   - `input` (Campo de texto con placeholder y label flotante)
   - `input_group` (Input con prefijos/sufijos)
   - `combobox` (Selector desplegable con buscador)
   - `textarea` (Área de texto multilinea)
   - `switch` (Interruptor toggle interactivo)
   - `checkbox` (Casilla de verificación interactiva)
   - `radio_group` (Grupo de opciones de radio)
   - `slider` (Control deslizante de rango)
   - `otp_input` (Input para código PIN / OTP de 6 dígitos)
   - `chips` (Chips / Tags estilo Bootstrap v6)
   - `datepicker` (Selector de fecha con disparador de calendario)
   - `toggle` y `toggle_group` (Botones de estado activo/inactivo)

4. **Feedback & Overlays**:
   - `alert` (Banner de alerta informativa, éxito, advertencia o error)
   - `dialog` (Modal emergente con título, descripción y acciones)
   - `sheet` (Drawer lateral deslizable tipo Offcanvas)
   - `badge` (Píldora / Etiqueta de estado)
   - `progress` (Barra de progreso con porcentaje interactivo)
   - `spinner` (Indicador de carga animado)
   - `skeleton` (Marcador de posición de carga)
   - `popover` (Ventana emergente contextual / Tooltip)
   - `toast` (Notificación flotante)

5. **Data Display**:
   - `card` (Tarjeta estructurada con cabecera, contenido y footer)
   - `accordion` (Acordeón interactivo expandible)
   - `table` (Tabla de datos responsiva con columnas y filas editables)
   - `avatar` (Avatar de usuario con soporte de imagen o iniciales)
   - `carousel` (Diapositivas de carrusel interactivo)
   - `list_group` (Lista agrupada estilo Bootstrap)
   - `kbd` (Atajo de teclado formateado)
   - `stepper` (Paso a paso guiado estilo Bootstrap v6)

6. **Media & Vectors**:
   - `fontawesome_icon` (Vector FontAwesome 5 editable con prefijos fas/far/fab)
   - `image` (Imagen con URL, modo fit `cover`/`contain`/`fill` y ratio)
   - `typography` (Encabezados H1-H6 y textos enriquecidos)

---

## 3. MOTOR DE DRAG & DROP Y SMART GUIDES ESTILO FIGMA

El lienzo implementa interacción drag-and-drop con retroalimentación visual de precisión:
- **Arrastre de Assets al Canvas**: Arrastrar cualquier componente desde el panel de Assets al Frame o anidarlo dentro de contenedores existentes (`isContainer: true`).
- **Guías Inteligentes de Alineación (Smart Guides)**:
  - Al arrastrar o mover elementos, aparecen líneas guía magnéticas de color fucsia/magenta (`#f43f5e` o `#d946ef`) indicando alineación con centros, bordes y espaciados iguales entre hermanos.
  - Indicador de distancia en píxeles (badges flotantes con etiquetas `16px`, `24px`).
- **Detección Dinámica de Inserción (3 Zonas)**:
  - Cursor en borde superior/izquierdo: Inserción `before` con línea guía magenta iluminada.
  - Cursor en el centro de un contenedor: Inserción `inside` con marco contenedor resaltado con borde azul Figma (`#0d99ff`).
  - Cursor en borde inferior/derecho: Inserción `after` con línea guía magenta.
- **Inserción Rápida**: Si hay un contenedor seleccionado, hacer clic en un asset lo añade automáticamente al final de su lista de hijos.

---

## 4. AUTO-LAYOUT Y MATRIZ DE ALINEACIÓN (FIGMA STYLE)

En lugar de selectores genéricos, el panel de propiedades cuenta con un control de **Auto-Layout / Alineación** idéntico al de Figma:

1. **Matriz 3x3 de Alineación de Contenido**:
   - Caja interactiva de 9 puntos para definir simultáneamente `justifyContent` y `alignItems`:
     - `Top-Left`, `Top-Center`, `Top-Right`
     - `Center-Left`, `Center-Center`, `Center-Right`
     - `Bottom-Left`, `Bottom-Center`, `Bottom-Right`
2. **Dimensionamiento y Restricciones (Constraints & Resizing)**:
   - **Horizontal Resizing**:
     - `Fixed`: Ancho fijo en píxeles o porcentaje.
     - `Hug Contents`: Adaptarse al contenido (`width: max-content` / `auto`).
     - `Fill Container`: Ocupar todo el ancho disponible (`width: 100%` / `flex-1`).
   - **Vertical Resizing**:
     - `Fixed`: Alto fijo.
     - `Hug Contents`: Alto según contenido.
     - `Fill Container`: Ocupar todo el alto disponible (`height: 100%`).
3. **Dirección y Espaciado (Direction & Spacing)**:
   - Conmutador de dirección: **Horizontal (Row)** o **Vertical (Column)**.
   - Campo numérico para `Gap` (espacio entre elementos).
   - Control de Padding conmutador:
     - Padding uniforme (un solo valor).
     - Padding independiente en 4 lados: `Top`, `Right`, `Bottom`, `Left`.

---

## 5. SISTEMA EXCLUSIVO DE ICONOS ICONIFY (OFFLINE LOCAL - 244 SETS Y +418.000 ICONOS)

El proyecto utiliza **exclusivamente Iconify** como fuente universal de iconografía, funcionando **100% en local y sin conexión a internet** (basado en el repositorio oficial [Iconify](https://github.com/iconify) y los paquetes `@iconify/json`, `@iconify/utils`, `@iconify/react`):

### 1. Disponibilidad Completa y Rendimiento Offline
- **Acceso Completo Out-of-the-Box**: Incluye las 244 colecciones oficiales de Iconify y más de 418.000 iconos vectoriales disponibles en local.
- **Carga Local Asíncrona sin Sobrecarga de Memoria**:
  - Middleware local en Vite (`vite.config.ts`) que sirve bajo demanda los archivos JSON locales de `node_modules/@iconify/json/json/${prefix}.json` vía endpoints locales `/@iconify/json/*` en 2-5 ms.
  - Colección base pre-cargada en memoria (`lucide` con 1.999 iconos) para renderizado síncrono inmediato (latencia 0 ms).
  - Cache en memoria (`COLLECTION_CACHE`) para almacenar cualquier set de iconos que el usuario explore o utilice, evitando lecturas duplicadas de disco.

### 2. Categorías Temáticas en Combobox
Para facilitar la navegación entre cientos de librerías, el sistema organiza las colecciones en categorías agrupadas mediante un Combobox principal:
1. **Todas las Colecciones**: Catálogo global de 244 sets y +418.000 iconos.
2. **UI 24px**: Lucide, Tabler Icons, Remix Icon, Feather, Solar, Octicons, Iconoir, etc. (66 sets, +153.000 iconos).
3. **Material Design**: Google Material Symbols, Google Material Icons, Material Design Icons (MDI), MDI Light (6 sets, +51.000 iconos).
4. **Clásicas y Cuadrícula Mixta**: Font Awesome 6 (Solid, Regular, Brands), Boxicons, Line Awesome, Unicons, etc. (35 sets, +68.000 iconos).
5. **Logos y Marcas**: Simple Icons, Devicon, Brandico, Entypo Social, etc. (18 sets, +48.000 iconos).
6. **UI 16px / 32px (Micro & Compactas)**: Radix Icons, Carbon, Clarity, Fluent, Teenyicons, etc. (18 sets, +13.000 iconos).
7. **Programación y Código**: Devicon, Codicons, VS Code Icons, Skill Icons, etc. (11 sets, +7.400 iconos).
8. **Emojis y Emoticonos**: Fluent Emoji, Twemoji, OpenMoji, Noto Emoji, etc. (11 sets, +25.000 iconos).
9. **Multicolor & Coloridas**: Flat Color Icons, Noto Color Emoji, etc. (12 sets, +12.000 iconos).
10. **Banderas y Mapas**: Circle Flags, Flag Icons, Map Icons, etc. (12 sets, +6.200 iconos).
11. **Temáticos Especializados**: Game Icons, Weather Icons, Medical, etc. (9 sets, +7.500 iconos).
12. **Archivo & Legado**: Colecciones clásicas y de archivo (30 sets, +14.000 iconos).

### 3. Filtros y Búsqueda en el Inspector y Modal de Selección
- **Combobox de Categoría Temática**: Filtra al instante las colecciones disponibles.
- **Combobox de Colección / Set**: Permite elegir la colección activa mostrando el total de iconos de cada una (ej. `Lucide (1,999)`, `Tabler (5,400)`, `Material Symbols (15,761)`).
- **Combobox de Subcategoría Interna**: Cuando una colección incluye etiquetas temáticas internas (ej. Arrows, Media, Editor), se activa un tercer combobox para refinar la selección.
- **Búsqueda Instantánea con Botón `X` de Limpieza**: Filtrado en tiempo real por nombre de icono con botón circular `X` en el borde derecho para vaciar la búsqueda en 1 clic.
- **Paginación Fluida**: Renderizado optimizado a 120 iconos por página con controles `◀ Prev` / `Next ▶` y contador de páginas para mantener 60 FPS estables incluso en colecciones de más de 15.000 iconos.

### 4. Personalización y Exportación Multi-Destino
- **Control de Color y Relleno Vectorial**:
  - Control de trazo / color (`stroke` / `color`) con selector visual, campo hexadecimal y swatches rápidos.
  - Control de relleno (`fill`) para iconos sólidos o con fondo personalizado.
  - Control de tamaño (`size`) mediante deslizador y campo numérico de 12px a 96px.
- **Exportación Limpia**:
  - **HTML/CSS & ESP32**: Inyecta los SVGs exactos directamente en línea (*inline SVG*), garantizando funcionamiento offline en microcontroladores y páginas estáticas sin dependencias de internet ni fuentes tipográficas externas.
  - **React**: Genera componentes funcionales JSX con propiedades tipadas `{...props}` y atributos en camelCase.

---

## 5.1 ARQUITECTURA DE ICONOS SVG, CATÁLOGO LOCAL Y EXPORTACIÓN INLINE / JSX

El sistema cuenta con una arquitectura de iconos moderna, minimalista y basada en archivos vectoriales SVG limpios con licencia abierta (`lucide-static`):

### 1. Banco de Archivos SVG y Catálogo Local Indexado
- **Script Generador Autónomo (`scripts/build-icon-catalog.js`)**:
  - Script independiente en Node.js (ejecutable mediante `npm run build:icons` o `node scripts/build-icon-catalog.js`).
  - Procesa los archivos SVG de la librería instalada, normaliza y limpia el código vectorial (omitiendo atributos innecesarios o redundantes), preservando `viewBox="0 0 24 24"`, trazos limpios `fill="none"` y `stroke="currentColor"`.
  - Genera el catálogo indexado `src/data/icon-catalog.json` con más de 2.190 iconos indexados con la siguiente estructura estricta:
    ```json
    {
      "id": "rocket",
      "name": "Rocket",
      "category": "Development",
      "svgContent": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z\"/><path d=\"m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z\"/></svg>"
    }
    ```

### 2. Módulo de Renderizado para el Editor / Canvas (`src/utils/svgIconRenderer.tsx`)
- **Búsqueda y Acceso Rápido O(1)**:
  - `findCatalogIcon(idOrName)`: Localiza cualquier icono del catálogo por identificador, nombre o variantes de prefijos (`lucide-`, `fa-`, etc.).
  - `searchCatalogIcons(query, category)`: Permite filtrado reactivo por término y categoría temática.
  - `getCatalogCategories()`: Extrae dinámicamente las categorías disponibles en el catálogo.
- **Personalización Dinámica de Atributos Vectoriales (`customizeSvg`)**:
  - Inyecta de forma segura dimensiones (`width`, `height`, `size`), color de trazo (`stroke`), color de relleno (`fill`), y clases CSS sin alterar la geometría de las rutas.
- **Componente Dinámico `<SvgIconRenderer />`**:
  - Componente React reactivo que se integra en el lienzo (`NodeRenderer.tsx`), el visor del inspector y el modal explorador (`RightSidebar.tsx`), respondiendo instantáneamente a los controles de tamaño, color/stroke y relleno (fill).

### 3. Motor de Exportación Multi-Destino con SVGs Puros (`src/utils/exportEngine.ts`)
- **Extracción Estricta de SVGs Utilizados (`extractUsedCatalogSvgs`)**:
  - Recorre el árbol jerárquico del diseño y extrae **únicamente** los iconos SVG efectivamente empleados por el usuario, evitando sobrecargar el paquete final.
- **Exportación HTML/CSS Puro y ESP32 Embebido**:
  - Inyecta el código SVG en línea (*inline SVG*) de forma directa en el HTML resultante.
  - No depende de CDNs externos, conexiones a internet ni archivos de fuentes tipográficas (`.woff` / `.woff2` / `.ttf`).
  - Para ESP32 (`esp32_embedded`), el HTML con SVGs inline se empaqueta como cadena C++ en memoria flash `PROGMEM` (`const char INDEX_HTML[] PROGMEM = R"rawliteral(...)rawliteral";`), garantizando funcionamiento autónomo offline para microcontroladores.
- **Exportación a React Moderno (JSX)**:
  - La función `convertSvgToJsx(rawSvg, componentName)` convierte el marcado SVG en componentes JSX limpios y funcionales (transformando atributos SVG a camelCase como `strokeWidth`, `strokeLinecap`, `fillRule`, etc. y propagando `{...props}`).
  - Cada icono utilizado se declara como componente JSX tipado dentro del mismo archivo de exportación React.

---

## 6. INSPECTOR DE DISEÑO ESTILO FIGMA (DESIGN PANEL)

Organizado en secciones limpias y compactas con inputs estilizados de Figma (etiquetas `X`, `Y`, `W`, `H`, iconos de ajuste y preview de color):

1. **Barra de Alineación Superior (Quick Alignment Bar)**:
   - Iconos rápidos para: Alinear a la izquierda, Alinear al centro horizontal, Alinear a la derecha, Alinear arriba, Alinear al centro vertical, Alinear abajo y Distribuir espaciado uniformemente.
2. **Frame & Posición**:
   - `W` (Ancho) y `H` (Alto) con selector de unidad (`px`, `%`, `auto`).
   - Radio de esquinas (`Corner Radius`) con opción de valor único o 4 esquinas independientes.
   - Clip content (`overflow: hidden` / `visible`).
3. **Auto-layout (Flexbox)**:
   - Dirección (Horizontal / Vertical).
   - Matriz 3x3 de alineación.
   - Gap, Padding X/Y o 4 lados independientes.
4. **Tipografía (Text Settings)**:
   - Familia de fuente, tamaño (`fontSize`), peso (`fontWeight` de 300 a 800), interlineado (`lineHeight`), alineación del texto (Izquierda, Centro, Derecha, Justificado).
5. **Fill (Fondo y Relleno)**:
   - Capas de color: Color sólido con hex picker, opacidad (0-100%) y botón de transparencia.
6. **Stroke (Bordes)**:
   - Color del borde, grosor (`1px` a `10px`), estilo (Solid, Dashed, Dotted) y lados individuales.
7. **Effects (Sombras & Blur)**:
   - Drop Shadow (Sombra externa suave con configuraciones de X, Y, Blur, Spread y Color con opacidad).
8. **Component Properties (Propiedades de Componente)**:
   - Variantes de shadcn/Bootstrap (Default, Destructive, Outline, Secondary, Ghost, Link).
   - Textos editables (títulos, etiquetas, placeholders).
   - URLs de imágenes y enlaces del Navbar con gestión de items en lista.

---

## 7. GESTIÓN DE ACCIONES Y ATAJOS DE TECLADO (FIGMA SHORTCUTS)

- **Herramientas de Selección**:
  - `V`: Activa la herramienta de selección/mover.
  - `H` o `Barra Espaciadora + Arrastre`: Herramienta de mano (Pan del lienzo).
- **Manipulación de Elementos**:
  - `Delete` / `Backspace`: Eliminar elemento seleccionado sin ventana de confirmación (excepto si se está escribiendo en un input).
  - `Ctrl + D` / `Cmd + D`: Duplicar el elemento seleccionado manteniendo estilos y jerarquía.
  - `Alt + Arrastrar`: Duplicar y posicionar con arrastre.
  - Flechas del teclado (`↑ ↓ ← →`): Desplazar / ajustar paddings en saltos de `1px` (o de `10px` con `Shift + Flecha`).
- **Historial Completo (Undo / Redo)**:
  - `Ctrl + Z` / `Cmd + Z`: Deshacer.
  - `Ctrl + Shift + Z` / `Ctrl + Y`: Rehacer.
- **Visualización**:
  - `Ctrl + \` / `Cmd + \`: Ocultar o mostrar barras laterales para modo lienzo libre.
  - `Ctrl + 0`: Resetear zoom al 100%.
  - `Shift + 1`: Ajustar zoom al Frame (Zoom to fit).

---

## 8. MOTOR DE EXPORTACIÓN MULTI-TARGET Y PORTAPAPELES SEGURO

El módulo de exportación de VisualForge Studio adapta sus formatos de forma dinámica y contextual según el `projectType` seleccionado, garantizando un código de salida modular, limpio y autocontenido.

### Formatos Soportados por Target de Proyecto:
1. **Target ESP32 / IoT (Microcontroladores)**:
   - `esp32_html` (**ESP32 WebUI - index.html**):
     - HTML5 100% autónomo y optimizado para almacenamiento en sistemas de archivos embebidos (**SPIFFS** o **LittleFS**).
     - Incorpora **SVGs Inline puros** (sin CDNs, sin conexiones a internet, sin fuentes `.woff` externas).
     - Vincula automáticamente llamadas asíncronas no bloqueantes `updateGPIO(pin, action, val)` mediante la API nativa `fetch('/update?pin=...')` a botones, switches y sliders del lienzo.
     - Incluye notificación flotante de estado en pantalla (*toast*) para retroalimentación instantánea de confirmación de hardware.
   - `esp32_main_cpp` (**Firmware C++ - main.cpp**):
     - Archivo de firmware completo para **Arduino IDE** o **PlatformIO**.
     - Utiliza **ESPAsyncWebServer** para un manejo HTTP asíncrono y no bloqueante.
     - Escanea recursivamente el árbol de componentes del diseño y autogenera `#define PIN_...` y las declaraciones `pinMode(pin, OUTPUT/INPUT)` o canales `ledcAttach` para PWM en `setup()`.
     - Implementa el handler de la ruta `/update` con decodificación de parámetros `pin`, `action` (`TOGGLE_PIN`, `SET_HIGH`, `SET_LOW`, `PWM`, `READ_PIN`) y `val`.
   - `esp32_embedded` (**ESP32 All-in-One - esp32_webserver.h**):
     - Cabecera C++ autocontenida que aloja la interfaz WebUI dentro de `const char INDEX_HTML[] PROGMEM` y la función auxiliar de configuración del servidor.

2. **Target HTML / CSS Tradicional**:
   - `html_css` (**HTML5 Puro con SVGs Inline**):
     - Documento HTML semántico con SVGs integrados en línea y estilos CSS puros integrados. Cero dependencias externas.
   - `html_bootstrap` (**HTML5 + Bootstrap 5.3**):
     - Markup estructurado con rejilla y utilidades de Bootstrap 5.3 y SVGs limpios.

3. **Target React Web (Frontend Moderno)**:
   - `react_shadcn` (**React 19 + shadcn/ui + Tailwind CSS v4**):
     - Componentes limpios en JSX/TSX.
     - Extrae **únicamente** los iconos SVG utilizados en el diseño del usuario y los convierte en subcomponentes funcionales tipados (`React.SVGProps<SVGSVGElement>`), sin importar paquetes pesados innecesarios.
   - `react_bootstrap` (**React + react-bootstrap**):
     - Código modular basado en componentes de `react-bootstrap`.
   - `react_native_tailwind` (**React Native + NativeWind**):
     - Componentes `View`, `Text` y `TouchableOpacity` listos para plataformas móviles.

### Utilidad de Copia Robusta para Sandboxes:
```javascript
const handleCopyCode = async (textToCopy) => {
  let copied = false;
  // 1. Intento nativo con Clipboard API
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(textToCopy);
      copied = true;
    }
  } catch {
    copied = false;
  }
  // 2. Fallback síncrono mediante textarea temporal
  if (!copied && typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.left = '-9999px';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      copied = document.execCommand('copy');
      document.body.removeChild(textarea);
    } catch {
      copied = false;
    }
  }
  setCopySuccess(copied);
  setTimeout(() => setCopySuccess(false), 2500);
};
```

---

## 9. WORKFLOW MULTI-TARGET Y CONTROL DE HARDWARE ESP32 / IoT

VisualForge Studio soporta proyectos orientados a diferentes destinos de compilación y ejecución desde el momento de su creación.

### Selector de Tipos de Proyecto (Modal Nuevo Proyecto)
Al crear un nuevo proyecto (`NewProjectModal`), el usuario puede elegir entre 3 arquitecturas principales:
1. **ESP32 / IoT (Microcontroladores)**:
   - Optimizado para tableros de control de hardware, relés, sensores y automatización embebida.
   - Proporciona la plantilla inicial *ESP32 IoT Hardware Dashboard* con relé en GPIO 4, LED Integrado en GPIO 2, dimmer PWM en GPIO 5 y tarjetas de telemetría.
2. **HTML / CSS Tradicional**:
   - Orientado a páginas web estáticas ultraligeras, emails o sistemas embebidos simples sin frameworks.
3. **React Web (Frontend Moderno)**:
   - Orientado a aplicaciones web modernas basadas en React 19, componentes shadcn/ui y Tailwind CSS v4.

### Panel de Propiedades Condicional: Inspector de Hardware (GPIO)
Cuando el proyecto activo es de tipo `esp32`:
- Aparece una pestaña dedicada **Hardware (GPIO)** en la cabecera del panel lateral derecho con el icono de microcontrolador (`Cpu`).
- Para componentes interactivos (`button`, `switch`, `slider`, `toggle`, `checkbox`), se añade además una sección integrada de **Hardware / GPIO (ESP32)** dentro de la pestaña principal `Design`.
- **Propiedades de Hardware Configurables**:
  - **Habilitar Control GPIO**: Switch de activación que vincula el componente visual con el hardware físico.
  - **Pin GPIO**: Selector desplegable con pines comunes de ESP32 (`GPIO 2` LED built-in, `GPIO 4` Relé, `GPIO 5` PWM, `GPIO 12-27`, `GPIO 32-33`) y soporte para número de pin libre.
  - **Tipo de Acción (`action`)**:
    - `TOGGLE_PIN`: Invierte el estado lógico del pin digital (ideal para conmutar relés o pulsadores).
    - `SET_HIGH`: Fuerza el pin a nivel alto (3.3V / 1 lógico).
    - `SET_LOW`: Fuerza el pin a nivel bajo (0V / 0 lógico).
    - `PWM`: Modulación de ancho de pulso con rango 0–255 (ideal para dimers de luces LED o control de motores).
    - `READ_PIN`: Configura el pin en modo lectura (`INPUT`) para sensores.
  - **Modo de Comunicación (`mode`)**:
    - `HTTP_GET`: Realiza una petición asíncrona no bloqueante `fetch('/update?pin=X&action=Y')`.
    - `HTTP_POST`: Envío estructurado de payload JSON a `/api/gpio`.
    - `WEBSOCKET`: Transmisión bidireccional por socket en tiempo real.
  - **Etiqueta / Alias**: Nombre descriptivo de hardware (ej. "Relé Iluminación", "Bomba Agua").
  - **Previsualización de Ruta en Tiempo Real**: Muestra el comando exacto que el firmware del microcontrolador espera recibir.

---

## 10. ESTRUCTURA DE DATOS DEL ÁRBOL RECURSIVO (CANVAS TREE)

Cada nodo del lienzo responde a la interfaz estricta de capas jerárquicas:
```typescript
export type ProjectType = 'esp32' | 'html_css' | 'react' | 'framework' | 'hybrid';
export type GpioAction = 'TOGGLE_PIN' | 'SET_HIGH' | 'SET_LOW' | 'PWM' | 'READ_PIN';
export type GpioCommMode = 'HTTP_GET' | 'HTTP_POST' | 'WEBSOCKET';

export interface GpioConfig {
  enabled?: boolean;
  pin: number;
  action: GpioAction;
  mode: GpioCommMode;
  label?: string;
  pwmValue?: number;
}

export interface CanvasNode {
  id: string;                       // Identificador único (ej: "hero-frame-1")
  name?: string;                    // Nombre amigable para el panel de capas (ej: "Header Navbar")
  type: string;                     // Tipo de componente del catálogo
  library: 'shadcn' | 'bootstrap' | 'both';
  isContainer: boolean;             // Si permite anidar elementos hijos (Frame / Stack)
  style: Record<string, any>;       // Estilos CSS/Auto-layout (gap, padding, flex, fills, borders)
  props: Record<string, any>;       // Propiedades específicas (variant, label, src, iconName, gpio)
  children: CanvasNode[];           // Hijos anidados recursivamente
  locked?: boolean;                 // Estado de bloqueo de capa
  hidden?: boolean;                 // Estado de visibilidad de capa
}
```

Funciones inmutables y puras para manipular el árbol de capas:
- `findNodeInTree(nodes, id)`
- `mutateNodeInTree(nodes, id, updateFn)`
- `deleteNodeInTree(nodes, id)`
- `insertChildInTree(nodes, targetParentId, newNode)`
- `insertNodeRelative(tree, targetId, nodeToInsert, position: 'before' | 'after' | 'inside')`
- `moveNodeSibling(nodes, targetId, direction: 'up' | 'down')`
- `reorderNodeInTree(nodes, draggedId, targetId, position: 'before' | 'after' | 'inside')`
- `extractUsedCatalogSvgs(nodes)`: Extrae únicamente los SVGs usados en el lienzo.
- `extractUsedGpioPins(nodes)`: Extrae los pines GPIO configurados para auto-configuración de firmware.

---

## 11. REGLAS DE DESARROLLO Y ALCANCE ESTRICTO (STRICT SCOPE)

- **Modificación y adición estrictamente bajo demanda**: Modificar y agregar únicamente lo que el usuario solicite explícitamente en sus instrucciones.
- **Prohibición de cambios no solicitados**: No realizar refactorizaciones no pedidas, no alterar archivos ni estilos ajenos al alcance del pedido, ni agregar librerías o funcionalidades por cuenta propia.
- **Preservación del trabajo previo**: Mantener intactas las funcionalidades ya implementadas y probadas, salvo petición expresa de cambio.
- **Ejecución directa sin preguntas (Ámbito exclusivo de este proyecto)**: No preguntar ni pedir confirmación previa para llevar a cabo los cambios solicitados por el usuario; proceder directamente a su ejecución e implementación. Regla aplicable exclusivamente al proyecto `winWebFormApp`.
- **Actualización mandatoria de especificaciones**: Cada vez que se solicite un cambio, actualización, adición o eliminación en el proyecto, se debe actualizar obligatoriamente este documento (`especificaciones_del_proyecto.md`) para reflejar con exactitud las características y funcionamiento del sistema.
