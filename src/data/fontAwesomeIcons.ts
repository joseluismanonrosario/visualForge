import { FontAwesomeIconItem } from '../types';

export const FA_CATEGORIES = [
  'All',
  'General & UI',
  'Negocios & Finanzas',
  'Comercio & Tienda',
  'Comunicación & Social',
  'Medios & Diseño',
  'Desarrollo & Tecnología',
  'Seguridad & Alertas',
  'Transporte & Mapas',
  'Marcas / Brands',
  'Flechas & Navegación',
] as const;

export const FONT_AWESOME_ICONS: FontAwesomeIconItem[] = [
  // General & UI
  { name: 'House', class: 'fa-house', category: 'General & UI', styles: ['solid'], tags: ['home', 'main', 'dashboard'] },
  { name: 'User', class: 'fa-user', category: 'General & UI', styles: ['solid', 'regular'], tags: ['person', 'profile', 'account'] },
  { name: 'Gear', class: 'fa-gear', category: 'General & UI', styles: ['solid'], tags: ['settings', 'config', 'options'] },
  { name: 'Magnifying Glass', class: 'fa-magnifying-glass', category: 'General & UI', styles: ['solid'], tags: ['search', 'find'] },
  { name: 'Check', class: 'fa-check', category: 'General & UI', styles: ['solid'], tags: ['ok', 'done', 'success'] },
  { name: 'Xmark', class: 'fa-xmark', category: 'General & UI', styles: ['solid'], tags: ['close', 'remove', 'delete'] },
  { name: 'Heart', class: 'fa-heart', category: 'General & UI', styles: ['solid', 'regular'], tags: ['love', 'like', 'favorite'] },
  { name: 'Star', class: 'fa-star', category: 'General & UI', styles: ['solid', 'regular'], tags: ['rate', 'favorite', 'rating'] },
  { name: 'Eye', class: 'fa-eye', category: 'General & UI', styles: ['solid', 'regular'], tags: ['view', 'see', 'preview'] },
  { name: 'Sliders', class: 'fa-sliders', category: 'General & UI', styles: ['solid'], tags: ['filter', 'controls'] },

  // Negocios & Finanzas
  { name: 'Chart Simple', class: 'fa-chart-simple', category: 'Negocios & Finanzas', styles: ['solid'], tags: ['analytics', 'metrics', 'graph'] },
  { name: 'Credit Card', class: 'fa-credit-card', category: 'Negocios & Finanzas', styles: ['solid', 'regular'], tags: ['payment', 'money', 'billing'] },
  { name: 'Coins', class: 'fa-coins', category: 'Negocios & Finanzas', styles: ['solid'], tags: ['currency', 'finance', 'revenue'] },
  { name: 'Briefcase', class: 'fa-briefcase', category: 'Negocios & Finanzas', styles: ['solid'], tags: ['work', 'job', 'business'] },
  { name: 'Handshake', class: 'fa-handshake', category: 'Negocios & Finanzas', styles: ['solid', 'regular'], tags: ['deal', 'partnership'] },
  { name: 'Receipt', class: 'fa-receipt', category: 'Negocios & Finanzas', styles: ['solid'], tags: ['invoice', 'bill', 'order'] },
  { name: 'Piggy Bank', class: 'fa-piggy-bank', category: 'Negocios & Finanzas', styles: ['solid'], tags: ['savings', 'deposit'] },

  // Comercio & Tienda
  { name: 'Cart Shopping', class: 'fa-cart-shopping', category: 'Comercio & Tienda', styles: ['solid'], tags: ['store', 'buy', 'ecommerce'] },
  { name: 'Bag Shopping', class: 'fa-bag-shopping', category: 'Comercio & Tienda', styles: ['solid'], tags: ['shop', 'purchase'] },
  { name: 'Store', class: 'fa-store', category: 'Comercio & Tienda', styles: ['solid'], tags: ['marketplace', 'retail'] },
  { name: 'Tag', class: 'fa-tag', category: 'Comercio & Tienda', styles: ['solid'], tags: ['price', 'discount', 'label'] },
  { name: 'Truck Fast', class: 'fa-truck-fast', category: 'Comercio & Tienda', styles: ['solid'], tags: ['shipping', 'delivery'] },
  { name: 'Gift', class: 'fa-gift', category: 'Comercio & Tienda', styles: ['solid'], tags: ['present', 'offer', 'reward'] },

  // Comunicación & Social
  { name: 'Envelope', class: 'fa-envelope', category: 'Comunicación & Social', styles: ['solid', 'regular'], tags: ['email', 'mail', 'inbox'] },
  { name: 'Message', class: 'fa-message', category: 'Comunicación & Social', styles: ['solid', 'regular'], tags: ['chat', 'sms', 'bubble'] },
  { name: 'Phone', class: 'fa-phone', category: 'Comunicación & Social', styles: ['solid'], tags: ['call', 'contact'] },
  { name: 'Share Nodes', class: 'fa-share-nodes', category: 'Comunicación & Social', styles: ['solid'], tags: ['share', 'network'] },
  { name: 'Thumbs Up', class: 'fa-thumbs-up', category: 'Comunicación & Social', styles: ['solid', 'regular'], tags: ['like', 'agree'] },
  { name: 'Bullhorn', class: 'fa-bullhorn', category: 'Comunicación & Social', styles: ['solid'], tags: ['announce', 'campaign', 'broadcast'] },

  // Medios & Diseño
  { name: 'Palette', class: 'fa-palette', category: 'Medios & Diseño', styles: ['solid'], tags: ['color', 'art', 'theme'] },
  { name: 'Pen Nib', class: 'fa-pen-nib', category: 'Medios & Diseño', styles: ['solid'], tags: ['vector', 'drawing', 'figma'] },
  { name: 'Image', class: 'fa-image', category: 'Medios & Diseño', styles: ['solid', 'regular'], tags: ['photo', 'picture', 'graphic'] },
  { name: 'Video', class: 'fa-video', category: 'Medios & Diseño', styles: ['solid'], tags: ['movie', 'camera', 'film'] },
  { name: 'Music', class: 'fa-music', category: 'Medios & Diseño', styles: ['solid'], tags: ['audio', 'sound', 'track'] },
  { name: 'Crop', class: 'fa-crop', category: 'Medios & Diseño', styles: ['solid'], tags: ['resize', 'trim'] },

  // Desarrollo & Tecnología
  { name: 'Code', class: 'fa-code', category: 'Desarrollo & Tecnología', styles: ['solid'], tags: ['programming', 'html', 'developer'] },
  { name: 'Terminal', class: 'fa-terminal', category: 'Desarrollo & Tecnología', styles: ['solid'], tags: ['cli', 'bash', 'console'] },
  { name: 'Database', class: 'fa-database', category: 'Desarrollo & Tecnología', styles: ['solid'], tags: ['storage', 'sql', 'server'] },
  { name: 'Microchip', class: 'fa-microchip', category: 'Desarrollo & Tecnología', styles: ['solid'], tags: ['cpu', 'processor', 'hardware'] },
  { name: 'Cloud', class: 'fa-cloud', category: 'Desarrollo & Tecnología', styles: ['solid'], tags: ['hosting', 'saas', 'backup'] },
  { name: 'Rocket', class: 'fa-rocket', category: 'Desarrollo & Tecnología', styles: ['solid'], tags: ['launch', 'deploy', 'fast'] },

  // Seguridad & Alertas
  { name: 'Shield Halved', class: 'fa-shield-halved', category: 'Seguridad & Alertas', styles: ['solid'], tags: ['security', 'protection', 'safe'] },
  { name: 'Lock', class: 'fa-lock', category: 'Seguridad & Alertas', styles: ['solid'], tags: ['private', 'password', 'encrypted'] },
  { name: 'Key', class: 'fa-key', category: 'Seguridad & Alertas', styles: ['solid'], tags: ['access', 'auth', 'token'] },
  { name: 'Triangle Exclamation', class: 'fa-triangle-exclamation', category: 'Seguridad & Alertas', styles: ['solid'], tags: ['warning', 'alert', 'error'] },
  { name: 'Circle Check', class: 'fa-circle-check', category: 'Seguridad & Alertas', styles: ['solid', 'regular'], tags: ['verified', 'valid'] },

  // Transporte & Mapas
  { name: 'Location Dot', class: 'fa-location-dot', category: 'Transporte & Mapas', styles: ['solid'], tags: ['map', 'pin', 'gps', 'address'] },
  { name: 'Compass', class: 'fa-compass', category: 'Transporte & Mapas', styles: ['solid', 'regular'], tags: ['direction', 'navigate'] },
  { name: 'Plane', class: 'fa-plane', category: 'Transporte & Mapas', styles: ['solid'], tags: ['flight', 'travel'] },
  { name: 'Car', class: 'fa-car', category: 'Transporte & Mapas', styles: ['solid'], tags: ['automobile', 'drive'] },

  // Marcas / Brands
  { name: 'GitHub', class: 'fa-github', category: 'Marcas / Brands', styles: ['brands'], tags: ['git', 'repo', 'code'] },
  { name: 'React', class: 'fa-react', category: 'Marcas / Brands', styles: ['brands'], tags: ['js', 'framework', 'ui'] },
  { name: 'Bootstrap', class: 'fa-bootstrap', category: 'Marcas / Brands', styles: ['brands'], tags: ['css', 'toolkit'] },
  { name: 'Figma', class: 'fa-figma', category: 'Marcas / Brands', styles: ['brands'], tags: ['design', 'ui', 'ux'] },
  { name: 'Twitter / X', class: 'fa-x-twitter', category: 'Marcas / Brands', styles: ['brands'], tags: ['social', 'tweet'] },
  { name: 'Google', class: 'fa-google', category: 'Marcas / Brands', styles: ['brands'], tags: ['search', 'cloud'] },
  { name: 'Apple', class: 'fa-apple', category: 'Marcas / Brands', styles: ['brands'], tags: ['ios', 'mac'] },

  // Flechas & Navegación
  { name: 'Arrow Right', class: 'fa-arrow-right', category: 'Flechas & Navegación', styles: ['solid'], tags: ['next', 'forward'] },
  { name: 'Arrow Left', class: 'fa-arrow-left', category: 'Flechas & Navegación', styles: ['solid'], tags: ['back', 'previous'] },
  { name: 'Arrow Up', class: 'fa-arrow-up', category: 'Flechas & Navegación', styles: ['solid'], tags: ['top', 'asc'] },
  { name: 'Arrow Down', class: 'fa-arrow-down', category: 'Flechas & Navegación', styles: ['solid'], tags: ['bottom', 'desc'] },
  { name: 'Chevron Down', class: 'fa-chevron-down', category: 'Flechas & Navegación', styles: ['solid'], tags: ['dropdown', 'expand'] },
  { name: 'Arrow Up Right From Square', class: 'fa-arrow-up-right-from-square', category: 'Flechas & Navegación', styles: ['solid'], tags: ['external', 'open', 'link'] },
];
