import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MousePointer,
  Hand,
  Square,
  Heading,
  AlignLeft,
  Sparkles,
  Image as ImageIcon,
  GripVertical,
  X,
  Search,
  Bell,
  ShoppingCart,
  Heart,
  Star,
  CheckCircle2,
  User,
  Settings,
  Mail,
  Rocket,
  Flame,
  Shield,
  Zap,
  Globe,
  ThumbsUp,
  MessageSquare,
  Camera,
  Music,
  MapPin,
  Bookmark,
  Cpu,
  BatteryCharging,
  Wifi,
  Sliders,
  Share2,
  Folder,
  Calendar,
  Clock,
  Lock,
  Tag,
  HelpCircle,
} from 'lucide-react';
import { ToolMode, ComponentDefinition } from '../types';

export interface FloatingToolboxProps {
  toolMode: ToolMode;
  setToolMode: (tool: ToolMode) => void;
  onInsertComponent: (compDef: ComponentDefinition) => void;
  selectedId: string | null;
  className?: string;
}

const POPULAR_ICONS = [
  { name: 'Bell', label: 'Notificación', icon: Bell },
  { name: 'ShoppingCart', label: 'Carrito', icon: ShoppingCart },
  { name: 'Heart', label: 'Favorito', icon: Heart },
  { name: 'Star', label: 'Estrella', icon: Star },
  { name: 'CheckCircle2', label: 'Verificado', icon: CheckCircle2 },
  { name: 'User', label: 'Usuario', icon: User },
  { name: 'Settings', label: 'Ajustes', icon: Settings },
  { name: 'Search', label: 'Buscar', icon: Search },
  { name: 'Mail', label: 'Correo', icon: Mail },
  { name: 'Rocket', label: 'Cohete', icon: Rocket },
  { name: 'Flame', label: 'Fuego', icon: Flame },
  { name: 'Shield', label: 'Seguridad', icon: Shield },
  { name: 'Zap', label: 'Rayo', icon: Zap },
  { name: 'Globe', label: 'Global', icon: Globe },
  { name: 'ThumbsUp', label: 'Like', icon: ThumbsUp },
  { name: 'MessageSquare', label: 'Mensaje', icon: MessageSquare },
  { name: 'Camera', label: 'Cámara', icon: Camera },
  { name: 'Music', label: 'Música', icon: Music },
  { name: 'MapPin', label: 'Ubicación', icon: MapPin },
  { name: 'Bookmark', label: 'Guardado', icon: Bookmark },
  { name: 'Cpu', label: 'Procesador', icon: Cpu },
  { name: 'BatteryCharging', label: 'Batería', icon: BatteryCharging },
  { name: 'Wifi', label: 'Wi-Fi', icon: Wifi },
  { name: 'Sliders', label: 'Filtros', icon: Sliders },
  { name: 'Share2', label: 'Compartir', icon: Share2 },
  { name: 'Sparkles', label: 'Destacado', icon: Sparkles },
  { name: 'Folder', label: 'Carpeta', icon: Folder },
  { name: 'Calendar', label: 'Calendario', icon: Calendar },
  { name: 'Clock', label: 'Reloj', icon: Clock },
  { name: 'Lock', label: 'Candado', icon: Lock },
  { name: 'Tag', label: 'Etiqueta', icon: Tag },
  { name: 'HelpCircle', label: 'Ayuda', icon: HelpCircle },
];

