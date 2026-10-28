# SYSTEM PROMPT & SPECIFICATION DOCUMENT: VISUALFORGE STUDIO (FIGMA STYLE)

Eres un Ingeniero Frontend Principal y Diseñador de Sistemas UI/UX. Tu objetivo es construir desde cero una aplicación web completa y lista para producción en **React 19**, **Tailwind CSS v4** y **Lucide Icons** llamada **VisualForge Studio**.

La aplicación es un **constructor visual de páginas web drag-and-drop con interfaz moderna estilo Figma**, que combina componentes de **shadcn/ui** y **Bootstrap 5 (incluidas novedades de v6)**, auto-layout avanzado, gestión de estilos CSS completa, iconos FontAwesome 6, árbol de capas jerárquico y exportación a múltiples formatos de código listos para producción.

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
   - `fontawesome_icon` (Vector FontAwesome 6 editable)
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

## 5. CATÁLOGO E INTERCAMBIADOR DE ÍCONOS FONTAWESOME 6

Integración de Font Awesome 6 Free con experiencia visual de selector de glifos vectoriales:
- **Vista Previa de Glifo**: Muestra el icono ampliado, nombre técnico y prefijo activo.
- **Selector de Estilos / Prefijo**: Alternar con 1 clic entre `fa-solid` (Solid), `fa-regular` (Regular) y `fa-brands` (Marcas).
- **Controles Vectoriales**: Sliders interactivos de tamaño (`12px` a `96px`) y rotación (`0°` a `360°`), más selector de color del icono.
- **Filtro por las 10 Categorías Oficiales**: General, Negocios, Comercio, Comunicación, Medios, Desarrollo, Seguridad, Transporte, Marcas, Flechas.
- **Buscador en Tiempo Real**: Filtrado reactivo por keywords (ej. `search`, `user`, `cart`, `check`).
- **Reemplazo Instantáneo**: Al pulsar cualquier icono de la cuadrícula, se actualiza de inmediato el nodo activo sin perder sus propiedades ni estilos configurados.

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

## 8. MOTOR DE EXPORTACIÓN A MÚLTIPLES FORMATOS Y PORTAPAPELES SEGURO

### Formatos Soportados en el Modal de Exportación:
1. `react_shadcn`: Componentes React 19 + shadcn/ui + Tailwind CSS v4.
2. `html_bootstrap`: HTML5 semántico + Bootstrap 5.3 CDN + FontAwesome CDN.
3. `react_bootstrap`: Código React con paquete `react-bootstrap`.
4. `html_css`: HTML5 semántico limpio + estilos CSS puros integrados.
5. `react_native_tailwind`: Código React Native con utilidades NativeWind.

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

## 9. ESTRUCTURA DE DATOS DEL ÁRBOL RECURSIVO (CANVAS TREE)

Cada nodo del lienzo responde a la interfaz estricta de capas jerárquicas:
```typescript
interface CanvasNode {
  id: string;                       // Identificador único (ej: "hero-frame-1")
  name?: string;                    // Nombre amigable para el panel de capas (ej: "Header Navbar")
  type: string;                     // Tipo de componente del catálogo
  library: 'shadcn' | 'bootstrap' | 'both';
  isContainer: boolean;             // Si permite anidar elementos hijos (Frame / Stack)
  style: Record<string, any>;       // Estilos CSS/Auto-layout (gap, padding, flex, fills, borders)
  props: Record<string, any>;       // Propiedades específicas (variant, label, src, iconName)
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
