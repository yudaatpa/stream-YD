# Stream by Yuda v2

Dashboard streaming profesional (Node.js + EJS + SQLite + FFmpeg) dengan:
- 🔐 Login admin via `.env`
- 🎬 Start/Stop stream
- 🧠 Auto-stop 0 viewers
- 🔄 Keep-alive grace & max overtime
- 👁️ Real-time viewers counter
- 🌙 Dark UI

## Quick Start
```bash
npm install
cp .env.example .env
# (opsional) ganti ADMIN_USER/ADMIN_PASS di .env
node app.js
# buka http://localhost:7575
```

## Docker
```bash
docker compose up --build -d
```

## ENV
- `PORT=7575`
- `ADMIN_USER=admin`
- `ADMIN_PASS=yuda123`
- `SESSION_SECRET=ubah_ini`

## Struktur
Lihat folder: `middleware/`, `services/`, `views/`, `utils/`, `scripts/`, `db/`.
