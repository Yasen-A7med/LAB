import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-ignore
import infoHandler from './api/yd/info.js'
// @ts-ignore
import downloadHandler from './api/yd/download.js'

// Custom Vite plugin to handle /api/yd routes in dev mode
const ydApiPlugin = () => ({
  name: 'yd-api-plugin',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      if (url.pathname === '/api/yd/info') {
        try {
          await infoHandler(req, res);
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }
      if (url.pathname === '/api/yd/download') {
        try {
          await downloadHandler(req, res);
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }
      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ydApiPlugin()],
})
