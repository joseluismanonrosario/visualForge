import React, { useState, useMemo } from 'react';
import {
  Component,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Type,
  MousePointerClick,
  Link as LinkIcon,
  Sparkles,
  Image as ImageIcon,
  FileText,
  Tag,
  TextCursorInput,
  AlignLeft,
  CheckSquare,
  Radio,
  Box,
  Square,
  Columns,
  LineChart as LineChartIcon,
  BarChart3,
  PieChart,
  Activity,
  Gauge,
  Zap,
  Power,
  Sliders,
  GripVertical,
  Cpu,
} from 'lucide-react';
import { ComponentDefinition, ProjectType } from '../types';
import { getCatalogForProject } from '../data/componentCatalog';

export interface AssetsToolbarProps {
  projectType?: ProjectType;
  onInsertComponent: (compDef: ComponentDefinition) => void;
  className?: string;
}

interface AssetSectionGroup {
  id: string;
  title: string;
  items: ComponentDefinition[];
}

export const AssetsToolbar: React.FC<AssetsToolbarProps> = ({
  projectType = 'react',
  onInsertComponent,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('All');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    primitives: true,
    charts: true,
    hardware: true,
    'layout & structure': true,
  });

  const isFramework = projectType === 'react' || projectType === 'framework';
  const isEsp32 = projectType === 'esp32';

  // Obtenemos el catálogo correspondiente al proyecto
  const activeCatalog = useMemo(() => getCatalogForProject(projectType), [projectType]);

  // Lista de categorías para el selector de filtro
  const availableFilterCategories = useMemo(() => {
    return ['All', 'Primitives', 'Charts', ...(isEsp32 ? ['Hardware & IoT'] : []), 'Composite'];
  }, [isEsp32]);

  // Helper para limpiar el nombre del componente para visualización compacta
  const getCleanDisplayName = (name: string): string => {
    if (name.startsWith('Heading 1')) return 'Heading';
    if (name.startsWith('Heading 2')) return 'Heading 2';
    if (name.startsWith('Heading')) return 'Heading';
    if (name.startsWith('Paragraph')) return 'Paragraph';
    if (name.startsWith('Text (')) return 'Text';
    if (name.startsWith('Button (')) return 'Button';
    if (name.startsWith('Link (')) return 'Link';
    if (name.startsWith('Icon (')) return 'Icon';
    if (name.startsWith('Image (')) return 'Image';
    if (name.startsWith('Form (')) return 'Form';
    if (name.startsWith('Label (')) return 'Label';
    if (name.startsWith('Input (')) return 'Input';
    if (name.startsWith('Textarea (')) return 'Textarea';
    if (name.startsWith('Checkbox (')) return 'Checkbox';
    if (name.startsWith('Radio (')) return 'Radio';
    if (name.startsWith('Select /') || name.startsWith('Select (')) return 'Select';
    if (name.startsWith('Box (')) return 'Box';
    if (name.startsWith('Container')) return 'Container';
    if (name.startsWith('LineChart')) return 'LineChart';
    if (name.startsWith('BarChart')) return 'BarChart';
    if (name.startsWith('PieChart')) return 'PieChart';
    if (name.startsWith('AreaChart')) return 'AreaChart';
    if (name.startsWith('GaugeChart')) return 'GaugeChart';
    if (name.includes('Metric Card') || name.includes('Metric Widget')) return 'Metric Card';
    if (name.includes('Status Badge')) return 'Status Badge';
    if (name.includes('Relay Control')) return 'Relay Switch';
    if (name.includes('Control PWM') || name.includes('Slider / Range')) return 'PWM Slider';

    // Limpia paréntesis descriptivos si existen
    return name.replace(/\s*\([^)]*\)/g, '').trim() || name;
  };

  // Renderiza el icono representativo según las especificaciones
  const renderComponentIcon = (item: ComponentDefinition) => {
    const type = item.type.toLowerCase();
    const name = item.name.toLowerCase();

    // 1. Heading con icono 'T'
    if (name.includes('heading') || type === 'heading' || type === 'h1' || type === 'h2') {
      return (
        <span className="font-bold font-sans text-xs text-[#0d99ff] leading-none select-none">
          T
        </span>
      );
    }

    // 2. Paragraph con icono '¶' (Pilcrow)
    if (
      name.includes('paragraph') ||
      type === 'paragraph' ||
      (type === 'typography' && name.includes('paragraph'))
    ) {
      return (
        <span className="font-serif font-bold text-xs text-amber-400 leading-none select-none">
          ¶
        </span>
      );
    }

    // 3. Tipografía general
    if (type === 'typography' || type === 'text') {
      return <Type className="w-3.5 h-3.5 text-blue-400" />;
    }

    // 4. Button
    if (type === 'button') {
      return <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />;
    }

    // 5. Link
    if (type === 'link') {
      return <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />;
    }

    // 6. Icon
    if (type === 'svg_icon' || type === 'icon') {
      return <Sparkles className="w-3.5 h-3.5 text-yellow-400" />;
    }

    // 7. Image
    if (type === 'image') {
      return <ImageIcon className="w-3.5 h-3.5 text-purple-400" />;
    }

    // 8. Form
    if (type === 'form') {
      return <FileText className="w-3.5 h-3.5 text-indigo-400" />;
    }

    // 9. Label
    if (type === 'label') {
      return <Tag className="w-3.5 h-3.5 text-pink-400" />;
    }

    // 10. Input
    if (type === 'input') {
      return <TextCursorInput className="w-3.5 h-3.5 text-sky-400" />;
    }

    // 11. Textarea
    if (type === 'textarea') {
      return <AlignLeft className="w-3.5 h-3.5 text-teal-400" />;
    }

    // 12. Checkbox
    if (type === 'checkbox') {
      return <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />;
    }

    // 13. Radio
    if (type === 'radio') {
      return <Radio className="w-3.5 h-3.5 text-rose-400" />;
    }

    // 14. Select
    if (type === 'select') {
      return <ChevronDown className="w-3.5 h-3.5 text-orange-400" />;
    }

    // 15. Container
    if (type === 'container' || type === 'grid' || type === 'columns' || type === 'stack') {
      return <Square className="w-3.5 h-3.5 text-indigo-400" />;
    }

    // 16. Charts
    if (type === 'line_chart') {
      return <LineChartIcon className="w-3.5 h-3.5 text-blue-400" />;
    }
    if (type === 'bar_chart') {
      return <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (type === 'pie_chart') {
      return <PieChart className="w-3.5 h-3.5 text-purple-400" />;
    }
    if (type === 'area_chart') {
      return <Activity className="w-3.5 h-3.5 text-amber-400" />;
    }
    if (type === 'gauge_chart') {
      return <Gauge className="w-3.5 h-3.5 text-rose-400" />;
    }
    if (type === 'metric_card' || type === 'telemetry_card') {
      return <Zap className="w-3.5 h-3.5 text-amber-400" />;
    }

    // 17. Hardware Controls (ESP32)
    if (type === 'status_badge') {
      return <Activity className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (type === 'relay_switch') {
      return <Power className="w-3.5 h-3.5 text-rose-400" />;
    }
    if (type === 'pwm_slider') {
      return <Sliders className="w-3.5 h-3.5 text-indigo-400" />;
    }

    // Fallback general
    return <Component className="w-3.5 h-3.5 text-zinc-400" />;
  };

  // Agrupación en secciones estructuradas y colapsables ("Primitives", "Charts", etc.)
  const sectionGroups: AssetSectionGroup[] = useMemo(() => {
    const primitiveCategories = [
      'Text (Tipografía)',
      'Button / Link (Acción)',
      'Icon (Gráfico)',
      'Image (Multimedia)',
      'Form Controls (Entradas de datos)',
      'Box / Container (Layout)',
    ];

    const chartTypes = [
      'line_chart',
      'bar_chart',
      'pie_chart',
      'area_chart',
      'gauge_chart',
      'metric_card',
    ];

    const hardwareTypes = ['status_badge', 'relay_switch', 'pwm_slider'];

    // 1. Primitives Group
    const primitives = activeCatalog.filter(
      (item) =>
        primitiveCategories.includes(item.category) ||
        (item.catalog === 'both' &&
          !chartTypes.includes(item.type) &&
          !hardwareTypes.includes(item.type))
    );

    // 2. Charts Group
    const charts = activeCatalog.filter(
      (item) =>
        item.category === 'Charts' ||
        item.category === 'Charts (Gráficos)' ||
        chartTypes.includes(item.type)
    );

    // 3. Hardware Group (ESP32)
    const hardware = activeCatalog.filter(
      (item) => item.category === 'IoT & Telemetría (ESP32)' || hardwareTypes.includes(item.type)
    );

    // 4. Composite Libraries (Shadcn / Preline)
    const compositeItems = activeCatalog.filter(
      (item) =>
        !primitives.includes(item) &&
        !charts.includes(item) &&
        !hardware.includes(item)
    );

    // Agrupamos los compuestos por su categoría original
    const compositeMap = new Map<string, ComponentDefinition[]>();
    compositeItems.forEach((item) => {
      const cat = item.category || 'Otros Componentes';
      if (!compositeMap.has(cat)) {
        compositeMap.set(cat, []);
      }
      compositeMap.get(cat)!.push(item);
    });

    const groups: AssetSectionGroup[] = [];

    if (primitives.length > 0) {
      groups.push({
        id: 'primitives',
        title: 'Primitives',
        items: primitives,
      });
    }

    if (charts.length > 0) {
      groups.push({
        id: 'charts',
        title: 'Charts',
        items: charts,
      });
    }

    if (hardware.length > 0) {
      groups.push({
        id: 'hardware',
        title: 'Hardware & IoT (ESP32)',
        items: hardware,
      });
    }

    // Añadimos bloques para categorías de la biblioteca compuesta
    compositeMap.forEach((items, catName) => {
      groups.push({
        id: catName.toLowerCase(),
        title: catName,
        items,
      });
    });

    return groups;
  }, [activeCatalog]);

  // Filtrado por búsqueda y selector de categoría
  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sectionGroups
      .map((section) => {
        // Filtro por categoría seleccionada
        if (selectedFilterCategory === 'Primitives' && section.id !== 'primitives') return null;
        if (selectedFilterCategory === 'Charts' && section.id !== 'charts') return null;
        if (selectedFilterCategory === 'Hardware & IoT' && section.id !== 'hardware') return null;
        if (
          selectedFilterCategory === 'Composite' &&
          ['primitives', 'charts', 'hardware'].includes(section.id)
        )
          return null;

        // Filtro por término de búsqueda
        const matchingItems = section.items.filter((item) => {
          if (!query) return true;
          const cleanName = getCleanDisplayName(item.name).toLowerCase();
          const rawName = item.name.toLowerCase();
          const type = item.type.toLowerCase();
          const cat = item.category.toLowerCase();
          return (
            cleanName.includes(query) ||
            rawName.includes(query) ||
            type.includes(query) ||
            cat.includes(query)
          );
        });

        if (matchingItems.length === 0) return null;

        return {
          ...section,
          items: matchingItems,
        };
      })
      .filter((s): s is AssetSectionGroup => s !== null);
  }, [sectionGroups, searchQuery, selectedFilterCategory]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId] === false ? true : false,
    }));
  };

  const isSectionExpanded = (sectionId: string) => {
    // Si hay búsqueda activa, expande automáticamente para mostrar los resultados
    if (searchQuery.trim().length > 0) return true;
    return expandedSections[sectionId] !== false;
  };

  const totalCount = useMemo(() => {
    return activeCatalog.length;
  }, [activeCatalog]);

  return (
    <div
      className={`flex-1 flex flex-col bg-[#1e1e1e] text-zinc-300 select-none overflow-hidden h-full ${className}`}
    >
      {/* 1. Cabecera Principal "Assets" con estética moderna de editor */}
      <div className="px-3 py-2.5 border-b border-[#383838] bg-[#222223] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Component className="w-4 h-4 text-violet-400" />
          <h2 className="font-semibold text-xs text-white uppercase tracking-wider">Assets</h2>
          <span className="text-[10px] bg-[#2a2a2b] text-zinc-400 px-1.5 py-0.5 rounded border border-[#383838] font-mono">
            {totalCount}
          </span>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
            isFramework
              ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
              : isEsp32
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
          }`}
        >
          {isFramework ? (
            <>
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span>Shadcn UI</span>
            </>
          ) : isEsp32 ? (
            <>
              <Cpu className="w-3 h-3 text-amber-400" />
              <span>ESP32 IoT</span>
            </>
          ) : (
            <>
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span>Preline UI</span>
            </>
          )}
        </span>
      </div>

      {/* 2. Barra de Búsqueda y Filtro */}
      <div className="p-2 border-b border-[#383838] bg-[#252526] space-y-2 shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-[#383838] rounded-md pl-8 pr-7 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#0d99ff] focus:ring-1 focus:ring-[#0d99ff] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 p-0.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-700 transition-colors"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Selector de categoría rápida */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
          {availableFilterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilterCategory(cat)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors shrink-0 ${
                selectedFilterCategory === cat
                  ? 'bg-[#0d99ff] text-white shadow-xs'
                  : 'bg-[#1e1e1e] text-zinc-400 hover:text-zinc-200 hover:bg-[#323232] border border-[#383838]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Lista de Secciones Colapsables y Tarjetas */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {filteredSections.length === 0 ? (
          <div className="p-6 text-center text-zinc-500 text-xs">
            No components found matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredSections.map((section) => {
            const isExpanded = isSectionExpanded(section.id);

            return (
              <div
                key={section.id}
                className="border border-[#2c2c2e] bg-[#222223] rounded-lg overflow-hidden transition-all"
              >
                {/* Encabezado colapsable con flecha indicadora */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-[#2a2a2b] transition-colors text-left group"
                >
                  <div className="flex items-center gap-1.5">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                    )}
                    <span className="font-semibold text-[11px] text-zinc-300 group-hover:text-white uppercase tracking-wider">
                      {section.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-[#333333]">
                    {section.items.length}
                  </span>
                </button>

                {/* Grid de tarjetas compactas */}
                {isExpanded && (
                  <div className="p-2 pt-1 border-t border-[#2c2c2e] bg-[#1a1a1a]">
                    <div className="grid grid-cols-2 gap-2">
                      {section.items.map((item) => {
                        const displayName = getCleanDisplayName(item.name);

                        return (
                          <div
                            key={`${item.catalog || 'c'}_${item.type}_${item.name}`}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData(
                                'application/json',
                                JSON.stringify({
                                  sourceType: 'catalog',
                                  componentType: item.type,
                                  componentName: item.name,
                                  catalog: item.catalog,
                                })
                              );
                              e.dataTransfer.setData('text/plain', item.name);
                            }}
                            onClick={() => onInsertComponent(item)}
                            className="group bg-[#252526] hover:bg-[#2c2c2e] border border-[#383838] hover:border-[#0d99ff] rounded-lg p-2 flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all hover:shadow-md select-none"
                            title={`Click to add or drag to canvas: ${displayName}`}
                          >
                            {/* Fila superior: Icono representativo a la izquierda + Nombre */}
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-[#1e1e1e] border border-[#383838] flex items-center justify-center shrink-0 group-hover:border-[#0d99ff]/50 transition-colors">
                                {renderComponentIcon(item)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="font-medium text-xs text-zinc-200 group-hover:text-white truncate block">
                                  {displayName}
                                </span>
                              </div>
                            </div>

                            {/* Fila inferior: Texto de guía "Drag to UI" */}
                            <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#383838]/40 text-[9px] text-zinc-500">
                              <span className="group-hover:text-zinc-300 transition-colors font-medium">
                                Drag to UI
                              </span>
                              <GripVertical className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
