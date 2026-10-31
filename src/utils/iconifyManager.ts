import type { IconifyJSON, IconifyIcon } from '@iconify/types';
import { getIconData, iconToSVG, iconToHTML, stringToIcon } from '@iconify/utils';

// Import raw metadata for all 244 collections (123 KB)
import rawCollections from '@iconify/json/collections.json';

// Preload Lucide (1,999 icons) as the zero-latency default collection
import preloadedLucide from '@iconify/json/json/lucide.json';

export interface IconifyCollectionMeta {
  prefix: string;
  name: string;
  total: number;
  category: string;
  author?: { name: string; url?: string };
  license?: { title: string; spdx?: string };
  samples?: string[];
  height?: number;
  palette?: boolean;
}

export interface IconCategoryDef {
  id: string;
  label: string;
  count: number;
  iconTotal: number;
}

// 1. In-memory parsed collections metadata
export const ALL_COLLECTIONS: IconifyCollectionMeta[] = Object.entries(
  rawCollections as Record<string, any>
).map(([prefix, data]) => ({
  prefix,
  name: data.name || prefix,
  total: data.total || 0,
  category: data.category || 'Other',
  author: data.author,
  license: data.license,
  samples: data.samples,
  height: data.height,
  palette: data.palette ?? false,
}));

// Quick map for fast prefix lookup
const COLLECTIONS_MAP = new Map<string, IconifyCollectionMeta>();
ALL_COLLECTIONS.forEach((col) => COLLECTIONS_MAP.set(col.prefix, col));

// 2. In-memory cache for loaded IconifyJSON collections
const COLLECTION_CACHE = new Map<string, IconifyJSON>();

// Initialize cache with default Lucide collection
COLLECTION_CACHE.set('lucide', preloadedLucide as unknown as IconifyJSON);

// Active loading promises to deduplicate network requests
const LOADING_PROMISES = new Map<string, Promise<IconifyJSON | null>>();

/**
 * Returns formatted list of categories for the Combobox selector
 */
export function getIconifyCategories(): IconCategoryDef[] {
  const categoryMap = new Map<string, { count: number; iconTotal: number }>();

  ALL_COLLECTIONS.forEach((col) => {
    const cat = col.category;
    const existing = categoryMap.get(cat) || { count: 0, iconTotal: 0 };
    existing.count += 1;
    existing.iconTotal += col.total;
    categoryMap.set(cat, existing);
  });

  const categoryLabels: Record<string, string> = {
    'UI 24px': 'UI 24px (Lucide, Tabler, Remix, Feather, Solar...)',
    'Material': 'Material Design (Material Symbols, Google Icons, MDI...)',
    'UI Other / Mixed Grid': 'Clásicas y Cuadrícula Mixta (Font Awesome, Boxicons...)',
    'Logos': 'Logos y Marcas (Simple Icons, Devicon, Brandico...)',
    'UI 16px / 32px': 'UI 16px / 32px (Radix, Carbon, Clarity, Fluent...)',
    'Programming': 'Programación y Código (Devicon, Codicons, VS Code...)',
    'Emoji': 'Emojis y Emoticonos (Fluent Emoji, Twemoji, OpenMoji...)',
    'UI Multicolor': 'Multicolor & Coloridas (Flat Color Icons...)',
    'Flags / Maps': 'Banderas y Mapas (Circle Flags, Flag Icons...)',
    'Thematic': 'Temáticos Especializados (Games, Weather, Health...)',
    'Archive / Unmaintained': 'Archivo & Legado',
    'Other': 'Otras Colecciones',
  };

  const totalIcons = ALL_COLLECTIONS.reduce((sum, c) => sum + c.total, 0);

  const categories: IconCategoryDef[] = [
    {
      id: 'All',
      label: `Todas las Colecciones (${ALL_COLLECTIONS.length} sets / ${(totalIcons).toLocaleString()} iconos)`,
      count: ALL_COLLECTIONS.length,
      iconTotal: totalIcons,
    },
  ];

  // Specific order of prominent categories
  const orderedKeys = [
    'UI 24px',
    'Material',
    'UI Other / Mixed Grid',
    'Logos',
    'UI 16px / 32px',
    'Programming',
    'Emoji',
    'UI Multicolor',
    'Flags / Maps',
    'Thematic',
    'Archive / Unmaintained',
    'Other',
  ];

  orderedKeys.forEach((key) => {
    const stats = categoryMap.get(key);
    if (stats) {
      categories.push({
        id: key,
        label: `${categoryLabels[key] || key} (${stats.count} sets - ${stats.iconTotal.toLocaleString()} icons)`,
        count: stats.count,
        iconTotal: stats.iconTotal,
      });
    }
  });

  return categories;
}

