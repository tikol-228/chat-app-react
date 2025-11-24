import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import url from 'url';
import fs from 'fs';
import connectDB from './db.js';
import bcrypt from 'bcryptjs'
import User from './models/User.js'

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
  // We'll set CORS headers per-request and allow credentials for cookies
  const origin = req.headers.origin || '*'
  const apiHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true'
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
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { email, password } = payload;
        if (!email || !password) {
          res.writeHead(400, { ...apiHeaders, 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'Email and password are required' }));
          return;
        }

        // ensure DB connected
        try { await connectDB() } catch (e) { /* already logs */ }

        // check existing
        const existing = await User.findOne({ email }).lean().exec();
        if (existing) {
          res.writeHead(409, { ...apiHeaders, 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'User already exists' }));
          return;
        }

        const hashed = await bcrypt.hash(password, 10)
        const user = await User.create({ email, password: hashed })

        res.writeHead(201, { ...apiHeaders, 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true, user: { id: user._id, email: user.email } }));
      } catch (e) {
        console.error('Register error', e)
        res.writeHead(400, { ...apiHeaders, 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Invalid JSON or server error' }));
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
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { email, password } = payload;
        if (!email || !password) {
          res.writeHead(400, { ...apiHeaders, 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'Email and password are required' }));
          return;
        }

        try { await connectDB() } catch (e) { }

        const user = await User.findOne({ email }).exec();
        if (!user) {
          res.writeHead(401, { ...apiHeaders, 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'Invalid credentials' }));
          return;
        }

        const match = await bcrypt.compare(password, user.password)
        if (!match) {
          res.writeHead(401, { ...apiHeaders, 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'Invalid credentials' }));
          return;
        }

        // set a simple auth cookie (not secure; for demo only)
        const cookie = `auth=1; Path=/; HttpOnly`;
        res.writeHead(200, { ...apiHeaders, 'Content-Type': 'application/json; charset=utf-8', 'Set-Cookie': cookie })
        res.end(JSON.stringify({ ok: true, user: { id: user._id, email: user.email } }))
      } catch (e) {
        console.error('Login error', e)
        res.writeHead(400, { ...apiHeaders, 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Invalid JSON or server error' }));
      }
    });

    return;
  }

  // По умолчанию отдаём index.html для "/"
  let attemptedPath;
  // Simple auth guard on the server: if user has no auth cookie, redirect to /auth
  // Allow API, socket and static asset requests through.
  const isApi = pathname.startsWith('/api/')
  const isSocket = pathname.startsWith('/socket.io')
  const isAsset = pathname.startsWith('/assets/') || pathname.startsWith('/static/') || pathname.endsWith('.js') || pathname.endsWith('.css') || pathname.endsWith('.png') || pathname.endsWith('.svg') || pathname.endsWith('.ico')

  // parse cookies
  const cookies = (req.headers.cookie || '').split(';').map(c => c.trim()).filter(Boolean).reduce((acc, cur) => {
    const idx = cur.indexOf('=')
    if (idx === -1) return acc
    const key = cur.slice(0, idx)
    const val = cur.slice(idx + 1)
    acc[key] = val
    return acc
  }, {})

  // if request is to the login/logout API, handle below
  if (pathname === '/api/login' || pathname === '/api/logout') {
    attemptedPath = null // handled specially
  } else if (!isApi && !isSocket && !isAsset && !(cookies.auth === '1') && pathname !== '/auth') {
    // redirect unauthenticated user to /auth
    res.writeHead(302, { Location: '/auth' })
    res.end()
    console.log('Redirecting unauthenticated request to /auth:', pathname)
    return
  } else {
    if (pathname === '/' || pathname === '') {
      attemptedPath = path.join(DIST_DIR, 'index.html');
    } else {
      attemptedPath = safeJoin(DIST_DIR, pathname);
    }
  }

  // Handle simple login/logout API
  if (pathname === '/api/login') {
    // collect body
    let body = ''
    req.on('data', chunk => { body += chunk.toString() })
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}')
        const username = data.username || 'user'
        // set a simple auth cookie (not secure; for demo only)
        const cookie = `auth=1; Path=/; HttpOnly`;
        res.writeHead(200, { 'Content-Type': 'application/json', 'Set-Cookie': cookie })
        res.end(JSON.stringify({ ok: true, username }))
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: false }))
      }
    })
    return
  }

  if (pathname === '/api/logout') {
    // clear cookie
    res.writeHead(200, { 'Content-Type': 'application/json', 'Set-Cookie': 'auth=0; Path=/; HttpOnly; Max-Age=0' })
    res.end(JSON.stringify({ ok: true }))
    return
  }

  //mongodb

  connectDB();

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
