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

3. **Docker Security**
   - Containers bound to 127.0.0.1 (localhost only)
   - Resource limits enforced (512MB RAM, 0.256 CPU)
   - Auto-remove enabled (containers cleaned up on exit)

4. **Input Validation**
   - Email format validation
   - Required field validation
   - Password confirmation matching

5. **Error Handling**
   - Generic error messages for internal errors (prevents information leakage)
   - Structured error responses

## Critical Security Gaps

### 1. Missing CORS Configuration

**Status**: Not Implemented

**Impact**:
- Frontend from different origin cannot communicate with backend
- In development, this blocks local frontend development
- In production, this will block S3+CloudFront frontend

**Risk Level**: High

**Recommendation**:
```typescript
// Install: npm install cors @types/cors
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Action Required**: Add CORS middleware before production deployment.

---

### 2. Missing Rate Limiting

**Status**: Not Implemented (error type exists but no middleware)

**Impact**:
- **Brute Force Attacks**: Unlimited login attempts
- **DDoS**: No protection against request flooding
- **Resource Exhaustion**: Unlimited CTF instance creation
- **Automated Flag Submission**: Unlimited flag attempts

**Risk Level**: Critical

**Recommendation**:
```typescript
// Install: npm install express-rate-limit
import rateLimit from 'express-rate-limit';

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later.'
});

// Authentication rate limit (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later.'
});

// CTF instance creation rate limit
const instanceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 instances per hour
  message: 'Too many instance creation attempts, please try again later.'
});

// Apply to routes
app.use('/api/v1', apiLimiter);
app.use('/api/v1/login', authLimiter);
app.use('/api/v1/signup', authLimiter);
app.use('/api/v1/ctfs/:id/instances', instanceLimiter);
```

**Recommended Limits**:
- Authentication endpoints: 5 requests per 15 minutes per IP
- CTF instance creation: 3 requests per hour per user
- Flag submission: 10 requests per minute per user
- General API: 100 requests per 15 minutes per IP

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

**Post-AWS Migration**:
1. Use AWS Secrets Manager for connection strings
2. Implement VPC for database isolation
3. Use security groups to restrict access
4. Enable encryption at rest
5. Use IAM roles instead of credentials where possible
6. Enable MongoDB audit logging

**Action Required**: 
- Implement immediate mitigations
- Plan AWS migration with proper security architecture

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
- Implement structured logging (e.g., Winston, Pino)
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
- HSTS headers

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

- [ ] CORS middleware configured
- [ ] Rate limiting implemented on all endpoints
- [ ] Database credentials in AWS Secrets Manager
- [ ] HTTPS/TLS configured
- [ ] Input sanitization added
- [ ] Structured logging implemented
- [ ] Monitoring and alerting set up
- [ ] Dependency vulnerabilities resolved
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] Database firewall rules configured
- [ ] Regular security audits scheduled
- [ ] Incident response plan documented

## Incident Response

If a security breach is suspected:

1. **Immediate Actions**:
   - Rotate all credentials (database, JWT secret, API keys)
   - Review access logs
   - Check for unauthorized access
   - Isolate affected systems if necessary

2. **Investigation**:
   - Review application logs
   - Check database access logs
   - Review Docker container logs
   - Identify attack vector

3. **Remediation**:
   - Patch vulnerabilities
   - Update security measures
   - Notify affected users (if required)
   - Document lessons learned

4. **Prevention**:
   - Implement missing security measures
   - Update security documentation
   - Conduct security review

## Security Best Practices

1. **Principle of Least Privilege**: Grant minimum necessary permissions
2. **Defense in Depth**: Multiple layers of security
3. **Regular Updates**: Keep dependencies and systems updated
4. **Security by Design**: Consider security from the start
5. **Regular Audits**: Periodic security reviews
6. **Incident Preparedness**: Have a response plan ready
7. **User Education**: Educate users about security
8. **Monitoring**: Continuous monitoring for threats

