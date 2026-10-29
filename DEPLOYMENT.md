# Deployment & Operations Guide

## 1. Quick Start with Docker Compose (Recommended)

Clone the repository and start the container:

```bash
git clone https://github.com/0xyz-exe/privacy-first-analytics.git
cd privacy-first-analytics
cp .env.example .env
docker compose up -d
```

The application will be live at `http://localhost:3000`.

---

## 2. Production Environment Variables

Ensure the following variables are configured in `.env`:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime mode | `production` |
| `PORT` | Web server listening port | `3000` |
| `JWT_SECRET` | Cryptographic secret for signing sessions | `min-32-chars-random-secret` |
| `PRIVACY_SALT` | Daily rotating salt for visitor hash | `random-unique-salt-token` |
| `DATA_DIR` | SQLite database directory path | `/app/data` |
| `DATABASE_PATH` | Full SQLite file path | `/app/data/analytics.db` |

---

## 3. Reverse Proxy Configuration (Nginx / Caddy)

### Nginx Example:

```nginx
server {
    server_name analytics.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 4. Backup & Disaster Recovery

### Backing up Database:
```bash
# SQLite live backup using safe VACUUM INTO
sqlite3 data/analytics.db "VACUUM INTO 'data/backup-$(date +%Y%m%d).db';"
```

### Restoring Database:
```bash
cp data/backup-YYYYMMDD.db data/analytics.db
docker compose restart
```
