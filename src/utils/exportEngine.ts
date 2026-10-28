import { CanvasNode } from '../types';

export type ExportFormat =
  | 'react_shadcn'
  | 'html_bootstrap'
  | 'react_bootstrap'
  | 'html_css'
  | 'react_native_tailwind';

export const EXPORT_FORMATS: { id: ExportFormat; label: string; desc: string; icon: string }[] = [
  {
    id: 'react_shadcn',
    label: 'React 19 + shadcn/ui',
    desc: 'TypeScript JSX with Tailwind CSS v4 and shadcn components',
    icon: 'fab fa-react',
  },
  {
    id: 'html_bootstrap',
    label: 'HTML5 + Bootstrap 5.3',
    desc: 'Ready-to-run semantic HTML with Bootstrap CDN and FontAwesome 5',
    icon: 'fab fa-bootstrap',
  },
  {
    id: 'react_bootstrap',
    label: 'React + react-bootstrap',
    desc: 'Component-based React code using react-bootstrap library',
    icon: 'fas fa-code',
  },
  {
    id: 'html_css',
    label: 'Semantic HTML5 + Pure CSS',
    desc: 'Clean markup with embedded external CSS styles',
    icon: 'fab fa-html5',
  },
  {
    id: 'react_native_tailwind',
    label: 'React Native + NativeWind',
    desc: 'Mobile-ready View and Text elements styled with Tailwind',
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

// Generate React + shadcn/ui Code
function generateReactShadcn(nodes: CanvasNode[], indent = '      '): string {
  return nodes
    .map((node) => {
      const styleAttr = node.style && Object.keys(node.style).length > 0
        ? ` style={${JSON.stringify(node.style)}}`
        : '';
      const childrenCode = node.children && node.children.length > 0
        ? `\n${generateReactShadcn(node.children, indent + '  ')}\n${indent}`
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
        case 'fontawesome_icon':
          if (node.props.library === 'material_symbols') {
            return `${indent}<span className="${node.props.prefix || 'material-icons-outlined'}" id="${node.id}"${styleAttr}>${node.props.iconName || 'star'}</span>`;
          }
          return `${indent}<i className="${node.props.prefix || 'fas'} ${node.props.iconName || 'fa-star'}" id="${node.id}"${styleAttr} />`;
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

// Generate Semantic HTML + Bootstrap 5.3 CDN
function generateHtmlBootstrap(nodes: CanvasNode[], indent = '      '): string {
  return nodes
    .map((node) => {
      const inlineCss = styleToInlineCss(node.style);
      const styleAttr = inlineCss ? ` style="${inlineCss}"` : '';
      const childrenCode = node.children && node.children.length > 0
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
        case 'fontawesome_icon':
          if (node.props.library === 'material_symbols') {
            return `${indent}<span class="${node.props.prefix || 'material-icons-outlined'}" id="${node.id}"${styleAttr}>${node.props.iconName || 'star'}</span>`;
          }
          return `${indent}<i class="${node.props.prefix || 'fas'} ${node.props.iconName || 'fa-star'}" id="${node.id}"${styleAttr}></i>`;
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
      const childrenCode = node.children && node.children.length > 0
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
  switch (format) {
    case 'react_shadcn':
      return `import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';

export default function VisualForgeExport() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 flex flex-col items-center">
${generateReactShadcn(tree)}
    </main>
  );
}`;

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

    case 'html_css':
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VisualForge Export</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #09090b; color: #fafafa; padding: 24px; }
    a { color: inherit; text-decoration: none; }
  </style>
</head>
<body>
${generateHtmlBootstrap(tree)}
</body>
</html>`;

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
