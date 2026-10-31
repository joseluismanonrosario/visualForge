import React, { useState } from 'react';
import { ProjectType, ResolvedTheme, RecentProjectItem } from '../types';
import {
  FilePlus2,
  FolderOpen,
  File,
  PanelsTopLeft,
  Activity,
  Code2,
  FileCode2,
  Clock,
  X,
} from 'lucide-react';
import { getLogoForTheme } from './TopBar';
import { getRecentProjects } from '../utils/recentProjects';

interface TemplateOption {
  id: 'blank' | 'saas' | 'iot';
  title: string;
  description: string;
  icon: 'file' | 'panels' | 'activity';
}

interface ProjectTypeOption {
  id: ProjectType;
  title: string;
  description: string;
  defaultName: string;
  templates: TemplateOption[];
}

const PROJECT_TYPE_OPTIONS: ProjectTypeOption[] = [
  {
    id: 'html_css',
    title: 'HTML / CSS Tradicional',
    description:
      'Sitios web y páginas estáticas optimizadas, con SVGs en línea y sin dependencias de frameworks.',
    defaultName: 'Landing Page HTML & CSS',
    templates: [
      {
        id: 'blank',
        title: 'Lienzo en Blanco',
        description: 'Empieza con un artboard limpio.',
        icon: 'file',
      },
      {
        id: 'saas',
        title: 'SaaS Landing Page',
        description: 'Navbar, Hero y Feature Cards',
        icon: 'panels',
      },
    ],
  },
  {
    id: 'react',
    title: 'React Web (Frontend Moderno)',
    description:
      'Aplicaciones web modernas modulares con componentes JSX limpios, shadcn/ui y Tailwind CSS v4.',
    defaultName: 'React 19 Web App',
    templates: [
      {
        id: 'blank',
        title: 'Lienzo en Blanco',
        description: 'Empieza con un artboard limpio para React 19.',
        icon: 'file',
      },
      {
        id: 'saas',
        title: 'SaaS Landing Page',
        description:
          'Componentes modulares de Shadcn UI, Hero y Sección de Características.',
        icon: 'panels',
      },
    ],
  },
  {
    id: 'esp32',
    title: 'ESP32 / IoT (Microcontroladores)',
    description:
      'Interfaces web embebidas para ESP32 con control GPIO, firmware C++ ESPAsyncWebServer y SVGs inline.',
    defaultName: 'ESP32 IoT WebServer',
    templates: [
      {
        id: 'blank',
        title: 'Lienzo en Blanco',
        description: 'Empieza con un artboard limpio para microcontroladores.',
        icon: 'file',
      },
      {
        id: 'iot',
        title: 'Dashboard IoT ESP32',
        description:
          'Interruptores GPIO, sliders PWM, medidores y telemetría en tiempo real.',
        icon: 'activity',
      },
    ],
  },
];

