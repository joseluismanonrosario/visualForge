import React, { useState, useEffect } from 'react';
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
  Cpu,
  Zap,
  Radio,
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

            {/* If Switch */}
            {selectedNode.type === 'switch' && (
              <div className="space-y-1.5">
                <label className="text-zinc-400 text-[11px]">Etiqueta Switch</label>
                <input
                  type="text"
                  value={props.label || ''}
                  onChange={(e) => onUpdateProps({ label: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 text-white focus:outline-none"
                />
              </div>
            )}

            {/* If Slider */}
            {selectedNode.type === 'slider' && (
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-zinc-400 text-[11px]">Etiqueta Slider</label>
                  <input
                    type="text"
                    value={props.label || ''}
                    onChange={(e) => onUpdateProps({ label: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-[#383838] rounded px-2 py-1 text-white focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-zinc-500">Mínimo</span>
                    <input
                      type="number"
                      value={props.min ?? 0}
                      onChange={(e) => onUpdateProps({ min: Number(e.target.value) })}
                      className="w-full bg-[#1e1e1e] border border-[#383838] rounded px-1.5 py-1 text-white text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500">Máximo</span>
                    <input
                      type="number"
                      value={props.max ?? 255}
                      onChange={(e) => onUpdateProps({ max: Number(e.target.value) })}
                      className="w-full bg-[#1e1e1e] border border-[#383838] rounded px-1.5 py-1 text-white text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500">Valor</span>
                    <input
                      type="number"
                      value={props.value ?? 128}
                      onChange={(e) => onUpdateProps({ value: Number(e.target.value) })}
                      className="w-full bg-[#1e1e1e] border border-[#383838] rounded px-1.5 py-1 text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* If Vector Icon Component (Iconify Universal Offline) */}
            {(selectedNode.type === 'fontawesome_icon' || selectedNode.type === 'svg_icon') && (
              <div className="space-y-3 bg-[#1e1e1e] p-2.5 rounded-lg border border-[#383838]">
                {/* 1. Header with Live Icon Preview and Explorar Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded bg-[#252526] border border-[#383838] flex items-center justify-center">
                      <SvgIconRenderer
                        iconId={props.iconName || 'lucide:rocket'}
                        size={22}
                        stroke={style.color || '#0d99ff'}
                        fill={style.fill || 'none'}
                      />
                    </div>
                    <div>
                      <span className="font-mono text-zinc-200 block text-xs truncate max-w-[130px]">
                        {props.iconName || 'lucide:rocket'}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-sans">
                        {currentCollectionMeta?.name || 'Iconify Set'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIconSearch('');
                      setIconPage(1);
                      setShowIconModal(true);
                    }}
                    className="px-2.5 py-1 rounded bg-[#0d99ff] text-white font-medium hover:bg-[#0082df] text-[11px] shadow-xs"
                  >
                    Explorar
                  </button>
                </div>

                {/* 2. Combobox: Categoría Temática de Iconify */}
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-medium">Categoría de Iconos</label>
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
                    className="w-full bg-[#252526] border border-[#383838] rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-[#0d99ff]"
                  >
                    {iconCategories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-[#1e1e1e]">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Combobox: Colección / Set de Iconify (244 sets disponibles localmente) */}
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
                    className="w-full bg-[#252526] border border-[#383838] rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-[#0d99ff]"
                  >
                    {availableCollections.map((col) => (
                      <option key={col.prefix} value={col.prefix} className="bg-[#1e1e1e]">
                        {col.name} ({col.total.toLocaleString()} iconos)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Subcategoría interna si la colección lo soporta */}
                {subcategories.length > 1 && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-medium">Subcategoría Interna</label>
                    <select
                      value={selectedSubcategory}
                      onChange={(e) => {
                        setSelectedSubcategory(e.target.value);
                        setIconPage(1);
                      }}
                      className="w-full bg-[#252526] border border-[#383838] rounded px-2 py-1 text-white text-xs focus:outline-none"
                    >
                      {subcategories.map((sub) => (
                        <option key={sub} value={sub} className="bg-[#1e1e1e]">
                          {sub === 'All' ? 'Todas las Subcategorías' : sub}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

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
            {/* Conditional ESP32 Hardware Inspector Section inside Design Tab */}
            {projectType === 'esp32' && isInteractiveForEsp32 && (
              <div className="pt-2">
                {renderHardwareGpioContent(false)}
              </div>
            )}
          </div>
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
