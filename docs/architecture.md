# Architecture Documentation

## Overview

The CTF Platform is a full-stack application designed to host and manage
Capture The Flag (CTF) challenges. The platform allows users to launch isolated
Docker containers for each challenge, providing a secure environment for
solving CTF problems.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐         ┌──────────────────┐          ┌──────────────┐
│  Frontend       │────────>│   Backend API    │────────> │  EC2 Docker  │
│  CloudFront+S3  │  HTTP   │   (EC2 Instances)│  Remote  │    Daemon    │
│                 │  calls  │   + Load Balancer│  TLS     │  (CTF        │
│                 │         │   + NGINX        │          │   Instances) │
└─────────────────┘         └──────────────────┘          └──────────────┘
                                      │
                                      │
                            ┌─────────┴─────────┐
                            │                   │
                    ┌───────▼──────┐   ┌───────▼──────┐
                    │  EC2 MongoDB │   │  CloudWatch  │
                    │   Database   │   │  + Auto Scale│
                    └──────────────┘   │  + SNS + IAM │
                                       └──────────────┘
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
- **Deployment**: Multiple EC2 instances (Backend1, Backend2) behind Load Balancer
- **Network**: Runs in private subnet for security
- **Responsibilities**:
  - User authentication and authorization
  - CTF challenge management
  - Remote Docker container lifecycle management (connects to EC2 Docker instance)
  - Port allocation and management
  - Automatic cleanup of expired instances

#### Database
- **Purpose**: Persistent storage for users, CTF challenges, and instance metadata
- **Technology**: MongoDB (Mongoose ODM)
- **Deployment**: EC2 instance running MongoDB
- **Collections**:
  - `users`: User accounts and solved CTF tracking
  - `ctfs`: CTF challenge definitions and configurations
  - `ctfinstances`: Active/running CTF instance records

#### Docker
- **Purpose**: Containerization and isolation of CTF challenges
- **Technology**: Docker (via Dockerode library)
- **Deployment**: Dedicated EC2 instance running Docker daemon
- **Connection**: Backend instances connect remotely via TLS 
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
5. Response with user data 

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
3. System reserves a port (3001-4000 range can be expanded)
4. Creates PENDING instance record in database
5. Backend connects to remote EC2 Docker instance via TLS
6. Launches Docker containers (backend + frontend) on EC2 Docker instance
   - Containers bound to `0.0.0.0:{port}` (public IP)
7. Waits for containers to become healthy
8. Updates instance status to RUNNING
9. Returns direct instance URL: `http://ec2-docker-public-ip:{port}`

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

**IMPORTANT**: The following security features are currently missing and should
be implemented before production deployment:

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

## AWS Production Architecture

### Production Setup
```
┌─────────────────┐         ┌─────────────────────────────────────────────┐
│  CloudFront     │         │         Application Layer                   │
│  + S3           │────────>│  ┌──────────────────────────────────────┐   │
│  (Frontend)     │  HTTP   │  │  Load Balancer                       │   │
│                 │  calls  │  └───────────────┬──────────────────────┘   │
└─────────────────┘         │                  │                          │
                            │        ┌─────────▼─────────┐                │
┌─────────────────┐         │        │  Private Network  │                │
│  S3             │         │        │  ┌──────────────┐ │                │
│  (Static        │         │        │  │  Backend1    │ │                │
│   Resources)    │         │        │  │  Backend2    │ │                │
└─────────────────┘         │        │  └──────┬───────┘ │                │
                            │        └─────────┼─────────┘                │
                            │                  │ (Docker API TLS)         │
                            │        ┌─────────▼─────────┐                │
                            │        │  EC2 Docker       │◄─── PUBLIC     │
                            │        │  (CTF Instances)  │    (Internet)  │
                            │        │  Ports 3001-4000  │                │
                            │        │  (Direct Access)  │                │
                            │        └───────────────────┘                │
                            │                                             │
                            │        ┌───────────────────┐                │
                            │        │  EC2 MongoDB      │                │
                            │        └───────────────────┘                │
                            └─────────────────────────────────────────────┘
                                      │
                            ┌─────────┴─────────────────────────┐
                            │                                   │
                    ┌───────▼────────┐  ┌───────────────────────▼──────┐
                    │  CloudWatch    │  │  AWS Services                │
                    │  (Monitoring)  │  │  - EC2 Auto Scaler           │
                    └────────────────┘  │  - SNS (Notifications)       │
                                        │  - IAM                       │
                                        └──────────────────────────────┘
```

### AWS Services Overview

#### Frontend & Static Resources
- **CloudFront**: CDN for frontend delivery, caching, and global distribution
- **S3**: 
  - Hosts frontend static files (HTML, CSS, JS)
  - Stores static resources (images, assets)

