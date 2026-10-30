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
}

export const TopBar: React.FC<TopBarProps> = ({
  isCreationMode = false,
  projectName = 'VisualForge Project',
  setProjectName,
  projectType = 'react',
  onOpenNewProject,
  onSaveProject,
  onOpenProject,
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
    <header className="h-11 bg-[#2c2c2c] border-b border-[#383838] pl-3 pr-0 flex items-center justify-between select-none z-30 flex-shrink-0 text-xs text-zinc-200">
      {/* Left: Brand */}
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
      </div>

      {/* Center: Project Title & Environment Badge */}
      <div className="flex items-center gap-2 max-w-[360px] sm:max-w-lg">
        {/* New Project Button */}
        <button
          onClick={onOpenNewProject}
          className="flex items-center gap-1 px-2 py-1 rounded bg-[#1e1e1e] hover:bg-[#383838] border border-[#383838] text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
          title="Crear o configurar proyecto"
        >
          <Plus className="w-3.5 h-3.5 text-[#0d99ff]" />
          <span className="hidden sm:inline">Nuevo</span>
        </button>

        {/* Open Project Button */}
        {onOpenProject && (
          <button
            onClick={onOpenProject}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#1e1e1e] hover:bg-[#383838] border border-[#383838] text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
            title="Abrir Proyecto .vforge (Ctrl+O)"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Abrir</span>
          </button>
        )}

        {/* Save Project Button */}
        {onSaveProject && (
          <button
            onClick={onSaveProject}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#1e1e1e] hover:bg-[#383838] border border-[#383838] text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
            title="Guardar Proyecto .vforge (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Guardar</span>
          </button>
        )}

        {/* Project Type Badge */}
        <button
          onClick={onOpenNewProject}
          title="Haga clic para cambiar el tipo de proyecto e iconografía"
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#1e1e1e] hover:bg-[#383838] border border-[#383838] text-[11px] font-medium text-zinc-300 transition-colors"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              projectType === 'esp32'
                ? 'bg-emerald-400'
                : projectType === 'html_css'
                ? 'bg-amber-400'
                : 'bg-[#0d99ff]'
            }`}
          />
          <span className="truncate max-w-[130px]">
            {projectType === 'esp32'
              ? 'ESP32 / IoT'
              : projectType === 'html_css'
              ? 'HTML / CSS'
              : 'React Web'}
          </span>
        </button>

        {isEditingTitle ? (
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
            autoFocus
            className="bg-[#1e1e1e] border border-[#0d99ff] rounded px-2 py-0.5 text-center text-xs text-white focus:outline-none"
          />
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="hover:bg-[#383838] px-2.5 py-1 rounded text-zinc-300 hover:text-white font-medium tracking-tight truncate max-w-[160px]"
            title="Click to rename project"
          >
            {projectName}
          </button>
        )}
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="All changes saved" />
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

        {/* Viewport Frame Dropdown - Positioned beside Zoom and Preview */}
        <div className="flex items-center bg-[#1e1e1e] rounded-lg border border-[#383838] p-0.5">
          <button
            onClick={() => setViewportMode('desktop')}
            title="Desktop Frame (1440px)"
            className={`px-2 py-1 rounded flex items-center gap-1.5 transition-colors ${
              viewportMode === 'desktop'
                ? 'bg-[#383838] text-white font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Desktop</span>
          </button>
          <button
            onClick={() => setViewportMode('tablet')}
            title="Tablet Frame (768px)"
            className={`px-2 py-1 rounded flex items-center gap-1.5 transition-colors ${
              viewportMode === 'tablet'
                ? 'bg-[#383838] text-white font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Tablet</span>
          </button>
          <button
            onClick={() => setViewportMode('mobile')}
            title="Mobile Frame (375px)"
            className={`px-2 py-1 rounded flex items-center gap-1.5 transition-colors ${
              viewportMode === 'mobile'
                ? 'bg-[#383838] text-white font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Mobile</span>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center bg-[#1e1e1e] rounded border border-[#383838] px-1 py-0.5">
          <button
            onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(1))))}
            className="p-1 hover:text-white text-zinc-400"
            title="Zoom out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <button
            onClick={resetZoom}
            className="px-1.5 font-mono text-[11px] hover:text-white text-zinc-300"
            title="Click to reset to 100%"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(2.0, Number((z + 0.1).toFixed(1))))}
            className="p-1 hover:text-white text-zinc-400"
            title="Zoom in"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
        </div>

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
