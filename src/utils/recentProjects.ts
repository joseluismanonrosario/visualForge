import { RecentProjectItem } from '../types';

const STORAGE_KEY = 'vf_recent_projects';
const MAX_RECENT_PROJECTS = 30;

/**
 * Ordena una lista de proyectos alfabéticamente por su nombre (de la A a la Z, case-insensitive).
 */
export function sortProjectsAlphabetically(items: RecentProjectItem[]): RecentProjectItem[] {
  return [...items].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '', undefined, {
      sensitivity: 'base',
      numeric: true,
    })
  );
}

/**
 * Obtiene la lista de proyectos recientes almacenados en localStorage,
 * garantizando que siempre se devuelvan ordenados alfabéticamente.
 */
export function getRecentProjects(): RecentProjectItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) return [];

    return sortProjectsAlphabetically(items);
  } catch (err) {
    console.warn('Error al leer proyectos recientes de localStorage:', err);
    return [];
  }
}

/**
 * Agrega o actualiza un archivo de proyecto en la lista de recientes al guardar o abrir,
 * ordenándolo alfabéticamente y persistiendo en localStorage.
 */
export function addRecentProject(params: {
  name: string;
  path?: string;
  fileName?: string;
  content?: string;
}): RecentProjectItem[] {
  if (typeof window === 'undefined') return [];

  const existing = getRecentProjects();
  const rawName = (params.name || 'VisualForge_Project').trim();
  const rawFileName = (params.fileName || `${rawName}.vforge`).trim();
  const rawPath = (params.path || rawFileName).trim();

  const now = new Date();
  const formattedDate =
    now.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) +
    ' ' +
    now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  const timestamp = Date.now();
  const id = rawPath || `${rawName}_${timestamp}`;

  // Comprobar si ya existe por ruta idéntica o por nombre idéntico
  const existingIdx = existing.findIndex(
    (item) =>
      (item.path && rawPath && item.path.toLowerCase() === rawPath.toLowerCase()) ||
      item.name.toLowerCase() === rawName.toLowerCase()
  );

  const updatedItem: RecentProjectItem = {
    id,
    name: rawName,
    fileName: rawFileName,
    path: rawPath,
    date: formattedDate,
    timestamp,
    content: params.content,
  };

  let newList: RecentProjectItem[];
  if (existingIdx >= 0) {
    const prev = existing[existingIdx];
    newList = [
      ...existing.slice(0, existingIdx),
      {
        ...prev,
        ...updatedItem,
        content: params.content || prev.content,
      },
      ...existing.slice(existingIdx + 1),
    ];
  } else {
    newList = [...existing, updatedItem];
  }

  // Ordenar estrictamente por orden alfabético
  const sorted = sortProjectsAlphabetically(newList).slice(0, MAX_RECENT_PROJECTS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  } catch (err) {
    console.warn('Advertencia al serializar en localStorage (posible cuota):', err);
    // Si excede la cuota de localStorage por el tamaño de content, reintentar sin almacenar content pesado
    try {
      const stripped = sorted.map(({ content, ...rest }) => rest as RecentProjectItem);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
    } catch {
      // Ignorar si el almacenamiento local está completamente deshabilitado
    }
  }

  return sorted;
}

/**
 * Elimina un proyecto específico de la lista de recientes.
 */
export function removeRecentProject(idOrPath: string): RecentProjectItem[] {
  if (typeof window === 'undefined') return [];
  const existing = getRecentProjects();
  const filtered = existing.filter(
    (item) => item.id !== idOrPath && item.path !== idOrPath && item.name !== idOrPath
  );
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('Error al actualizar proyectos recientes tras eliminar:', err);
  }
  return filtered;
}
