import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ResolvedTheme } from '../types';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  projectName: string;
  onSaveAndClose: () => void;
  onDiscardAndClose: () => void;
  onCancel: () => void;
  resolvedTheme?: ResolvedTheme;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  projectName,
  onSaveAndClose,
  onDiscardAndClose,
  onCancel,
  resolvedTheme = 'dark',
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isLight = resolvedTheme === 'light';
  const isBlue = resolvedTheme === 'blue';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 transition-all select-none relative ${
          isLight
            ? 'bg-white border-zinc-200 text-zinc-900'
            : isBlue
            ? 'bg-[#0f172a] border-[#1e293b] text-zinc-100'
            : 'bg-[#1e1e22] border-[#383838] text-zinc-100'
        }`}
      >
        {/* Equis en la esquina para cerrar o cancelar */}
        <button
          type="button"
          onClick={onCancel}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors cursor-pointer ${
            isLight
              ? 'text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100'
              : 'text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
          title="Cerrar o cancelar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon + Title */}
        <div className="flex items-start gap-3.5 mb-4 pr-6">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex-shrink-0">
            <AlertTriangle className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div className="flex-1">
            <h3
              className={`text-base font-bold tracking-tight ${
                isLight ? 'text-zinc-900' : 'text-white'
              }`}
            >
              ¿Deseas guardar los cambios antes de cerrar?
            </h3>
            <p
              className={`text-xs mt-1 leading-relaxed ${
                isLight ? 'text-zinc-600' : 'text-zinc-400'
              }`}
            >
              El proyecto <span className="font-semibold text-[#0d99ff]">"{projectName}"</span> tiene modificaciones que no han sido guardadas. Si no las guardas, se perderán definitivamente.
            </p>
          </div>
        </div>

        {/* Botones de acción normales sin iconos */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-white/5">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isLight
                ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                : 'text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onDiscardAndClose}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isLight
                ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300'
                : 'bg-[#29292d] hover:bg-[#323237] text-zinc-300 hover:text-white border border-[#3e3e44]'
            }`}
            title="Cerrar el proyecto descartando los cambios no guardados"
          >
            No guardar
          </button>

          <button
            type="button"
            onClick={onSaveAndClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#0d99ff] hover:bg-[#0088ee] text-white transition-all cursor-pointer shadow-md shadow-[#0d99ff]/20 active:scale-98"
            title="Guardar el proyecto en archivo .vforge y cerrar"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