export const FloatingToolbox: React.FC<FloatingToolboxProps> = ({
  toolMode,
  setToolMode,
  onInsertComponent,
  selectedId,
  className = '',
}) => {
  const toolboxRef = useRef<HTMLDivElement>(null);

  // Estados de Posición y Arrastre (Drag & Smart Docking)
  const [dockPosition, setDockPosition] = useState<'bottom' | 'top' | 'free'>('bottom');
  const [freeCoords, setFreeCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dockGuide, setDockGuide] = useState<'top' | 'bottom' | null>(null);

  // Estado del Menú Flotante de Iconos
  const [isIconsMenuOpen, setIsIconsMenuOpen] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState('');

  // Iconos filtrados para la ventana flotante
  const filteredIcons = useMemo(() => {
    const q = iconSearchQuery.trim().toLowerCase();
    if (!q) return POPULAR_ICONS;
    return POPULAR_ICONS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) || item.label.toLowerCase().includes(q)
    );
  }, [iconSearchQuery]);

  // Manejo de Arrastre con Mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    // Si se hizo clic en un botón interactivo o dentro del popover, no iniciar arrastre
    if ((e.target as HTMLElement).closest('button, input, [data-interactive="true"]')) {
      return;
    }
    e.preventDefault();

    if (!toolboxRef.current) return;
    const rect = toolboxRef.current.getBoundingClientRect();

    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setFreeCoords({
      x: rect.left,
      y: rect.top,
    });
    setIsDragging(true);
    setDockPosition('free');
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      const barWidth = toolboxRef.current?.offsetWidth || 440;
      const barHeight = toolboxRef.current?.offsetHeight || 50;

      // Mantener dentro del viewport
      const clampedX = Math.max(12, Math.min(window.innerWidth - barWidth - 12, newX));
      const clampedY = Math.max(50, Math.min(window.innerHeight - barHeight - 12, newY));

      setFreeCoords({ x: clampedX, y: clampedY });

      // Detección de zona de acoplamiento inteligente (Smart Docking Preview)
      if (e.clientY < 110) {
        setDockGuide('top');
      } else if (e.clientY > window.innerHeight - 130) {
        setDockGuide('bottom');
      } else {
        setDockGuide(null);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      setDockGuide(null);

      // Smart Docking Snap
      if (e.clientY < 110) {
        setDockPosition('top');
      } else if (e.clientY > window.innerHeight - 130) {
        setDockPosition('bottom');
      } else {
        setDockPosition('free');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Atajos de Teclado Globales (V, H, F, T, P, I, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement)?.isContentEditable;

      if (isInput) return;

      if (e.key === 'Escape') {
        if (isIconsMenuOpen) {
          setIsIconsMenuOpen(false);
        } else {
          setToolMode('select');
        }
        return;
      }

      const key = e.key.toUpperCase();
      switch (key) {
        case 'V':
          e.preventDefault();
          setToolMode('select');
          break;
        case 'H':
          e.preventDefault();
          setToolMode('hand');
          break;
        case 'F':
          e.preventDefault();
          setToolMode('container');
          break;
        case 'T':
          e.preventDefault();
          setToolMode('heading');
          break;
        case 'P':
          e.preventDefault();
          setToolMode('paragraph');
          break;
        case 'I':
          e.preventDefault();
          setToolMode('image');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isIconsMenuOpen, setToolMode]);

  // Manejador al hacer clic en herramientas
  const handleToolClick = (tool: ToolMode) => {
    // Si ya está activa y es una herramienta de inserción, inserta inmediatamente en el elemento seleccionado
    if (toolMode === tool && ['container', 'heading', 'paragraph', 'image'].includes(tool)) {
      triggerDirectInsertion(tool);
      return;
    }

    setToolMode(tool);
    // Cierra el menú de iconos si estaba abierto
    if (isIconsMenuOpen) {
      setIsIconsMenuOpen(false);
    }
  };

  // Inserción directa rápida cuando se hace clic repetido
  const triggerDirectInsertion = (tool: ToolMode) => {
    let compDef: ComponentDefinition | null = null;
    if (tool === 'container') {
      compDef = {
        type: 'container',
        name: 'Container',
        category: 'Box / Container (Layout)',
        icon: 'Square',
        isContainer: true,
        defaultStyle: {
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '24px',
          width: '100%',
          borderRadius: '8px',
          backgroundColor: '#18181b',
          border: '1px solid #27272a',
        },
        defaultProps: {
          label: 'Contenedor Flexbox',
        },
      };
    } else if (tool === 'heading') {
      compDef = {
        type: 'typography',
        name: 'Heading',
        category: 'Text (Tipografía)',
        icon: 'Heading',
        isContainer: false,
        defaultStyle: {
          fontSize: '28px',
          fontWeight: '700',
          color: '#ffffff',
          lineHeight: '1.25',
          textAlign: 'left',
        },
        defaultProps: {
          as: 'h2',
          text: 'Título Principal',
        },
      };
    } else if (tool === 'paragraph') {
      compDef = {
        type: 'typography',
        name: 'Paragraph',
        category: 'Text (Tipografía)',
        icon: 'Pilcrow',
        isContainer: false,
        defaultStyle: {
          fontSize: '14px',
          fontWeight: '400',
          color: '#a1a1aa',
          lineHeight: '1.6',
          textAlign: 'left',
        },
        defaultProps: {
          as: 'p',
          text: 'Párrafo de texto descriptivo adaptable para cualquier sección.',
        },
      };
    } else if (tool === 'image') {
      compDef = {
        type: 'image',
        name: 'Image',
        category: 'Image (Multimedia)',
        icon: 'Image',
        isContainer: false,
        defaultStyle: {
          width: '100%',
          height: 'auto',
          borderRadius: '8px',
          overflow: 'hidden',
        },
        defaultProps: {
          src: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
          alt: 'Imagen ilustrativa',
          aspectRatio: '16:9',
          objectFit: 'cover',
          loading: 'lazy',
        },
      };
    }

    if (compDef) {
      onInsertComponent(compDef);
      setToolMode('select');
    }
  };

  // Inserción de icono desde el menú flotante
  const handleSelectIcon = (iconName: string, iconLabel: string) => {
    const compDef: ComponentDefinition = {
      type: 'svg_icon',
      name: `Icon (${iconLabel})`,
      category: 'Icon (Gráfico)',
      icon: 'Sparkles',
      isContainer: false,
      defaultStyle: {
        width: '28px',
        height: '28px',
        color: '#0d99ff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      defaultProps: {
        iconName: `lucide:${iconName.toLowerCase()}`,
        size: 28,
        stroke: '#0d99ff',
        fill: 'none',
      },
    };

    onInsertComponent(compDef);
    setIsIconsMenuOpen(false);
  };

  // Cálculo de clases de posicionamiento y animación
  const positionClasses = useMemo(() => {
    if (dockPosition === 'bottom') {
      return 'fixed bottom-6 left-1/2 -translate-x-1/2 z-40';
    }
    if (dockPosition === 'top') {
      return 'fixed top-14 left-1/2 -translate-x-1/2 z-40';
    }
    return 'fixed z-40';
  }, [dockPosition]);

  const inlineStyles: React.CSSProperties = useMemo(() => {
    if (dockPosition === 'free') {
      return {
        left: `${freeCoords.x}px`,
        top: `${freeCoords.y}px`,
        transform: 'none',
      };
    }
    return {};
  }, [dockPosition, freeCoords]);

  const isDockedTop = dockPosition === 'top';

  return (
    <>
      {/* Guía visual de acoplamiento superior (Smart Docking Guide) */}
      {dockGuide === 'top' && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 w-96 h-1.5 bg-[#0d99ff] rounded-full shadow-[0_0_16px_#0d99ff] pointer-events-none z-30 opacity-90 animate-pulse transition-all duration-200" />
      )}

      {/* Guía visual de acoplamiento inferior */}
      {dockGuide === 'bottom' && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-96 h-1.5 bg-[#0d99ff] rounded-full shadow-[0_0_16px_#0d99ff] pointer-events-none z-30 opacity-90 animate-pulse transition-all duration-200" />
      )}

      {/* Contenedor Principal Flotante (Glassmorphism Capsule) */}
      <div
        ref={toolboxRef}
        onMouseDown={handleMouseDown}
        style={inlineStyles}
        className={`group/toolbox select-none flex items-center bg-[#18181b]/85 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] ring-1 ring-white/5 rounded-full px-2 py-1.5 ${positionClasses} ${
          isDragging ? 'cursor-grabbing transition-none' : 'cursor-grab transition-all duration-300 ease-out'
        } ${className}`}
        title="Arrastra desde los extremos para mover por la pantalla"
      >
        {/* Agarradera de puntos izquierda (Drag Handle) */}
        <div
          className="flex items-center justify-center pl-1 pr-1.5 py-1 text-zinc-500 hover:text-zinc-200 cursor-grab active:cursor-grabbing select-none"
          title="Arrastra para mover la barra flotante"
        >
          <GripVertical className="w-4 h-4 opacity-60 hover:opacity-100 transition-opacity" />
        </div>

        {/* ======================================================== */}
        {/* BLOQUE 1: Navegación y Selección                         */}
        {/* ======================================================== */}
        <div className="flex items-center gap-1">
          {/* Puntero (Select / Pointer - ↖) */}
          <div className="relative group/btn">
            <button
              type="button"
              onClick={() => handleToolClick('select')}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 ${
                toolMode === 'select'
                  ? 'bg-[#0d99ff] text-white shadow-[0_0_14px_rgba(13,153,255,0.6)] font-semibold scale-105'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95'
              }`}
              aria-label="Seleccionar"
            >
              <MousePointer className="w-4 h-4" />
            </button>
            <div
              className={`absolute ${
                isDockedTop ? 'top-full mt-2.5' : 'bottom-full mb-2.5'
              } left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all duration-150 transform scale-95 group-hover/btn:scale-100 z-50 whitespace-nowrap bg-[#18181b]/95 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-md border border-white/10 shadow-xl flex items-center gap-1.5`}
            >
              <span>Seleccionar</span>
              <kbd className="px-1 py-0.2 rounded bg-white/15 text-zinc-300 font-mono text-[9px]">V</kbd>
            </div>
          </div>

          {/* Manito (Pan / Hand - ✋) */}
          <div className="relative group/btn">
            <button
              type="button"
              onClick={() => handleToolClick('hand')}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 ${
                toolMode === 'hand'
                  ? 'bg-[#0d99ff] text-white shadow-[0_0_14px_rgba(13,153,255,0.6)] font-semibold scale-105'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95'
              }`}
              aria-label="Mover lienzo"
            >
              <Hand className="w-4 h-4" />
            </button>
            <div
              className={`absolute ${
                isDockedTop ? 'top-full mt-2.5' : 'bottom-full mb-2.5'
              } left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all duration-150 transform scale-95 group-hover/btn:scale-100 z-50 whitespace-nowrap bg-[#18181b]/95 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-md border border-white/10 shadow-xl flex items-center gap-1.5`}
            >
              <span>Mover lienzo</span>
              <kbd className="px-1 py-0.2 rounded bg-white/15 text-zinc-300 font-mono text-[9px]">H</kbd>
            </div>
          </div>
        </div>

        {/* Divisor vertical sutil */}
        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* ======================================================== */}
        {/* BLOQUE 2: Estructura y Maquetación                       */}
        {/* ======================================================== */}
        <div className="flex items-center gap-1">
          {/* Container (Box / Frame - ◻) */}
          <div className="relative group/btn">
            <button
              type="button"
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.setData(
                  'application/json',
                  JSON.stringify({
                    sourceType: 'catalog',
                    componentType: 'container',
                    componentName: 'Container',
                  })
                );
                e.dataTransfer.setData('text/plain', 'Container');
              }}
              onClick={() => handleToolClick('container')}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer ${
                toolMode === 'container'
                  ? 'bg-[#0d99ff] text-white shadow-[0_0_14px_rgba(13,153,255,0.6)] font-semibold scale-105'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95'
              }`}
              aria-label="Insertar o arrastrar Contenedor"
            >
              <Square className="w-4 h-4" strokeWidth={1.8} />
            </button>
            <div
              className={`absolute ${
                isDockedTop ? 'top-full mt-2.5' : 'bottom-full mb-2.5'
              } left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all duration-150 transform scale-95 group-hover/btn:scale-100 z-50 whitespace-nowrap bg-[#18181b]/95 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-md border border-white/10 shadow-xl flex items-center gap-1.5`}
            >
              <span>Insertar o arrastrar Contenedor</span>
              <kbd className="px-1 py-0.2 rounded bg-white/15 text-zinc-300 font-mono text-[9px]">F</kbd>
            </div>
          </div>
        </div>

        {/* Divisor vertical sutil */}
        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* ======================================================== */}
        {/* BLOQUE 3: Tipografía                                     */}
        {/* ======================================================== */}
        <div className="flex items-center gap-1">
          {/* Texto / Heading (A) */}
          <div className="relative group/btn">
            <button
              type="button"
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.setData(
                  'application/json',
                  JSON.stringify({
                    sourceType: 'catalog',
                    componentType: 'typography',
                    componentName: 'Heading',
                  })
                );
                e.dataTransfer.setData('text/plain', 'Heading');
              }}
              onClick={() => handleToolClick('heading')}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer ${
                toolMode === 'heading'
                  ? 'bg-[#0d99ff] text-white shadow-[0_0_14px_rgba(13,153,255,0.6)] font-semibold scale-105'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95'
              }`}
              aria-label="Insertar o arrastrar Título"
            >
              <span className="font-bold text-xs tracking-tight font-sans">A</span>
            </button>
            <div
              className={`absolute ${
                isDockedTop ? 'top-full mt-2.5' : 'bottom-full mb-2.5'
              } left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all duration-150 transform scale-95 group-hover/btn:scale-100 z-50 whitespace-nowrap bg-[#18181b]/95 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-md border border-white/10 shadow-xl flex items-center gap-1.5`}
            >
              <span>Insertar o arrastrar Título</span>
              <kbd className="px-1 py-0.2 rounded bg-white/15 text-zinc-300 font-mono text-[9px]">T</kbd>
            </div>
          </div>

          {/* Párrafo / Paragraph (≡) */}
          <div className="relative group/btn">
            <button
              type="button"
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.setData(
                  'application/json',
                  JSON.stringify({
                    sourceType: 'catalog',
                    componentType: 'typography',
                    componentName: 'Paragraph',
                  })
                );
                e.dataTransfer.setData('text/plain', 'Paragraph');
              }}
              onClick={() => handleToolClick('paragraph')}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer ${
                toolMode === 'paragraph'
                  ? 'bg-[#0d99ff] text-white shadow-[0_0_14px_rgba(13,153,255,0.6)] font-semibold scale-105'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95'
              }`}
              aria-label="Insertar o arrastrar Párrafo"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <div
              className={`absolute ${
                isDockedTop ? 'top-full mt-2.5' : 'bottom-full mb-2.5'
              } left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all duration-150 transform scale-95 group-hover/btn:scale-100 z-50 whitespace-nowrap bg-[#18181b]/95 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-md border border-white/10 shadow-xl flex items-center gap-1.5`}
            >
              <span>Insertar o arrastrar Párrafo</span>
              <kbd className="px-1 py-0.2 rounded bg-white/15 text-zinc-300 font-mono text-[9px]">P</kbd>
            </div>
          </div>
        </div>

        {/* Divisor vertical sutil */}
        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* ======================================================== */}
        {/* BLOQUE 4: Gráficos y Contenido                           */}
        {/* ======================================================== */}
        <div className="flex items-center gap-1">
          {/* Icons (Icon Set - 🔔 🛒 ♥) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsIconsMenuOpen((prev) => !prev)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 ${
                isIconsMenuOpen
                  ? 'bg-violet-600 text-white shadow-[0_0_14px_rgba(147,51,234,0.6)] scale-105'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95'
              }`}
              aria-label="Colección de Iconos UI"
              title="Colección de Iconos UI"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
            </button>

            {/* Menú Flotante de Iconos (Pop-up encima/debajo del toolbox) */}
            {isIconsMenuOpen && (
              <div
                data-interactive="true"
                className={`absolute ${
                  isDockedTop ? 'top-full mt-3' : 'bottom-full mb-3'
                } left-1/2 -translate-x-1/2 w-80 bg-[#1e1e1e]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-3 shadow-2xl shadow-black/80 z-50 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150`}
              >
                {/* Cabecera del popover */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-semibold text-xs text-white">Iconos UI</span>
                    <span className="text-[10px] text-zinc-500 font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                      {filteredIcons.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsIconsMenuOpen(false)}
                    className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Buscador de iconos */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Buscar iconos..."
                    value={iconSearchQuery}
                    onChange={(e) => setIconSearchQuery(e.target.value)}
                    className="w-full bg-[#141416] border border-white/10 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#0d99ff] focus:ring-1 focus:ring-[#0d99ff] transition-all"
                    autoFocus
                  />
                  {iconSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setIconSearchQuery('')}
                      className="absolute right-2 top-2 p-0.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-700 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Grid de iconos */}
                <div className="grid grid-cols-4 gap-1.5 max-h-56 overflow-y-auto pr-0.5 scrollbar-thin">
                  {filteredIcons.length === 0 ? (
                    <div className="col-span-4 p-4 text-center text-xs text-zinc-500">
                      No se encontraron iconos
                    </div>
                  ) : (
                    filteredIcons.map((item) => {
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          draggable={true}
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = 'copy';
                            e.dataTransfer.setData(
                              'application/json',
                              JSON.stringify({
                                sourceType: 'catalog',
                                componentType: 'svg_icon',
                                componentName: 'Icon',
                                props: {
                                  iconName: `lucide:${item.name.toLowerCase()}`,
                                  label: item.label,
                                },
                              })
                            );
                            e.dataTransfer.setData('text/plain', item.name);
                          }}
                          onClick={() => handleSelectIcon(item.name, item.label)}
                          className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-[#0d99ff]/20 hover:border-[#0d99ff]/50 border border-transparent transition-all group/icon text-zinc-300 hover:text-white cursor-pointer"
                          title={`Insertar o arrastrar ${item.label}`}
                        >
                          <IconComp className="w-5 h-5 group-hover/icon:scale-110 group-hover/icon:text-[#0d99ff] transition-transform" />
                          <span className="text-[9px] font-medium truncate w-full text-center mt-1 text-zinc-400 group-hover/icon:text-zinc-200">
                            {item.label}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Image (🖼️) */}
          <div className="relative group/btn">
            <button
              type="button"
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.setData(
                  'application/json',
                  JSON.stringify({
                    sourceType: 'catalog',
                    componentType: 'image',
                    componentName: 'Image',
                  })
                );
                e.dataTransfer.setData('text/plain', 'Image');
              }}
              onClick={() => handleToolClick('image')}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer ${
                toolMode === 'image'
                  ? 'bg-[#0d99ff] text-white shadow-[0_0_14px_rgba(13,153,255,0.6)] font-semibold scale-105'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95'
              }`}
              aria-label="Insertar o arrastrar Imagen"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <div
              className={`absolute ${
                isDockedTop ? 'top-full mt-2.5' : 'bottom-full mb-2.5'
              } left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all duration-150 transform scale-95 group-hover/btn:scale-100 z-50 whitespace-nowrap bg-[#18181b]/95 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-md border border-white/10 shadow-xl flex items-center gap-1.5`}
            >
              <span>Insertar o arrastrar Imagen</span>
              <kbd className="px-1 py-0.2 rounded bg-white/15 text-zinc-300 font-mono text-[9px]">I</kbd>
            </div>
          </div>
        </div>

        {/* Agarradera de puntos derecha (Drag Handle) */}
        <div
          className="flex items-center justify-center pl-1.5 pr-1 py-1 text-zinc-500 hover:text-zinc-200 cursor-grab active:cursor-grabbing select-none"
          title="Arrastra para mover la barra flotante"
        >
          <GripVertical className="w-4 h-4 opacity-60 hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </>
  );
};
