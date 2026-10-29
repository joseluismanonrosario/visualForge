import React, { useState } from 'react';
import {
  Layers,
  Component,
  Search,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  ChevronRight,
  ChevronDown,
  Box,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Square,
  Sparkles,
  X,
  Cpu,
  ArrowUp,
  ArrowDown,
  GripVertical,
} from 'lucide-react';
import { CanvasNode, ProjectType, ComponentDefinition, DropPosition } from '../types';
import { getCatalogForProject } from '../data/componentCatalog';
import { Activity, Power, LineChart as LineChartIcon, Zap } from 'lucide-react';
import { findNodeInTree } from '../utils/treeUtils';

interface LeftSidebarProps {
  tree: CanvasNode[];
  projectType?: ProjectType;
  selectedId: string | null;
  onSelectNode: (id: string | null) => void;
  onDeleteNode: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onInsertComponent: (compDef: ComponentDefinition) => void;
  onReorderNode: (draggedId: string, targetId: string, position: DropPosition) => void;
  onMoveSibling?: (id: string, direction: 'up' | 'down') => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  tree,
  projectType = 'react',
  selectedId,
  onSelectNode,
  onDeleteNode,
  onToggleVisibility,
  onToggleLock,
  onInsertComponent,
  onReorderNode,
  onMoveSibling,
  isOpen,
  setIsOpen,
}) => {
  const [activeTab, setActiveTab] = useState<'layers' | 'assets'>('layers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    hero_container: true,
    navbar_root: true,
    features_grid: true,
  });

  // Drag and drop state for layers
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
  const [dropTargetLayerId, setDropTargetLayerId] = useState<string | null>(null);
  const [layerDropPosition, setLayerDropPosition] = useState<DropPosition | null>(null);

  const handleLayerDragStart = (e: React.DragEvent, node: CanvasNode) => {
    if (node.locked) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    setDraggedLayerId(node.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        sourceType: 'canvas',
        nodeId: node.id,
      })
    );
    e.dataTransfer.setData('text/plain', node.id);
  };

  const handleLayerDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedLayerId(null);
    setDropTargetLayerId(null);
    setLayerDropPosition(null);
  };

  const handleLayerDragOver = (e: React.DragEvent, targetNode: CanvasNode) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedLayerId === targetNode.id) return;

    if (draggedLayerId) {
      const draggedNode = findNodeInTree(tree, draggedLayerId);
      if (draggedNode && findNodeInTree([draggedNode], targetNode.id)) return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clientY = e.clientY - rect.top;
    const height = rect.height;

    let position: DropPosition = 'after';
    if (targetNode.isContainer) {
      if (clientY < height * 0.25) {
        position = 'before';
      } else if (clientY > height * 0.75) {
        position = 'after';
      } else {
        position = 'inside';
      }
    } else {
      if (clientY < height * 0.5) {
        position = 'before';
      } else {
        position = 'after';
      }
    }

    setDropTargetLayerId(targetNode.id);
    setLayerDropPosition(position);
  };

  const handleLayerDrop = (e: React.DragEvent, targetNode: CanvasNode) => {
    e.preventDefault();
    e.stopPropagation();

    const currentPosition = layerDropPosition || 'after';
    setDropTargetLayerId(null);
    setLayerDropPosition(null);
    setDraggedLayerId(null);

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);

      if (data.nodeId && data.nodeId !== targetNode.id) {
        onReorderNode(data.nodeId, targetNode.id, currentPosition);
      }
    } catch {
      // Fallback
    }
  };

  const handleLayersContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropTargetLayerId(null);
    setLayerDropPosition(null);
    setDraggedLayerId(null);

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);

      if (data.nodeId && tree.length > 0) {
        const lastRoot = tree[tree.length - 1];
        if (lastRoot.id !== data.nodeId) {
          onReorderNode(data.nodeId, lastRoot.id, 'after');
        }
      }
    } catch {
      // Fallback
    }
  };

  const isFramework = projectType === 'react' || projectType === 'framework';
  const activeCatalog = getCatalogForProject(projectType);
  const catalogCategories = ['All', ...Array.from(new Set(activeCatalog.map((c) => c.category)))];

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter components in Assets tab
  const filteredCatalog = activeCatalog.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category for display
  const displayCategories = Array.from(new Set(filteredCatalog.map((c) => c.category)));

  // Render recursive layer item
  const renderLayerItem = (node: CanvasNode, depth = 0) => {
    const isSelected = selectedId === node.id;
    const isExpanded = expandedNodes[node.id] !== false;
    const hasChildren = node.children && node.children.length > 0;
    const isDragging = draggedLayerId === node.id;
    const isTarget = dropTargetLayerId === node.id && draggedLayerId !== node.id;

    return (
      <div key={node.id} className="text-xs relative">
        {/* Drop Indicators */}
        {isTarget && layerDropPosition === 'before' && (
          <div className="absolute -top-1 left-2 right-2 h-1 bg-[#d946ef] z-30 rounded-full shadow-[0_0_8px_#d946ef] pointer-events-none" />
        )}
        {isTarget && layerDropPosition === 'after' && (
          <div className="absolute -bottom-1 left-2 right-2 h-1 bg-[#d946ef] z-30 rounded-full shadow-[0_0_8px_#d946ef] pointer-events-none" />
        )}

        <div
          draggable={!node.locked}
          onDragStart={(e) => handleLayerDragStart(e, node)}
          onDragEnd={handleLayerDragEnd}
          onDragOver={(e) => handleLayerDragOver(e, node)}
          onDrop={(e) => handleLayerDrop(e, node)}
          onClick={() => onSelectNode(node.id)}
          className={`group flex items-center justify-between px-2 py-1.5 cursor-grab active:cursor-grabbing rounded transition-all select-none relative ${
            isDragging ? 'opacity-30 bg-[#2c2c2c]' : ''
          } ${
            isTarget && layerDropPosition === 'inside'
              ? 'ring-2 ring-violet-500 bg-violet-500/20 text-white'
              : isSelected
              ? 'bg-[#0d99ff] text-white font-medium'
              : 'text-zinc-300 hover:bg-[#323232]'
          } ${node.hidden ? 'opacity-40' : ''}`}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
        >
          <div className="flex items-center gap-1.5 truncate">
            <GripVertical className="w-3 h-3 text-zinc-500 opacity-0 group-hover:opacity-100 flex-shrink-0 cursor-grab" />
            {hasChildren ? (
              <button
                onClick={(e) => toggleExpand(node.id, e)}
                className="p-0.5 hover:bg-black/20 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-zinc-400 group-hover:text-white" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-zinc-400 group-hover:text-white" />
                )}
              </button>
            ) : (
              <span className="w-4 inline-block text-center text-zinc-500">
                •
              </span>
            )}

            <Box className="w-3.5 h-3.5 flex-shrink-0 opacity-80" />
            <span className="truncate">{node.name || node.type}</span>
          </div>

          {/* Quick Actions on Hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onMoveSibling && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveSibling(node.id, 'up');
                  }}
                  title="Subir capa (Alt+↑)"
                  className="p-0.5 hover:bg-black/30 rounded text-zinc-400 hover:text-white"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveSibling(node.id, 'down');
                  }}
                  title="Bajar capa (Alt+↓)"
                  className="p-0.5 hover:bg-black/30 rounded text-zinc-400 hover:text-white"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(node.id);
              }}
              title={node.hidden ? 'Show element' : 'Hide element'}
              className="p-0.5 hover:bg-black/30 rounded"
            >
              {node.hidden ? (
                <EyeOff className="w-3 h-3 text-zinc-400" />
              ) : (
                <Eye className="w-3 h-3 text-zinc-300" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLock(node.id);
              }}
              title={node.locked ? 'Unlock element' : 'Lock element'}
              className="p-0.5 hover:bg-black/30 rounded"
            >
              {node.locked ? (
                <Lock className="w-3 h-3 text-amber-400" />
              ) : (
                <Unlock className="w-3 h-3 text-zinc-400" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNode(node.id);
              }}
              title="Delete element"
              className="p-0.5 hover:bg-red-500/30 rounded text-red-400"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Nested Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child) => renderLayerItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-0 top-14 z-20 bg-[#2c2c2c] hover:bg-[#383838] border border-l-0 border-[#383838] p-1.5 rounded-r-lg text-zinc-300 shadow-md flex items-center gap-1 text-[11px] font-medium"
        title="Open Layers & Assets (Ctrl+\)"
      >
        <PanelLeftOpen className="w-4 h-4 text-[#0d99ff]" />
        <span className="vertical-text py-1">Layers</span>
      </button>
    );
  }

  return (
    <aside className="w-72 bg-[#252526] border-r border-[#383838] flex flex-col h-[calc(100vh-44px)] select-none z-20 flex-shrink-0 text-xs text-zinc-300">
      {/* Sidebar Header Tabs */}
      <div className="h-10 border-b border-[#383838] flex items-center justify-between px-2 bg-[#2c2c2c]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('layers')}
            className={`px-3 py-1 rounded font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'layers'
                ? 'bg-[#1e1e1e] text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#0d99ff]" />
            <span>Layers</span>
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`px-3 py-1 rounded font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'assets'
                ? 'bg-[#1e1e1e] text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Component className="w-3.5 h-3.5 text-violet-400" />
            <span>Assets</span>
          </button>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-[#383838] rounded text-zinc-400 hover:text-white"
          title="Collapse Panel (Ctrl+\)"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'layers' ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleLayersContainerDrop}
          className="flex-1 overflow-y-auto p-2 space-y-1"
        >
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
            <span>Canvas Artboard</span>
            <span className="text-[10px] text-zinc-600">{tree.length} items</span>
          </div>
          {tree.length === 0 ? (
            <div className="p-4 text-center text-zinc-500 text-xs">
              No elements yet. Drag an asset from the Assets tab to start building!
            </div>
          ) : (
            tree.map((node) => renderLayerItem(node, 0))
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search & Library Filters */}
          <div className="p-2 border-b border-[#383838] space-y-2 bg-[#282829]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#383838] rounded-md pl-8 pr-7 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#0d99ff]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 p-0.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-700 transition-colors"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Catalog Info & Category Dropdown */}
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                  isFramework
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {isFramework ? (
                  <>
                    <Sparkles className="w-3 h-3 text-violet-400" />
                    <span>Catálogo: Shadcn/ui</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-3 h-3 text-emerald-400" />
                    <span>Catálogo: Preline UI</span>
                  </>
                )}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {filteredCatalog.length} items
              </span>
            </div>

            {/* Category Filter Selector */}
            <div className="pt-0.5">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-[#0d99ff]"
              >
                {catalogCategories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#1e1e1e]">
                    {cat === 'All' ? 'Todas las Categorías' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Categorized Assets List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {displayCategories.map((category) => {
              const items = filteredCatalog.filter((c) => c.category === category);
              if (items.length === 0) return null;

              return (
                <div key={category} className="space-y-1.5">
                  <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-1">
                    {category}
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {items.map((item) => (
                      <div
                        key={`${item.catalog || 'c'}_${item.type}_${item.name}`}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            'application/json',
                            JSON.stringify({
                              sourceType: 'catalog',
                              componentType: item.type,
                              componentName: item.name,
                              catalog: item.catalog,
                            })
                          );
                        }}
                        onClick={() => onInsertComponent(item)}
                        className="group bg-[#1e1e1e] hover:bg-[#323232] border border-[#383838] hover:border-[#0d99ff] rounded-lg p-2 flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all hover:shadow-sm"
                        title="Arrastra al lienzo o haz clic para insertar"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] font-mono px-1 py-0.5 rounded ${
                              [
                                'Text (Tipografía)',
                                'Button / Link (Acción)',
                                'Icon (Gráfico)',
                                'Image (Multimedia)',
                                'Form Controls (Entradas de datos)',
                                'Box / Container (Layout)',
                              ].includes(item.category)
                                ? 'bg-blue-950/60 text-blue-300 border border-blue-500/20'
                                : item.category === 'IoT & Telemetría (ESP32)'
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-500/20'
                                : isFramework
                                ? 'bg-violet-950/60 text-violet-300 border border-violet-500/20'
                                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/20'
                            }`}
                          >
                            {[
                              'Text (Tipografía)',
                              'Button / Link (Acción)',
                              'Icon (Gráfico)',
                              'Image (Multimedia)',
                              'Form Controls (Entradas de datos)',
                              'Box / Container (Layout)',
                            ].includes(item.category)
                              ? 'Básico'
                              : item.category === 'IoT & Telemetría (ESP32)'
                              ? 'ESP32'
                              : isFramework
                              ? 'Shadcn'
                              : 'Preline'}
                          </span>
                          <Plus className="w-3 h-3 text-zinc-500 group-hover:text-[#0d99ff]" />
                        </div>
                        <div className="mt-2 text-zinc-200 font-medium text-xs truncate">
                          {item.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};
