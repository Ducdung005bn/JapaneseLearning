# Docker setup

This repository includes Dockerfiles for the backend and frontend plus a `docker-compose.yml` to run all services locally.

Quick start (PowerShell):

```powershell
# Build images and start services
docker compose up --build

# Stop
docker compose down
```

Notes:
- The backend uses `./backend/.env.docker` for runtime environment variables. Fill `DB_URI` if you want to use an external MongoDB Atlas instance. To use the included MongoDB container set `DB_URI=mongodb://mongo:27017/japanese`.
- Frontend is served by nginx on port 5173 mapped to container port 80.
- Backend maps port 3000.
- Uploads folder is mounted from `backend/uploads` to persist avatars and other uploaded files.
