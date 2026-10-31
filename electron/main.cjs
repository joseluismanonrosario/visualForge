const { app, BrowserWindow, Menu, shell, ipcMain, dialog, session } = require('electron');
const crypto = require('crypto');

// Token criptografico de sesion secreta para proteger el servidor local contra navegadores externos
const SESSION_SECRET = crypto.randomBytes(24).toString('hex');
const path = require('path');
const fs = require('fs');
const http = require('http');

let mainWindow = null;
let localServer = null;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

// Cache en memoria para colecciones de iconos de Iconify (evita lecturas repetidas de disco y cuellos de botella)
const ICON_CACHE = new Map();
const MAX_ICON_CACHE = 40;

// Iniciar servidor local embebido para soporte completo de Iconify y assets
function startLocalServer(callback) {
  const distDir = path.resolve(__dirname, '../dist');
  const iconifyDir = path.resolve(__dirname, '../node_modules/@iconify/json');

  const server = http.createServer((req, res) => {
    // Evitar que errores no capturados en el socket cierren el servidor
    req.on('error', () => {});
    res.on('error', () => {});

    try {
      const parsedUrl = new URL(req.url, 'http://127.0.0.1');

      // Validacion de token de sesion secreta (Header, Query Param o Cookie)
      const cookieHeader = req.headers.cookie || '';
      const cookieMatch = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('vf_token='));
      const cookieToken = cookieMatch ? cookieMatch.split('=')[1] : null;
      const requestToken = req.headers['x-vf-token'] || parsedUrl.searchParams.get('_vf_token') || cookieToken;

      if (!requestToken || requestToken !== SESSION_SECRET) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('403 Forbidden: Acceso no autorizado a VisualForge Studio.');
        return;
      }

      let pathname = decodeURIComponent(parsedUrl.pathname);

      // Manejo de iconos locales de Iconify con prevención estricta de Path Traversal
      if (pathname.startsWith('/@iconify/') || pathname.startsWith('/api/iconify/')) {
        let sub = pathname.replace(/^\/(@iconify|api\/iconify)\/?/, '');
        sub = sub.replace(/^(\.\.[\/\\])+/, '');
        let iconPath = path.resolve(iconifyDir, sub);

        // Prevenir salto fuera del directorio de colecciones
        if (!iconPath.startsWith(iconifyDir)) {
          res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('403 Forbidden: Acceso no permitido a colección de iconos.');
          return;
        }

        if (!fs.existsSync(iconPath) && !sub.startsWith('json/')) {
          const altPath = path.resolve(iconifyDir, 'json', sub);
          if (altPath.startsWith(iconifyDir) && fs.existsSync(altPath)) {
            iconPath = altPath;
          }
        }

        if (fs.existsSync(iconPath) && fs.statSync(iconPath).isFile()) {
          // 1. Servir desde caché en memoria si existe
          if (ICON_CACHE.has(iconPath)) {
            const cached = ICON_CACHE.get(iconPath);
            if (!res.writableEnded && !res.destroyed) {
              res.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Length': cached.length,
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=86400',
              });
              res.end(cached);
            }
            return;
          }

          // 2. Lectura asíncrona segura con Content-Length y protección contra aborts
          fs.readFile(iconPath, (err, data) => {
            if (err) {
              if (!res.writableEnded && !res.destroyed) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error al leer colección de iconos: ' + err.message);
              }
              return;
            }

            if (res.writableEnded || res.destroyed) return;

            // Guardar en caché LRU en memoria
            if (ICON_CACHE.size >= MAX_ICON_CACHE) {
              const firstKey = ICON_CACHE.keys().next().value;
              ICON_CACHE.delete(firstKey);
            }
            ICON_CACHE.set(iconPath, data);

            res.writeHead(200, {
              'Content-Type': 'application/json; charset=utf-8',
              'Content-Length': data.length,
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'public, max-age=86400',
            });
            res.end(data);
          });
          return;
        }
      }

      // Archivos estáticos de dist con prevención estricta de Path Traversal
      const normalizedPath = pathname === '/' ? '/index.html' : pathname;
      let filePath = path.resolve(distDir, '.' + normalizedPath);

      // Bloquear cualquier intento de salir del directorio dist
      if (!filePath.startsWith(distDir)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('403 Forbidden: Acceso denegado a recurso no autorizado.');
        return;
      }

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.resolve(distDir, 'index.html');
      }

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, data) => {
          if (err) {
            if (!res.writableEnded && !res.destroyed) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Error reading file: ' + err.message);
            }
            return;
          }
          if (res.writableEnded || res.destroyed) return;
          const headers = {
            'Content-Type': contentType,
            'Content-Length': data.length,
            'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000',
          };
          if (ext === '.html') {
            headers['Set-Cookie'] = `vf_token=${SESSION_SECRET}; Path=/; SameSite=Strict; HttpOnly`;
          }
          res.writeHead(200, headers);
          res.end(data);
        });
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    } catch (err) {
      if (!res.writableEnded && !res.destroyed) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error: ' + err.message);
      }
    }
  });

  server.keepAliveTimeout = 60000;
  server.headersTimeout = 65000;
  server.requestTimeout = 30000;

  const PREFERRED_PORT = 48321;

  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn('Puerto ' + PREFERRED_PORT + ' ocupado. Asignando puerto dinamico de respaldo...');
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        localServer = server;
        callback(port);
      });
    } else {
      console.error('Error en el servidor local:', err);
    }
  });

  server.listen(PREFERRED_PORT, '127.0.0.1', () => {
    const port = server.address().port;
    localServer = server;
    callback(port);
  });
}

