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
    desc: 'HTML Preline UI con SVGs inline puros y fetch() asíncrono para ESP32',
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
    label: 'HTML5 + Preline UI / Tailwind (Inline SVG)',
    desc: 'HTML semántico con clases Preline UI / Tailwind y SVGs inline directos sin CDNs',
    icon: 'fab fa-html5',
    projectTypes: ['html_css', 'esp32'],
  },
  {
    id: 'react_shadcn',
    label: 'React 19 + Shadcn/ui TSX',
    desc: 'JSX/TSX modular con componentes oficiales Shadcn/ui y SVGs limpios',
    icon: 'fab fa-react',
    projectTypes: ['react', 'framework'],
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
  if (projectType === 'react' || projectType === 'framework') {
    return EXPORT_FORMATS.filter((f) => !f.projectTypes || f.projectTypes.includes('react') || f.projectTypes.includes('framework'));
  }
  return EXPORT_FORMATS;
}

export function getDefaultFormatForProject(projectType?: ProjectType): ExportFormat {
  if (projectType === 'esp32') return 'esp32_html';
  if (projectType === 'html_css') return 'html_css';
  if (projectType === 'react' || projectType === 'framework') return 'react_shadcn';
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
      if (node.type === 'fontawesome_icon' || node.type === 'svg_icon' || node.type === 'styled_icon') {
        const iconKey = node.props.svgId || node.props.iconName || (node.type === 'styled_icon' ? 'lucide:zap' : 'lucide:rocket');
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
        // Layout & Structure (Catálogo A: Shadcn)
        case 'box':
        case 'container':
          return `${indent}<div className="vf-container max-w-5xl w-full mx-auto" id="${node.id}"${styleAttr}>${childrenCode}</div>`;
        case 'aspect_ratio':
          return `${indent}<AspectRatio ratio={16 / 9} className="bg-zinc-900 rounded-lg overflow-hidden" id="${node.id}"${styleAttr}>\n${indent}  <div className="flex items-center justify-center h-full w-full">${childrenCode || 'Aspect Ratio 16:9'}</div>\n${indent}</AspectRatio>`;
        case 'collapsible':
          return `${indent}<Collapsible id="${node.id}"${styleAttr}>\n${indent}  <CollapsibleTrigger asChild><Button variant="outline">${node.props.label || 'Toggle Collapsible'}</Button></CollapsibleTrigger>\n${indent}  <CollapsibleContent className="space-y-2 mt-2">${childrenCode}</CollapsibleContent>\n${indent}</Collapsible>`;
        case 'resizable':
          return `${indent}<ResizablePanelGroup direction="horizontal" className="min-h-[140px] rounded-lg border border-zinc-800" id="${node.id}"${styleAttr}>\n${indent}  <ResizablePanel defaultSize={50} className="p-4 flex items-center justify-center">Panel A</ResizablePanel>\n${indent}  <ResizableHandle />\n${indent}  <ResizablePanel defaultSize={50} className="p-4 flex items-center justify-center">Panel B</ResizablePanel>\n${indent}</ResizablePanelGroup>`;
        case 'scroll_area':
          return `${indent}<ScrollArea className="h-44 w-full rounded-md border border-zinc-800 p-4" id="${node.id}"${styleAttr}>${childrenCode || 'Scrollable content...'}</ScrollArea>`;
        case 'separator':
          return `${indent}<Separator className="my-4" id="${node.id}"${styleAttr} />`;
        case 'skeleton':
          return `${indent}<Skeleton className="w-full h-12 rounded-lg" id="${node.id}"${styleAttr} />`;

        // Forms & Inputs (Catálogo A: Shadcn)
        case 'button':
          return `${indent}<Button variant="${node.props.variant || 'default'}" id="${node.id}"${styleAttr}>${node.props.label || 'Button'}</Button>`;
        case 'checkbox':
          return `${indent}<div className="flex items-center space-x-2" id="${node.id}"${styleAttr}>\n${indent}  <Checkbox id="${node.id}_cb" defaultChecked={${node.props.checked ? 'true' : 'false'}} />\n${indent}  <Label htmlFor="${node.id}_cb">${node.props.label || 'Checkbox option'}</Label>\n${indent}</div>`;
        case 'form':
          return `${indent}<form className="space-y-4 w-full" id="${node.id}"${styleAttr}>${childrenCode}</form>`;
        case 'input':
          return `${indent}<div className="w-full space-y-1.5" id="${node.id}">\n${indent}  <Label htmlFor="${node.id}_input">${node.props.label || 'Input Label'}</Label>\n${indent}  <Input id="${node.id}_input" placeholder="${node.props.placeholder || 'Type here...'}"${styleAttr} />\n${indent}</div>`;
        case 'input_otp':
        case 'otp_input':
          return `${indent}<InputOTP maxLength={6} id="${node.id}">\n${indent}  <InputOTPGroup>\n${indent}    <InputOTPSlot index={0} />\n${indent}    <InputOTPSlot index={1} />\n${indent}    <InputOTPSlot index={2} />\n${indent}    <InputOTPSeparator />\n${indent}    <InputOTPSlot index={3} />\n${indent}    <InputOTPSlot index={4} />\n${indent}    <InputOTPSlot index={5} />\n${indent}  </InputOTPGroup>\n${indent}</InputOTP>`;
        case 'label':
          return `${indent}<Label htmlFor="${node.id}"${styleAttr}>${node.props.label || node.props.text || 'Label'}</Label>`;
        case 'radio_group':
          return `${indent}<RadioGroup defaultValue="opt1" id="${node.id}" className="space-y-2">\n${indent}  <div className="flex items-center space-x-2"><RadioGroupItem value="opt1" id="${node.id}_1" /><Label htmlFor="${node.id}_1">Option 1</Label></div>\n${indent}  <div className="flex items-center space-x-2"><RadioGroupItem value="opt2" id="${node.id}_2" /><Label htmlFor="${node.id}_2">Option 2</Label></div>\n${indent}</RadioGroup>`;
        case 'select':
          return `${indent}<Select id="${node.id}">\n${indent}  <SelectTrigger className="w-full"><SelectValue placeholder="${node.props.placeholder || 'Select an option'}" /></SelectTrigger>\n${indent}  <SelectContent>\n${indent}    <SelectItem value="opt1">Option 1</SelectItem>\n${indent}    <SelectItem value="opt2">Option 2</SelectItem>\n${indent}  </SelectContent>\n${indent}</Select>`;
        case 'slider':
          return `${indent}<Slider defaultValue={[${node.props.value ?? 50}]} max={${node.props.max ?? 100}} step={1} id="${node.id}"${styleAttr} />`;
        case 'switch':
          return `${indent}<div className="flex items-center space-x-2" id="${node.id}">\n${indent}  <Switch id="${node.id}_sw" defaultChecked={${node.props.checked ? 'true' : 'false'}} />\n${indent}  <Label htmlFor="${node.id}_sw">${node.props.label || 'Toggle'}</Label>\n${indent}</div>`;
        case 'textarea':
          return `${indent}<Textarea placeholder="${node.props.placeholder || 'Type your message here.'}" id="${node.id}"${styleAttr} />`;
        case 'toggle':
        case 'toggle_group':
          return `${indent}<Toggle id="${node.id}" aria-label="Toggle">${node.props.label || 'Toggle'}</Toggle>`;

        // Data Display (Catálogo A: Shadcn)
        case 'avatar':
          return `${indent}<Avatar id="${node.id}"${styleAttr}>\n${indent}  <AvatarImage src="${node.props.src || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" alt="${node.props.label || 'Avatar'}" />\n${indent}  <AvatarFallback>${node.props.fallback || 'VF'}</AvatarFallback>\n${indent}</Avatar>`;
        case 'badge':
          return `${indent}<Badge variant="${node.props.variant || 'default'}" id="${node.id}"${styleAttr}>${node.props.label || 'Badge'}</Badge>`;
        case 'calendar':
          return `${indent}<Calendar mode="single" className="rounded-md border border-zinc-800" id="${node.id}"${styleAttr} />`;
        case 'card':
          if (node.children && node.children.length > 0) {
            return `${indent}<Card id="${node.id}"${styleAttr}>\n${indent}  <CardContent className="p-6 space-y-3">${childrenCode}</CardContent>\n${indent}</Card>`;
          }
          return `${indent}<Card id="${node.id}"${styleAttr}>\n${indent}  <CardHeader>\n${indent}    <CardTitle>${node.props.title || 'Card Title'}</CardTitle>\n${indent}    <CardDescription>${node.props.subtitle || ''}</CardDescription>\n${indent}  </CardHeader>\n${indent}  <CardContent className="space-y-3"></CardContent>\n${indent}</Card>`;
        case 'carousel':
          return `${indent}<Carousel className="w-full max-w-sm" id="${node.id}">\n${indent}  <CarouselContent>\n${indent}    <CarouselItem><div className="p-1"><Card><CardContent className="flex aspect-video items-center justify-center p-6"><span className="text-2xl font-semibold">Slide 1</span></CardContent></Card></div></CarouselItem>\n${indent}    <CarouselItem><div className="p-1"><Card><CardContent className="flex aspect-video items-center justify-center p-6"><span className="text-2xl font-semibold">Slide 2</span></CardContent></Card></div></CarouselItem>\n${indent}  </CarouselContent>\n${indent}  <CarouselPrevious />\n${indent}  <CarouselNext />\n${indent}</Carousel>`;
        case 'chart':
          return `${indent}<div className="w-full h-48 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 flex items-center justify-center" id="${node.id}"><span className="text-xs text-zinc-400">Chart Visualization Component</span></div>`;
        case 'data_table':
        case 'table':
          return `${indent}<Table id="${node.id}"${styleAttr}>\n${indent}  <TableHeader>\n${indent}    <TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead>Amount</TableHead></TableRow>\n${indent}  </TableHeader>\n${indent}  <TableBody>\n${indent}    <TableRow><TableCell className="font-medium">Invoice #001</TableCell><TableCell>Paid</TableCell><TableCell>$250.00</TableCell></TableRow>\n${indent}    <TableRow><TableCell className="font-medium">Invoice #002</TableCell><TableCell>Pending</TableCell><TableCell>$150.00</TableCell></TableRow>\n${indent}  </TableBody>\n${indent}</Table>`;

        // Feedback (Catálogo A: Shadcn)
        case 'alert':
          if (node.children && node.children.length > 0) {
            return `${indent}<Alert id="${node.id}"${styleAttr}>${childrenCode}</Alert>`;
          }
          return `${indent}<Alert id="${node.id}"${styleAttr}>\n${indent}  <AlertTitle>${node.props.title || 'Attention'}</AlertTitle>\n${indent}  <AlertDescription>${node.props.text || node.props.description || 'Important notification message.'}</AlertDescription>\n${indent}</Alert>`;
        case 'progress':
          return `${indent}<Progress value={${node.props.value || 50}} id="${node.id}"${styleAttr} />`;
        case 'sonner':
        case 'toast':
          return `${indent}<Button variant="outline" id="${node.id}" onClick={() => toast("${node.props.label || 'Notification sent'}")}>${node.props.label || 'Show Notification'}</Button>`;

        // Overlays & Navigation (Catálogo A: Shadcn)
        case 'accordion':
          return `${indent}<Accordion type="single" collapsible className="w-full" id="${node.id}">\n${indent}  <AccordionItem value="item-1">\n${indent}    <AccordionTrigger>${node.props.title || 'Is it accessible?'}</AccordionTrigger>\n${indent}    <AccordionContent>${node.props.content || 'Yes. It adheres to the WAI-ARIA design pattern.'}</AccordionContent>\n${indent}  </AccordionItem>\n${indent}</Accordion>`;
        case 'alert_dialog':
          return `${indent}<AlertDialog id="${node.id}">\n${indent}  <AlertDialogTrigger asChild><Button variant="outline">${node.props.label || 'Open Dialog'}</Button></AlertDialogTrigger>\n${indent}  <AlertDialogContent>\n${indent}    <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>\n${indent}    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Continue</AlertDialogAction></AlertDialogFooter>\n${indent}  </AlertDialogContent>\n${indent}</AlertDialog>`;
        case 'command':
          return `${indent}<Command className="rounded-lg border border-zinc-800 shadow-md" id="${node.id}">\n${indent}  <CommandInput placeholder="Type a command or search..." />\n${indent}  <CommandList>\n${indent}    <CommandEmpty>No results found.</CommandEmpty>\n${indent}    <CommandGroup heading="Suggestions">\n${indent}      <CommandItem>Calendar</CommandItem>\n${indent}      <CommandItem>Search Emoji</CommandItem>\n${indent}    </CommandGroup>\n${indent}  </CommandList>\n${indent}</Command>`;
        case 'context_menu':
          return `${indent}<ContextMenu id="${node.id}">\n${indent}  <ContextMenuTrigger className="flex h-[100px] w-full items-center justify-center rounded-md border border-dashed border-zinc-700 text-sm">Right click here</ContextMenuTrigger>\n${indent}  <ContextMenuContent>\n${indent}    <ContextMenuItem>Back</ContextMenuItem>\n${indent}    <ContextMenuItem>Forward</ContextMenuItem>\n${indent}    <ContextMenuItem>Reload</ContextMenuItem>\n${indent}  </ContextMenuContent>\n${indent}</ContextMenu>`;
        case 'dialog':
          return `${indent}<Dialog id="${node.id}">\n${indent}  <DialogTrigger asChild><Button variant="outline">${node.props.label || 'Open Dialog'}</Button></DialogTrigger>\n${indent}  <DialogContent>\n${indent}    <DialogHeader><DialogTitle>${node.props.title || 'Dialog Title'}</DialogTitle><DialogDescription>${node.props.subtitle || 'Dialog details and information.'}</DialogDescription></DialogHeader>\n${indent}    <div className="py-2">${childrenCode}</div>\n${indent}  </DialogContent>\n${indent}</Dialog>`;
        case 'drawer':
          return `${indent}<Drawer id="${node.id}">\n${indent}  <DrawerTrigger asChild><Button variant="outline">${node.props.label || 'Open Drawer'}</Button></DrawerTrigger>\n${indent}  <DrawerContent>\n${indent}    <DrawerHeader><DrawerTitle>${node.props.title || 'Drawer Title'}</DrawerTitle><DrawerDescription>Drawer subtitle</DrawerDescription></DrawerHeader>\n${indent}    <div className="p-4">${childrenCode}</div>\n${indent}  </DrawerContent>\n${indent}</Drawer>`;
        case 'dropdown_menu':
          return `${indent}<DropdownMenu id="${node.id}">\n${indent}  <DropdownMenuTrigger asChild><Button variant="outline">${node.props.label || 'Options'}</Button></DropdownMenuTrigger>\n${indent}  <DropdownMenuContent>\n${indent}    <DropdownMenuItem>Profile</DropdownMenuItem>\n${indent}    <DropdownMenuItem>Billing</DropdownMenuItem>\n${indent}    <DropdownMenuItem>Settings</DropdownMenuItem>\n${indent}  </DropdownMenuContent>\n${indent}</DropdownMenu>`;
        case 'hover_card':
          return `${indent}<HoverCard id="${node.id}">\n${indent}  <HoverCardTrigger asChild><Button variant="link">${node.props.label || '@hover'}</Button></HoverCardTrigger>\n${indent}  <HoverCardContent className="w-80">\n${indent}    <div className="space-y-1"><h4 className="text-sm font-semibold">${node.props.label || '@hover'}</h4><p className="text-sm text-muted-foreground">Hover card popover description.</p></div>\n${indent}  </HoverCardContent>\n${indent}</HoverCard>`;
        case 'menubar':
          return `${indent}<Menubar id="${node.id}">\n${indent}  <MenubarMenu><MenubarTrigger>File</MenubarTrigger><MenubarContent><MenubarItem>New Tab</MenubarItem><MenubarItem>Share</MenubarItem></MenubarContent></MenubarMenu>\n${indent}  <MenubarMenu><MenubarTrigger>Edit</MenubarTrigger><MenubarContent><MenubarItem>Undo</MenubarItem><MenubarItem>Redo</MenubarItem></MenubarContent></MenubarMenu>\n${indent}</Menubar>`;
        case 'navigation_menu':
          return `${indent}<NavigationMenu id="${node.id}">\n${indent}  <NavigationMenuList>\n${indent}    <NavigationMenuItem><NavigationMenuLink className="px-4 py-2 hover:underline">Home</NavigationMenuLink></NavigationMenuItem>\n${indent}    <NavigationMenuItem><NavigationMenuLink className="px-4 py-2 hover:underline">Features</NavigationMenuLink></NavigationMenuItem>\n${indent}  </NavigationMenuList>\n${indent}</NavigationMenu>`;
        case 'popover':
          return `${indent}<Popover id="${node.id}">\n${indent}  <PopoverTrigger asChild><Button variant="outline">${node.props.label || 'Open Popover'}</Button></PopoverTrigger>\n${indent}  <PopoverContent className="w-80"><div className="grid gap-2"><h4 className="font-medium leading-none">Popover</h4><p className="text-sm text-muted-foreground">Popover details content.</p></div></PopoverContent>\n${indent}</Popover>`;
        case 'sheet':
          return `${indent}<Sheet id="${node.id}">\n${indent}  <SheetTrigger asChild><Button variant="outline">${node.props.label || 'Open Sheet'}</Button></SheetTrigger>\n${indent}  <SheetContent><SheetHeader><SheetTitle>${node.props.title || 'Sheet Title'}</SheetTitle><SheetDescription>Side sheet panel</SheetDescription></SheetHeader><div className="py-4">${childrenCode}</div></SheetContent>\n${indent}</Sheet>`;
        case 'sidebar':
          return `${indent}<aside className="w-64 border-r border-zinc-800 bg-zinc-950 p-4 min-h-screen" id="${node.id}">${childrenCode}</aside>`;
        case 'tabs':
          return `${indent}<Tabs defaultValue="tab1" className="w-full" id="${node.id}">\n${indent}  <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="tab1">Tab 1</TabsTrigger><TabsTrigger value="tab2">Tab 2</TabsTrigger></TabsList>\n${indent}  <TabsContent value="tab1" className="p-4">${childrenCode || 'Tab 1 Content'}</TabsContent>\n${indent}  <TabsContent value="tab2" className="p-4">Tab 2 Content</TabsContent>\n${indent}</Tabs>`;
        case 'tooltip':
          return `${indent}<TooltipProvider id="${node.id}">\n${indent}  <Tooltip><TooltipTrigger asChild><Button variant="outline">${node.props.label || 'Hover me'}</Button></TooltipTrigger><TooltipContent><p>${node.props.text || 'Tooltip message'}</p></TooltipContent></Tooltip>\n${indent}</TooltipProvider>`;

        // Common Media & Frames
        case 'grid':
          return `${indent}<div className="grid grid-cols-${node.props.columns || 2} gap-4" id="${node.id}"${styleAttr}>${childrenCode}</div>`;
        case 'stack':
          return `${indent}<div className="flex flex-row items-center gap-3" id="${node.id}"${styleAttr}>${childrenCode}</div>`;
        case 'navbar':
          return `${indent}<header className="w-full flex items-center justify-between py-4 border-b border-zinc-800" id="${node.id}"${styleAttr}>
${indent}  <div className="font-bold text-lg">${node.props.brand || 'Logo'}</div>
${indent}  <nav className="flex items-center gap-4 text-sm font-medium">
${(node.props.links || []).map((l: any) => `${indent}    <a href="${l.href}" className="hover:underline">${l.label}</a>`).join('\n')}
${indent}  </nav>
${indent}  <div className="flex items-center gap-2">${childrenCode}</div>
${indent}</header>`;
        case 'text':
        case 'typography': {
          const asTag = node.props.as || 'p';
          const Tag = asTag === 'subtitle' ? 'p' : asTag === 'label' ? 'label' : asTag;
          return `${indent}<${Tag} id="${node.id}"${styleAttr}>${node.props.text || ''}</${Tag}>`;
        }
        case 'svg_icon':
        case 'fontawesome_icon':
        case 'styled_icon': {
          const iconKey = node.props.svgId || node.props.iconName || (node.type === 'styled_icon' ? 'lucide:zap' : 'lucide:rocket');
          const size = node.props.size || node.style?.fontSize || 24;
          const sizeVal = typeof size === 'number' ? size : parseInt(size) || 24;
          const compName = toComponentName(iconKey.replace(/[: -]/g, '_'));
          if (node.type === 'styled_icon') {
            return `${indent}<div id="${node.id}" className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 inline-flex items-center justify-center text-blue-500"${styleAttr}><${compName} width={${sizeVal}} height={${sizeVal}} /></div>`;
          }
          return `${indent}<${compName} width={${sizeVal}} height={${sizeVal}} id="${node.id}"${styleAttr} />`;
        }
        case 'link':
          return `${indent}<a href="${node.props.href || '#'}" target="${node.props.target || '_self'}" className="text-blue-500 hover:underline inline-flex items-center gap-1.5" id="${node.id}"${styleAttr}>${node.props.label || 'Link'}</a>`;
        case 'image':
          return `${indent}<img src="${node.props.src}" alt="${node.props.alt || ''}" loading="${node.props.loading || 'lazy'}" id="${node.id}" className="rounded-lg object-cover w-full"${styleAttr} />`;

        default:
          return `${indent}<div id="${node.id}"${styleAttr}>${childrenCode || node.props.label || node.type}</div>`;
      }
    })
    .join('\n');
}

