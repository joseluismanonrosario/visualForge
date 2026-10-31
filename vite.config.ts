import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

function iconifyLocalPlugin(): Plugin {
  const handler = (req: any, res: any, next: any) => {
    if (req.url && (req.url.startsWith('/@iconify/') || req.url.startsWith('/api/iconify/'))) {
      const rawSubpath = req.url.startsWith('/@iconify/')
        ? req.url.replace('/@iconify/', '')
        : req.url.replace('/api/iconify/', '');
      const cleanSubpath = rawSubpath.split('?')[0];

      let filePath = path.resolve(__dirname, 'node_modules/@iconify/json', cleanSubpath);
      if (!fs.existsSync(filePath) && !cleanSubpath.startsWith('json/')) {
        filePath = path.resolve(__dirname, 'node_modules/@iconify/json/json', cleanSubpath);
      }

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.statusCode = 500;
            res.end(err.message);
            return;
          }
          if (res.writableEnded || res.destroyed) return;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Content-Length', data.length);
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.end(data);
        });
        return;
      }
    }
    next();
  };

  return {
    name: 'iconify-local-loader',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    iconifyLocalPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
