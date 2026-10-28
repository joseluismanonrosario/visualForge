import { CanvasNode } from '../types';
import { findCatalogIcon, customizeSvg } from './svgIconRenderer';
import { getIconSvgSync } from './iconifyManager';

export type ExportFormat =
  | 'react_shadcn'
  | 'html_bootstrap'
  | 'react_bootstrap'
  | 'html_css'
  | 'esp32_embedded'
  | 'react_native_tailwind';

export const EXPORT_FORMATS: { id: ExportFormat; label: string; desc: string; icon: string }[] = [
  {
    id: 'react_shadcn',
    label: 'React 19 + Components JSX',
    desc: 'JSX con Tailwind CSS v4 y componentes SVG puros sin dependencias',
    icon: 'fab fa-react',
  },
  {
    id: 'html_css',
    label: 'HTML5 Puro (Inline SVG)',
    desc: 'HTML semántico con SVGs en línea directos, sin CDNs ni fuentes externas',
    icon: 'fab fa-html5',
  },
  {
    id: 'esp32_embedded',
    label: 'ESP32 Web Server (C++ PROGMEM)',
    desc: 'C++ Raw Literal con HTML/SVG autónomo para SPIFFS/LittleFS en ESP32',
    icon: 'fas fa-microchip',
  },
  {
    id: 'html_bootstrap',
    label: 'HTML5 + Bootstrap 5.3',
    desc: 'Markup semántico listo para ejecutar con Bootstrap 5.3 y SVGs',
    icon: 'fab fa-bootstrap',
  },
  {
    id: 'react_bootstrap',
    label: 'React + react-bootstrap',
    desc: 'Código React basado en react-bootstrap y SVGs optimizados',
    icon: 'fas fa-code',
  },
  {
    id: 'react_native_tailwind',
    label: 'React Native + NativeWind',
    desc: 'Componentes View y Text listos para móvil estilizados con Tailwind',
    icon: 'fas fa-mobile-alt',
  },
];

