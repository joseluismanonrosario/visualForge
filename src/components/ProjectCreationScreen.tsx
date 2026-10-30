import React, { useState } from 'react';
import { ProjectType } from '../types';
import {
  FilePlus2,
  FolderOpen,
  File,
  PanelsTopLeft,
  Activity,
  Boxes,
  Code2,
  X,
} from 'lucide-react';

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
const Esp32ChipIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-7 h-7 text-zinc-200 flex-shrink-0"
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

const Html5ShieldIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-7 h-7 text-zinc-100 flex-shrink-0"
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

const ReactAtomIcon: React.FC = () => (
  <svg
    viewBox="-11.5 -10.23174 23 20.46348"
    className="w-7 h-7 text-zinc-100 flex-shrink-0"
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
}

export const ProjectCreationScreen: React.FC<ProjectCreationScreenProps> = ({
  isOpen,
  canCancel,
  onCancel,
  onCreateProject,
  currentType = 'html_css',
}) => {
  // Active selected project type (default to HTML/CSS as in screenshot or current)
  const [selectedTypeId, setSelectedTypeId] = useState<ProjectType>(() => {
    if (currentType === 'esp32' || currentType === 'react') return currentType;
    return 'html_css';
  });

  // Current active project option object
  const activeProjectOption =
    PROJECT_TYPE_OPTIONS.find((p) => p.id === selectedTypeId) ||
    PROJECT_TYPE_OPTIONS[1];

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

  return (
    <div className="w-full max-w-4xl mx-auto my-auto bg-[#1b1c1e] border border-[#38393e] rounded-2xl shadow-2xl p-6 sm:p-7 select-none animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-5">
      {/* Top Header inside Card */}
      <div className="flex items-center justify-between pb-4 border-b border-[#2e2f33]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0d99ff] via-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <FilePlus2 className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
              Crear un proyecto
            </h2>
            <p className="text-xs text-zinc-400">
              Selecciona el entorno de trabajo y la plantilla inicial para comenzar
            </p>
          </div>
        </div>

        {canCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
            className="p-3.5 rounded-xl bg-[#1e1e22] border-2 border-[#00d2ff] ring-1 ring-[#00d2ff]/40 shadow-[0_0_16px_rgba(0,210,255,0.2)] flex items-start gap-3 cursor-pointer transition-all"
            title="Crear un nuevo proyecto desde una plantilla"
          >
            <div className="p-0.5 rounded text-[#00d2ff] mt-0.5">
              <FilePlus2 className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white tracking-tight">
                Crear un proyecto
              </h3>
              <p className="text-[10px] text-zinc-400 leading-snug mt-1">
                Siga una plantilla de proyecto para las librerías o scaffolding para comenzar.
              </p>
            </div>
          </div>

          {/* Action 2: Abrir un proyecto o una solución (Disabled as requested) */}
          <div
            className="p-3.5 rounded-xl bg-[#1e1e22]/50 border border-[#333336] flex items-start gap-3 opacity-50 cursor-not-allowed select-none"
            title="Abrir proyecto local (Próximamente)"
          >
            <div className="p-0.5 rounded text-zinc-400 mt-0.5">
              <FolderOpen className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-300 tracking-tight">
                Abrir un proyecto
              </h3>
              <p className="text-[10px] text-zinc-500 leading-snug mt-1">
                Abre un archivo o proyecto local de VisualForge.
              </p>
            </div>
          </div>

          {/* Recientes List (Disabled as requested) */}
          <div className="pt-1">
            <h4 className="text-[11px] font-medium text-zinc-400 mb-1.5 px-1">
              Recientes
            </h4>
            <div className="bg-[#161618] border border-[#2e2e32] rounded-xl p-2 max-h-[160px] overflow-hidden space-y-1 opacity-50 cursor-not-allowed select-none">
              {RECENT_PROJECTS.slice(0, 4).map((proj, idx) => (
                <div
                  key={idx}
                  className="px-2 py-1 rounded-md hover:bg-zinc-800/40 flex flex-col gap-0.5 text-left"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <Code2 className="w-3 h-3 text-violet-400 flex-shrink-0" />
                      <span className="text-[10px] font-medium text-zinc-300 truncate">
                        {proj.name}
                      </span>
                    </div>
                    <span className="text-[8px] text-zinc-500 flex-shrink-0 font-mono">
                      {proj.date}
                    </span>
                  </div>
                  <span className="text-[8px] text-zinc-600 truncate font-mono pl-4.5">
                    {proj.path}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Tipos de Proyecto (Center, 4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          {PROJECT_TYPE_OPTIONS.map((opt) => {
            const isSelected = selectedTypeId === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => handleSelectType(opt.id)}
                className={`p-3.5 rounded-xl transition-all cursor-pointer flex items-start gap-3 text-left ${
                  isSelected
                    ? 'bg-[#1e1e22] border-2 border-[#00d2ff] ring-1 ring-[#00d2ff]/40 shadow-[0_0_18px_rgba(0,210,255,0.25)]'
                    : 'bg-[#1e1e22] border border-[#333336] hover:border-zinc-500 hover:bg-[#25252a]'
                }`}
              >
                {/* Icon */}
                <div className="mt-0.5">
                  {opt.id === 'esp32' && <Esp32ChipIcon />}
                  {opt.id === 'html_css' && <Html5ShieldIcon />}
                  {opt.id === 'react' && <ReactAtomIcon />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-white tracking-tight">
                    {opt.title}
                  </h3>
                  <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">
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
                  isSelected
                    ? 'bg-[#1e1e22] border-2 border-[#00d2ff] ring-1 ring-[#00d2ff]/40 shadow-[0_0_16px_rgba(0,210,255,0.22)]'
                    : 'bg-[#1e1e22] border border-[#333336] hover:border-zinc-500 hover:bg-[#25252a]'
                }`}
              >
                {/* Icon */}
                <div className="p-0.5 rounded text-zinc-200 mt-0.5">
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
                  <h3 className="text-xs font-semibold text-white tracking-tight">
                    {tpl.title}
                  </h3>
                  <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">
                    {tpl.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer Actions inside Card */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2e2f33]">
        {/* Cancelar Button */}
        {canCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-[#2a2a2e] hover:bg-[#38383e] text-zinc-200 transition-colors cursor-pointer"
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

