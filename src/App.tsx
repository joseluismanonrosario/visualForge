import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import {
  CanvasNode,
  ViewportMode,
  ToolMode,
  DropPosition,
  ComponentDefinition,
  ProjectType,
  AppTheme,
  ResolvedTheme,
  CanvasSettings,
  RecentProjectItem,
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
  getNodeEffectiveStyle,
  isNodeHiddenInViewport,
} from './utils/treeUtils';
import { TopBar } from './components/TopBar';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { Canvas } from './components/Canvas';
import { ExportModal } from './components/ExportModal';
import { ProjectCreationScreen } from './components/ProjectCreationScreen';
import { SplashScreen } from './components/SplashScreen';
import { FloatingToolbox } from './components/FloatingToolbox';
import { UnsavedChangesModal } from './components/UnsavedChangesModal';
import {
  serializeProject,
  deserializeProject,
  saveProjectFile,
  openProjectFile,
} from './utils/projectPersistence';
import {
  getRecentProjects,
  addRecentProject,
} from './utils/recentProjects';

export function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [projectName, setProjectName] = useState('Sin nombre');
  const [projectType, setProjectType] = useState<ProjectType>('html_css');
  const [isProjectLoaded, setIsProjectLoaded] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [recentProjects, setRecentProjects] = useState<RecentProjectItem[]>(() =>
    getRecentProjects()
  );
  const [appTheme, setAppTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('vf_app_theme') as AppTheme) || 'system';
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const resolvedTheme: ResolvedTheme =
    appTheme === 'system' ? (systemIsDark ? 'dark' : 'light') : appTheme;

  useEffect(() => {
    localStorage.setItem('vf_app_theme', appTheme);
    document.documentElement.setAttribute('data-app-theme', resolvedTheme);
    document.documentElement.setAttribute('data-theme-setting', appTheme);
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) {
      favicon.href =
        resolvedTheme === 'blue'
          ? '/logos/logo-white.png'
          : resolvedTheme === 'light'
          ? '/logos/logo-blue.png'
          : '/logos/logo-gray.png';
    }
  }, [appTheme, resolvedTheme]);

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
    setHasUnsavedChanges(true);
  }, [historyIdx]);

  // Undo / Redo Handlers
  const handleUndo = useCallback(() => {
    if (historyIdx > 0) {
      const prevIdx = historyIdx - 1;
      setHistoryIdx(prevIdx);
      setTree(history[prevIdx]);
      setHasUnsavedChanges(true);
    }
  }, [historyIdx, history]);

  const handleRedo = useCallback(() => {
    if (historyIdx < history.length - 1) {
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      setTree(history[nextIdx]);
      setHasUnsavedChanges(true);
    }
  }, [historyIdx, history]);

  // Canvas & Artboard Settings State
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>(() => {
    try {
      const saved = localStorage.getItem('vf_canvas_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      artboardBg: '#121214',
      artboardTextColor: '#f1f5f9',
      minHeight: 900,
      padding: 16,
      gap: 16,
      fontFamily: 'Inter',
      showGrid: true,
      width: 1440,
      height: 900,
      presetName: 'Desktop Estándar (1440 × 900)',
    };
  });

  const handleUpdateCanvasSettings = useCallback((updates: Partial<CanvasSettings>, markDirty = true) => {
    setCanvasSettings((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('vf_canvas_settings', JSON.stringify(next));
      } catch {}
      return next;
    });
    if (markDirty) {
      setHasUnsavedChanges(true);
    }
  }, []);

  const handleSetProjectName = useCallback((name: string) => {
    setProjectName(name);
    setHasUnsavedChanges(true);
  }, []);

  const handleSetViewportMode = useCallback(
    (mode: ViewportMode) => {
      setViewportMode(mode);
      const defaultPreset =
        mode === 'tablet'
          ? { width: 768, height: 1024, name: 'iPad Mini / Base' }
          : mode === 'mobile'
          ? { width: 375, height: 812, name: 'iPhone X / 11 Pro' }
          : { width: 1440, height: 900, name: 'Desktop Estándar' };

      handleUpdateCanvasSettings({
        width: defaultPreset.width,
        height: defaultPreset.height,
        minHeight: defaultPreset.height,
        presetName: `${mode === 'tablet' ? 'Tablet' : mode === 'mobile' ? 'Mobile' : 'Desktop'} — ${defaultPreset.name} (${defaultPreset.width} × ${defaultPreset.height})`,
      }, false);
    },
    [handleUpdateCanvasSettings]
  );

  const handleClearCanvas = useCallback(() => {
    updateTreeWithHistory([]);
    setSelectedId('canvas');
  }, [updateTreeWithHistory]);

  const handleAddRootContainer = useCallback(() => {
    const newContainer: CanvasNode = {
      id: `container_${Date.now()}`,
      name: 'Contenedor',
      type: 'container',
      library: 'shadcn',
      isContainer: true,
      style: {
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        gap: '16px',
        width: '100%',
      },
      props: {
        label: 'Contenedor',
        containerType: 'container',
        action: '#',
        method: 'POST',
      },
      children: [],
    };
    updateTreeWithHistory([...tree, newContainer]);
    setSelectedId(newContainer.id);
  }, [tree, updateTreeWithHistory]);

  // Selected node lookup (null if canvas is selected)
  const selectedNode = selectedId && selectedId !== 'canvas' ? findNodeInTree(tree, selectedId) : null;

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
      const newTree = mutateNodeInTree(tree, selectedId, (node) => {
        let updatedStyle = node.style;
        let updatedResponsive = node.responsiveStyles;

        if (updates.style) {
          if (viewportMode === 'desktop') {
            const currentDesktop = node.responsiveStyles?.desktop || {};
            updatedStyle = { ...node.style, ...updates.style };
            updatedResponsive = {
              ...(node.responsiveStyles || {}),
              desktop: { ...node.style, ...currentDesktop, ...updates.style },
            };
          } else {
            const currentDeviceStyles = node.responsiveStyles?.[viewportMode] || {};
            updatedResponsive = {
              ...(node.responsiveStyles || {}),
              [viewportMode]: { ...currentDeviceStyles, ...updates.style },
            };
          }
        }

        return {
          ...node,
          ...(updates.name ? { name: updates.name } : {}),
          props: updates.props ? { ...node.props, ...updates.props } : node.props,
          style: updatedStyle,
          ...(updatedResponsive ? { responsiveStyles: updatedResponsive } : {}),
        };
      });
      updateTreeWithHistory(newTree);
    },
    [tree, selectedId, updateTreeWithHistory, viewportMode]
  );

  // Update Style of Selected Node with Decoupled Responsive Breakpoint Isolation
  const handleUpdateStyle = useCallback(
    (styleUpdates: Record<string, any>) => {
      if (!selectedId) return;
      const newTree = mutateNodeInTree(tree, selectedId, (node) => {
        if (viewportMode === 'desktop') {
          // En Desktop, actualiza el estilo base y sobreescrituras desktop
          const currentDesktop = node.responsiveStyles?.desktop || {};
          const updatedDesktop = { ...node.style, ...currentDesktop, ...styleUpdates };
          return {
            ...node,
            style: { ...node.style, ...styleUpdates },
            responsiveStyles: {
              ...(node.responsiveStyles || {}),
              desktop: updatedDesktop,
            },
          };
        } else {
          // En Tablet o Móvil, guarda exclusivamente en el breakpoint del dispositivo
          // sin sobrescribir ni alterar los valores configurados en Desktop
          const currentDeviceStyles = node.responsiveStyles?.[viewportMode] || {};
          const updatedDeviceStyles = { ...currentDeviceStyles, ...styleUpdates };
          return {
            ...node,
            responsiveStyles: {
              ...(node.responsiveStyles || {}),
              [viewportMode]: updatedDeviceStyles,
            },
          };
        }
      });
      updateTreeWithHistory(newTree);
    },
    [tree, selectedId, updateTreeWithHistory, viewportMode]
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
      if (id === 'canvas') {
        handleClearCanvas();
        return;
      }
      const newTree = deleteNodeInTree(tree, id);
      updateTreeWithHistory(newTree);
      if (selectedId === id) setSelectedId(null);
    },
    [tree, selectedId, updateTreeWithHistory, handleClearCanvas]
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

  // Toggle Visibility / Hidden with Decoupled Responsive Breakpoint Isolation
  const handleToggleVisibility = useCallback(
    (id: string) => {
      const newTree = mutateNodeInTree(tree, id, (node) => {
        if (viewportMode === 'desktop') {
          const newHidden = !node.hidden;
          return {
            ...node,
            hidden: newHidden,
            responsiveVisibility: {
              ...(node.responsiveVisibility || {}),
              desktop: newHidden,
            },
          };
        } else {
          // Aislamiento de visibilidad independiente por dispositivo
          const currentHidden = isNodeHiddenInViewport(node, viewportMode);
          const newHidden = !currentHidden;
          return {
            ...node,
            responsiveVisibility: {
              ...(node.responsiveVisibility || {}),
              [viewportMode]: newHidden,
            },
          };
        }
      });
      updateTreeWithHistory(newTree);
    },
    [tree, updateTreeWithHistory, viewportMode]
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

  // Notificaciones Toast del Sistema
  const [statusToast, setStatusToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      setStatusToast({ message, type });
      setTimeout(() => {
        setStatusToast((prev) => (prev?.message === message ? null : prev));
      }, 3500);
    },
    []
  );

  // Proceso de Guardar (Serialización a formato .vforge)
  const handleSaveProject = useCallback(async () => {
    try {
      const jsonString = serializeProject({
        projectName,
        projectType,
        tree,
        canvasSettings,
        viewportMode,
        zoom,
      });

      // Si ya estaba guardado en una ruta previa y tiene nombre asignado, guarda directamente sin pedir nombre.
      // Si es un proyecto nuevo ("Sin nombre" o sin ruta previa), abre la ventana para elegir y escribir nombre y ubicación.
      const result = await saveProjectFile(projectName, jsonString, currentFilePath, false);
      if (result.success && result.filePath) {
        const targetPath = result.filePath;
        const fileNameWithExt = targetPath.split(/[\\/]/).pop() || '';
        const cleanName = fileNameWithExt.replace(/\.(vforge|json)$/i, '') || projectName;

        setProjectName(cleanName);
        setCurrentFilePath(targetPath);
        showToast(
          `Proyecto guardado con éxito: ${fileNameWithExt}`,
          'success'
        );

        let finalJson = jsonString;
        if (cleanName !== projectName) {
          finalJson = serializeProject({
            projectName: cleanName,
            projectType,
            tree,
            canvasSettings,
            viewportMode,
            zoom,
          });
          await saveProjectFile(cleanName, finalJson, targetPath, false);
        }

        // Registrar en lista de proyectos recientes
        const updatedRecents = addRecentProject({
          name: cleanName,
          path: targetPath,
          fileName: fileNameWithExt,
          content: finalJson,
        });
        setRecentProjects(updatedRecents);
        setHasUnsavedChanges(false);
      } else if (result.error) {
        showToast(`Error al guardar: ${result.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`Error de serialización: ${err.message}`, 'error');
    }
  }, [projectName, projectType, tree, canvasSettings, viewportMode, zoom, currentFilePath, showToast]);

  // Proceso de "Guardar como..." (Forzar diálogo para cambiar nombre o ubicación)
  const handleSaveAsProject = useCallback(async () => {
    try {
      const jsonString = serializeProject({
        projectName,
        projectType,
        tree,
        canvasSettings,
        viewportMode,
        zoom,
      });

      // Forzar diálogo pasando forceDialog = true y currentFilePath para prellenar la ruta/nombre actual
      const result = await saveProjectFile(projectName, jsonString, currentFilePath, true);
      if (result.success && result.filePath) {
        const targetPath = result.filePath;
        const fileNameWithExt = targetPath.split(/[\\/]/).pop() || '';
        const cleanName = fileNameWithExt.replace(/\.(vforge|json)$/i, '') || projectName;

        setProjectName(cleanName);
        setCurrentFilePath(targetPath);
        showToast(
          `Proyecto guardado como: ${fileNameWithExt}`,
          'success'
        );

        let finalJson = jsonString;
        if (cleanName !== projectName) {
          finalJson = serializeProject({
            projectName: cleanName,
            projectType,
            tree,
            canvasSettings,
            viewportMode,
            zoom,
          });
          await saveProjectFile(cleanName, finalJson, targetPath, false);
        }

        // Registrar en lista de proyectos recientes
        const updatedRecents = addRecentProject({
          name: cleanName,
          path: targetPath,
          fileName: fileNameWithExt,
          content: finalJson,
        });
        setRecentProjects(updatedRecents);
        setHasUnsavedChanges(false);
      } else if (result.error) {
        showToast(`Error al guardar como: ${result.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`Error de serialización: ${err.message}`, 'error');
    }
  }, [projectName, projectType, tree, canvasSettings, viewportMode, zoom, currentFilePath, showToast]);

  // Proceso de Cargar / Abrir (Deserialización y Restauración)
  const handleOpenProject = useCallback(async () => {
    try {
      const result = await openProjectFile();
      if (!result.success || !result.content) {
        if (result.error) {
          showToast(`Error al abrir archivo: ${result.error}`, 'error');
        }
        return;
      }

      const restored = deserializeProject(result.content);

      // Restaurar estado completo de los componentes, posiciones y configuración
      setTree(restored.tree);
      setHistory([restored.tree]);
      setHistoryIdx(0);
      setProjectName(restored.projectName);
      setProjectType(restored.projectType);
      handleUpdateCanvasSettings(restored.canvasSettings, false);
      setViewportMode(restored.viewportMode);
      setZoom(restored.zoom);
      setSelectedId(restored.tree[0]?.id || null);

      setIsProjectLoaded(true);
      setIsWelcomeOpen(false);
      setHasUnsavedChanges(false);

      // Establecer la ruta del archivo abierto para futuros guardados directos
      const targetPath = result.fileName || `${restored.projectName}.vforge`;
      const fileNameWithExt = targetPath.split(/[\\/]/).pop() || '';
      const derivedName =
        restored.projectName && restored.projectName.trim().toLowerCase() !== 'sin nombre'
          ? restored.projectName
          : fileNameWithExt.replace(/\.(vforge|json)$/i, '') || restored.projectName;

      setProjectName(derivedName);
      setCurrentFilePath(targetPath);

      // Registrar en lista de proyectos recientes
      const updatedRecents = addRecentProject({
        name: derivedName,
        path: targetPath,
        fileName: fileNameWithExt || `${derivedName}.vforge`,
        content: result.content,
      });
      setRecentProjects(updatedRecents);

      showToast(
        `Proyecto "${derivedName}" cargado exitosamente (${restored.tree.length} componentes)`,
        'success'
      );
    } catch (err: any) {
      showToast(`Error al cargar el proyecto .vforge: ${err.message}`, 'error');
    }
  }, [handleUpdateCanvasSettings, showToast]);

  // Proceso de Abrir directamente un proyecto desde la lista de recientes
  const handleOpenRecentProject = useCallback(
    async (item: RecentProjectItem) => {
      try {
        let content = item.content;

        // Si se ejecuta en entorno Electron nativo y existe ruta en disco,
        // intentar leer la versión más fresca directamente desde el archivo
        if (
          typeof window !== 'undefined' &&
          (window as any).electronAPI?.openProjectPath &&
          item.path
        ) {
          try {
            const res = await (window as any).electronAPI.openProjectPath(item.path);
            if (!res.canceled && res.content) {
              content = res.content;
            }
          } catch (e) {
            console.warn('Fallback a contenido en caché para archivo reciente:', e);
          }
        }

        if (!content) {
          showToast(`No se encontró el contenido del archivo "${item.name}".`, 'error');
          return;
        }

        const restored = deserializeProject(content);

        // Restaurar estado completo en el lienzo
        setTree(restored.tree);
        setHistory([restored.tree]);
        setHistoryIdx(0);
        setProjectName(restored.projectName);
        setProjectType(restored.projectType);
        handleUpdateCanvasSettings(restored.canvasSettings, false);
        setViewportMode(restored.viewportMode);
        setZoom(restored.zoom);
        setSelectedId(restored.tree[0]?.id || null);

        setIsProjectLoaded(true);
        setIsWelcomeOpen(false);
        setHasUnsavedChanges(false);

        // Asignar ruta activa para guardados directos en el futuro
        const targetPath = item.path || `${restored.projectName}.vforge`;
        const fileNameWithExt =
          item.fileName || targetPath.split(/[\\/]/).pop() || `${restored.projectName}.vforge`;
        const derivedName =
          restored.projectName && restored.projectName.trim().toLowerCase() !== 'sin nombre'
            ? restored.projectName
            : fileNameWithExt.replace(/\.(vforge|json)$/i, '') || item.name || restored.projectName;

        setProjectName(derivedName);
        setCurrentFilePath(targetPath);

        // Actualizar marca y posición en la lista de recientes
        const updatedRecents = addRecentProject({
          name: derivedName,
          path: targetPath,
          fileName: fileNameWithExt,
          content,
        });
        setRecentProjects(updatedRecents);

        showToast(
          `Proyecto "${derivedName}" abierto exitosamente (${restored.tree.length} componentes)`,
          'success'
        );
      } catch (err: any) {
        showToast(`Error al abrir el proyecto reciente: ${err.message}`, 'error');
      }
    },
    [handleUpdateCanvasSettings, showToast]
  );

  // Solicitar cierre de proyecto (desde el botón equis junto al nombre del proyecto)
  const handleRequestCloseProject = useCallback(() => {
    if (!hasUnsavedChanges) {
      // Si está grabado (sin cambios pendientes), simplemente cierra e ir a nuevo proyecto
      setCurrentFilePath(null);
      setProjectName('Sin nombre');
      setIsWelcomeOpen(true);
      setIsProjectLoaded(false);
      showToast(`Proyecto "${projectName}" cerrado.`, 'info');
    } else {
      // Si no está grabado, preguntar si desea guardarlo
      setIsUnsavedModalOpen(true);
    }
  }, [hasUnsavedChanges, projectName, showToast]);

  // Al confirmar la solicitud de guardar: guarda el proyecto, cierra y se va a la pantalla de nuevo proyecto
  const handleSaveAndCloseProject = useCallback(async () => {
    try {
      const jsonString = serializeProject({
        projectName,
        projectType,
        tree,
        canvasSettings,
        viewportMode,
        zoom,
      });

      // Guarda directamente si ya tenía ruta asignada y nombre, o abre el diálogo si es nuevo o "Sin nombre"
      const result = await saveProjectFile(projectName, jsonString, currentFilePath, false);
      if (result.success && result.filePath) {
        const targetPath = result.filePath;
        const fileNameWithExt = targetPath.split(/[\\/]/).pop() || '';
        const cleanName = fileNameWithExt.replace(/\.(vforge|json)$/i, '') || projectName;

        let finalJson = jsonString;
        if (cleanName !== projectName) {
          finalJson = serializeProject({
            projectName: cleanName,
            projectType,
            tree,
            canvasSettings,
            viewportMode,
            zoom,
          });
          await saveProjectFile(cleanName, finalJson, targetPath, false);
        }

        showToast(`Proyecto guardado con éxito: ${fileNameWithExt}`, 'success');

        const updatedRecents = addRecentProject({
          name: cleanName,
          path: targetPath,
          fileName: fileNameWithExt,
          content: finalJson,
        });
        setRecentProjects(updatedRecents);
        setHasUnsavedChanges(false);
        setIsUnsavedModalOpen(false);
        setCurrentFilePath(null);
        setProjectName('Sin nombre');

        // Se va a la pantalla de nuevo proyecto y cierra el proyecto
        setIsWelcomeOpen(true);
        setIsProjectLoaded(false);
      } else if (result.error) {
        showToast(`Error al guardar: ${result.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`Error de serialización: ${err.message}`, 'error');
    }
  }, [projectName, projectType, tree, canvasSettings, viewportMode, zoom, currentFilePath, showToast]);

  // Al negar la solicitud de guardar: descarta cambios, cierra y se va a la pantalla de nuevo proyecto
  const handleDiscardAndCloseProject = useCallback(() => {
    setIsUnsavedModalOpen(false);
    setHasUnsavedChanges(false);
    setCurrentFilePath(null);
    setProjectName('Sin nombre');
    // Se va a la pantalla de nuevo proyecto y cierra el proyecto
    setIsWelcomeOpen(true);
    setIsProjectLoaded(false);
    showToast(`Proyecto "${projectName}" cerrado.`, 'info');
  }, [projectName, showToast]);

  // Al cancelar el modal de confirmación: permanece en el proyecto
  const handleCancelCloseProject = useCallback(() => {
    setIsUnsavedModalOpen(false);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save As: Ctrl+Shift+S or Cmd+Shift+S
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveAsProject();
        return;
      }

      // Save: Ctrl+S or Cmd+S
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveProject();
        return;
      }

      // Open: Ctrl+O or Cmd+O (disponible tanto en el lienzo como en la pantalla de bienvenida)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenProject();
        return;
      }

      if (isWelcomeOpen) {
        if (e.key === 'Escape' && isProjectLoaded) {
          setIsWelcomeOpen(false);
        }
        return;
      }

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
  }, [
    handleUndo,
    handleRedo,
    selectedId,
    handleDeleteNode,
    handleDuplicateNode,
    handleMoveSibling,
    handleSaveProject,
    handleSaveAsProject,
    handleOpenProject,
    isWelcomeOpen,
    isProjectLoaded,
  ]);

  const handleCreateProject = useCallback(
    (name: string, type: ProjectType, template: 'iot' | 'saas' | 'blank') => {
      const initialName = name && name.trim() ? name : 'Sin nombre';
      setProjectName(initialName);
      setProjectType(type);
      let initialTree: CanvasNode[] = [];
      if (template === 'blank') {
        initialTree = [];
      } else if (template === 'iot' || type === 'esp32') {
        initialTree = JSON.parse(JSON.stringify(ESP32_CANVAS_TREE));
      } else {
        initialTree = JSON.parse(JSON.stringify(INITIAL_CANVAS_TREE));
      }
      setTree(initialTree);
      setHistory([initialTree]);
      setHistoryIdx(0);
      setSelectedId(initialTree[0]?.id || null);
      setCurrentFilePath(null);
      setHasUnsavedChanges(false);
    },
    []
  );

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#1e1e1e] text-zinc-100 font-sans select-none">
      {/* Splash Screen al iniciar la aplicación (dura 2 a 3 segundos con animación de carga) */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {isWelcomeOpen ? (
        <>
          {/* TopBar en modo crear proyecto: solo logo y texto en web, y botones en versión ejecutable */}
          <TopBar
            isCreationMode={true}
            resolvedTheme={resolvedTheme}
            appTheme={appTheme}
          />

          {/* Pantalla de crear proyecto centrada con recuadro sobre el canvas */}
          <div className="flex-1 relative w-full h-[calc(100vh-44px)] canvas-dots flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <ProjectCreationScreen
              isOpen={isWelcomeOpen}
              canCancel={isProjectLoaded}
              onCancel={() => setIsWelcomeOpen(false)}
              onCreateProject={(name, type, template) => {
                handleCreateProject(name, type, template);
                setIsProjectLoaded(true);
                setIsWelcomeOpen(false);
              }}
              onOpenProject={handleOpenProject}
              recentProjects={recentProjects}
              onOpenRecentProject={handleOpenRecentProject}
              currentType={projectType}
              resolvedTheme={resolvedTheme}
            />
          </div>
        </>
      ) : (
        <>
          {/* Figma Top Toolbar */}
          <TopBar
            projectName={projectName}
            setProjectName={handleSetProjectName}
            hasUnsavedChanges={hasUnsavedChanges}
            onCloseProject={handleRequestCloseProject}
            projectType={projectType}
            onOpenNewProject={() => setIsWelcomeOpen(true)}
            onSaveProject={handleSaveProject}
            onSaveAsProject={handleSaveAsProject}
            onOpenProject={handleOpenProject}
            toolMode={toolMode}
            setToolMode={setToolMode}
            viewportMode={viewportMode}
            setViewportMode={handleSetViewportMode}
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
            appTheme={appTheme}
            resolvedTheme={resolvedTheme}
            setAppTheme={setAppTheme}
          />

          {/* Main Studio Body: Left Sidebar + Canvas + Right Sidebar */}
          <div className="flex-1 flex overflow-hidden relative">
            <LeftSidebar
              tree={tree}
              projectType={projectType}
              selectedId={selectedId}
              viewportMode={viewportMode}
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
              canvasSettings={canvasSettings}
              onUpdateCanvasSettings={handleUpdateCanvasSettings}
            />

            <RightSidebar
              selectedNode={selectedNode}
              selectedId={selectedId}
              projectType={projectType}
              onUpdateStyle={handleUpdateStyle}
              onUpdateProps={handleUpdateProps}
              onUpdateNode={handleUpdateNode}
              canvasSettings={canvasSettings}
              onUpdateCanvasSettings={handleUpdateCanvasSettings}
              viewportMode={viewportMode}
              setViewportMode={handleSetViewportMode}
              zoom={zoom}
              setZoom={setZoom}
              tree={tree}
              onClearCanvas={handleClearCanvas}
              onAddRootContainer={handleAddRootContainer}
              onOpenExport={() => setIsExportOpen(true)}
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
              onClearCanvas={handleClearCanvas}
            />
          )}

          {/* Export Code Modal */}
          <ExportModal
            tree={tree}
            projectType={projectType}
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
          />

          {/* Diálogo de confirmación para cambios no guardados al cerrar proyecto */}
          <UnsavedChangesModal
            isOpen={isUnsavedModalOpen}
            projectName={projectName}
            onSaveAndClose={handleSaveAndCloseProject}
            onDiscardAndClose={handleDiscardAndCloseProject}
            onCancel={handleCancelCloseProject}
            resolvedTheme={resolvedTheme}
          />
        </>
      )}

      {/* Toast Notificación de Estado (Guardar / Cargar / Alertas) */}
      {statusToast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-medium animate-in fade-in slide-in-from-bottom-4 duration-200 backdrop-blur-md max-w-md ${
            statusToast.type === 'error'
              ? 'bg-red-950/90 border-red-500/50 text-red-200'
              : statusToast.type === 'info'
              ? 'bg-blue-950/90 border-blue-500/50 text-blue-200'
              : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
          }`}
        >
          {statusToast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}
          <span className="truncate">{statusToast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