// Helper to convert style object to inline CSS string
function styleToInlineCss(style: Record<string, any>): string {
  if (!style) return '';
  return Object.entries(style)
    .map(([key, val]) => {
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${kebabKey}: ${val}`;
    })
    .join('; ');
}

// Convert kebab-case icon id to PascalCase component name
function toComponentName(id: string): string {
  return (
    id
      .split(/[-_]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('') + 'Icon'
  );
}

// Extract ONLY used SVGs from the canvas tree
export function extractUsedCatalogSvgs(nodes: CanvasNode[]): Map<string, { id: string; name: string; componentName: string; rawSvg: string }> {
  const map = new Map<string, { id: string; name: string; componentName: string; rawSvg: string }>();

  function traverse(list: CanvasNode[]) {
    for (const node of list) {
      if (node.type === 'fontawesome_icon' || node.type === 'svg_icon') {
        const iconKey = node.props.svgId || node.props.iconName || 'lucide:rocket';
        const syncSvg = getIconSvgSync(iconKey) || node.props.svgContent;
        if (syncSvg && !map.has(iconKey)) {
          map.set(iconKey, {
            id: iconKey,
            name: iconKey,
            componentName: toComponentName(iconKey.replace(/[: -]/g, '_')),
            rawSvg: syncSvg,
          });
        } else {
          const catalogItem = findCatalogIcon(iconKey);
          if (catalogItem && !map.has(catalogItem.id)) {
            map.set(catalogItem.id, {
              id: catalogItem.id,
              name: catalogItem.name,
              componentName: toComponentName(catalogItem.id),
              rawSvg: catalogItem.svgContent,
            });
          }
        }
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  }

  traverse(nodes);
  return map;
}

// Convert raw SVG string to clean React JSX component code
export function convertSvgToJsx(rawSvg: string, componentName: string): string {
  let jsxSvg = rawSvg
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/stroke-linecap=/g, 'strokeLinecap=')
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/stroke-miterlimit=/g, 'strokeMiterlimit=')
    .replace(/fill-rule=/g, 'fillRule=')
    .replace(/clip-rule=/g, 'clipRule=')
    .replace(/xmlns:xlink=/g, 'xmlnsXlink=')
    .replace(/class=/g, 'className=')
    .replace(/<svg\s+/i, '<svg {...props} ');

  return `function ${componentName}(props: React.SVGProps<SVGSVGElement>) {
  return (
    ${jsxSvg}
  );
}`;
}

// Generate React + shadcn/ui Code with Clean JSX SVGs
function generateReactShadcn(nodes: CanvasNode[], usedSvgs: Map<string, any>, indent = '      '): string {
  return nodes
    .map((node) => {
      const styleAttr =
        node.style && Object.keys(node.style).length > 0
          ? ` style={${JSON.stringify(node.style)}}`
          : '';
      const childrenCode =
        node.children && node.children.length > 0
          ? `\n${generateReactShadcn(node.children, usedSvgs, indent + '  ')}\n${indent}`
          : '';

      switch (node.type) {
        case 'container':
          return `${indent}<div className="vf-container" id="${node.id}"${styleAttr}>${childrenCode}</div>`;
        case 'grid':
          return `${indent}<div className="grid grid-cols-${node.props.columns || 2} gap-4" id="${node.id}"${styleAttr}>${childrenCode}</div>`;
        case 'stack':
          return `${indent}<div className="flex flex-row items-center gap-3" id="${node.id}"${styleAttr}>${childrenCode}</div>`;
        case 'navbar':
          return `${indent}<header className="w-full flex items-center justify-between" id="${node.id}"${styleAttr}>
${indent}  <div className="font-bold text-lg">${node.props.brand || 'Logo'}</div>
${indent}  <nav className="flex items-center gap-4 text-sm font-medium">
${(node.props.links || []).map((l: any) => `${indent}    <a href="${l.href}" className="hover:underline">${l.label}</a>`).join('\n')}
${indent}  </nav>
${indent}  <div className="flex items-center gap-2">${childrenCode}</div>
${indent}</header>`;
        case 'button':
          return `${indent}<Button variant="${node.props.variant || 'default'}" id="${node.id}"${styleAttr}>${node.props.label || 'Button'}</Button>`;
        case 'input':
          return `${indent}<div className="w-full space-y-1">
${indent}  <Label htmlFor="${node.id}">${node.props.label || 'Input'}</Label>
${indent}  <Input id="${node.id}" placeholder="${node.props.placeholder || ''}"${styleAttr} />
${indent}</div>`;
        case 'badge':
          return `${indent}<Badge variant="${node.props.variant || 'default'}" id="${node.id}"${styleAttr}>${node.props.label || 'Badge'}</Badge>`;
        case 'card':
          return `${indent}<Card id="${node.id}"${styleAttr}>
${indent}  <CardHeader>
${indent}    <CardTitle>${node.props.title || 'Card Title'}</CardTitle>
${indent}    <CardDescription>${node.props.subtitle || ''}</CardDescription>
${indent}  </CardHeader>
${indent}  <CardContent className="space-y-3">${childrenCode}</CardContent>
${indent}</Card>`;
        case 'typography':
          const Tag = node.props.as || 'p';
          return `${indent}<${Tag} id="${node.id}"${styleAttr}>${node.props.text || ''}</${Tag}>`;
        case 'svg_icon':
        case 'fontawesome_icon': {
          const iconKey = node.props.svgId || node.props.iconName || 'lucide:rocket';
          const size = node.props.size || node.style?.fontSize || 24;
          const sizeVal = typeof size === 'number' ? size : parseInt(size) || 24;
          const compName = toComponentName(iconKey.replace(/[: -]/g, '_'));
          return `${indent}<${compName} width={${sizeVal}} height={${sizeVal}} id="${node.id}"${styleAttr} />`;
        }
        case 'image':
          return `${indent}<img src="${node.props.src}" alt="${node.props.alt || ''}" id="${node.id}" className="rounded-lg object-cover"${styleAttr} />`;
        case 'switch':
          return `${indent}<div className="flex items-center space-x-2">
${indent}  <Switch id="${node.id}" defaultChecked={${node.props.checked ? 'true' : 'false'}} />
${indent}  <Label htmlFor="${node.id}">${node.props.label || 'Toggle'}</Label>
${indent}</div>`;
        case 'progress':
          return `${indent}<Progress value={${node.props.value || 50}} id="${node.id}"${styleAttr} />`;
        default:
          return `${indent}<div id="${node.id}"${styleAttr}>${childrenCode || node.props.label || node.type}</div>`;
      }
    })
    .join('\n');
}

// Generate Clean Semantic HTML with INLINE SVGs (Zero CDNs, Zero .woff)
function generateHtmlInlineSvg(nodes: CanvasNode[], indent = '      '): string {
  return nodes
    .map((node) => {
      const inlineCss = styleToInlineCss(node.style);
      const styleAttr = inlineCss ? ` style="${inlineCss}"` : '';
      const childrenCode =
        node.children && node.children.length > 0
          ? `\n${generateHtmlInlineSvg(node.children, indent + '  ')}\n${indent}`
          : '';

      switch (node.type) {
        case 'container':
          return `${indent}<div class="vf-container" id="${node.id}"${styleAttr}>${childrenCode}</div>`;
        case 'grid':
          return `${indent}<div class="vf-grid" id="${node.id}"${styleAttr}>${childrenCode}</div>`;
        case 'stack':
          return `${indent}<div class="vf-stack" id="${node.id}"${styleAttr}>${childrenCode}</div>`;
        case 'navbar':
          return `${indent}<header class="vf-navbar" id="${node.id}"${styleAttr}>
${indent}  <div class="vf-brand">${node.props.brand || 'VisualForge'}</div>
${indent}  <nav class="vf-nav-links">
${(node.props.links || []).map((l: any) => `${indent}    <a href="${l.href}">${l.label}</a>`).join('\n')}
${indent}  </nav>
${indent}  <div class="vf-nav-actions">${childrenCode}</div>
${indent}</header>`;
        case 'button':
          return `${indent}<button type="button" class="vf-button" id="${node.id}"${styleAttr}>${node.props.label || 'Button'}</button>`;
        case 'input':
          return `${indent}<div class="vf-form-group">
${indent}  <label for="${node.id}">${node.props.label || 'Input'}</label>
${indent}  <input type="text" id="${node.id}" placeholder="${node.props.placeholder || ''}"${styleAttr}>
${indent}</div>`;
        case 'badge':
          return `${indent}<span class="vf-badge" id="${node.id}"${styleAttr}>${node.props.label || 'Badge'}</span>`;
        case 'card':
          return `${indent}<div class="vf-card" id="${node.id}"${styleAttr}>
${indent}  <div class="vf-card-header">
${indent}    <h3>${node.props.title || 'Card Title'}</h3>
${indent}    <p>${node.props.subtitle || ''}</p>
${indent}  </div>
${indent}  <div class="vf-card-body">${childrenCode}</div>
${indent}</div>`;
        case 'typography':
          const Tag = node.props.as || 'p';
          return `${indent}<${Tag} id="${node.id}"${styleAttr}>${node.props.text || ''}</${Tag}>`;
        case 'svg_icon':
        case 'fontawesome_icon': {
          const iconKey = node.props.svgId || node.props.iconName || 'lucide:rocket';
          const size = node.props.size || node.style?.fontSize || 24;
          const stroke = node.style?.color || 'currentColor';
          const fill = node.style?.fill || 'none';
          const item = findCatalogIcon(iconKey);
          const inlineSvg =
            getIconSvgSync(iconKey, { width: size, height: size, stroke, fill }) ||
            (item ? customizeSvg(item.svgContent, { width: size, height: size, stroke, fill, className: 'vf-icon-svg' }) : '');

          if (inlineSvg) {
            return `${indent}<span id="${node.id}" class="vf-icon-wrapper"${styleAttr}>${inlineSvg}</span>`;
          }
          return `${indent}<span id="${node.id}" class="vf-icon-wrapper"${styleAttr}>[Icon: ${iconKey}]</span>`;
        }
        case 'image':
          return `${indent}<img src="${node.props.src}" alt="${node.props.alt || ''}" class="vf-image" id="${node.id}"${styleAttr}>`;
        default:
          return `${indent}<div id="${node.id}"${styleAttr}>${childrenCode || node.props.label || node.type}</div>`;
      }
    })
    .join('\n');
}

// Generate Semantic HTML + Bootstrap 5.3 CDN
function generateHtmlBootstrap(nodes: CanvasNode[], indent = '      '): string {
  return nodes
    .map((node) => {
      const inlineCss = styleToInlineCss(node.style);
      const styleAttr = inlineCss ? ` style="${inlineCss}"` : '';
      const childrenCode =
        node.children && node.children.length > 0
          ? `\n${generateHtmlBootstrap(node.children, indent + '  ')}\n${indent}`
          : '';

      switch (node.type) {
        case 'container':
          return `${indent}<div class="container-fluid p-4" id="${node.id}"${styleAttr}>${childrenCode}</div>`;
        case 'grid':
          return `${indent}<div class="row g-3" id="${node.id}"${styleAttr}>${childrenCode}</div>`;
        case 'stack':
          return `${indent}<div class="d-flex align-items-center gap-2" id="${node.id}"${styleAttr}>${childrenCode}</div>`;
        case 'navbar':
          return `${indent}<nav class="navbar navbar-expand-lg bg-dark navbar-dark px-4 py-3 border-bottom" id="${node.id}"${styleAttr}>
${indent}  <a class="navbar-brand fw-bold" href="#">${node.props.brand || 'VisualForge'}</a>
${indent}  <div class="collapse navbar-collapse">
${indent}    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
${(node.props.links || []).map((l: any) => `${indent}      <li class="nav-item"><a class="nav-link" href="${l.href}">${l.label}</a></li>`).join('\n')}
${indent}    </ul>
${indent}    <div class="d-flex">${childrenCode}</div>
${indent}  </div>
${indent}</nav>`;
        case 'button':
          return `${indent}<button type="button" class="btn btn-primary" id="${node.id}"${styleAttr}>${node.props.label || 'Button'}</button>`;
        case 'input':
          return `${indent}<div class="mb-3">
${indent}  <label for="${node.id}" class="form-label">${node.props.label || 'Input'}</label>
${indent}  <input type="text" class="form-control" id="${node.id}" placeholder="${node.props.placeholder || ''}"${styleAttr}>
${indent}</div>`;
        case 'badge':
          return `${indent}<span class="badge bg-primary rounded-pill" id="${node.id}"${styleAttr}>${node.props.label || 'Badge'}</span>`;
        case 'card':
          return `${indent}<div class="card bg-dark text-white border-secondary" id="${node.id}"${styleAttr}>
${indent}  <div class="card-body">
${indent}    <h5 class="card-title">${node.props.title || 'Card Title'}</h5>
${indent}    <h6 class="card-subtitle mb-2 text-muted">${node.props.subtitle || ''}</h6>
${indent}    <div class="card-text">${childrenCode}</div>
${indent}  </div>
${indent}</div>`;
        case 'typography':
          const Tag = node.props.as || 'p';
          return `${indent}<${Tag} id="${node.id}"${styleAttr}>${node.props.text || ''}</${Tag}>`;
        case 'svg_icon':
        case 'fontawesome_icon': {
          const iconKey = node.props.svgId || node.props.iconName || 'lucide:rocket';
          const size = node.props.size || node.style?.fontSize || 24;
          const stroke = node.style?.color || 'currentColor';
          const fill = node.style?.fill || 'none';
          const item = findCatalogIcon(iconKey);
          const inlineSvg =
            getIconSvgSync(iconKey, { width: size, height: size, stroke, fill }) ||
            (item ? customizeSvg(item.svgContent, { width: size, height: size, stroke, fill }) : '');

          if (inlineSvg) {
            return `${indent}<span class="d-inline-flex align-items-center" id="${node.id}"${styleAttr}>${inlineSvg}</span>`;
          }
          return `${indent}<span id="${node.id}" class="d-inline-flex align-items-center"${styleAttr}>[Icon: ${iconKey}]</span>`;
        }
        case 'image':
          return `${indent}<img src="${node.props.src}" alt="${node.props.alt || ''}" class="img-fluid rounded" id="${node.id}"${styleAttr}>`;
        default:
          return `${indent}<div id="${node.id}"${styleAttr}>${childrenCode || node.props.label || node.type}</div>`;
      }
    })
    .join('\n');
}

// Generate React Native + NativeWind
function generateReactNative(nodes: CanvasNode[], indent = '      '): string {
  return nodes
    .map((node) => {
      const childrenCode =
        node.children && node.children.length > 0
          ? `\n${generateReactNative(node.children, indent + '  ')}\n${indent}`
          : '';

      switch (node.type) {
        case 'container':
        case 'stack':
          return `${indent}<View className="p-4 bg-zinc-900 rounded-2xl gap-3">${childrenCode}</View>`;
        case 'button':
          return `${indent}<TouchableOpacity className="bg-blue-600 px-5 py-3 rounded-xl items-center justify-center">
${indent}  <Text className="text-white font-semibold text-base">${node.props.label || 'Button'}</Text>
${indent}</TouchableOpacity>`;
        case 'typography':
          return `${indent}<Text className="text-white font-bold text-lg">${node.props.text || ''}</Text>`;
        case 'image':
          return `${indent}<Image source={{ uri: '${node.props.src}' }} className="w-full h-48 rounded-xl" resizeMode="cover" />`;
        default:
          return `${indent}<View className="p-2">${childrenCode}</View>`;
      }
    })
    .join('\n');
}

// Master Export Formatter
export function generateCode(format: ExportFormat, tree: CanvasNode[]): string {
  // Extract ONLY used SVGs from the canvas
  const usedSvgs = extractUsedCatalogSvgs(tree);

  switch (format) {
    case 'react_shadcn': {
      // Generate clean JSX component functions ONLY for used SVGs
      const jsxComponentDefs = Array.from(usedSvgs.values())
        .map((item) => convertSvgToJsx(item.rawSvg, item.componentName))
        .join('\n\n');

      return `import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';

// --- Pure React SVG Icon Components (Only Extracted Used Icons) ---
${jsxComponentDefs ? jsxComponentDefs + '\n' : '// (No direct SVG icons used)\n'}
export default function VisualForgeExport() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 flex flex-col items-center">
${generateReactShadcn(tree, usedSvgs)}
    </main>
  );
}`;
    }

    case 'html_css': {
      return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VisualForge Export - Clean Semantic HTML & Pure Inline SVGs</title>
  <style>
    /* 100% Self-Contained Styles (Zero External CDNs, Zero .woff Fonts) */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #09090b;
      color: #fafafa;
      line-height: 1.5;
      padding: 24px;
    }
    a { color: inherit; text-decoration: none; }
    .vf-container { width: 100%; max-width: 1200px; margin: 0 auto; }
    .vf-icon-wrapper { display: inline-flex; align-items: center; justify-content: center; vertical-align: middle; }
    .vf-icon-svg { display: block; }
    .vf-button {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 8px 16px; border-radius: 6px; font-weight: 500;
      background: #0d99ff; color: #fff; border: none; cursor: pointer;
    }
  </style>
</head>
<body>
${generateHtmlInlineSvg(tree)}
</body>
</html>`;
    }

    case 'esp32_embedded': {
      const htmlBody = generateHtmlInlineSvg(tree, '  ');
      return `// ====================================================================
// VisualForge Studio - ESP32 / Arduino / PlatformIO Embedded Web Server
// Totalmente autónomo: SVGs inline, cero CDNs, cero fuentes .woff externas
// Compatible con ESP32 AsyncWebServer, WebServer.h, SPIFFS y LittleFS
// ====================================================================

#pragma once
#include <pgmspace.h>

const char INDEX_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ESP32 Web Server</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, sans-serif;
      background: #121214;
      color: #f4f4f5;
      padding: 16px;
      line-height: 1.5;
    }
    a { color: #38bdf8; text-decoration: none; }
    .vf-icon-wrapper { display: inline-flex; align-items: center; justify-content: center; }
    .vf-button {
      background: #0d99ff; color: white; border: none;
      padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer;
    }
  </style>
</head>
<body>
${htmlBody}
</body>
</html>
)rawliteral";

/*
  // Ejemplo de uso en ESP32 con ESPAsyncWebServer:
  #include <WiFi.h>
  #include <ESPAsyncWebServer.h>

  AsyncWebServer server(80);

  void setup() {
    Serial.begin(115200);
    WiFi.begin("TU_SSID", "TU_PASSWORD");
    while (WiFi.status() != WL_CONNECTED) delay(500);

    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
      request->send_P(200, "text/html", INDEX_HTML);
    });
    server.begin();
    Serial.println(WiFi.localIP());
  }

  void loop() {}
*/
`;
    }

    case 'html_bootstrap':
      return `<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VisualForge Studio - Exported Page</title>
  <!-- Bootstrap 5.3 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- FontAwesome 5 Free -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
</head>
<body class="bg-dark text-light">

${generateHtmlBootstrap(tree)}

  <!-- Bootstrap 5.3 Bundle JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

    case 'react_bootstrap':
      return `import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button, Card, Badge, Form } from 'react-bootstrap';

export default function ReactBootstrapExport() {
  return (
    <Container fluid className="bg-dark text-light min-vh-100 p-4">
${generateHtmlBootstrap(tree)}
    </Container>
  );
}`;

    case 'react_native_tailwind':
      return `import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';

export default function MobileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <ScrollView className="flex-1 px-4 py-6">
${generateReactNative(tree)}
      </ScrollView>
    </SafeAreaView>
  );
}`;

    default:
      return '// Format not supported';
  }
}

// Sandbox-Safe Clipboard Utility
export async function copyToClipboardSafe(textToCopy: string): Promise<boolean> {
  let copied = false;
  // 1. Try modern Clipboard API
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(textToCopy);
      copied = true;
    }
  } catch {
    copied = false;
  }

  // 2. Fallback to hidden textarea with execCommand('copy')
  if (!copied && typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.left = '-9999px';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      copied = document.execCommand('copy');
      document.body.removeChild(textarea);
    } catch {
      copied = false;
    }
  }

  return copied;
}
