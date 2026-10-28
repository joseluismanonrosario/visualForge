export type ComponentLibrary = 'shadcn' | 'bootstrap' | 'both';

export type ProjectType = 'esp32' | 'html_css' | 'react' | 'framework' | 'hybrid';

export type GpioAction = 'TOGGLE_PIN' | 'SET_HIGH' | 'SET_LOW' | 'PWM' | 'READ_PIN';
export type GpioCommMode = 'HTTP_GET' | 'HTTP_POST' | 'WEBSOCKET';

export interface GpioConfig {
  enabled?: boolean;
  pin: number;
  action: GpioAction;
  mode: GpioCommMode;
  label?: string;
  pwmValue?: number;
}

export interface CanvasNode {
  id: string;
  name: string;
  type: string;
  library: ComponentLibrary;
  isContainer: boolean;
  style: Record<string, any>;
  props: Record<string, any>;
  children: CanvasNode[];
  locked?: boolean;
  hidden?: boolean;
}

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';
export type ToolMode = 'select' | 'hand';
export type DropPosition = 'before' | 'inside' | 'after';

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
  catalog?: 'shadcn' | 'preline' | 'both';
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
