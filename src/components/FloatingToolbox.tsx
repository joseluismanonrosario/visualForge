import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MousePointer2,
  Hand,
  Check,
  X,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Search,
  Bell,
  ShoppingCart,
  Ticket,
  Layers,
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
  Sparkles,
  Folder,
  Calendar,
  Clock,
  Lock,
  Tag,
  HelpCircle,
  Image as LucideImage,
} from 'lucide-react';
import { ToolMode, ComponentDefinition } from '../types';

export interface FloatingToolboxProps {
  toolMode: ToolMode;
  setToolMode: (tool: ToolMode) => void;
  onInsertComponent: (compDef: ComponentDefinition) => void;
  selectedId: string | null;
  onDuplicateNode?: (id: string) => void;
  onDeleteNode?: (id: string) => void;
  onMoveSibling?: (id: string, direction: 'up' | 'down') => void;
  onClearCanvas?: () => void;
  className?: string;
}

// Icono personalizado para Contenedor / Frame (Cuadrado con 4 puntos de anclaje en las esquinas)
const FrameIcon: React.FC<{ className?: string }> = ({ className = 'w-4.5 h-4.5' }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
  >
    <rect x="3.5" y="3.5" width="13" height="13" strokeWidth="1.6" />
    <circle cx="3.5" cy="3.5" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="16.5" cy="3.5" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="3.5" cy="16.5" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="16.5" cy="16.5" r="1.6" fill="currentColor" stroke="none" />
  </svg>
);

