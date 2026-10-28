import React from 'react';
import iconCatalog from '../data/icon-catalog.json';

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

  // Inject width and height
  svg = svg.replace(/<svg\s+/i, `<svg width="${w}" height="${h}" `);

  // Apply stroke color if specified
  if (options.stroke) {
    svg = svg.replace(/stroke="currentColor"/gi, `stroke="${options.stroke}"`);
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
 * Dynamic SVG Icon Component for Canvas and Editor UI
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
  let content = rawSvg;

  if (!content && iconId) {
    const item = findCatalogIcon(iconId);
    if (item) {
      content = item.svgContent;
    }
  }

  if (!content) {
    // Fallback icon placeholder
    return (
      <span
        style={{ width: size || width || 24, height: size || height || 24, ...style }}
        className={`inline-flex items-center justify-center text-xs opacity-50 ${className}`}
      >
        ❖
      </span>
    );
  }

  const effectiveWidth = size || width || style.width || style.fontSize || 24;
  const effectiveHeight = size || height || style.height || style.fontSize || 24;
  const effectiveStroke = stroke || (style.color as string) || 'currentColor';
  const effectiveFill = fill || 'none';

  const finalSvg = customizeSvg(content, {
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
};
