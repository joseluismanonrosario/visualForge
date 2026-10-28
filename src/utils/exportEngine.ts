import { CanvasNode, ProjectType, GpioAction, GpioCommMode } from '../types';
import { findCatalogIcon, customizeSvg } from './svgIconRenderer';
import { getIconSvgSync } from './iconifyManager';

export type ExportFormat =
  | 'esp32_html'
  | 'esp32_main_cpp'
  | 'esp32_embedded'
  | 'react_shadcn'
  | 'html_css'
  | 'html_bootstrap'
  | 'react_bootstrap'
  | 'react_native_tailwind';

export interface ExportFormatItem {
  id: ExportFormat;
  label: string;
  desc: string;
  icon: string;
  projectTypes?: ProjectType[];
}

export const EXPORT_FORMATS: ExportFormatItem[] = [
  {
    id: 'esp32_html',
    label: 'ESP32 WebUI (index.html)',
    desc: 'HTML optimizado con SVGs inline y funciones fetch() asíncronas para ESP32',
    icon: 'fas fa-microchip',
    projectTypes: ['esp32'],
  },
  {
    id: 'esp32_main_cpp',
    label: 'Firmware C++ (main.cpp)',
    desc: 'Código C++ con ESPAsyncWebServer y pinMode() configurados automáticamente según el diseño',
    icon: 'fas fa-file-code',
    projectTypes: ['esp32'],
  },
  {
    id: 'esp32_embedded',
    label: 'ESP32 All-in-One (esp32_webserver.h)',
    desc: 'Cabecera C++ con HTML/SVG embebido en PROGMEM listo para compilar',
    icon: 'fas fa-memory',
    projectTypes: ['esp32'],
  },
  {
    id: 'html_css',
    label: 'HTML5 Puro (Inline SVG)',
    desc: 'HTML semántico con SVGs en línea directos, sin CDNs ni fuentes externas',
    icon: 'fab fa-html5',
    projectTypes: ['html_css', 'esp32'],
  },
  {
    id: 'react_shadcn',
    label: 'React 19 + Components JSX',
    desc: 'JSX con Tailwind CSS v4 y componentes SVG puros sin dependencias',
    icon: 'fab fa-react',
    projectTypes: ['react'],
  },
  {
    id: 'html_bootstrap',
    label: 'HTML5 + Bootstrap 5.3',
    desc: 'Markup semántico listo para ejecutar con Bootstrap 5.3 y SVGs',
    icon: 'fab fa-bootstrap',
    projectTypes: ['html_css'],
  },
  {
    id: 'react_bootstrap',
    label: 'React + react-bootstrap',
    desc: 'Código React basado en react-bootstrap y SVGs optimizados',
    icon: 'fas fa-code',
    projectTypes: ['react'],
  },
  {
    id: 'react_native_tailwind',
    label: 'React Native + NativeWind',
    desc: 'Componentes View y Text listos para móvil estilizados con Tailwind',
    icon: 'fas fa-mobile-alt',
    projectTypes: ['react'],
  },
];

export function getExportFormatsForProject(projectType?: ProjectType): ExportFormatItem[] {
  if (!projectType) return EXPORT_FORMATS;
  if (projectType === 'esp32') {
    return EXPORT_FORMATS.filter((f) => !f.projectTypes || f.projectTypes.includes('esp32'));
  }
  if (projectType === 'html_css') {
    return EXPORT_FORMATS.filter((f) => !f.projectTypes || f.projectTypes.includes('html_css'));
  }
  if (projectType === 'react') {
    return EXPORT_FORMATS.filter((f) => !f.projectTypes || f.projectTypes.includes('react'));
  }
  return EXPORT_FORMATS;
}

export function getDefaultFormatForProject(projectType?: ProjectType): ExportFormat {
  if (projectType === 'esp32') return 'esp32_html';
  if (projectType === 'html_css') return 'html_css';
  if (projectType === 'react') return 'react_shadcn';
  return 'react_shadcn';
}

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

export interface ExtractedGpioPin {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  pin: number;
  action: GpioAction;
  mode: GpioCommMode;
  label: string;
  pwmValue?: number;
}

