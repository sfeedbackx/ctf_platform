# Setup Guide

This guide provides step-by-step instructions for setting up the CTF Platform for local development.

## Prerequisites

- **Node.js**: Version 25.x (Recommended)
- **Docker**: For running MongoDB and challenge containers
- **Git**: For cloning repositories

---

## 1. Local Network Setup

The CTF Platform requires a dedicated Docker network for challenges to communicate securely.

```bash
docker network create ctf_ssrf_race
```

---

## 2. Challenge Image Preparation

Before starting the platform, you must build the challenge images.

1. **Clone the Challenge Repository**:
   ```bash
   git clone https://github.com/sfeedbackx/ssrf-race.git
   cd ssrf-race
   ```

2. **Build Challenge Images**:
   ```bash
   # Build backend
   cd backend && docker build -t ctf_ssrf_race_backend .
   # Build frontend
   cd ../frontend && docker build -t ctf_ssrf_race_frontend .
   ```

---

## 3. Infrastructure Initialization

Use Docker Compose to start essential services like MongoDB and the Docker access proxy.

1. **Navigate to Backend**:
   ```bash
   cd ctf_platform/backend
   ```

2. **Configure Compose**:
   Ensure `compose.yaml` has the ports exposed for development as needed.

3. **Start Services**:
   ```bash
   # From root or backend (until moved to root)
   docker compose up -d
   ```
   > [!NOTE]
   > For local development, `compose.yaml` (currently in `backend/`) starts the entire platform, including the Frontend as `app-frontend`.

---

## 4. Backend Configuration

1. **Environment Setup**:
   ```bash
   cp env.example .env
   ```
   **Note**: The default `DB_URL` in `env.example` assumes you are running the backend on your host while MongoDB is in Docker. If running both in Docker, use the `mongodb` service name.

2. **Install & Migrate**:
   ```bash
   npm install
   npm run migrate  # Seeds the database with CTF challenges
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## 5. Frontend Configuration

1. **Navigate to Frontend**:
   ```bash
   cd ../frontend
   ```

2. **Environment Setup**:
   ```bash
   cp env.example .env
   ```

3. **Install & Start**:
   ```bash
   npm install
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

---

## Architecture Diagram

```text
       +------------------+          +------------------+
       |   User Browser   |          |  Docker Daemon   |
       +--------+---------+          +--------+---------+
                |                            |
                | (HTTP/8080)                | (Docker API)
                v                            v
       +------------------+   Internal   +------------------+
       |  CTF Frontend    | <----------> |   CTF Backend    |
       |   (Exposed)      |   Network    |   (Internal)     |
       +------------------+ (ctf_ssrf)   +------------------+
                ^                            ^
                |                            |
                +-------------+--------------+
                              |
                     +--------+---------+
                     |  CTF Platform    |
                     |     Backend      |
                     +------------------+
```

---

## Common Issues

### MongoDB Connection
If the backend fails to connect to MongoDB, ensure the `DB_URL` in `.env` matches the credentials in `compose.yaml`. The default is `mongodb://root:password@mongodb:27017/ctf_platform?authSource=admin`.

### Docker Error
Ensure the Docker daemon is running and the `docker-socket-proxy` container is active if you are using it.
