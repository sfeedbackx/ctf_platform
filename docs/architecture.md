# Architecture Documentation

## Overview

The CTF Platform is a full-stack application designed to host and manage Capture The Flag (CTF) challenges. The platform allows users to launch isolated Docker containers for each challenge, providing a secure environment for solving CTF problems.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐         ┌──────────────────┐
│  Frontend       │────────>│   Backend API    │
│  (React/Vue/etc)│  HTTP   │   (Express.js)   │
│                 │  calls  │                  │
└─────────────────┘         └──────────────────┘
                                      │
                                      │
                            ┌─────────┴─────────┐
                            │                   │
                    ┌───────▼──────┐   ┌───────▼──────┐
                    │   MongoDB    │   │    Docker    │
                    │   Database   │   │   Daemon     │
                    └──────────────┘   └──────────────┘
```

### Component Breakdown

#### Frontend
- **Purpose**: User interface for interacting with CTF challenges
- **Technology**: React
- **Deployment**: Will be hosted on AWS S3 + CloudFront (CDN) in production
- **Communication**: Communicates with backend via REST API

#### Backend
- **Purpose**: API server handling authentication, CTF management, and Docker orchestration
- **Technology**: Node.js + Express.js + TypeScript
- **Deployment**: EC2 instance (planned)
- **Responsibilities**:
  - User authentication and authorization
  - CTF challenge management
  - Docker container lifecycle management
  - Port allocation and management
  - Automatic cleanup of expired instances

#### Database
- **Purpose**: Persistent storage for users, CTF challenges, and instance metadata
- **Technology**: MongoDB (Mongoose ODM)
- **Collections**:
  - `users`: User accounts and solved CTF tracking
  - `ctfs`: CTF challenge definitions and configurations
  - `ctfinstances`: Active/running CTF instance records

#### Docker
- **Purpose**: Containerization and isolation of CTF challenges
- **Technology**: Docker (via Dockerode library)
- **Features**:
  - Dynamic container creation per user instance
  - Resource limits (512MB RAM, 0.256 CPU cores)
  - Port mapping (3001-4000 range)
  - Automatic container cleanup

## Data Flow

### User Registration Flow
1. User submits registration form (email, password, confirmPassword)
2. Backend validates input and checks for existing email
3. Password is hashed using bcryptjs
4. User document is created in MongoDB
5. Response with user data (excluding password)

### User Login Flow
1. User submits credentials (email, password)
2. Backend validates credentials against database
3. JWT token is generated and set as HTTP-only cookie
4. Response with user data

### CTF Instance Creation Flow
1. Authenticated user requests to start a CTF challenge
2. Backend validates:
   - User hasn't already solved this CTF
   - User doesn't have another active instance
   - CTF exists and has container configuration
3. System reserves a port (3001-4000 range)
4. Creates PENDING instance record in database
5. Launches Docker containers (backend + frontend)
6. Waits for containers to become healthy
7. Updates instance status to RUNNING
8. Returns instance URL and metadata

### CTF Instance Cleanup Flow
1. Cron job runs periodically (every 5 minutes in production, every 10 seconds in dev)
2. Finds all instances with `expiresAt < now` and status RUNNING/PENDING
3. Stops associated Docker containers
4. Updates instance status to TERMINATED
5. Logs cleanup results

## Technology Stack

### Backend
- **Runtime**: Node.js 25.x
- **Framework**: Express.js 5.2.1
- **Language**: TypeScript 5.9.3
- **Database**: MongoDB (via Mongoose 9.0.2)
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Password Hashing**: bcryptjs 3.0.3
- **Docker Integration**: dockerode 4.0.9
- **Scheduling**: node-cron 4.2.1

### Development Tools
- **Build Tool**: TypeScript Compiler
- **Dev Server**: tsx 4.21.0
- **Linting**: ESLint 9.39.2
- **Formatting**: Prettier 3.7.4

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration and database setup
│   │   ├── config.ts    # Environment variables
│   │   └── db.ts        # MongoDB connection
│   ├── controller/      # Business logic
│   │   ├── authController.ts
│   │   └── ctfController.ts
│   ├── middlewares/     # Express middlewares
│   │   ├── errorHandler.ts
│   │   ├── jwtMiddleware.ts
│   │   └── requestLogger.ts
│   ├── models/          # Mongoose models
│   │   ├── userModel.ts
│   │   ├── ctfModel.ts
│   │   └── ctfInstanceModel.ts
│   ├── router/          # Route definitions
│   │   ├── mainRoute.ts
│   │   ├── authenticationRoute.ts
│   │   └── ctfRoute.ts
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   │   ├── dockerUtils.ts
│   │   ├── hashUtils.ts
│   │   ├── jwtUtils.ts
│   │   ├── loggerUtils.ts
│   │   └── cronUtils.ts
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entry point
├── scripts/             # Migration and utility scripts
├── package.json
└── tsconfig.json
```

