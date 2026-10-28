import { FontAwesomeIconItem } from '../types';

export const FA_CATEGORIES = [
  'All',
  'Accessibility (Accesibilidad)',
  'Arrows (Flechas)',
  'Business (Negocios / Empresa)',
  'Camping (Campamento / Aire libre)',
  'Charity (Caridad / Ayuda social)',
  'Charts + Diagrams (Gráficos y diagramas)',
  'Childhood (Infancia / Niños)',
  'Clothing + Fashion (Ropa y moda)',
  'Coding (Programación / Desarrollo)',
  'Communication (Comunicación)',
  'Connectivity (Conectividad / Redes)',
  'Construction (Construcción)',
  'Design (Diseño)',
  'Devices + Hardware (Dispositivos y hardware)',
  'Disaster + Crisis (Desastres y crisis)',
  'Editing (Edición de texto)',
  'Education (Educación)',
  'Emoji (Emojis y expresiones)',
  'Energy (Energía)',
  'Files (Archivos y documentos)',
  'Film + Video (Cine y video)',
  'Food + Beverage (Alimentos y bebidas)',
  'Fruits + Vegetables (Frutas y verduras)',
  'Gaming (Videojuegos)',
  'Genders (Géneros)',
  'Halloween (Halloween / Festividades)',
  'Hands (Manos)',
  'Holidays (Días festivos / Vacaciones)',
  'Household (Hogar / Casa)',
  'Humanitarian (Humanitario)',
  'Logistics (Logística y envíos)',
  'Maps (Mapas / Ubicación)',
  'Maritime (Marítimo)',
  'Marketing (Marketing y publicidad)',
  'Mathematics (Matemáticas)',
  'Media Playback (Reproducción multimedia)',
  'Medical + Health (Salud y medicina)',
  'Money (Dinero / Finanzas)',
  'Moving (Mudanza / Movimiento)',
  'Music + Audio (Música y audio)',
  'Photos + Images (Fotos e imágenes)',
  'Punctuation + Symbols (Puntuación y símbolos)',
  'Religion (Religión)',
  'Science (Ciencia)',
  'Science Fiction (Ciencia ficción)',
  'Security (Seguridad)',
  'Shapes (Formas geométricas)',
  'Shopping (Compras / Comercio electrónico)',
  'Social (Redes sociales / Social)',
  'Spinners (Indicadores de carga / Animaciones)',
  'Sports + Fitness (Deportes y ejercicio)',
  'Text Formatting (Formato de texto)',
  'Time (Tiempo / Relojes)',
  'Toggle (Interruptores / Controles)',
  'Transportation (Transporte)',
  'Travel + Hotel (Viajes y hotelería)',
  'Users + People (Usuarios y personas)',
  'Weather (Clima / Tiempo atmosférico)',
] as const;

