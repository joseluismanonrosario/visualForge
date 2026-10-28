/**
 * Independent Node.js script to process SVG icons and build an indexed JSON catalog.
 * Usage: node scripts/build-icon-catalog.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'icon-catalog.json');

// Check possible source paths
const LUCIDE_STATIC_PATH = path.join(__dirname, '..', 'node_modules', 'lucide-static', 'icons');
const ASSETS_ICONS_PATH = path.join(__dirname, '..', 'assets', 'icons');

function getCategory(iconId) {
  const id = iconId.toLowerCase();
  if (/arrow|chevron|corner|compass|route|navigation|move|locate|expand|shrink/.test(id)) {
    return 'Arrows & Navigation';
  }
  if (/camera|video|image|music|volume|mic|film|palette|pen|brush|crop|layers|play|pause|disc/.test(id)) {
    return 'Media & Design';
  }
  if (/mail|message|phone|send|at-sign|share|chat|bell|inbox|contact/.test(id)) {
    return 'Communication';
  }
  if (/shopping|cart|bag|credit-card|dollar|coin|bank|wallet|tag|receipt|percent|store|currency/.test(id)) {
    return 'Commerce & Finance';
  }
  if (/code|terminal|cpu|database|server|git|wifi|hard-drive|bug|laptop|monitor|smartphone|tablet|tv|chip/.test(id)) {
    return 'Development & Tech';
  }
  if (/lock|shield|key|alert|user-check|eye|unlock|warning|fingerprint|security/.test(id)) {
    return 'Security & System';
  }
  if (/edit|copy|trash|folder|file|paperclip|scissors|list|bookmark|align|type|clipboard/.test(id)) {
    return 'Editing & Text';
  }
  if (/user|users|person|smile|heart|award|crown/.test(id)) {
    return 'People & Social';
  }
  if (/sun|moon|cloud|rain|wind|thermometer|zap|flame|droplet/.test(id)) {
    return 'Weather & Nature';
  }
  return 'General UI';
}

function formatName(iconId) {
  return iconId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function cleanSvg(rawSvg) {
  return rawSvg
    .replace(/<\?xml.*?\?>/gi, '')
    .replace(/<!--.*?-->/gis, '')
    .replace(/\s*class="[^"]*"/gi, '')
    .replace(/\s*width="[^"]*"/gi, '')
    .replace(/\s*height="[^"]*"/gi, '')
    .replace(/<svg\s*/i, '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function run() {
  console.log('--- Starting Icon Catalog Builder ---');
  let iconsDir = null;

  if (fs.existsSync(LUCIDE_STATIC_PATH)) {
    iconsDir = LUCIDE_STATIC_PATH;
    console.log(`Found source: lucide-static (${iconsDir})`);
  } else if (fs.existsSync(ASSETS_ICONS_PATH)) {
    iconsDir = ASSETS_ICONS_PATH;
    console.log(`Found source: assets/icons (${iconsDir})`);
  } else {
    console.error('Error: No icon source directory found (lucide-static or assets/icons)');
    process.exit(1);
  }

  const files = fs.readdirSync(iconsDir).filter((f) => f.endsWith('.svg'));
  console.log(`Processing ${files.length} SVG files...`);

  const catalog = [];

  for (const file of files) {
    const iconId = path.basename(file, '.svg');
    const filePath = path.join(iconsDir, file);
    try {
      const rawContent = fs.readFileSync(filePath, 'utf-8');
      const svgContent = cleanSvg(rawContent);

      catalog.push({
        id: iconId,
        name: formatName(iconId),
        category: getCategory(iconId),
        svgContent: svgContent,
      });
    } catch (err) {
      console.warn(`Could not process ${file}:`, err.message);
    }
  }

  // Ensure target directory exists
  const outDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`Successfully generated ${catalog.length} indexed icons in:`);
  console.log(OUTPUT_PATH);
}

run();
