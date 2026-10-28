import React, { useState } from 'react';
import {
  MousePointer,
  Hand,
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
  Sparkles
} from 'lucide-react';
import { ViewportMode, ToolMode } from '../types';

interface TopBarProps {
  projectName: string;
  setProjectName: (name: string) => void;
  toolMode: ToolMode;
  setToolMode: (tool: ToolMode) => void;
  viewportMode: ViewportMode;
  setViewportMode: (viewport: ViewportMode) => void;
  zoom: number;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  resetZoom: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isPreviewMode: boolean;
  setIsPreviewMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  onOpenExport: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  projectName,
  setProjectName,
  toolMode,
  setToolMode,
  viewportMode,
  setViewportMode,
  zoom,
  setZoom,
  resetZoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isPreviewMode,
  setIsPreviewMode,
  onOpenExport,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  return (
    <header className="h-11 bg-[#2c2c2c] border-b border-[#383838] px-3 flex items-center justify-between select-none z-30 flex-shrink-0 text-xs text-zinc-200">
      {/* Left: Brand & Figma Tools */}
      <div className="flex items-center gap-3">
        {/* Figma Style Logo */}
        <div className="flex items-center gap-2 pr-2 border-r border-[#3e3e42]">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-violet-600 via-indigo-500 to-blue-400 flex items-center justify-center font-bold text-white shadow-sm text-[11px]">
            VF
          </div>
          <span className="font-semibold text-zinc-100 hidden sm:inline-block tracking-tight">
            VisualForge
          </span>
        </div>

        {/* Tools Pill Group */}
        <div className="flex items-center bg-[#1e1e1e] p-0.5 rounded-lg border border-[#383838]">
          <button
            onClick={() => setToolMode('select')}
            title="Move Tool (V)"
            className={`p-1.5 rounded flex items-center gap-1 transition-colors ${
              toolMode === 'select'
                ? 'bg-[#0d99ff] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setToolMode('hand')}
            title="Hand Tool (H / Space+Drag)"
            className={`p-1.5 rounded flex items-center gap-1 transition-colors ${
              toolMode === 'hand'
                ? 'bg-[#0d99ff] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Viewport Frame Dropdown */}
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
            <span className="hidden md:inline">Desktop</span>
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
            <span className="hidden md:inline">Tablet</span>
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
            <span className="hidden md:inline">Mobile</span>
          </button>
        </div>
      </div>

      {/* Center: Project Title */}
      <div className="flex items-center gap-2 max-w-[280px] sm:max-w-md">
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
            className="hover:bg-[#383838] px-2.5 py-1 rounded text-zinc-300 hover:text-white font-medium tracking-tight truncate max-w-[200px]"
            title="Click to rename project"
          >
            {projectName}
          </button>
        )}
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="All changes saved" />
      </div>

      {/* Right: History, Zoom, Preview & Export */}
      <div className="flex items-center gap-2">
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
      </div>
    </header>
  );
};