function createWindow(port) {
  const iconPath = path.join(__dirname, '../public/favicon.png');

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'VisualForge Studio',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: '#1e1e1e',
    autoHideMenuBar: true,
    frame: false,
    titleBarStyle: 'hidden',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });

  Menu.setApplicationMenu(null);

  mainWindow.loadURL(`http://127.0.0.1:${port}/?_vf_token=${SESSION_SECRET}`);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window-maximized-change', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window-maximized-change', false);
  });

  // Restringir navegación interna: evitar que la app navegue a dominios externos dentro de Electron
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    try {
      const parsed = new URL(navigationUrl);
      const allowedOrigin = `http://127.0.0.1:${port}`;
      if (parsed.origin !== allowedOrigin) {
        event.preventDefault();
        if (navigationUrl.startsWith('http:') || navigationUrl.startsWith('https:')) {
          shell.openExternal(navigationUrl);
        }
      }
    } catch {
      event.preventDefault();
    }
  });

  // Abrir enlaces externos en el navegador predeterminado del sistema
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Handlers IPC para controles de ventana (Minimizar, Maximizar, Cerrar)
ipcMain.handle('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (!mainWindow) return false;
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
    return false;
  } else {
    mainWindow.maximize();
    return true;
  }
});

ipcMain.handle('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

// Validación estricta y control de rutas seguras para proyectos
function isPathSafeForProject(filePath) {
  if (!filePath || typeof filePath !== 'string') return false;
  try {
    const resolved = path.resolve(filePath);
    const ext = path.extname(resolved).toLowerCase();
    // Solo permitir extensiones estrictas de proyecto VisualForge
    if (ext !== '.vforge' && ext !== '.json') return false;

    // Bloquear directorios críticos del sistema operativo
    const winDir = (process.env.WINDIR || 'C:\\Windows').toLowerCase();
    const resolvedLower = resolved.toLowerCase();
    if (resolvedLower.startsWith(winDir)) return false;
    if (resolvedLower.includes('\\system32') || resolvedLower.includes('/system32')) return false;

    return true;
  } catch {
    return false;
  }
}

// Handlers IPC para Guardar y Abrir proyectos .vforge
ipcMain.handle('project-save', async (_event, { defaultName, content }) => {
  if (!mainWindow) return { canceled: true };
  try {
    const rawName = (defaultName || 'VisualForge_Project')
      .replace(/[<>:"/\\|?*]+/g, '_')
      .trim();
    const defaultPath = rawName.endsWith('.vforge') ? rawName : `${rawName}.vforge`;

    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Guardar Proyecto VisualForge',
      defaultPath,
      filters: [
        { name: 'VisualForge Project (*.vforge)', extensions: ['vforge'] },
        { name: 'JSON Project File (*.json)', extensions: ['json'] },
      ],
    });

    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }

    let targetPath = path.resolve(result.filePath);
    if (!targetPath.endsWith('.vforge') && !targetPath.endsWith('.json')) {
      targetPath += '.vforge';
    }

    if (!isPathSafeForProject(targetPath)) {
      return { canceled: true, error: 'Ubicación o extensión no permitida para el proyecto.' };
    }

    await fs.promises.writeFile(targetPath, content, 'utf8');
    return { canceled: false, filePath: targetPath };
  } catch (err) {
    return { canceled: true, error: err.message };
  }
});

