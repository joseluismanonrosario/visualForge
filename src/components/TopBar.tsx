import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Play,
  Eye,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  Layers,
  Sparkles,
  Plus,
  Moon,
  Sun,
  Palette,
  Laptop,
  Minus,
  Square,
  Copy,
  X,
  Save,
  SaveAll,
  FolderOpen,
} from 'lucide-react';
import { ViewportMode, ToolMode, ProjectType, AppTheme, ResolvedTheme } from '../types';

export const getLogoForTheme = (theme?: ResolvedTheme | AppTheme) => {
  switch (theme) {
    case 'light':
      return '/logos/logo-blue.png';
    case 'blue':
      return '/logos/logo-white.png';
    case 'dark':
    default:
      return '/logos/logo-gray.png';
  }
};

interface TopBarProps {
  isCreationMode?: boolean;
  projectName?: string;
  setProjectName?: (name: string) => void;
  projectType?: ProjectType;
  onOpenNewProject?: () => void;
  onSaveProject?: () => void;
  onSaveAsProject?: () => void;
  onOpenProject?: () => void;
  toolMode?: ToolMode;
  setToolMode?: (tool: ToolMode) => void;
  viewportMode?: ViewportMode;
  setViewportMode?: (viewport: ViewportMode) => void;
  zoom?: number;
  setZoom?: (zoom: number | ((prev: number) => number)) => void;
  resetZoom?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  isPreviewMode?: boolean;
  setIsPreviewMode?: (val: boolean | ((prev: boolean) => boolean)) => void;
  onOpenExport?: () => void;
  appTheme?: AppTheme;
  resolvedTheme?: ResolvedTheme;
  setAppTheme?: (theme: AppTheme) => void;
  hasUnsavedChanges?: boolean;
  onCloseProject?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  isCreationMode = false,
  projectName = 'Sin nombre',
  setProjectName,
  projectType = 'react',
  onOpenNewProject,
  onSaveProject,
  onSaveAsProject,
  onOpenProject,
  hasUnsavedChanges = false,
  onCloseProject,
  viewportMode = 'desktop',
  setViewportMode,
  zoom = 1,
  setZoom,
  resetZoom,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  isPreviewMode = false,
  setIsPreviewMode,
  onOpenExport,
  appTheme = 'system',
  resolvedTheme = 'dark',
  setAppTheme,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isElectron, setIsElectron] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(
      (window as any).electronAPI ||
      (window as any).isElectron ||
      navigator.userAgent.toLowerCase().includes('electron') ||
      window.location.search.includes('electron=true')
    );
  });

  useEffect(() => {
    const api = (window as any).electronAPI;
    if (api) {
      setIsElectron(true);
      api.isMaximized?.().then?.((max: boolean) => {
        setIsMaximized(max);
      });
      const cleanup = api.onMaximizedChange?.((max: boolean) => {
        setIsMaximized(max);
      });
      return () => {
        if (typeof cleanup === 'function') cleanup();
      };
    }
  }, []);

  const handleMinimize = () => {
    const api = (window as any).electronAPI;
    if (api?.minimize) {
      api.minimize();
    }
  };

  const handleMaximize = () => {
    const api = (window as any).electronAPI;
    if (api?.maximize) {
      api.maximize().then?.((max: boolean) => {
        setIsMaximized(max);
      });
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
        setIsMaximized(false);
      } else {
        document.documentElement.requestFullscreen().catch(() => {});
        setIsMaximized(true);
      }
    }
  };

  const handleClose = () => {
    const api = (window as any).electronAPI;
    if (api?.close) {
      api.close();
    } else {
      window.close();
    }
  };

  // Modo Crear Proyecto: Solo logo + texto para web, y botones de ventana para versión ejecutable
  if (isCreationMode) {
    return (
      <header className="h-11 bg-[#2c2c2c] border-b border-[#383838] pl-3 pr-0 flex items-center justify-between select-none z-30 flex-shrink-0 text-xs text-zinc-200">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img
              src={getLogoForTheme(resolvedTheme)}
              alt="VisualForge"
              className="w-5 h-5 aspect-square object-contain flex-shrink-0 select-none pointer-events-none translate-y-[0.5px] transition-transform duration-200"
            />
            <span className="font-semibold text-zinc-100 hidden sm:inline-block tracking-tight text-[13px] leading-none">
              VisualForge
            </span>
          </div>
        </div>

        {/* Right: Botones de ventana SOLAMENTE para la versión de producción ejecutable */}
        <div className="flex items-center h-full">
          {isElectron && (
            <div className="flex items-center h-full ml-1 border-l border-[#383838]">
              <button
                type="button"
                onClick={handleMinimize}
                title="Minimizar"
                className="h-11 w-11 flex items-center justify-center hover:bg-white/10 active:bg-white/15 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleMaximize}
                title={isMaximized ? 'Restaurar' : 'Maximizar'}
                className="h-11 w-11 flex items-center justify-center hover:bg-white/10 active:bg-white/15 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                {isMaximized ? (
                  <Copy className="w-3.5 h-3.5 rotate-90" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                title="Cerrar"
                className="h-11 w-11 flex items-center justify-center btn-window-close text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="relative h-11 bg-[#2c2c2c] border-b border-[#383838] pl-3 pr-0 flex items-center justify-between select-none z-30 flex-shrink-0 text-xs text-zinc-200">
      {/* Left: Brand & Unified Project Buttons */}
      <div className="flex items-center gap-3">
        {/* Figma Style Logo */}
        <div className="flex items-center gap-2">
          <img
            src={getLogoForTheme(resolvedTheme)}
            alt="VisualForge"
            className="w-5 h-5 aspect-square object-contain flex-shrink-0 select-none pointer-events-none translate-y-[0.5px] transition-transform duration-200"
          />
          <span className="font-semibold text-zinc-100 hidden sm:inline-block tracking-tight text-[13px] leading-none">
            VisualForge
          </span>
        </div>

        {/* Grupo unificado de botones de proyecto: +, Abrir, Guardar, Guardar como */}
        <div className="inline-flex items-center rounded-lg bg-[#1e1e1e] border border-[#383838] p-0.5 divide-x divide-[#383838] shadow-xs flex-shrink-0">
          {/* New Project Button (+) */}
          <button
            onClick={onOpenNewProject}
            className="flex items-center gap-1 px-2 py-1 rounded-l-md hover:bg-[#383838] text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
            title="Crear o configurar proyecto nuevo (+)"
          >
            <Plus className="w-3.5 h-3.5 text-[#0d99ff]" />
            <span className="hidden sm:inline">Nuevo</span>
          </button>

          {/* Open Project Button (Solo icono) */}
          {onOpenProject && (
            <button
              onClick={onOpenProject}
              className="flex items-center justify-center p-1.5 hover:bg-[#383838] text-zinc-200 transition-colors cursor-pointer"
              title="Abrir Proyecto .vforge (Ctrl+O)"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            </button>
          )}

          {/* Save Project Button (Solo icono) */}
          {onSaveProject && (
            <button
              onClick={onSaveProject}
              className={`flex items-center justify-center p-1.5 hover:bg-[#383838] text-zinc-200 transition-colors cursor-pointer ${
                !onSaveAsProject ? 'rounded-r-md' : ''
              }`}
              title="Guardar Proyecto .vforge (Ctrl+S)"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          )}

          {/* Save As Project Button (Solo icono) */}
          {onSaveAsProject && (
            <button
              onClick={onSaveAsProject}
              className="flex items-center justify-center p-1.5 rounded-r-md hover:bg-[#383838] text-zinc-200 transition-colors cursor-pointer"
              title="Guardar como... (Ctrl+Shift+S)"
            >
              <SaveAll className="w-3.5 h-3.5 text-sky-400" />
            </button>
          )}
        </div>
      </div>

      {/* Center: Centered Project Title, Non-clickable Project Type Logo & Unsaved indicator / Close button */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 max-w-[40%] select-none z-10">
        {/* Project Type Logo (No clickeable) */}
        <div
          title={`Tipo de proyecto: ${
            projectType === 'esp32'
              ? 'ESP32 / IoT'
              : projectType === 'html_css'
              ? 'HTML / CSS'
              : 'React Web'
          }`}
          className="flex items-center justify-center p-1 rounded bg-[#1e1e1e] border border-[#383838] flex-shrink-0 cursor-default select-none shadow-xs"
        >
          {projectType === 'esp32' ? (
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 text-emerald-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="5" width="14" height="14" rx="2" />
              <path d="M9 9h6v6H9z" />
              <path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4" />
            </svg>
          ) : projectType === 'html_css' ? (
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 text-amber-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 3l1.8 17.2L12 22l6.2-1.8L20 3H4z" />
              <path d="M8 8h8M8 12h7.5M8 12l.5 5 3.5 1 3.5-1 .3-3" strokeWidth="1.8" />
            </svg>
          ) : (
            <svg
              viewBox="-11.5 -10.23174 23 20.46348"
              className="w-3.5 h-3.5 text-[#00d8ff] pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="0" cy="0" r="2.2" fill="currentColor" stroke="none" />
              <ellipse rx="11" ry="4.2" />
              <ellipse rx="11" ry="4.2" transform="rotate(60)" />
              <ellipse rx="11" ry="4.2" transform="rotate(120)" />
            </svg>
          )}
        </div>

        {isEditingTitle ? (
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName && setProjectName(e.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
            autoFocus
            className="bg-[#1e1e1e] border border-[#0d99ff] rounded px-2 py-0.5 text-center text-xs text-white focus:outline-none"
          />
        ) : (
          <button
            onClick={() => setProjectName && setIsEditingTitle(true)}
            className="hover:bg-[#383838] px-2.5 py-1 rounded text-zinc-300 hover:text-white font-medium tracking-tight truncate max-w-[200px] cursor-pointer"
            title="Haga clic para renombrar proyecto"
          >
            {projectName}
          </button>
        )}

        {/* Indicador de cambios no grabados (puntico / hover equis) y equis de cerrar proyecto */}
        {onCloseProject && (
          <button
            type="button"
            onClick={onCloseProject}
            title={
              hasUnsavedChanges
                ? 'Cambios no guardados · Clic para cerrar proyecto'
                : 'Cerrar proyecto'
            }
            className="group relative flex items-center justify-center w-5 h-5 rounded hover:bg-[#383838] transition-colors cursor-pointer select-none flex-shrink-0"
          >
            {hasUnsavedChanges ? (
              <>
                {/* Puntico cuando hay cambios no grabados */}
                <span className="w-2 h-2 rounded-full bg-[#0d99ff] group-hover:hidden transition-all shadow-[0_0_6px_#0d99ff]" />
                {/* Equis al poner el mouse encima (hover) para cerrar el proyecto */}
                <X className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white hidden group-hover:block transition-all" />
              </>
            ) : (
              /* Equis permanente para cerrar cuando está guardado (sin cambios pendientes) */
              <X className="w-3.5 h-3.5 text-zinc-400 hover:text-white transition-all" />
            )}
          </button>
        )}
      </div>

      {/* Right: History, Frames, Zoom, Preview & Export */}
      <div className="flex items-center gap-2 h-full">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 border-r border-[#3e3e42] pr-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`p-1.5 rounded hover:bg-[#383838] transition-colors ${
              canUndo ? 'text-zinc-200' : 'text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
            className={`p-1.5 rounded hover:bg-[#383838] transition-colors ${
              canRedo ? 'text-zinc-200' : 'text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Theme Selector (Auto PC / Oscuro / Claro / Azul) */}
        {setAppTheme && (
          <div className="flex items-center bg-[#1e1e1e] rounded-lg border border-[#383838] p-0.5">
            <button
              onClick={() => setAppTheme('system')}
              title={`Automático (Detecta PC: ${resolvedTheme === 'dark' ? 'Oscuro' : 'Claro'})`}
              className={`px-1.5 py-1 rounded flex items-center gap-1 transition-colors ${
                appTheme === 'system'
                  ? 'bg-[#383838] text-white font-medium shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[10px]">Auto</span>
            </button>
            <button
              onClick={() => setAppTheme('dark')}
              title="Tema Oscuro (Logo Blanco)"
              className={`px-1.5 py-1 rounded flex items-center gap-1 transition-colors ${
                appTheme === 'dark'
                  ? 'bg-[#383838] text-white font-medium shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setAppTheme('light')}
              title="Tema Claro / Neutral (Logo Gris)"
              className={`px-1.5 py-1 rounded flex items-center gap-1 transition-colors ${
                appTheme === 'light'
                  ? 'bg-[#383838] text-white font-medium shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setAppTheme('blue')}
              title="Tema Azul / Brand (Logo Azul)"
              className={`px-1.5 py-1 rounded flex items-center gap-1 transition-colors ${
                appTheme === 'blue'
                  ? 'bg-[#0d99ff] text-white font-medium shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Preview / Present Mode Toggle */}
        <button
          onClick={() => setIsPreviewMode((p) => !p)}
          title={isPreviewMode ? 'Return to Design Mode' : 'Present / Preview Interface'}
          className={`px-2.5 py-1.5 rounded flex items-center gap-1.5 font-medium transition-colors ${
            isPreviewMode
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-[#383838] hover:bg-[#454545] text-zinc-200'
          }`}
        >
          {isPreviewMode ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editing</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Preview</span>
            </>
          )}
        </button>

        {/* Export Code Button */}
        <button
          onClick={onOpenExport}
          className="bg-[#0d99ff] hover:bg-[#0082df] text-white px-3 py-1.5 rounded font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* Window Controls (Minimizar, Maximizar/Restaurar, Cerrar) - SOLAMENTE para versión ejecutable */}
        {isElectron && (
          <div className="flex items-center h-full ml-1 border-l border-[#383838]">
            <button
              type="button"
              onClick={handleMinimize}
              title="Minimizar"
              className="h-11 w-11 flex items-center justify-center hover:bg-white/10 active:bg-white/15 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleMaximize}
              title={isMaximized ? 'Restaurar' : 'Maximizar'}
              className="h-11 w-11 flex items-center justify-center hover:bg-white/10 active:bg-white/15 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              {isMaximized ? (
                <Copy className="w-3.5 h-3.5 rotate-90" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              title="Cerrar"
              className="h-11 w-11 flex items-center justify-center btn-window-close text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
