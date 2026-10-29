import React, { useState, useEffect } from 'react';
import iconCatalog from '../data/icon-catalog.json';
import {
  getIconSvgSync,
  getIconSvgAsync,
  renderIconifySvg,
  getLoadedCollection,
  loadCollection,
  parseIconIdentifier,
} from './iconifyManager';

export interface CatalogIconItem {
  id: string;
  name: string;
  category: string;
  svgContent: string;
}

// In-memory typed catalog
const ICONS: CatalogIconItem[] = iconCatalog as CatalogIconItem[];

// Fast lookup map by ID
const ICON_MAP = new Map<string, CatalogIconItem>();
ICONS.forEach((icon) => {
  ICON_MAP.set(icon.id.toLowerCase(), icon);
  ICON_MAP.set(icon.name.toLowerCase(), icon);
});

export function getAllCatalogIcons(): CatalogIconItem[] {
  return ICONS;
}

export function findCatalogIcon(idOrName: string): CatalogIconItem | undefined {
  if (!idOrName) return undefined;
  const key = idOrName.toLowerCase().trim();
  // Strip common prefixes if any (e.g., "lucide-rocket" -> "rocket", "fa-rocket" -> "rocket")
  const cleanKey = key.replace(/^(lucide|fa|bi|ri|bx|ph|ti)-/, '');
  return ICON_MAP.get(cleanKey) || ICON_MAP.get(key);
}

export function searchCatalogIcons(query = '', category = 'All'): CatalogIconItem[] {
  const q = query.toLowerCase().trim();
  return ICONS.filter((icon) => {
    const matchesCategory = category === 'All' || icon.category === category;
    const matchesQuery =
      !q ||
      icon.id.toLowerCase().includes(q) ||
      icon.name.toLowerCase().includes(q) ||
      icon.category.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });
}

export function getCatalogCategories(): string[] {
  const categories = new Set<string>();
  ICONS.forEach((icon) => categories.add(icon.category));
  return ['All', ...Array.from(categories).sort()];
}

/**
 * Injects custom width, height, stroke, fill and styles into the SVG markup
 */
export function customizeSvg(
  svgContent: string,
  options: {
    stroke?: string;
    fill?: string;
    width?: string | number;
    height?: string | number;
    className?: string;
  } = {}
): string {
  if (!svgContent) return '';

  let svg = svgContent;

  const w = options.width ? (typeof options.width === 'number' ? `${options.width}px` : options.width) : '100%';
  const h = options.height ? (typeof options.height === 'number' ? `${options.height}px` : options.height) : '100%';

  // Strip existing width and height on root svg tag to avoid duplicate attributes
  svg = svg.replace(/<svg([^>]*?)\s+width="[^"]*"/i, '<svg$1');
  svg = svg.replace(/<svg([^>]*?)\s+height="[^"]*"/i, '<svg$1');

  // Inject width and height
  svg = svg.replace(/<svg\s+/i, `<svg width="${w}" height="${h}" `);

  // Apply stroke color if specified
  if (options.stroke) {
    svg = svg.replace(/stroke="currentColor"/gi, `stroke="${options.stroke}"`);
    svg = svg.replace(/fill="currentColor"/gi, `fill="${options.stroke}"`);
  }

  // Apply fill color if specified
  if (options.fill && options.fill !== 'none') {
    svg = svg.replace(/fill="none"/gi, `fill="${options.fill}"`);
  }

  // Inject className if provided
  if (options.className) {
    svg = svg.replace(/<svg\s+/i, `<svg class="${options.className}" `);
  }

  return svg;
}

/**
 * Universal Dynamic SVG Icon Component for Canvas and Editor UI
 * Supports 100% of Iconify 250k+ icons locally & offline
 */
export interface SvgIconRendererProps {
  iconId?: string;
  rawSvg?: string;
  stroke?: string;
  fill?: string;
  size?: number | string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const SvgIconRenderer: React.FC<SvgIconRendererProps> = ({
  iconId,
  rawSvg,
  stroke,
  fill,
  size,
  width,
  height,
  className = '',
  style = {},
}) => {
  const numSize = size
    ? typeof size === 'number'
      ? size
      : parseInt(size.toString().replace('px', '')) || undefined
    : undefined;
  const effectiveWidth = numSize || width || style.width || style.fontSize || 24;
  const effectiveHeight = numSize || height || style.height || style.fontSize || 24;
  const effectiveStroke = stroke || (style.color as string) || 'currentColor';
  const effectiveFill = fill || (style.fill as string) || 'none';

  // 1. If rawSvg was provided directly
  if (rawSvg) {
    const finalSvg = customizeSvg(rawSvg, {
      width: effectiveWidth,
      height: effectiveHeight,
      stroke: effectiveStroke,
      fill: effectiveFill,
    });
    return (
      <span
        className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: typeof effectiveWidth === 'number' ? `${effectiveWidth}px` : effectiveWidth,
          height: typeof effectiveHeight === 'number' ? `${effectiveHeight}px` : effectiveHeight,
          ...style,
        }}
        dangerouslySetInnerHTML={{ __html: finalSvg }}
      />
    );
  }

  // 2. Synchronous resolution via IconifyManager or Catalog
  const targetId = iconId || 'lucide:rocket';
  const syncSvg = getIconSvgSync(targetId, {
    width: effectiveWidth,
    height: effectiveHeight,
    stroke: effectiveStroke,
    fill: effectiveFill,
  });

  const [asyncSvg, setAsyncSvg] = useState<string | null>(syncSvg);

  useEffect(() => {
    let active = true;

    // Check synchronous first
    const immediate = getIconSvgSync(targetId, {
      width: effectiveWidth,
      height: effectiveHeight,
      stroke: effectiveStroke,
      fill: effectiveFill,
    });

    if (immediate) {
      setAsyncSvg(immediate);
      return;
    }

    // Try fallback catalog
    const catalogItem = findCatalogIcon(targetId);
    if (catalogItem) {
      setAsyncSvg(
        customizeSvg(catalogItem.svgContent, {
          width: effectiveWidth,
          height: effectiveHeight,
          stroke: effectiveStroke,
          fill: effectiveFill,
        })
      );
      return;
    }

    // Load asynchronously from local Iconify collection
    getIconSvgAsync(targetId, {
      width: effectiveWidth,
      height: effectiveHeight,
      stroke: effectiveStroke,
      fill: effectiveFill,
    }).then((svg) => {
      if (active && svg) {
        setAsyncSvg(svg);
      }
    });

    return () => {
      active = false;
    };
  }, [targetId, effectiveWidth, effectiveHeight, effectiveStroke, effectiveFill]);

  const finalMarkup = syncSvg || asyncSvg;

  if (!finalMarkup) {
    // Fallback icon placeholder
    return (
      <span
        style={{ width: effectiveWidth, height: effectiveHeight, ...style }}
        className={`inline-flex items-center justify-center text-xs opacity-40 ${className}`}
      >
        ❖
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: typeof effectiveWidth === 'number' ? `${effectiveWidth}px` : effectiveWidth,
        height: typeof effectiveHeight === 'number' ? `${effectiveHeight}px` : effectiveHeight,
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: finalMarkup }}
    />
  );
};
