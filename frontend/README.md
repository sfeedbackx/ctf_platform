# CTF Platform

A platform powered by **AWS** to host and solve **Capture The Flag (CTF)** challenges. This platform allows users to launch isolated Docker containers for each challenge, providing a secure environment for solving CTF problems.

## Features

- User authentication and authorization (JWT)
- Dynamic Docker container management for CTF challenges
- Flag submission and tracking
- Automatic cleanup of expired instances
- User progress tracking

## Quick Start

### Prerequisites

- Node.js 25.x
- MongoDB 6.0+
- Docker 20.10+

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/sfeedbackx/ctf_platform.git
   cd ctf_platform/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=3000
   NODE_ENV=development
   SERVER_HOST=localhost
   DB_URL=mongodb://localhost:27017/ctf_platform
   SECRET=your-secret-key-change-this-in-production
   MAX_AGE=604800000
   ```

4. **Start MongoDB and Docker**
   ```bash
   # Start MongoDB (Linux/Mac)
   sudo systemctl start mongod
   
   # Verify Docker is running
   docker ps
   ```

5. **Run the server**
   ```bash
   # Development mode (with hot reload)
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

The backend API will be available at `http://localhost:3000`

### Frontend Setup

**Note**: The frontend is a React application. Setup instructions:

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   # or REACT_APP_API_URL (depending on your build tool)
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Configure CORS in backend**
   
   **Important**: CORS is currently not configured. You need to add CORS middleware:
   
   ```bash
   cd backend
   npm install cors @types/cors
   ```
   
   Then update `backend/src/app.ts`:
   ```typescript
   import cors from 'cors';
   
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
     credentials: true
   }));
   ```

## Project Structure

```
ctf_platform/
├── backend/              # Backend API server (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/      # Configuration and database setup
│   │   ├── controller/  # Business logic
│   │   ├── middlewares/ # Express middlewares
│   │   ├── models/      # Mongoose models
│   │   ├── router/      # Route definitions
│   │   ├── types/       # TypeScript types
│   │   ├── utils/       # Utility functions
│   │   ├── app.ts       # Express app configuration
│   │   └── server.ts    # Server entry point
│   ├── scripts/         # Migration scripts
│   └── package.json
├── frontend/            # Frontend application (to be implemented)
└── docs/                # Documentation
    ├── architecture.md  # System architecture
    ├── api.md          # API documentation
    ├── setup.md        # Detailed setup guide
    ├── sequences.md    # Sequence diagrams
    └── security.md     # Security considerations
```

## Naming Convention

- Constants: `UPPER_SNAKE_CASE`
- Variables & Functions: `camelCase`
- Classes: `UpperCamelCase`

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Architecture](docs/architecture.md)**: System architecture and design decisions
- **[API Documentation](docs/api.md)**: Complete API reference
- **[Setup Guide](docs/setup.md)**: Detailed setup instructions
- **[Sequence Diagrams](docs/sequences.md)**: Visual flow diagrams
- **[Security](docs/security.md)**: Security considerations and gaps

## Important Security Notes

**Before Production Deployment**:

1. **CORS**: Not configured - must be added for frontend communication
2. **Rate Limiting**: Not implemented - critical for preventing abuse
3. **Database Security**: Database is exposed until AWS migration - use strong credentials and restrict access

See [Security Documentation](docs/security.md) for details.

## API Endpoints

### Authentication
- `POST /api/v1/signup` - Create user account
- `POST /api/v1/login` - Authenticate user
- `POST /api/v1/logout` - Logout user

### CTF Challenges
- `GET /api/v1/ctfs` - List all CTF challenges
- `POST /api/v1/ctfs/:id/instances` - Start CTF instance
- `GET /api/v1/ctfs/instances` - Get active instance
- `PATCH /api/v1/ctfs/instances/:id` - Stop instance
- `PATCH /api/v1/ctfs/:id` - Submit flag

See [API Documentation](docs/api.md) for complete details.

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run check        # Check code formatting

# Utilities
npm run migrate      # Run database migrations
npm run docker_test  # Test Docker utilities
```

## Technology Stack

### Backend
- **Runtime**: Node.js 25.x
- **Framework**: Express.js 5.2.1
- **Language**: TypeScript 5.9.3
- **Database**: MongoDB (Mongoose 9.0.2)
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Docker**: dockerode 4.0.9
- **Scheduling**: node-cron 4.2.1

## Contributing

1. Follow the naming conventions
2. Run `npm run lint` before committing
3. Update documentation for new features
4. Add tests for new functionality

## License

See [LICENSE](LICENSE) file for details.

## Acknowledgements

- Backend setup inspired by Aman Mittal's Express + TypeScript guide:
    - [Backend setup reference](https://blog.logrocket.com/express-typescript-node/) — Aman Mittal
