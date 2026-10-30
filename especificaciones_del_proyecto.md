# SYSTEM PROMPT & SPECIFICATION DOCUMENT: VISUALFORGE STUDIO (FIGMA STYLE)

Eres un Ingeniero Frontend Principal y Diseñador de Sistemas UI/UX. Tu objetivo es construir desde cero una aplicación web completa y lista para producción en **React 19**, **Tailwind CSS v4** y **Lucide Icons** llamada **VisualForge Studio**.

La aplicación es un **constructor visual de páginas web drag-and-drop con interfaz moderna estilo Figma**, que combina componentes de **shadcn/ui** y **Bootstrap 5 (incluidas novedades de v6)**, auto-layout avanzado, gestión de estilos CSS completa, iconos FontAwesome 5 Free (58 categorías temáticas), árbol de capas jerárquico y exportación a múltiples formatos de código listos para producción.

---

## 1. ARQUITECTURA GENERAL Y LAYOUT (FIGMA STYLE STUDIO)

La pantalla se distribuye en una interfaz fija estilo herramienta de diseño moderna (`h-screen w-screen bg-[#1e1e1e] text-zinc-100 overflow-hidden flex flex-col font-sans select-none`):

1. **Top Bar / Barra Superior de Figma (`h-11 bg-[#2c2c2c] border-b border-[#383838] px-3 flex items-center justify-between`)**:
   - **Izquierda**:
     - Botón de Menú y Logo dinámico oficial de VisualForge (cinta 3D formando brackets de código `{X}` con fondo 100% transparente sin recuadros ni fondos sólidos), adaptativo según el tema activo de la aplicación:
       - **Tema Oscuro (`dark`)**: Isotipo `{X}` blanco brillante / plateado de alto contraste (`/logos/logo-white.png` o `/logos/logo-dark.png`).
       - **Tema Claro / Neutral (`light`)**: Isotipo `{X}` gris grafito / slate metálico (`/logos/logo-gray.png` o `/logos/logo-light.png`).
       - **Tema Azul / Brand (`blue`)**: Isotipo `{X}` azul cobalto / índigo (`/logos/logo-blue.png`).
       - **Dimensiones y Calibración Óptica**: Tamaño calibrado y ligeramente más compacto (`w-5 h-5` / 20px, relación de aspecto cuadrada estricta `aspect-square`, `object-contain` y alineación con micro-desplazamiento vertical `translate-y-[0.5px]`), evitando estiramientos hacia arriba y garantizando una integración y centrado óptico perfecto con el texto de marca contiguo.
     - Acompañado del texto de marca "VisualForge".
     - Sincronización reactiva en tiempo real del favicon del navegador (`<link rel="icon">`) con el logo del tema activo.
     - Zona despejada y limpia: Los botones de selección (`MousePointer`) y mover lienzo (`Hand`) se trasladan exclusivamente a la barra flotante `FloatingToolbox` para evitar redundancias y mantener la cabecera despejada.
   - **Centro**:
     - Botón para crear o configurar proyecto ("Nuevo").
     - Badge selector de entorno de proyecto (*React Web*, *HTML / CSS*, *ESP32 / IoT*).
     - Título del proyecto editable en línea (ej. `Landing Page - v1`).
     - Indicador verde de guardado y estado sincronizado.
   - **Derecha**:
     - Historial de Estados (Undo `Ctrl+Z` / Redo `Ctrl+Shift+Z` o `Ctrl+Y`).
     - **Selector de Tema de la Aplicación**: Botonera compacta integrada con soporte para 4 modos de tema:
       - **Automático (`system`)**: Detecta automáticamente la configuración del sistema operativo/PC mediante `window.matchMedia('(prefers-color-scheme: dark)')` y escucha cambios en tiempo real.
       - **Oscuro (`dark`)**: Tema visual clásico de Figma Studio con cromas oscuros y logo blanco.
       - **Claro (`light`)**: Tema visual limpio y luminoso con cromas claros, fondo neutral y logo gris grafito.
       - **Azul (`blue`)**: Tema Midnight Indigo con tonalidades azuladas oscuras y logo azul cobalto.
       - Persistencia automática de la preferencia en `localStorage` (`vf_app_theme`), resolución reactiva y marcado en atributos HTML (`data-app-theme` y `data-theme-setting`).
       - **Garantía Integral de Contraste y Legibilidad Sin Pérdida de Texto**:
         - En modo claro (`light`), todos los campos de texto, inputs, selectores y textareas en paneles laterales y modales cuentan con fondo blanco `#ffffff` y tipografía oscura `#0f172a` de alto contraste, evitando textos blancos invisibles sobre fondo claro.
         - Las etiquetas atenuadas y textos secundarios utilizan contraste calibrado `#475569` para lectura nítida.
         - El Artboard aísla su esquema tipográfico para evitar que herede clases de texto del contenedor principal de la aplicación, preservando la fidelidad del diseño web visualizado.
         - En modo azul (`blue`), los campos y controles integran fondos azul marino `#131c31` con tipografía clara `#f1f5f9` y bordes bien definidos para evitar textos negros o atenuaciones ilegibles.
         - En modo oscuro (`dark`), el panel de propiedades del lienzo (`Canvas Settings Inspector`) cuenta con contraste reforzado: tarjetas en `#1b1c1e` con bordes `#3a3b40`, títulos de sección en `text-zinc-200` con viñeta azul cian, etiquetas secundarias en `text-zinc-300`, contenedores definidos para desplegables (`bg-[#25262a] border-[#3e3f46] text-white`), campos de ancho/alto con distintivo monoespaciado azul `#0d99ff`, swatches de paleta oscura con doble reborde visible (`border-2 border-white/25`), botones de dispositivos inactivos con fondo sólido delimitado (`bg-[#1e1e20] text-zinc-300 border-[#383838]`), e indicación global `:root, [data-app-theme="dark"] { color-scheme: dark; }` con reglas explícitas para elementos `option` que evitan fondos blancos nativos o texto desvanecido al abrir menús desplegables.
     - **Frame / Device Selector (Reposicionado)**: Controles de vista de dispositivo (*Desktop 1440px*, *Tablet 768px*, *Mobile 375px*) reubicados en el lateral derecho, situados estratégicamente al lado de los controles de Zoom y del botón Preview.
     - Selector de Nivel de Zoom (`ZoomOut`, porcentaje editable/clic para reset a `100%`, `ZoomIn`).
     - **Botón Present / Preview (Play `▶` / Eye)**: Alterna entre modo diseño y modo vista previa interactiva.
     - **Botón Share / Export Code**: Abre el modal de exportación de código fuente.

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
     - **Assets (`AssetsToolbar`) (Componentes & Catálogo)**:
       - Componente dedicado `AssetsToolbar` integrado en el panel lateral con fondo oscuro y estética de editor moderno (`bg-[#1e1e1e] / bg-[#252526]`).
       - **Cabecera General**: Título principal visible y limpio **"Assets"** en la parte superior, acompañado del contador total de elementos y badge de origen (*Shadcn UI*, *Preline UI* o *ESP32 IoT*).
       - **Barra de Búsqueda y Filtro**: Búsqueda en tiempo real con botón para limpiar (`X`) y chips de categoría rápida (*All*, *Primitives*, *Charts*, *Hardware & IoT*, *Composite*).
       - **Bloques Colapsables con Flechas Indicadoras**: Secciones organizadas en bloques colapsables (*Primitives*, *Charts*, *Hardware & IoT (ESP32)*, y categorías de la biblioteca compuesta) con flechas indicadoras de expansión (`ChevronDown` desplegado, `ChevronRight` colapsado) y contador numérico por bloque. Auto-expansión de bloques coincidentes al buscar.
       - **Diseño Compacto de Tarjetas**: Cuadrícula de 2 columnas con bordes redondeados y sutiles (`rounded-lg bg-[#252526] border border-[#383838] hover:border-[#0d99ff] hover:bg-[#2c2c2e]`).
       - **Alineación Interna**: Icono representativo a la izquierda en contenedor estilizado seguido del nombre limpio del componente:
         - "Heading" con icono `T`
         - "Paragraph" con icono `¶`
         - "Button" con icono de cursor de acción
         - "Input" con icono de cursor de entrada de texto
         - "Container" con icono de recuadro de contenedor (`Square`)
          - "Icon", "Image", "Label", "Textarea", "Checkbox", "Radio", "Select", "Container", etc.
       - **Guía Inferior "Drag to UI"**: Cada tarjeta incluye un pie sutil con el texto de guía `"Drag to UI"` y el tirador de arrastre `GripVertical`.
       - **Interacción Completa**: Soporte tanto para arrastre directo (Drag-and-Drop) al lienzo como para clic para inserción instantánea en el contenedor seleccionado o artboard.
   - Pestaña colapsable con atajo `Ctrl+\` / `Cmd+\` para maximizar el lienzo.

3. **Lienzo Central (Infinite Canvas & Artboard Viewport)**:
   - **Microcuadrícula de Puntos Ultra-Densa con Iluminación Interactiva por Cursor**:
     - Espaciado ultra-compacto y ceñido a `6px 6px` con micropuntos diminutos de radio `0.75px` (textura de alta densidad idéntica a la referencia visual, reemplazando la cuadrícula amplia anterior).
     - **Efecto de Iluminación Interactiva Tenue y Delicado (Interactive Dot Glow)**: Al pasar el cursor del ratón sobre el fondo del canvas, los puntos se iluminan dinámicamente con un brillo suave, tenue y de baja intensidad (en azul cian / blanco a 35% de opacidad) acompañado de un halo sutil de luz ambiental, evitando cualquier deslumbramiento.
     - **Aceleración GPU 60-144 FPS**: Alimentado por variables CSS `--mouse-x` y `--mouse-y` en tiempo real sin recargar ni re-renderizar componentes de React.
     - **Sincronización Panorámica**: Los puntos del fondo y su iluminación interactiva se desplazan en perfecta sincronía atómica con las coordenadas `pan.x` y `pan.y` del lienzo.
   - **Sistema Integral de Scroll y Desplazamiento Fluido en el Canvas**:
     - **Scroll Vertical y Horizontal con Rueda / Trackpad**: Desplazamiento libre bidireccional mediante la rueda del ratón o gestos de dos dedos en trackpad (`deltaY` para vertical, `deltaX` o `Shift + Rueda` para horizontal), permitiendo navegar páginas web completas de cualquier longitud con respuesta instantánea a 60-144 FPS sin retardos de transición.
     - **Zoom Fluido no Bloqueante (`Ctrl + Rueda / Pinch`)**: Zoom continuo entre 25% y 250% previniendo el escalado accidental de la ventana del navegador (`e.preventDefault()`).
     - **Desplazamiento por Teclado**: Soporte para teclas `PageDown` (bajar 350px), `PageUp` (subir 350px) y `Home` (volver al origen `0, 0`).
     - **Botón Flotante "Centrar Lienzo"**: Indicador visual en la esquina inferior derecha que muestra el desplazamiento acumulado (ej. `+450px`) y permite regresar al origen en un solo clic.
     - **Detección de Contenedores Internos con Scroll**: Respeta el scroll nativo en campos de texto multilínea (`textarea`) o bloques con scroll interno cuando aún tienen contenido por desplazar.
   - Soporte para **Pan** (arrastre con rueda del ratón o barra espaciadora/Hand Tool) y navegación panorámica en 360 grados.
   - El diseño se aloja dentro de un **Artboard / Frame central** con sombra flotante y etiqueta superior (ej. *"Desktop - 1440 × 900"*).
   - **Selección Estilo Figma**:
     - Borde de selección azul/violeta (`border-[#0d99ff]` o `ring-2 ring-violet-500`).
     - 8 tiradores de redimensionamiento (corners y bordes) con esquinas redondeadas.
     - Etiqueta flotante con dimensiones en tiempo real (ej. `w: 320px h: 48px`).
   - **Selección del Lienzo y Deselección Global (Click en Vacío)**:
     - **Deselección de Componentes**: Al hacer clic en cualquier área despejada sin elementos (tanto en el área libre del Artboard central como en el lienzo exterior infinito `<main>`), se deselecciona automáticamente cualquier componente activo, limpiando la selección.
     - **Selección del Artboard / Lienzo**: Al hacer clic directamente en la etiqueta de cabecera del Artboard (ej. *"Desktop - 1440 × 900"*), en el área vacía del Artboard, o en la fila "Lienzo Principal / Canvas Artboard" del panel de Capas, el Lienzo pasa al estado activo (`selectedId === 'canvas'`), enmarcándose con un anillo de selección azul cian (`ring-2 ring-[#0d99ff]`).
     - **Desplazamiento / Pan Rápido desde la Parte Superior del Lienzo**: Al presionar y arrastrar sobre la parte superior del lienzo (en la etiqueta/cabecera del Artboard o en la franja superior del cuerpo del lienzo), el cursor adopta el estado de manito (`cursor-grab` / `cursor-grabbing`) y permite desplazar panorámicamente todo el lienzo con la misma fluidez y libertad que la herramienta Manito (`Hand`). Al mismo tiempo, selecciona el lienzo para acceder de inmediato a sus propiedades.

4. **Panel Lateral Derecho: Inspector de Diseño (Figma Design & Inspect Panel, `w-80 bg-[#252526] border-l border-[#383838] flex flex-col`)**:
   - Pestañas superiores:
     - **Design (Diseño)**: Control de alineación, Auto-layout, dimensiones, tipografía, rellenos, bordes y sombras.
     - **Inspect / Code (Inspección)**: Vista previa instantánea del código CSS / Tailwind generado del elemento seleccionado.
   - Colapsable para enfoque en pantalla completa.
   - **Inspector de Propiedades del Lienzo (Canvas Settings Inspector)**:
     - Se activa automáticamente cuando se selecciona el Lienzo (`selectedId === 'canvas'`) o cuando no hay ningún elemento hijo seleccionado en el lienzo.
     - **Dimensiones y Dispositivo (Presets por Dispositivo y Tamaño Manual)**:
       * **Selector de Categoría**: Botonera conmutadora entre Desktop, Tablet y Móvil.
       * **Tamaños por Defecto según el Dispositivo**: Al seleccionar Desktop se despliegan sus tamaños estándar (Desktop Estándar 1440×900, Full HD 1920×1080, MacBook Pro 16" 1728×1117, MacBook Pro 14" 1512×982, MacBook Air 13" 1280×800, Desktop Compacto 1024×768); al seleccionar Tablet sus tamaños correspondientes (iPad Mini / Base 768×1024, iPad Air 820×1180, iPad Pro 11" 834×1194, iPad Pro 12.9" 1024×1366, Surface Pro 8 960×1440, Tablet Android 800×1280); al seleccionar Móvil sus tamaños representativos (iPhone 16/15 Pro 393×852, iPhone Pro Max 430×932, iPhone 13/14 390×844, iPhone X/11 375×812, iPhone SE 375×667, Galaxy S24 Ultra 412×915, Android Común 360×800).
       * **Dimensiones Manuales**: Campos numéricos directos para Ancho (`W`) y Alto (`H`) en píxeles ajustables libremente a cualquier medida deseada, con botón para invertir/rotar orientación (Landscape / Portrait).
     - **Color de Fondo del Lienzo (`artboardBg`)**: Selector nativo de color hexadecimal con paleta de colores predefinidos (Dark `#121214`, Midnight `#0b0f19`, Pure White `#ffffff`, Slate `#f8fafc`, Cream `#fafaf9`).
     - **Contraste Tipográfico Automático**: Cálculo automático del color de texto por defecto del lienzo en función de la luminosidad del fondo elegido, garantizando que el texto nunca desaparezca ni pierda contraste.
     - **Espaciados Globales**: Configuración directa de relleno interno (`padding`: None, Compact 16px, Normal 24px, Spaced 32px, Relaxed 48px) y separación entre secciones (`gap`: 0, 12px, 16px, 24px, 32px, 48px).
     - **Tipografía Global (`fontFamily`)**: Selector de familia tipográfica predeterminada para el lienzo (*Inter / Sans*, *Roboto*, *Fira Code / Mono*, *Playfair / Serif*, *System UI*).
     - **Visualización de Guías**: Conmutador para activar o desactivar la cuadrícula de puntos guía de fondo (`showGrid`).
     - **Acciones Rápidas del Lienzo**: Botones dedicados para "+ Añadir Contenedor Raíz", "Exportar Código" y "Borrar Todo" (que borra de inmediato todos los elementos dentro del lienzo de forma directa y sin ventanas de confirmación).
     - **Garantía de Alto Contraste en Modo Oscuro**: Tarjetas contenedoras en `#1b1c1e` con bordes delimitados `#3a3b40`, títulos de sección nítidos con viñeta indicadora azul cian, selectores y cajas numéricas con fondo `#25262a` y borde `#3e3f46`, etiquetas W y H resaltadas en azul neón `#0d99ff`, y muestras de color oscuro con borde exterior contrastado `border-white/25` para máxima visibilidad en temas oscuros.

5. **Barra de Herramientas Flotante (`FloatingToolbox`) (Estilo Segmentado Modular Figma UI3 con Barra Contextual Acoplada)**:
   - **Ubicación y Estructura Visual Modular (Segmented Capsule Islands)**:
     - Posición inicial flotante centrada horizontalmente en la parte inferior de la pantalla (`bottom-6 left-1/2 -translate-x-1/2`), con arrastre fluido por el espacio de trabajo.
     - **Barra Contextual Superior para Selección ("Toolbox de Arriba")**:
       * Acoplada directamente sobre la barra principal del toolbox ("pegada al toolbox de abajo" con separación de `gap-2`).
       * **Visibilidad condicional estricta**: Aparece única y exclusivamente cuando existe un elemento seleccionado (`selectedId !== null`); cuando no hay selección, se oculta automáticamente manteniendo la interfaz despejada.
       * **Diseño e Iconografía**: Estilo en cápsula (`rounded-full bg-[#17181a]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl px-3.5 py-1`) con:
         - Identificador del nodo seleccionado en tipografía monoespaciada azul cian neón (`#00a3ff`).
         - Divisor vertical sutil (`w-px h-3.5 bg-white/15`).
         - Botones de acción contextual: Para componentes incluye **Duplicar** (`Copy`), **Subir** (`ArrowUp`), **Bajar** (`ArrowDown`) y **Eliminar** (`Trash2` en rojo suave). Cuando el Lienzo está seleccionado (`selectedId === 'canvas'`), muestra la etiqueta "Lienzo" y el botón de eliminar (`Trash2`) borra de inmediato todos los elementos dentro del lienzo sin confirmación previa ni preguntas.
       * **Movimiento Solidario**: Al arrastrar la barra por el espacio de trabajo o acoplarla arriba/abajo, la barra contextual superior se traslada de forma solidaria y unificada con el toolbox inferior.
     - **Contenedor Principal de Herramientas ("Toolbox de Abajo")**:
       * Cápsula compacta y redondeada (`inline-flex items-center gap-1.5 bg-[#17181a]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.7)] rounded-2xl p-1.5`).
       * Distribución modular en 4 islas/segmentos estilizados con estética fiel a Figma UI3:
         * **Isla 1 - Puntero de Selección (`Select / MousePointer2`)**: Botón independiente (`w-11 h-[38px] rounded-xl`) con el icono de puntero de flecha angulada outline `MousePointer2` en blanco; activo por defecto con fondo azul vibrante (`bg-[#0d99ff] shadow-[0_0_14px_rgba(13,153,255,0.5)]`).
         * **Isla 2 - Cápsula de Navegación y Creación**: Contenedor oscuro unificado (`bg-[#25272a] rounded-xl px-1.5 h-[38px] border border-white/[0.04] flex items-center gap-1`) que agrupa 4 herramientas de acción con resaltado individual:
           - **Pan / Hand (`H`)**: Desplazamiento y navegación panorámica por el lienzo.
           - **Container / Frame (`F`)**: Icono de recuadro con 4 puntos de anclaje en las esquinas (`FrameIcon`) para dibujo y arrastre de contenedores Flexbox/Grid.
           - **Heading (`T`)**: Tipografía con icono de letra mayúscula limpia `A` para inserción y arrastre de títulos.
           - **Paragraph (`P`)**: Icono compuesto con líneas de texto horizontales y la letra 'T' lateral integrada (`ParagraphIcon`) para bloques de texto y párrafos.
         * **Isla 3 - Mosaico Cluster de Iconos UI**: Cápsula interactiva (`bg-[#25272a] rounded-xl px-2.5 h-[38px] border border-white/[0.04]`) con un mosaico en 2 filas de mini iconos vectoriales representativos (Fila 1: `Bell`, `ShoppingCart`, `Ticket`, `Layers`; Fila 2: píldora de alternancia, `Heart`, `Image`). Al hacer clic despliega el popover de iconos UI flotante con buscador en vivo y drag-and-drop de iconos.
         * **Isla 4 - Multimedia / Image (`I`)**: Botón independiente (`w-11 h-[38px] rounded-xl bg-[#25272a] border border-white/[0.04]`) con icono de imagen estilizada (`PhotoImageIcon`: marco con bordes redondeados, sol en la esquina superior derecha y cordillera de montañas).
   - **Funcionalidad de Movimiento Libre y Acoplamiento Inteligente (Smart Docking)**:
     - Arrastre interactivo fluido mediante eventos globales de ratón haciendo clic en cualquier área del contenedor base.
     - **Acoplamiento Inteligente (Smart Docking)**: Si el usuario arrastra la barra hacia la parte superior (`y < 110px`), se encaja suavemente en el top (`top-14`) con animación de transición; si se devuelve hacia el fondo (`y > window.innerHeight - 130px`), se acopla en la parte inferior (`bottom-6`); en cualquier otra posición, permanece flotando libremente en las coordenadas exactas de suelta (`dockPosition: 'free'`).
     - Guías visuales luminosas (`dockGuide` de neón azul pulsante) que anticipan el acoplamiento al acercarse a las zonas top o bottom.
   - **Comportamiento Interactivo, Arrastre y Colocación Cómoda (Smart Placement & 1-Click Insert)**:
     - **Inserción Instantánea Cómoda (1 Clic)**: Al pulsar cualquier herramienta del toolbox (`container`, `heading`, `paragraph`, `image` o iconos del popover), el elemento se coloca instantáneamente en el contenedor seleccionado (o como hermano si se seleccionó un nodo simple, o en la sección principal del artboard si no hay selección), seleccionándolo de inmediato para edición y mostrando un toast flotante de confirmación (ej. `✓ Título colocado en el lienzo`).
     - **Arrastre Directo con Precisión (Drag-and-Drop)**: Cada botón de herramienta es arrastrable de forma nativa (`draggable={true}`) permitiendo arrastrar directamente desde la barra flotante a cualquier punto del lienzo artboard o soltarlo con precisión antes, dentro o después de cualquier contenedor gracias a las líneas y zonas de guía neón.
     - **Modo Colocación Interactivo en Lienzo (Atajos de Teclado F, T, P, I)**: Al activar el modo mediante teclas rápidas, el cursor del lienzo muestra una insignia flotante dinámica (badge con icono y texto e.g. `➕ Clic para colocar Título | Esc`) y resalta en tiempo real el elemento o contenedor objetivo sobre el que se encuentra el cursor.
     - **Selección Exclusiva (Radio-Group)**: Solo una herramienta puede estar activa a la vez. La herramienta activa cambia su fondo a un azul vibrante (`bg-[#0d99ff] text-white shadow-[0_0_14px_rgba(13,153,255,0.5)]`) y modifica en tiempo real el cursor del lienzo (`cursor-default`, `cursor-grab`, `cursor-crosshair`, `cursor-text`, `cursor-copy`).
     - **Feedback Visual y Tooltips**: Tooltips emergentes flotantes con orientación adaptativa (arriba o abajo según el acoplamiento de la barra), etiquetas descriptivas ("Clic para colocar o arrastra") y badges con atajos de teclado (`[V]`, `[H]`, `[F]`, `[T]`, `[P]`, `[I]`).
     - **Menú Flotante de Iconos (Popover UI)**: Al hacer clic en la Isla 3 de mosaico, despliega una ventana flotante translúcida encima/debajo del toolbox con buscador en tiempo real y cuadrícula de 32 iconos UI comunes con soporte para inserción al clic o arrastre individual de cada icono.
     - **Atajos de Teclado Globales**: Escucha teclas `V`, `H`, `F`, `T`, `P`, `I` y `Escape` (siempre que el usuario no esté redactando en campos de texto).

---

## 2. CATÁLOGOS DINÁMICOS DE COMPONENTES UI (CATÁLOGO A: SHADCN/UI & CATÁLOGO B: PRELINE UI)

El panel lateral de componentes (`LeftSidebar`) se adapta dinámicamente según el tipo de proyecto activo (`projectType`), cargando estrictamente el catálogo correspondiente:
- **Proyectos de Framework (`projectType === 'react' | 'framework'`)**: Carga los componentes compuestos oficiales de **Shadcn/ui**.
- **Proyectos de HTML / CSS o ESP32 (`projectType === 'html_css' | 'esp32'`)**: Carga los componentes compuestos oficiales de **Preline UI**.

### 2.0 CATEGORÍAS ESTÁNDAR COMUNES: COMPONENTES BÁSICOS (DISPONIBLES PARA TODOS LOS PROYECTOS)

En **todos los proyectos sin excepción** (tanto Frameworks como HTML/CSS y ESP32), se incluyen de forma universal y prioritaria las categorías de activos básicos y estándar, diseñados como átomos fundamentales reutilizables para construir cualquier sección o pantalla con soporte exhaustivo para propiedades, variantes y estados:

1. **Text (Tipografía)**:
   - **Nivel y Tipo de Texto**: Selector semántico con soporte para títulos (`h1`, `h2`, `h3`, `h4`, `h5`, `h6`), párrafos estándar (`p`), subtítulos destacados (`subtitle`) y etiquetas (`label`).
   - **Propiedades de Estilo**: Tamaño (`fontSize`), peso de fuente (normal/bold con escalas numéricas 100-900), alineación (izquierda, centro, derecha, justificado), color cromático e itálica (`fontStyle: italic`).

2. **Button / Link (Acción)**:
   - **Button (Botón)**: Componente estándar de acción (`isContainer: false`), con selector de tipo de botón (`button`, `submit`, `reset`). Cuenta con soporte completo en el panel de propiedades para añadir y personalizar de forma independiente iconos a la izquierda (`iconLeft`) y a la derecha (`iconRight`), con interruptores de visibilidad dedicados (`showIconLeft`, `showIconRight`). Variantes de estilo (primario/CTA, secundario, outline, ghost, destructive, link), tamaños (pequeño `sm`, mediano `md`, grande `lg`) y estados interactivos (loading, disabled).
   - **Link (Enlace)**: Componente de enlace interactivo no contenedor (`isContainer: false`) para navegación web que comparte los estilos base de acción, con soporte para destino `href`, `target` (`_self`, `_blank`), tamaño, estado deshabilitado e iconos.

3. **Icon (Gráfico)**:
   - Elemento universal para renderizar iconos vectoriales SVG con propiedades directas de tamaño (12px a 96px) y color (trazo `stroke` y relleno `fill`).
   - Control de tamaño dinámico reactivo con slider continuo (12px - 128px), campo numérico directo (8px - 512px) y botones preset rápidos (16, 20, 24, 32, 40, 48, 64px) con sincronización atómica simultánea de `props.size` y `style.width/height/fontSize` para respuesta inmediata en tiempo real.
   - Puede utilizarse de forma independiente en el lienzo o integrarse dentro de botones y enlaces.

4. **Image (Multimedia)**:
   - Contenedor para imágenes con control de proporciones (`aspectRatio`: 16:9, 4:3, 1:1, 21:9, auto), ajuste de contenido (`objectFit`: cover, contain, fill, none), carga diferida (`loading: lazy/eager`) y URL de fallback en caso de error.

5. **Form Controls (Entradas de datos)**:
   - **Configuración de Etiquetas (Labels)**: Los inputs (`Input`, `Textarea`, `Radio` y `Select`) disponen en el panel de propiedades de control total sobre su etiqueta:
     * **Visibilidad**: Interruptor para mostrar u ocultar la etiqueta (`hasLabel: true/false`).
     * **Posicionamiento Cuadrilateral**: Selector de 4 posiciones: Arriba (`top`), Abajo (`bottom`), Izquierda (`left`) y Derecha (`right`).
     * **Conexión Semántica en Código Generado**: En los motores de exportación (React, HTML/Tailwind y Bootstrap), la etiqueta `<label>` queda conectada de forma estricta y accesible al control de entrada mediante el atributo `htmlFor` / `for` coincidiendo con el `id` asignado al campo (`${node.id}_input`, etc.).
   - **Input (Textbox)**: Campo de texto multiuso (variantes de tipo: `text`, `email`, `password`, `number`, `date`, `file`) con estados de error y deshabilitado.
   - **Textarea**: Entrada de texto multilínea con control de filas (`rows`), estados de error y deshabilitado.
   - **Radio (Radio Buttons)**: Control de selección única con gestor dinámico de opciones en el panel de propiedades que permite añadir opciones (`+ Agregar Opción`), editar el texto inline de cada opción y eliminar opciones con botón de papelera.
   - **Select / Combobox**: Menú desplegable con gestor dinámico de opciones en el panel de propiedades para añadir, renombrar inline y eliminar ítems de selección.
   - **Checkbox**: Control de selección múltiple con estado marcado o deshabilitado.

6. **Container (Layout & Form Container Unificado)**:
   - **Contenedor Vacío por Defecto**: Se inicializa completamente vacío (`children: []`), mostrando en el lienzo una guía sutil con borde discontinuo ("Contenedor vacío — Arrastra componentes aquí") hasta que el usuario anide elementos en él.
   - **Unificación de Box y Form**: Se elimina el elemento `Box` independiente del catálogo de assets y se unifica en el componente `Container`.
   - **Conmutador de Tipo en Propiedades**: Permite alternar en cualquier momento entre:
     * **Contenedor estándar (`<div>`)**: Contenedor base de maquetación con soporte para Flexbox y Grid, alineación, espaciados y bordes.
     * **Contenedor de Formulario (`<form>`)**: Actúa como elemento semántico `<form>` con campos de configuración para `action` y `method`. Indica formalmente que los elementos contenidos actúan como campos de formulario y habilita que los botones envueltos puedan definirse como botones de envío (`type="submit"`).

---

### 2.0.1 Componentes IoT & Telemetría y Capa de Data Binding (Exclusivo para Proyectos ESP32)

- **Ámbito Exclusivo**: La capa de **Data Binding** y los componentes de hardware y telemetría están reservados **únicamente para proyectos de tipo ESP32** (`projectType === 'esp32'`). En proyectos de Frameworks o HTML/CSS estándar, la sección de Data Binding se oculta automáticamente del panel de propiedades para mantener una interfaz limpia y enfocada en diseño web.
- **Componentes de Telemetría y Control de Hardware (ESP32)**:
  - `LineChart`: Gráfico de líneas temporales para telemetría continua (ej. temperatura/humedad) con gradientes y puntos pulsantes en vivo.
  - `BarChart`: Gráfico de barras para consumo eléctrico o niveles.
  - `PieChart`: Gráfico circular/anillo para distribución de memoria Flash y Heap del ESP32.
  - `AreaChart`: Gráfico de área para monitoreo de potencia RMS y señal Wi-Fi RSSI.
  - `GaugeChart`: Medidor o tacómetro semicircular con coloreado contextual de rangos.
  - `Telemetry Metric Card`: Widget de monitoreo numérico con indicador de protocolo MQTT/WebSocket, estado y tendencia.
  - `Status Badge`: Indicador de estado de conexión del dispositivo (Online/Offline/Connecting) con animación de ping.
  - `Toggle Switch (Relay Control)`: Interruptor optimizado para conmutación ON/OFF de relés físicos acoplados a pines GPIO.
  - `Slider / Range (PWM / Analógico)`: Control deslizante en tiempo real (0-255) para salidas analógicas o modulación PWM.
- **Data Binding Metadata (Inspector)**: Configuración de modo (`read`, `write`, `bidirectional`), protocolo (`websocket`, `mqtt`, `http-poll`, `serial`), tópicos/endpoints, clave JSON, pin GPIO y frecuencia de refresco en ms.

---

### Catálogo A: Para Frameworks (React / Vue - Basado en Shadcn/ui)
Si el proyecto es de tipo Framework (`projectType === 'react' | 'framework'`), se cargan los componentes compuestos oficiales de Shadcn/ui agrupados en sus categorías:

1. **Layout & Structure (Contenedores y Disposición)**:
   - `Container`: Contenedor centrado responsivo con ancho máximo configurable (`max-w-7xl mx-auto px-4`)
   - `Grid`: Cuadrícula auto-layout configurable en 2, 3 o 4 columnas
   - `Columns`: Disposición horizontal flexible con separación proporcional (`flex gap-4`)
   - `Stack (Flexbox)`: Disposición vertical u horizontal de elementos con espaciado uniforme
   - `Section`: Sección semántica con espaciado vertical para bloques de página
   - `Aspect Ratio`: Frame de proporción fija (16:9, 4:3, 1:1)
   - `Collapsible`: Panel colapsable/expandible interactivo
   - `Resizable`: Grupo de paneles divisores ajustables con manejador
   - `Scroll Area`: Contenedor con barra de desplazamiento estilizada nativa
   - `Separator`: Divisor horizontal o vertical de sección
   - `Skeleton`: Marcador de posición animado para estados de carga

2. **Basic HTML & Typography (Átomos HTML Universales)**:
   - `Heading 1 (H1)`: Título principal de página (32px Bold, `<h1 >`)
   - `Heading 2 (H2)`: Título de sección (24px Bold, `<h2 >`)
   - `Heading 3 (H3)`: Subtítulo o encabezado de bloque (20px SemiBold, `<h3 >`)
   - `Paragraph (P)`: Párrafo de texto descriptivo adaptable (14px, `<p >`)
   - `Text Span`: Texto en línea estirable para acentos o etiquetas (`<span >`)
   - `Link (Enlace)`: Enlace web interactivo con estado hover (`<a >`)
   - `Blockquote (Cita)`: Cita en bloque estilizada con borde lateral
   - `Image (Imagen)`: Elemento de imagen responsiva con bordes redondeados (`<img >`)
   - `Divider (<hr>)`: Línea divisoria semántica horizontal
   - `Icon (Icono Vectorial)`: Icono vectorial interactivo universal (`svg_icon`) con acceso completo al explorador Iconify Offline (+418.000 iconos vectoriales en 244 colecciones), ajuste dinámico de tamaño, color de trazo y relleno.

3. **Forms & Inputs**:
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

4. **Data Display**:
   - `Avatar`: Imagen de perfil de usuario con fallback tipográfico
   - `Badge`: Píldora de estado o etiqueta contextual
   - `Calendar`: Vista de selector de calendario mensual
   - `Card`: Tarjeta compuesta basada en Atomic Design con título, descripción y botones hijos seleccionables
   - `Carousel`: Carrusel de diapositivas con botones de navegación previa/siguiente
   - `Chart`: Vista de contenedor para gráficos y visualización de datos
   - `Data Table`: Tabla de datos estructurada con paginación y cabeceras
   - `Table`: Tabla semántica con TableHeader, TableRow, TableHead y TableCell

5. **Feedback**:
   - `Alert`: Notificación contextual compuesta con título y descripción independientes
   - `Progress`: Barra de progreso de porcentaje con valor dinámico
   - `Sonner / Toast`: Disparador de notificaciones toast flotantes
   - `Skeleton`: Esqueleto de carga para bloques de contenido

6. **Overlays & Navigation**:
   - `Accordion`: Lista colapsable con AccordionTrigger y AccordionContent
   - `Alert Dialog`: Modal de confirmación crítica no descartable accidentalmente
   - `Command`: Paleta de comandos y buscador rápido con atajos
   - `Context Menu`: Menú flotante al hacer clic derecho
   - `Dialog (Modal)`: Ventana modal emergente compuesta con título, descripción y acciones hijas
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
Si el proyecto es de tipo HTML o ESP32 (`projectType === 'html_css' | 'esp32'`), se cargan los componentes agrupados en sus 7 categorías oficiales:

1. **Layout & Content**:
   - `Container`: Contenedor responsivo centrado (`max-w-7xl mx-auto px-4`)
   - `Columns`: Disposición en columnas responsivas (`grid grid-cols-1 md:grid-cols-X`)
   - `Grid`: Cuadrícula con espaciado configurable
   - `Layout Splitter`: Divisor de diseño horizontal/vertical con bordes sutiles
   - `Heading 1 (H1)`: Título principal H1 (32px Bold)
   - `Heading 2 (H2)`: Título de sección H2 (24px Bold)
   - `Heading 3 (H3)`: Subtítulo o bloque H3 (20px SemiBold)
   - `Paragraph (P)`: Párrafo de texto con contenido descriptivo y legible
   - `Text Span`: Texto en línea (`span`) para inline styling
   - `Typography`: Bloque tipográfico semántico con selector dinámico de etiquetas HTML
   - `Images`: Imágenes responsivas con bordes redondeados y modo fit
   - `Links`: Enlaces estilizados con transiciones y colores de acento
   - `Dividers and <hr>`: Separadores horizontales con estilo sutil Preline
   - `KBD`: Elementos de teclado formateados (`kbd`) para atajos
   - `Custom Scrollbar`: Contenedor con barra de scroll personalizada
   - `Icon (Icono Vectorial)`: Icono vectorial interactivo universal (`svg_icon`) con acceso completo al explorador Iconify Offline (+418.000 iconos vectoriales en 244 colecciones) y exportación limpia como SVG en línea puro para HTML y firmware C++ ESP32.

2. **Base Components**:
   - `Accordion`: Acordeones expandibles Preline (`hs-accordion`)
   - `Alerts`: Alertas compuestas basadas en Atomic Design con título y descripción independientes
   - `Avatar`: Avatares circulares o cuadrados con aro de contraste
   - `Avatar Group`: Conjunto apilado de avatares con superposición negativa
   - `Badge`: Etiquetas redondeadas de estado Preline
   - `Blockquote`: Citas destacadas con barra lateral azul
   - `Buttons`: Botones con variantes sólida, outline, ghost y soft
   - `Button Group`: Grupo de botones agrupados contiguos
   - `Cards`: Tarjetas compuestas con título, descripción y botones de acción hijos
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
   - `Navbar`: Barra de navegación compuesta con logo, enlaces interactivos y botón de acción
   - `Mega Menu`: Menú desplegable amplio para múltiples columnas de navegación
   - `Navs`: Enlaces de navegación tipo pastilla o subrayado
   - `Tabs`: Pestañas interactivas de cambio de vista
   - `Sidebar`: Barra lateral de aplicación con navegación vertical
   - `Scrollspy`: Navegación vinculada al scroll de secciones
   - `Breadcrumb`: Miga de pan con separadores
   - `Pagination`: Paginador con botones numéricos y anterior/siguiente
   - `Stepper`: Indicador visual de progreso paso a paso

---

### 2.1 ARQUITECTURA DE ATOMIC DESIGN Y COMPONENTES COMPUESTOS PERSONALIZABLES

Tanto en el catálogo de Frameworks (Shadcn/ui) como en el de HTML / ESP32 (Preline UI), los componentes complejos se rigen bajo los principios de **Atomic Design**:

1. **Jerarquía Átomos, Moléculas y Organismos**:
   - **Átomos**: Elementos individuales básicos como `Heading (H1-H3)`, `Paragraph (P)`, `Text Span`, `Button`, `Link`, `Badge`, `Image` y `Divider`.
   - **Moléculas y Organismos (Componentes Compuestos)**: Componentes estructurados como `Card`, `Alert`, `Dialog / Modal` y `Navbar`.

2. **Sub-elementos Hijos Seleccionables e Independientes (`defaultChildren`)**:
   - Al insertar un componente compuesto (por ejemplo, una `Card`), este se descompone en un árbol de nodos hijos reales (`defaultChildren`):
     - `Card Title (H3)`: Nodo tipográfico individual.
     - `Card Description (P)`: Nodo de párrafo descriptivo individual.
     - `Card Actions (Container)`: Contenedor flex con botones hijos primario y secundario.
   - **Selección Directa en Canvas y Capas**: Al hacer clic sobre el título dentro de una tarjeta en el lienzo, la propagación del evento se detiene (`e.stopPropagation()`) y se selecciona exclusivamente el título, mostrando su bounding box y etiqueta pill correspondiente. El usuario también puede seleccionar el elemento hijo desde el árbol de capas (`LeftSidebar`).
   - **Personalización Completa en el Inspector de Diseño**: Al seleccionar cualquier sub-elemento, el panel lateral derecho (`RightSidebar`) activa todos sus controles para ese nodo específico: cambio de texto, selector de etiqueta HTML (`h1`-`h6`, `p`, `span`), tamaño de fuente, peso tipográfico, color de texto, espaciados (padding y margin), alineación, bordes y sombras.
   - **Selección del Contenedor Padre**: Para estilizar el fondo, bordes o paddings del componente completo (ej. la tarjeta o el modal), el usuario puede hacer clic en el margen/área vacía del contenedor o seleccionarlo en el panel de capas.

3. **Instanciación con IDs Únicos Recursivos (`instantiateNodeWithFreshIds`)**:
   - Para evitar colisiones de identificadores cuando se insertan múltiples instancias de un mismo componente compuesto, el motor de inserción recorre recursivamente el árbol de `defaultChildren` asignando IDs aleatorios únicos (`${type}_...`) a cada sub-elemento, preservando íntegramente sus propiedades, estilos y etiquetas.

4. **Exportación Limpia y No Duplicada**:
   - Los generadores de código (`nodeToJSX` y `nodeToPrelineHtml`) detectan si un componente compuesto contiene nodos hijos. Si contiene `children`, emiten directamente el markup de los sub-elementos hijos sin generar cabeceras estáticas duplicadas, garantizando un código de salida 100% fiel al diseño visual y optimizado tanto para React 19 / JSX como para HTML5 con clases de Tailwind y firmware ESP32 en C++.

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
   - Renderiza fielmente los componentes según el catálogo activo (`shadcn` para Frameworks, `preline` para HTML/ESP32, y la categoría universal `Componentes Básicos`).
   - Soporta interactividad en modo Preview (tabs, sliders, toggles, acordeones, modales, relés y controles PWM).
   - Inyecta metadatos del catálogo y datos de enlace (`dataBinding`) en cada nodo para garantizar su correcta exportación.

2. **Pipeline de Exportación Multi-Target**:
   - **Para React / Framework (`react_shadcn`)**:
     - Genera código JSX/TSX limpio, modular y desacoplado.
     - Utiliza importaciones directas de componentes oficiales de Shadcn (`@/components/ui/...`).
     - Renderiza visualizadores de telemetría SVG (`LineChart`, `BarChart`, `PieChart`, `GaugeChart`) y widgets (`MetricCard`, `RelaySwitch`, `PwmSlider`) listos para usar en dashboards de monitoreo.
     - Transforma los SVGs utilizados en funciones de componentes de React nativas (`convertSvgToJsx`).
   - **Para HTML / Tailwind (`html_css`)**:
     - Genera HTML5 semántico utilizando clases oficiales de Tailwind CSS basadas en la arquitectura de Preline UI.
     - Inserta los componentes de gráficos con SVGs vectoriales inline y atributos descriptivos de enlace (`data-topic`, `data-binding-mode`).
     - Inserta los iconos como **SVGs Inline directos**, sin dependencias de fuentes externas ni hojas de estilo CDN pesadas.
   - **Para ESP32 / IoT (`esp32_html`, `esp32_main_cpp`, `esp32_embedded`)**:
     - **`index.html`**: Totalmente autónomo y optimizado para microcontroladores con recursos limitados. Emplea SVGs inline puros (0 fuentes `.woff`), estilos mínimos y scripts asíncronos con `fetch('/api/gpio/toggle?pin=X')` y `fetch('/api/gpio/pwm?pin=X&val=Y')`.
     - **`main.cpp`**: Genera firmware C++ listo para compilar con `ESPAsyncWebServer`, detectando y configurando automáticamente en `setup()` el `pinMode()` (OUTPUT, INPUT o PWM con `ledcAttach`) de todos los pines utilizados tanto en la configuración clásica de GPIO como en el nuevo catálogo IoT (`relay_switch`, `pwm_slider` y `dataBinding`). Incluye las rutas REST para control inmediato desde el navegador.
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

## 4. INSPECTOR DE DISEÑO Y PROPIEDADES ESTILO FIGMA (JERARQUÍA DEL PANEL DE DISEÑO)

El panel lateral derecho (`RightSidebar`) cuenta con un inspector de diseño exhaustivo de alta fidelidad idéntico a Figma, estructurado exactamente en el orden estándar de la barra de propiedades de Figma:

### 1. Barra de Alineación Superior (Figma Top Alignment Toolbar)
Fijada permanentemente en la parte superior del panel de diseño (`Design`), proporciona acceso inmediato a las 6 operaciones estándar de alineación:
- **Alinear a la Izquierda (`AlignStartHorizontal`)**: Alinea los elementos hijos al inicio horizontal (`alignItems: flex-start`).
- **Centrar Horizontalmente (`AlignCenterHorizontal`)**: Centra los elementos hijos horizontalmente (`alignItems: center`).
- **Alinear a la Derecha (`AlignEndHorizontal`)**: Alinea los elementos hijos al final horizontal (`alignItems: flex-end`).
- **Separador Vertical**: Divisor sutil idéntico a Figma.
- **Alinear Arriba (`AlignStartVertical`)**: Distribuye los elementos al inicio vertical (`justifyContent: flex-start`).
- **Centrar Verticalmente (`AlignCenterVertical`)**: Centra los elementos verticalmente (`justifyContent: center`).
- **Alinear Abajo (`AlignEndVertical`)**: Distribuye los elementos al final vertical (`justifyContent: flex-end`).

### 2. Frame / Dimensiones y Visualización (Frame, Dimensions & Display)
- **Identificación del Nodo**: Nombre del componente, punto indicador y píldora con etiqueta semántica HTML (`<tag>`).
- **Propiedad Display**: Selector desplegable con soporte para `block` (bloque completo), `flex` (auto-layout flexible), `inline-block` (en línea dimensionable), `inline-flex`, `grid` y `inline`.
- **Dimensiones W & H**: Entradas directas para ancho (`width`) y alto (`height`).
- **Atajos Rápidos de Dimensionamiento**:
  - `Hug Contents`: Ajusta el tamaño al contenido (`width: auto`, `alignSelf: auto`).
  - `Fill Container`: Ocupa todo el contenedor padre disponible (`width: 100%`, `alignSelf: stretch`).
- **Límites de Tamaño**: Entradas para ancho mínimo (`minWidth`) y ancho máximo (`maxWidth`).

### 3. Auto Layout & Espaciado (Auto Layout, Flexbox, Gap, Padding y Márgenes)
- **Dirección Flex**: Conmutadores de dirección Horizontal (`ArrowRight` / Row) y Vertical (`ArrowDown` / Column).
- **Matriz Interactiva 3x3**: Cuadrícula de 9 puntos para posicionar los hijos en el contenedor, actualizando simultáneamente `alignItems` y `justifyContent` con lectura en tiempo real.
- **Item Gap (`gap`)**: Entrada de espaciado entre elementos y píldoras de acceso rápido (`0px`, `8px`, `16px`, `24px`).
- **Padding (Relleno Interior)**:
  - Botón de vinculación (`Link2` / `Unlink`) para alternar entre valor uniforme y 4 lados independientes.
  - *Modo Uniforme*: Entrada única que actualiza todos los lados (`paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`) con píldoras de valores rápidos (`0px`, `8px`, `12px`, `16px`, `24px`).
  - *Modo Independiente*: Cuadrícula de 4 entradas dedicadas (`Top`, `Right`, `Bottom`, `Left`).
- **Margin (Márgenes Exteriores)**:
  - Botón de vinculación (`Link2` / `Unlink`) para alternar entre valor uniforme y 4 lados independientes.
  - *Modo Uniforme*: Entrada única con píldoras rápidas (`0px`, `8px`, `16px`, `24px`, `32px`).
  - *Modo Independiente*: Cuadrícula de 4 entradas dedicadas (`Top`, `Right`, `Bottom`, `Left`).
  - **Botón Auto Center**: Aplica `marginLeft: auto; marginRight: auto;` para centrado horizontal automático.

### 4. Propiedades de Componente (Component Properties)
Controles contextuales específicos según el componente o sub-elemento seleccionado:
- **Elementos Tipográficos HTML (`typography`, `text`)**:
  - Selector de nivel o tipo de texto (`h1`-`h6`, `subtitle`, `p`, `label`, `span`, `blockquote`, `div`, `code`).
  - Píldoras rápidas de jerarquía (`H1`, `H2`, `H3`, `H4`, `Sub`, `P`, `Label`, `Span`, `Quote`).
  - Editor de texto multilínea (`props.text`).
  - Conmutadores rápidos de peso tipográfico (Normal 400 vs Bold 700) y de estilo Cursiva / Itálica (`fontStyle`: normal vs italic con icono `Italic`).
- **Botones (`button`)**:
  - Etiqueta de texto (`props.label`).
  - Selector de variante visual (*Primario/CTA*, *Secundario*, *Outline*, *Ghost*, *Destructive*, *Link*).
  - Selector de tamaño (*sm*, *md*, *lg*).
  - Conmutadores de estados interactivos: *Loading* (con spinner animado `Loader2`), *Disabled* (deshabilitado) y *Activo* (anillo de foco Figma).
  - Integración de iconos vectoriales: selector de icono (`iconName`), posición (*Izquierda* o *Derecha*), píldoras de presets rápidos y acceso al explorador Iconify Offline.
- **Enlaces (`link`)**: Texto del enlace (`label`), URL (`href`), destino (`target`: `_self`, `_blank`), variantes compartidas de acción (*Link*, *Primario*, *Secundario*, *Outline*, *Ghost*), selector de tamaño (*sm*, *md*, *lg*), estado deshabilitado e icono integrado.
- **Imágenes (`image`)**: URL de imagen (`src`), texto alternativo (`alt`), control de proporción en píldoras (`aspectRatio`: *Auto*, *16:9*, *4:3*, *1:1*, *21:9*), ajuste de contenido (`objectFit`: *cover*, *contain*, *fill*, *none*), conmutador de carga diferida (*lazy* vs *eager*) y URL de fallback en caso de error (`fallbackSrc`) con restablecimiento a placeholder por defecto.
- **Contenedores de Maquetación (`box`, `container`, `stack`)**:
  - Conmutador rápido de distribución de maquetación: *Fila (Row)*, *Columna (Stack)*, *Grid 2 Cols*, *Grid 3 Cols*, *Grid 4 Cols* y *Bloque (Block)*.
- **Formularios (`form`)**: Endpoint de acción (`action`), método de transmisión HTTP (*POST*, *GET*) y conmutador de orientación de campos (*Fila* vs *Columna*).
- **Etiquetas (`label`)**: Texto descriptivo (`text`), identificador de campo vinculado (`htmlFor`) y conmutador de campo obligatorio (*required*) con asterisco visual rojo (`*`).
- **Campos de Formulario (`input`, `searchbox`)**: Tipo de entrada (*text*, *email*, *password*, *number*, *date*, *file*), placeholder, valor por defecto, etiqueta vinculada, conmutador de campo obligatorio, conmutador de estado de error (`hasError`) con mensaje explicativo (`errorMessage`), y conmutador deshabilitado (`disabled`).
- **Áreas de Texto Multilínea (`textarea`)**: Etiqueta vinculada, placeholder, contador de filas visibles (`rows`), campo obligatorio, estado de error con mensaje y estado deshabilitado.
- **Casillas y Opciones (`checkbox`, `radio`)**: Texto de la opción (`label`), estado marcado inicial (`checked`), nombre de grupo (`name`), editor de lista de opciones separadas por comas (para radios) y estado deshabilitado.
- **Listas Desplegables (`select`, `combobox`)**: Etiqueta, placeholder, editor de opciones en formato separado por comas y estado deshabilitado.
- **Tarjetas, Alertas y Colapsables (`card`, `alert`, `collapsible`)**: Título y descripción multilínea.
- **Teclado (`kbd`)**: Combinación de teclas (`props.keys`).
- **Interruptores y Deslizadores (`switch`, `slider`)**: Etiqueta, mínimo, máximo y valor activo.
- **Iconos Vectoriales (`svg_icon`, `fontawesome_icon`, `styled_icon`)**:
  - **Panel Dedicado de Propiedades de Icono Vectorial**: Reconociendo que los iconos son gráficos vectoriales y **no texto o tipografía**, el panel presenta una interfaz especializada y suprime secciones innecesarias:
    - **Ocultamiento de Tipografía y Layout de Contenedor**: Se omite por completo el panel de Tipografía (`fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `textAlign`, transformaciones `Aa`/`AA`, decoraciones de texto subrayado/tachado y editor de texto) y los controles de flexbox/alineación de hijos en Auto Layout, preservando únicamente el margen exterior (`Margin`) para espaciado en el lienzo.
    - **Dimensionamiento Cuadrado Sincronizado**: Los campos de ancho (`W`) y alto (`H`) en la sección de Frame actualizan el tamaño del icono manteniendo su relación 1:1, acompañados de píldoras de presets (`16px`, `20px`, `24px`, `32px`, `48px`).
    - **Visor Previo & Metadatos**: Vista previa en vivo del icono SVG estilizado, visualización del identificador (`props.icon` o `props.name`), nombre de colección y botón "Cambiar" para acceder al explorador modal Iconify Offline (+418.000 iconos).
    - **Control de Tamaño Integral**: Entrada numérica directa en píxeles (`px`), deslizador continuo (12px a 96px) y 7 píldoras de acceso rápido (`16px`, `20px`, `24px`, `32px`, `40px`, `48px`, `64px`), sincronizando simultáneamente `props.size`, `style.width`, `style.height` y `style.fontSize`.
    - **Color de Trazo / Icono (`Stroke`)**: Selector cromático visual con entrada hexadecimal, botón Clear y 10 muestras rápidas de color.
    - **Color de Relleno Vectorial (`Fill`)**: Selector cromático para el interior de las figuras vectoriales, botón dedicado "Ninguno" (`none`) para iconos con contorno/transparentes y muestras de color.
    - **Orientación y Transformación Geométrica**: Botones de rotación rápida en 90° (`RotateCw`) y volteo horizontal / vertical (`FlipHorizontal`, `FlipVertical`), aplicando transformaciones CSS (`transform: rotate(...) scaleX(...) scaleY(...)`) tanto en el lienzo interactivo como en la exportación (SVG Inline, JSX y ESP32).
- **Componentes Gráficos y Visualización de Datos (`line_chart`, `bar_chart`, `pie_chart`, `area_chart`, `gauge_chart`, `metric_card`)**:
  - Título del gráfico o widget, unidades de medida personalizadas (`°C`, `mA`, `% RH`, `V`, `bar`), color primario o de barras con selector cromático y paleta hex.
  - Valores numéricos mínimo, máximo y umbrales para tacómetros y medidores analógicos (`gauge_chart`).
  - Mapeo de protocolo (`MQTT`, `WebSocket`, `HTTP-Poll`) y etiquetas de tendencia para tarjetas de telemetría (`metric_card`).
- **Controles de Hardware y Estado (`status_badge`, `relay_switch`, `pwm_slider`)**:
  - `status_badge`: Selector de estado (*online*, *connecting*, *offline*), texto descriptivo personalizado, conmutador de pulsación de ping (`pulse`) y latencia en milisegundos.
  - `relay_switch`: Etiqueta descriptiva, pin GPIO vinculado (ej. `GPIO_4`), textos de estado activo/inactivo personalizados y estado inicial abierto/cerrado.
  - `pwm_slider`: Etiqueta descriptiva, pin GPIO de modulación (ej. `GPIO_5`), rango numérico (min 0, max 255) y lectura porcentual en tiempo real.

### 4.1 Data Binding / Metadatos IoT (ESP32 & Hardware)
*(Sección universal presente en todos los componentes para vincularlos con periféricos, sensores o variables C++ de microcontroladores)*
- **Conmutador de Activación (`Activar`)**: Permite habilitar o deshabilitar el enlace de datos para el nodo seleccionado.
- **Modo de Enlace (`bindingMode`)**: Selector entre *Read (Sensores / Lectura)*, *Write (Actuadores / Envío)* y *Bidirectional (Sincronizado)*.
- **Fuente de Datos / Protocolo (`dataSource`)**: Selección del canal de comunicación (*WebSocket*, *MQTT*, *HTTP Polling / REST*, *Serial / UART*).
- **Tópico / Endpoint (`topic` / `endpoint`)**: Ruta del recurso en el firmware o broker (ej. `esp32/sensors/temperature` o `/api/gpio/4`).
- **Clave JSON (`dataKey` / `jsonPath`)**: Clave interna para extracción de valores en payloads JSON complejos (ej. `payload.temperature`).
- **Pin Físico o Variable C++ (`gpioPin` / `variableName`)**: Asignación directa del número de pin físico o nombre de variable en el firmware ESP32 (ej. `GPIO_2`, `ADC_CHANNEL_0`).
- **Intervalo de Refresco (`refreshInterval`)**: Frecuencia de actualización en milisegundos para lecturas periódicas.
- **Previsualización de Código**: Muestra en tiempo real la línea de código equivalente en firmware C++ (`ESP.on(...)` o `ESP.publish(...)`).

### 5. Tipografía (Typography Panel)
*(Visible exclusivamente para componentes con contenido textual; se oculta automáticamente al seleccionar iconos vectoriales)*
- **Tamaño de Fuente (`fontSize`)**: Entrada en píxeles y barra de 8 píldoras de acceso rápido (`12px`, `14px`, `16px`, `18px`, `20px`, `24px`, `32px`, `40px`).
- **Peso de Fuente (`fontWeight`)**: Menú desplegable con 9 escalas numéricas (*Thin 100* a *Black 900*).
- **Interlineado (`lineHeight`)**: Control de espaciado entre líneas (LH).
- **Tracking / Letter Spacing (`letterSpacing`)**: Control de espaciado entre caracteres (LS).
- **Alineación de Texto (`textAlign`)**: 4 botones iconográficos Figma (`AlignLeft`, `AlignCenter`, `AlignRight`, `AlignJustify`).
- **Transformación de Texto (`textTransform`)**: 4 botones (*Aa Normal*, *AA Mayúsculas*, *aa Minúsculas*, *Ab Capitalizar*).
- **Decoración & Estilo de Texto**: Cuadrícula de 4 botones iconográficos: *Ninguna* (`—`), *Subrayado* (`Underline`), *Tachado* (`Strikethrough`) y conmutador de *Itálica / Cursiva* (`Italic` - `fontStyle: italic/normal`).
- **Color de Texto (`color`)**: Selector visual cromático, entrada hexadecimal, botón *Clear* y 10 muestras de color rápidas.
- **Color de Texto (`color`)**: Selector visual cromático, entrada hexadecimal, botón *Clear* y 10 muestras de color rápidas.

### 6. Fill (Relleno y Color de Fondo)
- **Color de Fondo (`backgroundColor`)**: Selector cromático, entrada manual hexadecimal y botón *Clear* para fondo transparente.
- **Muestras de Color Predefinidas**: 8 muestras rápidas (*Transparente*, *Zinc 950*, *Zinc 900*, *Zinc 800*, *Figma Blue*, *Esmeralda*, *Rojo*, *Blanco*).

### 7. Stroke (Trazo, Bordes y Esquinas)
- **Radio de Esquinas (`borderRadius`)**: Entrada directa en píxeles y 6 píldoras de presets (`0px`, `4px`, `8px`, `12px`, `16px`, `9999px Pill`).
- **Grosor de Borde (`borderWidth`)**: Entrada directa en píxeles.
- **Estilo de Borde (`borderStyle`)**: Menú desplegable (*Solid*, *Dashed*, *Dotted*, *None*).
- **Color de Borde (`borderColor`)**: Selector visual cromático con entrada hexadecimal y botón *Clear*.

### 8. Effects & Layer (Efectos y Capa)
- **Sombra de Caja (`boxShadow`)**: Selector desplegable con sombras preconfiguradas (*Ninguna*, *Small*, *Medium*, *Large*, *Extra Large*, *Blue Glow*, *Emerald Glow*).
- **Opacidad de Capa (`opacity`)**: Deslizador continuo de 0% a 100% con visualización porcentual dinámica.

### 9. Fidelidad Visual en el Lienzo y Prevención de Desfase de Márgenes
- En el lienzo (`NodeRenderer`), cuando un elemento no está en modo vista previa, los márgenes exteriores se aplican al contenedor exterior interactivo del nodo. Esto garantiza que la pastilla de agarre Figma (`GripVertical`) y el marco azul de selección (`ring-2 ring-[#0d99ff]`) se ajusten con precisión milimétrica al contorno del componente sin duplicar márgenes ni desplazar visualmente el recuadro de selección.
- En modo vista previa (`Preview`) y en la exportación de código, los estilos se consolidan fielmente en línea o mediante objetos JSX.

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

Organizado en secciones limpias y compactas que reproducen fielmente la jerarquía visual de la barra de propiedades de Figma:

1. **Barra de Alineación Superior (Figma Top Alignment Toolbar)**:
   - Iconos nativos Figma de alineación rápida: `AlignStartHorizontal` (Izquierda), `AlignCenterHorizontal` (Centro), `AlignEndHorizontal` (Derecha), divisor, `AlignStartVertical` (Arriba), `AlignCenterVertical` (Centro), `AlignEndVertical` (Abajo).
2. **Frame / Dimensiones y Visualización**:
   - Cabecera con indicador de nodo y etiqueta semántica HTML.
   - Selector de modo de despliegue `Display` (`block`, `flex`, `inline-block`, `inline-flex`, `grid`, `inline`).
   - Entradas de dimensiones `W` (Ancho) y `H` (Alto) con atajos `Hug Contents` y `Fill Container`.
   - Restricciones de tamaño `MinW` y `MaxW`.
3. **Auto-layout (Flexbox & Espaciado)**:
   - Dirección: Horizontal (`Row`) o Vertical (`Column`).
   - Matriz 3x3 interactiva de alineación y justificación.
   - Control de `Item Gap` con píldoras de acceso rápido.
   - `Padding` con conmutador de vinculación uniforme/independiente (4 lados) y píldoras.
   - `Margin` con conmutador de vinculación, píldoras y botón `Auto Center` (`margin: 0 auto`).
4. **Propiedades de Componente (Component Properties)**:
   - Controles contextuales: selector de etiqueta HTML `h1`-`h6`, `p`, etc., editor de texto, variantes de botón/badge, links, imágenes, inputs, cards, switches, sliders, kbd.
   - **Inspector de Iconos Vectoriales Dedicado (`svg_icon`, `fontawesome_icon`, `styled_icon`)**:
     - Visualización previa en vivo, identificador y acceso a Iconify Offline (+418.000 iconos).
     - Control de tamaño numérico (px), slider continuo (12px-96px) y píldoras rápidas (`16px`, `20px`, `24px`, `32px`, `40px`, `48px`, `64px`).
     - Control cromático de trazo (`Stroke`) y de relleno interior (`Fill`) con opción "Ninguno" (transparente).
     - Controles de rotación en 90° (`RotateCw`) y volteo horizontal y vertical (`FlipHorizontal`, `FlipVertical`).
5. **Tipografía (Typography Panel)**:
   - *(Oculto automáticamente para iconos vectoriales, al no ser texto o tipografía)*
   - Tamaño (`fontSize`) y peso (`fontWeight`).
   - Píldoras de tamaño rápido (`12px` a `40px`), interlineado (`lineHeight`) y tracking (`letterSpacing`).
   - Alineación de texto (Izquierda, Centro, Derecha, Justificado).
   - Transformación (Aa, AA, aa, Ab) y decoración (Ninguna, Subrayado, Tachado).
   - Color de texto con selector cromático, hex, Clear y 10 muestras rápidas.
6. **Fill (Relleno y Fondo)**:
   - Capa de color sólido con selector cromático, hex, Clear y 8 muestras predefinidas.
7. **Stroke (Trazo y Bordes)**:
   - Radio de esquinas (`Corner Radius`) con 6 píldoras rápidas (`0px` a `9999px Pill`).
   - Grosor de borde (`borderWidth`) y estilo (Solid, Dashed, Dotted, None).
   - Color de borde con selector cromático, hex y botón Clear.
8. **Effects & Layer (Efectos y Capa)**:
   - Sombra de caja (`boxShadow`) con 7 variantes calibradas y neones.
   - Opacidad de capa (`opacity`) con deslizador porcentual de 0% a 100%.
9. **Hardware / ESP32**:
   - Inspector condicional de pines GPIO, acciones y modos de comunicación si el proyecto es ESP32.

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

---

## 12. CONFIGURACIÓN DE ENTORNO TYPESCRIPT Y HERRAMIENTAS

- **`tsconfig.app.json` (Frontend Application Code)**:
  - Configurado con `"moduleResolution": "bundler"`, `"noEmit": true`, `"jsx": "react-jsx"`, `"isolatedModules": true`, `"moduleDetection": "force"`.
  - Mapeo de alias de importación `@/*` apuntando a `src/*` con `"baseUrl": "."`.
  - Eliminación de opciones no estándar o incompatibles con versiones de TypeScript / VS Code anteriores a 5.6 (`noUncheckedSideEffectImports`, `allowImportingTsExtensions`), garantizando cero errores y avisos en el editor y compatibilidad total con `tsc -b` y Vite.
- **`tsconfig.json` (Root Solution Config)**:
  - Contiene referencias por proyecto a `tsconfig.app.json` y `tsconfig.node.json`.
  - Incluye configuración de `compilerOptions.baseUrl` y `compilerOptions.paths` para compatibilidad global de resolución de alias `@/*` en extensiones y herramientas de desarrollo.
- **`tsconfig.node.json` (Tooling & Config)**:
  - Configuración optimizada para scripts y archivos de entorno Node (`vite.config.ts`).
- **`.vscode/settings.json`**:
  - Configuración de workspace que vincula automáticamente el Language Server de VS Code al SDK de TypeScript del proyecto (`node_modules/typescript/lib`).