export const FONT_AWESOME_ICONS: FontAwesomeIconItem[] = [
  // Accessibility (Accesibilidad)
  { name: 'Wheelchair', class: 'fa-wheelchair', category: 'Accessibility (Accesibilidad)', styles: ['solid'], tags: ['disability', 'handicap', 'person'] },
  { name: 'Universal Access', class: 'fa-universal-access', category: 'Accessibility (Accesibilidad)', styles: ['solid'], tags: ['inclusion', 'body'] },
  { name: 'Blind', class: 'fa-blind', category: 'Accessibility (Accesibilidad)', styles: ['solid'], tags: ['cane', 'vision'] },
  { name: 'Deaf', class: 'fa-deaf', category: 'Accessibility (Accesibilidad)', styles: ['solid'], tags: ['hearing', 'ear'] },
  { name: 'Low Vision', class: 'fa-low-vision', category: 'Accessibility (Accesibilidad)', styles: ['solid'], tags: ['sight', 'eye'] },
  { name: 'Braille', class: 'fa-braille', category: 'Accessibility (Accesibilidad)', styles: ['solid'], tags: ['dots', 'reading'] },

  // Arrows (Flechas)
  { name: 'Arrow Right', class: 'fa-arrow-right', category: 'Arrows (Flechas)', styles: ['solid'], tags: ['next', 'forward'] },
  { name: 'Arrow Left', class: 'fa-arrow-left', category: 'Arrows (Flechas)', styles: ['solid'], tags: ['back', 'previous'] },
  { name: 'Arrow Up', class: 'fa-arrow-up', category: 'Arrows (Flechas)', styles: ['solid'], tags: ['top', 'asc'] },
  { name: 'Arrow Down', class: 'fa-arrow-down', category: 'Arrows (Flechas)', styles: ['solid'], tags: ['bottom', 'desc'] },
  { name: 'Chevron Down', class: 'fa-chevron-down', category: 'Arrows (Flechas)', styles: ['solid'], tags: ['dropdown', 'menu'] },
  { name: 'Chevron Right', class: 'fa-chevron-right', category: 'Arrows (Flechas)', styles: ['solid'], tags: ['forward', 'breadcrumb'] },
  { name: 'External Link Alt', class: 'fa-external-link-alt', category: 'Arrows (Flechas)', styles: ['solid'], tags: ['open', 'new tab'] },
  { name: 'Exchange Alt', class: 'fa-exchange-alt', category: 'Arrows (Flechas)', styles: ['solid'], tags: ['swap', 'switch'] },
  { name: 'Redo', class: 'fa-redo', category: 'Arrows (Flechas)', styles: ['solid'], tags: ['reload', 'refresh'] },
  { name: 'Undo', class: 'fa-undo', category: 'Arrows (Flechas)', styles: ['solid'], tags: ['back', 'reverse'] },

  // Business (Negocios / Empresa)
  { name: 'Briefcase', class: 'fa-briefcase', category: 'Business (Negocios / Empresa)', styles: ['solid'], tags: ['work', 'job', 'bag'] },
  { name: 'Building', class: 'fa-building', category: 'Business (Negocios / Empresa)', styles: ['solid', 'regular'], tags: ['office', 'company'] },
  { name: 'Certificate', class: 'fa-certificate', category: 'Business (Negocios / Empresa)', styles: ['solid'], tags: ['badge', 'award'] },
  { name: 'Chart Line', class: 'fa-chart-line', category: 'Business (Negocios / Empresa)', styles: ['solid'], tags: ['growth', 'analytics'] },
  { name: 'Suitcase', class: 'fa-suitcase', category: 'Business (Negocios / Empresa)', styles: ['solid'], tags: ['travel', 'business'] },

  // Camping (Campamento / Aire libre)
  { name: 'Campground', class: 'fa-campground', category: 'Camping (Campamento / Aire libre)', styles: ['solid'], tags: ['tent', 'outdoor', 'park'] },
  { name: 'Compass', class: 'fa-compass', category: 'Camping (Campamento / Aire libre)', styles: ['solid', 'regular'], tags: ['direction', 'navigation'] },
  { name: 'Fire', class: 'fa-fire', category: 'Camping (Campamento / Aire libre)', styles: ['solid'], tags: ['campfire', 'flame'] },
  { name: 'Mountain', class: 'fa-mountain', category: 'Camping (Campamento / Aire libre)', styles: ['solid'], tags: ['hike', 'climb', 'nature'] },
  { name: 'Tree', class: 'fa-tree', category: 'Camping (Campamento / Aire libre)', styles: ['solid'], tags: ['forest', 'wood'] },

  // Charity (Caridad / Ayuda social)
  { name: 'Hands Helping', class: 'fa-hands-helping', category: 'Charity (Caridad / Ayuda social)', styles: ['solid'], tags: ['aid', 'support', 'volunteer'] },
  { name: 'Hand Holding Heart', class: 'fa-hand-holding-heart', category: 'Charity (Caridad / Ayuda social)', styles: ['solid'], tags: ['donation', 'care', 'give'] },
  { name: 'Ribbon', class: 'fa-ribbon', category: 'Charity (Caridad / Ayuda social)', styles: ['solid'], tags: ['cause', 'awareness'] },
  { name: 'Donate', class: 'fa-donate', category: 'Charity (Caridad / Ayuda social)', styles: ['solid'], tags: ['give', 'fund'] },

  // Charts + Diagrams (Gráficos y diagramas)
  { name: 'Chart Bar', class: 'fa-chart-bar', category: 'Charts + Diagrams (Gráficos y diagramas)', styles: ['solid', 'regular'], tags: ['analytics', 'graph'] },
  { name: 'Chart Pie', class: 'fa-chart-pie', category: 'Charts + Diagrams (Gráficos y diagramas)', styles: ['solid'], tags: ['stats', 'percentage'] },
  { name: 'Chart Area', class: 'fa-chart-area', category: 'Charts + Diagrams (Gráficos y diagramas)', styles: ['solid'], tags: ['trend', 'data'] },

  // Childhood (Infancia / Niños)
  { name: 'Child', class: 'fa-child', category: 'Childhood (Infancia / Niños)', styles: ['solid'], tags: ['kid', 'boy', 'girl'] },
  { name: 'Baby', class: 'fa-baby', category: 'Childhood (Infancia / Niños)', styles: ['solid'], tags: ['infant', 'toddler'] },
  { name: 'Robot', class: 'fa-robot', category: 'Childhood (Infancia / Niños)', styles: ['solid'], tags: ['toy', 'ai'] },

  // Clothing + Fashion (Ropa y moda)
  { name: 'T-Shirt', class: 'fa-tshirt', category: 'Clothing + Fashion (Ropa y moda)', styles: ['solid'], tags: ['apparel', 'shirt'] },
  { name: 'Glasses', class: 'fa-glasses', category: 'Clothing + Fashion (Ropa y moda)', styles: ['solid'], tags: ['spectacles', 'fashion'] },
  { name: 'Hat Cowboy', class: 'fa-hat-cowboy', category: 'Clothing + Fashion (Ropa y moda)', styles: ['solid'], tags: ['western', 'style'] },

  // Coding (Programación / Desarrollo)
  { name: 'Code', class: 'fa-code', category: 'Coding (Programación / Desarrollo)', styles: ['solid'], tags: ['html', 'developer', 'tag'] },
  { name: 'Code Branch', class: 'fa-code-branch', category: 'Coding (Programación / Desarrollo)', styles: ['solid'], tags: ['git', 'branch', 'merge'] },
  { name: 'Terminal', class: 'fa-terminal', category: 'Coding (Programación / Desarrollo)', styles: ['solid'], tags: ['console', 'cli', 'bash'] },
  { name: 'File Code', class: 'fa-file-code', category: 'Coding (Programación / Desarrollo)', styles: ['solid', 'regular'], tags: ['source', 'document'] },
  { name: 'Laptop Code', class: 'fa-laptop-code', category: 'Coding (Programación / Desarrollo)', styles: ['solid'], tags: ['software', 'programming'] },

  // Communication (Comunicación)
  { name: 'Envelope', class: 'fa-envelope', category: 'Communication (Comunicación)', styles: ['solid', 'regular'], tags: ['email', 'letter', 'mail'] },
  { name: 'Comments', class: 'fa-comments', category: 'Communication (Comunicación)', styles: ['solid', 'regular'], tags: ['chat', 'message'] },
  { name: 'Phone', class: 'fa-phone', category: 'Communication (Comunicación)', styles: ['solid'], tags: ['call', 'voice'] },
  { name: 'Bullhorn', class: 'fa-bullhorn', category: 'Communication (Comunicación)', styles: ['solid'], tags: ['broadcast', 'speaker'] },
  { name: 'Paper Plane', class: 'fa-paper-plane', category: 'Communication (Comunicación)', styles: ['solid', 'regular'], tags: ['send', 'telegram'] },

  // Connectivity (Conectividad / Redes)
  { name: 'Wifi', class: 'fa-wifi', category: 'Connectivity (Conectividad / Redes)', styles: ['solid'], tags: ['wireless', 'internet'] },
  { name: 'Ethernet', class: 'fa-ethernet', category: 'Connectivity (Conectividad / Redes)', styles: ['solid'], tags: ['lan', 'cable', 'network'] },
  { name: 'Broadcast Tower', class: 'fa-broadcast-tower', category: 'Connectivity (Conectividad / Redes)', styles: ['solid'], tags: ['radio', 'signal'] },
  { name: 'Network Wired', class: 'fa-network-wired', category: 'Connectivity (Conectividad / Redes)', styles: ['solid'], tags: ['nodes', 'cluster'] },

  // Construction (Construcción)
  { name: 'Hammer', class: 'fa-hammer', category: 'Construction (Construcción)', styles: ['solid'], tags: ['tool', 'build'] },
  { name: 'Wrench', class: 'fa-wrench', category: 'Construction (Construcción)', styles: ['solid'], tags: ['fix', 'repair'] },
  { name: 'Hard Hat', class: 'fa-hard-hat', category: 'Construction (Construcción)', styles: ['solid'], tags: ['safety', 'worker'] },
  { name: 'Ruler', class: 'fa-ruler', category: 'Construction (Construcción)', styles: ['solid'], tags: ['measure', 'length'] },

  // Design (Diseño)
  { name: 'Palette', class: 'fa-palette', category: 'Design (Diseño)', styles: ['solid'], tags: ['colors', 'art', 'theme'] },
  { name: 'Pen Nib', class: 'fa-pen-nib', category: 'Design (Diseño)', styles: ['solid'], tags: ['vector', 'bezier', 'pen'] },
  { name: 'Crop Alt', class: 'fa-crop-alt', category: 'Design (Diseño)', styles: ['solid'], tags: ['resize', 'frame'] },
  { name: 'Eye Dropper', class: 'fa-eye-dropper', category: 'Design (Diseño)', styles: ['solid'], tags: ['colorpicker', 'sample'] },
  { name: 'Layer Group', class: 'fa-layer-group', category: 'Design (Diseño)', styles: ['solid'], tags: ['layers', 'stack'] },
  { name: 'Vector Square', class: 'fa-vector-square', category: 'Design (Diseño)', styles: ['solid'], tags: ['shape', 'anchor'] },

  // Devices + Hardware (Dispositivos y hardware)
  { name: 'Desktop', class: 'fa-desktop', category: 'Devices + Hardware (Dispositivos y hardware)', styles: ['solid'], tags: ['monitor', 'screen'] },
  { name: 'Laptop', class: 'fa-laptop', category: 'Devices + Hardware (Dispositivos y hardware)', styles: ['solid'], tags: ['computer', 'mac'] },
  { name: 'Mobile Alt', class: 'fa-mobile-alt', category: 'Devices + Hardware (Dispositivos y hardware)', styles: ['solid'], tags: ['smartphone', 'cell'] },
  { name: 'Tablet Alt', class: 'fa-tablet-alt', category: 'Devices + Hardware (Dispositivos y hardware)', styles: ['solid'], tags: ['ipad', 'touch'] },
  { name: 'Server', class: 'fa-server', category: 'Devices + Hardware (Dispositivos y hardware)', styles: ['solid'], tags: ['backend', 'datacenter'] },
  { name: 'Microchip', class: 'fa-microchip', category: 'Devices + Hardware (Dispositivos y hardware)', styles: ['solid'], tags: ['cpu', 'processor'] },

  // Disaster + Crisis (Desastres y crisis)
  { name: 'First Aid', class: 'fa-first-aid', category: 'Disaster + Crisis (Desastres y crisis)', styles: ['solid'], tags: ['kit', 'medical'] },
  { name: 'Biohazard', class: 'fa-biohazard', category: 'Disaster + Crisis (Desastres y crisis)', styles: ['solid'], tags: ['danger', 'toxic'] },
  { name: 'House Damage', class: 'fa-house-damage', category: 'Disaster + Crisis (Desastres y crisis)', styles: ['solid'], tags: ['earthquake', 'storm'] },

  // Editing (Edición de texto)
  { name: 'Edit', class: 'fa-edit', category: 'Editing (Edición de texto)', styles: ['solid', 'regular'], tags: ['pencil', 'modify', 'write'] },
  { name: 'Copy', class: 'fa-copy', category: 'Editing (Edición de texto)', styles: ['solid', 'regular'], tags: ['duplicate', 'clone'] },
  { name: 'Paste', class: 'fa-paste', category: 'Editing (Edición de texto)', styles: ['solid', 'regular'], tags: ['clipboard', 'insert'] },
  { name: 'Cut', class: 'fa-cut', category: 'Editing (Edición de texto)', styles: ['solid'], tags: ['scissors', 'snip'] },
  { name: 'Trash Alt', class: 'fa-trash-alt', category: 'Editing (Edición de texto)', styles: ['solid', 'regular'], tags: ['delete', 'remove', 'bin'] },

  // Education (Educación)
  { name: 'Graduation Cap', class: 'fa-graduation-cap', category: 'Education (Educación)', styles: ['solid'], tags: ['college', 'university', 'degree'] },
  { name: 'Book', class: 'fa-book', category: 'Education (Educación)', styles: ['solid'], tags: ['read', 'study', 'library'] },
  { name: 'Book Open', class: 'fa-book-open', category: 'Education (Educación)', styles: ['solid'], tags: ['pages', 'learning'] },
  { name: 'Chalkboard', class: 'fa-chalkboard', category: 'Education (Educación)', styles: ['solid'], tags: ['blackboard', 'classroom'] },

  // Emoji (Emojis y expresiones)
  { name: 'Smile', class: 'fa-smile', category: 'Emoji (Emojis y expresiones)', styles: ['solid', 'regular'], tags: ['happy', 'face'] },
  { name: 'Laugh', class: 'fa-laugh', category: 'Emoji (Emojis y expresiones)', styles: ['solid', 'regular'], tags: ['funny', 'lol'] },
  { name: 'Sad Tear', class: 'fa-sad-tear', category: 'Emoji (Emojis y expresiones)', styles: ['solid', 'regular'], tags: ['cry', 'unhappy'] },
  { name: 'Surprise', class: 'fa-surprise', category: 'Emoji (Emojis y expresiones)', styles: ['solid', 'regular'], tags: ['shock', 'wow'] },

  // Energy (Energía)
  { name: 'Bolt', class: 'fa-bolt', category: 'Energy (Energía)', styles: ['solid'], tags: ['lightning', 'electricity', 'flash'] },
  { name: 'Lightbulb', class: 'fa-lightbulb', category: 'Energy (Energía)', styles: ['solid', 'regular'], tags: ['idea', 'lamp'] },
  { name: 'Charging Station', class: 'fa-charging-station', category: 'Energy (Energía)', styles: ['solid'], tags: ['ev', 'battery'] },
  { name: 'Solar Panel', class: 'fa-solar-panel', category: 'Energy (Energía)', styles: ['solid'], tags: ['green', 'eco'] },

  // Files (Archivos y documentos)
  { name: 'File', class: 'fa-file', category: 'Files (Archivos y documentos)', styles: ['solid', 'regular'], tags: ['doc', 'sheet'] },
  { name: 'File Alt', class: 'fa-file-alt', category: 'Files (Archivos y documentos)', styles: ['solid', 'regular'], tags: ['text', 'paper'] },
  { name: 'File Pdf', class: 'fa-file-pdf', category: 'Files (Archivos y documentos)', styles: ['solid', 'regular'], tags: ['pdf', 'adobe'] },
  { name: 'Folder', class: 'fa-folder', category: 'Files (Archivos y documentos)', styles: ['solid', 'regular'], tags: ['directory', 'archive'] },
  { name: 'Folder Open', class: 'fa-folder-open', category: 'Files (Archivos y documentos)', styles: ['solid', 'regular'], tags: ['browse', 'files'] },

  // Film + Video (Cine y video)
  { name: 'Film', class: 'fa-film', category: 'Film + Video (Cine y video)', styles: ['solid'], tags: ['cinema', 'movie'] },
  { name: 'Video', class: 'fa-video', category: 'Film + Video (Cine y video)', styles: ['solid'], tags: ['camera', 'record'] },
  { name: 'Tv', class: 'fa-tv', category: 'Film + Video (Cine y video)', styles: ['solid'], tags: ['television', 'screen'] },

  // Food + Beverage (Alimentos y bebidas)
  { name: 'Utensils', class: 'fa-utensils', category: 'Food + Beverage (Alimentos y bebidas)', styles: ['solid'], tags: ['fork', 'knife', 'restaurant'] },
  { name: 'Coffee', class: 'fa-coffee', category: 'Food + Beverage (Alimentos y bebidas)', styles: ['solid'], tags: ['cup', 'cafe', 'tea'] },
  { name: 'Pizza Slice', class: 'fa-pizza-slice', category: 'Food + Beverage (Alimentos y bebidas)', styles: ['solid'], tags: ['food', 'fast food'] },
  { name: 'Wine Glass', class: 'fa-wine-glass', category: 'Food + Beverage (Alimentos y bebidas)', styles: ['solid'], tags: ['drink', 'bar'] },

  // Fruits + Vegetables (Frutas y verduras)
  { name: 'Apple Alt', class: 'fa-apple-alt', category: 'Fruits + Vegetables (Frutas y verduras)', styles: ['solid'], tags: ['fruit', 'healthy'] },
  { name: 'Carrot', class: 'fa-carrot', category: 'Fruits + Vegetables (Frutas y verduras)', styles: ['solid'], tags: ['vegetable', 'orange'] },
  { name: 'Lemon', class: 'fa-lemon', category: 'Fruits + Vegetables (Frutas y verduras)', styles: ['solid', 'regular'], tags: ['citrus', 'sour'] },

  // Gaming (Videojuegos)
  { name: 'Gamepad', class: 'fa-gamepad', category: 'Gaming (Videojuegos)', styles: ['solid'], tags: ['controller', 'console', 'play'] },
  { name: 'Dice', class: 'fa-dice', category: 'Gaming (Videojuegos)', styles: ['solid'], tags: ['roll', 'boardgame'] },
  { name: 'Chess', class: 'fa-chess', category: 'Gaming (Videojuegos)', styles: ['solid'], tags: ['strategy', 'king'] },

  // Genders (Géneros)
  { name: 'Venus Mars', class: 'fa-venus-mars', category: 'Genders (Géneros)', styles: ['solid'], tags: ['male', 'female', 'identity'] },
  { name: 'Mars', class: 'fa-mars', category: 'Genders (Géneros)', styles: ['solid'], tags: ['male'] },
  { name: 'Venus', class: 'fa-venus', category: 'Genders (Géneros)', styles: ['solid'], tags: ['female'] },

  // Halloween (Halloween / Festividades)
  { name: 'Ghost', class: 'fa-ghost', category: 'Halloween (Halloween / Festividades)', styles: ['solid'], tags: ['spooky', 'scary', 'costume'] },
  { name: 'Broom', class: 'fa-broom', category: 'Halloween (Halloween / Festividades)', styles: ['solid'], tags: ['witch', 'sweep'] },
  { name: 'Hat Wizard', class: 'fa-hat-wizard', category: 'Halloween (Halloween / Festividades)', styles: ['solid'], tags: ['magic', 'sorcerer'] },

  // Hands (Manos)
  { name: 'Hand Paper', class: 'fa-hand-paper', category: 'Hands (Manos)', styles: ['solid', 'regular'], tags: ['palm', 'stop'] },
  { name: 'Hand Point Right', class: 'fa-hand-point-right', category: 'Hands (Manos)', styles: ['solid', 'regular'], tags: ['finger', 'direction'] },
  { name: 'Thumbs Up', class: 'fa-thumbs-up', category: 'Hands (Manos)', styles: ['solid', 'regular'], tags: ['like', 'ok', 'agree'] },
  { name: 'Handshake', class: 'fa-handshake', category: 'Hands (Manos)', styles: ['solid', 'regular'], tags: ['deal', 'partnership'] },

  // Holidays (Días festivos / Vacaciones)
  { name: 'Sun', class: 'fa-sun', category: 'Holidays (Días festivos / Vacaciones)', styles: ['solid', 'regular'], tags: ['summer', 'day', 'warm'] },
  { name: 'Snowflake', class: 'fa-snowflake', category: 'Holidays (Días festivos / Vacaciones)', styles: ['solid', 'regular'], tags: ['winter', 'cold', 'snow'] },
  { name: 'Umbrella Beach', class: 'fa-umbrella-beach', category: 'Holidays (Días festivos / Vacaciones)', styles: ['solid'], tags: ['vacation', 'resort'] },

  // Household (Hogar / Casa)
  { name: 'Home', class: 'fa-home', category: 'Household (Hogar / Casa)', styles: ['solid'], tags: ['house', 'living', 'main'] },
  { name: 'Couch', class: 'fa-couch', category: 'Household (Hogar / Casa)', styles: ['solid'], tags: ['sofa', 'furniture'] },
  { name: 'Bed', class: 'fa-bed', category: 'Household (Hogar / Casa)', styles: ['solid'], tags: ['sleep', 'room'] },
  { name: 'Bath', class: 'fa-bath', category: 'Household (Hogar / Casa)', styles: ['solid'], tags: ['shower', 'bathroom'] },

  // Humanitarian (Humanitario)
  { name: 'Heart', class: 'fa-heart', category: 'Humanitarian (Humanitario)', styles: ['solid', 'regular'], tags: ['love', 'care', 'health'] },
  { name: 'Hand Holding', class: 'fa-hand-holding', category: 'Humanitarian (Humanitario)', styles: ['solid'], tags: ['offer', 'receive'] },
  { name: 'Users', class: 'fa-users', category: 'Humanitarian (Humanitario)', styles: ['solid'], tags: ['community', 'people'] },

  // Logistics (Logística y envíos)
  { name: 'Truck', class: 'fa-truck', category: 'Logistics (Logística y envíos)', styles: ['solid'], tags: ['vehicle', 'freight'] },
  { name: 'Shipping Fast', class: 'fa-shipping-fast', category: 'Logistics (Logística y envíos)', styles: ['solid'], tags: ['express', 'courier'] },
  { name: 'Boxes', class: 'fa-boxes', category: 'Logistics (Logística y envíos)', styles: ['solid'], tags: ['storage', 'warehouse'] },
  { name: 'Box', class: 'fa-box', category: 'Logistics (Logística y envíos)', styles: ['solid'], tags: ['package', 'parcel'] },

  // Maps (Mapas / Ubicación)
  { name: 'Map Marker Alt', class: 'fa-map-marker-alt', category: 'Maps (Mapas / Ubicación)', styles: ['solid'], tags: ['pin', 'location', 'gps'] },
  { name: 'Map', class: 'fa-map', category: 'Maps (Mapas / Ubicación)', styles: ['solid', 'regular'], tags: ['cartography', 'directions'] },
  { name: 'Route', class: 'fa-route', category: 'Maps (Mapas / Ubicación)', styles: ['solid'], tags: ['path', 'navigation'] },

  // Maritime (Marítimo)
  { name: 'Anchor', class: 'fa-anchor', category: 'Maritime (Marítimo)', styles: ['solid'], tags: ['ship', 'sail', 'harbor'] },
  { name: 'Ship', class: 'fa-ship', category: 'Maritime (Marítimo)', styles: ['solid'], tags: ['boat', 'cruise'] },
  { name: 'Water', class: 'fa-water', category: 'Maritime (Marítimo)', styles: ['solid'], tags: ['ocean', 'sea'] },

  // Marketing (Marketing y publicidad)
  { name: 'Ad', class: 'fa-ad', category: 'Marketing (Marketing y publicidad)', styles: ['solid'], tags: ['advertising', 'sponsor'] },
  { name: 'Search Dollar', class: 'fa-search-dollar', category: 'Marketing (Marketing y publicidad)', styles: ['solid'], tags: ['seo', 'conversion'] },
  { name: 'Tags', class: 'fa-tags', category: 'Marketing (Marketing y publicidad)', styles: ['solid'], tags: ['promotion', 'deals'] },

  // Mathematics (Matemáticas)
  { name: 'Calculator', class: 'fa-calculator', category: 'Mathematics (Matemáticas)', styles: ['solid'], tags: ['math', 'calculate'] },
  { name: 'Square Root Alt', class: 'fa-square-root-alt', category: 'Mathematics (Matemáticas)', styles: ['solid'], tags: ['algebra', 'root'] },
  { name: 'Percent', class: 'fa-percent', category: 'Mathematics (Matemáticas)', styles: ['solid'], tags: ['rate', 'discount'] },

  // Media Playback (Reproducción multimedia)
  { name: 'Play', class: 'fa-play', category: 'Media Playback (Reproducción multimedia)', styles: ['solid'], tags: ['start', 'video'] },
  { name: 'Pause', class: 'fa-pause', category: 'Media Playback (Reproducción multimedia)', styles: ['solid'], tags: ['stop', 'hold'] },
  { name: 'Stop', class: 'fa-stop', category: 'Media Playback (Reproducción multimedia)', styles: ['solid'], tags: ['end'] },
  { name: 'Forward', class: 'fa-forward', category: 'Media Playback (Reproducción multimedia)', styles: ['solid'], tags: ['fast-forward', 'skip'] },
  { name: 'Backward', class: 'fa-backward', category: 'Media Playback (Reproducción multimedia)', styles: ['solid'], tags: ['rewind'] },

  // Medical + Health (Salud y medicina)
  { name: 'Heartbeat', class: 'fa-heartbeat', category: 'Medical + Health (Salud y medicina)', styles: ['solid'], tags: ['cardio', 'pulse', 'vital'] },
  { name: 'Hospital', class: 'fa-hospital', category: 'Medical + Health (Salud y medicina)', styles: ['solid', 'regular'], tags: ['clinic', 'emergency'] },
  { name: 'Pills', class: 'fa-pills', category: 'Medical + Health (Salud y medicina)', styles: ['solid'], tags: ['medication', 'capsule'] },
  { name: 'User Md', class: 'fa-user-md', category: 'Medical + Health (Salud y medicina)', styles: ['solid'], tags: ['doctor', 'nurse'] },

  // Money (Dinero / Finanzas)
  { name: 'Dollar Sign', class: 'fa-dollar-sign', category: 'Money (Dinero / Finanzas)', styles: ['solid'], tags: ['usd', 'cash', 'money'] },
  { name: 'Coins', class: 'fa-coins', category: 'Money (Dinero / Finanzas)', styles: ['solid'], tags: ['currency', 'cents'] },
  { name: 'Credit Card', class: 'fa-credit-card', category: 'Money (Dinero / Finanzas)', styles: ['solid', 'regular'], tags: ['payment', 'visa'] },
  { name: 'Money Bill Wave', class: 'fa-money-bill-wave', category: 'Money (Dinero / Finanzas)', styles: ['solid'], tags: ['cash', 'paper'] },

  // Moving (Mudanza / Movimiento)
  { name: 'Dolly', class: 'fa-dolly', category: 'Moving (Mudanza / Movimiento)', styles: ['solid'], tags: ['cart', 'warehouse'] },
  { name: 'Truck Loading', class: 'fa-truck-loading', category: 'Moving (Mudanza / Movimiento)', styles: ['solid'], tags: ['cargo', 'shipment'] },

  // Music + Audio (Música y audio)
  { name: 'Music', class: 'fa-music', category: 'Music + Audio (Música y audio)', styles: ['solid'], tags: ['song', 'melody', 'tune'] },
  { name: 'Headphones', class: 'fa-headphones', category: 'Music + Audio (Música y audio)', styles: ['solid'], tags: ['audio', 'listen'] },
  { name: 'Microphone', class: 'fa-microphone', category: 'Music + Audio (Música y audio)', styles: ['solid'], tags: ['record', 'voice'] },
  { name: 'Volume Up', class: 'fa-volume-up', category: 'Music + Audio (Música y audio)', styles: ['solid'], tags: ['loud', 'sound'] },

  // Photos + Images (Fotos e imágenes)
  { name: 'Camera', class: 'fa-camera', category: 'Photos + Images (Fotos e imágenes)', styles: ['solid'], tags: ['photo', 'picture', 'lens'] },
  { name: 'Image', class: 'fa-image', category: 'Photos + Images (Fotos e imágenes)', styles: ['solid', 'regular'], tags: ['artwork', 'thumbnail'] },
  { name: 'Images', class: 'fa-images', category: 'Photos + Images (Fotos e imágenes)', styles: ['solid', 'regular'], tags: ['gallery', 'photos'] },

  // Punctuation + Symbols (Puntuación y símbolos)
  { name: 'Question Circle', class: 'fa-question-circle', category: 'Punctuation + Symbols (Puntuación y símbolos)', styles: ['solid', 'regular'], tags: ['help', 'faq', 'info'] },
  { name: 'Exclamation Circle', class: 'fa-exclamation-circle', category: 'Punctuation + Symbols (Puntuación y símbolos)', styles: ['solid'], tags: ['warning', 'notice'] },
  { name: 'Check', class: 'fa-check', category: 'Punctuation + Symbols (Puntuación y símbolos)', styles: ['solid'], tags: ['done', 'ok'] },
  { name: 'Times', class: 'fa-times', category: 'Punctuation + Symbols (Puntuación y símbolos)', styles: ['solid'], tags: ['close', 'cross'] },

  // Religion (Religión)
  { name: 'Praying Hands', class: 'fa-praying-hands', category: 'Religion (Religión)', styles: ['solid'], tags: ['prayer', 'worship'] },
  { name: 'Cross', class: 'fa-cross', category: 'Religion (Religión)', styles: ['solid'], tags: ['christianity', 'faith'] },
  { name: 'Peace', class: 'fa-peace', category: 'Religion (Religión)', styles: ['solid'], tags: ['harmony', 'spirit'] },

  // Science (Ciencia)
  { name: 'Flask', class: 'fa-flask', category: 'Science (Ciencia)', styles: ['solid'], tags: ['chemistry', 'lab', 'potion'] },
  { name: 'Microscope', class: 'fa-microscope', category: 'Science (Ciencia)', styles: ['solid'], tags: ['biology', 'research'] },
  { name: 'Dna', class: 'fa-dna', category: 'Science (Ciencia)', styles: ['solid'], tags: ['genetics', 'medical'] },

  // Science Fiction (Ciencia ficción)
  { name: 'Rocket', class: 'fa-rocket', category: 'Science Fiction (Ciencia ficción)', styles: ['solid'], tags: ['space', 'launch', 'speed'] },
  { name: 'Atom', class: 'fa-atom', category: 'Science Fiction (Ciencia ficción)', styles: ['solid'], tags: ['nuclear', 'quantum'] },
  { name: 'User Astronaut', class: 'fa-user-astronaut', category: 'Science Fiction (Ciencia ficción)', styles: ['solid'], tags: ['cosmonaut', 'nasa'] },

  // Security (Seguridad)
  { name: 'Shield Alt', class: 'fa-shield-alt', category: 'Security (Seguridad)', styles: ['solid'], tags: ['protect', 'firewall'] },
  { name: 'Lock', class: 'fa-lock', category: 'Security (Seguridad)', styles: ['solid'], tags: ['private', 'secure', 'password'] },
  { name: 'Key', class: 'fa-key', category: 'Security (Seguridad)', styles: ['solid'], tags: ['unlock', 'auth'] },
  { name: 'User Secret', class: 'fa-user-secret', category: 'Security (Seguridad)', styles: ['solid'], tags: ['spy', 'incognito'] },

  // Shapes (Formas geométricas)
  { name: 'Circle', class: 'fa-circle', category: 'Shapes (Formas geométricas)', styles: ['solid', 'regular'], tags: ['round', 'dot'] },
  { name: 'Square', class: 'fa-square', category: 'Shapes (Formas geométricas)', styles: ['solid', 'regular'], tags: ['box', 'cube'] },
  { name: 'Star', class: 'fa-star', category: 'Shapes (Formas geométricas)', styles: ['solid', 'regular'], tags: ['rating', 'favorite'] },

  // Shopping (Compras / Comercio electrónico)
  { name: 'Shopping Cart', class: 'fa-shopping-cart', category: 'Shopping (Compras / Comercio electrónico)', styles: ['solid'], tags: ['store', 'buy', 'checkout'] },
  { name: 'Shopping Bag', class: 'fa-shopping-bag', category: 'Shopping (Compras / Comercio electrónico)', styles: ['solid'], tags: ['retail', 'purchase'] },
  { name: 'Store', class: 'fa-store', category: 'Shopping (Compras / Comercio electrónico)', styles: ['solid'], tags: ['shop', 'outlet'] },
  { name: 'Tag', class: 'fa-tag', category: 'Shopping (Compras / Comercio electrónico)', styles: ['solid'], tags: ['price', 'discount'] },

  // Social (Redes sociales / Social)
  { name: 'Share Alt', class: 'fa-share-alt', category: 'Social (Redes sociales / Social)', styles: ['solid'], tags: ['network', 'forward'] },
  { name: 'Thumbs Down', class: 'fa-thumbs-down', category: 'Social (Redes sociales / Social)', styles: ['solid', 'regular'], tags: ['dislike'] },
  { name: 'GitHub', class: 'fa-github', category: 'Social (Redes sociales / Social)', styles: ['brands'], tags: ['git', 'code', 'repo'] },
  { name: 'Twitter', class: 'fa-twitter', category: 'Social (Redes sociales / Social)', styles: ['brands'], tags: ['tweet', 'social'] },
  { name: 'Facebook', class: 'fa-facebook', category: 'Social (Redes sociales / Social)', styles: ['brands'], tags: ['social', 'meta'] },
  { name: 'Instagram', class: 'fa-instagram', category: 'Social (Redes sociales / Social)', styles: ['brands'], tags: ['photo', 'feed'] },
  { name: 'LinkedIn', class: 'fa-linkedin', category: 'Social (Redes sociales / Social)', styles: ['brands'], tags: ['career', 'professional'] },
  { name: 'YouTube', class: 'fa-youtube', category: 'Social (Redes sociales / Social)', styles: ['brands'], tags: ['video', 'stream'] },
  { name: 'Bootstrap', class: 'fa-bootstrap', category: 'Social (Redes sociales / Social)', styles: ['brands'], tags: ['css', 'framework'] },
  { name: 'React', class: 'fa-react', category: 'Social (Redes sociales / Social)', styles: ['brands'], tags: ['javascript', 'frontend'] },
  { name: 'Figma', class: 'fa-figma', category: 'Social (Redes sociales / Social)', styles: ['brands'], tags: ['design', 'ui'] },

  // Spinners (Indicadores de carga / Animaciones)
  { name: 'Spinner', class: 'fa-spinner', category: 'Spinners (Indicadores de carga / Animaciones)', styles: ['solid'], tags: ['loading', 'wait', 'loader'] },
  { name: 'Circle Notch', class: 'fa-circle-notch', category: 'Spinners (Indicadores de carga / Animaciones)', styles: ['solid'], tags: ['progress', 'busy'] },
  { name: 'Sync', class: 'fa-sync', category: 'Spinners (Indicadores de carga / Animaciones)', styles: ['solid'], tags: ['refresh', 'reload'] },

  // Sports + Fitness (Deportes y ejercicio)
  { name: 'Dumbbell', class: 'fa-dumbbell', category: 'Sports + Fitness (Deportes y ejercicio)', styles: ['solid'], tags: ['gym', 'workout', 'weights'] },
  { name: 'Futbol', class: 'fa-futbol', category: 'Sports + Fitness (Deportes y ejercicio)', styles: ['solid', 'regular'], tags: ['soccer', 'ball'] },
  { name: 'Basketball Ball', class: 'fa-basketball-ball', category: 'Sports + Fitness (Deportes y ejercicio)', styles: ['solid'], tags: ['nba', 'hoop'] },
  { name: 'Biking', class: 'fa-biking', category: 'Sports + Fitness (Deportes y ejercicio)', styles: ['solid'], tags: ['bicycle', 'cycling'] },

  // Text Formatting (Formato de texto)
  { name: 'Bold', class: 'fa-bold', category: 'Text Formatting (Formato de texto)', styles: ['solid'], tags: ['strong', 'emphasis'] },
  { name: 'Italic', class: 'fa-italic', category: 'Text Formatting (Formato de texto)', styles: ['solid'], tags: ['slanted', 'type'] },
  { name: 'Underline', class: 'fa-underline', category: 'Text Formatting (Formato de texto)', styles: ['solid'], tags: ['line', 'text'] },
  { name: 'List Ul', class: 'fa-list-ul', category: 'Text Formatting (Formato de texto)', styles: ['solid'], tags: ['bullet', 'points'] },
  { name: 'List Ol', class: 'fa-list-ol', category: 'Text Formatting (Formato de texto)', styles: ['solid'], tags: ['ordered', 'numbers'] },

  // Time (Tiempo / Relojes)
  { name: 'Clock', class: 'fa-clock', category: 'Time (Tiempo / Relojes)', styles: ['solid', 'regular'], tags: ['watch', 'hour', 'minute'] },
  { name: 'Hourglass Half', class: 'fa-hourglass-half', category: 'Time (Tiempo / Relojes)', styles: ['solid'], tags: ['sand', 'countdown'] },
  { name: 'Calendar Alt', class: 'fa-calendar-alt', category: 'Time (Tiempo / Relojes)', styles: ['solid', 'regular'], tags: ['date', 'schedule', 'event'] },

  // Toggle (Interruptores / Controles)
  { name: 'Toggle On', class: 'fa-toggle-on', category: 'Toggle (Interruptores / Controles)', styles: ['solid'], tags: ['switch', 'active'] },
  { name: 'Toggle Off', class: 'fa-toggle-off', category: 'Toggle (Interruptores / Controles)', styles: ['solid'], tags: ['switch', 'inactive'] },
  { name: 'Check Square', class: 'fa-check-square', category: 'Toggle (Interruptores / Controles)', styles: ['solid', 'regular'], tags: ['checkbox', 'selected'] },

  // Transportation (Transporte)
  { name: 'Car', class: 'fa-car', category: 'Transportation (Transporte)', styles: ['solid'], tags: ['automobile', 'drive'] },
  { name: 'Bus', class: 'fa-bus', category: 'Transportation (Transporte)', styles: ['solid'], tags: ['transit', 'public'] },
  { name: 'Subway', class: 'fa-subway', category: 'Transportation (Transporte)', styles: ['solid'], tags: ['metro', 'train'] },
  { name: 'Plane', class: 'fa-plane', category: 'Transportation (Transporte)', styles: ['solid'], tags: ['airplane', 'flight'] },
  { name: 'Bicycle', class: 'fa-bicycle', category: 'Transportation (Transporte)', styles: ['solid'], tags: ['bike', 'cycling'] },

  // Travel + Hotel (Viajes y hotelería)
  { name: 'Hotel', class: 'fa-hotel', category: 'Travel + Hotel (Viajes y hotelería)', styles: ['solid'], tags: ['inn', 'lodging'] },
  { name: 'Passport', class: 'fa-passport', category: 'Travel + Hotel (Viajes y hotelería)', styles: ['solid'], tags: ['visa', 'travel'] },
  { name: 'Luggage Cart', class: 'fa-luggage-cart', category: 'Travel + Hotel (Viajes y hotelería)', styles: ['solid'], tags: ['baggage', 'bellboy'] },

  // Users + People (Usuarios y personas)
  { name: 'User', class: 'fa-user', category: 'Users + People (Usuarios y personas)', styles: ['solid', 'regular'], tags: ['account', 'person', 'profile'] },
  { name: 'User Friends', class: 'fa-user-friends', category: 'Users + People (Usuarios y personas)', styles: ['solid'], tags: ['contacts', 'team'] },
  { name: 'User Plus', class: 'fa-user-plus', category: 'Users + People (Usuarios y personas)', styles: ['solid'], tags: ['add friend', 'new member'] },
  { name: 'Id Card', class: 'fa-id-card', category: 'Users + People (Usuarios y personas)', styles: ['solid', 'regular'], tags: ['badge', 'license'] },

  // Weather (Clima / Tiempo atmosférico)
  { name: 'Cloud Sun', class: 'fa-cloud-sun', category: 'Weather (Clima / Tiempo atmosférico)', styles: ['solid'], tags: ['partly cloudy', 'forecast'] },
  { name: 'Cloud Rain', class: 'fa-cloud-rain', category: 'Weather (Clima / Tiempo atmosférico)', styles: ['solid'], tags: ['shower', 'precipitation'] },
  { name: 'Wind', class: 'fa-wind', category: 'Weather (Clima / Tiempo atmosférico)', styles: ['solid'], tags: ['breeze', 'air'] },
  { name: 'Smog', class: 'fa-smog', category: 'Weather (Clima / Tiempo atmosférico)', styles: ['solid'], tags: ['fog', 'haze'] },
];