export function extractUsedGpioPins(nodes: CanvasNode[]): ExtractedGpioPin[] {
  const result: ExtractedGpioPin[] = [];
  const visited = new Set<string>();

  function traverse(list: CanvasNode[]) {
    for (const node of list) {
      if (node.props?.gpio?.enabled && typeof node.props.gpio.pin === 'number') {
        const key = `${node.id}-${node.props.gpio.pin}`;
        if (!visited.has(key)) {
          visited.add(key);
          result.push({
            nodeId: node.id,
            nodeName: node.name,
            nodeType: node.type,
            pin: node.props.gpio.pin,
            action: node.props.gpio.action || 'TOGGLE_PIN',
            mode: node.props.gpio.mode || 'HTTP_GET',
            label: node.props.gpio.label || node.name,
            pwmValue: node.props.gpio.pwmValue,
          });
        }
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  }

  traverse(nodes);
  return result;
}

export function generateEsp32MainCpp(nodes: CanvasNode[]): string {
  const pins = extractUsedGpioPins(nodes);

  // Group by unique pin number
  const uniquePinsMap = new Map<number, ExtractedGpioPin>();
  for (const p of pins) {
    if (!uniquePinsMap.has(p.pin)) {
      uniquePinsMap.set(p.pin, p);
    }
  }

  // Provide sensible defaults if no pin was explicitly marked active
  if (uniquePinsMap.size === 0) {
    uniquePinsMap.set(2, {
      nodeId: 'led_default',
      nodeName: 'LED Onboard',
      nodeType: 'switch',
      pin: 2,
      action: 'TOGGLE_PIN',
      mode: 'HTTP_GET',
      label: 'LED Onboard (GPIO 2)',
    });
    uniquePinsMap.set(4, {
      nodeId: 'relay_default',
      nodeName: 'Relé Principal',
      nodeType: 'button',
      pin: 4,
      action: 'TOGGLE_PIN',
      mode: 'HTTP_GET',
      label: 'Relé Principal (GPIO 4)',
    });
  }

  const pinList = Array.from(uniquePinsMap.values());

  const pinsDefinitions = pinList
    .map((p) => {
      const safeName = (p.label || `GPIO_${p.pin}`)
        .toUpperCase()
        .replace(/[^A-Z0-9_]/g, '_')
        .replace(/_+/g, '_');
      return `#define PIN_${safeName} ${p.pin} // ${p.label || p.nodeName} (${p.action})`;
    })
    .join('\n');

  const pinsSetup = pinList
    .map((p) => {
      const safeName = (p.label || `GPIO_${p.pin}`)
        .toUpperCase()
        .replace(/[^A-Z0-9_]/g, '_')
        .replace(/_+/g, '_');
      if (p.action === 'PWM') {
        return `  // ${p.label}: Canal PWM en pin ${p.pin}
  #if ESP_ARDUINO_VERSION_MAJOR >= 3
  ledcAttach(PIN_${safeName}, 5000, 8);
  #else
  ledcSetup(0, 5000, 8);
  ledcAttachPin(PIN_${safeName}, 0);
  #endif`;
      } else if (p.action === 'READ_PIN') {
        return `  // ${p.label}: Entrada Digital / Sensor en pin ${p.pin}
  pinMode(PIN_${safeName}, INPUT);`;
      } else {
        return `  // ${p.label}: Salida Digital en pin ${p.pin}
  pinMode(PIN_${safeName}, OUTPUT);
  digitalWrite(PIN_${safeName}, LOW);`;
      }
    })
    .join('\n\n');

  return `// ====================================================================
// VisualForge Studio - Firmware ESP32 Autogenerado
// Web Server Asíncrono (ESPAsyncWebServer) con mapeo automático de pines GPIO
// Compatible con: Arduino IDE, PlatformIO, ESP-IDF (Arduino framework)
// ====================================================================

#include <Arduino.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>

// Credenciales Wi-Fi (Modo SoftAP Punto de Acceso o Estación)
const char* ssid = "ESP32_VisualForge";
const char* password = ""; // Red abierta (o asigna contraseña de 8+ caracteres)

// Instancia del servidor HTTP asíncrono en puerto 80
AsyncWebServer server(80);

// --- Definición de Pines GPIO Utilizados en el Diseño ---
${pinsDefinitions}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\\n===========================================");
  Serial.println("[VisualForge ESP32] Iniciando sistema IoT...");
  Serial.println("===========================================");

  // Configuración de modo de pines (pinMode) según componentes visuales:
${pinsSetup}

  // Inicializar Punto de Acceso Wi-Fi (SoftAP)
  WiFi.softAP(ssid, password);
  IPAddress IP = WiFi.softAPIP();
  Serial.println("[WiFi] Punto de acceso iniciado exitosamente.");
  Serial.print("[WiFi] Abre en el navegador de tu movil o PC: http://");
  Serial.println(IP);

  // Ruta principal (WebUI HTML)
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
    // Si index.html está en SPIFFS / LittleFS:
    // request->send(LittleFS, "/index.html", "text/html");
    // O si usas el header esp32_webserver.h con PROGMEM:
    // request->send_P(200, "text/html", INDEX_HTML);
    request->send(200, "text/html", "<h2>VisualForge ESP32 Activo</h2><p>Sube el archivo index.html generado a LittleFS/SPIFFS o usa esp32_webserver.h</p>");
  });

  // Ruta API para control y lectura de pines GPIO
  server.on("/update", HTTP_GET, [](AsyncWebServerRequest *request) {
    if (!request->hasParam("pin")) {
      request->send(400, "text/plain", "Error: Falta parametro 'pin'");
      return;
    }

    int pin = request->getParam("pin")->value().toInt();
    String action = request->hasParam("action") ? request->getParam("action")->value() : "TOGGLE_PIN";
    int val = request->hasParam("val") ? request->getParam("val")->value().toInt() : 0;

    Serial.printf("[GPIO Update] Pin: %d | Accion: %s | Valor: %d\\n", pin, action.c_str(), val);

    if (action == "TOGGLE_PIN") {
      int currentState = digitalRead(pin);
      int newState = (currentState == HIGH) ? LOW : HIGH;
      digitalWrite(pin, newState);
      request->send(200, "text/plain", newState == HIGH ? "ON" : "OFF");
      return;
    } else if (action == "SET_HIGH") {
      digitalWrite(pin, HIGH);
      request->send(200, "text/plain", "HIGH");
      return;
    } else if (action == "SET_LOW") {
      digitalWrite(pin, LOW);
      request->send(200, "text/plain", "LOW");
      return;
    } else if (action == "PWM") {
      #if ESP_ARDUINO_VERSION_MAJOR >= 3
      ledcWrite(pin, val);
      #else
      ledcWrite(0, val);
      #endif
      request->send(200, "text/plain", String(val));
      return;
    } else if (action == "READ_PIN") {
      int readVal = digitalRead(pin);
      request->send(200, "text/plain", String(readVal));
      return;
    }

    request->send(200, "text/plain", "OK");
  });

  server.begin();
  Serial.println("[VisualForge ESP32] Servidor Web iniciado y escuchando peticiones en puerto 80.");
}

void loop() {
  // ESPAsyncWebServer es completamente no bloqueante (basado en eventos).
  // loop() queda libre para tus tareas de control o sensores.
  delay(10);
}
`;
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
function generateHtmlInlineSvg(nodes: CanvasNode[], indent = '      ', isEsp32 = false): string {
  return nodes
    .map((node) => {
      const inlineCss = styleToInlineCss(node.style);
      const styleAttr = inlineCss ? ` style="${inlineCss}"` : '';
      const childrenCode =
        node.children && node.children.length > 0
          ? `\n${generateHtmlInlineSvg(node.children, indent + '  ', isEsp32)}\n${indent}`
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
        case 'button': {
          const gpio = isEsp32 && node.props?.gpio?.enabled ? node.props.gpio : null;
          let clickAttr = '';
          if (gpio) {
            if (gpio.action === 'PWM') {
              clickAttr = ` onclick="updateGPIO(${gpio.pin}, 'PWM', ${gpio.pwmValue ?? 128})"`;
            } else {
              clickAttr = ` onclick="updateGPIO(${gpio.pin}, '${gpio.action}')"`;
            }
          }
          return `${indent}<button type="button" class="vf-button" id="${node.id}"${clickAttr}${styleAttr}>${node.props.label || 'Button'}</button>`;
        }
        case 'switch': {
          const gpio = isEsp32 && node.props?.gpio?.enabled ? node.props.gpio : null;
          const eventAttr = gpio ? ` onchange="updateGPIO(${gpio.pin}, this.checked ? 'SET_HIGH' : 'SET_LOW')"` : '';
          return `${indent}<label class="vf-switch" id="${node.id}"${styleAttr}>
${indent}  <input type="checkbox"${node.props.checked ? ' checked' : ''}${eventAttr}>
${indent}  <span class="vf-switch-label">${node.props.label || 'Switch'}</span>
${indent}</label>`;
        }
        case 'slider': {
          const gpio = isEsp32 && node.props?.gpio?.enabled ? node.props.gpio : null;
          const eventAttr = gpio
            ? ` oninput="const v=document.getElementById('${node.id}_val'); if(v) v.textContent=this.value; updateGPIO(${gpio.pin}, 'PWM', this.value)"`
            : ` oninput="const v=document.getElementById('${node.id}_val'); if(v) v.textContent=this.value;"`;
          return `${indent}<div class="vf-slider-group" id="${node.id}"${styleAttr}>
${indent}  <div class="vf-slider-header">
${indent}    <span>${node.props.label || 'Slider'}</span>
${indent}    <span id="${node.id}_val" class="vf-slider-val">${node.props.value ?? 128}</span>
${indent}  </div>
${indent}  <input type="range" min="${node.props.min ?? 0}" max="${node.props.max ?? 255}" value="${node.props.value ?? 128}" class="vf-range"${eventAttr}>
${indent}</div>`;
        }
        case 'checkbox': {
          const gpio = isEsp32 && node.props?.gpio?.enabled ? node.props.gpio : null;
          const eventAttr = gpio ? ` onchange="updateGPIO(${gpio.pin}, this.checked ? 'SET_HIGH' : 'SET_LOW')"` : '';
          return `${indent}<label class="vf-checkbox" id="${node.id}"${styleAttr}>
${indent}  <input type="checkbox"${node.props.checked ? ' checked' : ''}${eventAttr}>
${indent}  <span>${node.props.label || 'Checkbox'}</span>
${indent}</label>`;
        }
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
    .vf-switch { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
    .vf-switch input { width: 38px; height: 20px; accent-color: #10b981; cursor: pointer; }
    .vf-range { width: 100%; accent-color: #0d99ff; cursor: pointer; }
  </style>
</head>
<body>
${generateHtmlInlineSvg(tree, '      ', false)}
</body>
</html>`;
    }

    case 'esp32_html': {
      return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ESP32 WebUI - VisualForge Studio</title>
  <style>
    /* 100% Autónomo: SVGs Inline, Cero CDNs, Cero Fuentes Externas */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #09090b;
      color: #fafafa;
      line-height: 1.5;
      padding: 24px;
    }
    a { color: #38bdf8; text-decoration: none; }
    .vf-container { width: 100%; max-width: 1200px; margin: 0 auto; }
    .vf-grid { display: grid; gap: 16px; }
    .vf-stack { display: flex; align-items: center; gap: 12px; }
    .vf-card {
      background: #18181b; border: 1px solid #27272a; border-radius: 12px;
      padding: 20px; display: flex; flex-direction: column; gap: 12px;
    }
    .vf-card-header h3 { font-size: 16px; font-weight: 600; color: #fff; }
    .vf-card-header p { font-size: 13px; color: #a1a1aa; }
    .vf-card-body { display: flex; flex-direction: column; gap: 12px; }
    .vf-icon-wrapper { display: inline-flex; align-items: center; justify-content: center; vertical-align: middle; }
    .vf-icon-svg { display: block; }
    .vf-button {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 10px 18px; border-radius: 8px; font-weight: 600; font-size: 13px;
      background: #0d99ff; color: #fff; border: none; cursor: pointer;
      transition: background 0.2s, transform 0.1s;
    }
    .vf-button:active { transform: scale(0.98); }
    .vf-switch { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
    .vf-switch input { width: 44px; height: 24px; accent-color: #10b981; cursor: pointer; }
    .vf-switch-label { font-size: 13px; color: #e4e4e7; font-weight: 500; }
    .vf-slider-group { display: flex; flex-direction: column; gap: 6px; width: 100%; }
    .vf-slider-header { display: flex; justify-content: space-between; font-size: 12px; color: #a1a1aa; }
    .vf-slider-val { font-family: monospace; color: #38bdf8; font-weight: 600; }
    .vf-range { width: 100%; accent-color: #0d99ff; cursor: pointer; height: 6px; }
    #vf-esp32-status {
      position: fixed; bottom: 20px; right: 20px;
      background: #18181b; color: #10b981; border: 1px solid #27272a;
      padding: 10px 18px; border-radius: 8px; font-family: monospace; font-size: 12px;
      opacity: 0; pointer-events: none; transition: opacity 0.3s; z-index: 9999;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
  </style>
</head>
<body>
${generateHtmlInlineSvg(tree, '  ', true)}

  <!-- Notificación Flotante de Estado GPIO -->
  <div id="vf-esp32-status"></div>

  <!-- Script Ligero de Comunicación HTTP Asíncrona con ESP32 -->
  <script>
    function updateGPIO(pin, action, valOrEl, elRef) {
      var val = undefined;
      if (typeof valOrEl !== 'object') {
        val = valOrEl;
      }
      var toast = document.getElementById('vf-esp32-status');
      if (toast) {
        toast.style.opacity = '1';
        toast.textContent = 'Enviando GPIO ' + pin + ': ' + action + (val !== undefined ? ' (' + val + ')' : '') + '...';
      }

      var url = '/update?pin=' + encodeURIComponent(pin) + '&action=' + encodeURIComponent(action);
      if (val !== undefined && val !== null) {
        url += '&val=' + encodeURIComponent(val);
      }

      fetch(url)
        .then(function(res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text();
        })
        .then(function(data) {
          console.log('[ESP32 OK] Pin ' + pin + ' -> ' + data);
          if (toast) {
            toast.textContent = 'GPIO ' + pin + ' actualizado OK: ' + data;
            setTimeout(function() { toast.style.opacity = '0'; }, 2500);
          }
        })
        .catch(function(err) {
          console.error('[ESP32 Error]:', err);
          if (toast) {
            toast.textContent = 'Error GPIO ' + pin + ': ' + err.message;
            setTimeout(function() { toast.style.opacity = '0'; }, 4000);
          }
        });
    }
  </script>
</body>
</html>`;
    }

    case 'esp32_main_cpp': {
      return generateEsp32MainCpp(tree);
    }

    case 'esp32_embedded': {
      const htmlBody = generateHtmlInlineSvg(tree, '  ', true);
      const pins = extractUsedGpioPins(tree);
      const uniquePinsMap = new Map<number, ExtractedGpioPin>();
      for (const p of pins) {
        if (!uniquePinsMap.has(p.pin)) uniquePinsMap.set(p.pin, p);
      }
      if (uniquePinsMap.size === 0) {
        uniquePinsMap.set(2, { nodeId: 'l', nodeName: 'LED', nodeType: 'switch', pin: 2, action: 'TOGGLE_PIN', mode: 'HTTP_GET', label: 'LED Onboard' });
        uniquePinsMap.set(4, { nodeId: 'r', nodeName: 'Relay', nodeType: 'button', pin: 4, action: 'TOGGLE_PIN', mode: 'HTTP_GET', label: 'Relé Principal' });
      }
      const pinList = Array.from(uniquePinsMap.values());
      const pinsDefinitions = pinList
        .map((p) => {
          const safeName = (p.label || `GPIO_${p.pin}`).toUpperCase().replace(/[^A-Z0-9_]/g, '_');
          return `#define PIN_${safeName} ${p.pin} // ${p.label || p.nodeName}`;
        })
        .join('\n');

      const pinsSetup = pinList
        .map((p) => {
          const safeName = (p.label || `GPIO_${p.pin}`).toUpperCase().replace(/[^A-Z0-9_]/g, '_');
          if (p.action === 'PWM') {
            return `  #if ESP_ARDUINO_VERSION_MAJOR >= 3
  ledcAttach(PIN_${safeName}, 5000, 8);
  #else
  ledcSetup(0, 5000, 8);
  ledcAttachPin(PIN_${safeName}, 0);
  #endif`;
          } else if (p.action === 'READ_PIN') {
            return `  pinMode(PIN_${safeName}, INPUT);`;
          } else {
            return `  pinMode(PIN_${safeName}, OUTPUT);\n  digitalWrite(PIN_${safeName}, LOW);`;
          }
        })
        .join('\n');

      return `// ====================================================================
// VisualForge Studio - ESP32 All-in-One Embedded Web Server Header
// Totalmente autónomo: SVGs inline, cero CDNs, cero fuentes .woff externas
// Compatible con ESPAsyncWebServer, Arduino IDE y PlatformIO
// ====================================================================

#pragma once
#include <Arduino.h>
#include <pgmspace.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>

// Definición de Pines GPIO Utilizados
${pinsDefinitions}

// HTML & SVG autónomo en memoria flash PROGMEM con fetch()
const char INDEX_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ESP32 Web Server</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, sans-serif; background: #09090b; color: #f4f4f5; padding: 20px; line-height: 1.5; }
    a { color: #38bdf8; text-decoration: none; }
    .vf-container { width: 100%; max-width: 1200px; margin: 0 auto; }
    .vf-grid { display: grid; gap: 16px; }
    .vf-card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; }
    .vf-icon-wrapper { display: inline-flex; align-items: center; justify-content: center; }
    .vf-button { background: #0d99ff; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .vf-switch { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; }
    .vf-range { width: 100%; accent-color: #0d99ff; cursor: pointer; }
    #vf-esp32-status { position: fixed; bottom: 20px; right: 20px; background: #18181b; color: #10b981; border: 1px solid #27272a; padding: 10px 18px; border-radius: 8px; font-family: monospace; font-size: 12px; opacity: 0; transition: opacity 0.3s; }
  </style>
</head>
<body>
${htmlBody}

  <div id="vf-esp32-status"></div>
  <script>
    function updateGPIO(pin, action, valOrEl) {
      var val = (typeof valOrEl !== 'object') ? valOrEl : undefined;
      var toast = document.getElementById('vf-esp32-status');
      if (toast) { toast.style.opacity = '1'; toast.textContent = 'GPIO ' + pin + ': ' + action + '...'; }
      var url = '/update?pin=' + pin + '&action=' + action + (val !== undefined ? '&val=' + val : '');
      fetch(url).then(r => r.text()).then(t => {
        if (toast) { toast.textContent = 'GPIO ' + pin + ' -> ' + t; setTimeout(() => { toast.style.opacity = '0'; }, 2000); }
      });
    }
  </script>
</body>
</html>
)rawliteral";

inline void setupVisualForgeServer(AsyncWebServer &server) {
  // Configuración de Pines
${pinsSetup}

  // Ruta principal
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send_P(200, "text/html", INDEX_HTML);
  });

  // Ruta API para control de Pines GPIO
  server.on("/update", HTTP_GET, [](AsyncWebServerRequest *request) {
    if (!request->hasParam("pin")) {
      request->send(400, "text/plain", "Falta pin");
      return;
    }
    int pin = request->getParam("pin")->value().toInt();
    String action = request->hasParam("action") ? request->getParam("action")->value() : "TOGGLE_PIN";
    int val = request->hasParam("val") ? request->getParam("val")->value().toInt() : 0;

    if (action == "TOGGLE_PIN") {
      int s = digitalRead(pin) == HIGH ? LOW : HIGH;
      digitalWrite(pin, s);
      request->send(200, "text/plain", s == HIGH ? "ON" : "OFF");
    } else if (action == "SET_HIGH") {
      digitalWrite(pin, HIGH);
      request->send(200, "text/plain", "HIGH");
    } else if (action == "SET_LOW") {
      digitalWrite(pin, LOW);
      request->send(200, "text/plain", "LOW");
    } else if (action == "PWM") {
      #if ESP_ARDUINO_VERSION_MAJOR >= 3
      ledcWrite(pin, val);
      #else
      ledcWrite(0, val);
      #endif
      request->send(200, "text/plain", String(val));
    } else {
      request->send(200, "text/plain", "OK");
    }
  });
}
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
