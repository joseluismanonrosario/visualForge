import React, { useState, useEffect } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
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
  Cpu,
  Zap,
  Radio,
  Link2,
  Unlink,
  Heading,
  Heading1,
  Heading2,
  Heading3,
  Baseline,
  Box,
  Underline,
  Strikethrough,
  ExternalLink,
  Image as ImageIcon,
  Tag,
  Split,
  Eye,
  EyeOff,
  Move,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
} from 'lucide-react';
import { CanvasNode, ProjectType, GpioConfig, GpioAction, GpioCommMode } from '../types';
import {
  ICON_LIBRARIES,
  getLibrariesForWorkflow,
  getLibraryById,
} from '../data/iconLibraries';
import { copyToClipboardSafe } from '../utils/exportEngine';
import { SvgIconRenderer, findCatalogIcon } from '../utils/svgIconRenderer';
import {
  getIconifyCategories,
  getCollectionsByCategory,
  getCollectionMeta,
  loadCollection,
  getLoadedCollection,
  getIconsInCollection,
  getCollectionSubcategories,
  filterIconsInCollection,
  parseIconIdentifier,
} from '../utils/iconifyManager';

interface RightSidebarProps {
  selectedNode: CanvasNode | null;
  projectType: ProjectType;
  onUpdateStyle: (styleUpdates: Record<string, any>) => void;
  onUpdateProps: (propUpdates: Record<string, any>) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

const COMMON_ESP32_GPIOS = [
  { pin: 2, label: 'GPIO 2 (LED Integrado / Boot)' },
  { pin: 4, label: 'GPIO 4 (Salida General / Relé 1)' },
  { pin: 5, label: 'GPIO 5 (Salida PWM / Dimmer / Relé 2)' },
  { pin: 12, label: 'GPIO 12 (HSPI MISO / Salida)' },
  { pin: 13, label: 'GPIO 13 (HSPI MOSI / Salida)' },
  { pin: 14, label: 'GPIO 14 (HSPI CLK / Salida)' },
  { pin: 15, label: 'GPIO 15 (HSPI SS / Salida)' },
  { pin: 16, label: 'GPIO 16 (UART2 RX / Salida)' },
  { pin: 17, label: 'GPIO 17 (UART2 TX / Salida)' },
  { pin: 18, label: 'GPIO 18 (VSPI SCK / Salida)' },
  { pin: 19, label: 'GPIO 19 (VSPI MISO / Salida)' },
  { pin: 21, label: 'GPIO 21 (I2C SDA / Salida)' },
  { pin: 22, label: 'GPIO 22 (I2C SCL / Salida)' },
  { pin: 23, label: 'GPIO 23 (VSPI MOSI / Salida)' },
  { pin: 25, label: 'GPIO 25 (DAC1 / Analógico / Salida)' },
  { pin: 26, label: 'GPIO 26 (DAC2 / Analógico / Salida)' },
  { pin: 27, label: 'GPIO 27 (Salida General)' },
  { pin: 32, label: 'GPIO 32 (ADC1_CH4 / Sensor)' },
  { pin: 33, label: 'GPIO 33 (ADC1_CH5 / Sensor)' },
];

export const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedNode,
  projectType,
  onUpdateStyle,
  onUpdateProps,
  isOpen,
  setIsOpen,
}) => {
  const [activeTab, setActiveTab] = useState<'design' | 'inspect' | 'hardware'>('design');
  const [showIconModal, setShowIconModal] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const [copiedCss, setCopiedCss] = useState(false);
  const [paddingLinked, setPaddingLinked] = useState(true);
  const [marginLinked, setMarginLinked] = useState(true);

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

  // Iconify Local Engine State
  const iconCategories = getIconifyCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const currentIconId = selectedNode?.props?.iconName || 'lucide:rocket';
  const parsedCurrent = parseIconIdentifier(currentIconId);
  const [selectedCollection, setSelectedCollection] = useState<string>(
    selectedNode?.props?.prefix || parsedCurrent.prefix || 'lucide'
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [iconPage, setIconPage] = useState(1);
  const [collectionData, setCollectionData] = useState<any>(() =>
    getLoadedCollection(selectedCollection)
  );
  const [isLoadingCollection, setIsLoadingCollection] = useState(false);

  // Keep collection in sync with selected node if it changes
  useEffect(() => {
    if (selectedNode?.props?.prefix) {
      setSelectedCollection(selectedNode.props.prefix);
    } else if (selectedNode?.props?.iconName) {
      const p = parseIconIdentifier(selectedNode.props.iconName);
      if (p.prefix) setSelectedCollection(p.prefix);
    }

    if (selectedNode?.style) {
      const s = selectedNode.style;
      const pDiff =
        (s.paddingTop && s.paddingRight && s.paddingTop !== s.paddingRight) ||
        (s.paddingTop && s.paddingBottom && s.paddingTop !== s.paddingBottom) ||
        (s.paddingTop && s.paddingLeft && s.paddingTop !== s.paddingLeft);
      if (pDiff) setPaddingLinked(false);

      const mDiff =
        (s.marginTop && s.marginRight && s.marginTop !== s.marginRight) ||
        (s.marginTop && s.marginBottom && s.marginTop !== s.marginBottom) ||
        (s.marginTop && s.marginLeft && s.marginTop !== s.marginLeft);
      if (mDiff) setMarginLinked(false);
    }
  }, [selectedNode?.id, selectedNode?.props?.iconName, selectedNode?.props?.prefix]);

  // Load collection on demand from local disk via Vite middleware
  useEffect(() => {
    let active = true;
    const cached = getLoadedCollection(selectedCollection);
    if (cached) {
      setCollectionData(cached);
      setSelectedSubcategory('All');
      setIconPage(1);
      return;
    }

    setIsLoadingCollection(true);
    loadCollection(selectedCollection).then((data) => {
      if (active) {
        setCollectionData(data);
        setSelectedSubcategory('All');
        setIconPage(1);
        setIsLoadingCollection(false);
      }
    });

    return () => {
      active = false;
    };
  }, [selectedCollection]);

  const availableCollections = getCollectionsByCategory(selectedCategory);
  const currentCollectionMeta = getCollectionMeta(selectedCollection);
  const subcategories = collectionData ? getCollectionSubcategories(collectionData) : ['All'];
  const filteredIcons = collectionData
    ? filterIconsInCollection(collectionData, iconSearch, selectedSubcategory)
    : [];
  const pageSize = 120;
  const totalPages = Math.max(1, Math.ceil(filteredIcons.length / pageSize));
  const pageIcons = filteredIcons.slice((iconPage - 1) * pageSize, iconPage * pageSize);

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
    const ensureFlex = style.display === 'inline' ? 'inline-flex' : (style.display || 'flex');
    switch (type) {
      case 'left':
        onUpdateStyle({ alignItems: 'flex-start', display: ensureFlex });
        break;
      case 'center':
        onUpdateStyle({ alignItems: 'center', display: ensureFlex });
        break;
      case 'right':
        onUpdateStyle({ alignItems: 'flex-end', display: ensureFlex });
        break;
      case 'top':
        onUpdateStyle({ justifyContent: 'flex-start', display: ensureFlex });
        break;
      case 'middle':
        onUpdateStyle({ justifyContent: 'center', display: ensureFlex });
        break;
      case 'bottom':
        onUpdateStyle({ justifyContent: 'flex-end', display: ensureFlex });
        break;
    }
  };

  const handleTagChange = (newTag: string) => {
    onUpdateProps({ as: newTag });
    const currentSize = style.fontSize || '';
    const isStandard = !currentSize || Boolean(currentSize.match(/^(12|13|14|15|16|18|20|24|32)px$/));
    if (isStandard) {
      const tagStyles: Record<string, any> = {
        h1: { fontSize: '32px', fontWeight: '700', lineHeight: '1.2' },
        h2: { fontSize: '24px', fontWeight: '700', lineHeight: '1.25' },
        h3: { fontSize: '20px', fontWeight: '600', lineHeight: '1.3' },
        h4: { fontSize: '18px', fontWeight: '600', lineHeight: '1.4' },
        h5: { fontSize: '16px', fontWeight: '600', lineHeight: '1.4' },
        h6: { fontSize: '14px', fontWeight: '600', lineHeight: '1.4' },
        p: { fontSize: '15px', fontWeight: '400', lineHeight: '1.6' },
        span: { fontSize: '14px', fontWeight: '400', display: 'inline' },
        blockquote: { fontSize: '15px', fontWeight: '400', fontStyle: 'italic' },
        code: { fontSize: '13px', fontWeight: '400', fontFamily: 'monospace' },
        div: { fontSize: '14px', fontWeight: '400' },
      };
      if (tagStyles[newTag]) {
        onUpdateStyle(tagStyles[newTag]);
      }
    }
  };

  const isIcon =
    selectedNode.type === 'svg_icon' ||
    selectedNode.type === 'fontawesome_icon' ||
    selectedNode.type === 'styled_icon';

  const currentIconSize = Number(props.size) || parseInt(style.width || '') || parseInt(style.fontSize || '') || 24;

  const handleIconSizeChange = (newSize: number | string) => {
    const num = typeof newSize === 'number' ? newSize : parseInt(newSize.toString().replace('px', '')) || 24;
    const clamped = Math.max(8, Math.min(512, num));
    const px = `${clamped}px`;
    onUpdateProps({ size: clamped });
    onUpdateStyle({
      width: px,
      height: px,
      fontSize: px,
    });
  };

  const getIconRotation = () => {
    const match = (style.transform || '').match(/rotate\((\d+)deg\)/);
    return match ? parseInt(match[1]) : 0;
  };

  const getIconFlipH = () => {
    return (style.transform || '').includes('scaleX(-1)');
  };

  const getIconFlipV = () => {
    return (style.transform || '').includes('scaleY(-1)');
  };

  const handleIconTransform = (rotation: number, flipH: boolean, flipV: boolean) => {
    const parts: string[] = [];
    if (rotation % 360 !== 0) {
      parts.push(`rotate(${rotation % 360}deg)`);
    }
    if (flipH) {
      parts.push('scaleX(-1)');
    }
    if (flipV) {
      parts.push('scaleY(-1)');
    }
    const transform = parts.length > 0 ? parts.join(' ') : 'none';
    onUpdateStyle({ transform });
  };

  const isInteractiveForEsp32 =
    ['button', 'switch', 'slider', 'toggle', 'checkbox', 'card'].includes(selectedNode.type) ||
    Boolean(selectedNode.props?.gpio);

  const renderHardwareGpioContent = (isFullTab: boolean = false) => {
    const gpio: GpioConfig = props.gpio || {
      enabled: isInteractiveForEsp32,
      pin: selectedNode.type === 'slider' ? 5 : selectedNode.type === 'switch' ? 2 : 4,
      action: selectedNode.type === 'slider' ? 'PWM' : 'TOGGLE_PIN',
      mode: 'HTTP_GET',
      label: props.label || selectedNode.name,
      pwmValue: props.gpio?.pwmValue ?? 128,
    };

    const updateGpio = (updates: Partial<GpioConfig>) => {
      onUpdateProps({
        gpio: {
          ...gpio,
          ...updates,
        },
      });
    };

    return (
      <div
        className={`space-y-3 bg-[#18181b] border border-emerald-500/30 rounded-xl p-3 shadow-sm ${
          isFullTab ? 'h-full overflow-y-auto' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#383838]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wide">
                Hardware / GPIO (ESP32)
              </h4>
              <p className="text-[10px] text-zinc-400">Control de microcontrolador IoT</p>
            </div>
          </div>

          {/* Enabled Checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!gpio.enabled}
              onChange={(e) => updateGpio({ enabled: e.target.checked })}
              className="w-3.5 h-3.5 rounded border-zinc-600 text-emerald-500 accent-emerald-500 focus:ring-0 cursor-pointer"
            />
            <span className="text-[11px] font-medium text-zinc-300">
              {gpio.enabled ? 'Activo' : 'Inactivo'}
            </span>
          </label>
        </div>

        {gpio.enabled ? (
          <div className="space-y-3 pt-1">
            {/* GPIO Pin Selector */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>Pin GPIO (ESP32)</span>
                </label>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                  GPIO {gpio.pin}
                </span>
              </div>
              <select
                value={gpio.pin}
                onChange={(e) => updateGpio({ pin: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-[#252526] border border-[#383838] focus:border-emerald-500 rounded px-2.5 py-1.5 text-white text-xs focus:outline-none"
              >
                {COMMON_ESP32_GPIOS.map((g) => (
                  <option key={g.pin} value={g.pin} className="bg-[#1e1e1e]">
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-zinc-400">Tipo de Acción Hardware</label>
              <select
                value={gpio.action}
                onChange={(e) => updateGpio({ action: e.target.value as GpioAction })}
                className="w-full bg-[#252526] border border-[#383838] focus:border-emerald-500 rounded px-2.5 py-1.5 text-white text-xs focus:outline-none"
              >
                <option value="TOGGLE_PIN" className="bg-[#1e1e1e]">
                  TOGGLE_PIN — Invertir Estado (Relé / Pulsador)
                </option>
                <option value="SET_HIGH" className="bg-[#1e1e1e]">
                  SET_HIGH — Encender / Activar (1 / 3.3V)
                </option>
                <option value="SET_LOW" className="bg-[#1e1e1e]">
                  SET_LOW — Apagar / Desactivar (0 / 0V)
                </option>
                <option value="PWM" className="bg-[#1e1e1e]">
                  PWM — Modulación Ancho de Pulso (0 - 255)
                </option>
                <option value="READ_PIN" className="bg-[#1e1e1e]">
                  READ_PIN — Lectura Entrada / Sensor
                </option>
              </select>
            </div>

            {/* Communication Mode */}
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-zinc-400">Modo de Comunicación</label>
              <select
                value={gpio.mode}
                onChange={(e) => updateGpio({ mode: e.target.value as GpioCommMode })}
                className="w-full bg-[#252526] border border-[#383838] focus:border-emerald-500 rounded px-2.5 py-1.5 text-white text-xs focus:outline-none"
              >
                <option value="HTTP_GET" className="bg-[#1e1e1e]">
                  HTTP_GET — Llamada asíncrona fetch('/update?pin=...')
                </option>
                <option value="HTTP_POST" className="bg-[#1e1e1e]">
                  HTTP_POST — JSON payload en /api/gpio
                </option>
                <option value="WEBSOCKET" className="bg-[#1e1e1e]">
                  WEBSOCKET — Mensaje en tiempo real ws://
                </option>
              </select>
            </div>

            {/* Alias / Label */}
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-zinc-400">Etiqueta de Referencia Hardware</label>
              <input
                type="text"
                value={gpio.label || ''}
                onChange={(e) => updateGpio({ label: e.target.value })}
                placeholder="Ej. Relé Luz Sala, LED Notificación..."
                className="w-full bg-[#252526] border border-[#383838] focus:border-emerald-500 rounded px-2.5 py-1.5 text-white text-xs focus:outline-none"
              />
            </div>

            {/* PWM Default Value if action is PWM */}
            {gpio.action === 'PWM' && (
              <div className="space-y-1 bg-[#202024] p-2 rounded border border-[#383838]">
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>Valor Inicial PWM</span>
                  <span className="font-mono text-emerald-400">{gpio.pwmValue ?? 128} (0-255)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={gpio.pwmValue ?? 128}
                  onChange={(e) => updateGpio({ pwmValue: parseInt(e.target.value, 10) })}
                  className="w-full accent-emerald-500"
                />
              </div>
            )}

            {/* Generated Endpoint Route Preview */}
            <div className="pt-2 border-t border-[#383838]/80">
              <span className="text-[10px] text-zinc-400 block mb-1">Ruta HTTP generada en Firmware:</span>
              <div className="bg-[#0f0f11] p-2 rounded border border-[#2a2a2e] font-mono text-[10px] text-emerald-400 break-all select-all">
                {gpio.mode === 'HTTP_GET'
                  ? `GET /update?pin=${gpio.pin}&action=${gpio.action}${
                      gpio.action === 'PWM' ? '&val=' + (gpio.pwmValue ?? 128) : ''
                    }`
                  : `POST /api/gpio { "pin": ${gpio.pin}, "action": "${gpio.action}" }`}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-2 text-center text-[11px] text-zinc-500">
            Marca la casilla <span className="text-zinc-300 font-medium">Activo</span> para enlazar este elemento a un pin físico del ESP32.
          </div>
        )}
      </div>
    );
  };

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
          {projectType === 'esp32' && (
            <button
              onClick={() => setActiveTab('hardware')}
              className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'hardware'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-xs'
                  : 'text-zinc-400 hover:text-emerald-300'
              }`}
              title="Inspector de Pines GPIO y Hardware ESP32"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hardware</span>
            </button>
          )}
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-[#383838] rounded text-zinc-400 hover:text-white"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      {activeTab === 'design' && (
        <div className="flex-1 overflow-y-auto divide-y divide-[#383838] p-3 space-y-4">
          {/* ======================================================== */}
          {/* 1. FIGMA-STYLE TOP ALIGNMENT TOOLBAR                     */}
          {/* ======================================================== */}
          <div className="flex items-center justify-between px-1.5 py-1 bg-[#1e1e1e] border border-[#383838] rounded-md shadow-xs">
            <button
              onClick={() => handleQuickAlign('left')}
              title="Alinear a la izquierda (Align Left)"
              className="p-1 hover:bg-[#323232] rounded text-zinc-400 hover:text-white transition-colors"
            >
              <AlignStartHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleQuickAlign('center')}
              title="Centrar horizontalmente (Align Horizontal Centers)"
              className="p-1 hover:bg-[#323232] rounded text-zinc-400 hover:text-white transition-colors"
            >
              <AlignCenterHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleQuickAlign('right')}
              title="Alinear a la derecha (Align Right)"
              className="p-1 hover:bg-[#323232] rounded text-zinc-400 hover:text-white transition-colors"
            >
              <AlignEndHorizontal className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-[#383838] my-0.5" />
            <button
              onClick={() => handleQuickAlign('top')}
              title="Alinear arriba (Align Top)"
              className="p-1 hover:bg-[#323232] rounded text-zinc-400 hover:text-white transition-colors"
            >
              <AlignStartVertical className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleQuickAlign('middle')}
              title="Centrar verticalmente (Align Vertical Centers)"
              className="p-1 hover:bg-[#323232] rounded text-zinc-400 hover:text-white transition-colors"
            >
              <AlignCenterVertical className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleQuickAlign('bottom')}
              title="Alinear abajo (Align Bottom)"
              className="p-1 hover:bg-[#323232] rounded text-zinc-400 hover:text-white transition-colors"
            >
              <AlignEndVertical className="w-4 h-4" />
            </button>
          </div>

          {/* ======================================================== */}
          {/* 2. FRAME / DIMENSIONS & DISPLAY                          */}
          {/* ======================================================== */}
          <div className="space-y-3">
            {/* Element identification header */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0d99ff]" />
                <span className="text-xs font-semibold text-white truncate max-w-[170px]">
                  {selectedNode.name || selectedNode.type}
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-[#1e1e1e] border border-[#383838] font-mono text-[10px] text-zinc-400 uppercase">
                {selectedNode.type === 'typography'
                  ? `<${props.as || 'p'}>`
                  : selectedNode.type}
              </span>
            </div>

            {/* Display property */}
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 font-medium block">Display</span>
              <select
                value={style.display || (selectedNode.isContainer ? 'flex' : 'block')}
                onChange={(e) => onUpdateStyle({ display: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#383838] focus:border-[#0d99ff] rounded px-2.5 py-1 text-white text-xs focus:outline-none"
              >
                <option value="block" className="bg-[#1e1e1e]">Block (Elemento de Bloque / Full Width)</option>
                <option value="flex" className="bg-[#1e1e1e]">Flex (Contenedor Flexible Auto-Layout)</option>
                <option value="inline-block" className="bg-[#1e1e1e]">Inline-Block (En línea con dimensiones)</option>
                <option value="inline-flex" className="bg-[#1e1e1e]">Inline-Flex (Flex en línea)</option>
                <option value="grid" className="bg-[#1e1e1e]">Grid (Rejilla CSS)</option>
                <option value="inline" className="bg-[#1e1e1e]">Inline (Texto en línea puro)</option>
              </select>
            </div>

            {/* Dimensions W & H */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center bg-[#1e1e1e] border border-[#383838] focus-within:border-[#0d99ff] rounded px-2 py-1">
                <span className="text-zinc-500 font-mono text-[11px] mr-2">W</span>
                <input
                  type="text"
                  value={isIcon ? `${currentIconSize}px` : (style.width || '100%')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (isIcon) {
                      handleIconSizeChange(val);
                    } else {
                      onUpdateStyle({ width: val });
                    }
                  }}
                  className="w-full bg-transparent text-white focus:outline-none text-xs font-mono"
                />
              </div>
              <div className="flex items-center bg-[#1e1e1e] border border-[#383838] focus-within:border-[#0d99ff] rounded px-2 py-1">
                <span className="text-zinc-500 font-mono text-[11px] mr-2">H</span>
                <input
                  type="text"
                  value={isIcon ? `${currentIconSize}px` : (style.height || 'auto')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (isIcon) {
                      handleIconSizeChange(val);
                    } else {
                      onUpdateStyle({ height: val });
                    }
                  }}
                  className="w-full bg-transparent text-white focus:outline-none text-xs font-mono"
                />
              </div>
            </div>

            {/* Sizing shortcuts */}
            {!isIcon ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onUpdateStyle({ width: 'auto', alignSelf: 'auto' })}
                  className="flex-1 py-1 rounded bg-[#1e1e1e] hover:bg-[#323232] border border-[#383838] text-[11px] text-zinc-300 text-center transition-colors"
                >
                  Hug Contents
                </button>
                <button
                  onClick={() => onUpdateStyle({ width: '100%', alignSelf: 'stretch' })}
                  className="flex-1 py-1 rounded bg-[#1e1e1e] hover:bg-[#323232] border border-[#383838] text-[11px] text-zinc-300 text-center transition-colors"
                >
                  Fill Container
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {[16, 20, 24, 32, 48].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => handleIconSizeChange(sz)}
                    className={`flex-1 py-1 rounded border text-[10px] font-mono text-center transition-colors ${
                      currentIconSize === sz
                        ? 'bg-[#0d99ff] text-white border-[#0d99ff]'
                        : 'bg-[#1e1e1e] hover:bg-[#323232] text-zinc-300 border-[#383838]'
                    }`}
                  >
                    {sz}px
                  </button>
                ))}
              </div>
            )}

            {/* Min-Width & Max-Width */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1">
                <span className="text-zinc-500 font-mono text-[10px] mr-1">MinW</span>
                <input
                  type="text"
                  value={style.minWidth || ''}
                  onChange={(e) => onUpdateStyle({ minWidth: e.target.value })}
                  placeholder="none"
                  className="w-full bg-transparent text-white focus:outline-none text-xs font-mono"
                />
              </div>
              <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1">
                <span className="text-zinc-500 font-mono text-[10px] mr-1">MaxW</span>
                <input
                  type="text"
                  value={style.maxWidth || ''}
                  onChange={(e) => onUpdateStyle({ maxWidth: e.target.value })}
                  placeholder="none"
                  className="w-full bg-transparent text-white focus:outline-none text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. AUTO LAYOUT & SPACING                                 */}
          {/* ======================================================== */}
          <div className="pt-3 space-y-3">
            {!isIcon && (
              <>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Columns3 className="w-3.5 h-3.5 text-[#0d99ff]" />
                <span>Auto Layout</span>
              </span>
              <div className="flex items-center bg-[#1e1e1e] border border-[#383838] rounded p-0.5">
                <button
                  onClick={() => onUpdateStyle({ flexDirection: 'row', display: 'flex' })}
                  title="Horizontal Layout (Row)"
                  className={`p-1 rounded transition-colors ${
                    style.flexDirection === 'row' ? 'bg-[#0d99ff] text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onUpdateStyle({ flexDirection: 'column', display: 'flex' })}
                  title="Vertical Layout (Column)"
                  className={`p-1 rounded transition-colors ${
                    style.flexDirection === 'column' || !style.flexDirection
                      ? 'bg-[#0d99ff] text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 3x3 Matrix Grid */}
            <div className="flex items-center gap-3 bg-[#1e1e1e] p-2.5 rounded-lg border border-[#383838]">
              <div className="grid grid-cols-3 gap-1 w-20 h-20 bg-[#282829] p-1 rounded-md border border-[#3e3e42] shrink-0">
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
                          display: 'flex',
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
              <div className="text-[10px] text-zinc-400 space-y-1">
                <div>
                  <span className="text-zinc-500">Align:</span>{' '}
                  <span className="font-mono text-zinc-200">{currentAlign}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Justify:</span>{' '}
                  <span className="font-mono text-zinc-200">{currentJustify}</span>
                </div>
                <div className="pt-1">
                  <span className="text-[9px] text-zinc-500">Haz clic en los puntos para posicionar los hijos en la cuadrícula</span>
                </div>
              </div>
            </div>

            {/* ITEM GAP */}
            <div className="flex items-center justify-between bg-[#1e1e1e] p-2.5 rounded-lg border border-[#383838]">
              <span className="text-[11px] font-medium text-zinc-300">Item Gap (Espaciado)</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={style.gap || '0px'}
                  onChange={(e) => onUpdateStyle({ gap: e.target.value })}
                  placeholder="0px"
                  className="w-20 bg-[#252526] border border-[#383838] focus:border-[#0d99ff] rounded px-2 py-1 text-right text-white text-xs font-mono focus:outline-none"
                />
                <div className="flex items-center gap-1">
                  {['0px', '8px', '16px', '24px'].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => onUpdateStyle({ gap: preset })}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                        style.gap === preset
                          ? 'bg-[#0d99ff] text-white border-[#0d99ff]'
                          : 'bg-[#252526] hover:bg-[#323232] text-zinc-400 border-[#383838]'
                      }`}
                    >
                      {preset.replace('px', '')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PADDING CONTROL */}
            <div className="space-y-1.5 bg-[#1e1e1e] p-2.5 rounded-lg border border-[#383838]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-zinc-300">Padding (Interior)</span>
                  <button
                    onClick={() => setPaddingLinked(!paddingLinked)}
                    className="p-1 hover:bg-[#2c2c2c] rounded text-zinc-400 hover:text-white transition-colors"
                    title={paddingLinked ? 'Desvincular (4 lados independientes: T, R, B, L)' : 'Vincular lados uniformes'}
                  >
                    {paddingLinked ? (
                      <Link2 className="w-3 h-3 text-[#0d99ff]" />
                    ) : (
                      <Unlink className="w-3 h-3 text-zinc-500" />
                    )}
                  </button>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {paddingLinked
                    ? style.paddingTop || style.padding || '0px'
                    : `${style.paddingTop || '0'} · ${style.paddingRight || '0'} · ${style.paddingBottom || '0'} · ${style.paddingLeft || '0'}`}
                </span>
              </div>

              {paddingLinked ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={style.paddingTop || style.padding || '0px'}
                    onChange={(e) => {
                      const val = e.target.value;
                      onUpdateStyle({
                        paddingTop: val,
                        paddingRight: val,
                        paddingBottom: val,
                        paddingLeft: val,
                        padding: val,
                      });
                    }}
                    placeholder="0px"
                    className="flex-1 bg-[#252526] border border-[#383838] focus:border-[#0d99ff] rounded px-2.5 py-1 text-white text-xs font-mono focus:outline-none"
                  />
                  <div className="flex items-center gap-1">
                    {['0px', '8px', '12px', '16px', '24px'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() =>
                          onUpdateStyle({
                            paddingTop: preset,
                            paddingRight: preset,
                            paddingBottom: preset,
                            paddingLeft: preset,
                            padding: preset,
                          })
                        }
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                          (style.paddingTop || style.padding) === preset
                            ? 'bg-[#0d99ff] text-white border-[#0d99ff]'
                            : 'bg-[#252526] hover:bg-[#323232] text-zinc-400 border-[#383838]'
                        }`}
                      >
                        {preset.replace('px', '')}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  <div>
                    <span className="text-[9px] text-zinc-500 block text-center uppercase tracking-wider mb-0.5">Top</span>
                    <input
                      type="text"
                      value={style.paddingTop || '0px'}
                      onChange={(e) => onUpdateStyle({ paddingTop: e.target.value })}
                      placeholder="0px"
                      className="w-full bg-[#252526] border border-[#383838] focus:border-[#0d99ff] rounded px-1.5 py-1 text-center text-white text-xs font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block text-center uppercase tracking-wider mb-0.5">Right</span>
                    <input
                      type="text"
                      value={style.paddingRight || '0px'}
                      onChange={(e) => onUpdateStyle({ paddingRight: e.target.value })}
                      placeholder="0px"
                      className="w-full bg-[#252526] border border-[#383838] focus:border-[#0d99ff] rounded px-1.5 py-1 text-center text-white text-xs font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block text-center uppercase tracking-wider mb-0.5">Bottom</span>
                    <input
                      type="text"
                      value={style.paddingBottom || '0px'}
                      onChange={(e) => onUpdateStyle({ paddingBottom: e.target.value })}
                      placeholder="0px"
                      className="w-full bg-[#252526] border border-[#383838] focus:border-[#0d99ff] rounded px-1.5 py-1 text-center text-white text-xs font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block text-center uppercase tracking-wider mb-0.5">Left</span>
                    <input
                      type="text"
                      value={style.paddingLeft || '0px'}
                      onChange={(e) => onUpdateStyle({ paddingLeft: e.target.value })}
                      placeholder="0px"
                      className="w-full bg-[#252526] border border-[#383838] focus:border-[#0d99ff] rounded px-1.5 py-1 text-center text-white text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
              </>
            )}

            {/* MARGIN CONTROL (Exterior spacing) */}
            <div className="space-y-1.5 bg-[#1e1e1e] p-2.5 rounded-lg border border-[#383838]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-zinc-300">Margin (Exterior)</span>
                  <button
                    onClick={() => setMarginLinked(!marginLinked)}
                    className="p-1 hover:bg-[#2c2c2c] rounded text-zinc-400 hover:text-white transition-colors"
                    title={marginLinked ? 'Desvincular (4 lados independientes: T, R, B, L)' : 'Vincular lados uniformes'}
                  >
                    {marginLinked ? (
                      <Link2 className="w-3 h-3 text-[#0d99ff]" />
                    ) : (
                      <Unlink className="w-3 h-3 text-zinc-500" />
                    )}
                  </button>
                  <button
                    onClick={() => onUpdateStyle({ marginLeft: 'auto', marginRight: 'auto' })}
                    className="px-1.5 py-0.5 rounded bg-[#252526] hover:bg-[#323232] border border-[#383838] text-[9px] text-zinc-300 transition-colors"
                    title="Centrar horizontalmente (margin: 0 auto)"
                  >
                    Auto Center
                  </button>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {marginLinked
                    ? style.marginTop || style.margin || '0px'
                    : `${style.marginTop || '0'} · ${style.marginRight || '0'} · ${style.marginBottom || '0'} · ${style.marginLeft || '0'}`}
                </span>
              </div>

              {marginLinked ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={style.marginTop || style.margin || '0px'}
                    onChange={(e) => {
                      const val = e.target.value;
                      onUpdateStyle({
                        marginTop: val,
                        marginRight: val,
                        marginBottom: val,
                        marginLeft: val,
                        margin: val,
                      });
                    }}
                    placeholder="0px"
                    className="flex-1 bg-[#252526] border border-[#383838] focus:border-[#0d99ff] rounded px-2.5 py-1 text-white text-xs font-mono focus:outline-none"
                  />
                  <div className="flex items-center gap-1">
                    {['0px', '8px', '16px', '24px', '32px'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() =>
                          onUpdateStyle({
                            marginTop: preset,
                            marginRight: preset,
                            marginBottom: preset,
                            marginLeft: preset,
                            margin: preset,
                          })
                        }
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                          (style.marginTop || style.margin) === preset
                            ? 'bg-[#0d99ff] text-white border-[#0d99ff]'
                            : 'bg-[#252526] hover:bg-[#323232] text-zinc-400 border-[#383838]'
                        }`}
                      >
                        {preset.replace('px', '')}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  <div>
                    <span className="text-[9px] text-zinc-500 block text-center uppercase tracking-wider mb-0.5">Top</span>
                    <input
                      type="text"
                      value={style.marginTop || '0px'}
                      onChange={(e) => onUpdateStyle({ marginTop: e.target.value })}
                      placeholder="0px"
                      className="w-full bg-[#252526] border border-[#383838] focus:border-[#0d99ff] rounded px-1.5 py-1 text-center text-white text-xs font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block text-center uppercase tracking-wider mb-0.5">Right</span>
                    <input
                      type="text"
                      value={style.marginRight || '0px'}
                      onChange={(e) => onUpdateStyle({ marginRight: e.target.value })}
                      placeholder="0px"
                      className="w-full bg-[#252526] border border-[#383838] focus:border-[#0d99ff] rounded px-1.5 py-1 text-center text-white text-xs font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block text-center uppercase tracking-wider mb-0.5">Bottom</span>
                    <input
                      type="text"
                      value={style.marginBottom || '0px'}
                      onChange={(e) => onUpdateStyle({ marginBottom: e.target.value })}
                      placeholder="0px"
                      className="w-full bg-[#252526] border border-[#383838] focus:border-[#0d99ff] rounded px-1.5 py-1 text-center text-white text-xs font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block text-center uppercase tracking-wider mb-0.5">Left</span>
                    <input
                      type="text"
                      value={style.marginLeft || '0px'}
                      onChange={(e) => onUpdateStyle({ marginLeft: e.target.value })}
                      placeholder="0px"
                      className="w-full bg-[#252526] border border-[#383838] focus:border-[#0d99ff] rounded px-1.5 py-1 text-center text-white text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* 4. COMPONENT PROPERTIES                                  */}
          {/* ======================================================== */}
          <div className="pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#0d99ff]" />
                <span>Component Properties</span>
              </span>
            </div>

            {/* Typography / Headings Tag & Content Control */}
            {selectedNode.type === 'typography' && (
              <div className="space-y-2 bg-[#1e1e1e] p-2.5 rounded-lg border border-[#383838]">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
                    <Heading className="w-3 h-3 text-[#0d99ff]" />
                    <span>Tipo de Elemento HTML</span>
                  </label>
                  <span className="text-[10px] font-mono text-[#0d99ff] font-semibold">
                    &lt;{props.as || 'p'}&gt;
                  </span>
                </div>

                {/* Dropdown HTML Tag */}
                <select
                  value={props.as || 'p'}
                  onChange={(e) => handleTagChange(e.target.value)}
                  className="w-full bg-[#252526] border border-[#383838] focus:border-[#0d99ff] rounded px-2.5 py-1.5 text-white text-xs focus:outline-none"
                >
                  <optgroup label="Encabezados (Headings)" className="bg-[#1e1e1e] text-zinc-400">
                    <option value="h1" className="bg-[#1e1e1e] text-white">h1 — Título Principal H1 (32px Bold)</option>
                    <option value="h2" className="bg-[#1e1e1e] text-white">h2 — Título de Sección H2 (24px Bold)</option>
                    <option value="h3" className="bg-[#1e1e1e] text-white">h3 — Subtítulo H3 (20px SemiBold)</option>
                    <option value="h4" className="bg-[#1e1e1e] text-white">h4 — Encabezado H4 (18px SemiBold)</option>
                    <option value="h5" className="bg-[#1e1e1e] text-white">h5 — Encabezado H5 (16px SemiBold)</option>
                    <option value="h6" className="bg-[#1e1e1e] text-white">h6 — Encabezado Menor H6 (14px SemiBold)</option>
                  </optgroup>
                  <optgroup label="Texto & Bloques" className="bg-[#1e1e1e] text-zinc-400">
                    <option value="p" className="bg-[#1e1e1e] text-white">p — Párrafo Estándar (15px)</option>
                    <option value="span" className="bg-[#1e1e1e] text-white">span — Texto en Línea (Inline)</option>
                    <option value="blockquote" className="bg-[#1e1e1e] text-white">blockquote — Cita en Bloque (Italic)</option>
                    <option value="div" className="bg-[#1e1e1e] text-white">div — Bloque Genérico (div)</option>
                    <option value="code" className="bg-[#1e1e1e] text-white">code — Código en Línea (Monospace)</option>
                  </optgroup>
                </select>

                {/* Quick Heading Selector Pills */}
                <div className="flex items-center gap-1 pt-1 flex-wrap">
                  {[
                    { tag: 'h1', label: 'H1' },
                    { tag: 'h2', label: 'H2' },
                    { tag: 'h3', label: 'H3' },
                    { tag: 'h4', label: 'H4' },
                    { tag: 'p', label: 'P' },
                    { tag: 'span', label: 'Span' },
                    { tag: 'blockquote', label: 'Quote' },
                  ].map((item) => (
                    <button
                      key={item.tag}
                      onClick={() => handleTagChange(item.tag)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                        (props.as || 'p') === item.tag
                          ? 'bg-[#0d99ff] text-white border-[#0d99ff]'
                          : 'bg-[#252526] hover:bg-[#323232] text-zinc-300 border-[#383838]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Text Content Editor */}
                <div className="space-y-1 pt-1">
                  <label className="text-[10px] font-medium text-zinc-400">Contenido del Texto</label>
                  <textarea
                    value={props.text || ''}
                    onChange={(e) => onUpdateProps({ text: e.target.value })}
                    rows={3}
                    placeholder="Escribe el texto aquí..."
                    className="w-full bg-[#252526] border border-[#383838] focus:border-[#0d99ff] rounded px-2 py-1.5 text-white focus:outline-none resize-none text-xs"
                  />
                </div>
              </div>
            )}

            {/* Other Component Text / Content if applicable */}
            {!isIcon && selectedNode.type !== 'typography' && (props.text !== undefined || selectedNode.type === 'blockquote' || selectedNode.type === 'label') && (
              <div className="space-y-1.5 bg-[#1e1e1e] p-2.5 rounded-lg border border-[#383838]">
                <label className="text-[10px] font-medium text-zinc-400">Texto del Elemento</label>
                <textarea
                  value={props.text || ''}
                  onChange={(e) => onUpdateProps({ text: e.target.value })}
                  rows={2}
                  className="w-full bg-[#252526] border border-[#383838] focus:border-[#0d99ff] rounded px-2 py-1.5 text-white focus:outline-none resize-none text-xs"
                />
              </div>
            )}

            {/* If Button or Badge */}
            {(selectedNode.type === 'button' || selectedNode.type === 'badge') && (
              <div className="space-y-2 bg-[#1e1e1e] p-2.5 rounded-lg border border-[#383838]">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-400">Texto del Botón / Badge</label>
                  <input
                    type="text"
                    value={props.label || ''}
                    onChange={(e) => onUpdateProps({ label: e.target.value })}
                    className="w-full bg-[#252526] border border-[#383838] focus:border-[#0d99ff] rounded px-2 py-1 text-white text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-400">Variante Visual</label>
                  <select
                    value={props.variant || 'default'}
                    onChange={(e) => onUpdateProps({ variant: e.target.value })}
                    className="w-full bg-[#252526] border border-[#383838] focus:border-[#0d99ff] rounded px-2 py-1 text-white text-xs focus:outline-none"
                  >
                    <option value="default" className="bg-[#1e1e1e]">Default (Primario)</option>
                    <option value="secondary" className="bg-[#1e1e1e]">Secondary</option>
                    <option value="outline" className="bg-[#1e1e1e]">Outline (Borde)</option>
                    <option value="destructive" className="bg-[#1e1e1e]">Destructive (Rojo)</option>
                    <option value="ghost" className="bg-[#1e1e1e]">Ghost (Transparente)</option>
                    <option value="link" className="bg-[#1e1e1e]">Link (Enlace)</option>
                  </select>
                </div>
              </div>
            )}

            {/* If Link */}
            {selectedNode.type === 'link' && (
              <div className="space-y-2 bg-[#1e1e1e] p-2.5 rounded-lg border border-[#383838]">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-400">Texto del Enlace</label>
                  <input
                    type="text"
                    value={props.label || ''}
                    onChange={(e) => onUpdateProps({ label: e.target.value })}
                    className="w-full bg-[#252526] border border-[#383838] rounded px-2 py-1 text-white text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-400">URL Destino (href)</label>
                  <input
                    type="text"
                    value={props.href || ''}
                    onChange={(e) => onUpdateProps({ href: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-[#252526] border border-[#383838] rounded px-2 py-1 text-white text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-400">Destino (Target)</label>
                  <select
                    value={props.target || '_self'}
                    onChange={(e) => onUpdateProps({ target: e.target.value })}
                    className="w-full bg-[#252526] border border-[#383838] rounded px-2 py-1 text-white text-xs focus:outline-none"
                  >
                    <option value="_self" className="bg-[#1e1e1e]">Misma pestaña (_self)</option>
                    <option value="_blank" className="bg-[#1e1e1e]">Nueva pestaña (_blank)</option>
                  </select>
                </div>
              </div>
            )}

            {/* If Image */}
            {selectedNode.type === 'image' && (
              <div className="space-y-2 bg-[#1e1e1e] p-2.5 rounded-lg border border-[#383838]">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-400">URL de Imagen</label>
                  <input
                    type="text"
                    value={props.src || ''}
                    onChange={(e) => onUpdateProps({ src: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#252526] border border-[#383838] rounded px-2 py-1 text-white text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-400">Texto Alternativo (Alt)</label>
                  <input
                    type="text"
                    value={props.alt || ''}
                    onChange={(e) => onUpdateProps({ alt: e.target.value })}
                    className="w-full bg-[#252526] border border-[#383838] rounded px-2 py-1 text-white text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-400">Ajuste (Object Fit)</label>
                  <select
                    value={props.objectFit || style.objectFit || 'cover'}
                    onChange={(e) => {
                      onUpdateProps({ objectFit: e.target.value });
                      onUpdateStyle({ objectFit: e.target.value });
                    }}
                    className="w-full bg-[#252526] border border-[#383838] rounded px-2 py-1 text-white text-xs focus:outline-none"
                  >
                    <option value="cover" className="bg-[#1e1e1e]">Cover (Llenar y recortar)</option>
                    <option value="contain" className="bg-[#1e1e1e]">Contain (Ajustar dentro)</option>
                    <option value="fill" className="bg-[#1e1e1e]">Fill (Estirar)</option>
                    <option value="none" className="bg-[#1e1e1e]">None (Original)</option>
                  </select>
                </div>
              </div>
            )}

            {/* If Input or Textarea */}
            {(selectedNode.type === 'input' || selectedNode.type === 'textarea' || selectedNode.type === 'searchbox') && (
              <div className="space-y-2 bg-[#1e1e1e] p-2.5 rounded-lg border border-[#383838]">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-400">Placeholder</label>
                  <input
                    type="text"
                    value={props.placeholder || ''}
                    onChange={(e) => onUpdateProps({ placeholder: e.target.value })}
                    className="w-full bg-[#252526] border border-[#383838] rounded px-2 py-1 text-white text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-400">Valor por Defecto</label>
                  <input
                    type="text"
                    value={props.value || ''}
                    onChange={(e) => onUpdateProps({ value: e.target.value })}
                    className="w-full bg-[#252526] border border-[#383838] rounded px-2 py-1 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* If Card, Alert or Collapsible */}
            {(selectedNode.type === 'card' || selectedNode.type === 'alert' || selectedNode.type === 'collapsible') && (
              <div className="space-y-2 bg-[#1e1e1e] p-2.5 rounded-lg border border-[#383838]">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-400">Título</label>
                  <input
                    type="text"
                    value={props.title || props.label || ''}
                    onChange={(e) => onUpdateProps({ title: e.target.value, label: e.target.value })}
                    className="w-full bg-[#252526] border border-[#383838] rounded px-2 py-1 text-white text-xs focus:outline-none"
                  />
                </div>
                {props.description !== undefined && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-zinc-400">Descripción</label>
                    <textarea
                      value={props.description || ''}
                      onChange={(e) => onUpdateProps({ description: e.target.value })}
                      rows={2}
                      className="w-full bg-[#252526] border border-[#383838] rounded px-2 py-1 text-white text-xs focus:outline-none resize-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* If Switch */}
            {selectedNode.type === 'switch' && (
              <div className="space-y-1.5 bg-[#1e1e1e] p-2.5 rounded-lg border border-[#383838]">
                <label className="text-zinc-400 text-[10px] font-medium">Etiqueta Switch</label>
                <input
                  type="text"
                  value={props.label || ''}
                  onChange={(e) => onUpdateProps({ label: e.target.value })}
                  className="w-full bg-[#252526] border border-[#383838] rounded px-2 py-1 text-white text-xs focus:outline-none"
                />
              </div>
            )}

            {/* If Slider */}
            {selectedNode.type === 'slider' && (
              <div className="space-y-2 bg-[#1e1e1e] p-2.5 rounded-lg border border-[#383838]">
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[10px] font-medium">Etiqueta Slider</label>
                  <input
                    type="text"
                    value={props.label || ''}
                    onChange={(e) => onUpdateProps({ label: e.target.value })}
                    className="w-full bg-[#252526] border border-[#383838] rounded px-2 py-1 text-white text-xs focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-zinc-500">Mínimo</span>
                    <input
                      type="number"
                      value={props.min ?? 0}
                      onChange={(e) => onUpdateProps({ min: Number(e.target.value) })}
                      className="w-full bg-[#252526] border border-[#383838] rounded px-1.5 py-1 text-white text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500">Máximo</span>
                    <input
                      type="number"
                      value={props.max ?? 255}
                      onChange={(e) => onUpdateProps({ max: Number(e.target.value) })}
                      className="w-full bg-[#252526] border border-[#383838] rounded px-1.5 py-1 text-white text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500">Valor</span>
                    <input
                      type="number"
                      value={props.value ?? 128}
                      onChange={(e) => onUpdateProps({ value: Number(e.target.value) })}
                      className="w-full bg-[#252526] border border-[#383838] rounded px-1.5 py-1 text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* If Kbd */}
            {selectedNode.type === 'kbd' && (
              <div className="space-y-1.5 bg-[#1e1e1e] p-2.5 rounded-lg border border-[#383838]">
                <label className="text-zinc-400 text-[10px] font-medium">Combinación de Teclas (Keys)</label>
                <input
                  type="text"
                  value={props.keys || props.label || '⌘K'}
                  onChange={(e) => onUpdateProps({ keys: e.target.value, label: e.target.value })}
                  className="w-full bg-[#252526] border border-[#383838] rounded px-2 py-1 text-white text-xs font-mono focus:outline-none"
                />
              </div>
            )}

            {/* If Vector Icon Component (Iconify Universal Offline) */}
            {isIcon && (
              <div className="space-y-3 bg-[#1e1e1e] p-3 rounded-lg border border-[#383838]">
                {/* Visual Icon Identifier & Explorer Button */}
                <div className="flex items-center justify-between pb-2 border-b border-[#383838]">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-lg bg-[#252526] border border-[#383838] flex items-center justify-center shrink-0 overflow-hidden"
                      style={{
                        transform: style.transform,
                      }}
                    >
                      <SvgIconRenderer
                        iconId={props.iconName || 'lucide:rocket'}
                        size={Math.min(28, currentIconSize)}
                        stroke={style.color || '#0d99ff'}
                        fill={style.fill || props.fill || 'none'}
                      />
                    </div>
                    <div>
                      <span className="font-mono text-white block text-xs font-semibold truncate max-w-[130px]">
                        {props.iconName || 'lucide:rocket'}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-sans block">
                        {currentCollectionMeta?.name || 'Colección Iconify'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIconSearch('');
                      setIconPage(1);
                      setShowIconModal(true);
                    }}
                    className="px-2.5 py-1 rounded bg-[#0d99ff] hover:bg-[#0082df] text-white font-medium text-[11px] shadow-xs transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Cambiar</span>
                  </button>
                </div>

                {/* 1. CONTROL DE TAMAÑO EXHAUSTIVO (SIZE) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-300">Tamaño del Icono</span>
                    <div className="flex items-center bg-[#252526] border border-[#383838] focus-within:border-[#0d99ff] rounded px-2 py-0.5 w-20">
                      <input
                        type="number"
                        min="8"
                        max="512"
                        value={currentIconSize}
                        onChange={(e) => handleIconSizeChange(e.target.value)}
                        className="w-full bg-transparent text-white text-xs font-mono text-right focus:outline-none"
                      />
                      <span className="text-[10px] text-zinc-500 font-mono ml-1">px</span>
                    </div>
                  </div>

                  {/* Size Slider */}
                  <input
                    type="range"
                    min="12"
                    max="128"
                    value={currentIconSize}
                    onChange={(e) => handleIconSizeChange(Number(e.target.value))}
                    className="w-full accent-[#0d99ff]"
                  />

                  {/* Quick Preset Size Pills */}
                  <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                    {[16, 20, 24, 32, 40, 48, 64].map((sz) => (
                      <button
                        key={sz}
                        onClick={() => handleIconSizeChange(sz)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                          currentIconSize === sz
                            ? 'bg-[#0d99ff] text-white border-[#0d99ff]'
                            : 'bg-[#252526] hover:bg-[#323232] text-zinc-400 border-[#383838]'
                        }`}
                      >
                        {sz}px
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. COLOR DE TRAZO / ICONO (STROKE / COLOR) */}
                <div className="space-y-1.5 pt-1 border-t border-[#383838]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-300">Color de Trazo (Stroke)</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {style.color || '#0d99ff'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#252526] border border-[#383838] focus-within:border-[#0d99ff] rounded-md p-1.5">
                    <input
                      type="color"
                      value={style.color?.startsWith('#') ? style.color : '#0d99ff'}
                      onChange={(e) => onUpdateStyle({ color: e.target.value, stroke: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border border-[#383838] bg-transparent"
                    />
                    <input
                      type="text"
                      value={style.color || ''}
                      onChange={(e) => onUpdateStyle({ color: e.target.value, stroke: e.target.value })}
                      placeholder="#0d99ff"
                      className="flex-1 bg-transparent text-white focus:outline-none text-xs font-mono"
                    />
                    <button
                      onClick={() => onUpdateStyle({ color: 'currentColor', stroke: 'currentColor' })}
                      className="px-2 py-0.5 text-[10px] rounded bg-[#1e1e1e] hover:bg-[#323232] text-zinc-400 hover:text-white transition-colors"
                      title="Heredar color de texto"
                    >
                      Inherit
                    </button>
                  </div>

                  {/* Preset Swatches */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {[
                      { color: '#ffffff', label: 'Blanco' },
                      { color: '#e4e4e7', label: 'Zinc Claro' },
                      { color: '#71717a', label: 'Gris' },
                      { color: '#0d99ff', label: 'Figma Blue' },
                      { color: '#8b5cf6', label: 'Violeta' },
                      { color: '#10b981', label: 'Esmeralda' },
                      { color: '#f59e0b', label: 'Ámbar' },
                      { color: '#ef4444', label: 'Rojo' },
                    ].map((sw) => (
                      <button
                        key={sw.color}
                        onClick={() => onUpdateStyle({ color: sw.color, stroke: sw.color })}
                        style={{ backgroundColor: sw.color }}
                        title={sw.label}
                        className={`w-4 h-4 rounded-full border border-black/40 hover:scale-110 transition-transform ${
                          style.color === sw.color
                            ? 'ring-2 ring-[#0d99ff] ring-offset-1 ring-offset-[#1e1e1e]'
                            : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* 3. COLOR DE RELLENO (FILL) */}
                <div className="space-y-1.5 pt-1 border-t border-[#383838]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-300">Relleno del Icono (Fill)</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {style.fill || props.fill || 'none'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#252526] border border-[#383838] focus-within:border-[#0d99ff] rounded-md p-1.5">
                    <input
                      type="color"
                      value={style.fill?.startsWith('#') ? style.fill : '#0d99ff'}
                      onChange={(e) => {
                        onUpdateStyle({ fill: e.target.value });
                        onUpdateProps({ fill: e.target.value });
                      }}
                      className="w-6 h-6 rounded cursor-pointer border border-[#383838] bg-transparent"
                    />
                    <input
                      type="text"
                      value={style.fill || props.fill || 'none'}
                      onChange={(e) => {
                        onUpdateStyle({ fill: e.target.value });
                        onUpdateProps({ fill: e.target.value });
                      }}
                      className="flex-1 bg-transparent text-white focus:outline-none text-xs font-mono"
                    />
                    <button
                      onClick={() => {
                        onUpdateStyle({ fill: 'none' });
                        onUpdateProps({ fill: 'none' });
                      }}
                      className="px-2 py-0.5 text-[10px] rounded bg-[#1e1e1e] hover:bg-[#323232] text-zinc-400 hover:text-white transition-colors"
                      title="Sin relleno (transparente)"
                    >
                      None
                    </button>
                  </div>
                </div>

                {/* 4. ORIENTACIÓN Y ROTACIÓN (TRANSFORM / FLIP) */}
                <div className="space-y-1.5 pt-1 border-t border-[#383838]">
                  <span className="text-[11px] font-medium text-zinc-300 block">Orientación & Rotación</span>
                  <div className="grid grid-cols-4 gap-1">
                    {[0, 90, 180, 270].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => handleIconTransform(deg, getIconFlipH(), getIconFlipV())}
                        className={`py-1 text-[10px] font-mono rounded border transition-colors flex items-center justify-center gap-1 ${
                          getIconRotation() === deg
                            ? 'bg-[#0d99ff] text-white border-[#0d99ff]'
                            : 'bg-[#252526] hover:bg-[#323232] text-zinc-300 border-[#383838]'
                        }`}
                      >
                        <RotateCw className="w-2.5 h-2.5" />
                        <span>{deg}°</span>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1 pt-1">
                    <button
                      onClick={() => handleIconTransform(getIconRotation(), !getIconFlipH(), getIconFlipV())}
                      className={`py-1 text-[10px] rounded border transition-colors flex items-center justify-center gap-1.5 ${
                        getIconFlipH()
                          ? 'bg-[#0d99ff] text-white border-[#0d99ff]'
                          : 'bg-[#252526] hover:bg-[#323232] text-zinc-300 border-[#383838]'
                      }`}
                      title="Voltear horizontalmente (Reflejo en X)"
                    >
                      <FlipHorizontal className="w-3 h-3" />
                      <span>Voltear H</span>
                    </button>
                    <button
                      onClick={() => handleIconTransform(getIconRotation(), getIconFlipH(), !getIconFlipV())}
                      className={`py-1 text-[10px] rounded border transition-colors flex items-center justify-center gap-1.5 ${
                        getIconFlipV()
                          ? 'bg-[#0d99ff] text-white border-[#0d99ff]'
                          : 'bg-[#252526] hover:bg-[#323232] text-zinc-300 border-[#383838]'
                      }`}
                      title="Voltear verticalmente (Reflejo en Y)"
                    >
                      <FlipVertical className="w-3 h-3" />
                      <span>Voltear V</span>
                    </button>
                  </div>
                </div>

                {/* 5. SELECTORES DE CATEGORÍA Y COLECCIÓN OFFLINE */}
                <div className="space-y-2 pt-1 border-t border-[#383838]">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-medium">Categoría Temática</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setSelectedCategory(newCat);
                        const sets = getCollectionsByCategory(newCat);
                        if (sets.length > 0 && !sets.some((s) => s.prefix === selectedCollection)) {
                          setSelectedCollection(sets[0].prefix);
                        }
                      }}
                      className="w-full bg-[#252526] border border-[#383838] rounded px-2.5 py-1 text-white text-xs focus:outline-none focus:border-[#0d99ff]"
                    >
                      {iconCategories.map((cat) => (
                        <option key={cat.id} value={cat.id} className="bg-[#1e1e1e]">
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span>Colección Iconify (Offline)</span>
                      <span className="text-zinc-500 font-mono">
                        {currentCollectionMeta?.total.toLocaleString() || 0} iconos
                      </span>
                    </div>
                    <select
                      value={selectedCollection}
                      onChange={(e) => setSelectedCollection(e.target.value)}
                      className="w-full bg-[#252526] border border-[#383838] rounded px-2.5 py-1 text-white text-xs focus:outline-none focus:border-[#0d99ff]"
                    >
                      {availableCollections.map((col) => (
                        <option key={col.prefix} value={col.prefix} className="bg-[#1e1e1e]">
                          {col.name} ({col.total.toLocaleString()} iconos)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* 5. TYPOGRAPHY (Excluido para iconos vectoriales)          */}
          {/* ======================================================== */}
          {!isIcon && (
          <div className="pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-[#0d99ff]" />
                <span>Typography</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {style.fontSize || 'inherit'}
              </span>
            </div>

            {/* Font Size & Weight Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center bg-[#1e1e1e] border border-[#383838] focus-within:border-[#0d99ff] rounded px-2 py-1">
                <span className="text-zinc-500 text-[11px] mr-1">Size</span>
                <input
                  type="text"
                  value={style.fontSize || '16px'}
                  onChange={(e) => onUpdateStyle({ fontSize: e.target.value })}
                  placeholder="16px"
                  className="w-full bg-transparent text-white focus:outline-none text-xs text-right font-mono"
                />
              </div>

              <div className="flex items-center bg-[#1e1e1e] border border-[#383838] focus-within:border-[#0d99ff] rounded px-2 py-1">
                <span className="text-zinc-500 text-[11px] mr-1">Weight</span>
                <select
                  value={style.fontWeight || '400'}
                  onChange={(e) => onUpdateStyle({ fontWeight: e.target.value })}
                  className="w-full bg-transparent text-white focus:outline-none text-xs"
                >
                  <option value="100" className="bg-[#1e1e1e]">Thin (100)</option>
                  <option value="200" className="bg-[#1e1e1e]">Extra-Light (200)</option>
                  <option value="300" className="bg-[#1e1e1e]">Light (300)</option>
                  <option value="400" className="bg-[#1e1e1e]">Regular (400)</option>
                  <option value="500" className="bg-[#1e1e1e]">Medium (500)</option>
                  <option value="600" className="bg-[#1e1e1e]">Semi-Bold (600)</option>
                  <option value="700" className="bg-[#1e1e1e]">Bold (700)</option>
                  <option value="800" className="bg-[#1e1e1e]">Extra-Bold (800)</option>
                  <option value="900" className="bg-[#1e1e1e]">Black (900)</option>
                </select>
              </div>
            </div>

            {/* Quick Size Presets */}
            <div className="flex items-center gap-1 flex-wrap">
              {['12px', '14px', '16px', '18px', '20px', '24px', '32px', '40px'].map((sz) => (
                <button
                  key={sz}
                  onClick={() => onUpdateStyle({ fontSize: sz })}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                    style.fontSize === sz
                      ? 'bg-[#0d99ff] text-white border-[#0d99ff]'
                      : 'bg-[#1e1e1e] hover:bg-[#323232] text-zinc-400 border-[#383838]'
                  }`}
                >
                  {sz.replace('px', '')}
                </button>
              ))}
            </div>

            {/* Line Height & Letter Spacing Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center bg-[#1e1e1e] border border-[#383838] focus-within:border-[#0d99ff] rounded px-2 py-1" title="Line Height (Interlineado)">
                <span className="text-zinc-500 text-[11px] mr-1 font-mono">LH</span>
                <input
                  type="text"
                  value={style.lineHeight || '1.5'}
                  onChange={(e) => onUpdateStyle({ lineHeight: e.target.value })}
                  placeholder="1.5"
                  className="w-full bg-transparent text-white focus:outline-none text-xs text-right font-mono"
                />
              </div>

              <div className="flex items-center bg-[#1e1e1e] border border-[#383838] focus-within:border-[#0d99ff] rounded px-2 py-1" title="Letter Spacing / Tracking (Espaciado entre letras)">
                <span className="text-zinc-500 text-[11px] mr-1 font-mono">LS</span>
                <input
                  type="text"
                  value={style.letterSpacing || '0px'}
                  onChange={(e) => onUpdateStyle({ letterSpacing: e.target.value })}
                  placeholder="0px"
                  className="w-full bg-transparent text-white focus:outline-none text-xs text-right font-mono"
                />
              </div>
            </div>

            {/* Text Alignment (Left, Center, Right, Justify) */}
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 font-medium block">Alineación</span>
              <div className="grid grid-cols-4 gap-1 bg-[#1e1e1e] p-1 rounded-lg border border-[#383838]">
                {[
                  { align: 'left', icon: AlignLeft, label: 'Izquierda' },
                  { align: 'center', icon: AlignCenter, label: 'Centro' },
                  { align: 'right', icon: AlignRight, label: 'Derecha' },
                  { align: 'justify', icon: AlignJustify, label: 'Justificado' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = (style.textAlign || 'left') === item.align;
                  return (
                    <button
                      key={item.align}
                      onClick={() => onUpdateStyle({ textAlign: item.align })}
                      title={item.label}
                      className={`p-1 rounded flex justify-center items-center transition-colors ${
                        isActive
                          ? 'bg-[#0d99ff] text-white shadow-xs'
                          : 'text-zinc-400 hover:text-white hover:bg-[#323232]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Text Transform & Decoration */}
            <div className="grid grid-cols-2 gap-2">
              {/* Transform */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 font-medium block">Transformación</span>
                <div className="grid grid-cols-4 gap-0.5 bg-[#1e1e1e] p-0.5 rounded border border-[#383838]">
                  {[
                    { val: 'none', label: 'Aa', title: 'Normal' },
                    { val: 'uppercase', label: 'AA', title: 'Mayúsculas' },
                    { val: 'lowercase', label: 'aa', title: 'Minúsculas' },
                    { val: 'capitalize', label: 'Ab', title: 'Capitalizar' },
                  ].map((t) => (
                    <button
                      key={t.val}
                      onClick={() => onUpdateStyle({ textTransform: t.val })}
                      title={t.title}
                      className={`py-1 text-[10px] font-semibold rounded text-center transition-colors ${
                        (style.textTransform || 'none') === t.val
                          ? 'bg-[#0d99ff] text-white'
                          : 'text-zinc-400 hover:text-white hover:bg-[#323232]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Decoration */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 font-medium block">Decoración</span>
                <div className="grid grid-cols-3 gap-0.5 bg-[#1e1e1e] p-0.5 rounded border border-[#383838]">
                  {[
                    { val: 'none', label: '—', title: 'Ninguna' },
                    { val: 'underline', icon: Underline, title: 'Subrayado' },
                    { val: 'line-through', icon: Strikethrough, title: 'Tachado' },
                  ].map((d) => {
                    const Icon = d.icon;
                    const isActive = (style.textDecoration || 'none') === d.val;
                    return (
                      <button
                        key={d.val}
                        onClick={() => onUpdateStyle({ textDecoration: d.val })}
                        title={d.title}
                        className={`py-1 flex items-center justify-center text-[10px] rounded transition-colors ${
                          isActive
                            ? 'bg-[#0d99ff] text-white'
                            : 'text-zinc-400 hover:text-white hover:bg-[#323232]'
                        }`}
                      >
                        {Icon ? <Icon className="w-3 h-3" /> : d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Text Color (Color Picker, Hex, Swatches) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 font-medium">Color de Texto</span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {style.color || 'inherit'}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#383838] focus-within:border-[#0d99ff] rounded-md p-1.5">
                <input
                  type="color"
                  value={style.color?.startsWith('#') ? style.color : '#ffffff'}
                  onChange={(e) => onUpdateStyle({ color: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-[#383838] bg-transparent"
                />
                <input
                  type="text"
                  value={style.color || ''}
                  onChange={(e) => onUpdateStyle({ color: e.target.value })}
                  placeholder="#ffffff"
                  className="flex-1 bg-transparent text-white focus:outline-none text-xs font-mono"
                />
                <button
                  onClick={() => onUpdateStyle({ color: 'inherit' })}
                  className="px-2 py-0.5 text-[10px] rounded bg-[#2c2c2c] hover:bg-[#383838] text-zinc-400 hover:text-white transition-colors"
                  title="Heredar color de texto"
                >
                  Clear
                </button>
              </div>

              {/* Color Presets */}
              <div className="flex items-center gap-1.5 pt-0.5">
                {[
                  { color: '#ffffff', label: 'Blanco' },
                  { color: '#e4e4e7', label: 'Zinc Claro' },
                  { color: '#a1a1aa', label: 'Zinc Medio' },
                  { color: '#71717a', label: 'Gris' },
                  { color: '#0d99ff', label: 'Figma Blue' },
                  { color: '#8b5cf6', label: 'Violeta' },
                  { color: '#10b981', label: 'Esmeralda' },
                  { color: '#f59e0b', label: 'Ámbar' },
                  { color: '#ef4444', label: 'Rojo' },
                  { color: '#18181b', label: 'Oscuro' },
                ].map((sw) => (
                  <button
                    key={sw.color}
                    onClick={() => onUpdateStyle({ color: sw.color })}
                    style={{ backgroundColor: sw.color }}
                    title={sw.label}
                    className={`w-4 h-4 rounded-full border border-black/40 hover:scale-110 transition-transform ${
                      style.color === sw.color
                        ? 'ring-2 ring-[#0d99ff] ring-offset-1 ring-offset-[#1e1e1e]'
                        : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          )}

          {/* ======================================================== */}
          {/* 6. FILL                                                  */}
          {/* ======================================================== */}
          <div className="pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#0d99ff]" />
                <span>Fill</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {style.backgroundColor || 'transparent'}
              </span>
            </div>

            {/* Background Color Picker & Hex */}
            <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#383838] focus-within:border-[#0d99ff] rounded-md p-1.5">
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
                className="px-2 py-0.5 text-[10px] rounded bg-[#2c2c2c] hover:bg-[#383838] text-zinc-400 hover:text-white transition-colors"
                title="Fondo transparente"
              >
                Clear
              </button>
            </div>

            {/* Background Presets */}
            <div className="flex items-center gap-1.5 pt-0.5">
              {[
                { color: 'transparent', label: 'Transparente' },
                { color: '#09090b', label: 'Zinc 950' },
                { color: '#18181b', label: 'Zinc 900' },
                { color: '#27272a', label: 'Zinc 800' },
                { color: '#0d99ff', label: 'Figma Blue' },
                { color: '#10b981', label: 'Esmeralda' },
                { color: '#ef4444', label: 'Rojo' },
                { color: '#ffffff', label: 'Blanco' },
              ].map((sw) => (
                <button
                  key={sw.color}
                  onClick={() => onUpdateStyle({ backgroundColor: sw.color })}
                  style={{
                    backgroundColor: sw.color === 'transparent' ? '#252526' : sw.color,
                  }}
                  title={sw.label}
                  className={`w-4 h-4 rounded border border-black/40 hover:scale-110 transition-transform ${
                    style.backgroundColor === sw.color
                      ? 'ring-2 ring-[#0d99ff] ring-offset-1 ring-offset-[#1e1e1e]'
                      : ''
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ======================================================== */}
          {/* 7. STROKE & BORDERS                                      */}
          {/* ======================================================== */}
          <div className="pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Square className="w-3.5 h-3.5 text-[#0d99ff]" />
                <span>Stroke</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {style.borderRadius || '0px'}
              </span>
            </div>

            {/* Corner Radius */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 font-medium">Radio de Esquinas (Corner Radius)</span>
                <div className="w-20 flex items-center bg-[#1e1e1e] border border-[#383838] focus-within:border-[#0d99ff] rounded px-2 py-0.5">
                  <input
                    type="text"
                    value={style.borderRadius || '0px'}
                    onChange={(e) => onUpdateStyle({ borderRadius: e.target.value })}
                    className="w-full bg-transparent text-white focus:outline-none text-xs text-right font-mono"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1">
                {['0px', '4px', '8px', '12px', '16px', '9999px'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => onUpdateStyle({ borderRadius: preset })}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                      style.borderRadius === preset
                        ? 'bg-[#0d99ff] text-white border-[#0d99ff]'
                        : 'bg-[#1e1e1e] hover:bg-[#323232] text-zinc-400 border-[#383838]'
                    }`}
                  >
                    {preset === '9999px' ? 'Pill' : preset.replace('px', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Border Width & Style */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 font-medium block">Grosor de Borde</span>
                <div className="flex items-center bg-[#1e1e1e] border border-[#383838] focus-within:border-[#0d99ff] rounded px-2 py-1">
                  <input
                    type="text"
                    value={style.borderWidth || '0px'}
                    onChange={(e) => onUpdateStyle({ borderWidth: e.target.value, borderStyle: style.borderStyle || 'solid' })}
                    placeholder="0px"
                    className="w-full bg-transparent text-white focus:outline-none text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 font-medium block">Estilo de Borde</span>
                <select
                  value={style.borderStyle || 'solid'}
                  onChange={(e) => onUpdateStyle({ borderStyle: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-[#383838] focus:border-[#0d99ff] rounded px-2 py-1 text-white text-xs focus:outline-none"
                >
                  <option value="solid" className="bg-[#1e1e1e]">Solid (Sólido)</option>
                  <option value="dashed" className="bg-[#1e1e1e]">Dashed (Guiones)</option>
                  <option value="dotted" className="bg-[#1e1e1e]">Dotted (Puntos)</option>
                  <option value="none" className="bg-[#1e1e1e]">None (Sin borde)</option>
                </select>
              </div>
            </div>

            {/* Border Color */}
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 font-medium block">Color de Borde</span>
              <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#383838] focus-within:border-[#0d99ff] rounded-md p-1.5">
                <input
                  type="color"
                  value={style.borderColor?.startsWith('#') ? style.borderColor : '#27272a'}
                  onChange={(e) => onUpdateStyle({ borderColor: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer border border-[#383838] bg-transparent"
                />
                <input
                  type="text"
                  value={style.borderColor || 'none'}
                  onChange={(e) => onUpdateStyle({ borderColor: e.target.value })}
                  className="flex-1 bg-transparent text-white focus:outline-none text-xs font-mono"
                />
                <button
                  onClick={() => onUpdateStyle({ borderColor: 'transparent', borderWidth: '0px' })}
                  className="px-2 py-0.5 text-[10px] rounded bg-[#2c2c2c] hover:bg-[#383838] text-zinc-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 8. EFFECTS & LAYER                                       */}
          {/* ======================================================== */}
          <div className="pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0d99ff]" />
                <span>Effects & Layer</span>
              </span>
            </div>

            {/* Box Shadow */}
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 font-medium block">Sombra (Box Shadow)</span>
              <select
                value={style.boxShadow || 'none'}
                onChange={(e) => onUpdateStyle({ boxShadow: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-[#383838] focus:border-[#0d99ff] rounded px-2.5 py-1 text-white text-xs focus:outline-none"
              >
                <option value="none" className="bg-[#1e1e1e]">Ninguna (None)</option>
                <option value="0 1px 2px 0 rgb(0 0 0 / 0.05)" className="bg-[#1e1e1e]">Small (Sutil)</option>
                <option value="0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" className="bg-[#1e1e1e]">Medium</option>
                <option value="0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" className="bg-[#1e1e1e]">Large</option>
                <option value="0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" className="bg-[#1e1e1e]">Extra Large</option>
                <option value="0 0 15px rgba(13, 153, 255, 0.4)" className="bg-[#1e1e1e]">Blue Glow (Neón Azul)</option>
                <option value="0 0 15px rgba(16, 185, 129, 0.4)" className="bg-[#1e1e1e]">Emerald Glow (Neón Verde)</option>
              </select>
            </div>

            {/* Opacity */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                <span>Opacidad (Layer Opacity)</span>
                <span className="font-mono text-zinc-300">
                  {Math.round(parseFloat(style.opacity ?? '1') * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={style.opacity !== undefined ? Number(style.opacity) : 1}
                onChange={(e) => onUpdateStyle({ opacity: e.target.value })}
                className="w-full accent-[#0d99ff]"
              />
            </div>
          </div>

          {/* Conditional ESP32 Hardware Inspector Section inside Design Tab */}
          {projectType === 'esp32' && isInteractiveForEsp32 && (
            <div className="pt-2">
              {renderHardwareGpioContent(false)}
            </div>
          )}
        </div>
      )}

      {/* Inspect / Code Tab */}
      {activeTab === 'inspect' && (
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

      {/* Hardware / GPIO ESP32 Tab */}
      {activeTab === 'hardware' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-2.5 text-emerald-200 text-xs">
            <Cpu className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-emerald-300">ESP32 Hardware Inspector</h3>
              <p className="text-[11px] text-emerald-400/80 mt-0.5">
                Componente activo: <span className="font-medium text-white">{selectedNode.name}</span> ({selectedNode.type})
              </p>
            </div>
          </div>
          {renderHardwareGpioContent(true)}
        </div>
      )}

      {/* Iconify Universal Offline Picker Modal */}
      {showIconModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#252526] border border-[#383838] rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#383838] flex items-center justify-between bg-[#2c2c2c] rounded-t-xl">
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-400" />
                <div>
                  <h3 className="font-semibold text-white text-sm">Explorador de Iconos Universal Iconify (Offline)</h3>
                  <p className="text-[10px] text-zinc-400">
                    {currentCollectionMeta?.name} • {currentCollectionMeta?.total.toLocaleString()} iconos disponibles localmente
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

            {/* Modal Filters: Categoría, Colección, Subcategoría y Buscador */}
            <div className="p-3 border-b border-[#383838] space-y-2.5 bg-[#202021]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Combobox Categoría */}
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Categoría Temática</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setSelectedCategory(newCat);
                      const sets = getCollectionsByCategory(newCat);
                      if (sets.length > 0 && !sets.some((s) => s.prefix === selectedCollection)) {
                        setSelectedCollection(sets[0].prefix);
                      }
                    }}
                    className="w-full bg-[#18181b] border border-[#383838] text-zinc-200 text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#0d99ff]"
                  >
                    {iconCategories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-[#18181b]">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Combobox Colección */}
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Colección ({availableCollections.length} sets)</label>
                  <select
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#383838] text-zinc-200 text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#0d99ff]"
                  >
                    {availableCollections.map((col) => (
                      <option key={col.prefix} value={col.prefix} className="bg-[#18181b]">
                        {col.name} ({col.total.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategoría si existe */}
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Subcategoría Interna</label>
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => {
                      setSelectedSubcategory(e.target.value);
                      setIconPage(1);
                    }}
                    disabled={subcategories.length <= 1}
                    className="w-full bg-[#18181b] border border-[#383838] text-zinc-200 text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#0d99ff] disabled:opacity-50"
                  >
                    {subcategories.map((sub) => (
                      <option key={sub} value={sub} className="bg-[#18181b]">
                        {sub === 'All' ? 'Todas las Subcategorías' : sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search box with Clear 'X' Button & Pagination Header */}
              <div className="flex items-center gap-3 pt-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder={`Buscar en ${currentCollectionMeta?.name || 'colección'}...`}
                    value={iconSearch}
                    onChange={(e) => {
                      setIconSearch(e.target.value);
                      setIconPage(1);
                    }}
                    className="w-full bg-[#18181b] border border-[#383838] rounded-md pl-9 pr-8 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#0d99ff]"
                    autoFocus
                  />
                  {iconSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setIconSearch('');
                        setIconPage(1);
                      }}
                      className="absolute right-2.5 top-2 p-0.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-700 transition-colors"
                      title="Limpiar búsqueda"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[11px] text-zinc-400 mr-2 font-mono">
                    {filteredIcons.length.toLocaleString()} encontrados • Pág. {iconPage}/{totalPages}
                  </span>
                  <button
                    onClick={() => setIconPage((p) => Math.max(1, p - 1))}
                    disabled={iconPage <= 1}
                    className="px-2.5 py-1 rounded bg-[#2c2c2c] hover:bg-[#383838] disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 text-xs"
                  >
                    ◀ Prev
                  </button>
                  <button
                    onClick={() => setIconPage((p) => Math.min(totalPages, p + 1))}
                    disabled={iconPage >= totalPages}
                    className="px-2.5 py-1 rounded bg-[#2c2c2c] hover:bg-[#383838] disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 text-xs"
                  >
                    Next ▶
                  </button>
                </div>
              </div>
            </div>

            {/* Icon Grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {isLoadingCollection ? (
                <div className="col-span-full py-16 flex flex-col items-center justify-center text-zinc-400">
                  <div className="w-6 h-6 border-2 border-[#0d99ff] border-t-transparent rounded-full animate-spin mb-2" />
                  <span className="text-xs">Cargando colección local {selectedCollection}...</span>
                </div>
              ) : pageIcons.length === 0 ? (
                <div className="col-span-full py-16 text-center text-zinc-500 text-xs">
                  No se encontraron iconos que coincidan con "{iconSearch}"
                </div>
              ) : (
                pageIcons.map((name) => {
                  const fullId = `${selectedCollection}:${name}`;
                  const isCurrent = props.iconName === fullId;

                  return (
                    <button
                      key={fullId}
                      onClick={() => {
                        onUpdateProps({
                          library: 'iconify',
                          prefix: selectedCollection,
                          iconName: fullId,
                        });
                        setShowIconModal(false);
                      }}
                      className={`group flex flex-col items-center justify-center p-2.5 bg-[#1e1e1e] hover:bg-[#0d99ff]/15 border ${
                        isCurrent
                          ? 'border-[#0d99ff] bg-[#0d99ff]/10 ring-1 ring-[#0d99ff]'
                          : 'border-[#383838] hover:border-[#0d99ff]'
                      } rounded-lg transition-all text-center`}
                      title={fullId}
                    >
                      <SvgIconRenderer
                        iconId={fullId}
                        size={24}
                        stroke="currentColor"
                        fill="none"
                        className="mb-1.5 text-zinc-300 group-hover:text-[#0d99ff] transition-transform group-hover:scale-110"
                      />
                      <span className="text-[9px] text-zinc-400 group-hover:text-white truncate w-full font-mono">
                        {name}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
