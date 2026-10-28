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
       - **Hand Tool (`H`)**: Modo exclusivo de navegación y desplazamiento panorámico (Pan) del lienzo:
         - No permite seleccionar elementos ni modificar selecciones existentes.
         - Deshabilita los eventos de selección, clics, tiradores de arrastre y guías hover sobre los componentes (`pointer-events-none`).
         - Permite arrastrar el lienzo fluidamente desde cualquier punto de la pantalla (fondo, artboard o sobre cualquier componente) con cursores `cursor-grab` y `cursor-grabbing`.
         - **Activación rápida con Barra Espaciadora (`Space + Drag` estilo Photoshop / Figma)**: Al mantener presionada la barra espaciadora (sin estar escribiendo en un campo de texto), se activa de forma instantánea el modo Hand temporal con cursor de mano para desplazar la pantalla. Al soltar la barra espaciadora, se restaura automáticamente la herramienta previa sin perder el foco ni la selección.
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
       - Iconos semánticos por tipo de nodo y tiradores de arrastre (`GripVertical`) visibles en hover.
       - **Movimiento y Reordenamiento de Capas por Arrastre (Drag-and-Drop)**:
         - Arrastrar cualquier capa para reordenarla jerárquicamente o anidarla dentro de contenedores.
         - Detección precisa de zonas: línea de neón magenta superior (`before`), línea magenta inferior (`after`), y recuadro violeta translúcido (`inside`) para contenedores.
         - Interoperabilidad bidireccional: arrastrar una capa directamente al lienzo o un componente del lienzo al árbol de capas.
         - Soltar en el área vacía del panel de capas traslada el nodo a la raíz del árbol.
       - **Botones de Movimiento Rápido de Capa**: Controles dedicados "Subir capa" (`ArrowUp`) y "Bajar capa" (`ArrowDown`) en cada fila de capa al pasar el cursor.
       - Indicadores de visibilidad (icono de ojo para ocultar/mostrar) y candado (bloquear edición).
       - Acceso rápido para eliminar capas.
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

## 2. CATÁLOGOS DINÁMICOS DE COMPONENTES UI (CATÁLOGO A: SHADCN/UI & CATÁLOGO B: PRELINE UI)

El panel lateral de componentes (`LeftSidebar`) se adapta dinámicamente según el tipo de proyecto activo (`projectType`), cargando estrictamente el catálogo correspondiente:

### Catálogo A: Para Frameworks (React / Vue - Basado en Shadcn/ui)
Si el proyecto es de tipo Framework (`projectType === 'react' | 'framework'`), se cargan **únicamente** los siguientes componentes agrupados en sus 5 categorías oficiales:

1. **Layout & Structure**:
   - `Aspect Ratio`: Frame de proporción fija (16:9, 4:3, 1:1)
   - `Collapsible`: Panel colapsable/expandible interactivo
   - `Resizable`: Grupo de paneles divisores ajustables con manejador
   - `Scroll Area`: Contenedor con barra de desplazamiento estilizada nativa
   - `Separator`: Divisor horizontal o vertical de sección
   - `Skeleton`: Marcador de posición animado para estados de carga

2. **Forms & Inputs**:
   - `Button`: Botón con variantes Shadcn (default, outline, ghost, secondary, destructive, link)
   - `Checkbox`: Casilla de verificación con estado booleano
   - `Form`: Estructura contenedora de formulario con espaciado uniforme
   - `Input`: Campo de entrada de texto con etiqueta vinculada
   - `Input OTP`: Entrada especializada para códigos numéricos / OTP de 6 dígitos con separador
   - `Label`: Etiqueta tipográfica accesible para formularios
   - `Radio Group`: Conjunto de opciones de selección única
   - `Select`: Menú desplegable selector de opciones
   - `Slider`: Control deslizante de rango numérico
   - `Switch`: Interruptor basculante interactivo on/off
   - `Textarea`: Área de texto multilinea para mensajes largos
   - `Toggle / Toggle Group`: Botones de pulsación de estado persistente

