// Stream by Yuda v2 - App entry
const path = require('path');
const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');
dotenv.config();

const { startStream, stopStream } = require('./services/streamService');
const { monitorStream } = require('./services/schedulerService');

const app = express();
const PORT = process.env.PORT || 7575;

// DB
const db = new sqlite3.Database(path.join(__dirname, 'db', 'database.sqlite'));
db.run(`CREATE TABLE IF NOT EXISTS schedules(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, server TEXT, stream_key TEXT, file TEXT,
  start TEXT, end TEXT, status TEXT,
  watch_url TEXT, autostop_h INTEGER,
  keepalive INTEGER, grace_min INTEGER, max_h INTEGER,
  viewers INTEGER DEFAULT 0, max_viewers INTEGER DEFAULT 0
)`);

// Views & static
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'streambyyuda_dev',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000*60*60*12 } // 12h
}));

const { apiLimiter } = require('./middleware/limiter');
// Rate limit basic
const limiter = rateLimit({ windowMs: 60*1000, max: 120 });
app.use(apiLimiter);

// Simple auth middleware (placeholder, real file added in Batch 2)
function ensureAuth(req, res, next) {
  if (req.session && req.session.loggedIn) return next();
  return res.redirect('/login');
}

// ROUTES
app.get('/login', (req, res) => {
  res.render('login', { title: 'Login - Stream by Yuda', error: null });
});

app.post('/login', (req, res) => {
  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks).toString();
    const params = new URLSearchParams(body);
    const user = params.get('username');
    const pass = params.get('password');
    if (user === (process.env.ADMIN_USER||'admin') && pass === (process.env.ADMIN_PASS||'yuda123')) {
      req.session.loggedIn = true;
      return res.redirect('/');
    }
    return res.render('login', { title: 'Login - Stream by Yuda', error: 'Username/password salah' });
  });
});

app.get('/logout', (req,res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// Dashboard
app.get('/', ensureAuth, (req, res) => {
  db.all('SELECT * FROM schedules ORDER BY id DESC', (err, rows) => {
    const stats = {
      live: rows.filter(r=>r.status==='Live').length,
      scheduled: rows.filter(r=>r.status==='Scheduled').length,
      totalViewers: rows.reduce((a,b)=>a+(b.viewers||0),0)
    };
    res.render('dashboard', { title: 'Stream by Yuda', streams: rows, stats, session: req.session });
  });
});

app.get('/add', ensureAuth, (req,res)=>res.render('add', { title: 'Tambah Jadwal', session: req.session }));

app.post('/add', ensureAuth, (req,res) => {
  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks).toString();
    const p = new URLSearchParams(body);
    const values = [
      p.get('name'), p.get('server'), p.get('key'), p.get('file'),
      p.get('start'), p.get('end'), 'Scheduled', p.get('watch_url'),
      parseInt(p.get('autostop_h')||'5',10),
      p.get('keepalive') ? 1 : 0,
      parseInt(p.get('grace_min')||'10',10),
      parseInt(p.get('max_h')||'12',10)
    ];
    db.run(`INSERT INTO schedules(name,server,stream_key,file,start,end,status,watch_url,
      autostop_h,keepalive,grace_min,max_h) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`, values, () => res.redirect('/'));
  });
});

app.get('/start/:id', ensureAuth, (req,res) => {
  db.get('SELECT * FROM schedules WHERE id=?', [req.params.id], (e, row) => {
    if (!row) return res.redirect('/');
    const proc = startStream(row.file, row.server, row.stream_key);
    row.proc = proc; row.status = 'Live';
    db.run('UPDATE schedules SET status="Live" WHERE id=?', [row.id]);
    monitorStream(row, db);
    res.redirect('/');
  });
});

app.get('/stop/:id', ensureAuth, (req,res) => {
  db.get('SELECT * FROM schedules WHERE id=?', [req.params.id], (e, row) => {
    if (!row) return res.redirect('/');
    stopStream(row);
    db.run('UPDATE schedules SET status="Stopped" WHERE id=?', [row.id]);
    res.redirect('/');
  });
});

// Minimal placeholder views (completed in later batches)
const fs = require('fs');
const loginView = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Login</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>body{background:#0d1117;color:#e5e7eb}</style></head>
<body class="p-6">
  <div class="max-w-sm mx-auto bg-gray-800 p-6 rounded">
    <h1 class="text-xl font-bold mb-4">Login - Stream by Yuda</h1>
    ${'${error?`<p class="text-red-400 mb-3">${error}</p>`:""}'}
    <form method="post" action="/login" class="space-y-3">
      <input name="username" placeholder="Username" class="w-full bg-gray-900 p-2 rounded">
      <input type="password" name="password" placeholder="Password" class="w-full bg-gray-900 p-2 rounded">
      <button class="bg-green-600 px-3 py-1 rounded">Masuk</button>
    </form>
  </div>
</body></html>`;
if (!fs.existsSync(path.join(__dirname,'views','login.ejs'))) {
  fs.writeFileSync(path.join(__dirname,'views','login.ejs'), loginView);
}

app.listen(PORT, () => {
  console.log(`🚀 Stream by Yuda v2 running at http://0.0.0.0:${PORT}`);
});
