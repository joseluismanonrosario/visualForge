import React, { useState } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Maximize2,
  Minimize2,
  Square,
  Sparkles,
  Type,
  Palette,
  Sliders,
  PanelRightClose,
  PanelRightOpen,
  Copy,
  Check,
  ChevronDown,
  Layers,
  ArrowRight,
  ArrowDown,
  Rows3,
  Columns3,
  Star,
  Search,
  X,
} from 'lucide-react';
import { CanvasNode, ProjectType } from '../types';
import {
  ICON_LIBRARIES,
  getLibrariesForWorkflow,
  getLibraryById,
} from '../data/iconLibraries';
import { copyToClipboardSafe } from '../utils/exportEngine';
import { SvgIconRenderer, findCatalogIcon } from '../utils/svgIconRenderer';

interface RightSidebarProps {
  selectedNode: CanvasNode | null;
  projectType: ProjectType;
  onUpdateStyle: (styleUpdates: Record<string, any>) => void;
  onUpdateProps: (propUpdates: Record<string, any>) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedNode,
  projectType,
  onUpdateStyle,
  onUpdateProps,
  isOpen,
  setIsOpen,
}) => {
  const [activeTab, setActiveTab] = useState<'design' | 'inspect'>('design');
  const [showIconModal, setShowIconModal] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const [copiedCss, setCopiedCss] = useState(false);

  // Available icon libraries based on active project type
  const availableLibraries = getLibrariesForWorkflow(projectType);

  // Active library state
  const activeLibId =
    selectedNode?.props?.library ||
    availableLibraries[0]?.id ||
    'fontawesome';

  const [modalLibId, setModalLibId] = useState<string>(activeLibId);
  const currentLib = getLibraryById(showIconModal ? modalLibId : activeLibId);

  // Active style for the modal (defaults to library's first style)
  const [modalStylePrefix, setModalStylePrefix] = useState<string>(
    currentLib.styles[0]?.prefix || 'fas'
  );

  const handleLibraryChange = (newLibId: string) => {
    const newLib = getLibraryById(newLibId);
    const defaultPrefix = newLib.styles[0]?.prefix || '';
    const defaultIcon = newLib.icons[0]?.class || '';
    onUpdateProps({
      library: newLibId,
      prefix: defaultPrefix,
      iconName: defaultIcon,
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-14 z-20 bg-[#2c2c2c] hover:bg-[#383838] border border-r-0 border-[#383838] p-1.5 rounded-l-lg text-zinc-300 shadow-md flex items-center gap-1 text-[11px] font-medium"
        title="Open Design Panel"
      >
        <PanelRightOpen className="w-4 h-4 text-[#0d99ff]" />
        <span className="vertical-text py-1">Design</span>
      </button>
    );
  }

  if (!selectedNode) {
    return (
      <aside className="w-80 bg-[#252526] border-l border-[#383838] flex flex-col h-[calc(100vh-44px)] select-none z-20 flex-shrink-0 text-xs text-zinc-400">
        <div className="h-10 border-b border-[#383838] flex items-center justify-between px-3 bg-[#2c2c2c]">
          <span className="font-semibold text-zinc-200">Design</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-[#383838] rounded text-zinc-400 hover:text-white"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-500">
          <Layers className="w-8 h-8 mb-3 opacity-30 text-zinc-400" />
          <p className="font-medium text-zinc-300 mb-1">No element selected</p>
          <p className="text-[11px]">Select any component in the canvas or layers to inspect and style it.</p>
        </div>
      </aside>
    );
  }

  const style = selectedNode.style || {};
  const props = selectedNode.props || {};

  // Quick 3x3 Auto-Layout matrix mapping
  const matrixPositions = [
    { label: 'Top-Left', align: 'flex-start', justify: 'flex-start' },
    { label: 'Top-Center', align: 'center', justify: 'flex-start' },
    { label: 'Top-Right', align: 'flex-end', justify: 'flex-start' },
    { label: 'Center-Left', align: 'flex-start', justify: 'center' },
    { label: 'Center-Center', align: 'center', justify: 'center' },
    { label: 'Center-Right', align: 'flex-end', justify: 'center' },
    { label: 'Bottom-Left', align: 'flex-start', justify: 'flex-end' },
    { label: 'Bottom-Center', align: 'center', justify: 'flex-end' },
    { label: 'Bottom-Right', align: 'flex-end', justify: 'flex-end' },
  ];

  const currentAlign = style.alignItems || 'flex-start';
  const currentJustify = style.justifyContent || 'flex-start';

  const handleQuickAlign = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    switch (type) {
      case 'left':
        onUpdateStyle({ alignItems: 'flex-start' });
        break;
      case 'center':
        onUpdateStyle({ alignItems: 'center' });
        break;
      case 'right':
        onUpdateStyle({ alignItems: 'flex-end' });
        break;
      case 'top':
        onUpdateStyle({ justifyContent: 'flex-start' });
        break;
      case 'middle':
        onUpdateStyle({ justifyContent: 'center' });
        break;
      case 'bottom':
        onUpdateStyle({ justifyContent: 'flex-end' });
        break;
    }
  };

  // Filter icons for active library in modal
  const filteredModalIcons = currentLib.icons.filter((item) => {
    const q = iconSearch.toLowerCase();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.class.toLowerCase().includes(q) ||
      item.tags?.some((t) => t.toLowerCase().includes(q));
    return matchesSearch;
  });

  return (
    <aside className="w-80 bg-[#252526] border-l border-[#383838] flex flex-col h-[calc(100vh-44px)] select-none z-20 flex-shrink-0 text-xs text-zinc-300">
      {/* Header Tabs */}
      <div className="h-10 border-b border-[#383838] flex items-center justify-between px-3 bg-[#2c2c2c]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('design')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              activeTab === 'design'
                ? 'bg-[#1e1e1e] text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Design
          </button>
          <button
            onClick={() => setActiveTab('inspect')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              activeTab === 'inspect'
                ? 'bg-[#1e1e1e] text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Inspect
          </button>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-[#383838] rounded text-zinc-400 hover:text-white"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      {activeTab === 'design' ? (
        <div className="flex-1 overflow-y-auto divide-y divide-[#383838] p-3 space-y-4">
          {/* Quick Alignment Bar */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Alignment
            </span>
            <div className="grid grid-cols-6 gap-1 bg-[#1e1e1e] p-1 rounded-lg border border-[#383838]">
              <button
                onClick={() => handleQuickAlign('left')}
                title="Align Left"
                className="p-1.5 hover:bg-[#323232] rounded flex justify-center text-zinc-400 hover:text-white"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleQuickAlign('center')}
                title="Align Horizontal Center"
                className="p-1.5 hover:bg-[#323232] rounded flex justify-center text-zinc-400 hover:text-white"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleQuickAlign('right')}
                title="Align Right"
                className="p-1.5 hover:bg-[#323232] rounded flex justify-center text-zinc-400 hover:text-white"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleQuickAlign('top')}
                title="Align Top"
                className="p-1.5 hover:bg-[#323232] rounded flex justify-center text-zinc-400 hover:text-white"
              >
                <AlignJustify className="w-3.5 h-3.5 rotate-90" />
              </button>
              <button
                onClick={() => handleQuickAlign('middle')}
                title="Align Vertical Center"
                className="p-1.5 hover:bg-[#323232] rounded flex justify-center text-zinc-400 hover:text-white"
              >
                <AlignCenter className="w-3.5 h-3.5 rotate-90" />
              </button>
              <button
                onClick={() => handleQuickAlign('bottom')}
                title="Align Bottom"
                className="p-1.5 hover:bg-[#323232] rounded flex justify-center text-zinc-400 hover:text-white"
              >
                <AlignJustify className="w-3.5 h-3.5 -rotate-90" />
              </button>
            </div>
          </div>

          {/* Frame & Dimensions */}
          <div className="pt-3 space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Dimensions & Sizing
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1">
                <span className="text-zinc-500 font-mono text-[11px] mr-2">W</span>
                <input
                  type="text"
                  value={style.width || '100%'}
                  onChange={(e) => onUpdateStyle({ width: e.target.value })}
                  className="w-full bg-transparent text-white focus:outline-none text-xs"
                />
              </div>
              <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1">
                <span className="text-zinc-500 font-mono text-[11px] mr-2">H</span>
                <input
                  type="text"
                  value={style.height || 'auto'}
                  onChange={(e) => onUpdateStyle({ height: e.target.value })}
                  className="w-full bg-transparent text-white focus:outline-none text-xs"
                />
              </div>
            </div>

            {/* Sizing constraints: Hug / Fill / Fixed */}
            <div className="flex items-center gap-1 pt-1">
              <button
                onClick={() => onUpdateStyle({ width: 'auto', alignSelf: 'auto' })}
                className="flex-1 py-1 rounded bg-[#1e1e1e] hover:bg-[#323232] border border-[#383838] text-[11px] text-zinc-300 text-center"
              >
                Hug Contents
              </button>
              <button
                onClick={() => onUpdateStyle({ width: '100%', alignSelf: 'stretch' })}
                className="flex-1 py-1 rounded bg-[#1e1e1e] hover:bg-[#323232] border border-[#383838] text-[11px] text-zinc-300 text-center"
              >
                Fill Container
              </button>
            </div>

            {/* Corner Radius */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-zinc-400">Corner Radius</span>
              <div className="w-24 flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1">
                <input
                  type="text"
                  value={style.borderRadius || '0px'}
                  onChange={(e) => onUpdateStyle({ borderRadius: e.target.value })}
                  className="w-full bg-transparent text-white focus:outline-none text-xs text-right"
                />
              </div>
            </div>
          </div>

          {/* Auto-Layout (Flexbox) */}
          <div className="pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Auto-Layout (Flexbox)
              </span>
              <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded p-0.5">
                <button
                  onClick={() => onUpdateStyle({ flexDirection: 'row', display: 'flex' })}
                  title="Horizontal Layout"
                  className={`p-1 rounded ${
                    style.flexDirection === 'row' ? 'bg-[#0d99ff] text-white' : 'text-zinc-400'
                  }`}
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onUpdateStyle({ flexDirection: 'column', display: 'flex' })}
                  title="Vertical Layout"
                  className={`p-1 rounded ${
                    style.flexDirection === 'column' || !style.flexDirection
                      ? 'bg-[#0d99ff] text-white'
                      : 'text-zinc-400'
                  }`}
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 3x3 Matrix Grid & Gap/Padding */}
            <div className="flex items-center gap-4 bg-[#1e1e1e] p-2.5 rounded-lg border border-[#383838]">
              <div className="grid grid-cols-3 gap-1 w-20 h-20 bg-[#282829] p-1 rounded-md border border-[#3e3e42]">
                {matrixPositions.map((pos) => {
                  const isActive =
                    currentAlign === pos.align && currentJustify === pos.justify;
                  return (
                    <button
                      key={pos.label}
                      onClick={() =>
                        onUpdateStyle({
                          alignItems: pos.align,
                          justifyContent: pos.justify,
                        })
                      }
                      title={pos.label}
                      className={`rounded-sm transition-colors ${
                        isActive
                          ? 'bg-[#0d99ff] ring-1 ring-white'
                          : 'bg-[#383838] hover:bg-[#525252]'
                      }`}
                    />
                  );
                })}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-[11px]">Item Gap</span>
                  <input
                    type="text"
                    value={style.gap || '0px'}
                    onChange={(e) => onUpdateStyle({ gap: e.target.value })}
                    className="w-16 bg-[#252526] border border-[#383838] rounded px-1.5 py-0.5 text-right text-white focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-[11px]">Padding</span>
                  <input
                    type="text"
                    value={style.paddingTop || '0px'}
                    onChange={(e) =>
                      onUpdateStyle({
                        paddingTop: e.target.value,
                        paddingRight: e.target.value,
                        paddingBottom: e.target.value,
                        paddingLeft: e.target.value,
                      })
                    }
                    className="w-16 bg-[#252526] border border-[#383838] rounded px-1.5 py-0.5 text-right text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="pt-3 space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Typography
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1">
                <span className="text-zinc-500 text-[11px] mr-1">Size</span>
                <input
                  type="text"
                  value={style.fontSize || '14px'}
                  onChange={(e) => onUpdateStyle({ fontSize: e.target.value })}
                  className="w-full bg-transparent text-white focus:outline-none text-xs text-right"
                />
              </div>
              <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1">
                <span className="text-zinc-500 text-[11px] mr-1">Weight</span>
                <select
                  value={style.fontWeight || '400'}
                  onChange={(e) => onUpdateStyle({ fontWeight: e.target.value })}
                  className="w-full bg-transparent text-white focus:outline-none text-xs"
                >
                  <option value="300" className="bg-[#1e1e1e]">Light (300)</option>
                  <option value="400" className="bg-[#1e1e1e]">Regular (400)</option>
                  <option value="500" className="bg-[#1e1e1e]">Medium (500)</option>
                  <option value="600" className="bg-[#1e1e1e]">Semi-Bold (600)</option>
                  <option value="700" className="bg-[#1e1e1e]">Bold (700)</option>
                  <option value="800" className="bg-[#1e1e1e]">Extra-Bold (800)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fill (Background Color) */}
          <div className="pt-3 space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Fill & Background
            </span>
            <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#383838] rounded-md p-1.5">
              <input
                type="color"
                value={style.backgroundColor?.startsWith('#') ? style.backgroundColor : '#18181b'}
                onChange={(e) => onUpdateStyle({ backgroundColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer border border-[#383838] bg-transparent"
              />
              <input
                type="text"
                value={style.backgroundColor || 'transparent'}
                onChange={(e) => onUpdateStyle({ backgroundColor: e.target.value })}
                className="flex-1 bg-transparent text-white focus:outline-none text-xs font-mono"
              />
              <button
                onClick={() => onUpdateStyle({ backgroundColor: 'transparent' })}
                className="px-2 py-0.5 text-[10px] rounded bg-zinc-800 text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Stroke (Border) */}
          <div className="pt-3 space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Stroke & Border
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1">
                <input
                  type="color"
                  value={style.borderColor?.startsWith('#') ? style.borderColor : '#27272a'}
                  onChange={(e) => onUpdateStyle({ borderColor: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer mr-2 border border-[#383838] bg-transparent"
                />
                <input
                  type="text"
                  value={style.borderColor || 'none'}
                  onChange={(e) => onUpdateStyle({ borderColor: e.target.value })}
                  className="w-full bg-transparent text-white focus:outline-none text-xs font-mono"
                />
              </div>
              <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1">
                <span className="text-zinc-500 text-[11px] mr-1">Width</span>
                <input
                  type="text"
                  value={style.borderWidth || '0px'}
                  onChange={(e) => onUpdateStyle({ borderWidth: e.target.value, borderStyle: 'solid' })}
                  className="w-full bg-transparent text-white focus:outline-none text-xs text-right"
                />
              </div>
            </div>
          </div>

          {/* Component-Specific Properties */}
          <div className="pt-3 space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Component Properties ({selectedNode.type})
            </span>

            {/* If Button or Badge */}
            {(selectedNode.type === 'button' || selectedNode.type === 'badge') && (
              <div className="space-y-1.5">
                <label className="text-zinc-400 text-[11px]">Label Text</label>
                <input
                  type="text"
                  value={props.label || ''}
                  onChange={(e) => onUpdateProps({ label: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 text-white focus:outline-none"
                />
              </div>
            )}

            {/* If Typography */}
            {selectedNode.type === 'typography' && (
              <div className="space-y-1.5">
                <label className="text-zinc-400 text-[11px]">Content Text</label>
                <textarea
                  value={props.text || ''}
                  onChange={(e) => onUpdateProps({ text: e.target.value })}
                  rows={3}
                  className="w-full bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 text-white focus:outline-none resize-none"
                />
              </div>
            )}

            {/* If Image */}
            {selectedNode.type === 'image' && (
              <div className="space-y-1.5">
                <label className="text-zinc-400 text-[11px]">Image URL</label>
                <input
                  type="text"
                  value={props.src || ''}
                  onChange={(e) => onUpdateProps({ src: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 text-white focus:outline-none"
                />
              </div>
            )}

            {/* If Vector Icon Component (Multi-Library Support) */}
            {(selectedNode.type === 'fontawesome_icon' || selectedNode.type === 'svg_icon') && (
              <div className="space-y-3 bg-[#1e1e1e] p-2.5 rounded-lg border border-[#383838]">
                {/* 1. Header with Live Icon Preview and Change Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded bg-[#252526] border border-[#383838] flex items-center justify-center">
                      {currentLib.id === 'lucide' || currentLib.id === 'svg_catalog' || findCatalogIcon(props.iconName) ? (
                        <SvgIconRenderer
                          iconId={props.iconName || 'rocket'}
                          size={20}
                          stroke={style.color || '#0d99ff'}
                          fill={style.fill || 'none'}
                        />
                      ) : currentLib.id === 'material_symbols' ? (
                        <span
                          className={props.prefix || 'material-icons-outlined'}
                          style={{ color: style.color || '#0d99ff', fontSize: '20px' }}
                        >
                          {props.iconName || 'star'}
                        </span>
                      ) : (
                        <i
                          className={`${props.prefix || ''} ${props.iconName || 'fa-star'} text-xl`}
                          style={{ color: style.color || '#0d99ff' }}
                        />
                      )}
                    </div>
                    <div>
                      <span className="font-mono text-zinc-200 block text-xs truncate max-w-[130px]">
                        {props.iconName || 'fa-rocket'}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-sans">
                        {currentLib.name}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setModalLibId(currentLib.id);
                      setModalStylePrefix(props.prefix || currentLib.styles[0]?.prefix || '');
                      setShowIconModal(true);
                    }}
                    className="px-2.5 py-1 rounded bg-[#0d99ff] text-white font-medium hover:bg-[#0082df] text-[11px] shadow-xs"
                  >
                    Explorar
                  </button>
                </div>

                {/* 2. Combobox to select active Icon Library */}
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-medium">Librería de Iconos</label>
                  <select
                    value={currentLib.id}
                    onChange={(e) => handleLibraryChange(e.target.value)}
                    className="w-full bg-[#252526] border border-[#383838] rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-[#0d99ff]"
                  >
                    {availableLibraries.map((lib) => (
                      <option key={lib.id} value={lib.id} className="bg-[#1e1e1e]">
                        {lib.name} ({lib.badge})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Dynamic Styles: ONLY styles that this specific library can change */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Estilos Soportados ({currentLib.name})</span>
                    <span className="text-zinc-500 font-mono">
                      {props.prefix || currentLib.styles[0]?.prefix}
                    </span>
                  </div>

                  {currentLib.styles.length > 1 ? (
                    <div className="flex flex-wrap gap-1 bg-[#252526] p-1 rounded-md border border-[#383838]">
                      {currentLib.styles.map((st) => {
                        const isActive =
                          (props.prefix || currentLib.styles[0]?.prefix) === st.prefix;
                        return (
                          <button
                            key={st.id}
                            onClick={() => onUpdateProps({ prefix: st.prefix })}
                            className={`flex-1 min-w-[70px] py-1 px-1.5 text-[10px] rounded font-medium transition-colors text-center truncate ${
                              isActive
                                ? 'bg-[#0d99ff] text-white shadow-xs'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }`}
                          >
                            {st.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[10px] bg-[#252526] px-2 py-1 rounded border border-[#383838]">
                      <span className="text-zinc-400">Estilo Único:</span>
                      <span className="text-zinc-200 font-medium">
                        {currentLib.styles[0]?.label || 'Estándar'}
                      </span>
                    </div>
                  )}
                </div>

                {/* 4. Dedicated Icon Color & Stroke Control */}
                <div className="space-y-1.5 pt-1 border-t border-[#383838]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400">Color / Trazo (Stroke)</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {style.color || '#0d99ff'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#252526] border border-[#383838] rounded-md p-1.5">
                    <input
                      type="color"
                      value={style.color?.startsWith('#') ? style.color : '#0d99ff'}
                      onChange={(e) => onUpdateStyle({ color: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border border-[#383838] bg-transparent"
                    />
                    <input
                      type="text"
                      value={style.color || '#0d99ff'}
                      onChange={(e) => onUpdateStyle({ color: e.target.value })}
                      className="flex-1 bg-transparent text-white focus:outline-none text-xs font-mono"
                    />
                    <button
                      onClick={() => onUpdateStyle({ color: '#0d99ff' })}
                      className="px-2 py-0.5 text-[10px] rounded bg-zinc-800 text-zinc-400 hover:text-white"
                      title="Reset to default blue"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Preset Color Swatches */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {[
                      { color: '#0d99ff', label: 'Blue' },
                      { color: '#8b5cf6', label: 'Purple' },
                      { color: '#f43f5e', label: 'Pink' },
                      { color: '#10b981', label: 'Emerald' },
                      { color: '#f59e0b', label: 'Amber' },
                      { color: '#ef4444', label: 'Red' },
                      { color: '#ffffff', label: 'White' },
                      { color: '#a1a1aa', label: 'Gray' },
                    ].map((sw) => (
                      <button
                        key={sw.color}
                        onClick={() => onUpdateStyle({ color: sw.color })}
                        style={{ backgroundColor: sw.color }}
                        title={sw.label}
                        className={`w-4 h-4 rounded-full border border-black/40 hover:scale-110 transition-transform ${
                          style.color === sw.color
                            ? 'ring-2 ring-white ring-offset-1 ring-offset-[#252526]'
                            : ''
                        }`}
                      />
                    ))}
                  </div>

                  {/* Relleno (Fill SVG) */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-[10px] text-zinc-400">Relleno SVG (Fill)</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {style.fill || 'none'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#252526] border border-[#383838] rounded-md p-1.5">
                      <input
                        type="color"
                        value={style.fill && style.fill !== 'none' && style.fill.startsWith('#') ? style.fill : '#0d99ff'}
                        onChange={(e) => onUpdateStyle({ fill: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer border border-[#383838] bg-transparent"
                      />
                      <input
                        type="text"
                        value={style.fill || 'none'}
                        onChange={(e) => onUpdateStyle({ fill: e.target.value })}
                        className="flex-1 bg-transparent text-white focus:outline-none text-xs font-mono"
                      />
                      <button
                        onClick={() => onUpdateStyle({ fill: 'none' })}
                        className="px-2 py-0.5 text-[10px] rounded bg-zinc-800 text-zinc-400 hover:text-white"
                        title="Quitar relleno"
                      >
                        None
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5. Size Slider */}
                <div className="space-y-1 pt-1 border-t border-[#383838]">
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Tamaño</span>
                    <span>{props.size || 28}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="80"
                    value={props.size || 28}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onUpdateProps({ size: val });
                      onUpdateStyle({ fontSize: `${val}px` });
                    }}
                    className="w-full accent-[#0d99ff]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Inspect / Code Tab */
        <div className="flex-1 overflow-y-auto p-3 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase font-sans tracking-wider">
              Generated CSS
            </span>
            <button
              onClick={async () => {
                const cssText = Object.entries(style)
                  .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v};`)
                  .join('\n');
                await copyToClipboardSafe(cssText);
                setCopiedCss(true);
                setTimeout(() => setCopiedCss(false), 2000);
              }}
              className="px-2 py-0.5 rounded bg-[#1e1e1e] hover:bg-[#323232] border border-[#383838] text-zinc-300 flex items-center gap-1 font-sans text-[11px]"
            >
              {copiedCss ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy CSS</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-[#1e1e1e] p-3 rounded-lg border border-[#383838] text-zinc-300 overflow-x-auto">
            <pre>
              {Object.entries(style).map(([k, v]) => (
                <div key={k}>
                  <span className="text-violet-400">{k.replace(/([A-Z])/g, '-$1').toLowerCase()}</span>
                  <span className="text-zinc-500">: </span>
                  <span className="text-emerald-400">{v}</span>
                  <span className="text-zinc-500">;</span>
                </div>
              ))}
            </pre>
          </div>

          <div className="text-zinc-400 font-sans text-[11px]">
            Node ID: <span className="font-mono text-white">{selectedNode.id}</span>
          </div>
        </div>
      )}

      {/* Multi-Library Icon Picker Modal */}
      {showIconModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#252526] border border-[#383838] rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#383838] flex items-center justify-between bg-[#2c2c2c] rounded-t-xl">
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-400" />
                <div>
                  <h3 className="font-semibold text-white text-sm">Explorador de Iconos Universal</h3>
                  <p className="text-[10px] text-zinc-400">
                    {currentLib.name} • {currentLib.badge}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIconModal(false)}
                className="text-zinc-400 hover:text-white text-sm px-2 py-1 rounded hover:bg-[#383838]"
              >
                ✕
              </button>
            </div>

            {/* Modal Search & Library Combobox */}
            <div className="p-3 border-b border-[#383838] space-y-2.5 bg-[#202021]">
              <div className="flex items-center gap-2">
                {/* Search box with Clear 'X' Button */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder={`Buscar en ${currentLib.name} (nombre, tag)...`}
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#383838] rounded-md pl-9 pr-8 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#0d99ff]"
                    autoFocus
                  />
                  {iconSearch && (
                    <button
                      type="button"
                      onClick={() => setIconSearch('')}
                      className="absolute right-2.5 top-2 p-0.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-700 transition-colors"
                      title="Limpiar búsqueda"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Library Combobox in Modal */}
                <select
                  value={currentLib.id}
                  onChange={(e) => {
                    const newLib = getLibraryById(e.target.value);
                    setModalLibId(newLib.id);
                    setModalStylePrefix(newLib.styles[0]?.prefix || '');
                  }}
                  className="bg-[#18181b] border border-[#383838] text-zinc-200 text-xs rounded-md px-3 py-1.5 focus:outline-none focus:border-[#0d99ff] max-w-[220px]"
                >
                  {availableLibraries.map((lib) => (
                    <option key={lib.id} value={lib.id} className="bg-[#18181b]">
                      {lib.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Styles: ONLY styles that the selected library supports! */}
              <div className="flex items-center justify-between pt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-zinc-400 mr-1">Estilos:</span>
                  {currentLib.styles.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setModalStylePrefix(st.prefix)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                        modalStylePrefix === st.prefix
                          ? 'bg-[#0d99ff] text-white shadow-xs'
                          : 'bg-[#2c2c2c] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {filteredModalIcons.length} iconos disponibles
                </span>
              </div>
            </div>

            {/* Icon Grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {filteredModalIcons.map((icon) => {
                const prefixToUse =
                  currentLib.id === 'fontawesome'
                    ? icon.styles?.includes('brands')
                      ? 'fab'
                      : modalStylePrefix === 'far' && icon.styles?.includes('regular')
                      ? 'far'
                      : 'fas'
                    : modalStylePrefix || currentLib.styles[0]?.prefix || '';

                return (
                  <button
                    key={`${currentLib.id}_${icon.class}`}
                    onClick={() => {
                      onUpdateProps({
                        library: currentLib.id,
                        iconName: icon.class,
                        prefix: prefixToUse,
                      });
                      setShowIconModal(false);
                    }}
                    className="group flex flex-col items-center justify-center p-3 bg-[#1e1e1e] hover:bg-[#0d99ff]/15 border border-[#383838] hover:border-[#0d99ff] rounded-lg transition-all text-center"
                    title={`${prefixToUse} ${icon.class}`}
                  >
                    {currentLib.id === 'lucide' || currentLib.id === 'svg_catalog' || findCatalogIcon(icon.class) ? (
                      <SvgIconRenderer
                        iconId={icon.class}
                        size={22}
                        stroke="currentColor"
                        fill="none"
                        className="mb-2 text-zinc-300 group-hover:text-[#0d99ff] transition-transform group-hover:scale-110"
                      />
                    ) : currentLib.id === 'material_symbols' ? (
                      <span className={`${prefixToUse} text-2xl mb-2 text-zinc-300 group-hover:text-[#0d99ff] transition-transform group-hover:scale-110`}>
                        {icon.class}
                      </span>
                    ) : (
                      <i
                        className={`${prefixToUse} ${icon.class} text-xl mb-2 text-zinc-300 group-hover:text-[#0d99ff] group-hover:scale-110 transition-transform`}
                      />
                    )}
                    <span className="text-[10px] text-zinc-400 group-hover:text-white truncate w-full">
                      {icon.name}
                    </span>
                    <span className="text-[9px] text-zinc-600 font-mono">
                      {prefixToUse || currentLib.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
