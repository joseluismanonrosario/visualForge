const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
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
  const distDir = path.join(__dirname, '../dist');
  const iconifyDir = path.join(__dirname, '../node_modules/@iconify/json');

  const server = http.createServer((req, res) => {
    // Evitar que errores no capturados en el socket cierren el servidor
    req.on('error', () => {});
    res.on('error', () => {});

    try {
      const parsedUrl = new URL(req.url, 'http://127.0.0.1');
      let pathname = decodeURIComponent(parsedUrl.pathname);

      // Manejo de iconos locales de Iconify
      if (pathname.startsWith('/@iconify/') || pathname.startsWith('/api/iconify/')) {
        let sub = pathname.replace(/^\/(@iconify|api\/iconify)\/?/, '');
        let iconPath = path.join(iconifyDir, sub);
        if (!fs.existsSync(iconPath) && !sub.startsWith('json/')) {
          iconPath = path.join(iconifyDir, 'json', sub);
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

      // Archivos estáticos de dist
      let filePath = path.join(distDir, pathname === '/' ? 'index.html' : pathname);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distDir, 'index.html');
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
          res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': data.length,
            'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000',
          });
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

  server.listen(0, '127.0.0.1', () => {
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
      sandbox: false,
    },
  });

  Menu.setApplicationMenu(null);

  mainWindow.loadURL(`http://127.0.0.1:${port}`);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window-maximized-change', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window-maximized-change', false);
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

    let targetPath = result.filePath;
    if (!targetPath.endsWith('.vforge') && !targetPath.endsWith('.json')) {
      targetPath += '.vforge';
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
    if (!filePath || typeof filePath !== 'string') {
      return { canceled: true, error: 'Ruta no válida para guardado directo' };
    }
    await fs.promises.writeFile(filePath, content, 'utf8');
    return { canceled: false, filePath };
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
    if (!filePath || typeof filePath !== 'string') {
      return { canceled: true, error: 'Ruta de archivo no especificada' };
    }
    const content = await fs.promises.readFile(filePath, 'utf8');
    return { canceled: false, filePath, content };
  } catch (err) {
    return { canceled: true, error: err.message };
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
