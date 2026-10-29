import React, { useState } from 'react';
import { CanvasNode, DropPosition, ProjectType, ToolMode } from '../types';
import { SvgIconRenderer } from '../utils/svgIconRenderer';
import {
  Loader2,
  AlertCircle,
  Maximize2,
  Minimize2,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  Heart,
  HelpCircle,
  Key,
  Layers,
  Lock,
  MessageSquare,
  Minus,
  Moon,
  Plus,
  Search,
  Sliders,
  Sparkles,
  Star,
  Sun,
  User,
  Zap,
  Power,
} from 'lucide-react';

interface NodeRendererProps {
  node: CanvasNode;
  projectType?: ProjectType;
  selectedId: string | null;
  onSelectNode: (id: string, e: React.MouseEvent) => void;
  toolMode?: ToolMode;
  onInsertTool?: (tool: ToolMode, targetId?: string | null) => void;
  isPreviewMode: boolean;
  dropTargetId: string | null;
  dropPosition: DropPosition | null;
  draggedNodeId?: string | null;
  onDragStartNode?: (id: string) => void;
  onDragEndNode?: () => void;
  onDragOverNode: (e: React.DragEvent, id: string) => void;
  onDropNode: (e: React.DragEvent, id: string) => void;
}

export const NodeRenderer: React.FC<NodeRendererProps> = ({
  node,
  projectType = 'react',
  selectedId,
  onSelectNode,
  toolMode = 'select',
  onInsertTool,
  isPreviewMode,
  dropTargetId,
  dropPosition,
  draggedNodeId,
  onDragStartNode,
  onDragEndNode,
  onDragOverNode,
  onDropNode,
}) => {
  if (node.hidden) return null;

  const isHandMode = toolMode === 'hand';
  const isPlacementMode = Boolean(toolMode && ['container', 'heading', 'paragraph', 'image'].includes(toolMode) && !isPreviewMode);
  const isSelected = selectedId === node.id && !isPreviewMode && !isHandMode;
  const isDropTarget = dropTargetId === node.id && !isPreviewMode && !isHandMode && draggedNodeId !== node.id;

  const style: React.CSSProperties = isPreviewMode
    ? (node.style || {})
    : {
        ...(node.style || {}),
        marginTop: undefined,
        marginRight: undefined,
        marginBottom: undefined,
        marginLeft: undefined,
        margin: undefined,
      };
  const props = node.props || {};

  const isFramework =
    projectType === 'react' ||
    projectType === 'framework' ||
    node.props?.catalog === 'shadcn';

  // Interactive local states for canvas preview
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [switchChecked, setSwitchChecked] = useState(props.checked ?? true);
  const [checkboxChecked, setCheckboxChecked] = useState(props.checked ?? true);
  const [accordionOpen, setAccordionOpen] = useState<Record<number, boolean>>({ 0: true });
  const [collapsibleOpen, setCollapsibleOpen] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [countVal, setCountVal] = useState(props.value ?? props.count ?? 5);
  const [isSelfDragging, setIsSelfDragging] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (isHandMode || isPreviewMode) {
      return;
    }
    e.stopPropagation();
    if (toolMode && ['container', 'heading', 'paragraph', 'image'].includes(toolMode)) {
      onInsertTool?.(toolMode, node.id);
      return;
    }
    onSelectNode(node.id, e);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (isHandMode || isPreviewMode || node.locked) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    setIsSelfDragging(true);
    if (onDragStartNode) {
      onDragStartNode(node.id);
    }
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

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsSelfDragging(false);
    if (onDragEndNode) {
      onDragEndNode();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isHandMode || isPreviewMode) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    onDragOverNode(e, node.id);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isHandMode || isPreviewMode) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    onDropNode(e, node.id);
  };

  const selectionClasses = isSelected ? 'relative' : '';
  const dropClasses = '';

  const renderChildren = () => {
    if (!node.children || node.children.length === 0) {
      if (node.isContainer && !isPreviewMode && !isHandMode) {
        const isForm = props.containerType === 'form' || node.type === 'form';
        return (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="w-full py-6 border border-dashed border-zinc-700/80 hover:border-[#0d99ff]/80 rounded-md flex items-center justify-center text-zinc-500 hover:text-[#0d99ff] text-xs select-none transition-colors"
          >
            {isForm
              ? 'Formulario vacío — Arrastra campos o botones aquí'
              : 'Contenedor vacío — Arrastra componentes aquí'}
          </div>
        );
      }
      return null;
    }

    return node.children.map((child) => (
      <NodeRenderer
        key={child.id}
        node={child}
        projectType={projectType}
        selectedId={selectedId}
        onSelectNode={onSelectNode}
        toolMode={toolMode}
        onInsertTool={onInsertTool}
        isPreviewMode={isPreviewMode}
        dropTargetId={dropTargetId}
        dropPosition={dropPosition}
        draggedNodeId={draggedNodeId}
        onDragStartNode={onDragStartNode}
        onDragEndNode={onDragEndNode}
        onDragOverNode={onDragOverNode}
        onDropNode={onDropNode}
      />
    ));
  };

  const renderComponentBody = () => {
    switch (node.type) {
      // ==========================================
      // 1. LAYOUT & CONTAINERS
      // ==========================================
      case 'container':
      case 'form':
      case 'box':
      case 'stack':
      case 'columns':
      case 'layout_splitter': {
        const isForm = props.containerType === 'form' || node.type === 'form';
        const ContainerTag = isForm ? 'form' : 'div';
        const formProps = isForm
          ? {
              action: props.action || '#',
              method: props.method || 'POST',
              onSubmit: (e: React.FormEvent) => e.preventDefault(),
            }
          : {};

        return (
          <ContainerTag
            id={node.id}
            style={style}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            {...formProps}
            className={`${selectionClasses} ${dropClasses} transition-all`}
          >
            {renderChildren()}
          </ContainerTag>
        );
      }
      // ==========================================
      // IOT & DATA VISUALIZATION DASHBOARD
      // ==========================================
      case 'line_chart':
      case 'area_chart': {
        const data = props.data || [22.4, 23.1, 22.8, 24.2, 25.1, 24.8, 26.2, 25.9, 26.4];
        const labels = props.labels || ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30', '10:35', '10:40'];
        const title = props.title || (node.type === 'area_chart' ? 'Potencia & Señal' : 'Telemetría en Vivo');
        const unit = props.unit || '°C';
        const strokeColor = props.color || style.color || (node.type === 'area_chart' ? '#f59e0b' : '#0d99ff');
        const minVal = Math.min(...data);
        const maxVal = Math.max(...data);
        const range = (maxVal - minVal) || 1;
        const lastVal = data[data.length - 1];

        const points = data.map((d: number, i: number) => {
          const x = (i / (data.length - 1)) * 280 + 10;
          const y = 110 - ((d - minVal) / range) * 80 - 10;
          return { x, y };
        });
        const pathD = points.reduce((acc: string, pt: any, idx: number) => {
          if (idx === 0) return `M ${pt.x} ${pt.y}`;
          return `${acc} L ${pt.x} ${pt.y}`;
        }, '');
        const areaD = `${pathD} L ${points[points.length - 1].x} 115 L ${points[0].x} 115 Z`;

        return (
          <div id={node.id} style={style} onClick={handleClick} className={`${selectionClasses} space-y-2 w-full`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">{title}</span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {props.dataBinding?.topic || props.dataBinding?.endpoint || 'esp32/telemetry'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-white font-mono">{lastVal} {unit}</span>
                <span className="text-[9px] text-emerald-400 block flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> EN VIVO
                </span>
              </div>
            </div>
            <div className="w-full h-28 relative bg-[#121214] rounded-lg p-2 border border-[#27272a] overflow-hidden">
              <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id={`grad_${node.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={strokeColor} stopOpacity={node.type === 'area_chart' ? '0.45' : '0.25'} />
                    <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="10" y1="30" x2="290" y2="30" stroke="#27272a" strokeDasharray="3 3" />
                <line x1="10" y1="70" x2="290" y2="70" stroke="#27272a" strokeDasharray="3 3" />
                <line x1="10" y1="110" x2="290" y2="110" stroke="#27272a" />
                <path d={areaD} fill={`url(#grad_${node.id})`} />
                <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((pt: any, i: number) => (
                  <circle key={i} cx={pt.x} cy={pt.y} r={i === points.length - 1 ? 4 : 2} fill={strokeColor} className={i === points.length - 1 ? 'animate-pulse' : ''} />
                ))}
              </svg>
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 px-1">
              <span>{labels[0]}</span>
              <span>{labels[Math.floor(labels.length / 2)]}</span>
              <span>{labels[labels.length - 1]}</span>
            </div>
          </div>
        );
      }

      case 'bar_chart': {
        const data = props.data || [120, 185, 90, 240, 160];
        const labels = props.labels || ['Nodo A', 'Nodo B', 'Nodo C', 'Nodo D', 'Nodo E'];
        const title = props.title || 'Consumo / Niveles';
        const unit = props.unit || 'mA';
        const barColor = props.color || style.color || '#10b981';
        const maxVal = Math.max(...data, 1);

        return (
          <div id={node.id} style={style} onClick={handleClick} className={`${selectionClasses} space-y-2 w-full`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">{title}</span>
              <span className="text-[10px] font-mono text-zinc-400">Máx: {maxVal} {unit}</span>
            </div>
            <div className="h-28 bg-[#121214] rounded-lg p-2.5 border border-[#27272a] flex items-end justify-between gap-2">
              {data.map((val: number, idx: number) => {
                const heightPct = Math.round((val / maxVal) * 85);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <span className="text-[9px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {val}
                    </span>
                    <div
                      style={{ height: `${Math.max(6, heightPct)}%`, backgroundColor: barColor }}
                      className="w-full rounded-t transition-all hover:brightness-125"
                    />
                    <span className="text-[9px] text-zinc-500 truncate max-w-full">
                      {labels[idx] || `N${idx}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case 'pie_chart': {
        const data = props.data || [65, 25, 10];
        const labels = props.labels || ['Flash Libre (65%)', 'Heap Usado (25%)', 'SPIFFS (10%)'];
        const colors = props.colors || ['#0d99ff', '#8b5cf6', '#10b981'];
        const title = props.title || 'Memoria Flash & Heap ESP32';

        return (
          <div id={node.id} style={style} onClick={handleClick} className={`${selectionClasses} space-y-2 w-full`}>
            <span className="text-xs font-semibold text-zinc-300 block">{title}</span>
            <div className="h-28 bg-[#121214] rounded-lg p-2 border border-[#27272a] flex items-center justify-around">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#27272a" strokeWidth="4" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke={colors[0]} strokeWidth="4" strokeDasharray="55 100" strokeDashoffset="0" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke={colors[1]} strokeWidth="4" strokeDasharray="25 100" strokeDashoffset="-55" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke={colors[2]} strokeWidth="4" strokeDasharray="15 100" strokeDashoffset="-80" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-[10px] text-white">
                  ESP32
                </div>
              </div>
              <div className="space-y-1">
                {labels.map((lbl: string, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                    <span className="truncate max-w-[120px]">{lbl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'gauge_chart': {
        const val = Number(props.value ?? 78);
        const min = Number(props.min ?? 0);
        const max = Number(props.max ?? 100);
        const unit = props.unit || '%';
        const title = props.title || 'Nivel del Tanque / Presión';
        const pct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
        const strokeColor = pct > 85 ? '#ef4444' : pct > 65 ? '#f59e0b' : '#0d99ff';

        return (
          <div id={node.id} style={style} onClick={handleClick} className={`${selectionClasses} space-y-1 w-full text-center`}>
            <span className="text-xs font-semibold text-zinc-300 block">{title}</span>
            <div className="relative w-36 h-20 mx-auto flex items-end justify-center overflow-hidden">
              <svg viewBox="0 0 100 60" className="w-full h-full">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#27272a" strokeWidth="8" strokeLinecap="round" />
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(pct / 100) * 126} 126`}
                />
              </svg>
              <div className="absolute bottom-0 flex flex-col items-center">
                <span className="font-mono text-xl font-bold text-white tracking-tight leading-none">{val}</span>
                <span className="text-[10px] font-mono text-zinc-400">{unit}</span>
              </div>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-zinc-500 max-w-[150px] mx-auto px-2">
              <span>{min} {unit}</span>
              <span>{max} {unit}</span>
            </div>
          </div>
        );
      }

      case 'metric_card': {
        const title = props.title || 'Humedad Relativa';
        const value = props.value || '58.4';
        const unit = props.unit || '% RH';
        const status = props.status || 'OPTIMAL';
        const protocol = props.protocol || 'MQTT';
        const trend = props.trend || '+2.1% en la última hora';

        return (
          <div id={node.id} style={style} onClick={handleClick} className={`${selectionClasses} space-y-2.5 w-full`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">{title}</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                {protocol}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold font-mono text-white tracking-tight">{value}</span>
              <span className="text-sm font-semibold text-zinc-400">{unit}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#27272a]">
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                {status}
              </span>
              <span className="text-zinc-500 text-[9px]">{trend}</span>
            </div>
            {renderChildren()}
          </div>
        );
      }

      case 'status_badge': {
        const status = props.status || 'online';
        const label = props.label || (status === 'online' ? 'ESP32 Conectado' : status === 'connecting' ? 'Reconectando...' : 'Desconectado');
        const isOnline = status === 'online';
        const isConnecting = status === 'connecting';
        const pulse = props.pulse !== false;
        const latency = props.latency || '18ms';

        return (
          <div
            id={node.id}
            style={style}
            onClick={handleClick}
            className={`${selectionClasses} inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium select-none ${
              isOnline
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                : isConnecting
                ? 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                : 'bg-red-950/40 text-red-300 border-red-500/40'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {pulse && (
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isOnline ? 'bg-emerald-400' : isConnecting ? 'bg-amber-400' : 'bg-red-400'
                  }`}
                />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isOnline ? 'bg-emerald-500' : isConnecting ? 'bg-amber-500' : 'bg-red-500'
                }`}
              />
            </span>
            <span>{label}</span>
            {isOnline && <span className="text-[9px] font-mono text-emerald-400/70 border-l border-emerald-500/30 pl-1.5">{latency}</span>}
          </div>
        );
      }

      case 'relay_switch': {
        const isChecked = Boolean(props.checked);
        const label = props.label || 'Relé Principal';
        const gpioPin = props.gpioPin || 'GPIO_4';
        const activeText = props.activeText || 'CERRADO (ENCENDIDO)';
        const inactiveText = props.inactiveText || 'ABIERTO (APAGADO)';

        return (
          <div id={node.id} style={style} onClick={handleClick} className={`${selectionClasses} space-y-2.5 w-full`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">{label}</span>
                <span className="text-[10px] text-zinc-400 font-mono">{gpioPin}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  isChecked
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                {isChecked ? activeText : inactiveText}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isPreviewMode) onSelectNode(node.id, e);
              }}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                isChecked
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/40'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isChecked ? 'Conmutar a OFF' : 'Conmutar a ON'}</span>
            </button>
          </div>
        );
      }

      case 'pwm_slider': {
        const value = Number(props.value ?? 128);
        const min = Number(props.min ?? 0);
        const max = Number(props.max ?? 255);
        const label = props.label || 'Dimmer Iluminación LED (PWM)';
        const gpioPin = props.gpioPin || 'GPIO_5';
        const pct = Math.round(((value - min) / (max - min)) * 100);

        return (
          <div id={node.id} style={style} onClick={handleClick} className={`${selectionClasses} space-y-2 w-full`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">{label}</span>
                <span className="text-[10px] text-zinc-400 font-mono">{gpioPin}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-[#0d99ff] font-mono">{value}</span>
                <span className="text-[10px] text-zinc-500 font-mono ml-1">({pct}%)</span>
              </div>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              defaultValue={value}
              disabled={!isPreviewMode}
              className="w-full accent-[#0d99ff] cursor-pointer"
            />
          </div>
        );
      }

      case 'custom_scrollbar':
        return (
          <div
            id={node.id}
            style={style}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`${selectionClasses} ${dropClasses} transition-all`}
          >
            {renderChildren()}
          </div>
        );

      case 'grid':
        return (
          <div
            id={node.id}
            style={style}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`${selectionClasses} ${dropClasses} transition-all`}
          >
            {renderChildren()}
          </div>
        );

      case 'aspect_ratio':
        return (
          <div
            id={node.id}
            style={style}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`${selectionClasses} ${dropClasses} overflow-hidden`}
          >
            {renderChildren()}
          </div>
        );

      case 'scroll_area':
        return (
          <div
            id={node.id}
            style={style}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`${selectionClasses} ${dropClasses} overflow-auto`}
          >
            {renderChildren()}
          </div>
        );

      case 'collapsible':
      case 'collapse':
        return (
          <div
            id={node.id}
            style={style}
            onClick={handleClick}
            className={`${selectionClasses} border border-zinc-700/60 rounded-lg overflow-hidden bg-zinc-900/50`}
          >
            <div
              onClick={() => isPreviewMode && setCollapsibleOpen(!collapsibleOpen)}
              className="flex items-center justify-between px-3 py-2 bg-zinc-800/40 cursor-pointer text-xs font-medium text-zinc-200"
            >
              <span>{props.title || props.label || 'Sección Colapsable'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  collapsibleOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
            {collapsibleOpen && <div className="p-3 text-xs text-zinc-400">{renderChildren()}</div>}
          </div>
        );

      case 'resizable':
        return (
          <div
            id={node.id}
            style={style}
            onClick={handleClick}
            className={`${selectionClasses} flex border border-zinc-800 rounded-lg divide-x divide-zinc-800`}
          >
            <div className="flex-1 p-3">{renderChildren()}</div>
            <div className="w-1 bg-zinc-700/50 cursor-col-resize flex items-center justify-center">
              <span className="w-0.5 h-4 bg-zinc-400 rounded-full" />
            </div>
          </div>
        );

      case 'separator':
      case 'divider':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} w-full my-3`}>
            {props.label ? (
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-zinc-800" />
                <span className="bg-zinc-950 px-2 text-[10px] text-zinc-400 absolute">
                  {props.label}
                </span>
              </div>
            ) : (
              <div className="w-full border-t border-zinc-800" style={style} />
            )}
          </div>
        );

      case 'skeleton':
      case 'skeleton_feedback':
        return (
          <div
            id={node.id}
            style={style}
            onClick={handleClick}
            className={`${selectionClasses} animate-pulse bg-zinc-800 rounded-md`}
          />
        );

      // ==========================================
      // 2. FORMS & INPUTS
      // ==========================================
      case 'button': {
        const variant = props.variant || 'primary';
        const size = props.size || 'md';
        const disabled = Boolean(props.disabled || props.isLoading);
        const isActive = Boolean(props.isActive);
        const buttonType = (props.buttonType || 'button') as 'button' | 'submit' | 'reset';

        let variantClasses = 'bg-[#0d99ff] hover:bg-blue-600 text-white';
        if (variant === 'secondary') {
          variantClasses = 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700';
        } else if (variant === 'outline') {
          variantClasses = 'bg-transparent hover:bg-zinc-800/60 text-zinc-200 border border-zinc-600';
        } else if (variant === 'ghost') {
          variantClasses = 'bg-transparent hover:bg-zinc-800/60 text-zinc-300';
        } else if (variant === 'destructive') {
          variantClasses = 'bg-red-600 hover:bg-red-500 text-white';
        } else if (variant === 'link') {
          variantClasses = 'bg-transparent text-[#0d99ff] hover:underline p-0 h-auto';
        }

        let sizeClasses = 'px-4 py-2 text-xs';
        let iconSize = 16;
        if (size === 'sm') {
          sizeClasses = 'px-2.5 py-1 text-[11px]';
          iconSize = 13;
        } else if (size === 'lg') {
          sizeClasses = 'px-6 py-2.5 text-sm';
          iconSize = 18;
        }

        const leftIcon = props.iconLeft || (props.iconPosition === 'left' ? props.iconName : undefined);
        const rightIcon = props.iconRight || (props.iconPosition === 'right' ? props.iconName : undefined);
        const hasLeftIcon = Boolean(leftIcon);
        const hasRightIcon = Boolean(rightIcon);

        return (
          <button
            id={node.id}
            type={buttonType}
            disabled={disabled}
            style={style}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`${selectionClasses} ${dropClasses} inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${variantClasses} ${sizeClasses} ${
              disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
            } ${isActive ? 'ring-2 ring-[#0d99ff] ring-offset-2 ring-offset-zinc-900' : ''} ${
              isFramework ? 'rounded-md font-medium shadow-xs' : 'rounded-lg font-semibold shadow-sm'
            }`}
          >
            {props.isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {!props.isLoading && hasLeftIcon && leftIcon && (
              <SvgIconRenderer iconId={leftIcon} size={iconSize} stroke="currentColor" fill="none" />
            )}
            <span>{props.label || props.text || 'Botón'}</span>
            {!props.isLoading && hasRightIcon && rightIcon && (
              <SvgIconRenderer iconId={rightIcon} size={iconSize} stroke="currentColor" fill="none" />
            )}
            {props.gpio?.enabled && (
              <span className="ml-1 px-1 py-0.2 rounded bg-black/40 text-[9px] font-mono text-emerald-300">
                GPIO {props.gpio.pin}
              </span>
            )}
          </button>
        );
      }

      case 'button_group':
        return (
          <div
            id={node.id}
            onClick={handleClick}
            className={`${selectionClasses} inline-flex rounded-lg border border-zinc-700 overflow-hidden divide-x divide-zinc-700`}
          >
            {(props.buttons || ['Opción 1', 'Opción 2', 'Opción 3']).map((b: string, i: number) => (
              <button
                key={i}
                type="button"
                className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                {b}
              </button>
            ))}
          </div>
        );

      case 'input': {
        const inputType = props.inputType || props.type || 'text';
        const hasError = Boolean(props.hasError);
        const disabled = Boolean(props.disabled);
        const inputId = props.id || `field_${node.id}`;
        const hasLabel = props.hasLabel !== false && Boolean(props.label);
        const labelPosition = props.labelPosition || 'top';

        const labelElement = hasLabel ? (
          <label
            htmlFor={inputId}
            className={`text-xs font-medium text-zinc-300 select-none ${
              labelPosition === 'left' || labelPosition === 'right' ? 'shrink-0' : 'block'
            }`}
          >
            {props.label}
            {props.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
        ) : null;

        const inputElement = (
          <div className={labelPosition === 'left' || labelPosition === 'right' ? 'flex-1 w-full' : 'w-full'}>
            <input
              id={inputId}
              type={inputType}
              placeholder={props.placeholder || ''}
              defaultValue={props.value || undefined}
              disabled={disabled || !isPreviewMode}
              style={style}
              className={`w-full focus:outline-none transition-colors ${
                hasError
                  ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'focus:ring-1 focus:ring-[#0d99ff]'
              } ${
                disabled ? 'opacity-50 cursor-not-allowed bg-zinc-900/40' : ''
              } ${
                isFramework
                  ? 'bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-white'
                  : 'bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white'
              }`}
            />
            {hasError && props.errorMessage && (
              <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{props.errorMessage}</span>
              </p>
            )}
          </div>
        );

        let layoutClass = 'space-y-1 w-full';
        if (hasLabel) {
          if (labelPosition === 'bottom') layoutClass = 'flex flex-col-reverse gap-1.5 w-full';
          else if (labelPosition === 'left') layoutClass = 'flex flex-row items-center gap-3 w-full';
          else if (labelPosition === 'right') layoutClass = 'flex flex-row-reverse items-center justify-end gap-3 w-full';
          else layoutClass = 'flex flex-col gap-1.5 w-full';
        }

        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} ${layoutClass}`}>
            {labelPosition === 'bottom' || labelPosition === 'right' ? (
              <>
                {inputElement}
                {labelElement}
              </>
            ) : (
              <>
                {labelElement}
                {inputElement}
              </>
            )}
          </div>
        );
      }

      case 'input_group':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} flex w-full`}>
            {props.prefix && (
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-zinc-700 bg-zinc-800 text-zinc-400 text-xs">
                {props.prefix}
              </span>
            )}
            <input
              type="text"
              placeholder={props.placeholder || ''}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-r-md px-3 py-1.5 text-xs text-white focus:outline-none"
            />
          </div>
        );

      case 'input_otp':
      case 'pin_input':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} flex gap-2 justify-center py-1`}>
            {(props.slots || props.pins || ['4', '8', '2', '0']).map((slot: string, i: number) => (
              <div
                key={i}
                className="w-9 h-10 rounded-md border border-zinc-700 bg-zinc-900 flex items-center justify-center font-mono font-bold text-base text-white"
              >
                {slot}
              </div>
            ))}
          </div>
        );

      case 'label':
        return (
          <label
            id={node.id}
            htmlFor={props.htmlFor}
            style={style}
            onClick={handleClick}
            className={`${selectionClasses} text-xs font-medium text-zinc-300 block`}
          >
            {props.text || props.label || 'Etiqueta de formulario'}
            {props.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
        );

      case 'checkbox': {
        const disabled = Boolean(props.disabled);
        return (
          <div
            id={node.id}
            style={style}
            onClick={(e) => {
              handleClick(e);
              if (isPreviewMode && !disabled) setCheckboxChecked(!checkboxChecked);
            }}
            className={`${selectionClasses} inline-flex items-center gap-2 select-none text-xs text-zinc-300 ${
              disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
            }`}
          >
            <div
              className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                checkboxChecked || props.checked
                  ? 'bg-[#0d99ff] border-[#0d99ff] text-white'
                  : 'border-zinc-600 bg-zinc-800'
              }`}
            >
              {(checkboxChecked || props.checked) && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span>{props.label || 'Checkbox'}</span>
          </div>
        );
      }

      case 'radio':
      case 'radio_group': {
        const disabled = Boolean(props.disabled);
        const inputId = props.id || `field_${node.id}`;
        const hasLabel = props.hasLabel !== false && Boolean(props.label);
        const labelPosition = props.labelPosition || 'top';
        const options = Array.isArray(props.options)
          ? props.options
          : typeof props.options === 'string'
          ? props.options.split(',').map((s: string) => s.trim())
          : ['Opción A', 'Opción B', 'Opción C'];

        const labelElement = hasLabel ? (
          <label
            htmlFor={`${inputId}_opt_0`}
            className={`text-xs font-medium text-zinc-300 select-none ${
              labelPosition === 'left' || labelPosition === 'right' ? 'shrink-0 self-start mt-0.5' : 'block mb-1'
            }`}
          >
            {props.label}
          </label>
        ) : null;

        const optionsElement = (
          <div className={`space-y-1.5 ${labelPosition === 'left' || labelPosition === 'right' ? 'flex-1' : ''}`}>
            {options.map((opt: string, i: number) => {
              const optId = `${inputId}_opt_${i}`;
              return (
                <label
                  key={i}
                  htmlFor={optId}
                  className={`flex items-center gap-2 text-xs text-zinc-300 ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <input
                    id={optId}
                    type="radio"
                    name={props.name || `radio_${node.id}`}
                    disabled={disabled || !isPreviewMode}
                    defaultChecked={props.value ? props.value === opt : i === 0}
                    className="accent-[#0d99ff]"
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        );

        let layoutClass = 'space-y-1.5';
        if (hasLabel) {
          if (labelPosition === 'bottom') layoutClass = 'flex flex-col-reverse gap-1.5';
          else if (labelPosition === 'left') layoutClass = 'flex flex-row gap-3';
          else if (labelPosition === 'right') layoutClass = 'flex flex-row-reverse justify-end gap-3';
          else layoutClass = 'flex flex-col gap-1.5';
        }

        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} ${layoutClass}`}>
            {labelPosition === 'bottom' || labelPosition === 'right' ? (
              <>
                {optionsElement}
                {labelElement}
              </>
            ) : (
              <>
                {labelElement}
                {optionsElement}
              </>
            )}
          </div>
        );
      }

      case 'select':
      case 'advanced_select':
      case 'combobox':
      case 'searchbox': {
        const disabled = Boolean(props.disabled);
        const inputId = props.id || `field_${node.id}`;
        const hasLabel = props.hasLabel !== false && Boolean(props.label);
        const labelPosition = props.labelPosition || 'top';
        const options = Array.isArray(props.options)
          ? props.options
          : typeof props.options === 'string'
          ? props.options.split(',').map((s: string) => s.trim())
          : ['Opción 1', 'Opción 2', 'Opción 3'];

        const labelElement = hasLabel ? (
          <label
            htmlFor={inputId}
            className={`text-xs font-medium text-zinc-300 select-none ${
              labelPosition === 'left' || labelPosition === 'right' ? 'shrink-0' : 'block'
            }`}
          >
            {props.label}
            {props.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
        ) : null;

        const selectElement = (
          <div className={`relative ${labelPosition === 'left' || labelPosition === 'right' ? 'flex-1 w-full' : 'w-full'}`}>
            <select
              id={inputId}
              disabled={disabled || !isPreviewMode}
              style={style}
              className={`w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none appearance-none pr-8 ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {props.placeholder && (
                <option value="" disabled selected>
                  {props.placeholder}
                </option>
              )}
              {options.map((o: string, idx: number) => (
                <option key={idx} value={o} className="bg-zinc-900">
                  {o}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        );

        let layoutClass = 'space-y-1 w-full';
        if (hasLabel) {
          if (labelPosition === 'bottom') layoutClass = 'flex flex-col-reverse gap-1.5 w-full';
          else if (labelPosition === 'left') layoutClass = 'flex flex-row items-center gap-3 w-full';
          else if (labelPosition === 'right') layoutClass = 'flex flex-row-reverse items-center justify-end gap-3 w-full';
          else layoutClass = 'flex flex-col gap-1.5 w-full';
        }

        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} ${layoutClass}`}>
            {labelPosition === 'bottom' || labelPosition === 'right' ? (
              <>
                {selectElement}
                {labelElement}
              </>
            ) : (
              <>
                {labelElement}
                {selectElement}
              </>
            )}
          </div>
        );
      }

      case 'slider':
      case 'range_slider':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} space-y-1 w-full`}>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>{props.label || 'Slider'}</span>
              <span className="font-mono text-[#0d99ff]">{props.value ?? 128}</span>
            </div>
            <input
              type="range"
              min={props.min ?? 0}
              max={props.max ?? 255}
              defaultValue={props.value ?? 128}
              className="w-full accent-[#0d99ff] cursor-pointer"
            />
          </div>
        );

      case 'switch':
        return (
          <div
            id={node.id}
            style={style}
            onClick={(e) => {
              handleClick(e);
              if (isPreviewMode) setSwitchChecked(!switchChecked);
            }}
            className={`${selectionClasses} inline-flex items-center gap-2 cursor-pointer select-none`}
          >
            <div
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                switchChecked ? 'bg-[#0d99ff]' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  switchChecked ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
            {props.label && <span className="text-xs text-zinc-300">{props.label}</span>}
          </div>
        );

      case 'textarea': {
        const hasError = Boolean(props.hasError);
        const disabled = Boolean(props.disabled);
        const inputId = props.id || `field_${node.id}`;
        const hasLabel = props.hasLabel !== false && Boolean(props.label);
        const labelPosition = props.labelPosition || 'top';

        const labelElement = hasLabel ? (
          <label
            htmlFor={inputId}
            className={`text-xs font-medium text-zinc-300 select-none ${
              labelPosition === 'left' || labelPosition === 'right' ? 'shrink-0 self-start mt-1.5' : 'block'
            }`}
          >
            {props.label}
            {props.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
        ) : null;

        const textareaElement = (
          <div className={labelPosition === 'left' || labelPosition === 'right' ? 'flex-1 w-full' : 'w-full'}>
            <textarea
              id={inputId}
              placeholder={props.placeholder || ''}
              defaultValue={props.value || undefined}
              disabled={disabled || !isPreviewMode}
              rows={props.rows || 3}
              style={style}
              className={`w-full focus:outline-none transition-colors ${
                hasError
                  ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'focus:ring-1 focus:ring-[#0d99ff]'
              } ${
                disabled ? 'opacity-50 cursor-not-allowed bg-zinc-900/40' : ''
              } ${
                isFramework
                  ? 'bg-zinc-950 border border-zinc-800 rounded-md p-2 text-xs text-white'
                  : 'bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white'
              }`}
            />
            {hasError && props.errorMessage && (
              <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{props.errorMessage}</span>
              </p>
            )}
          </div>
        );

        let layoutClass = 'space-y-1 w-full';
        if (hasLabel) {
          if (labelPosition === 'bottom') layoutClass = 'flex flex-col-reverse gap-1.5 w-full';
          else if (labelPosition === 'left') layoutClass = 'flex flex-row gap-3 w-full';
          else if (labelPosition === 'right') layoutClass = 'flex flex-row-reverse justify-end gap-3 w-full';
          else layoutClass = 'flex flex-col gap-1.5 w-full';
        }

        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} ${layoutClass}`}>
            {labelPosition === 'bottom' || labelPosition === 'right' ? (
              <>
                {textareaElement}
                {labelElement}
              </>
            ) : (
              <>
                {labelElement}
                {textareaElement}
              </>
            )}
          </div>
        );
      }

      case 'toggle':
      case 'toggle_group':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} inline-flex rounded-md border border-zinc-700 p-0.5 bg-zinc-900`}>
            {(props.items || ['Bold', 'Italic', 'Underline']).map((item: string, i: number) => (
              <button
                key={i}
                type="button"
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  i === 0 ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        );

      case 'file_input':
      case 'file_upload_progress':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} border border-dashed border-zinc-700 rounded-lg p-3 text-center bg-zinc-900/40 w-full`}>
            <div className="text-xs text-zinc-300 font-medium">{props.filename || props.label || 'Subir archivo'}</div>
            {props.progress !== undefined && (
              <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#0d99ff] h-full" style={{ width: `${props.progress}%` }} />
              </div>
            )}
          </div>
        );

      case 'color_picker':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} inline-flex items-center gap-2 text-xs text-zinc-300`}>
            <div className="w-5 h-5 rounded-full border border-zinc-600" style={{ backgroundColor: props.color || '#0d99ff' }} />
            <span>{props.label || 'Selector de Color'}</span>
          </div>
        );

      case 'time_picker':
      case 'datepicker':
      case 'calendar':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} bg-zinc-900 border border-zinc-700 rounded-lg p-3 w-fit text-xs text-zinc-200`}>
            <div className="font-semibold text-white mb-2">{props.month || props.label || 'Calendario'}</div>
            <div className="grid grid-cols-7 gap-1 text-center text-zinc-400">
              {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, idx) => (
                <span key={idx} className="font-mono text-[10px]">{d}</span>
              ))}
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} className={`py-1 rounded ${i === 8 ? 'bg-[#0d99ff] text-white font-bold' : 'hover:bg-zinc-800'}`}>
                  {i + 15}
                </span>
              ))}
            </div>
          </div>
        );

      case 'input_number':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} inline-flex items-center border border-zinc-700 rounded-lg overflow-hidden bg-zinc-900`}>
            <button onClick={() => setCountVal(Math.max(0, countVal - 1))} className="px-2 py-1 text-zinc-400 hover:text-white bg-zinc-800/60">-</button>
            <span className="px-3 font-mono text-xs text-white">{countVal}</span>
            <button onClick={() => setCountVal(countVal + 1)} className="px-2 py-1 text-zinc-400 hover:text-white bg-zinc-800/60">+</button>
          </div>
        );

      case 'strong_password':
      case 'toggle_password':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} space-y-1 w-full`}>
            <label className="block text-xs font-medium text-zinc-300">{props.label || 'Contraseña'}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                defaultValue="MiContraseñaSegura123!"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white pr-8 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2 text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        );

      case 'toggle_count':
        return (
          <button
            id={node.id}
            onClick={() => setCountVal(countVal + 1)}
            className={`${selectionClasses} inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400 text-xs font-medium`}
          >
            <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
            <span>{countVal}</span>
          </button>
        );

      case 'copy_markup':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} flex items-center justify-between p-2 bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-xs text-sky-400 w-full`}>
            <span className="truncate">{props.code || 'fetch("/update?pin=4")'}</span>
            <Copy className="w-3.5 h-3.5 text-zinc-400 ml-2 shrink-0 cursor-pointer hover:text-white" />
          </div>
        );

      // ==========================================
      // 3. DATA DISPLAY
      // ==========================================
      case 'avatar':
        return (
          <div
            id={node.id}
            style={style}
            onClick={handleClick}
            className={`${selectionClasses} rounded-full overflow-hidden inline-flex items-center justify-center font-bold text-xs bg-zinc-800 text-white`}
          >
            {props.src ? (
              <img src={props.src} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              props.initials || 'US'
            )}
          </div>
        );

      case 'avatar_group':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} flex -space-x-2`}>
            {['CN', 'PL', 'VF'].map((init, idx) => (
              <div
                key={idx}
                className="w-7 h-7 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold text-white"
              >
                {init}
              </div>
            ))}
          </div>
        );

      case 'badge':
        return (
          <span
            id={node.id}
            style={style}
            onClick={handleClick}
            className={`${selectionClasses} inline-flex items-center gap-1 font-medium`}
          >
            {props.label || 'Badge'}
          </span>
        );

      case 'blockquote':
        return (
          <blockquote id={node.id} style={style} onClick={handleClick} className={`${selectionClasses} italic border-l-4 border-blue-500 pl-3 text-zinc-300 text-xs`}>
            {props.text || '"Diseño limpio para sistemas embebidos e interfaces web."'}
          </blockquote>
        );

      case 'card':
        return (
          <div
            id={node.id}
            style={style}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`${selectionClasses} ${dropClasses}`}
          >
            {node.children && node.children.length > 0 ? (
              renderChildren()
            ) : (
              <>
                {props.title && (
                  <div className="border-b border-zinc-800 pb-2 mb-2">
                    <h4 className="font-semibold text-zinc-100 text-sm">{props.title}</h4>
                    {props.subtitle && <p className="text-zinc-400 text-xs">{props.subtitle}</p>}
                  </div>
                )}
                {renderChildren()}
              </>
            )}
          </div>
        );

      case 'chat_bubble':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} flex gap-2 items-start max-w-[85%]`}>
            <div className="w-6 h-6 rounded-full bg-[#0d99ff] flex items-center justify-center text-[10px] text-white font-bold shrink-0">
              AI
            </div>
            <div className="bg-zinc-800/80 border border-zinc-700/50 rounded-2xl px-3 py-2 text-xs text-zinc-200">
              {props.message || 'Mensaje recibido en el microcontrolador ESP32.'}
            </div>
          </div>
        );

      case 'carousel':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} relative border border-zinc-800 rounded-xl p-4 bg-zinc-900/50 w-full`}>
            <div className="text-xs font-semibold text-zinc-300 mb-2">Carrusel</div>
            {renderChildren()}
          </div>
        );

      case 'chart':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} border border-zinc-800 rounded-xl p-3 bg-zinc-900/60 w-full`}>
            <div className="text-xs font-semibold text-zinc-300 mb-2">{props.title || 'Métricas en Tiempo Real'}</div>
            <div className="flex items-end gap-2 h-20 pt-2 border-b border-zinc-800">
              {[40, 70, 55, 90, 65, 80, 95].map((h, i) => (
                <div key={i} className="flex-1 bg-[#0d99ff]/80 hover:bg-[#0d99ff] rounded-t transition-all" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        );

      case 'data_table':
      case 'table':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} w-full overflow-x-auto border border-zinc-800 rounded-lg`}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-800/60 text-zinc-400 border-b border-zinc-800">
                  {(props.columns || ['ID', 'Nombre', 'Estado', 'Acción']).map((col: string, i: number) => (
                    <th key={i} className="p-2 font-medium">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {(props.rows || [
                  ['1', 'Relé 1', 'Activo', 'ON'],
                  ['2', 'LED Builtin', 'Inactivo', 'OFF'],
                ]).map((row: string[], ri: number) => (
                  <tr key={ri} className="hover:bg-zinc-800/30">
                    {row.map((cell: string, ci: number) => (
                      <td key={ci} className="p-2">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'devices':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} border-4 border-zinc-700 rounded-3xl p-3 bg-zinc-950 w-full max-w-[260px] mx-auto`}>
            <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-3" />
            {renderChildren()}
          </div>
        );

      case 'lists':
      case 'list_group':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} border border-zinc-800 rounded-lg overflow-hidden divide-y divide-zinc-800 w-full text-xs text-zinc-300`}>
            {(props.items || ['Elemento 1', 'Elemento 2', 'Elemento 3']).map((item: string, i: number) => (
              <div key={i} className="p-2.5 hover:bg-zinc-800/40 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0d99ff]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        );

      case 'legend_indicator':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} inline-flex items-center gap-1.5 text-xs text-zinc-300`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{props.label || 'Sistema Operativo'}</span>
          </div>
        );

      case 'ratings':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} inline-flex gap-1 text-amber-400`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
            ))}
          </div>
        );

      case 'spinner':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} inline-block animate-spin text-[#0d99ff]`}>
            <Zap className="w-5 h-5" />
          </div>
        );

      case 'styled_icon': {
        const effectiveSize = props.size || 20;
        const iconIdentifier = props.iconName || props.svgId || props.iconId || 'lucide:zap';
        return (
          <div
            id={node.id}
            onClick={handleClick}
            className={`${selectionClasses} inline-flex items-center justify-center`}
            style={{
              width: style.width || '40px',
              height: style.height || '40px',
              borderRadius: style.borderRadius || '10px',
              backgroundColor: style.backgroundColor || 'rgba(13, 153, 255, 0.15)',
              color: style.color || '#0d99ff',
              border: style.border || '1px solid rgba(13, 153, 255, 0.3)',
              ...style,
            }}
          >
            <SvgIconRenderer
              iconId={iconIdentifier}
              rawSvg={props.svgContent}
              size={effectiveSize}
              stroke={style.color || '#0d99ff'}
              fill={style.fill || props.fill || 'none'}
            />
          </div>
        );
      }

      case 'timeline':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} border-l-2 border-zinc-800 pl-3 space-y-3 text-xs`}>
            {(props.steps || [{ title: 'Inicio', time: '12:00' }, { title: 'Completado', time: '12:05' }]).map((st: any, i: number) => (
              <div key={i} className="relative">
                <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-[#0d99ff]" />
                <div className="font-medium text-white">{st.title}</div>
                <div className="text-[10px] text-zinc-500">{st.time}</div>
              </div>
            ))}
          </div>
        );

      case 'tree_view':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} space-y-1 font-mono text-xs text-zinc-400`}>
            {(props.nodes || ['📁 app', '  📄 page.tsx', '  📄 layout.tsx']).map((n: string, i: number) => (
              <div key={i}>{n}</div>
            ))}
          </div>
        );

      case 'marquee':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} overflow-hidden whitespace-nowrap bg-zinc-900 border-y border-zinc-800 py-1.5 text-xs text-sky-400 font-medium`}>
            <span className="inline-block animate-marquee">{props.text || '⚡ VisualForge Studio • Frameworks & HTML/ESP32 Ready'}</span>
          </div>
        );

      // ==========================================
      // 4. FEEDBACK & ALERTS
      // ==========================================
      case 'alert':
      case 'alert_dialog':
        return (
          <div
            id={node.id}
            style={style}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`${selectionClasses} ${dropClasses} p-3 rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-300 text-xs w-full`}
          >
            {node.children && node.children.length > 0 ? (
              renderChildren()
            ) : (
              <>
                <div className="font-semibold">{props.title || 'Aviso del Sistema'}</div>
                <div className="text-sky-400/80 mt-0.5">{props.description || props.text || 'Operación completada con éxito.'}</div>
              </>
            )}
          </div>
        );

      case 'progress':
        return (
          <div id={node.id} style={style} onClick={handleClick} className={`${selectionClasses} w-full bg-zinc-800 h-2 rounded-full overflow-hidden`}>
            <div className="bg-[#0d99ff] h-full rounded-full transition-all" style={{ width: `${props.value || 60}%` }} />
          </div>
        );

      case 'sonner_toast':
      case 'toast':
        return (
          <div id={node.id} style={style} onClick={handleClick} className={`${selectionClasses} p-3 rounded-lg border border-zinc-700 bg-zinc-900 text-xs text-white shadow-xl flex items-center justify-between w-full`}>
            <span>{props.title || props.text || 'Notificación Toast'}</span>
            <span className="text-[10px] text-zinc-500">Ahora</span>
          </div>
        );

      // ==========================================
      // 5. NAVIGATION & OVERLAYS
      // ==========================================
      case 'accordion':
        return (
          <div id={node.id} style={style} onClick={handleClick} className={`${selectionClasses} w-full divide-y divide-zinc-800 border-y border-zinc-800`}>
            {(props.items || [
              { title: 'Sección 1', content: 'Contenido detallado de la primera sección.' },
              { title: 'Sección 2', content: 'Contenido adicional para la segunda sección.' },
            ]).map((item: any, i: number) => {
              const isOpen = accordionOpen[i];
              return (
                <div key={i} className="py-2">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setAccordionOpen((prev) => ({ ...prev, [i]: !prev[i] }));
                    }}
                    className="flex justify-between items-center text-xs font-medium text-zinc-200 cursor-pointer"
                  >
                    <span>{item.title}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isOpen && <p className="text-xs text-zinc-400 mt-1.5">{item.content}</p>}
                </div>
              );
            })}
          </div>
        );

      case 'navbar':
      case 'mega_menu':
        return (
          <header
            id={node.id}
            style={style}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`${selectionClasses} ${dropClasses} flex items-center justify-between w-full`}
          >
            {node.children && node.children.length > 0 ? (
              renderChildren()
            ) : (
              <>
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0d99ff]" />
                  {props.brand || 'VisualForge'}
                </div>
                <nav className="flex items-center gap-4 text-xs text-zinc-300">
                  {(props.links || [{ label: 'Inicio', href: '#' }, { label: 'Panel', href: '#' }]).map((l: any, i: number) => (
                    <a key={i} href={l.href} className="hover:text-white">{l.label}</a>
                  ))}
                </nav>
                <div className="flex items-center gap-2">{renderChildren()}</div>
              </>
            )}
          </header>
        );

      case 'tabs':
      case 'nav_tabs':
      case 'navs':
        return (
          <div id={node.id} style={style} onClick={handleClick} className={`${selectionClasses} flex gap-1 border-b border-zinc-800 pb-1 w-full`}>
            {(props.tabs || props.items || ['Tab 1', 'Tab 2', 'Tab 3']).map((tab: string, i: number) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTabIdx(i);
                }}
                className={`px-3 py-1 rounded text-xs font-medium ${
                  activeTabIdx === i ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        );

      case 'breadcrumb':
        return (
          <div id={node.id} style={style} onClick={handleClick} className={`${selectionClasses} flex items-center gap-1.5 text-xs text-zinc-400`}>
            {(props.items || ['Inicio', 'Dispositivos', 'Control']).map((item: string, i: number, arr: any[]) => (
              <React.Fragment key={i}>
                <span className={i === arr.length - 1 ? 'text-white font-medium' : 'hover:underline cursor-pointer'}>{item}</span>
                {i < arr.length - 1 && <span>/</span>}
              </React.Fragment>
            ))}
          </div>
        );

      case 'pagination':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} flex items-center gap-1 text-xs text-zinc-300`}>
            <button className="px-2 py-1 rounded bg-zinc-800 text-zinc-400">«</button>
            <button className="px-2.5 py-1 rounded bg-[#0d99ff] text-white font-bold">1</button>
            <button className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300">2</button>
            <button className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300">3</button>
            <button className="px-2 py-1 rounded bg-zinc-800 text-zinc-400">»</button>
          </div>
        );

      case 'stepper':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} flex items-center justify-between w-full text-xs`}>
            {(props.steps || ['Paso 1', 'Paso 2', 'Paso 3']).map((s: string, i: number) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  i === 0 ? 'bg-[#0d99ff] text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {i + 1}
                </span>
                <span className={i === 0 ? 'text-white font-medium' : 'text-zinc-500'}>{s}</span>
              </div>
            ))}
          </div>
        );

      case 'command':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 w-full`}>
            <Search className="w-3.5 h-3.5" />
            <span className="flex-1">Escribe un comando o busca...</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 font-mono text-[10px] text-zinc-300">⌘K</span>
          </div>
        );

      case 'dropdown':
      case 'dropdown_menu':
      case 'context_menu':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} p-1 rounded-lg border border-zinc-800 bg-zinc-900 w-fit space-y-0.5 text-xs text-zinc-300`}>
            {(props.items || ['Perfil', 'Configuración', 'Cerrar sesión']).map((it: string, i: number) => (
              <div key={i} className="px-2.5 py-1 rounded hover:bg-zinc-800 cursor-pointer">{it}</div>
            ))}
          </div>
        );

      case 'dialog':
      case 'modal':
      case 'drawer':
      case 'sheet':
      case 'offcanvas':
        return (
          <div id={node.id} style={style} onClick={handleClick} onDragOver={handleDragOver} onDrop={handleDrop} className={`${selectionClasses} ${dropClasses} border border-zinc-800 rounded-xl p-4 bg-zinc-900 shadow-2xl w-full`}>
            {node.children && node.children.length > 0 ? (
              renderChildren()
            ) : (
              <>
                <div className="font-semibold text-sm text-white mb-1">{props.title || 'Ventana Modal'}</div>
                <div className="text-xs text-zinc-400 mb-3">{props.subtitle || props.description || 'Contenido overlay.'}</div>
                {renderChildren()}
              </>
            )}
          </div>
        );

      case 'hover_card':
      case 'popover':
      case 'tooltip':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-300 w-fit shadow-lg`}>
            <div className="font-semibold text-white">{props.title || 'Información'}</div>
            <div className="text-zinc-400 text-[11px] mt-0.5">{props.text || props.content || 'Detalle emergente.'}</div>
          </div>
        );

      case 'menubar':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} flex items-center gap-3 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 w-full`}>
            {(props.menus || ['Archivo', 'Editar', 'Ver', 'Ayuda']).map((m: string, i: number) => (
              <span key={i} className="hover:text-white cursor-pointer px-1.5 py-0.5 rounded hover:bg-zinc-800">{m}</span>
            ))}
          </div>
        );

      case 'sidebar':
        return (
          <div id={node.id} style={style} onClick={handleClick} onDragOver={handleDragOver} onDrop={handleDrop} className={`${selectionClasses} ${dropClasses} border-r border-zinc-800 p-3 bg-zinc-900 flex flex-col gap-2`}>
            <div className="font-bold text-xs text-white mb-2">{props.title || 'Sidebar'}</div>
            {renderChildren()}
          </div>
        );

      // ==========================================
      // 6. CONTENT & MEDIA
      // ==========================================
      case 'typography':
      case 'text': {
        const asTag = props.as || 'p';
        const isSubtitle = asTag === 'subtitle';
        const isLabel = asTag === 'label';
        const Tag = isSubtitle ? 'p' : isLabel ? 'label' : (asTag as any);

        let defaultClass = 'text-zinc-200';
        if (asTag === 'h1') defaultClass = 'text-3xl font-bold tracking-tight text-white';
        else if (asTag === 'h2') defaultClass = 'text-2xl font-bold tracking-tight text-zinc-100';
        else if (asTag === 'h3') defaultClass = 'text-xl font-semibold text-zinc-100';
        else if (asTag === 'h4') defaultClass = 'text-lg font-semibold text-zinc-200';
        else if (asTag === 'h5') defaultClass = 'text-base font-semibold text-zinc-200';
        else if (asTag === 'h6') defaultClass = 'text-sm font-semibold text-zinc-300 uppercase tracking-wider';
        else if (isSubtitle) defaultClass = 'text-base text-zinc-400 font-medium';
        else if (isLabel) defaultClass = 'text-xs font-medium text-zinc-300 block mb-1';
        else if (asTag === 'blockquote') defaultClass = 'italic border-l-4 border-blue-500 pl-3 text-zinc-300 my-2';
        else if (asTag === 'code') defaultClass = 'font-mono text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-amber-300';
        else if (asTag === 'span') defaultClass = 'inline text-zinc-300';
        else defaultClass = 'text-sm text-zinc-300 leading-relaxed';

        return (
          <Tag
            id={node.id}
            style={{
              ...style,
              fontStyle: style.fontStyle || (asTag === 'blockquote' ? 'italic' : undefined),
            }}
            onClick={handleClick}
            className={`${selectionClasses} ${defaultClass}`}
          >
            {props.text || (typeof asTag === 'string' && asTag.startsWith('h') ? `Encabezado ${asTag.toUpperCase()}` : 'Texto tipográfico')}
            {renderChildren()}
          </Tag>
        );
      }

      case 'link': {
        const variant = props.variant || 'link';
        const size = props.size || 'md';
        const disabled = Boolean(props.disabled);
        let variantClasses = 'text-[#0d99ff] hover:underline';
        if (variant === 'primary') {
          variantClasses = 'bg-[#0d99ff] hover:bg-blue-600 text-white px-3 py-1.5 rounded-md no-underline';
        } else if (variant === 'secondary') {
          variantClasses = 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded-md no-underline';
        } else if (variant === 'outline') {
          variantClasses = 'border border-zinc-600 hover:bg-zinc-800 text-zinc-200 px-3 py-1.5 rounded-md no-underline';
        } else if (variant === 'ghost') {
          variantClasses = 'hover:bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-md no-underline';
        }

        let sizeClasses = 'text-xs';
        let iconSize = 14;
        if (size === 'sm') {
          sizeClasses = 'text-[11px]';
          iconSize = 12;
        } else if (size === 'lg') {
          sizeClasses = 'text-sm';
          iconSize = 16;
        }

        const iconPosition = props.iconPosition || 'right';
        const hasIcon = Boolean(props.iconName);

        return (
          <a
            id={node.id}
            href={disabled ? undefined : (props.href || '#')}
            target={props.target || '_self'}
            style={style}
            onClick={(e) => {
              if (!isPreviewMode) e.preventDefault();
              handleClick(e);
            }}
            className={`${selectionClasses} inline-flex items-center gap-1.5 transition-colors ${variantClasses} ${sizeClasses} ${
              disabled ? 'opacity-50 pointer-events-none cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {hasIcon && iconPosition === 'left' && (
              <SvgIconRenderer iconId={props.iconName} size={iconSize} stroke="currentColor" fill="none" />
            )}
            <span>{props.label || 'Enlace interactivo'}</span>
            {hasIcon && iconPosition === 'right' && (
              <SvgIconRenderer iconId={props.iconName} size={iconSize} stroke="currentColor" fill="none" />
            )}
          </a>
        );
      }

      case 'image': {
        const aspectRatio = style.aspectRatio || props.aspectRatio || 'auto';
        const objectFit = style.objectFit || props.objectFit || 'cover';
        const loading = props.loading || 'lazy';
        const fallbackSrc = props.fallbackSrc || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80';

        return (
          <div
            id={node.id}
            onClick={handleClick}
            className={`${selectionClasses} overflow-hidden w-full`}
            style={{
              ...style,
              aspectRatio,
            }}
          >
            <img
              src={props.src || fallbackSrc}
              alt={props.alt || ''}
              loading={loading}
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== fallbackSrc) {
                  target.src = fallbackSrc;
                }
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: objectFit as any,
                display: 'block',
              }}
              className="pointer-events-none"
            />
          </div>
        );
      }

      case 'kbd':
        return (
          <kbd id={node.id} style={style} onClick={handleClick} className={`${selectionClasses} font-mono text-[10px]`}>
            {props.keys || '⌘K'}
          </kbd>
        );

      case 'svg_icon':
      case 'fontawesome_icon': {
        const rawSize = props.size || style.fontSize || style.width || 24;
        const effectiveSize =
          typeof rawSize === 'number'
            ? rawSize
            : parseInt(rawSize.toString().replace('px', '')) || 24;
        const iconIdentifier = props.iconName || props.svgId || props.iconId || 'lucide:rocket';

        return (
          <div
            id={node.id}
            onClick={handleClick}
            className={`${selectionClasses} inline-flex items-center justify-center`}
            style={{
              ...style,
              width: `${effectiveSize}px`,
              height: `${effectiveSize}px`,
            }}
          >
            <SvgIconRenderer
              iconId={iconIdentifier}
              rawSvg={props.svgContent}
              size={effectiveSize}
              width={effectiveSize}
              height={effectiveSize}
              stroke={style.color || style.stroke || '#0d99ff'}
              fill={style.fill || props.fill || 'none'}
            />
          </div>
        );
      }

      default:
        return (
          <div id={node.id} style={style} onClick={handleClick} onDragOver={handleDragOver} onDrop={handleDrop} className={`${selectionClasses} ${dropClasses}`}>
            {props.label || node.name || node.type}
            {renderChildren()}
          </div>
        );
    }
  };

  if (isPreviewMode) {
    return renderComponentBody();
  }

  const isInline =
    node.style?.display === 'block'
      ? false
      : node.style?.display === 'inline-flex' ||
        node.style?.display === 'inline-block' ||
        node.style?.display === 'inline' ||
        node.type === 'button' ||
        node.type === 'link' ||
        node.type === 'badge' ||
        node.type === 'svg_icon' ||
        node.type === 'fontawesome_icon' ||
        node.type === 'styled_icon' ||
        node.type === 'link' ||
        node.type === 'kbd' ||
        node.type === 'legend_indicator';

  return (
    <div
      data-canvas-node-id={node.id}
      data-is-container={node.isContainer ? 'true' : 'false'}
      draggable={!isHandMode && !node.locked}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      style={{
        ...(node.style?.marginTop ? { marginTop: node.style.marginTop } : {}),
        ...(node.style?.marginRight ? { marginRight: node.style.marginRight } : {}),
        ...(node.style?.marginBottom ? { marginBottom: node.style.marginBottom } : {}),
        ...(node.style?.marginLeft ? { marginLeft: node.style.marginLeft } : {}),
        ...(node.style?.margin ? { margin: node.style.margin } : {}),
        ...(node.style?.width && node.style.width !== '100%' ? { width: node.style.width } : {}),
        ...(node.style?.maxWidth ? { maxWidth: node.style.maxWidth } : {}),
        ...(node.style?.minWidth ? { minWidth: node.style.minWidth } : {}),
        ...(node.style?.flex ? { flex: node.style.flex } : {}),
      }}
      className={`relative group/node transition-all duration-75 ${
        isSelfDragging ? 'opacity-30 scale-[0.98]' : ''
      } ${
        !isHandMode && !node.locked ? 'cursor-grab active:cursor-grabbing' : ''
      } ${
        isInline ? 'inline-block align-top' : 'w-full'
      } ${
        isSelected
          ? 'ring-2 ring-[#0d99ff] ring-offset-1 ring-offset-[#1e1e1e] z-30'
          : isPlacementMode
          ? 'hover:ring-2 hover:ring-[#0d99ff] hover:bg-[#0d99ff]/10 cursor-pointer'
          : !isHandMode
          ? 'hover:ring-1 hover:ring-[#0d99ff]/50'
          : ''
      }`}
    >
      {/* Data Binding IoT Badge if active (Only in ESP32 projects) */}
      {!isPreviewMode && projectType === 'esp32' && props.dataBinding?.enabled && (
        <div className="absolute -top-7 right-0 z-40 bg-blue-950/90 text-blue-300 border border-blue-500/40 rounded px-1.5 py-0.5 text-[9px] font-mono flex items-center gap-1 shadow-md pointer-events-none">
          <Zap className="w-2.5 h-2.5 text-amber-400" />
          <span>{props.dataBinding.dataSource?.toUpperCase() || 'DATA'}: {props.dataBinding.topic || props.dataBinding.gpioPin || 'bound'}</span>
        </div>
      )}
      {/* Top Figma Pill with Move Handle & Element Name */}
      {isSelected && (
        <div
          draggable={!node.locked}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onClick={(e) => e.stopPropagation()}
          className="absolute -top-6 left-0 z-50 flex items-center gap-1.5 px-2 py-0.5 bg-[#0d99ff] text-white text-[10px] font-medium rounded-t-sm shadow-md cursor-grab active:cursor-grabbing select-none whitespace-nowrap"
          title="Arrastra para mover este componente dentro del lienzo"
        >
          <GripVertical className="w-3 h-3 text-white/90" />
          <span className="font-sans font-semibold tracking-wide max-w-[160px] truncate">
            {node.name || node.type}
          </span>
        </div>
      )}

      {/* Before Drop Guideline Indicator (Magenta Neon Line with Circular End Knobs) */}
      {isDropTarget && dropPosition === 'before' && (
        <div className="absolute -top-1.5 left-0 right-0 h-1 bg-[#d946ef] z-50 rounded-full shadow-[0_0_10px_#d946ef] pointer-events-none flex items-center justify-between">
          <span className="size-2.5 rounded-full bg-[#d946ef] -ml-1 border-2 border-[#1e1e1e]" />
          <span className="size-2.5 rounded-full bg-[#d946ef] -mr-1 border-2 border-[#1e1e1e]" />
        </div>
      )}

      {/* After Drop Guideline Indicator (Magenta Neon Line with Circular End Knobs) */}
      {isDropTarget && dropPosition === 'after' && (
        <div className="absolute -bottom-1.5 left-0 right-0 h-1 bg-[#d946ef] z-50 rounded-full shadow-[0_0_10px_#d946ef] pointer-events-none flex items-center justify-between">
          <span className="size-2.5 rounded-full bg-[#d946ef] -ml-1 border-2 border-[#1e1e1e]" />
          <span className="size-2.5 rounded-full bg-[#d946ef] -mr-1 border-2 border-[#1e1e1e]" />
        </div>
      )}

      {/* Inside Container Drop Indicator */}
      {isDropTarget && dropPosition === 'inside' && (
        <div className="absolute inset-0 ring-2 ring-violet-500 bg-violet-500/15 rounded-lg pointer-events-none z-30 flex items-center justify-center">
          <span className="bg-violet-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-md border border-violet-400/40">
            Soltar dentro de {node.name || node.type}
          </span>
        </div>
      )}

      {renderComponentBody()}
    </div>
  );
};