/**
 * Filter collections by category
 */
export function getCollectionsByCategory(categoryId = 'All'): IconifyCollectionMeta[] {
  if (!categoryId || categoryId === 'All') {
    return ALL_COLLECTIONS;
  }
  return ALL_COLLECTIONS.filter((col) => col.category === categoryId);
}

/**
 * Get metadata for a specific collection prefix
 */
export function getCollectionMeta(prefix: string): IconifyCollectionMeta | undefined {
  return COLLECTIONS_MAP.get(prefix);
}

/**
 * Check if a collection is already loaded in memory
 */
export function isCollectionLoaded(prefix: string): boolean {
  return COLLECTION_CACHE.has(prefix);
}

/**
 * Get an already loaded collection from memory
 */
export function getLoadedCollection(prefix: string): IconifyJSON | undefined {
  return COLLECTION_CACHE.get(prefix);
}

/**
 * Asynchronously load an Iconify collection from local disk via Vite/Electron middleware
 */
export async function loadCollection(prefix: string, signal?: AbortSignal): Promise<IconifyJSON | null> {
  if (!prefix) return null;

  // 1. Check in-memory cache
  if (COLLECTION_CACHE.has(prefix)) {
    return COLLECTION_CACHE.get(prefix)!;
  }

  // 2. Check if already loading to avoid duplicate requests
  if (LOADING_PROMISES.has(prefix)) {
    return LOADING_PROMISES.get(prefix)!;
  }

  // 3. Request from local server middleware with safety timeout and cancellation
  const loadPromise = (async () => {
    // 8-second safety timeout controller to ensure promises never hang indefinitely
    const timeoutController = new AbortController();
    const timer = setTimeout(() => {
      try {
        timeoutController.abort();
      } catch (_) {}
    }, 8000);

    const onCallerAbort = () => {
      try {
        timeoutController.abort();
      } catch (_) {}
    };

    if (signal) {
      if (signal.aborted) {
        clearTimeout(timer);
        return null;
      }
      signal.addEventListener('abort', onCallerAbort, { once: true });
    }

    try {
      const response = await fetch(`/@iconify/json/${prefix}.json`, {
        signal: timeoutController.signal,
      });
      if (!response.ok) {
        throw new Error(`Failed to load iconify collection: ${prefix} (${response.status})`);
      }
      const data: IconifyJSON = await response.json();
      COLLECTION_CACHE.set(prefix, data);
      return data;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // Request was cancelled or timed out
        return null;
      }
      console.warn(`[IconifyManager] Could not load offline collection "${prefix}":`, err);
      return null;
    } finally {
      clearTimeout(timer);
      if (signal) {
        signal.removeEventListener('abort', onCallerAbort);
      }
      LOADING_PROMISES.delete(prefix);
    }
  })();

  LOADING_PROMISES.set(prefix, loadPromise);
  return loadPromise;
}

/**
 * Get all icon names in a loaded collection
 */
export function getIconsInCollection(collection: IconifyJSON): string[] {
  if (!collection || !collection.icons) return [];
  const names = Object.keys(collection.icons);
  if (collection.aliases) {
    const aliasNames = Object.keys(collection.aliases);
    return Array.from(new Set([...names, ...aliasNames])).sort();
  }
  return names.sort();
}

/**
 * Get internal categories of a collection (e.g. MDI, Solar, FA have subcategories)
 */
export function getCollectionSubcategories(collection: IconifyJSON): string[] {
  if (!collection || !collection.categories) return ['All'];
  const cats = Object.keys(collection.categories).sort();
  return ['All', ...cats];
}

/**
 * Filter icons in a collection by search query and optional subcategory
 */
