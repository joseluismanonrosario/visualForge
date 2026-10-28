import React, { useRef, useState } from 'react';
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
  zoom: number;
  isPreviewMode: boolean;
  onDropAsset: (componentType: string, targetId: string | null, position: DropPosition) => void;
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
  zoom,
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

  // Drag-and-Drop state
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

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
    if (toolMode === 'hand' || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

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
        onDropAsset(data.componentType, targetId, currentPosition);
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
        onDropAsset(data.componentType, null, 'after');
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
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleCanvasDrop}
      onClick={() => onSelectNode(null)}
      className={`flex-1 relative overflow-auto bg-[#1e1e1e] canvas-dots flex flex-col items-center select-none ${
        toolMode === 'hand' ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
      }`}
    >
      {/* Pan & Zoom Canvas Container */}
      <div
        className="w-full flex-1 flex flex-col items-center p-8 transition-transform duration-75 origin-top"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {/* Device Frame Artboard */}
        <div
          style={{ width: getViewportWidth(), maxWidth: '1440px' }}
          className="relative transition-all duration-200"
          onClick={(e) => e.stopPropagation()}
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

          {/* Canvas Artboard Body */}
          <div
            className={`min-h-[800px] w-full bg-[#121214] border border-[#2e2e32] rounded-xl shadow-2xl relative transition-shadow ${
              isPreviewMode ? '' : 'hover:border-[#3e3e42]'
            }`}
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

          {/* Floating Contextual Pill for Selected Node */}
          {selectedId && !isPreviewMode && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#252526] border border-[#383838] px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-2 text-xs text-zinc-200">
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
    </main>
  );
};
