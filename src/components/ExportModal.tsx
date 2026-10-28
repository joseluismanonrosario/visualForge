import React, { useState, useEffect } from 'react';
import { Download, Copy, Check, X, FileCode2, Sparkles, Cpu } from 'lucide-react';
import { CanvasNode, ProjectType } from '../types';
import {
  ExportFormat,
  getExportFormatsForProject,
  getDefaultFormatForProject,
  generateCode,
  copyToClipboardSafe,
} from '../utils/exportEngine';

interface ExportModalProps {
  tree: CanvasNode[];
  projectType?: ProjectType;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  tree,
  projectType = 'react',
  isOpen,
  onClose,
}) => {
  const availableFormats = getExportFormatsForProject(projectType);
  const [activeFormat, setActiveFormat] = useState<ExportFormat>(() =>
    getDefaultFormatForProject(projectType)
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveFormat(getDefaultFormatForProject(projectType));
  }, [projectType, isOpen]);

  if (!isOpen) return null;

  const code = generateCode(activeFormat, tree);

  const handleCopy = async () => {
    const success = await copyToClipboardSafe(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getDownloadInfo = () => {
    if (activeFormat === 'esp32_html') {
      return { filename: 'index.html', mimeType: 'text/html' };
    } else if (activeFormat === 'esp32_main_cpp') {
      return { filename: 'main.cpp', mimeType: 'text/x-c++src' };
    } else if (activeFormat === 'esp32_embedded') {
      return { filename: 'esp32_webserver.h', mimeType: 'text/x-chdr' };
    } else if (activeFormat === 'html_css' || activeFormat === 'html_bootstrap') {
      return { filename: 'index.html', mimeType: 'text/html' };
    } else if (activeFormat === 'react_shadcn' || activeFormat === 'react_bootstrap') {
      return { filename: 'App.tsx', mimeType: 'text/typescript' };
    } else if (activeFormat === 'react_native_tailwind') {
      return { filename: 'Screen.tsx', mimeType: 'text/typescript' };
    }
    return { filename: 'export.txt', mimeType: 'text/plain' };
  };

  const handleDownload = () => {
    const { filename, mimeType } = getDownloadInfo();

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

  const downloadInfo = getDownloadInfo();

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-[#1e1e1e] border border-[#383838] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-xs text-zinc-300">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#383838] flex items-center justify-between bg-[#262626]">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${
                projectType === 'esp32'
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                  : projectType === 'html_css'
                  ? 'bg-gradient-to-tr from-amber-600 to-orange-500'
                  : 'bg-gradient-to-tr from-violet-600 to-[#0d99ff]'
              }`}
            >
              {projectType === 'esp32' ? (
                <Cpu className="w-4 h-4" />
              ) : (
                <FileCode2 className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">Export Production Code</h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                    projectType === 'esp32'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : projectType === 'html_css'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {projectType === 'esp32'
                    ? 'Target: ESP32 IoT'
                    : projectType === 'html_css'
                    ? 'Target: HTML / CSS'
                    : 'Target: React Web'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {projectType === 'esp32'
                  ? 'Exporta la interfaz web con SVGs inline y el firmware C++ complementario para ESP32'
                  : 'Exporta código limpio con SVGs puros e inline optimizados sin dependencias externas'}
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

        {/* Format Selector Tabs */}
        <div className="px-5 py-3 border-b border-[#383838] bg-[#222223] flex items-center gap-2 overflow-x-auto">
          {availableFormats.map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => setActiveFormat(fmt.id)}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
                activeFormat === fmt.id
                  ? projectType === 'esp32'
                    ? 'bg-emerald-600 text-white font-medium shadow-sm'
                    : 'bg-[#0d99ff] text-white font-medium shadow-sm'
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
            <span>
              {projectType === 'esp32'
                ? 'Rutas asíncronas no bloqueantes con ESPAsyncWebServer'
                : 'Sandbox-safe clipboard con fallback automático'}
            </span>
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
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-sm text-white ${
                projectType === 'esp32'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-[#0d99ff] hover:bg-[#0082df]'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {downloadInfo.filename}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