3. **Data Display**:
   - `Avatar`: Imagen de perfil de usuario con fallback tipográfico
   - `Badge`: Píldora de estado o etiqueta contextual
   - `Calendar`: Vista de selector de calendario mensual
   - `Card`: Tarjeta con CardHeader, CardTitle, CardDescription y CardContent
   - `Carousel`: Carrusel de diapositivas con botones de navegación previa/siguiente
   - `Chart`: Vista de contenedor para gráficos y visualización de datos
   - `Data Table`: Tabla de datos estructurada con paginación y cabeceras
   - `Table`: Tabla semántica con TableHeader, TableRow, TableHead y TableCell

4. **Feedback**:
   - `Alert`: Notificación contextual con AlertTitle y AlertDescription
   - `Progress`: Barra de progreso de porcentaje con valor dinámico
   - `Sonner / Toast`: Disparador de notificaciones toast flotantes
   - `Skeleton`: Esqueleto de carga para bloques de contenido

5. **Overlays & Navigation**:
   - `Accordion`: Lista colapsable con AccordionTrigger y AccordionContent
   - `Alert Dialog`: Modal de confirmación crítica no descartable accidentalmente
   - `Command`: Paleta de comandos y buscador rápido con atajos
   - `Context Menu`: Menú flotante al hacer clic derecho
   - `Dialog (Modal)`: Ventana modal emergente con diálogo interactivo
   - `Drawer`: Panel deslizante inferior o lateral para dispositivos
   - `Dropdown Menu`: Menú desplegable anclado a un botón disparador
   - `Hover Card`: Tarjeta emergente que aparece al pasar el cursor
   - `Menubar`: Barra de menús superior estilo aplicación de escritorio
   - `Navigation Menu`: Menú de navegación principal con enlaces multinivel
   - `Popover`: Contenedor emergente de información enriquecida
   - `Sheet`: Panel deslizable lateral tipo offcanvas
   - `Sidebar`: Barra lateral de navegación fija o colapsable
   - `Tabs`: Pestañas de navegación de contenido con switch de tab activo
   - `Tooltip`: Mensaje flotante breve de asistencia contextual

---

### Catálogo B: Para HTML / ESP32 (HTML Plano con Clases de Tailwind CSS - Basado en Preline UI)
Si el proyecto es de tipo HTML o ESP32 (`projectType === 'html_css' | 'esp32'`), se cargan **únicamente** los siguientes componentes agrupados en sus 7 categorías oficiales:

1. **Layout & Content**:
   - `Container`: Contenedor responsivo centrado (`max-w-7xl mx-auto px-4`)
   - `Columns`: Disposición en columnas responsivas (`grid grid-cols-1 md:grid-cols-X`)
   - `Grid`: Cuadrícula con espaciado configurable
   - `Layout Splitter`: Divisor de diseño horizontal/vertical con bordes sutiles
   - `Typography`: Encabezados H1-H6 y párrafos con clases de texto de Tailwind
   - `Images`: Imágenes responsivas con bordes redondeados y modo fit
   - `Links`: Enlaces estilizados con transiciones y colores de acento
   - `Dividers and <hr>`: Separadores horizontales con estilo sutil Preline
   - `KBD`: Elementos de teclado formateados (`kbd`) para atajos
   - `Custom Scrollbar`: Contenedor con barra de scroll personalizada

2. **Base Components**:
   - `Accordion`: Acordeones expandibles Preline (`hs-accordion`)
   - `Alerts`: Alertas con bordes y fondos translúcidos
   - `Avatar`: Avatares circulares o cuadrados con aro de contraste
   - `Avatar Group`: Conjunto apilado de avatares con superposición negativa
   - `Badge`: Etiquetas redondeadas de estado Preline
   - `Blockquote`: Citas destacadas con barra lateral azul
   - `Buttons`: Botones con variantes sólida, outline, ghost y soft
   - `Button Group`: Grupo de botones agrupados contiguos
   - `Cards`: Tarjetas Preline con borde, sombra y contenedor de contenido
   - `Chat Bubbles`: Globos de conversación de mensajería
   - `Carousel`: Carrusel Preline para banners y medios
   - `Collapse`: Secciones desplegables simples
   - `Datepicker`: Selector de fecha estilizado con Tailwind
   - `Devices`: Mockup de dispositivo móvil para previsualización
   - `Lists`: Listas de viñetas simples o con iconos
   - `List Group`: Listas agrupadas con divisores sutiles
   - `Legend Indicator`: Indicador circular de estado (ej. Online/Offline)
   - `Progress`: Barra de progreso continua
   - `File Uploading Progress`: Barra de progreso para transferencias y archivos
   - `Ratings`: Puntuación de estrellas interactiva
   - `Skeleton`: Bloque de pulsación para carga en Preline
   - `Spinners`: Indicador giratorio de espera
   - `Styled Icons`: Contenedores decorativos para vectores SVG
   - `Toasts`: Notificación emergente estilo Preline
   - `Timeline`: Línea de tiempo cronológica con nodos y conectores
   - `Tree View`: Vista en árbol jerárquico de carpetas o recursos
   - `Marquee`: Texto continuo o marquesina deslizante

