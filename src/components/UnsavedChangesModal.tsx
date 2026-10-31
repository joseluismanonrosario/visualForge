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
          title="Cancelar acción"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon + Simple ¿Desea guardar? */}
        <div className="flex items-start gap-3.5 mb-5 pr-6">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex-shrink-0">
            <AlertTriangle className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div className="flex-1">
            <h3
              className={`text-base font-bold tracking-tight ${
                isLight ? 'text-zinc-900' : 'text-white'
              }`}
            >
              ¿Desea guardar?
            </h3>
            <p
              className={`text-xs mt-1 leading-relaxed ${
                isLight ? 'text-zinc-600' : 'text-zinc-400'
              }`}
            >
              ¿Desea guardar los cambios del proyecto <span className="font-semibold text-[#0d99ff]">"{projectName}"</span>?
            </p>
          </div>
        </div>

        {/* Botones Sí y No */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
          <button
            type="button"
            onClick={onDiscardAndClose}
            className={`px-5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isLight
                ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300'
                : 'bg-[#29292d] hover:bg-[#323237] text-zinc-300 hover:text-white border border-[#3e3e44]'
            }`}
          >
            No
          </button>

          <button
            type="button"
            onClick={onSaveAndClose}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-[#0d99ff] hover:bg-[#0088ee] text-white transition-all cursor-pointer shadow-md shadow-[#0d99ff]/20 active:scale-98"
          >
            Sí
          </button>
        </div>
      </div>
    </div>
  );
};
