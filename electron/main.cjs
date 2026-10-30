const { app, BrowserWindow, Menu, shell } = require('electron');
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

// Iniciar servidor local embebido para soporte completo de Iconify y assets
function startLocalServer(callback) {
  const distDir = path.join(__dirname, '../dist');
  const iconifyDir = path.join(__dirname, '../node_modules/@iconify/json');

  const server = http.createServer((req, res) => {
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
          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=86400',
          });
          fs.createReadStream(iconPath).pipe(res);
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
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000',
        });
        fs.createReadStream(filePath).pipe(res);
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error: ' + err.message);
    }
  });

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
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  Menu.setApplicationMenu(null);

  mainWindow.loadURL(`http://127.0.0.1:${port}`);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
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