3. **Navigations**:
   - `Navbar`: Barra de navegación adaptable con branding y enlaces
   - `Mega Menu`: Menú desplegable amplio para múltiples columnas de navegación
   - `Navs`: Enlaces de navegación tipo pastilla o subrayado
   - `Tabs`: Pestañas interactivas de cambio de vista
   - `Sidebar`: Barra lateral de aplicación con navegación vertical
   - `Scrollspy`: Navegación vinculada al scroll de secciones
   - `Breadcrumb`: Miga de pan con separadores
   - `Pagination`: Paginador con botones numéricos y anterior/siguiente
   - `Stepper`: Indicador visual de progreso paso a paso

4. **Basic Forms**:
   - `Input`: Entrada de texto con borde Preline y foco interactivo
   - `Input Group`: Input con prefijo o sufijo (ej. URLs, dominios, monedas)
   - `Textarea`: Área de texto multilínea
   - `File Input`: Selector de archivos con botón estilizado de Tailwind
   - `Checkbox`: Casilla de verificación accesible
   - `Radio`: Botón de opción circular
   - `Switch`: Interruptor tipo toggle con animación suave
   - `Select`: Menú de selección nativo estilizado
   - `Range Slider`: Deslizador de rango compatible con control GPIO
   - `Color Picker`: Selector de paleta cromática nativo integrado
   - `TimePicker`: Selector de hora horaria

5. **Advanced Forms**:
   - `Advanced Select`: Selector avanzado con soporte de filtrado
   - `ComboBox`: Entrada combinada de búsqueda y selección
   - `SearchBox`: Campo de búsqueda con icono de lupa integrado
   - `Input Number`: Control numérico con botones más/menos contiguos
   - `Strong Password`: Campo de contraseña con indicador de fortaleza
   - `Toggle Password`: Campo de contraseña con botón mostrar/ocultar
   - `Toggle Count`: Contador interactivo de votos o clics
   - `Copy Markup`: Bloque de código con botón copiar al portapapeles
   - `PIN Input`: Casillas separadas para ingreso de código o token

6. **Overlays**:
   - `Dropdown`: Menú contextual desplegable Preline
   - `Context Menu`: Menú activado por clic derecho
   - `Modal`: Ventana emergente con fondo oscurecido y pie de acciones
   - `Offcanvas (Drawer)`: Panel lateral retráctil
   - `Popover`: Ventana emergente de información contextual
   - `Tooltip`: Ayuda flotante para elementos

7. **Tables**:
   - `Tables`: Tablas semánticas con estilos modernos de Tailwind y divisores sutiles

---

### 3. MOTOR DE RENDERIZADO Y EXPORTACIÓN ADAPTATIVA

El sistema garantiza coherencia total entre el lienzo de edición y el código exportado:

1. **Lienzo Central (Canvas & NodeRenderer)**:
   - Renderiza fielmente los componentes según el catálogo activo (`shadcn` vs `preline`).
   - Soporta interactividad en modo Preview (tabs, sliders, toggles, acordeones, modales).
   - Inyecta metadatos del catálogo en cada nodo para garantizar su correcta exportación.

