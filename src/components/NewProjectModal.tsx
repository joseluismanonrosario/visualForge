import React, { useState } from 'react';
import { ProjectType } from '../types';
import { PROJECT_TYPES_INFO, getLibrariesForWorkflow } from '../data/iconLibraries';
import { Sparkles, X, PlusCircle, Check, Layers, Code, Palette } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (name: string, type: ProjectType, iconLibrary: string, template: 'iot' | 'saas' | 'blank') => void;
  currentType: ProjectType;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  currentType,
}) => {
  const [name, setName] = useState(
    currentType === 'esp32' ? 'ESP32 IoT WebServer' : 'Mi Nuevo Proyecto Web'
  );
  const [selectedType, setSelectedType] = useState<ProjectType>(currentType);
  const [template, setTemplate] = useState<'iot' | 'saas' | 'blank'>(
    currentType === 'esp32' ? 'iot' : 'saas'
  );

  const availableLibraries = getLibrariesForWorkflow(selectedType);
  const [selectedLibrary, setSelectedLibrary] = useState<string>(
    availableLibraries[0]?.id || 'fontawesome'
  );

  // Sync default library and template when workflow changes
  const handleTypeChange = (type: ProjectType) => {
    setSelectedType(type);
    if (type === 'esp32') {
      setName('ESP32 IoT WebServer');
      setTemplate('iot');
    } else if (type === 'html_css') {
      setName('Landing Page HTML & CSS');
      setTemplate('saas');
    } else {
      setName('React 19 Web App');
      setTemplate('saas');
    }

    const libs = getLibrariesForWorkflow(type);
    if (!libs.some((l) => l.id === selectedLibrary)) {
      setSelectedLibrary(libs[0]?.id || 'fontawesome');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-[#1e1e1e] border border-[#383838] rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden text-xs text-zinc-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#383838] flex items-center justify-between bg-[#262626]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0d99ff] via-violet-600 to-indigo-500 flex items-center justify-center text-white font-bold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Configuración del Proyecto</h2>
              <p className="text-[11px] text-zinc-400">
                Selecciona el entorno de trabajo para habilitar las librerías de iconos compatibles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-[#383838] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-200">Nombre del Proyecto</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#18181b] border border-[#383838] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#0d99ff]"
              placeholder="Ej. Landing Page SaaS"
            />
          </div>

          {/* Project Type Cards */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-200">
              Tipo de Proyecto & Flujo de Iconos
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {PROJECT_TYPES_INFO.map((pt) => {
                const isSelected = selectedType === pt.id;
                return (
                  <div
                    key={pt.id}
                    onClick={() => handleTypeChange(pt.id)}
                    className={`cursor-pointer rounded-xl p-3 border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#0d99ff]/10 border-[#0d99ff] ring-1 ring-[#0d99ff]'
                        : 'bg-[#18181b] border-[#383838] hover:border-zinc-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-[#0d99ff] text-white' : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {pt.badge}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#0d99ff]" />}
                      </div>
                      <h4 className="font-semibold text-white text-xs mb-1">{pt.title}</h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{pt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Icon Library Selector (Filtered by Project Type) */}
          <div className="space-y-1.5 bg-[#252526] p-3 rounded-xl border border-[#383838]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#0d99ff]" />
                <span>Librería de Iconos Inicial</span>
              </label>
              <span className="text-[11px] text-zinc-400">
                {availableLibraries.length} librerías compatibles
              </span>
            </div>

            <select
              value={selectedLibrary}
              onChange={(e) => setSelectedLibrary(e.target.value)}
              className="w-full bg-[#18181b] border border-[#383838] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#0d99ff]"
            >
              {availableLibraries.map((lib) => (
                <option key={lib.id} value={lib.id} className="bg-[#18181b]">
                  {lib.name} — ({lib.badge})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-zinc-400 pt-1">
              {availableLibraries.find((l) => l.id === selectedLibrary)?.description}
            </p>
          </div>

          {/* Starter Template */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-200">Plantilla Inicial</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {selectedType === 'esp32' && (
                <button
                  type="button"
                  onClick={() => setTemplate('iot')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    template === 'iot'
                      ? 'bg-emerald-500/15 border-emerald-500 text-white ring-1 ring-emerald-500'
                      : 'bg-[#18181b] border-[#383838] text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="font-medium text-xs text-white">ESP32 IoT Dashboard</div>
                  <div className="text-[11px] text-zinc-400">Pines GPIO 2, 4, 5, relé y PWM</div>
                </button>
              )}
              <button
                type="button"
                onClick={() => setTemplate('saas')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  template === 'saas'
                    ? 'bg-[#0d99ff]/15 border-[#0d99ff] text-white ring-1 ring-[#0d99ff]'
                    : 'bg-[#18181b] border-[#383838] text-zinc-400 hover:text-white'
                }`}
              >
                <div className="font-medium text-xs text-white">SaaS Landing Page</div>
                <div className="text-[11px] text-zinc-400">Navbar, Hero y Feature Cards</div>
              </button>
              <button
                type="button"
                onClick={() => setTemplate('blank')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  template === 'blank'
                    ? 'bg-[#0d99ff]/15 border-[#0d99ff] text-white ring-1 ring-[#0d99ff]'
                    : 'bg-[#18181b] border-[#383838] text-zinc-400 hover:text-white'
                }`}
              >
                <div className="font-medium text-xs text-white">Lienzo en Blanco</div>
                <div className="text-[11px] text-zinc-400">Empieza con un artboard limpio</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#383838] bg-[#262626] flex items-center justify-between">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Los estilos de iconos se adaptarán dinámicamente a la librería elegida</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-[#383838] hover:bg-[#484848] text-white font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onCreateProject(name, selectedType, selectedLibrary, template);
                onClose();
              }}
              className="px-4 py-1.5 rounded-lg bg-[#0d99ff] hover:bg-[#0082df] text-white font-semibold shadow-sm transition-colors"
            >
              Crear Proyecto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
