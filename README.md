# CTF Platform

A secure platform for hosting and solving Capture The Flag (CTF) challenges. Isolated Docker containers are provided for each user instance to ensure a clean solving environment.

## Quick Start (Local Development)

### 1. Build Challenge Images
```bash
git clone https://github.com/sfeedbackx/ssrf-race.git
cd ssrf-race/backend && docker build -t ctf_ssrf_race_backend .
cd ../frontend && docker build -t ctf_ssrf_race_frontend .
docker network create ctf_ssrf_race
```
> [!NOTE]
> You can use the bash script in backend/scripts/ctfImagePrep.sh

### 2. Prepare Infrastructure
```bash
cd ctf_platform/backend
docker compose up -d mongo docker-socket-proxy
```

### 3. Start Backend
```bash
cp env.example .env
npm install
npm run migrate
npm run dev
```

### 4. Start Frontend
```bash
cd ../frontend
cp env.example .env
npm install
npm run dev
```

For detailed instructions, see the **[Setup Guide](docs/setup.md)**.

## Project Structure

- `backend/`: Node.js Express API.
- `frontend/`: React application.
- `docs/`: Technical documentation and architecture.

## Documentation Index

- **[Full Setup Guide](docs/setup.md)**
- **[Architecture](docs/architecture.md)**
- **[API Reference](docs/api.md)**
- **[Security Overview](docs/security.md)**

## Contributing
Please refer to our documentation before submitting pull requests. Ensure all code remains linter-compliant and includes necessary tests.