2. **Pipeline de Exportación Multi-Target**:
   - **Para React / Framework (`react_shadcn`)**:
     - Genera código JSX/TSX limpio, modular y desacoplado.
     - Utiliza importaciones directas de componentes oficiales de Shadcn (`@/components/ui/...`).
     - Transforma los SVGs utilizados en funciones de componentes de React nativas (`convertSvgToJsx`).
   - **Para HTML / Tailwind (`html_css`)**:
     - Genera HTML5 semántico utilizando clases oficiales de Tailwind CSS basadas en la arquitectura de Preline UI.
     - Inserta los iconos como **SVGs Inline directos**, sin dependencias de fuentes externas ni hojas de estilo CDN pesadas.
   - **Para ESP32 / IoT (`esp32_html`, `esp32_main_cpp`, `esp32_embedded`)**:
     - **`index.html`**: Totalmente autónomo y optimizado para microcontroladores con recursos limitados. Emplea SVGs inline puros (0 fuentes `.woff`), estilos mínimos y un script asíncrono no bloqueante (`updateGPIO(pin, action, val)`).
     - **`main.cpp`**: Genera firmware C++ listo para compilar con `ESPAsyncWebServer`, configurando automáticamente en `setup()` el `pinMode()` (OUTPUT, INPUT o PWM con `ledcAttach`) de todos los pines utilizados en el diseño y los endpoints de control REST.
     - **`esp32_webserver.h`**: Cabecera C++ todo en uno con el HTML/SVG guardado en memoria flash `PROGMEM` (`R"rawliteral(...)rawliteral"`).

---

## 3. MOTOR DE DRAG & DROP Y MOVIMIENTO DE COMPONENTES DENTRO DEL CANVAS

El lienzo implementa un sistema integral de arrastre, reordenamiento y desplazamiento de componentes con precisión estilo Figma:

1. **Movimiento Directo en el Canvas (Drag-and-Drop Reordering)**:
   - **Tirador / Handle Figma Integrado**: Al seleccionar cualquier componente en el lienzo (modo edición), se despliega una pastilla superior azul (`bg-[#0d99ff]`) con icono de agarre (`GripVertical`) y el nombre del elemento, permitiendo agarrarlo y arrastrarlo fluidamente.
   - **Arrastre Directo**: El usuario puede hacer clic y arrastrar directamente el componente o su tirador superior con cursor visual de agarre (`cursor-grab` / `cursor-grabbing`).
   - **Retroalimentación Visual Durante el Arrastre**: El componente en movimiento adquiere opacidad translúcida (`opacity-30 scale-[0.98]`), indicando que está siendo reposicionado.
   - **Prevención de Auto-anidado e Inconsistencias**: El sistema impide que un componente sea soltado sobre sí mismo o dentro de uno de sus propios descendientes.

2. **Detección Dinámica de Zonas de Inserción (Smart Drop Zones)**:
   - **Para Contenedores (`isContainer: true`)**:
     - *Borde Superior (25%)*: Inserción `before` indicada por una barra de neón magenta (`#d946ef`) con marcadores circulares en los extremos.
     - *Centro (50%)*: Inserción `inside` señalada por un recuadro violeta translúcido (`ring-2 ring-violet-500 bg-violet-500/15`) con insignia descriptiva *"Soltar dentro de [Nombre]"*.
     - *Borde Inferior (25%)*: Inserción `after` con barra de neón magenta.
   - **Para Componentes No Contenedores (Botones, Inputs, Textos, etc.)**:
     - *Mitad Superior (50%)*: Inserción `before`.
     - *Mitad Inferior (50%)*: Inserción `after`.
     - Elimina el error de soltar elementos dentro de componentes que no admiten hijos.
   - **Soltar en el Fondo del Lienzo**: Mueve el componente directamente al nivel raíz del diseño.

3. **Atajos de Teclado y Controles Contextuales de Movimiento**:
   - **Atajo `Alt + ↑` (ArrowUp)**: Mueve inmediatamente el componente seleccionado hacia arriba entre sus hermanos.
   - **Atajo `Alt + ↓` (ArrowDown)**: Mueve inmediatamente el componente seleccionado hacia abajo entre sus hermanos.
   - **Pastilla Flotante Inferior**: Botones dedicados "Subir" (`ArrowUp`) y "Bajar" (`ArrowDown`) disponibles en todo momento mientras haya un elemento seleccionado.

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
