import React, { useState } from 'react';
import { CanvasNode, DropPosition, ProjectType } from '../types';
import { SvgIconRenderer } from '../utils/svgIconRenderer';
import {
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
} from 'lucide-react';

interface NodeRendererProps {
  node: CanvasNode;
  projectType?: ProjectType;
  selectedId: string | null;
  onSelectNode: (id: string, e: React.MouseEvent) => void;
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

  const isSelected = selectedId === node.id && !isPreviewMode;
  const isDropTarget = dropTargetId === node.id && !isPreviewMode && draggedNodeId !== node.id;

  const style = node.style || {};
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
    if (!isPreviewMode) {
      e.stopPropagation();
      onSelectNode(node.id, e);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (isPreviewMode || node.locked) {
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
    if (!isPreviewMode) {
      e.stopPropagation();
      e.preventDefault();
      onDragOverNode(e, node.id);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isPreviewMode) {
      e.stopPropagation();
      e.preventDefault();
      onDropNode(e, node.id);
    }
  };

  const selectionClasses = isSelected ? 'relative' : '';
  const dropClasses = '';

  const renderChildren = () => {
    if (!node.children || node.children.length === 0) {
      if (node.isContainer && !isPreviewMode) {
        return (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="w-full py-4 border border-dashed border-zinc-700/80 hover:border-violet-500/80 rounded-md flex items-center justify-center text-zinc-500 hover:text-violet-400 text-xs select-none transition-colors"
          >
            Arrastra componentes aquí
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
      case 'stack':
      case 'columns':
      case 'layout_splitter':
      case 'custom_scrollbar':
      case 'form':
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
      case 'button':
        return (
          <button
            id={node.id}
            style={style}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`${selectionClasses} ${dropClasses} transition-all active:scale-[0.98] ${
              isFramework
                ? 'rounded-md font-medium text-xs shadow-xs'
                : 'rounded-lg font-semibold text-xs shadow-sm'
            }`}
          >
            {props.label || 'Button'}
            {props.gpio?.enabled && (
              <span className="ml-1.5 px-1 py-0.2 rounded bg-black/30 text-[9px] font-mono text-emerald-300">
                GPIO {props.gpio.pin}
              </span>
            )}
            {renderChildren()}
          </button>
        );

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

      case 'input':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} space-y-1 w-full`}>
            {props.label && (
              <label className="block text-xs font-medium text-zinc-300">{props.label}</label>
            )}
            <input
              type={props.type || 'text'}
              placeholder={props.placeholder || ''}
              disabled={!isPreviewMode}
              style={style}
              className={`w-full focus:outline-none focus:ring-1 focus:ring-[#0d99ff] ${
                isFramework
                  ? 'bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-white'
                  : 'bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white'
              }`}
            />
          </div>
        );

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
          <label id={node.id} style={style} onClick={handleClick} className={`${selectionClasses} text-xs font-medium text-zinc-300 block`}>
            {props.text || 'Etiqueta de formulario'}
          </label>
        );

      case 'checkbox':
        return (
          <div
            id={node.id}
            style={style}
            onClick={(e) => {
              handleClick(e);
              if (isPreviewMode) setCheckboxChecked(!checkboxChecked);
            }}
            className={`${selectionClasses} inline-flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-300`}
          >
            <div
              className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                checkboxChecked
                  ? 'bg-[#0d99ff] border-[#0d99ff] text-white'
                  : 'border-zinc-600 bg-zinc-800'
              }`}
            >
              {checkboxChecked && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span>{props.label || 'Checkbox'}</span>
          </div>
        );

      case 'radio':
      case 'radio_group':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} space-y-1.5`}>
            {(props.options || ['Opción 1', 'Opción 2']).map((opt: string, i: number) => (
              <label key={i} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="radio"
                  name={`radio_${node.id}`}
                  defaultChecked={i === 0}
                  className="accent-[#0d99ff]"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );

      case 'select':
      case 'advanced_select':
      case 'combobox':
      case 'searchbox':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} space-y-1 w-full`}>
            {props.label && (
              <label className="block text-xs font-medium text-zinc-400">{props.label}</label>
            )}
            <div className="relative">
              <select
                disabled={!isPreviewMode}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none appearance-none pr-8 cursor-pointer"
              >
                {(props.options || ['Opción 1', 'Opción 2', 'Opción 3']).map((o: string, idx: number) => (
                  <option key={idx} value={o} className="bg-zinc-900">
                    {o}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        );

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

      case 'textarea':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} space-y-1 w-full`}>
            {props.label && (
              <label className="block text-xs font-medium text-zinc-300">{props.label}</label>
            )}
            <textarea
              placeholder={props.placeholder || ''}
              disabled={!isPreviewMode}
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white focus:outline-none"
            />
          </div>
        );

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
            {props.title && (
              <div className="border-b border-zinc-800 pb-2 mb-2">
                <h4 className="font-semibold text-zinc-100 text-sm">{props.title}</h4>
                {props.subtitle && <p className="text-zinc-400 text-xs">{props.subtitle}</p>}
              </div>
            )}
            {renderChildren()}
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

      case 'styled_icon':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400`}>
            <Sparkles className="w-4 h-4" />
          </div>
        );

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
          <div id={node.id} style={style} onClick={handleClick} className={`${selectionClasses} p-3 rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-300 text-xs w-full`}>
            <div className="font-semibold">{props.title || 'Aviso del Sistema'}</div>
            <div className="text-sky-400/80 mt-0.5">{props.description || props.text || 'Operación completada con éxito.'}</div>
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
          <header id={node.id} style={style} onClick={handleClick} onDragOver={handleDragOver} onDrop={handleDrop} className={`${selectionClasses} ${dropClasses} flex items-center justify-between`}>
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
            <div className="font-semibold text-sm text-white mb-1">{props.title || 'Ventana Modal'}</div>
            <div className="text-xs text-zinc-400 mb-3">{props.subtitle || props.description || 'Contenido overlay.'}</div>
            {renderChildren()}
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
        const Tag = props.as || 'p';
        return (
          <Tag id={node.id} style={style} onClick={handleClick} className={`${selectionClasses}`}>
            {props.text || 'Texto semántico'}
          </Tag>
        );

      case 'link':
        return (
          <a id={node.id} href={props.href || '#'} style={style} onClick={handleClick} className={`${selectionClasses} hover:underline`}>
            {props.label || 'Enlace'}
          </a>
        );

      case 'image':
        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} inline-block overflow-hidden`}>
            <img src={props.src} alt={props.alt || ''} style={style} className="pointer-events-none" />
          </div>
        );

      case 'kbd':
        return (
          <kbd id={node.id} style={style} onClick={handleClick} className={`${selectionClasses} font-mono text-[10px]`}>
            {props.keys || '⌘K'}
          </kbd>
        );

      case 'svg_icon':
      case 'fontawesome_icon': {
        const effectiveSize = props.size || style.fontSize || style.width || 24;
        const iconIdentifier = props.iconName || props.svgId || props.iconId || 'lucide:rocket';

        return (
          <div id={node.id} onClick={handleClick} className={`${selectionClasses} inline-flex items-center justify-center`} style={style}>
            <SvgIconRenderer
              iconId={iconIdentifier}
              rawSvg={props.svgContent}
              size={effectiveSize}
              stroke={style.color || style.stroke || '#0d99ff'}
              fill={style.fill || 'none'}
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
    node.style?.display === 'inline-flex' ||
    node.style?.display === 'inline-block' ||
    node.type === 'button' ||
    node.type === 'badge' ||
    node.type === 'svg_icon' ||
    node.type === 'fontawesome_icon' ||
    node.type === 'link' ||
    node.type === 'kbd' ||
    node.type === 'legend_indicator';

  return (
    <div
      data-canvas-node-id={node.id}
      data-is-container={node.isContainer ? 'true' : 'false'}
      draggable={!node.locked}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      style={{
        ...(node.style?.width && node.style.width !== '100%' ? { width: node.style.width } : {}),
        ...(node.style?.maxWidth ? { maxWidth: node.style.maxWidth } : {}),
        ...(node.style?.flex ? { flex: node.style.flex } : {}),
      }}
      className={`relative group/node transition-all duration-75 ${
        isSelfDragging ? 'opacity-30 scale-[0.98]' : ''
      } ${
        !node.locked ? 'cursor-grab active:cursor-grabbing' : ''
      } ${
        isInline ? 'inline-block align-top' : 'w-full'
      } ${
        isSelected
          ? 'ring-2 ring-[#0d99ff] ring-offset-1 ring-offset-[#1e1e1e] z-30'
          : 'hover:ring-1 hover:ring-[#0d99ff]/50'
      }`}
    >
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
