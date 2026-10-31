export type ComponentLibrary = 'shadcn' | 'bootstrap' | 'both';

export type AppTheme = 'system' | 'dark' | 'light' | 'blue';
export type ResolvedTheme = 'dark' | 'light' | 'blue';

export type ProjectType = 'esp32' | 'html_css' | 'react' | 'framework' | 'hybrid';

export type GpioAction = 'TOGGLE_PIN' | 'SET_HIGH' | 'SET_LOW' | 'PWM' | 'READ_PIN';
export type GpioCommMode = 'HTTP_GET' | 'HTTP_POST' | 'WEBSOCKET';

export type BindingMode = 'read' | 'write' | 'bidirectional';
export type DataSourceProtocol = 'websocket' | 'mqtt' | 'http-poll' | 'serial';

export interface DataBindingConfig {
  enabled?: boolean;
  bindingMode: BindingMode;
  dataSource: DataSourceProtocol;
  topic?: string;
  endpoint?: string;
  dataKey?: string;
  jsonPath?: string;
  gpioPin?: string;
  variableName?: string;
  refreshInterval?: number;
  autoUpdate?: boolean;
  unit?: string;
  minValue?: number;
  maxValue?: number;
}

export interface GpioConfig {
  enabled?: boolean;
  pin: number;
  action: GpioAction;
  mode: GpioCommMode;
  label?: string;
  pwmValue?: number;
}

export interface ResponsiveStyles {
  desktop?: Record<string, any>;
  tablet?: Record<string, any>;
  mobile?: Record<string, any>;
}

export interface ResponsiveVisibility {
  desktop?: boolean;
  tablet?: boolean;
  mobile?: boolean;
}

export interface CanvasNode {
  id: string;
  name: string;
  type: string;
  library: ComponentLibrary;
  isContainer: boolean;
  style: Record<string, any>;
  responsiveStyles?: ResponsiveStyles;
  responsiveVisibility?: ResponsiveVisibility;
  props: Record<string, any>;
  children: CanvasNode[];
  locked?: boolean;
  hidden?: boolean;
}

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';
export type ToolMode = 'select' | 'hand' | 'container' | 'heading' | 'paragraph' | 'image';
export type DropPosition = 'before' | 'inside' | 'after';

export interface CanvasSettings {
  artboardBg: string;
  artboardTextColor: string;
  minHeight: number;
  padding: number;
  gap: number;
  fontFamily: string;
  showGrid: boolean;
  width?: number;
  height?: number;
  presetName?: string;
}

export interface DragState {
  isDragging: boolean;
  sourceType: 'catalog' | 'canvas' | 'layer';
  nodeData?: CanvasNode;
  nodeId?: string;
  targetId?: string | null;
  position?: DropPosition | null;
}

export interface ComponentDefinition {
  type: string;
  name: string;
  category: string;
  catalog?: 'shadcn' | 'preline' | 'iot' | 'both';
  library?: ComponentLibrary;
  icon: string;
  isContainer: boolean;
  defaultStyle: Record<string, any>;
  defaultProps: Record<string, any>;
  defaultChildren?: CanvasNode[];
}

export interface IconStyleOption {
  id: string;
  label: string;
  prefix: string;
}

export interface IconItem {
  name: string;
  class: string;
  category: string;
  styles?: string[];
  tags: string[];
}

export interface IconLibraryDef {
  id: string;
  name: string;
  workflow: ProjectType;
  description: string;
  badge: string;
  styles: IconStyleOption[];
  icons: IconItem[];
}

export interface FontAwesomeIconItem {
  name: string;
  class: string;
  category: string;
  styles: ('solid' | 'regular' | 'brands')[];
  tags: string[];
}

export interface RecentProjectItem {
  id: string;
  name: string;
  fileName: string;
  path: string;
  date: string;
  timestamp: number;
  content?: string;
}
