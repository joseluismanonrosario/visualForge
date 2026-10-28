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
} from 'lucide-react';
import { CanvasNode, ComponentLibrary, ComponentDefinition } from '../types';
import { COMPONENT_CATALOG } from '../data/componentCatalog';

interface LeftSidebarProps {
  tree: CanvasNode[];
  selectedId: string | null;
  onSelectNode: (id: string | null) => void;
  onDeleteNode: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onInsertComponent: (compDef: ComponentDefinition) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  tree,
  selectedId,
  onSelectNode,
  onDeleteNode,
  onToggleVisibility,
  onToggleLock,
  onInsertComponent,
  isOpen,
  setIsOpen,
}) => {
  const [activeTab, setActiveTab] = useState<'layers' | 'assets'>('layers');
  const [searchQuery, setSearchQuery] = useState('');
  const [libraryFilter, setLibraryFilter] = useState<'all' | ComponentLibrary>('all');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    hero_container: true,
    navbar_root: true,
    features_grid: true,
  });

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter components in Assets tab
  const filteredCatalog = COMPONENT_CATALOG.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLib =
      libraryFilter === 'all' ||
      item.library === 'both' ||
      item.library === libraryFilter;
    return matchesSearch && matchesLib;
  });

  // Group by category
  const categories = Array.from(new Set(filteredCatalog.map((c) => c.category)));

  // Render recursive layer item
  const renderLayerItem = (node: CanvasNode, depth = 0) => {
    const isSelected = selectedId === node.id;
    const isExpanded = expandedNodes[node.id] !== false;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="text-xs">
        <div
          onClick={() => onSelectNode(node.id)}
          className={`group flex items-center justify-between px-2 py-1.5 cursor-pointer rounded transition-colors ${
            isSelected
              ? 'bg-[#0d99ff] text-white font-medium'
              : 'text-zinc-300 hover:bg-[#323232]'
          } ${node.hidden ? 'opacity-40' : ''}`}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
        >
          <div className="flex items-center gap-1.5 truncate">
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
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
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
                className="w-full bg-[#1e1e1e] border border-[#383838] rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#0d99ff]"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1">
              {(['all', 'shadcn', 'bootstrap'] as const).map((lib) => (
                <button
                  key={lib}
                  onClick={() => setLibraryFilter(lib)}
                  className={`flex-1 py-1 text-[11px] rounded capitalize transition-colors font-medium ${
                    libraryFilter === lib
                      ? 'bg-[#0d99ff] text-white'
                      : 'bg-[#1e1e1e] text-zinc-400 hover:text-zinc-200 border border-[#383838]'
                  }`}
                >
                  {lib === 'all' ? 'All' : lib === 'shadcn' ? 'shadcn/ui' : 'Bootstrap'}
                </button>
              ))}
            </div>
          </div>

          {/* Categorized Assets List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {categories.map((category) => {
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
                        key={item.type}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            'application/json',
                            JSON.stringify({
                              sourceType: 'catalog',
                              componentType: item.type,
                            })
                          );
                        }}
                        onClick={() => onInsertComponent(item)}
                        className="group bg-[#1e1e1e] hover:bg-[#323232] border border-[#383838] hover:border-[#0d99ff] rounded-lg p-2 flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all hover:shadow-sm"
                        title="Drag to canvas or click to insert"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 group-hover:text-zinc-200">
                            {item.library === 'both' ? 'Hybrid' : item.library}
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
