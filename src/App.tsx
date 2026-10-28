import React, { useState, useEffect, useCallback } from 'react';
import {
  CanvasNode,
  ViewportMode,
  ToolMode,
  DropPosition,
  ComponentDefinition,
  ProjectType,
} from './types';
import { INITIAL_CANVAS_TREE } from './data/initialTemplate';
import { COMPONENT_CATALOG } from './data/componentCatalog';
import {
  findNodeInTree,
  mutateNodeInTree,
  deleteNodeInTree,
  insertChildInTree,
  insertNodeRelative,
  moveNodeSibling,
  cloneNodeWithNewIds,
  reorderNodeInTree,
} from './utils/treeUtils';
import { TopBar } from './components/TopBar';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { Canvas } from './components/Canvas';
import { ExportModal } from './components/ExportModal';
import { NewProjectModal } from './components/NewProjectModal';

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
    (compDef: ComponentDefinition, targetId?: string | null, position: DropPosition = 'inside') => {
      const newId = `${compDef.type}_${Math.random().toString(36).substring(2, 9)}`;
      const newNode: CanvasNode = {
        id: newId,
        name: compDef.name,
        type: compDef.type,
        library: compDef.library,
        isContainer: compDef.isContainer,
        style: { ...compDef.defaultStyle },
        props: { ...compDef.defaultProps },
        children: compDef.defaultChildren || [],
      };

      let newTree: CanvasNode[];

      const effectiveTargetId = targetId || selectedId;

      if (!effectiveTargetId) {
        newTree = [...tree, newNode];
      } else {
        const targetNode = findNodeInTree(tree, effectiveTargetId);
        if (targetNode?.isContainer && position === 'inside') {
          newTree = insertChildInTree(tree, effectiveTargetId, newNode);
        } else {
          newTree = insertNodeRelative(tree, effectiveTargetId, newNode, position);
        }
      }

      updateTreeWithHistory(newTree);
      setSelectedId(newId);
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
    (componentType: string, targetId: string | null, position: DropPosition) => {
      const compDef = COMPONENT_CATALOG.find((c) => c.type === componentType);
      if (compDef) {
        handleInsertComponent(compDef, targetId, position);
      }
    },
    [handleInsertComponent]
  );

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement)?.isContentEditable;

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
  }, [handleUndo, handleRedo, selectedId, handleDeleteNode, handleDuplicateNode]);

  const handleCreateProject = useCallback(
    (name: string, type: ProjectType, iconLibrary: string, template: 'saas' | 'blank') => {
      setProjectName(name);
      setProjectType(type);
      const initialTree = template === 'blank' ? [] : INITIAL_CANVAS_TREE;
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
          selectedId={selectedId}
          onSelectNode={setSelectedId}
          onDeleteNode={handleDeleteNode}
          onToggleVisibility={handleToggleVisibility}
          onToggleLock={handleToggleLock}
          onInsertComponent={(comp) => handleInsertComponent(comp, selectedId, 'inside')}
          isOpen={isLeftOpen}
          setIsOpen={setIsLeftOpen}
        />

        <Canvas
          tree={tree}
          selectedId={selectedId}
          onSelectNode={setSelectedId}
          viewportMode={viewportMode}
          toolMode={toolMode}
          zoom={zoom}
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
          isOpen={isRightOpen}
          setIsOpen={setIsRightOpen}
        />
      </div>

      {/* Export Code Modal */}
      <ExportModal
        tree={tree}
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
