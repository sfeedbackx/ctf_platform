# Setup Guide

## Prerequisites

### Required Software

1. **Node.js**: Version 25.x
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **Docker**: Version 20.10 or higher
   - Download from [docker.com](https://www.docker.com/get-started)
   - Verify installation: `docker --version`
   - Ensure Docker daemon is running: `docker ps`

3. **Docker Compose**: Usually included with Docker Desktop
   - Verify installation: `docker compose version`

4. **Git**: For cloning the repository
   - Download from [git-scm.com](https://git-scm.com/downloads)

## Assumptions

This setup guide makes the following technical assumptions:
- CTF challenges consist of exactly 2 containers: backend and frontend (no database container)
- Backend container is not exposed to the host (internal-only service)
- Frontend container is exposed on a host port and communicates with backend via Docker network
- Docker network `ctf_ssrf_race` must exist and match the network name in migration script
- CTF challenge images are built separately and named exactly as specified in migration script

## Backend Setup

### 1. Clone the Repository

```bash
git clone https://github.com/sfeedbackx/ctf_platform.git
cd ctf_platform/backend
```

### 2. Build CTF Challenge Images

Before starting the backend, you need to build the frontend and backend images for the CTF challenge. These images are referenced in the migration script.

**Clone the CTF challenge repository:**
```bash
cd ..
git clone https://github.com/sfeedbackx/ssrf-race.git
cd ssrf-race
```

**Build the images with the exact names used in migration:**
```bash
# Build backend image
cd backend
docker build -t ctf_ssrf_race_backend .

# Build frontend image
cd ../frontend
docker build -t ctf_ssrf_race_frontend .
```

**Verify images are built:**
```bash
docker images | grep ctf_ssrf_race
```

You should see:
- `ctf_ssrf_race_backend`
- `ctf_ssrf_race_frontend`

**Note**: The image names must match exactly what's in the migration script (`migrateScript.ts`):
- Backend: `ctf_ssrf_race_backend`
- Frontend: `ctf_ssrf_race_frontend`

### 3. Configure Environment Variables

**Copy the example environment file:**
```bash
cd ../../ctf_platform/backend
cp env.example .env
```

**Edit `.env` file:**
```env
# Server Configuration
PORT=3000
NODE_ENV=development
SERVER_HOST=localhost

# Database Configuration
# For docker-compose setup (recommended)
DB_URL=mongodb://root:password@mongodb:27017/ctf_platform?authSource=admin

# JWT Configuration
SECRET=your-secret-key-change-this-in-production-minimum-32-characters
MAX_AGE=604800000

# Docker Configuration
# Leave empty when using docker-compose with docker-socket-proxy
DOCKER_HOST=
```

**Security Note**: 
- Never commit `.env` file to version control
- Use a strong, random `SECRET` in production
- Use environment-specific database URLs

### 4. Create Docker Network

**Create the Docker network used by CTF containers (must match migration script):**
```bash
docker network create ctf_ssrf_race
```

**Verify network was created:**
```bash
docker network ls | grep ctf_ssrf_race
```

### 5. Configure Docker Socket Proxy for Development

**For development, uncomment the ports section in `compose.yaml` for docker-socket-proxy:**

In `backend/compose.yaml`, find the `docker-socket-proxy` service and uncomment the ports:
```yaml
docker-socket-proxy:
    container_name: dockerproxy
    ports:
      - "2375:2375"
    environment:
    ...
```

**Note**: The docker-socket-proxy ports are commented by default. Uncomment them only for development. In production, do not expose the Docker socket.

### 6. Start Database and Docker Proxy with Docker Compose

**Start services:**
```bash
docker compose up -d mongo docker-socket-proxy
```

**Verify services are running:**
```bash
docker compose ps
```

You should see:
- `mongodb` - running and healthy
- `dockerproxy` - running

**Note about Docker Socket Proxy:**
The docker-socket-proxy service exposes Docker API with limited permissions for security. The proxy is configured to allow:
- Container creation, start, stop, and inspection
- POST requests (required for container operations)
- Image information reading
- Network operations

### 7. Run Database Migration

**Install dependencies first:**
```bash
npm install
```

**Run the migration script to seed the database:**
```bash
npm run migrate
```

This will:
- Connect to the database
- Clean the CTF collection
- Insert the CTF challenge with container configurations

**Verify migration:**

You should see the SSRF-RACE challenge document.

### 8. Start the Backend Server

**Development Mode (with hot reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm run build
npm start
```

The server should start on `http://localhost:3000` (or your configured PORT).

**Verify Installation:**
```bash
curl http://localhost:3000
# Should return: "hello world"

curl http://localhost:3000/api/v1/ctfs
# Should return: [] or list of CTFs
```

### 9. Using Docker Compose for Full Stack (Optional)

If you want to run the backend in a container as well:


**Start all services:**
```bash
docker compose up -d
```

**View logs:**
```bash
docker compose logs -f app
```


## Frontend Setup

The frontend is a React application. Setup instructions will be added when the frontend is implemented.

## Development Workflow

### Running Tests

```bash
# Lint code
npm run lint

# Format code
npm run format

# Check formatting
npm run check
```

### Project Structure

```
ctf_platform/
├── backend/              # Backend API server
│   ├── src/             # Source code
│   ├── dist/            # Compiled JavaScript (after build)
│   ├── .env             # Environment variables (not in git)
│   ├── env.example      # Example environment file
│   ├── compose.yaml     # Docker Compose configuration
│   └── package.json
├── frontend/            # Frontend React application (to be implemented)
└── docs/                # Documentation
```

### Common Issues

#### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change PORT in .env
```

#### Docker Connection Error

```bash
# Ensure Docker daemon is running
docker ps

# Check docker-socket-proxy is running
docker compose ps docker-socket-proxy

# Check Docker socket permissions (Linux)
sudo usermod -aG docker $USER
# Log out and log back in
```

#### MongoDB Connection Error

```bash
# Check MongoDB is running
docker compose ps mongo

# Check MongoDB logs
docker compose logs mongo

# Verify connection string in .env matches docker-compose service name
# Should be: mongodb://root:password@mongodb:27017/ctf_platform?authSource=admin
```

#### Migration Script Fails

```bash
# Ensure MongoDB is running and healthy
docker compose ps mongo

# Check database connection
docker exec -it mongodb mongosh -u root -p password --authenticationDatabase admin

# Verify CTF images are built
docker images | grep ctf_ssrf_race

# Re-run migration
npm run migrate
```

#### TypeScript Compilation Errors

```bash
# Clean and rebuild
rm -rf dist/
npm run build

# Check tsconfig.json settings
```

#### CTF Images Not Found

If you get errors about missing Docker images when creating CTF instances:

```bash
# Verify images are built with correct names
docker images | grep ctf_ssrf_race

# Rebuild if needed
cd ../ssrf-race/backend
docker build -t ctf_ssrf_race_backend .

cd ../frontend
docker build -t ctf_ssrf_race_frontend .
```

## Production Deployment

### Current Status

**Warning**: The application is not production-ready. The following must be addressed:

1. **CORS Configuration**: Add CORS middleware
2. **Rate Limiting**: Implement rate limiting middleware
3. **Database Security**: Move to AWS Secrets Manager
4. **HTTPS**: Configure SSL/TLS certificates
5. **Environment Variables**: Use secure secret management
6. **Monitoring**: Add logging and monitoring
7. **Error Handling**: Improve error messages (don't expose internals)
8. **Docker Socket Security**: Do NOT expose Docker socket in production. Use proper Docker API security or remove docker-socket-proxy.

### Important Production Notes

**Docker Socket Proxy:**
- The docker-socket-proxy is for DEVELOPMENT ONLY
- In production, do NOT expose the Docker socket
- Use proper Docker API security or configure Docker daemon securely
- Consider using Docker API with authentication and TLS

**Environment Variables:**
- Never commit `.env` files to version control
- Use environment-specific configuration
- Use secrets management (AWS Secrets Manager, HashiCorp Vault, etc.)

**Database:**
- Use strong, unique passwords
- Enable MongoDB authentication
- Restrict network access
- Use encryption at rest
- Regular backups

## Next Steps

1. Build CTF challenge images from ssrf-race repository
2. Configure environment variables
3. Start database and proxy with docker-compose
4. Run migration script
5. Start backend server
6. Implement frontend React application
7. Add CORS middleware to backend
8. Implement rate limiting
9. Set up production environment
10. Migrate to AWS infrastructure
