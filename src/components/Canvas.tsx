import React, { useRef, useState, useEffect } from 'react';
import {
  CanvasNode,
  ViewportMode,
  ToolMode,
  DropPosition,
  DragState,
  ProjectType,
} from '../types';
import { NodeRenderer } from './NodeRenderer';
import { COMPONENT_CATALOG } from '../data/componentCatalog';
import { findNodeInTree } from '../utils/treeUtils';
import { Copy, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface CanvasProps {
  tree: CanvasNode[];
  projectType?: ProjectType;
  selectedId: string | null;
  onSelectNode: (id: string | null, e?: React.MouseEvent) => void;
  viewportMode: ViewportMode;
  toolMode: ToolMode;
  onInsertTool?: (tool: ToolMode, targetId?: string | null) => void;
  zoom: number;
  onZoom?: (newZoom: number | ((prev: number) => number)) => void;
  isPreviewMode: boolean;
  onDropAsset: (componentType: string, targetId: string | null, position: DropPosition, componentName?: string, extraProps?: Record<string, any>) => void;
  onReorderNode: (draggedId: string, targetId: string, position: DropPosition) => void;
  onDuplicateNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onMoveSibling: (id: string, direction: 'up' | 'down') => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  tree,
  projectType,
  selectedId,
  onSelectNode,
  viewportMode,
  toolMode,
  onInsertTool,
  zoom,
  onZoom,
  isPreviewMode,
  onDropAsset,
  onReorderNode,
  onDuplicateNode,
  onDeleteNode,
  onMoveSibling,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Active Hand Mode: true if Hand Tool is selected, Spacebar is held down, or actively panning
  const isHandActive = toolMode === 'hand' || isSpacePressed || isPanning;

  // Dynamic canvas cursor based on active tool
  const getCanvasCursor = () => {
    if (isHandActive) return isPanning ? 'cursor-grabbing' : 'cursor-grab';
    switch (toolMode) {
      case 'container':
        return 'cursor-crosshair';
      case 'heading':
      case 'paragraph':
        return 'cursor-text';
      case 'image':
        return 'cursor-copy';
      default:
        return 'cursor-default';
    }
  };

  // Listen for Spacebar press and release (Photoshop / Figma style space+drag) + Keyboard scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement)?.isContentEditable;

      // Always prevent default space scrolling (even on repeat events)
      if ((e.code === 'Space' || e.key === ' ') && !isInput) {
        e.preventDefault();
        setIsSpacePressed(true);
        return;
      }

      // PageUp / PageDown / Home keyboard scroll support
      if (!isInput) {
        if (e.key === 'PageDown') {
          e.preventDefault();
          setPan((p) => ({ ...p, y: p.y - 350 }));
        } else if (e.key === 'PageUp') {
          e.preventDefault();
          setPan((p) => ({ ...p, y: p.y + 350 }));
        } else if (e.key === 'Home') {
          e.preventDefault();
          setPan({ x: 0, y: 0 });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        setIsSpacePressed(false);
      }
    };

    const handleBlur = () => {
      setIsSpacePressed(false);
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Listen for wheel events on container to allow buttery smooth scrolling on the canvas
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelNative = (e: WheelEvent) => {
      // 1. If Ctrl or Meta is held, handle zoom
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (onZoom) {
          const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
          onZoom((prevZoom: number) => {
            const next = Math.min(Math.max(0.25, Number((prevZoom + zoomDelta).toFixed(2))), 2.5);
            return next;
          });
        }
        return;
      }

      // 2. Check if the target is an inner scrollable element with scroll remaining
      const target = e.target as HTMLElement;
      let el: HTMLElement | null = target;
      let hasScrollableParent = false;
      while (el && el !== container) {
        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
          if (el.scrollHeight > el.clientHeight) {
            hasScrollableParent = true;
            break;
          }
        }
        const overflowY = window.getComputedStyle(el).overflowY;
        if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
          if (
            (e.deltaY > 0 && el.scrollTop + el.clientHeight < el.scrollHeight) ||
            (e.deltaY < 0 && el.scrollTop > 0)
          ) {
            hasScrollableParent = true;
            break;
          }
        }
        el = el.parentElement;
      }

      if (hasScrollableParent) {
        return;
      }

      // 3. Otherwise, scroll the canvas smoothly
      e.preventDefault();

      setPan((prev) => {
        if (e.shiftKey) {
          // Shift + Wheel = Horizontal scroll
          return {
            ...prev,
            x: Math.round(prev.x - e.deltaY),
          };
        }

        // Standard Wheel = Vertical scroll (and horizontal if deltaX present from trackpad)
        return {
          x: Math.round(prev.x - (e.deltaX || 0)),
          y: Math.round(prev.y - e.deltaY),
        };
      });
    };

    container.addEventListener('wheel', handleWheelNative, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheelNative);
    };
  }, [onZoom]);

  // Ensure canvas container never has native scroll offset that fights pan.x / pan.y
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      containerRef.current.scrollLeft = 0;
    }
  }, [isHandActive, pan]);

  // Drag-and-Drop state
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [placementMousePos, setPlacementMousePos] = useState<{ x: number; y: number } | null>(null);

  // Viewport width calculation
  const getViewportWidth = () => {
    switch (viewportMode) {
      case 'tablet':
        return '768px';
      case 'mobile':
        return '375px';
      case 'desktop':
      default:
        return '100%';
    }
  };

  const getViewportTitle = () => {
    switch (viewportMode) {
      case 'tablet':
        return 'Tablet — 768 × 1024';
      case 'mobile':
        return 'Mobile — 375 × 812';
      case 'desktop':
      default:
        return 'Desktop — 1440 × 900';
    }
  };

  // Hand Tool Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isHandActive || e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (['container', 'heading', 'paragraph', 'image'].includes(toolMode)) {
      setPlacementMousePos({ x: e.clientX, y: e.clientY });
    } else if (placementMousePos) {
      setPlacementMousePos(null);
    }

    if (isPanning) {
      e.preventDefault();
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Window pan listener to ensure buttery smooth dragging with Hand Tool
  useEffect(() => {
    if (!isPanning) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    };

    const handleWindowMouseUp = () => {
      setIsPanning(false);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isPanning, panStart]);

  // HTML5 Drag and Drop Handlers
  const handleDragOverNode = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent dragging onto itself
    if (draggedNodeId === targetId) return;

    // Prevent dragging a parent into one of its descendants
    const targetNode = findNodeInTree(tree, targetId);
    if (draggedNodeId && targetNode) {
      const draggedNode = findNodeInTree(tree, draggedNodeId);
      if (draggedNode && findNodeInTree([draggedNode], targetId)) return;
    }

    const targetElement = e.currentTarget as HTMLElement;
    const rect = targetElement.getBoundingClientRect();
    const clientY = e.clientY - rect.top;
    const height = rect.height;

    let position: DropPosition = 'after';
    const isContainer = targetNode?.isContainer ?? false;

    if (isContainer) {
      // 3-zone calculation for containers: top 25% = before, center = inside, bottom 25% = after
      if (clientY < height * 0.25) {
        position = 'before';
      } else if (clientY > height * 0.75) {
        position = 'after';
      } else {
        position = 'inside';
      }
    } else {
      // 2-zone calculation for non-containers: top 50% = before, bottom 50% = after
      if (clientY < height * 0.5) {
        position = 'before';
      } else {
        position = 'after';
      }
    }

    setDropTargetId(targetId);
    setDropPosition(position);
  };

  const handleDropNode = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const currentPosition = dropPosition || 'after';
    setDropTargetId(null);
    setDropPosition(null);
    setDraggedNodeId(null);

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);

      if (data.sourceType === 'catalog') {
        onDropAsset(data.componentType, targetId, currentPosition, data.componentName, data.props);
      } else if (data.sourceType === 'canvas' && data.nodeId) {
        if (data.nodeId !== targetId) {
          onReorderNode(data.nodeId, targetId, currentPosition);
        }
      }
    } catch {
      // Fallback
    }
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropTargetId(null);
    setDropPosition(null);
    setDraggedNodeId(null);

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);

      if (data.sourceType === 'catalog') {
        onDropAsset(data.componentType, null, 'after', data.componentName, data.props);
      } else if (data.sourceType === 'canvas' && data.nodeId) {
        // Move to root level (end of root tree)
        if (tree.length > 0) {
          const lastNode = tree[tree.length - 1];
          if (lastNode.id !== data.nodeId) {
            onReorderNode(data.nodeId, lastNode.id, 'after');
          }
        }
      }
    } catch {
      // Fallback
    }
  };

  return (
    <main
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setPlacementMousePos(null)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleCanvasDrop}
      onClick={(e) => {
        if (!isHandActive) {
          if (['container', 'heading', 'paragraph', 'image'].includes(toolMode)) {
            onInsertTool?.(toolMode, null);
            return;
          }
          onSelectNode(null);
        }
      }}
      className={`flex-1 relative overflow-hidden bg-[#1e1e1e] canvas-dots flex flex-col items-center select-none ${getCanvasCursor()}`}
    >
      {/* Pan & Zoom Canvas Container */}
      <div
        className="w-full flex-1 flex flex-col items-center p-8 origin-top"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {/* Device Frame Artboard */}
        <div
          style={{ width: getViewportWidth(), maxWidth: '1440px' }}
          className="relative transition-all duration-200"
          onClick={(e) => {
            if (isHandActive) return;
            e.stopPropagation();
            if (['container', 'heading', 'paragraph', 'image'].includes(toolMode)) {
              onInsertTool?.(toolMode, null);
              return;
            }
          }}
        >
          {/* Frame Label Header (Figma Artboard Tag) */}
          <div className="flex items-center justify-between mb-2 px-1 text-[11px] text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#0d99ff]" />
              {getViewportTitle()}
            </span>
            <span className="text-zinc-600 font-mono text-[10px]">
              {tree.length} Root Elements
            </span>
          </div>

          {/* Banner indicador de modo inserción activo */}
          {['container', 'heading', 'paragraph', 'image'].includes(toolMode) && (
            <div className="mb-2 px-3 py-1.5 bg-[#0d99ff]/15 border border-[#0d99ff]/40 rounded-lg text-xs text-[#0d99ff] flex items-center justify-between shadow-lg backdrop-blur-md animate-in fade-in select-none">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0d99ff] animate-ping" />
                <span>
                  Modo <strong>{toolMode}</strong> activo: Haz clic en el lienzo o dentro de un contenedor para colocarlo.
                </span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onInsertTool?.('select');
                }}
                className="text-zinc-400 hover:text-white text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
              >
                Cancelar (Esc)
              </button>
            </div>
          )}

          {/* Canvas Artboard Body - When isHandActive is true, disable pointer events to enable panning everywhere without selecting */}
          <div
            onClick={(e) => {
              if (isHandActive) return;
              if (['container', 'heading', 'paragraph', 'image'].includes(toolMode)) {
                e.stopPropagation();
                onInsertTool?.(toolMode, null);
                return;
              }
            }}
            className={`min-h-[800px] w-full bg-[#121214] border border-[#2e2e32] rounded-xl shadow-2xl relative transition-shadow ${
              isHandActive ? 'pointer-events-none' : ''
            } ${isPreviewMode ? '' : 'hover:border-[#3e3e42]'}`}
          >
            {tree.length === 0 ? (
              <div className="h-96 flex flex-col items-center justify-center text-zinc-500 text-xs">
                <p className="font-semibold text-zinc-400 text-sm mb-1">Empty Canvas Artboard</p>
                <p>Drag any component from the Assets panel to start creating.</p>
              </div>
            ) : (
              <div className="w-full flex flex-col">
                {tree.map((node) => (
                  <NodeRenderer
                    key={node.id}
                    node={node}
                    projectType={projectType}
                    selectedId={selectedId}
                    onSelectNode={onSelectNode}
                    toolMode={isHandActive ? 'hand' : toolMode}
                    onInsertTool={onInsertTool}
                    isPreviewMode={isPreviewMode}
                    dropTargetId={dropTargetId}
                    dropPosition={dropPosition}
                    draggedNodeId={draggedNodeId}
                    onDragStartNode={setDraggedNodeId}
                    onDragEndNode={() => {
                      setDraggedNodeId(null);
                      setDropTargetId(null);
                      setDropPosition(null);
                    }}
                    onDragOverNode={handleDragOverNode}
                    onDropNode={handleDropNode}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Floating Contextual Pill for Selected Node - Positioned right above the Floating Toolbox */}
          {selectedId && !isPreviewMode && !isHandActive && (
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-[#252526] border border-[#383838] px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-2 text-xs text-zinc-200">
              <span className="text-[11px] font-mono text-[#0d99ff] border-r border-[#383838] pr-2">
                {selectedId}
              </span>
              <button
                onClick={() => onDuplicateNode(selectedId)}
                title="Duplicar (Ctrl+D)"
                className="hover:text-white p-1 hover:bg-[#323232] rounded flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Duplicar</span>
              </button>
              <button
                onClick={() => onMoveSibling(selectedId, 'up')}
                title="Mover arriba (Alt+↑)"
                className="hover:text-white p-1 hover:bg-[#323232] rounded flex items-center gap-1"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Subir</span>
              </button>
              <button
                onClick={() => onMoveSibling(selectedId, 'down')}
                title="Mover abajo (Alt+↓)"
                className="hover:text-white p-1 hover:bg-[#323232] rounded flex items-center gap-1"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Bajar</span>
              </button>
              <button
                onClick={() => onDeleteNode(selectedId)}
                title="Eliminar (Supr / Delete)"
                className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/20 rounded flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Eliminar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Center / Reset Pan Button - Visible when scrolled or panned */}
      {(pan.x !== 0 || pan.y !== 0) && (
        <button
          onClick={() => setPan({ x: 0, y: 0 })}
          className="absolute bottom-4 right-4 z-20 px-2.5 py-1 rounded-full bg-[#252526]/90 hover:bg-[#323232] border border-[#383838] text-[11px] text-zinc-300 shadow-lg flex items-center gap-1.5 transition-all backdrop-blur-xs hover:text-white"
          title="Restablecer posición del lienzo (0, 0)"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#0d99ff]" />
          <span>Centrar lienzo</span>
          <span className="text-[10px] text-zinc-500 font-mono">
            {pan.y !== 0 ? `${-pan.y > 0 ? `+${-pan.y}` : -pan.y}px` : ''}
          </span>
        </button>
      )}

      {/* Floating Cursor Guide in Placement Mode */}
      {placementMousePos && ['container', 'heading', 'paragraph', 'image'].includes(toolMode) && (
        <div
          style={{
            left: `${placementMousePos.x + 16}px`,
            top: `${placementMousePos.y + 16}px`,
          }}
          className="fixed pointer-events-none z-50 px-2.5 py-1 rounded-full bg-[#0d99ff] text-white text-[11px] font-medium shadow-2xl flex items-center gap-1.5 backdrop-blur-md animate-in fade-in duration-100 whitespace-nowrap select-none"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>
            {toolMode === 'container' && '➕ Clic para colocar Contenedor'}
            {toolMode === 'heading' && '➕ Clic para colocar Título'}
            {toolMode === 'paragraph' && '➕ Clic para colocar Párrafo'}
            {toolMode === 'image' && '➕ Clic para colocar Imagen'}
          </span>
          <kbd className="bg-black/30 text-white/80 text-[9px] px-1 py-0.2 rounded font-mono ml-0.5">Esc</kbd>
        </div>
      )}
    </main>
  );
};
