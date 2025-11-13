import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import url from 'url';
import fs from 'fs';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// <-- Укажи здесь абсолютный путь к своей папке dist (Windows)
// Экранируй обратные слэши
const DIST_DIR = path.resolve('C:\\Users\\kod68\\OneDrive\\Документы\\chat-app react\\my-app\\dist');

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.mjs': return 'application/javascript; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    case '.webp': return 'image/webp';
    case '.ico': return 'image/x-icon';
    case '.woff': return 'font/woff';
    case '.woff2': return 'font/woff2';
    default: return 'application/octet-stream';
  }
}

// безопасный join: предотвращает path traversal
function safeJoin(base, targetPath) {
  try {
    const decoded = decodeURIComponent(targetPath);
    const normalized = path.normalize(path.join(base, decoded));
    if (!normalized.startsWith(base)) return null;
    return normalized;
  } catch (e) {
    return null;
  }
}

const server = http.createServer((req, res) => {
  const host = req.headers.host || 'localhost';
  let pathname;
  try {
    const parsed = new URL(req.url || '/', `http://${host}`);
    pathname = parsed.pathname;
  } catch (e) {
    pathname = req.url || '/';
  }

  // Логируем запросы для отладки
  console.log('Request:', pathname);

  // Simple API: register user
  const apiHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (pathname === '/api/register') {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, apiHeaders);
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      res.writeHead(405, { ...apiHeaders, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Method not allowed');
      return;
    }

    // collect body
    let body = '';
    req.on('data', (chunk) => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { email, password } = payload;
        if (!email || !password) {
          res.writeHead(400, { ...apiHeaders, 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'Email and password are required' }));
          return;
        }

        const dbPath = path.join(__dirname, 'db.json');
        // read current db
        fs.readFile(dbPath, 'utf8', (rErr, data) => {
          let store = {};
          try {
            store = data ? JSON.parse(data) : {};
          } catch (e) {
            store = {};
          }

          if (!Array.isArray(store.users)) store.users = [];

          const id = Date.now();
          const user = { id, email, password };
          store.users.push(user);

          fs.writeFile(dbPath, JSON.stringify(store, null, 2), 'utf8', (wErr) => {
            if (wErr) {
              console.error('DB write error:', wErr);
              res.writeHead(500, { ...apiHeaders, 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ error: 'Failed to write to DB' }));
              return;
            }

            res.writeHead(201, { ...apiHeaders, 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ ok: true, user }));
          });
        });
      } catch (e) {
        res.writeHead(400, { ...apiHeaders, 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });

    return;
  }

  if (pathname === '/api/login') {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, apiHeaders);
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      res.writeHead(405, { ...apiHeaders, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Method not allowed');
      return;
    }

    let body = '';
    req.on('data', (chunk) => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { email, password } = payload;
        if (!email || !password) {
          res.writeHead(400, { ...apiHeaders, 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'Email and password are required' }));
          return;
        }

        const dbPath = path.join(__dirname, 'db.json');
        fs.readFile(dbPath, 'utf8', (rErr, data) => {
          let store = {};
          try {
            store = data ? JSON.parse(data) : {};
          } catch (e) {
            store = {};
          }

          if (!Array.isArray(store.users)) store.users = [];

          const existing = store.users.find(u => u.email === email);
          if (existing) {
            res.writeHead(200, { ...apiHeaders, 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ ok: true, message: 'User exists', user: existing }));
            return;
          }

          const id = Date.now();
          const user = { id, email, password };
          store.users.push(user);

          fs.writeFile(dbPath, JSON.stringify(store, null, 2), 'utf8', (wErr) => {
            if (wErr) {
              console.error('DB write error:', wErr);
              res.writeHead(500, { ...apiHeaders, 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ error: 'Failed to write to DB' }));
              return;
            }

            res.writeHead(201, { ...apiHeaders, 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ ok: true, message: 'Created user', user }));
          });
        });
      } catch (e) {
        res.writeHead(400, { ...apiHeaders, 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });

    return;
  }

  // По умолчанию отдаём index.html для "/"
  let attemptedPath;
  if (pathname === '/' || pathname === '') {
    attemptedPath = path.join(DIST_DIR, 'index.html');
  } else {
    attemptedPath = safeJoin(DIST_DIR, pathname);
  }

  if (!attemptedPath) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }

  // Если путь указывает на директорию — пытаемся отдать index.html внутри неё
  fs.stat(attemptedPath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      attemptedPath = path.join(attemptedPath, 'index.html');
    }

    // Проверяем наличие файла
    fs.stat(attemptedPath, (err2, stats2) => {
      if (err2 || !stats2 || !stats2.isFile()) {
        // Файл не найден — отдаём index.html (SPA fallback)
        const indexPath = path.join(DIST_DIR, 'index.html');
        fs.readFile(indexPath, (ie, idata) => {
          if (ie) {
            console.error('Index read error:', ie);
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Server error');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(idata);
        });
        console.log('Not found, fallback to index.html for:', attemptedPath);
        return;
      }

      // Файл найден — отдаем стримом
      const contentType = getContentType(attemptedPath);
      res.writeHead(200, { 'Content-Type': contentType });
      const stream = fs.createReadStream(attemptedPath);
      stream.on('error', (streamErr) => {
        console.error('Stream error:', streamErr);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Server error');
      });
      stream.pipe(res);
      console.log('Served:', attemptedPath);
    });
  });
});

// auth

const dbAddData = () => {
  
}


// Socket.io
const io = new Server(server, {
  cors: { origin: '*' } // в продакшне укажи конкретный origin
});

io.on('connection', (socket) => {
  const userId = Math.floor(Math.random() * 10000);
  let messageData = 
  socket.data.userId = userId;
  console.log('Socket connected, userId =', userId);
  socket.emit('userId', userId);

  socket.on('message', () => {
    socket.emit(messageData)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected, userId =', userId);
  });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 8081;
server.listen(PORT, () => {
  console.log(`Server listening on http://127.0.0.1:${PORT}`);
  console.log('Serving static files from:', DIST_DIR);
});