export function filterIconsInCollection(
  collection: IconifyJSON,
  query = '',
  subcategory = 'All'
): string[] {
  if (!collection || !collection.icons) return [];

  let candidateNames = Object.keys(collection.icons);
  if (collection.aliases) {
    candidateNames = Array.from(new Set([...candidateNames, ...Object.keys(collection.aliases)]));
  }

  // Filter by internal subcategory if present
  if (subcategory && subcategory !== 'All' && collection.categories?.[subcategory]) {
    const allowed = new Set(collection.categories[subcategory]);
    candidateNames = candidateNames.filter((name) => allowed.has(name));
  }

  const q = query.toLowerCase().trim();
  if (!q) {
    return candidateNames;
  }

  return candidateNames.filter((name) => name.toLowerCase().includes(q));
}

/**
 * Normalize icon string e.g. "lucide:rocket", "lucide-rocket", "rocket"
 */
export function parseIconIdentifier(identifier: string): { prefix: string; name: string } {
  if (!identifier) {
    return { prefix: 'lucide', name: 'rocket' };
  }

  // Check standard Iconify format "prefix:name"
  if (identifier.includes(':')) {
    const parsed = stringToIcon(identifier);
    if (parsed) {
      return { prefix: parsed.prefix, name: parsed.name };
    }
  }

  // Check hyphenated format e.g. "lucide-rocket", "mdi-home", "fa6-solid-star"
  for (const prefix of COLLECTIONS_MAP.keys()) {
    if (identifier.startsWith(`${prefix}-`)) {
      return {
        prefix,
        name: identifier.slice(prefix.length + 1),
      };
    }
  }

  // Fallback: strip fa- / la- / bi- / etc.
  const clean = identifier.replace(/^(fa|fas|far|fab|la|bi|ri|bx|ph|ti)-/, '');
  return { prefix: 'lucide', name: clean };
}

/**
 * Render SVG markup from a loaded collection and icon name
 */
export function renderIconifySvg(
  collection: IconifyJSON,
  iconName: string,
  options: {
    size?: number | string;
    width?: number | string;
    height?: number | string;
    stroke?: string;
    color?: string;
    fill?: string;
    strokeWidth?: number;
    className?: string;
  } = {}
): string {
  const iconData = getIconData(collection, iconName);
  if (!iconData) return '';

  const w = options.size || options.width || 24;
  const h = options.size || options.height || 24;

  const svg = iconToSVG(iconData, {
    width: typeof w === 'number' ? `${w}px` : w,
    height: typeof h === 'number' ? `${h}px` : h,
  });

  let markup = iconToHTML(svg.body, svg.attributes);

  // Apply stroke color if specified
  const effectiveStroke = options.stroke || options.color;
  if (effectiveStroke) {
    markup = markup.replace(/stroke="currentColor"/g, `stroke="${effectiveStroke}"`);
    markup = markup.replace(/fill="currentColor"/g, `fill="${effectiveStroke}"`);
  }

  // Apply fill color if specified
  if (options.fill && options.fill !== 'none') {
    markup = markup.replace(/fill="none"/g, `fill="${options.fill}"`);
  }

  // Apply custom className
  if (options.className) {
    markup = markup.replace(/<svg\s+/i, `<svg class="${options.className}" `);
  }

  return markup;
}

/**
 * Synchronous SVG retrieval for already cached collections
 */
export function getIconSvgSync(
  identifier: string,
  options: {
    size?: number | string;
    width?: number | string;
    height?: number | string;
    stroke?: string;
    color?: string;
    fill?: string;
    className?: string;
  } = {}
): string | null {
  const { prefix, name } = parseIconIdentifier(identifier);
  const collection = COLLECTION_CACHE.get(prefix);
  if (!collection) return null;
  return renderIconifySvg(collection, name, options);
}

/**
 * Asynchronous SVG retrieval (loads collection on-demand if needed)
 */
export async function getIconSvgAsync(
  identifier: string,
  options: {
    size?: number | string;
    width?: number | string;
    height?: number | string;
    stroke?: string;
    color?: string;
    fill?: string;
    className?: string;
  } = {}
): Promise<string> {
  const { prefix, name } = parseIconIdentifier(identifier);
  let collection = COLLECTION_CACHE.get(prefix);
  if (!collection) {
    collection = (await loadCollection(prefix)) || undefined;
  }
  if (!collection) return '';
  return renderIconifySvg(collection, name, options);
}