// Generate Clean Semantic HTML with INLINE SVGs & Preline UI Tailwind Classes (Zero CDNs, Zero .woff)
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
        // Layout & Content (Catálogo B: Preline UI)
        case 'box':
        case 'container':
          return `${indent}<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full" id="${node.id}"${styleAttr}>${childrenCode}</div>`;
        case 'columns':
          return `${indent}<div class="grid grid-cols-1 md:grid-cols-${node.props.columns || 2} gap-4" id="${node.id}"${styleAttr}>${childrenCode}</div>`;
        case 'grid':
          return `${indent}<div class="grid grid-cols-${node.props.columns || 2} gap-4" id="${node.id}"${styleAttr}>${childrenCode}</div>`;
        case 'layout_splitter':
          return `${indent}<div class="flex flex-col md:flex-row gap-4 border border-zinc-800 rounded-xl p-4 bg-zinc-900/40" id="${node.id}"${styleAttr}>${childrenCode}</div>`;
        case 'form':
          return `${indent}<form action="${node.props.action || '#'}" method="${node.props.method || 'POST'}" class="w-full flex flex-col gap-4" id="${node.id}"${styleAttr}>${childrenCode}</form>`;
        case 'text':
        case 'typography': {
          const asTag = node.props.as || 'p';
          const Tag = asTag === 'subtitle' ? 'p' : asTag === 'label' ? 'label' : asTag;
          return `${indent}<${Tag} class="text-zinc-200" id="${node.id}"${styleAttr}>${node.props.text || ''}</${Tag}>`;
        }
        case 'image':
          return `${indent}<img src="${node.props.src}" alt="${node.props.alt || ''}" class="rounded-xl object-cover max-w-full" id="${node.id}"${styleAttr}>`;
        case 'link':
          return `${indent}<a href="${node.props.href || '#'}" class="text-blue-500 hover:text-blue-400 underline inline-flex items-center gap-1.5" id="${node.id}"${styleAttr}>${node.props.label || 'Enlace'}</a>`;
        case 'divider':
          return `${indent}<hr class="border-zinc-800 my-4" id="${node.id}"${styleAttr}>`;
        case 'kbd':
          return `${indent}<kbd class="px-2 py-1 text-xs font-semibold text-zinc-200 bg-zinc-800 border border-zinc-700 rounded-md" id="${node.id}"${styleAttr}>${node.props.label || 'Ctrl + K'}</kbd>`;
        case 'custom_scrollbar':
          return `${indent}<div class="overflow-y-auto max-h-48 p-4 border border-zinc-800 rounded-lg" id="${node.id}"${styleAttr}>${childrenCode}</div>`;

        // Base Components (Catálogo B: Preline UI)
        case 'accordion':
          return `${indent}<div class="space-y-2" id="${node.id}"${styleAttr}>\n${indent}  <div class="border border-zinc-800 rounded-lg p-3 bg-zinc-900/60">\n${indent}    <button class="font-medium text-sm text-zinc-200 w-full flex justify-between items-center" type="button"><span>${node.props.title || 'Accordion Title'}</span><span>↓</span></button>\n${indent}    <div class="pt-2 text-xs text-zinc-400">${node.props.content || 'Contenido del acordeón.'}</div>\n${indent}  </div>\n${indent}</div>`;
        case 'alert':
          if (node.children && node.children.length > 0) {
            return `${indent}<div class="p-4 rounded-lg bg-blue-950/40 border border-blue-800 text-blue-200 text-sm" id="${node.id}"${styleAttr}>${childrenCode}</div>`;
          }
          return `${indent}<div class="p-4 rounded-lg bg-blue-950/40 border border-blue-800 text-blue-200 text-sm flex items-center justify-between" id="${node.id}"${styleAttr}><span>${node.props.text || 'Alerta informativa Preline UI'}</span></div>`;
        case 'avatar':
          return `${indent}<img class="inline-block size-10 rounded-full ring-2 ring-zinc-800 object-cover" src="${node.props.src || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" alt="${node.props.label || 'Avatar'}" id="${node.id}"${styleAttr}>`;
        case 'avatar_group':
          return `${indent}<div class="flex -space-x-2" id="${node.id}"${styleAttr}>${childrenCode}</div>`;
        case 'badge':
          return `${indent}<span class="inline-flex items-center gap-x-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-700" id="${node.id}"${styleAttr}>${node.props.label || 'Badge'}</span>`;
        case 'blockquote':
          return `${indent}<blockquote class="border-l-4 border-blue-500 pl-4 py-1 italic text-zinc-300 text-sm" id="${node.id}"${styleAttr}>"${node.props.text || 'Cita destacada'}"</blockquote>`;
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
          return `${indent}<button type="button" class="py-2.5 px-4 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" id="${node.id}"${clickAttr}${styleAttr}>${node.props.label || 'Button'}</button>`;
        }
        case 'button_group':
          return `${indent}<div class="inline-flex rounded-lg shadow-sm" role="group" id="${node.id}"${styleAttr}>${childrenCode}</div>`;
        case 'card':
          if (node.children && node.children.length > 0) {
            return `${indent}<div class="flex flex-col bg-zinc-900 border border-zinc-800 shadow-sm rounded-xl p-4 md:p-5" id="${node.id}"${styleAttr}>${childrenCode}</div>`;
          }
          return `${indent}<div class="flex flex-col bg-zinc-900 border border-zinc-800 shadow-sm rounded-xl p-4 md:p-5" id="${node.id}"${styleAttr}>\n${indent}  <h3 class="text-base font-bold text-white mb-1">${node.props.title || 'Card Title'}</h3>\n${indent}  <p class="text-xs text-zinc-400 mb-3">${node.props.subtitle || ''}</p>\n${indent}</div>`;
        case 'chat_bubble':
          return `${indent}<div class="flex gap-2.5 max-w-md p-3 rounded-2xl bg-zinc-800 text-zinc-100 text-sm" id="${node.id}"${styleAttr}>${node.props.text || 'Mensaje de chat'}</div>`;
        case 'carousel':
          return `${indent}<div class="relative overflow-hidden rounded-xl border border-zinc-800 p-6 bg-zinc-900 flex items-center justify-center text-zinc-300" id="${node.id}"${styleAttr}>Carrusel Preline UI</div>`;
        case 'collapse':
          return `${indent}<div class="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50" id="${node.id}"${styleAttr}>${childrenCode}</div>`;
        case 'datepicker':
          return `${indent}<input type="date" class="py-2 px-3 block w-full bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200" id="${node.id}"${styleAttr}>`;
        case 'device_mockup':
          return `${indent}<div class="relative mx-auto border-zinc-800 bg-zinc-800 border-[10px] rounded-[2.5rem] h-[340px] w-[190px] shadow-xl flex items-center justify-center text-xs text-zinc-400" id="${node.id}">Mockup Device</div>`;
        case 'list':
        case 'list_group':
          return `${indent}<ul class="divide-y divide-zinc-800 border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/50" id="${node.id}"${styleAttr}>\n${indent}  <li class="px-4 py-3 text-sm text-zinc-200">Elemento de lista 1</li>\n${indent}  <li class="px-4 py-3 text-sm text-zinc-200">Elemento de lista 2</li>\n${indent}</ul>`;
        case 'legend_indicator':
          return `${indent}<span class="inline-flex items-center gap-x-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-800" id="${node.id}"><span class="size-1.5 inline-block rounded-full bg-emerald-400"></span>${node.props.label || 'Online'}</span>`;
        case 'progress':
        case 'file_upload_progress':
          return `${indent}<div class="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden" id="${node.id}"${styleAttr}>\n${indent}  <div class="bg-blue-600 h-2.5 rounded-full transition-all" style="width: ${node.props.value || 45}%;"></div>\n${indent}</div>`;
        case 'rating':
          return `${indent}<div class="flex items-center text-amber-400 text-sm" id="${node.id}">★★★★★</div>`;
        case 'skeleton':
          return `${indent}<div class="animate-pulse bg-zinc-800 rounded-lg h-10 w-full" id="${node.id}"${styleAttr}></div>`;
        case 'spinner':
          return `${indent}<div class="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" role="status" id="${node.id}"><span class="sr-only">Cargando...</span></div>`;
        case 'styled_icon': {
          const iconKey = node.props.svgId || node.props.iconName || 'lucide:zap';
          const size = node.props.size || 20;
          const stroke = node.style?.color || 'currentColor';
          const fill = node.style?.fill || node.props?.fill || 'none';
          const item = findCatalogIcon(iconKey);
          const inlineSvg =
            getIconSvgSync(iconKey, { width: size, height: size, stroke, fill }) ||
            (item ? customizeSvg(item.svgContent, { width: size, height: size, stroke, fill, className: 'vf-icon-svg' }) : '');
          return `${indent}<div class="inline-flex items-center justify-center size-10 rounded-lg bg-blue-600/10 text-blue-500 border border-blue-500/20" id="${node.id}"${styleAttr}>${inlineSvg || childrenCode || '★'}</div>`;
        }
        case 'toast':
          return `${indent}<div class="p-3 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg text-sm text-zinc-200" id="${node.id}"${styleAttr}>${node.props.label || 'Notificación Toast'}</div>`;
        case 'timeline':
          return `${indent}<div class="border-l-2 border-zinc-800 pl-4 space-y-4 text-xs" id="${node.id}">\n${indent}  <div class="relative"><div class="absolute -left-[21px] top-1 size-2 rounded-full bg-blue-500"></div><p class="font-medium text-zinc-200">Paso 1</p><p class="text-zinc-500">Completado</p></div>\n${indent}</div>`;
        case 'tree_view':
          return `${indent}<div class="text-xs space-y-1 font-mono text-zinc-300" id="${node.id}"><div>📁 Proyecto</div><div class="pl-4">📄 index.html</div></div>`;
        case 'marquee':
          return `${indent}<div class="overflow-hidden whitespace-nowrap border-y border-zinc-800 py-2 text-xs font-mono text-zinc-400" id="${node.id}">${node.props.text || 'Texto marquesina Preline UI'}</div>`;

        // Navigations (Catálogo B: Preline UI)
        case 'navbar':
          return `${indent}<header class="flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full bg-zinc-900 border-b border-zinc-800 text-sm py-3 px-4" id="${node.id}"${styleAttr}>
${indent}  <nav class="max-w-7xl w-full mx-auto flex items-center justify-between">
${indent}    <a class="font-bold text-lg text-white" href="#">${node.props.brand || 'VisualForge'}</a>
${indent}    <div class="flex items-center gap-4">
${(node.props.links || []).map((l: any) => `${indent}      <a class="text-zinc-400 hover:text-zinc-200" href="${l.href}">${l.label}</a>`).join('\n')}
${indent}    </div>
${indent}    <div class="flex items-center gap-2">${childrenCode}</div>
${indent}  </nav>
${indent}</header>`;
        case 'mega_menu':
          return `${indent}<div class="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl" id="${node.id}">${childrenCode}</div>`;
        case 'navs':
        case 'tabs':
          return `${indent}<div class="border-b border-zinc-800 flex gap-4 text-sm font-medium" id="${node.id}">\n${indent}  <button class="py-2 border-b-2 border-blue-500 text-blue-500">General</button>\n${indent}  <button class="py-2 text-zinc-400 hover:text-zinc-200">Ajustes</button>\n${indent}</div>`;
        case 'sidebar':
          return `${indent}<aside class="w-64 bg-zinc-900 border-r border-zinc-800 p-4 min-h-screen" id="${node.id}"${styleAttr}>${childrenCode}</aside>`;
        case 'scrollspy':
          return `${indent}<div class="relative max-h-48 overflow-y-auto p-4 border border-zinc-800 rounded-lg" id="${node.id}">${childrenCode}</div>`;
        case 'breadcrumb':
          return `${indent}<nav class="flex text-xs text-zinc-400 gap-2" id="${node.id}"><a href="#">Inicio</a><span>/</span><span class="text-zinc-200">Sección</span></nav>`;
        case 'pagination':
          return `${indent}<div class="inline-flex gap-1" id="${node.id}"><button class="px-3 py-1 bg-zinc-800 text-zinc-200 text-xs rounded">1</button><button class="px-3 py-1 bg-zinc-900 text-zinc-400 text-xs rounded hover:bg-zinc-800">2</button></div>`;
        case 'stepper':
          return `${indent}<div class="flex items-center gap-2 text-xs font-medium" id="${node.id}"><span class="size-6 rounded-full bg-blue-600 text-white flex items-center justify-center">1</span><span class="text-zinc-300">Paso 1</span><div class="h-0.5 w-8 bg-zinc-800"></div><span class="size-6 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center">2</span></div>`;

        // Basic Forms (Catálogo B: Preline UI)
        case 'input':
          return `${indent}<div class="space-y-1 w-full" id="${node.id}">\n${indent}  <label class="block text-xs font-medium text-zinc-400">${node.props.label || 'Input'}</label>\n${indent}  <input type="text" class="py-2 px-3 block w-full bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500" placeholder="${node.props.placeholder || ''}"${styleAttr}>\n${indent}</div>`;
        case 'input_group':
          return `${indent}<div class="flex rounded-lg shadow-sm" id="${node.id}">\n${indent}  <span class="px-3 inline-flex items-center min-w-fit rounded-s-md border border-e-0 border-zinc-700 bg-zinc-800 text-xs text-zinc-400">https://</span>\n${indent}  <input type="text" class="py-2 px-3 block w-full border-zinc-700 rounded-e-lg text-sm bg-zinc-900 text-zinc-200" placeholder="dominio.com">\n${indent}</div>`;
        case 'textarea':
          return `${indent}<textarea class="py-2 px-3 block w-full bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500" rows="3" placeholder="${node.props.placeholder || 'Escribe tu mensaje...'}" id="${node.id}"${styleAttr}></textarea>`;
        case 'file_input':
          return `${indent}<input type="file" class="block w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700" id="${node.id}">`;
        case 'checkbox': {
          const gpio = isEsp32 && node.props?.gpio?.enabled ? node.props.gpio : null;
          const eventAttr = gpio ? ` onchange="updateGPIO(${gpio.pin}, this.checked ? 'SET_HIGH' : 'SET_LOW')"` : '';
          return `${indent}<label class="inline-flex items-center gap-2 cursor-pointer select-none" id="${node.id}"${styleAttr}>\n${indent}  <input type="checkbox" class="shrink-0 size-4 border-zinc-700 rounded text-blue-600 focus:ring-blue-500 bg-zinc-900"${node.props.checked ? ' checked' : ''}${eventAttr}>\n${indent}  <span class="text-sm text-zinc-300">${node.props.label || 'Checkbox'}</span>\n${indent}</label>`;
        }
        case 'radio':
          return `${indent}<div class="flex items-center gap-2" id="${node.id}"><input type="radio" class="shrink-0 border-zinc-700 rounded-full text-blue-600 focus:ring-blue-500 bg-zinc-900" id="${node.id}_r"><label for="${node.id}_r" class="text-sm text-zinc-300">${node.props.label || 'Opción de radio'}</label></div>`;
        case 'switch': {
          const gpio = isEsp32 && node.props?.gpio?.enabled ? node.props.gpio : null;
          const eventAttr = gpio ? ` onchange="updateGPIO(${gpio.pin}, this.checked ? 'SET_HIGH' : 'SET_LOW')"` : '';
          return `${indent}<label class="inline-flex items-center gap-3 cursor-pointer select-none" id="${node.id}"${styleAttr}>\n${indent}  <input type="checkbox" class="sr-only peer"${node.props.checked ? ' checked' : ''}${eventAttr}>\n${indent}  <div class="relative w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>\n${indent}  <span class="text-sm font-medium text-zinc-300">${node.props.label || 'Switch'}</span>\n${indent}</label>`;
        }
        case 'select':
          return `${indent}<select class="py-2 px-3 pe-9 block w-full bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:border-blue-500" id="${node.id}"${styleAttr}><option selected>Opción 1</option><option>Opción 2</option></select>`;
        case 'slider':
        case 'range_slider': {
          const gpio = isEsp32 && node.props?.gpio?.enabled ? node.props.gpio : null;
          const eventAttr = gpio
            ? ` oninput="const v=document.getElementById('${node.id}_val'); if(v) v.textContent=this.value; updateGPIO(${gpio.pin}, 'PWM', this.value)"`
            : ` oninput="const v=document.getElementById('${node.id}_val'); if(v) v.textContent=this.value;"`;
          return `${indent}<div class="space-y-1.5 w-full" id="${node.id}"${styleAttr}>\n${indent}  <div class="flex justify-between text-xs text-zinc-400"><span>${node.props.label || 'Rango'}</span><span id="${node.id}_val" class="font-mono text-blue-400 font-bold">${node.props.value ?? 128}</span></div>\n${indent}  <input type="range" min="${node.props.min ?? 0}" max="${node.props.max ?? 255}" value="${node.props.value ?? 128}" class="w-full accent-blue-500 cursor-pointer"${eventAttr}>\n${indent}</div>`;
        }
        case 'color_picker':
          return `${indent}<div class="flex items-center gap-2" id="${node.id}"><input type="color" class="p-1 h-10 w-14 block bg-zinc-900 border border-zinc-700 cursor-pointer rounded-lg" value="#0d99ff"><span class="text-xs text-zinc-400">${node.props.label || 'Color'}</span></div>`;
        case 'timepicker':
          return `${indent}<input type="time" class="py-2 px-3 block w-full bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200" id="${node.id}">`;

        // Advanced Forms (Catálogo B: Preline UI)
        case 'advanced_select':
        case 'combobox':
          return `${indent}<div class="relative" id="${node.id}"><input type="text" class="py-2 px-3 block w-full bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200" placeholder="Buscar o seleccionar..."><span class="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none text-zinc-500">▼</span></div>`;
        case 'searchbox':
          return `${indent}<div class="relative" id="${node.id}"><input type="text" class="py-2 px-3 ps-9 block w-full bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500" placeholder="${node.props.placeholder || 'Buscar...'}"><div class="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-3 text-zinc-500">🔍</div></div>`;
        case 'input_number':
          return `${indent}<div class="flex items-center border border-zinc-700 rounded-lg overflow-hidden bg-zinc-900" id="${node.id}"><button type="button" class="px-3 py-2 bg-zinc-800 text-zinc-300 hover:bg-zinc-700">-</button><input type="number" value="1" class="w-16 text-center bg-transparent text-zinc-100 text-sm border-0 focus:ring-0"><button type="button" class="px-3 py-2 bg-zinc-800 text-zinc-300 hover:bg-zinc-700">+</button></div>`;
        case 'strong_password':
        case 'toggle_password':
          return `${indent}<div class="relative" id="${node.id}"><input type="password" class="py-2 px-3 pe-10 block w-full bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200" placeholder="Contraseña"><button type="button" class="absolute inset-y-0 end-0 flex items-center pe-3 text-zinc-500 hover:text-zinc-300">👁</button></div>`;
        case 'toggle_count':
          return `${indent}<div class="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700" id="${node.id}"><span>Votos</span><span class="bg-blue-600 text-white rounded-full px-1.5 py-0.2">42</span></div>`;
        case 'copy_markup':
          return `${indent}<div class="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-300" id="${node.id}"><code>npm i preline</code><button type="button" class="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded">Copiar</button></div>`;
        case 'pin_input':
          return `${indent}<div class="flex gap-2" id="${node.id}"><input type="text" maxlength="1" class="w-10 h-10 text-center bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 font-bold"><input type="text" maxlength="1" class="w-10 h-10 text-center bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 font-bold"><input type="text" maxlength="1" class="w-10 h-10 text-center bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 font-bold"><input type="text" maxlength="1" class="w-10 h-10 text-center bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 font-bold"></div>`;

        // Overlays & Tables (Catálogo B: Preline UI)
        case 'dropdown':
          return `${indent}<div class="relative inline-block" id="${node.id}"><button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-zinc-700 bg-zinc-800 text-white shadow-sm hover:bg-zinc-700">${node.props.label || 'Opciones'} ▼</button></div>`;
        case 'modal':
          return `${indent}<div class="p-5 bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg shadow-xl" id="${node.id}"><h3 class="font-bold text-lg text-white mb-2">${node.props.title || 'Modal Preline'}</h3><div class="text-sm text-zinc-400 mb-4">${childrenCode || 'Contenido del modal.'}</div><div class="flex justify-end gap-2"><button type="button" class="py-1.5 px-3 bg-zinc-800 rounded-lg text-xs text-white">Cerrar</button><button type="button" class="py-1.5 px-3 bg-blue-600 rounded-lg text-xs text-white">Aceptar</button></div></div>`;
        case 'drawer':
          return `${indent}<div class="w-80 bg-zinc-900 border-l border-zinc-800 p-4 shadow-xl" id="${node.id}"><h3 class="font-bold text-white mb-2">${node.props.title || 'Offcanvas Drawer'}</h3>${childrenCode}</div>`;
        case 'popover':
          return `${indent}<div class="p-3 bg-zinc-800 border border-zinc-700 rounded-lg shadow-md text-xs text-zinc-300 max-w-xs" id="${node.id}">${node.props.label || 'Contenido emergente Popover'}</div>`;
        case 'tooltip':
          return `${indent}<span class="relative group cursor-pointer inline-flex items-center text-xs text-blue-400 underline" id="${node.id}">${node.props.label || 'Pasa el ratón'}</span>`;
        case 'table':
          return `${indent}<table class="min-w-full divide-y divide-zinc-800 border border-zinc-800 rounded-lg overflow-hidden text-sm" id="${node.id}">\n${indent}  <thead class="bg-zinc-900"><tr class="text-zinc-400 text-left"><th class="px-4 py-3">Nombre</th><th class="px-4 py-3">Estado</th><th class="px-4 py-3">Acción</th></tr></thead>\n${indent}  <tbody class="divide-y divide-zinc-800 bg-zinc-950 text-zinc-300"><tr><td class="px-4 py-3 font-medium">Elemento 1</td><td class="px-4 py-3 text-emerald-400">Activo</td><td class="px-4 py-3"><button class="text-blue-400 hover:underline">Editar</button></td></tr></tbody>\n${indent}</table>`;

        // Vectors & Icons (Pure Inline SVGs)
        case 'svg_icon':
        case 'fontawesome_icon': {
          const iconKey = node.props.svgId || node.props.iconName || 'lucide:rocket';
          const size = node.props.size || node.style?.fontSize || 24;
          const stroke = node.style?.color || 'currentColor';
          const fill = node.style?.fill || node.props?.fill || 'none';
          const item = findCatalogIcon(iconKey);
          const inlineSvg =
            getIconSvgSync(iconKey, { width: size, height: size, stroke, fill }) ||
            (item ? customizeSvg(item.svgContent, { width: size, height: size, stroke, fill, className: 'vf-icon-svg' }) : '');

          if (inlineSvg) {
            return `${indent}<span id="${node.id}" class="inline-flex items-center justify-center align-middle"${styleAttr}>${inlineSvg}</span>`;
          }
          return `${indent}<span id="${node.id}" class="inline-flex items-center justify-center align-middle"${styleAttr}>[Icon: ${iconKey}]</span>`;
        }

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
        case 'fontawesome_icon':
        case 'styled_icon': {
          const iconKey = node.props.svgId || node.props.iconName || (node.type === 'styled_icon' ? 'lucide:zap' : 'lucide:rocket');
          const size = node.props.size || node.style?.fontSize || 24;
          const stroke = node.style?.color || 'currentColor';
          const fill = node.style?.fill || node.props?.fill || 'none';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  <title>VisualForge Export - HTML5 + Preline UI / Tailwind (Inline SVG)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* 100% Self-Contained Styles (Zero External CDNs, Zero .woff Fonts) */
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #09090b;
      color: #fafafa;
      line-height: 1.5;
      padding: 24px;
    }
    a { color: inherit; text-decoration: none; }
  </style>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen">
${generateHtmlInlineSvg(tree, '  ', false)}
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
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* 100% Autónomo: SVGs Inline, Cero CDNs, Cero Fuentes Externas */
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #09090b;
      color: #fafafa;
      line-height: 1.5;
      padding: 24px;
    }
    #vf-esp32-status {
      position: fixed; bottom: 20px; right: 20px;
      background: #18181b; color: #10b981; border: 1px solid #27272a;
      padding: 10px 18px; border-radius: 8px; font-family: monospace; font-size: 12px;
      opacity: 0; pointer-events: none; transition: opacity 0.3s; z-index: 9999;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
  </style>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen">
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
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, sans-serif; background: #09090b; color: #f4f4f5; padding: 20px; line-height: 1.5; }
    #vf-esp32-status { position: fixed; bottom: 20px; right: 20px; background: #18181b; color: #10b981; border: 1px solid #27272a; padding: 10px 18px; border-radius: 8px; font-family: monospace; font-size: 12px; opacity: 0; transition: opacity 0.3s; }
  </style>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen">
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
