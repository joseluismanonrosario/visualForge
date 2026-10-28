import React, { useState } from 'react';
import { Download, Copy, Check, X, FileCode2, Sparkles } from 'lucide-react';
import { CanvasNode } from '../types';
import {
  ExportFormat,
  EXPORT_FORMATS,
  generateCode,
  copyToClipboardSafe,
} from '../utils/exportEngine';

interface ExportModalProps {
  tree: CanvasNode[];
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ tree, isOpen, onClose }) => {
  const [activeFormat, setActiveFormat] = useState<ExportFormat>('react_shadcn');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const code = generateCode(activeFormat, tree);

  const handleCopy = async () => {
    const success = await copyToClipboardSafe(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    let filename = 'visualforge_export';
    let mimeType = 'text/plain';

    if (activeFormat === 'react_shadcn' || activeFormat === 'react_bootstrap') {
      filename += '.tsx';
      mimeType = 'text/typescript';
    } else if (activeFormat === 'html_bootstrap' || activeFormat === 'html_css') {
      filename += '.html';
      mimeType = 'text/html';
    } else if (activeFormat === 'react_native_tailwind') {
      filename += '.tsx';
      mimeType = 'text/typescript';
    }

    const blob = new Blob([code], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-[#1e1e1e] border border-[#383838] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-xs text-zinc-300">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#383838] flex items-center justify-between bg-[#262626]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-[#0d99ff] flex items-center justify-center text-white">
              <FileCode2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Export Production Code</h2>
              <p className="text-[11px] text-zinc-400">Choose your preferred framework and download or copy cleanly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-[#383838] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="px-5 py-3 border-b border-[#383838] bg-[#222223] flex items-center gap-2 overflow-x-auto">
          {EXPORT_FORMATS.map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => setActiveFormat(fmt.id)}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
                activeFormat === fmt.id
                  ? 'bg-[#0d99ff] text-white font-medium shadow-sm'
                  : 'bg-[#18181b] text-zinc-400 hover:text-white hover:bg-[#28282b] border border-[#383838]'
              }`}
            >
              <i className={`${fmt.icon} text-sm`} />
              <span>{fmt.label}</span>
            </button>
          ))}
        </div>

        {/* Code View Area */}
        <div className="flex-1 overflow-auto p-4 bg-[#141416] font-mono text-[11px] leading-relaxed relative">
          <pre className="text-zinc-300">{code}</pre>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#383838] bg-[#262626] flex items-center justify-between">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Sandbox-safe clipboard with automatic fallback</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg bg-[#383838] hover:bg-[#484848] text-white font-medium flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-lg bg-[#0d99ff] hover:bg-[#0082df] text-white font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
