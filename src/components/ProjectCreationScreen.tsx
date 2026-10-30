import React, { useState } from 'react';
import { ProjectType, ResolvedTheme } from '../types';
import {
  FilePlus2,
  FolderOpen,
  File,
  PanelsTopLeft,
  Activity,
  Code2,
  X,
} from 'lucide-react';
import { getLogoForTheme } from './TopBar';

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

// Mock recent projects list (disabled / read-only as requested)
const RECENT_PROJECTS = [
  {
    name: 'LittleAspPetCoreTodo.do',
    date: '06/04/2026 11:54 p. m.',
    path: 'CS\\User\\berganinCanackh\\Garnarch\\Amigartarjah',
  },
  {
    name: 'AsphvtCoreTodo.Linit.Testi.copoj',
    date: '06/04/2026 10:36 p. m.',
    path: 'CS\\User\\berpadgerGergerVille seprectore-tode:AcpPetCoreTode UniTests',
  },
  {
    name: 'AsphvtCoreTodo.IntegrationTesti.czpmj',
    date: '03/04/2026 10:31 p. m.',
    path: 'CS\\User\\berpadgerGergerVille seprectore-tode:AcpPetCoreTodeIntegrationTodo',
  },
  {
    name: 'AsphvtCoreTodo.co.poj',
    date: '01/04/2026 10:51 p. m.',
    path: 'CS\\User\\berpadgerGergerVille seprectore-tode:AcpPetCoreTodo',
  },
  {
    name: 'Ulteaspect.core.todo',
    date: '01/04/2026 10:51 p. m.',
    path: 'CS\\User\\berganinCanackh\\Garnarch\\Amigartarjah',
  },
  {
    name: 'WebApplication.ain',
    date: '16/03/2026 04:57 p. m.',
    path: 'CS\\User\\berganinCanachhadureLegett\\WebApplication1',
  },
  {
    name: 'loasnt.dn',
    date: '16/03/2026 04:57 p. m.',
    path: 'CS\\User\\berganinCanachhadure\\vepecicionne',
  },
  {
    name: 'WebApplication.ain',
    date: '15/03/2026 11:59 p. m.',
    path: 'CS\\User\\berganinCanachhadureLegett\\WebApplication1',
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
  currentType?: ProjectType;
  resolvedTheme?: ResolvedTheme;
}

export const ProjectCreationScreen: React.FC<ProjectCreationScreenProps> = ({
  isOpen,
  canCancel,
  onCancel,
  onCreateProject,
  currentType = 'html_css',
  resolvedTheme = 'dark',
}) => {
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
      {/* Top Header inside Card: VisualForge branding + Logo, h2 Iniciar */}
      <div className={`flex items-center justify-between pb-4 border-b ${dividerBorder}`}>
        <div className="flex items-center gap-3">
          <img
            src={getLogoForTheme(resolvedTheme)}
            alt="VisualForge"
            className="w-9 h-9 aspect-square object-contain flex-shrink-0 select-none pointer-events-none"
          />
          <div className="flex flex-col justify-center">
            <span
              className={`text-xl sm:text-2xl font-bold tracking-tight leading-none ${titleColor}`}
            >
              VisualForge
            </span>
            <h2
              className={`text-xs sm:text-sm font-semibold tracking-wide mt-1 leading-none ${h2Color}`}
            >
              Iniciar
            </h2>
          </div>
        </div>

        {canCancel && (
          <button
            onClick={onCancel}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
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

          {/* Action 2: Abrir un proyecto o una solución (Disabled as requested) */}
          <div
            className={`p-3.5 rounded-xl flex items-start gap-3 opacity-50 cursor-not-allowed select-none ${
              isLight
                ? 'bg-zinc-100/70 border border-zinc-200'
                : isBlue
                ? 'bg-[#131c31]/50 border border-[#1e293b]'
                : 'bg-[#1e1e22]/50 border border-[#333336]'
            }`}
            title="Abrir proyecto local (Próximamente)"
          >
            <div className="p-0.5 rounded text-zinc-400 mt-0.5">
              <FolderOpen className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h3
                className={`text-xs font-semibold tracking-tight ${
                  isLight ? 'text-zinc-700' : 'text-zinc-300'
                }`}
              >
                Abrir un proyecto
              </h3>
              <p
                className={`text-[10px] leading-snug mt-1 ${
                  isLight ? 'text-zinc-500' : 'text-zinc-500'
                }`}
              >
                Abre un archivo o proyecto local de VisualForge.
              </p>
            </div>
          </div>

          {/* Recientes List (Disabled as requested) */}
          <div className="pt-1">
            <h4 className={`text-[11px] font-medium mb-1.5 px-1 ${textMuted}`}>
              Recientes
            </h4>
            <div
              className={`rounded-xl p-2 max-h-[160px] overflow-hidden space-y-1 opacity-50 cursor-not-allowed select-none ${
                isLight
                  ? 'bg-zinc-50 border border-zinc-200'
                  : isBlue
                  ? 'bg-[#0b1120] border border-[#1e293b]'
                  : 'bg-[#161618] border border-[#2e2e32]'
              }`}
            >
              {RECENT_PROJECTS.slice(0, 4).map((proj, idx) => (
                <div
                  key={idx}
                  className={`px-2 py-1 rounded-md flex flex-col gap-0.5 text-left ${
                    isLight ? 'hover:bg-zinc-200/50' : 'hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <Code2 className="w-3 h-3 text-violet-400 flex-shrink-0" />
                      <span
                        className={`text-[10px] font-medium truncate ${
                          isLight ? 'text-zinc-800' : 'text-zinc-300'
                        }`}
                      >
                        {proj.name}
                      </span>
                    </div>
                    <span
                      className={`text-[8px] flex-shrink-0 font-mono ${
                        isLight ? 'text-zinc-500' : 'text-zinc-500'
                      }`}
                    >
                      {proj.date}
                    </span>
                  </div>
                  <span
                    className={`text-[8px] truncate font-mono pl-4.5 ${
                      isLight ? 'text-zinc-500' : 'text-zinc-600'
                    }`}
                  >
                    {proj.path}
                  </span>
                </div>
              ))}
            </div>
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