// Icono personalizado de Párrafo / Texto (Líneas horizontales y 'T' lateral integrado estilo Figma)
const ParagraphIcon: React.FC<{ className?: string }> = ({ className = 'w-4.5 h-4.5' }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
  >
    <line x1="2.5" y1="4.5" x2="17.5" y2="4.5" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="2.5" y1="8.5" x2="11.5" y2="8.5" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="2.5" y1="12.5" x2="11.5" y2="12.5" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="2.5" y1="16.5" x2="11.5" y2="16.5" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="15.5" y1="4.5" x2="15.5" y2="16.5" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// Icono personalizado para Imagen (Marco redondeado con sol a la derecha y montañas)
const PhotoImageIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2.5" y="2.5" width="19" height="19" rx="4" ry="4" strokeWidth="1.8" />
    <circle cx="16.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    <path d="M21 16.5l-5.2-5.2a1.4 1.4 0 0 0-2 0L4 21" />
    <path d="M4 17l3.8-3.8a1.4 1.4 0 0 1 2 0l3.2 3.2" />
  </svg>
);

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
  onDuplicateNode,
  onDeleteNode,
  onMoveSibling,
  onClearCanvas,
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

  // Toast flotante informativo de colocación cómoda
  const [placementToast, setPlacementToast] = useState<string | null>(null);

  const showPlacementToast = (msg: string) => {
    setPlacementToast(msg);
    setTimeout(() => {
      setPlacementToast((prev) => (prev === msg ? null : prev));
    }, 2200);
  };

  // Iconos filtrados para la ventana flotante
  const filteredIcons = useMemo(() => {
    const q = iconSearchQuery.trim().toLowerCase();
    if (!q) return POPULAR_ICONS;
    return POPULAR_ICONS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) || item.label.toLowerCase().includes(q)
    );
  }, [iconSearchQuery]);

  // Manejo de Arrastre del Toolbox (al hacer clic en las áreas vacías o de fondo del contenedor)
  const handleMouseDown = (e: React.MouseEvent) => {
    // Si se hizo clic en un botón interactivo o dentro del popover, no iniciar arrastre de la barra
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

      const barWidth = toolboxRef.current?.offsetWidth || 360;
      const barHeight = toolboxRef.current?.offsetHeight || 48;

      // Mantener dentro del viewport
      const clampedX = Math.max(12, Math.min(window.innerWidth - barWidth - 12, newX));
      const clampedY = Math.max(50, Math.min(window.innerHeight - barHeight - 12, newY));

      setFreeCoords({ x: clampedX, y: clampedY });

      // Detección de zona de acoplamiento inteligente
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

  // Manejador al hacer clic en herramientas (1 clic directo para colocar en selección o lienzo)
  const handleToolClick = (tool: ToolMode) => {
    if (tool === 'select' || tool === 'hand') {
      setToolMode(tool);
      if (isIconsMenuOpen) {
        setIsIconsMenuOpen(false);
      }
      return;
    }

    // Inserción directa cómoda e instantánea al hacer clic en la herramienta
    triggerDirectInsertion(tool);
    if (isIconsMenuOpen) {
      setIsIconsMenuOpen(false);
    }
  };

  // Inserción directa rápida
  const triggerDirectInsertion = (tool: ToolMode) => {
    let compDef: ComponentDefinition | null = null;
    let label = '';
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
          label: 'Contenedor',
          containerType: 'container',
          action: '#',
          method: 'POST',
        },
        defaultChildren: [],
      };
      label = 'Contenedor';
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
      label = 'Título';
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
      label = 'Párrafo';
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
      label = 'Imagen';
    }

    if (compDef) {
      onInsertComponent(compDef);
      setToolMode('select');
      showPlacementToast(`✓ ${label} colocado en el lienzo`);
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
    showPlacementToast(`✓ Icono (${iconLabel}) colocado`);
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
        <div className="fixed top-12 left-1/2 -translate-x-1/2 w-80 h-1.5 bg-[#0d99ff] rounded-full shadow-[0_0_16px_#0d99ff] pointer-events-none z-30 opacity-90 animate-pulse transition-all duration-200" />
      )}

      {/* Guía visual de acoplamiento inferior */}
      {dockGuide === 'bottom' && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-80 h-1.5 bg-[#0d99ff] rounded-full shadow-[0_0_16px_#0d99ff] pointer-events-none z-30 opacity-90 animate-pulse transition-all duration-200" />
      )}

      {/* Contenedor Principal Flotante (Wrapper para Barra Contextual Superior + Toolbox de abajo) */}
      <div
        ref={toolboxRef}
        onMouseDown={handleMouseDown}
        style={inlineStyles}
        className={`group/toolbox select-none flex ${
          isDockedTop ? 'flex-col-reverse' : 'flex-col'
        } items-center gap-2 ${positionClasses} ${
          isDragging ? 'cursor-grabbing transition-none' : 'cursor-grab transition-all duration-300 ease-out'
        } ${className}`}
      >
        {/* Toast flotante informativo de colocación cómoda */}
        {placementToast && (
          <div className="px-3 py-1 rounded-full bg-[#0d99ff] text-white text-[11px] font-medium shadow-xl backdrop-blur-md flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150 pointer-events-none whitespace-nowrap z-50">
            <Check className="w-3.5 h-3.5" />
            <span>{placementToast}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* TOOLBOX DE ARRIBA: Barra Contextual para Elemento        */}
        {/* (Aparece únicamente cuando se selecciona un elemento o lienzo) */}
        {/* ======================================================== */}
        {selectedId && (
          <div
            data-interactive="true"
            className="select-none inline-flex items-center gap-2 bg-[#17181a]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_12px_30px_rgba(0,0,0,0.6)] rounded-full px-3.5 py-1 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            <span className="text-[12px] font-mono text-[#00a3ff] select-none tracking-tight font-medium">
              {selectedId === 'canvas' ? 'Lienzo' : selectedId}
            </span>
            <div className="w-px h-3.5 bg-white/15 mx-0.5" />
            <div className="flex items-center gap-1">
              {selectedId !== 'canvas' && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateNode?.(selectedId);
                    }}
                    title="Duplicar (Ctrl+D)"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSibling?.(selectedId, 'up');
                    }}
                    title="Mover arriba (Alt+↑)"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSibling?.(selectedId, 'down');
                    }}
                    title="Mover abajo (Alt+↓)"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedId === 'canvas') {
                    if (onClearCanvas) {
                      onClearCanvas();
                    } else {
                      onDeleteNode?.(selectedId);
                    }
                  } else {
                    onDeleteNode?.(selectedId);
                  }
                }}
                title={selectedId === 'canvas' ? "Borrar todos los elementos del lienzo (Supr / Delete)" : "Eliminar (Supr / Delete)"}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/15 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TOOLBOX DE ABAJO: Cápsula Principal Segmentada           */}
        {/* ======================================================== */}
        <div
          title="Arrastra para mover la barra por la pantalla"
          className="inline-flex items-center gap-1.5 bg-[#17181a]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.7)] rounded-2xl p-1.5"
        >

        {/* ======================================================== */}
        {/* ISLA 1: Puntero de Selección (Active Select / Pointer)   */}
        {/* ======================================================== */}
        <div className="relative group/btn">
          <button
            type="button"
            onClick={() => handleToolClick('select')}
            className={`w-11 h-[38px] rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer ${
              toolMode === 'select'
                ? 'bg-[#0d99ff] text-white shadow-[0_0_14px_rgba(13,153,255,0.5)] font-semibold'
                : 'bg-[#25272a] text-zinc-300 hover:text-white hover:bg-[#2e3135] active:scale-95'
            }`}
            aria-label="Seleccionar (V)"
          >
            <MousePointer2 className="w-5 h-5 -rotate-2" strokeWidth={1.9} />
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

        {/* ======================================================== */}
        {/* ISLA 2: Cápsula de Navegación y Creación                 */}
        {/* (Hand, Frame/Container, Heading 'A', Paragraph)          */}
        {/* ======================================================== */}
        <div className="flex items-center gap-1 bg-[#25272a] rounded-xl px-1.5 h-[38px] border border-white/[0.04]">
          {/* Manito (Pan / Hand - ✋) */}
          <div className="relative group/btn">
            <button
              type="button"
              onClick={() => handleToolClick('hand')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer ${
                toolMode === 'hand'
                  ? 'bg-[#0d99ff] text-white shadow-[0_0_10px_rgba(13,153,255,0.4)] font-semibold'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95'
              }`}
              aria-label="Mover lienzo (H)"
            >
              <Hand className="w-4.5 h-4.5" strokeWidth={1.75} />
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

          {/* Container / Frame (Recuadro con 4 puntos de anclaje) */}
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
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer ${
                toolMode === 'container'
                  ? 'bg-[#0d99ff] text-white shadow-[0_0_10px_rgba(13,153,255,0.4)] font-semibold'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95'
              }`}
              aria-label="Insertar o arrastrar Contenedor (F)"
            >
              <FrameIcon className="w-4.5 h-4.5" />
            </button>
            <div
              className={`absolute ${
                isDockedTop ? 'top-full mt-2.5' : 'bottom-full mb-2.5'
              } left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all duration-150 transform scale-95 group-hover/btn:scale-100 z-50 whitespace-nowrap bg-[#18181b]/95 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-md border border-white/10 shadow-xl flex items-center gap-1.5`}
            >
              <span>Contenedor (Clic para colocar o arrastra)</span>
              <kbd className="px-1 py-0.2 rounded bg-white/15 text-zinc-300 font-mono text-[9px]">F</kbd>
            </div>
          </div>

          {/* Texto / Título (A) */}
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
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer ${
                toolMode === 'heading'
                  ? 'bg-[#0d99ff] text-white shadow-[0_0_10px_rgba(13,153,255,0.4)] font-semibold'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95'
              }`}
              aria-label="Insertar o arrastrar Título (T)"
            >
              <span className="font-sans font-normal text-base leading-none select-none">A</span>
            </button>
            <div
              className={`absolute ${
                isDockedTop ? 'top-full mt-2.5' : 'bottom-full mb-2.5'
              } left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all duration-150 transform scale-95 group-hover/btn:scale-100 z-50 whitespace-nowrap bg-[#18181b]/95 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-md border border-white/10 shadow-xl flex items-center gap-1.5`}
            >
              <span>Título (Clic para colocar o arrastra)</span>
              <kbd className="px-1 py-0.2 rounded bg-white/15 text-zinc-300 font-mono text-[9px]">T</kbd>
            </div>
          </div>

          {/* Párrafo / Bloque de texto (Líneas con T) */}
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
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer ${
                toolMode === 'paragraph'
                  ? 'bg-[#0d99ff] text-white shadow-[0_0_10px_rgba(13,153,255,0.4)] font-semibold'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95'
              }`}
              aria-label="Insertar o arrastrar Párrafo (P)"
            >
              <ParagraphIcon className="w-4.5 h-4.5" />
            </button>
            <div
              className={`absolute ${
                isDockedTop ? 'top-full mt-2.5' : 'bottom-full mb-2.5'
              } left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all duration-150 transform scale-95 group-hover/btn:scale-100 z-50 whitespace-nowrap bg-[#18181b]/95 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-md border border-white/10 shadow-xl flex items-center gap-1.5`}
            >
              <span>Párrafo (Clic para colocar o arrastra)</span>
              <kbd className="px-1 py-0.2 rounded bg-white/15 text-zinc-300 font-mono text-[9px]">P</kbd>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* ISLA 3: Mosaico Cluster de Iconos UI                     */}
        {/* (Bell, Cart, Ticket, Layers, Pill, Heart, Image)        */}
        {/* ======================================================== */}
        <div className="relative group/btn">
          <button
            type="button"
            onClick={() => setIsIconsMenuOpen((prev) => !prev)}
            className={`h-[38px] px-2.5 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer border border-white/[0.04] ${
              isIconsMenuOpen
                ? 'bg-[#2f3236] text-white ring-1 ring-[#0d99ff] shadow-[0_0_12px_rgba(13,153,255,0.3)]'
                : 'bg-[#25272a] text-zinc-300 hover:text-white hover:bg-[#2e3135] active:scale-95'
            }`}
            aria-label="Colección de Iconos UI"
          >
            {/* Mosaico exacto de 2 filas de mini iconos */}
            <div className="flex flex-col gap-0.5 justify-center items-center py-0.5 pointer-events-none select-none">
              <div className="flex items-center gap-1.5">
                <Bell className="w-2.5 h-2.5 stroke-[1.8]" />
                <ShoppingCart className="w-2.5 h-2.5 stroke-[1.8]" />
                <Ticket className="w-2.5 h-2.5 stroke-[1.8]" />
                <Layers className="w-2.5 h-2.5 stroke-[1.8]" />
              </div>
              <div className="flex items-center gap-1.5 pl-3">
                <span className="w-2.5 h-1.5 rounded-full border border-current inline-block opacity-80" />
                <Heart className="w-2.5 h-2.5 stroke-[1.8]" />
                <LucideImage className="w-2.5 h-2.5 stroke-[1.8]" />
              </div>
            </div>
          </button>
          <div
            className={`absolute ${
              isDockedTop ? 'top-full mt-2.5' : 'bottom-full mb-2.5'
            } left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all duration-150 transform scale-95 group-hover/btn:scale-100 z-50 whitespace-nowrap bg-[#18181b]/95 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-md border border-white/10 shadow-xl flex items-center gap-1.5`}
          >
            <span>Iconos UI y Gráficos</span>
          </div>

          {/* Menú Popover Flotante de Iconos */}
          {isIconsMenuOpen && (
            <div
              data-interactive="true"
              className={`absolute ${
                isDockedTop ? 'top-full mt-3' : 'bottom-full mb-3'
              } left-1/2 -translate-x-1/2 w-80 bg-[#1e1e20]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-3 shadow-2xl shadow-black/80 z-50 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150`}
            >
              {/* Cabecera del popover */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0d99ff]" />
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

        {/* ======================================================== */}
        {/* ISLA 4: Herramienta de Imagen (Multimedia)               */}
        {/* ======================================================== */}
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
            className={`w-11 h-[38px] rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer border border-white/[0.04] ${
              toolMode === 'image'
                ? 'bg-[#0d99ff] text-white shadow-[0_0_14px_rgba(13,153,255,0.5)] font-semibold'
                : 'bg-[#25272a] text-zinc-300 hover:text-white hover:bg-[#2e3135] active:scale-95'
            }`}
            aria-label="Insertar o arrastrar Imagen (I)"
          >
            <PhotoImageIcon className="w-5 h-5" />
          </button>
          <div
            className={`absolute ${
              isDockedTop ? 'top-full mt-2.5' : 'bottom-full mb-2.5'
            } left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all duration-150 transform scale-95 group-hover/btn:scale-100 z-50 whitespace-nowrap bg-[#18181b]/95 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-md border border-white/10 shadow-xl flex items-center gap-1.5`}
          >
            <span>Imagen (Clic para colocar o arrastra)</span>
            <kbd className="px-1 py-0.2 rounded bg-white/15 text-zinc-300 font-mono text-[9px]">I</kbd>
          </div>
        </div>
      </div>
    </div>
  </>
);
};
