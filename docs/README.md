# Documentation Index

Welcome to the CTF Platform documentation. This directory contains comprehensive documentation for understanding, setting up, and deploying the platform.

## Documentation Files

### [Architecture](architecture.md)
Complete system architecture documentation including:
- High-level system design (LB + EC2/Nginx)
- Component breakdown (Private Subnet Frontend/Backend)
- Data flow diagrams
- Technology stack
- Security considerations
- Deployment architecture

**Read this first** to understand how the system works.

### [API Documentation](api.md)
Complete API reference including:
- All available endpoints
- Request/response formats
- Authentication flow
- Security status

**Use this** when integrating with the API.

### [Setup Guide](setup.md)
Step-by-step setup instructions for:
- Local development workflow using **Docker Compose**
- Environment configuration
- Docker and MongoDB setup

**Follow this** to get the project running locally.

### [Security Documentation](security.md)
Security considerations including:
- Implemented measures (Password hashing, JWT, Rate Limiting)
- Resolved gaps 
- Incident response and best practices

**Review this** before production deployment.

## Quick Navigation

### For Developers
1. Start with [Setup Guide](setup.md) to get the project running.
2. Read [Architecture](architecture.md) to understand the system.
3. Reference [API Documentation](api.md) when building features.

### For DevOps/Deployment
1. Review [Architecture](architecture.md) for deployment architecture.

## Architecture Overview

```
User → Load Balancer (Public) → Frontend EC2 (Nginx Proxy, Private) → Backend Clusters (Private)
```

The platform consists of:
- **Frontend**: React application served via NGINX.
- **Backend**: Express.js API server cluster.
- **Database**: MongoDB instance (Private).
- **Docker**: Dedicated EC2 for remote CTF container orchestration.

## Getting Started

1. Use the root (or backend-located) `compose.yaml` to spin up the entire platform locally.
2. Refer to the [Setup Guide](setup.md) for details.