// Guardado directo sin diálogo cuando el proyecto ya tiene ruta asignada
ipcMain.handle('project-save-direct', async (_event, { filePath, content }) => {
  try {
    if (!isPathSafeForProject(filePath)) {
      return { canceled: true, error: 'Ruta no válida o extensión no permitida (.vforge / .json)' };
    }
    const resolved = path.resolve(filePath);
    await fs.promises.writeFile(resolved, content, 'utf8');
    return { canceled: false, filePath: resolved };
  } catch (err) {
    return { canceled: true, error: err.message };
  }
});

ipcMain.handle('project-open', async () => {
  if (!mainWindow) return { canceled: true };
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Abrir Proyecto VisualForge',
      filters: [
        { name: 'VisualForge Project (*.vforge)', extensions: ['vforge'] },
        { name: 'JSON Project File (*.json)', extensions: ['json'] },
        { name: 'Todos los Archivos (*.*)', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return { canceled: true };
    }

    const filePath = result.filePaths[0];
    const content = await fs.promises.readFile(filePath, 'utf8');
    return { canceled: false, filePath, content };
  } catch (err) {
    return { canceled: true, error: err.message };
  }
});

ipcMain.handle('project-open-path', async (_event, filePath) => {
  try {
    if (!isPathSafeForProject(filePath)) {
      return { canceled: true, error: 'Ruta no válida o extensión no permitida (.vforge / .json)' };
    }
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
      return { canceled: true, error: 'El archivo de proyecto no existe o no es válido.' };
    }
    const content = await fs.promises.readFile(resolved, 'utf8');
    return { canceled: false, filePath: resolved, content };
  } catch (err) {
    return { canceled: true, error: err.message };
  }
});


  // Persistencia permanente de proyectos recientes en disco (userData)
  function getRecentsFilePath() {
    return path.join(app.getPath('userData'), 'recent-projects.json');
  }

  ipcMain.handle('project-get-recents', async () => {
    try {
      const recentsPath = getRecentsFilePath();
      if (fs.existsSync(recentsPath)) {
        const data = await fs.promises.readFile(recentsPath, 'utf8');
        const items = JSON.parse(data);
        if (Array.isArray(items)) return items;
      }
    } catch (err) {
      console.warn('Error al leer recent-projects.json:', err);
    }
    return [];
  });

  ipcMain.handle('project-save-recents', async (_event, items) => {
    try {
      if (!Array.isArray(items)) return false;
      const recentsPath = getRecentsFilePath();
      await fs.promises.writeFile(recentsPath, JSON.stringify(items, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.warn('Error al guardar recent-projects.json:', err);
      return false;
    }
  });

// Bloqueo de instancia única
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // Inyectar automaticamente el token de sesion en todas las peticiones internas de Electron al servidor local
    session.defaultSession.webRequest.onBeforeSendHeaders(
      { urls: ['http://127.0.0.1:*/*'] },
      (details, callback) => {
        details.requestHeaders['X-VF-Token'] = SESSION_SECRET;
        callback({ requestHeaders: details.requestHeaders });
      }
    );

    startLocalServer((port) => {
      createWindow(port);
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0 && localServer) {
        const port = localServer.address().port;
        createWindow(port);
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      if (localServer) {
        localServer.close();
      }
      app.quit();
    }
  });
}
