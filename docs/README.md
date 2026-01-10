# Documentation Index

Welcome to the CTF Platform documentation. This directory contains comprehensive documentation for understanding, setting up, and deploying the platform.

## Documentation Files

### [Architecture](architecture.md)
Complete system architecture documentation including:
- High-level system design
- Component breakdown
- Data flow diagrams
- Technology stack
- Security considerations
- Deployment architecture (current and planned)

**Read this first** to understand how the system works.

### [API Documentation](api.md)
Complete API reference including:
- All available endpoints
- Request/response formats
- Authentication flow
- Error handling
- Status codes
- Rate limiting notes (currently missing)

**Use this** when integrating with the API.

### [Setup Guide](setup.md)
Step-by-step setup instructions for:
- Prerequisites installation
- Backend setup
- Frontend setup (when available)
- Environment configuration
- Database setup
- Docker configuration
- Development workflow
- Common issues and solutions

**Follow this** to get the project running locally.

### [Security Documentation](security.md)
Security considerations including:
- Current security measures
- Critical security gaps (CORS, rate limiting, database exposure)
- Security recommendations
- Security checklist
- Incident response procedures
- Best practices

**Review this** before production deployment.

## Quick Navigation

### For Developers
1. Start with [Setup Guide](setup.md) to get the project running
2. Read [Architecture](architecture.md) to understand the system
3. Reference [API Documentation](api.md) when building features

### For DevOps/Deployment
1. Review [Architecture](architecture.md) for deployment architecture
2. Check [Security Documentation](security.md) for security requirements
3. Follow [Setup Guide](setup.md) for production setup

### For Security Auditors
1. Read [Security Documentation](security.md) for security gaps
2. Review [Architecture](architecture.md) for security architecture
3. Check [API Documentation](api.md) for API security

## Important Notes

**Before Production Deployment**:

1. **CORS**: Not configured - must be added for frontend communication
2. **Rate Limiting**: Not implemented - critical for preventing abuse
3. **Database Security**: Database is exposed until AWS migration

See [Security Documentation](security.md) for details and mitigation steps.

## Architecture Overview

```
Frontend (React, S3 + CloudFront) → Backend API (EC2) → MongoDB + Docker
```

The platform consists of:
- **Frontend**: React user interface
- **Backend**: Express.js API server
- **Database**: MongoDB for persistent storage
- **Docker**: Container orchestration for CTF challenges

## Key Features

- JWT-based authentication
- Dynamic Docker container management
- Flag submission
- Automatic cleanup of expired instances

## Getting Started

1. Read the [Setup Guide](setup.md)
2. Follow the installation steps
3. Configure your environment
4. Start the backend server
5. (When available) Start the frontend

## Contributing

When adding new features:
1. Update relevant documentation files
2. Update API documentation for new endpoints
3. Review security implications

## Questions?

If you have questions or find issues in the documentation:
1. Check the relevant documentation file
2. Review the code comments
3. Check the main [README](../README.md)