/* Custom SVG Icons matching reference screenshot */
const Esp32ChipIcon: React.FC<{ className?: string }> = ({
  className = 'text-zinc-200',
}) => (
  <svg
    viewBox="0 0 24 24"
    className={`w-7 h-7 flex-shrink-0 ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="5" y="5" width="14" height="14" rx="2" />
    <path d="M9 9h6v6H9z" />
    <path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4" />
  </svg>
);

const Html5ShieldIcon: React.FC<{ className?: string }> = ({
  className = 'text-zinc-100',
}) => (
  <svg
    viewBox="0 0 24 24"
    className={`w-7 h-7 flex-shrink-0 ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 3l1.8 17.2L12 22l6.2-1.8L20 3H4z" />
    <path d="M8 8h8M8 12h7.5M8 12l.5 5 3.5 1 3.5-1 .3-3" strokeWidth="1.8" />
  </svg>
);

const ReactAtomIcon: React.FC<{ className?: string }> = ({
  className = 'text-zinc-100',
}) => (
  <svg
    viewBox="-11.5 -10.23174 23 20.46348"
    className={`w-7 h-7 flex-shrink-0 ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
  >
    <circle cx="0" cy="0" r="2.2" fill="currentColor" stroke="none" />
    <ellipse rx="11" ry="4.2" />
    <ellipse rx="11" ry="4.2" transform="rotate(60)" />
    <ellipse rx="11" ry="4.2" transform="rotate(120)" />
  </svg>
);

interface ProjectCreationScreenProps {
  isOpen: boolean;
  canCancel: boolean;
  onCancel: () => void;
  onCreateProject: (
    name: string,
    type: ProjectType,
    template: 'iot' | 'saas' | 'blank'
  ) => void;
  onOpenProject?: () => void;
  currentType?: ProjectType;
  resolvedTheme?: ResolvedTheme;
  recentProjects?: RecentProjectItem[];
  onOpenRecentProject?: (project: RecentProjectItem) => void;
}

export const ProjectCreationScreen: React.FC<ProjectCreationScreenProps> = ({
  isOpen,
  canCancel,
  onCancel,
  onCreateProject,
  onOpenProject,
  currentType = 'html_css',
  resolvedTheme = 'dark',
  recentProjects,
  onOpenRecentProject,
}) => {
  // Proyectos recientes organizados alfabéticamente
  const effectiveRecents =
    recentProjects && recentProjects.length > 0
      ? recentProjects
      : getRecentProjects();
  // Active selected project type (default to HTML/CSS or current)
  const [selectedTypeId, setSelectedTypeId] = useState<ProjectType>(() => {
    if (currentType === 'esp32' || currentType === 'react') return currentType;
    return 'html_css';
  });

  // Current active project option object
  const activeProjectOption =
    PROJECT_TYPE_OPTIONS.find((p) => p.id === selectedTypeId) ||
    PROJECT_TYPE_OPTIONS[0];

  // Active selected template within the chosen project type
  const [selectedTemplateId, setSelectedTemplateId] = useState<
    'blank' | 'saas' | 'iot'
  >('blank');

  // Handle switching project type
  const handleSelectType = (typeId: ProjectType) => {
    setSelectedTypeId(typeId);
    const newOption = PROJECT_TYPE_OPTIONS.find((p) => p.id === typeId);
    if (newOption && !newOption.templates.some((t) => t.id === selectedTemplateId)) {
      setSelectedTemplateId(newOption.templates[0].id);
    }
  };

  const handleNext = () => {
    onCreateProject(
      activeProjectOption.defaultName,
      selectedTypeId,
      selectedTemplateId
    );
  };

  if (!isOpen) return null;

  // Theme-aware styles for cards and elements
  const isLight = resolvedTheme === 'light';
  const isBlue = resolvedTheme === 'blue';

  const cardBorder = isLight
    ? 'border-zinc-200'
    : isBlue
    ? 'border-[#1e293b]'
    : 'border-[#38393e]';

  const cardBg = isLight
    ? 'bg-white'
    : isBlue
    ? 'bg-[#0f172a]'
    : 'bg-[#1b1c1e]';

  const dividerBorder = isLight
    ? 'border-zinc-200'
    : isBlue
    ? 'border-[#1e293b]'
    : 'border-[#2e2f33]';

  const titleColor = isLight ? 'text-zinc-900' : 'text-white';
  const h2Color = isLight
    ? 'text-[#0d99ff]'
    : isBlue
    ? 'text-[#38bdf8]'
    : 'text-[#0d99ff]';

  const textColor = isLight ? 'text-zinc-900' : 'text-white';
  const textMuted = isLight
    ? 'text-zinc-500'
    : isBlue
    ? 'text-slate-400'
    : 'text-zinc-400';

  const itemActiveClass = isLight
    ? 'bg-sky-50/70 border-2 border-[#0d99ff] ring-1 ring-[#0d99ff]/30 shadow-[0_0_16px_rgba(13,153,255,0.15)]'
    : isBlue
    ? 'bg-[#131c31] border-2 border-[#38bdf8] ring-1 ring-[#38bdf8]/40 shadow-[0_0_18px_rgba(56,189,248,0.25)]'
    : 'bg-[#1e1e22] border-2 border-[#00d2ff] ring-1 ring-[#00d2ff]/40 shadow-[0_0_18px_rgba(0,210,255,0.25)]';

  const itemInactiveClass = isLight
    ? 'bg-zinc-50 border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100'
    : isBlue
    ? 'bg-[#131c31] border border-[#1f2c4a] hover:border-sky-500/50 hover:bg-[#1a2542]'
    : 'bg-[#1e1e22] border border-[#333336] hover:border-zinc-500 hover:bg-[#25252a]';

  const iconClass = isLight ? 'text-zinc-700' : 'text-zinc-100';

  return (
    <div
      className={`w-full max-w-4xl mx-auto my-auto ${cardBg} border ${cardBorder} rounded-2xl shadow-2xl p-6 sm:p-7 select-none animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-5`}
    >
      {/* Top Header inside Card: VisualForge branding + Logo, h2 Iniciar alineado verticalmente con el logo y descripción */}
      <div className={`flex items-start justify-between pb-4 border-b ${dividerBorder}`}>
        <div className="flex flex-col gap-1.5">
          {/* Fila 1: Logo alineado horizontalmente con VisualForge */}
          <div className="flex items-center gap-2.5">
            <img
              src={getLogoForTheme(resolvedTheme)}
              alt="VisualForge"
              className="w-7 h-7 aspect-square object-contain flex-shrink-0 select-none pointer-events-none"
            />
            <span
              className={`text-xl sm:text-2xl font-bold tracking-tight leading-none ${titleColor}`}
            >
              VisualForge
            </span>
          </div>

          {/* Fila 2: Iniciar alineado verticalmente con el logo y pequeña descripción debajo */}
          <div className="flex flex-col gap-0.5">
            <h2
              className={`text-base sm:text-lg font-semibold tracking-tight ${h2Color}`}
            >
              Iniciar
            </h2>
            <p className={`text-xs ${textMuted}`}>
              Selecciona el entorno de trabajo y la plantilla inicial para comenzar
            </p>
          </div>
        </div>

        {canCancel && (
          <button
            onClick={onCancel}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer mt-0.5 ${
              isLight
                ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                : 'text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
            title="Regresar al proyecto actual"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3 Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Column 1: Actions & Recents (Left, 4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-3.5">
          {/* Action 1: Crear un proyecto (Active) */}
          <div
            className={`p-3.5 rounded-xl flex items-start gap-3 cursor-pointer transition-all ${itemActiveClass}`}
            title="Crear un nuevo proyecto desde una plantilla"
          >
            <div
              className={`p-0.5 rounded mt-0.5 ${
                isBlue ? 'text-[#38bdf8]' : 'text-[#0d99ff]'
              }`}
            >
              <FilePlus2 className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h3 className={`text-xs font-semibold tracking-tight ${textColor}`}>
                Crear un proyecto
              </h3>
              <p className={`text-[10px] leading-snug mt-1 ${textMuted}`}>
                Siga una plantilla de proyecto para las librerías o scaffolding para comenzar.
              </p>
            </div>
          </div>

          {/* Action 2: Abrir un proyecto .vforge */}
          <div
            onClick={onOpenProject}
            className={`p-3.5 rounded-xl flex items-start gap-3 cursor-pointer transition-all ${
              isLight
                ? 'bg-zinc-50 border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100 shadow-xs'
                : isBlue
                ? 'bg-[#131c31] border border-[#1f2c4a] hover:border-sky-500/50 hover:bg-[#1a2542] shadow-xs'
                : 'bg-[#1e1e22] border border-[#333336] hover:border-zinc-500 hover:bg-[#25252a] shadow-xs'
            }`}
            title="Abrir proyecto existente (.vforge)"
          >
            <div className="p-0.5 rounded text-amber-400 mt-0.5">
              <FolderOpen className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h3
                className={`text-xs font-semibold tracking-tight ${textColor}`}
              >
                Abrir un proyecto
              </h3>
              <p
                className={`text-[10px] leading-snug mt-1 ${textMuted}`}
              >
                Abre un archivo de proyecto (.vforge) local de tu equipo.
              </p>
            </div>
          </div>

          {/* Recientes List (Organizados por orden alfabético y con apertura directa) */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <h4 className={`text-[11px] font-medium ${textMuted}`}>
                Recientes
              </h4>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border select-none ${
                  isLight
                    ? 'bg-zinc-100 text-zinc-500 border-zinc-200'
                    : isBlue
                    ? 'bg-[#131c31] text-sky-400/80 border-[#1f2c4a]'
                    : 'bg-[#1c1c1f] text-zinc-400 border-white/5'
                }`}
                title="Archivos organizados alfabéticamente (A-Z)"
              >
                A-Z
              </span>
            </div>

            {effectiveRecents.length === 0 ? (
              <div
                className={`rounded-xl p-3.5 text-center border transition-all ${
                  isLight
                    ? 'bg-zinc-50 border-zinc-200 text-zinc-500'
                    : isBlue
                    ? 'bg-[#0b1120] border-[#1e293b] text-zinc-400'
                    : 'bg-[#161618] border-[#2e2e32] text-zinc-400'
                }`}
              >
                <Clock className="w-4 h-4 mx-auto mb-1 opacity-50 text-violet-400" />
                <p className="text-[10px] font-medium text-zinc-300">
                  Sin proyectos recientes
                </p>
                <p className="text-[9px] opacity-70 mt-0.5">
                  Los archivos que guardes o abras aparecerán aquí organizados de la A a la Z.
                </p>
              </div>
            ) : (
              <div
                className={`rounded-xl p-1.5 max-h-[175px] overflow-y-auto space-y-1 select-none transition-all ${
                  isLight
                    ? 'bg-zinc-50 border border-zinc-200'
                    : isBlue
                    ? 'bg-[#0b1120] border border-[#1e293b]'
                    : 'bg-[#161618] border border-[#2e2e32]'
                }`}
              >
                {effectiveRecents.map((proj) => (
                  <div
                    key={proj.id || proj.name}
                    onClick={() => onOpenRecentProject?.(proj)}
                    className={`group px-2 py-1.5 rounded-lg flex flex-col gap-0.5 text-left cursor-pointer transition-all border border-transparent ${
                      isLight
                        ? 'hover:bg-white hover:border-zinc-300 hover:shadow-xs'
                        : isBlue
                        ? 'hover:bg-[#131c31] hover:border-sky-500/40 hover:shadow-xs'
                        : 'hover:bg-[#202024] hover:border-[#38383c] hover:shadow-xs'
                    }`}
                    title={`Abrir directamente: ${proj.name} (${proj.path})`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <FileCode2 className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 group-hover:text-[#0d99ff] transition-colors" />
                        <span
                          className={`text-[10px] font-semibold truncate ${
                            isLight
                              ? 'text-zinc-800'
                              : 'text-zinc-200 group-hover:text-white'
                          }`}
                        >
                          {proj.name}
                        </span>
                      </div>
                      <span
                        className={`text-[8px] flex-shrink-0 font-mono ${
                          isLight ? 'text-zinc-500' : 'text-zinc-400'
                        }`}
                      >
                        {proj.date}
                      </span>
                    </div>
                    <span
                      className={`text-[8px] truncate font-mono pl-5 ${
                        isLight
                          ? 'text-zinc-400'
                          : 'text-zinc-500 group-hover:text-zinc-400'
                      }`}
                    >
                      {proj.path}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Tipos de Proyecto (Center, 4 cols) - 1. HTML, 2. React, 3. ESP32 */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          {PROJECT_TYPE_OPTIONS.map((opt) => {
            const isSelected = selectedTypeId === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => handleSelectType(opt.id)}
                className={`p-3.5 rounded-xl transition-all cursor-pointer flex items-start gap-3 text-left ${
                  isSelected ? itemActiveClass : itemInactiveClass
                }`}
              >
                {/* Icon */}
                <div className="mt-0.5">
                  {opt.id === 'html_css' && (
                    <Html5ShieldIcon className={iconClass} />
                  )}
                  {opt.id === 'react' && (
                    <ReactAtomIcon className={iconClass} />
                  )}
                  {opt.id === 'esp32' && (
                    <Esp32ChipIcon className={iconClass} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-xs font-semibold tracking-tight ${textColor}`}
                  >
                    {opt.title}
                  </h3>
                  <p className={`text-[10px] leading-relaxed mt-0.5 ${textMuted}`}>
                    {opt.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Column 3: Plantillas Dinámicas por Proyecto (Right, 4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          {activeProjectOption.templates.map((tpl) => {
            const isSelected = selectedTemplateId === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => setSelectedTemplateId(tpl.id)}
                onDoubleClick={handleNext}
                className={`p-3.5 rounded-xl transition-all cursor-pointer flex items-start gap-3 text-left ${
                  isSelected ? itemActiveClass : itemInactiveClass
                }`}
              >
                {/* Icon */}
                <div className={`p-0.5 rounded mt-0.5 ${iconClass}`}>
                  {tpl.icon === 'file' && <File className="w-5 h-5 stroke-[1.5]" />}
                  {tpl.icon === 'panels' && (
                    <PanelsTopLeft className="w-5 h-5 stroke-[1.5]" />
                  )}
                  {tpl.icon === 'activity' && (
                    <Activity className="w-5 h-5 stroke-[1.5]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-xs font-semibold tracking-tight ${textColor}`}
                  >
                    {tpl.title}
                  </h3>
                  <p className={`text-[10px] leading-relaxed mt-0.5 ${textMuted}`}>
                    {tpl.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer Actions inside Card */}
      <div className={`flex items-center justify-end gap-3 pt-3 border-t ${dividerBorder}`}>
        {/* Cancelar Button */}
        {canCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isLight
                ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                : isBlue
                ? 'bg-[#1e293b] hover:bg-[#334155] text-slate-200'
                : 'bg-[#2a2a2e] hover:bg-[#38383e] text-zinc-200'
            }`}
            title="Regresar al proyecto actual"
          >
            Cancelar
          </button>
        )}

        {/* Siguiente Button */}
        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-2 rounded-lg text-xs font-semibold bg-[#0d99ff] hover:bg-[#0082df] active:scale-95 text-white shadow-md shadow-blue-900/30 transition-all cursor-pointer"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

