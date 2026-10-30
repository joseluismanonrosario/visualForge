import { CanvasNode, CanvasSettings, ProjectType, ViewportMode } from '../types';

export interface VForgeProjectData {
  format: 'visualforge';
  version: '1.0';
  generator: string;
  createdAt: string;
  updatedAt: string;
  project: {
    name: string;
    type: ProjectType;
  };
  canvas: {
    settings: CanvasSettings;
    viewportMode?: ViewportMode;
    zoom?: number;
  };
  elements: CanvasNode[];
}

export interface RestoredProjectData {
  projectName: string;
  projectType: ProjectType;
  tree: CanvasNode[];
  canvasSettings: CanvasSettings;
  viewportMode: ViewportMode;
  zoom: number;
}

/**
 * Serializa el estado completo en memoria del proyecto actual en formato JSON legible.
 */
export function serializeProject(params: {
  projectName: string;
  projectType: ProjectType;
  tree: CanvasNode[];
  canvasSettings: CanvasSettings;
  viewportMode?: ViewportMode;
  zoom?: number;
}): string {
  const data: VForgeProjectData = {
    format: 'visualforge',
    version: '1.0',
    generator: 'VisualForge Studio',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    project: {
      name: params.projectName || 'VisualForge Project',
      type: params.projectType || 'html_css',
    },
    canvas: {
      settings: params.canvasSettings,
      viewportMode: params.viewportMode || 'desktop',
      zoom: params.zoom || 1.0,
    },
    elements: params.tree,
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Parsea y valida el contenido JSON de un archivo .vforge, restaurando todas las propiedades.
 */
export function deserializeProject(jsonString: string): RestoredProjectData {
  if (!jsonString || typeof jsonString !== 'string') {
    throw new Error('El contenido del archivo está vacío.');
  }

  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err: any) {
    throw new Error(`Error de sintaxis JSON al leer el archivo .vforge: ${err.message}`);
  }

  // Soporte resiliente para elements o tree
  const elements = Array.isArray(parsed.elements)
    ? parsed.elements
    : Array.isArray(parsed.tree)
    ? parsed.tree
    : null;

  if (!elements) {
    throw new Error('El archivo no contiene un árbol de elementos válido (elements/tree).');
  }

  const projectName: string =
    parsed.project?.name ||
    parsed.projectName ||
    'VisualForge Project';

  const projectType: ProjectType =
    parsed.project?.type ||
    parsed.projectType ||
    'html_css';

  const canvasSettings: CanvasSettings =
    parsed.canvas?.settings ||
    parsed.canvasSettings || {
      artboardBg: '#121214',
      artboardTextColor: '#f1f5f9',
      minHeight: 900,
      padding: 16,
      gap: 16,
      fontFamily: 'Inter',
      showGrid: true,
      width: 1440,
      height: 900,
      presetName: 'Desktop Estándar (1440 × 900)',
    };

  const viewportMode: ViewportMode =
    parsed.canvas?.viewportMode ||
    parsed.viewportMode ||
    'desktop';

  const zoom: number =
    typeof parsed.canvas?.zoom === 'number'
      ? parsed.canvas.zoom
      : typeof parsed.zoom === 'number'
      ? parsed.zoom
      : 1.0;

  return {
    projectName,
    projectType,
    tree: elements,
    canvasSettings,
    viewportMode,
    zoom,
  };
}

/**
 * Invoca el diálogo nativo de guardado para almacenar el archivo .vforge
 * Soporta Electron API, File System Access API nativa y fallback con Blob.
 */
export async function saveProjectFile(
  projectName: string,
  jsonString: string
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  const cleanName = (projectName || 'VisualForge_Project')
    .replace(/[<>:"/\\|?*]+/g, '_')
    .trim();
  const defaultFileName = cleanName.endsWith('.vforge') ? cleanName : `${cleanName}.vforge`;

  // 1. Entorno Desktop nativo (Electron IPC)
  if (typeof window !== 'undefined' && (window as any).electronAPI?.saveProject) {
    try {
      const res = await (window as any).electronAPI.saveProject(defaultFileName, jsonString);
      if (res?.canceled) return { success: false };
      if (res?.error) return { success: false, error: res.error };
      return { success: true, filePath: res.filePath };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // 2. Navegador Web: File System Access API nativa (Chrome, Edge, Opera)
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: defaultFileName,
        types: [
          {
            description: 'Proyecto VisualForge (*.vforge)',
            accept: {
              'application/json': ['.vforge'],
            },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(jsonString);
      await writable.close();
      return { success: true, filePath: handle.name };
    } catch (err: any) {
      if (err.name === 'AbortError') return { success: false }; // Cancelado por el usuario
      // Si falla por permisos u otra causa, usar fallback
    }
  }

  // 3. Fallback Web Universal: Descarga Blob con extensión forzada .vforge
  try {
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = defaultFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { success: true, filePath: defaultFileName };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Invoca el explorador de archivos nativo para seleccionar y leer un archivo .vforge
 * Soporta Electron API, File System Access API nativa y fallback con input file.
 */
export async function openProjectFile(): Promise<{
  success: boolean;
  content?: string;
  fileName?: string;
  error?: string;
}> {
  // 1. Entorno Desktop nativo (Electron IPC)
  if (typeof window !== 'undefined' && (window as any).electronAPI?.openProject) {
    try {
      const res = await (window as any).electronAPI.openProject();
      if (res?.canceled || !res.content) return { success: false };
      if (res?.error) return { success: false, error: res.error };
      return { success: true, content: res.content, fileName: res.filePath };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // 2. Navegador Web: File System Access API nativa
  if (typeof window !== 'undefined' && 'showOpenFilePicker' in window) {
    try {
      const [handle] = await (window as any).showOpenFilePicker({
        types: [
          {
            description: 'Proyecto VisualForge (*.vforge)',
            accept: {
              'application/json': ['.vforge'],
            },
          },
          {
            description: 'Archivos JSON (*.json)',
            accept: {
              'application/json': ['.json'],
            },
          },
        ],
        multiple: false,
      });
      const file = await handle.getFile();
      const content = await file.text();
      return { success: true, content, fileName: file.name };
    } catch (err: any) {
      if (err.name === 'AbortError') return { success: false };
      // Fallback a input file
    }
  }

  // 3. Fallback Web Universal: input file oculto
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.vforge,application/json';
    input.style.display = 'none';

    input.onchange = async () => {
      if (!input.files || input.files.length === 0) {
        resolve({ success: false });
        return;
      }
      const file = input.files[0];
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          resolve({ success: true, content: text, fileName: file.name });
        };
        reader.onerror = () => {
          resolve({ success: false, error: 'No se pudo leer el archivo seleccionado.' });
        };
        reader.readAsText(file);
      } catch (err: any) {
        resolve({ success: false, error: err.message });
      } finally {
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      }
    };

    input.oncancel = () => {
      resolve({ success: false });
      if (document.body.contains(input)) {
        document.body.removeChild(input);
      }
    };

    document.body.appendChild(input);
    input.click();
  });
}
