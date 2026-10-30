import React, { useState, useEffect, useCallback } from 'react';
import {
  CanvasNode,
  ViewportMode,
  ToolMode,
  DropPosition,
  ComponentDefinition,
  ProjectType,
} from './types';
import { INITIAL_CANVAS_TREE, ESP32_CANVAS_TREE } from './data/initialTemplate';
import { COMPONENT_CATALOG, getCatalogForProject } from './data/componentCatalog';
import {
  findNodeInTree,
  mutateNodeInTree,
  deleteNodeInTree,
  insertChildInTree,
  insertNodeRelative,
  moveNodeSibling,
  cloneNodeWithNewIds,
  instantiateNodeWithFreshIds,
  reorderNodeInTree,
} from './utils/treeUtils';
import { TopBar } from './components/TopBar';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { Canvas } from './components/Canvas';
import { ExportModal } from './components/ExportModal';
import { NewProjectModal } from './components/NewProjectModal';
import { FloatingToolbox } from './components/FloatingToolbox';

export function App() {
  const [projectName, setProjectName] = useState('VisualForge Studio - Project');
  const [projectType, setProjectType] = useState<ProjectType>('hybrid');
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  // Tree and History State for Undo / Redo
  const [tree, setTree] = useState<CanvasNode[]>(INITIAL_CANVAS_TREE);
  const [history, setHistory] = useState<CanvasNode[][]>([INITIAL_CANVAS_TREE]);
  const [historyIdx, setHistoryIdx] = useState(0);

  // Selection & UI State
  const [selectedId, setSelectedId] = useState<string | null>('hero_container');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [zoom, setZoom] = useState<number>(1.0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Panels Open/Close
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Push new state to history stack
  const updateTreeWithHistory = useCallback((newTree: CanvasNode[]) => {
    setTree(newTree);
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIdx + 1);
      return [...sliced, newTree];
    });
    setHistoryIdx((prev) => prev + 1);
  }, [historyIdx]);

  // Undo / Redo Handlers
  const handleUndo = useCallback(() => {
    if (historyIdx > 0) {
      const prevIdx = historyIdx - 1;
      setHistoryIdx(prevIdx);
      setTree(history[prevIdx]);
    }
  }, [historyIdx, history]);

  const handleRedo = useCallback(() => {
    if (historyIdx < history.length - 1) {
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      setTree(history[nextIdx]);
    }
  }, [historyIdx, history]);

  // Selected node lookup
  const selectedNode = selectedId ? findNodeInTree(tree, selectedId) : null;

  // Insert component from catalog
  const handleInsertComponent = useCallback(
    (
      compDef: ComponentDefinition,
      targetId?: string | null,
      position: DropPosition = 'inside',
      extraProps?: Record<string, any>
    ) => {
      const newId = `${compDef.type}_${Math.random().toString(36).substring(2, 9)}`;
      const isFramework = projectType === 'react' || projectType === 'framework';
      const instantiatedChildren = (compDef.defaultChildren || []).map(instantiateNodeWithFreshIds);
      const newNode: CanvasNode = {
        id: newId,
        name: compDef.name,
        type: compDef.type,
        library: compDef.library || (isFramework ? 'shadcn' : 'bootstrap'),
        isContainer: compDef.isContainer,
        style: { ...compDef.defaultStyle },
        props: {
          ...compDef.defaultProps,
          catalog: compDef.catalog || (isFramework ? 'shadcn' : 'preline'),
          ...(extraProps || {}),
        },
        children: instantiatedChildren,
      };

      let newTree: CanvasNode[];

      const effectiveTargetId = targetId !== undefined ? targetId : selectedId;

      if (!effectiveTargetId) {
        // Si no hay elemento seleccionado, buscar el contenedor principal activo o añadir a la raíz
        const mainContainer = tree.find((n) => n.isContainer && n.id !== 'navbar_root');
        if (mainContainer && position === 'inside') {
          newTree = insertChildInTree(tree, mainContainer.id, newNode);
        } else {
          newTree = [...tree, newNode];
        }
      } else {
        const targetNode = findNodeInTree(tree, effectiveTargetId);
        if (targetNode?.isContainer && position === 'inside') {
          newTree = insertChildInTree(tree, effectiveTargetId, newNode);
        } else {
          newTree = insertNodeRelative(tree, effectiveTargetId, newNode, targetNode?.isContainer ? position : 'after');
        }
      }

      updateTreeWithHistory(newTree);
      setSelectedId(newId);
    },
    [tree, selectedId, updateTreeWithHistory, projectType]
  );

  // Quick insertion from FloatingToolbox insertion tools
  const handleInsertTool = useCallback(
    (tool: ToolMode, targetId?: string | null) => {
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
            label: 'Contenedor',
            containerType: 'container',
            action: '#',
            method: 'POST',
          },
          defaultChildren: [],
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
        handleInsertComponent(compDef, targetId, 'inside');
        setToolMode('select');
      }
    },
    [handleInsertComponent, selectedId]
  );

  // Update Node (Props, Style, Name, etc.) atomically in a single state mutation
  const handleUpdateNode = useCallback(
    (updates: { props?: Record<string, any>; style?: Record<string, any>; name?: string }) => {
      if (!selectedId) return;
      const newTree = mutateNodeInTree(tree, selectedId, (node) => ({
        ...node,
        ...(updates.name ? { name: updates.name } : {}),
        props: updates.props ? { ...node.props, ...updates.props } : node.props,
        style: updates.style ? { ...node.style, ...updates.style } : node.style,
      }));
      updateTreeWithHistory(newTree);
    },
    [tree, selectedId, updateTreeWithHistory]
  );

  // Update Style of Selected Node
  const handleUpdateStyle = useCallback(
    (styleUpdates: Record<string, any>) => {
      if (!selectedId) return;
      const newTree = mutateNodeInTree(tree, selectedId, (node) => ({
        ...node,
        style: { ...node.style, ...styleUpdates },
      }));
      updateTreeWithHistory(newTree);
    },
    [tree, selectedId, updateTreeWithHistory]
  );

  // Update Props of Selected Node
  const handleUpdateProps = useCallback(
    (propUpdates: Record<string, any>) => {
      if (!selectedId) return;
      const newTree = mutateNodeInTree(tree, selectedId, (node) => ({
        ...node,
        props: { ...node.props, ...propUpdates },
      }));
      updateTreeWithHistory(newTree);
    },
    [tree, selectedId, updateTreeWithHistory]
  );

  // Delete Node
  const handleDeleteNode = useCallback(
    (id: string) => {
      const newTree = deleteNodeInTree(tree, id);
      updateTreeWithHistory(newTree);
      if (selectedId === id) setSelectedId(null);
    },
    [tree, selectedId, updateTreeWithHistory]
  );

  // Duplicate Node
  const handleDuplicateNode = useCallback(
    (id: string) => {
      const nodeToDup = findNodeInTree(tree, id);
      if (!nodeToDup) return;
      const cloned = cloneNodeWithNewIds(nodeToDup);
      const newTree = insertNodeRelative(tree, id, cloned, 'after');
      updateTreeWithHistory(newTree);
      setSelectedId(cloned.id);
    },
    [tree, updateTreeWithHistory]
  );

  // Toggle Visibility / Hidden
  const handleToggleVisibility = useCallback(
    (id: string) => {
      const newTree = mutateNodeInTree(tree, id, (node) => ({
        ...node,
        hidden: !node.hidden,
      }));
      updateTreeWithHistory(newTree);
    },
    [tree, updateTreeWithHistory]
  );

  // Toggle Lock
  const handleToggleLock = useCallback(
    (id: string) => {
      const newTree = mutateNodeInTree(tree, id, (node) => ({
        ...node,
        locked: !node.locked,
      }));
      updateTreeWithHistory(newTree);
    },
    [tree, updateTreeWithHistory]
  );

  // Move Sibling Up / Down
  const handleMoveSibling = useCallback(
    (id: string, direction: 'up' | 'down') => {
      const newTree = moveNodeSibling(tree, id, direction);
      updateTreeWithHistory(newTree);
    },
    [tree, updateTreeWithHistory]
  );

  // Reorder node via drag and drop
  const handleReorderNode = useCallback(
    (draggedId: string, targetId: string, position: DropPosition) => {
      const newTree = reorderNodeInTree(tree, draggedId, targetId, position);
      updateTreeWithHistory(newTree);
    },
    [tree, updateTreeWithHistory]
  );

  // Drop catalog asset onto canvas
  const handleDropAsset = useCallback(
    (
      componentType: string,
      targetId: string | null,
      position: DropPosition,
      componentName?: string,
      extraProps?: Record<string, any>
    ) => {
      const activeCatalog = getCatalogForProject(projectType);
      const compDef =
        (componentName ? activeCatalog.find((c) => c.name === componentName) : null) ||
        activeCatalog.find((c) => c.type === componentType) ||
        (componentName ? COMPONENT_CATALOG.find((c) => c.name === componentName) : null) ||
        COMPONENT_CATALOG.find((c) => c.type === componentType);
      if (compDef) {
        handleInsertComponent(compDef, targetId, position, extraProps);
      }
    },
    [handleInsertComponent, projectType]
  );

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement)?.isContentEditable;

      // Prevent browser default page scroll on Space when not typing in an input
      if ((e.code === 'Space' || e.key === ' ') && !isInput) {
        e.preventDefault();
      }

      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (!isInput) {
          e.preventDefault();
          handleUndo();
        }
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        if (!isInput) {
          e.preventDefault();
          handleRedo();
        }
      }

      // Duplicate: Ctrl+D or Cmd+D
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        if (!isInput && selectedId) {
          e.preventDefault();
          handleDuplicateNode(selectedId);
        }
      }

      // Delete: Delete or Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput && selectedId) {
        e.preventDefault();
        handleDeleteNode(selectedId);
      }

      // Move Sibling: Alt+ArrowUp or Alt+ArrowDown
      if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        if (!isInput && selectedId) {
          e.preventDefault();
          handleMoveSibling(selectedId, e.key === 'ArrowUp' ? 'up' : 'down');
        }
      }

      // Tool switching: V (Select), H (Hand)
      if (!isInput && !e.ctrlKey && !e.metaKey) {
        if (e.key.toLowerCase() === 'v') setToolMode('select');
        if (e.key.toLowerCase() === 'h') setToolMode('hand');
      }

      // Toggle sidebars: Ctrl+\
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        setIsLeftOpen((prev) => !prev);
        setIsRightOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, selectedId, handleDeleteNode, handleDuplicateNode, handleMoveSibling]);

  const handleCreateProject = useCallback(
    (name: string, type: ProjectType, iconLibrary: string, template: 'iot' | 'saas' | 'blank') => {
      setProjectName(name);
      setProjectType(type);
      let initialTree: CanvasNode[] = [];
      if (template === 'iot' || (type === 'esp32' && template !== 'blank')) {
        initialTree = ESP32_CANVAS_TREE;
      } else if (template === 'saas') {
        initialTree = INITIAL_CANVAS_TREE;
      }
      setTree(initialTree);
      setHistory([initialTree]);
      setHistoryIdx(0);
      setSelectedId(initialTree[0]?.id || null);
    },
    []
  );

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#1e1e1e] text-zinc-100 font-sans select-none">
      {/* Figma Top Toolbar */}
      <TopBar
        projectName={projectName}
        setProjectName={setProjectName}
        projectType={projectType}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
        toolMode={toolMode}
        setToolMode={setToolMode}
        viewportMode={viewportMode}
        setViewportMode={setViewportMode}
        zoom={zoom}
        setZoom={setZoom}
        resetZoom={() => setZoom(1.0)}
        canUndo={historyIdx > 0}
        canRedo={historyIdx < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        isPreviewMode={isPreviewMode}
        setIsPreviewMode={setIsPreviewMode}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Main Studio Body: Left Sidebar + Canvas + Right Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        <LeftSidebar
          tree={tree}
          projectType={projectType}
          selectedId={selectedId}
          onSelectNode={setSelectedId}
          onDeleteNode={handleDeleteNode}
          onToggleVisibility={handleToggleVisibility}
          onToggleLock={handleToggleLock}
          onInsertComponent={(comp) => handleInsertComponent(comp, selectedId, 'inside')}
          onReorderNode={handleReorderNode}
          onMoveSibling={handleMoveSibling}
          isOpen={isLeftOpen}
          setIsOpen={setIsLeftOpen}
        />

        <Canvas
          tree={tree}
          projectType={projectType}
          selectedId={selectedId}
          onSelectNode={setSelectedId}
          viewportMode={viewportMode}
          toolMode={toolMode}
          onInsertTool={handleInsertTool}
          zoom={zoom}
          onZoom={setZoom}
          isPreviewMode={isPreviewMode}
          onDropAsset={handleDropAsset}
          onReorderNode={handleReorderNode}
          onDuplicateNode={handleDuplicateNode}
          onDeleteNode={handleDeleteNode}
          onMoveSibling={handleMoveSibling}
        />

        <RightSidebar
          selectedNode={selectedNode}
          projectType={projectType}
          onUpdateStyle={handleUpdateStyle}
          onUpdateProps={handleUpdateProps}
          onUpdateNode={handleUpdateNode}
          isOpen={isRightOpen}
          setIsOpen={setIsRightOpen}
        />
      </div>

      {/* Floating Smart Toolbox (Figma / VisionOS Style) */}
      {!isPreviewMode && (
        <FloatingToolbox
          toolMode={toolMode}
          setToolMode={setToolMode}
          onInsertComponent={(comp) => handleInsertComponent(comp, selectedId, 'inside')}
          selectedId={selectedId}
          onDuplicateNode={handleDuplicateNode}
          onDeleteNode={handleDeleteNode}
          onMoveSibling={handleMoveSibling}
        />
      )}

      {/* Export Code Modal */}
      <ExportModal
        tree={tree}
        projectType={projectType}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* New Project & Environment Configuration Modal */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onCreateProject={handleCreateProject}
        currentType={projectType}
      />
    </div>
  );
}

export default App;