## Security Considerations

### Current Security Measures
- **Password Hashing**: Passwords are hashed using bcryptjs before storage
- **JWT Authentication**: Tokens stored in HTTP-only cookies (prevents XSS)
- **SameSite Cookies**: Set to 'strict' for CSRF protection
- **Secure Cookies**: Enabled in production environment
- **Resource Limits**: Docker containers have memory and CPU limits
- **Port Binding**: Containers bound to 127.0.0.1 (localhost only)

### Security Gaps (To Be Addressed)

**IMPORTANT**: The following security features are currently missing and should be implemented before production deployment:

1. **CORS (Cross-Origin Resource Sharing)**
   - **Status**: Not implemented
   - **Impact**: Frontend from different origin cannot communicate with backend
   - **Recommendation**: Implement CORS middleware with proper origin whitelist

2. **Rate Limiting**
   - **Status**: Not implemented (error type exists but no middleware)
   - **Impact**: Vulnerable to brute force attacks, DDoS, and resource exhaustion
   - **Recommendation**: Implement rate limiting middleware (e.g., express-rate-limit)
   - **Areas to protect**:
     - Login endpoint (prevent brute force)
     - Signup endpoint (prevent spam)
     - CTF instance creation (prevent resource exhaustion)
     - Flag submission (prevent automated solving)

3. **Database Exposure**
   - **Status**: Database connection string exposed in environment variables
   - **Impact**: If environment variables are leaked, database is directly accessible
   - **Recommendation**: 
     - Use AWS Secrets Manager or Parameter Store
     - Implement database firewall rules
     - Use VPC for database isolation
     - Enable MongoDB authentication and encryption at rest
   - **Note**: This will be addressed when migrating to AWS infrastructure

## Deployment Architecture (Planned)

### Production Setup
```
┌─────────────────┐         ┌──────────────────┐
│  S3 + CloudFront│         │   EC2 Instance   │
│   (Frontend)    │────────>│  - NGINX         │
│     ctf.com     │  API    │  - Backend       │
│                 │  calls  │  - Docker        │
└─────────────────┘         └──────────────────┘
                                      │
                            ┌─────────┴─────────┐
                            │                   │
                    ┌───────▼──────┐   ┌───────▼──────┐
                    │   MongoDB    │   │  AWS Secrets │
                    │   (Atlas)    │   │   Manager    │
                    └──────────────┘   └──────────────┘
```

### Current Development Setup
- Backend runs locally on configured port (default: 3000)
- MongoDB connection via connection string
- Docker daemon accessible via default socket
- No reverse proxy or load balancer

## Container Lifecycle

### Instance States
- **PENDING**: Instance record created, containers starting
- **RUNNING**: Containers active and healthy
- **TERMINATED**: Instance stopped by user or expired
- **STOPPED**: Instance manually stopped
- **FAILED**: Cleanup or startup failed

### Port Management
- Ports allocated from range 3001-4000
- Port reservations tracked in-memory during instance creation
- Ports released after container creation completes
- No port conflicts possible due to reservation system

### Resource Limits
- **Memory**: 512 MB per container
- **CPU**: 0.256 cores per container
- **Auto-remove**: Containers automatically removed on exit
- **Expiration**: Instances expire after 1 hour (configurable)

## Future Enhancements

1. **3-Container Support**: Support for CTF challenges with database (frontend + backend + database)
2. **Health Checks**: Implement proper Docker health checks
3. **Monitoring**: Add metrics and monitoring (e.g., Prometheus, Grafana)
4. **Load Balancing**: Multiple backend instances behind load balancer
5. **Database Migration**: Move to AWS RDS or MongoDB Atlas
6. **Caching**: Implement Redis for session management
7. **WebSocket Support**: Real-time updates for instance status