#### Application Infrastructure
- **Load Balancer**: Distributes incoming traffic across multiple backend instances
- **EC2 Backend Instances** (Backend1, Backend2):
  - Run in **private network/subnet** (not directly accessible from internet)
  - Handle API requests from frontend (via Load Balancer)
  - Manage CTF instance lifecycle
  - Connect to remote Docker daemon on EC2 Docker instance via TLS
  - NOT using NGINX (containers are exposed directly)

#### Docker Infrastructure
- **EC2 Docker Instance**:
  - **Public-facing** EC2 instance (accessible from internet)
  - Dedicated EC2 instance running Docker daemon
  - Hosts all CTF challenge containers
  - **Direct Port Exposure**: Containers are bound to `0.0.0.0:{port}` (public IP)
  - CTF instance containers run on ports 3001-4000
  - **No NGINX on host**: Containers are accessed directly via public IP and port

#### Database
- **EC2 MongoDB**: 
  - MongoDB instance running on EC2
  - Stores user data, CTF definitions, and instance metadata
  - Accessible from backend instances in private network

#### Monitoring & Management
- **CloudWatch**: 
  - Monitors traffic, performance metrics, and system health
  - Logs application and infrastructure events
- **EC2 Auto Scaler**: 
  - Automatically scales backend instances based on load
  - Ensures availability and performance
- **AWS SNS (Simple Notification Service)**: 
  - Sends notifications for system events
  - Alerts for scaling, errors, or important events
- **IAM**: 
  - Manages access control and permissions
  - Secures AWS service interactions

### Network Architecture

#### Request Flow

**For API Requests:**
1. User accesses frontend via CloudFront CDN
2. Frontend makes API calls to Load Balancer
3. Load Balancer routes to available backend instance (Backend1 or Backend2)
4. Backend processes request and connects to:
   - MongoDB (for data)
   - EC2 Docker (for container management)

**For CTF Instance Requests:**
1. Backend creates container and binds it to `0.0.0.0:{port}` (e.g., port 3002)
2. Backend returns direct URL to user: `http://ec2-docker-public-ip:3002`
3. User accesses URL **directly** → goes to EC2 Docker instance public IP on port 3002

#### Direct Port Exposure Configuration

**Container Binding:**
- Containers are created with port bindings to `0.0.0.0:{port}` (not `127.0.0.1`)
- This makes containers accessible from the internet via EC2 Docker instance's public IP
- Example: Container on port 3002 → accessible at `http://ec2-docker-public-ip:3002`

**Security Groups:**
- EC2 Docker instance security group must allow inbound traffic on ports 3001-4000
- Source: `0.0.0.0/0` (internet) or specific IP ranges for security


**Flow Example**: 
- Backend creates container → binds to `0.0.0.0:3002`
- Backend returns: `http://54.123.45.67:3002` (EC2 Docker public IP)
- User → `http://54.123.45.67:3002` → Container responds directly
- Frontend container's  serves the frontend app

#### Security Architecture
- **Private Network**: Backend instances run in private subnet, not directly accessible from internet
- **Load Balancer**: Only public-facing entry point for backend API
- **Public Docker Instance**: EC2 Docker instance is public-facing to serve CTF containers directly
- **Network Isolation**: Backend instances can only be accessed via Load Balancer
- **IAM**: Controls access to AWS services and resources

### Current Development Setup
- Backend runs locally on configured port (default: 3000)
- MongoDB connection via connection string
- Docker daemon accessible via:
  - Default socket (local development)
  - Docker socket proxy (docker-compose)
  - Directly to the docker daemon

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


## Conclusion
Our current setup may not be the best implementation for several reasons. One
example is that users can access other CTF instances by changing the port
number in the URL. Since containers are exposed directly on ports 3001-4000, a
user who knows their instance port (e.g., http://ec2-docker-public-ip:3002) can
try other ports (3003, 3004 ...) to access other users' CTF instances. This
is a security and isolation issue. Additional concerns include: port exhaustion
(only 999 concurrent instances), no authentication on container access, single
point of failure, IP address exposure, no SSL/TLS encryption, and limited
monitoring capabilities. These issues could be addressed by using subdomains,
implementing authentication and authorization, expanding the port range, adding
SSL/TLS, and implementing a reverse proxy. However, with only $50 in AWS
credits, we must prioritize cost-effective solutions. More sophisticated
approaches like container orchestration or multi-instance deployments may
exceed the budget, so we need to balance security improvements with cost
constraints. These improvements would enhance security and prevent unauthorized
access while staying within our limited budget.
