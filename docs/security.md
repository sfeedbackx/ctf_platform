# Security Considerations

## Current Security Measures

### Implemented

1. **Password Hashing**
   - Passwords are hashed using `bcryptjs` before storage
   - Salt rounds: Default (10 rounds)

2. **JWT Authentication**
   - Tokens stored in HTTP-only cookies (prevents XSS attacks)
   - SameSite: 'strict' (CSRF protection)
   - Secure flag enabled in production

3. **Network Isolation**
   - Frontend and Backend instances run in **private subnets**.
   - Database (MongoDB) is isolated within the private VPC.
   - External access is restricted to the Load Balancer (Public).

4. **Docker Security**
   - Containers bound to 127.0.0.1 (localhost only)
   - Resource limits enforced (512MB RAM, 0.256 CPU)
   - Auto-remove enabled (containers cleaned up on exit)
   - Remote Docker API secured via TLS.

5. **Reverse Proxy (NGINX)**
   - Acts as a gateway for the backend API.
   - Masks internal server topology.
   - Handles SSL termination (via ALB).

4. **Input Validation**
   - Email format validation
   - Required field validation
   - Password confirmation matching

5. **Error Handling**
   - Generic error messages for internal errors (prevents information leakage)
   - Structured error responses

## Critical Security Gaps

### 1. CORS Configuration

**Status**: **Resolved via NGINX Proxy**

**Description**:
The platform uses an NGINX reverse proxy on the Frontend EC2 instances. This setup serves both
the React application and the API from the same origin (the Load Balancer's DNS/IP).

**Impact**:
- **Current**: Requests to `/api/*` are internally routed to the backend by NGINX, effectively removing CORS restrictions while maintaining strict security.

---

### 2. Rate Limiting

**Status**: **Implemented (Production)**

**Impact**:
- **Brute Force Attacks**: Mitigation applied via strict limits on authentication endpoints.
- **DDoS/Resource Exhaustion**: Basic protection provided by NGINX and application-level middleware.
- **Note**: Limits are enforced in the production environment; local development remains unrestricted for ease of testing.
- **Automated Flag Submission**: Unlimited flag attempts

**Risk Level**: Critical

**Action Required**: Implement rate limiting before production deployment.

---

### 3. Database Exposure

**Status**: Exposed until AWS migration

**Current State**:
- Database connection string stored in environment variables
- No firewall protection (unless manually configured)
- Direct database access if credentials are leaked
- No encryption at rest (unless MongoDB Atlas is used)

**Risk Level**: Critical

**Current Mitigation**:
1. Use strong, unique database passwords
2. Restrict MongoDB network access to application server IP only
3. Use MongoDB authentication (username/password)
4. Regularly rotate database credentials
5. Monitor database access logs
6. Never commit `.env` files to version control

**Post-AWS Migration (Current Status)**:
1. **Private VPC**: MongoDB is isolated and only accessible from backend instances.
2. **Security Groups**: Strict inbound rules limit access to required ports only.
3. **Encryption**: (Note if encryption at rest is enabled on the EBS/Volume).

**Action Required**: 
- Maintain use of credentials in development (Root user/pass).
- Plan AWS migration with secret management and private VPC endpoints.

---

## Additional Security Recommendations

### 1. Input Sanitization

**Status**: Partial

**Current**: Basic validation exists
**Recommended**: Add input sanitization library (e.g., `validator`, `sanitize-html`)

### 2. SQL Injection Prevention

**Status**: Not applicable (using MongoDB)

**Note**: MongoDB is NoSQL, but still validate all inputs to prevent NoSQL injection.

### 3. XSS Prevention

**Status**: Partial

**Current**: HTTP-only cookies prevent XSS token theft
**Recommended**: 
- Sanitize all user inputs
- Use Content Security Policy (CSP) headers
- Escape output in frontend

### 4. CSRF Protection

**Status**: Implemented

**Current**: SameSite='strict' cookies provide CSRF protection

### 5. Session Management

**Status**: Implemented

**Current**: JWT tokens with expiration (7 days)
**Recommended**: Consider shorter expiration times for production

### 6. Logging and Monitoring

**Status**: Basic

**Current**: Console logging with [INFO], [ERROR], [WARN] tags
**Recommended**:
- Log to external service (e.g., CloudWatch, Datadog)
- Monitor for suspicious patterns
- Set up alerts for failed authentication attempts

### 7. Secrets Management

**Status**: Environment variables only

**Current**: Secrets in `.env` file
**Recommended**: 
- Use AWS Secrets Manager (production)
- Use HashiCorp Vault (alternative)
- Never commit secrets to version control

### 8. HTTPS/TLS

**Status**: Not configured (development only)

**Current**: HTTP only
**Required for Production**:
- SSL/TLS certificates (Let's Encrypt or AWS Certificate Manager)
- Force HTTPS redirects

### 9. Dependency Security

**Status**: Manual

**Recommended**:
- Regular dependency updates
- Use `npm audit` to check for vulnerabilities
- Consider Snyk or Dependabot for automated scanning

### 10. Container Security

**Status**: Basic

**Current**: Resource limits, localhost binding
**Recommended**:
- Use minimal base images
- Scan images for vulnerabilities
- Implement container image signing
- Use read-only filesystems where possible

## Security Checklist

Before production deployment, ensure:

- [x] CORS Resolved via NGINX Proxy
- [x] Rate limiting implemented in production
- [ ] Database credentials transition to AWS Secrets Manager
- [] HTTPS/TLS configured (via ALB)
- [ ] Input sanitization library (e.g. validator) full integration
- [x] VPC / Network isolation configured

