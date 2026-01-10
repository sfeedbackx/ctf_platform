# API Documentation

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: (To be configured)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Tokens are stored in
HTTP-only cookies and automatically sent with each request.

### Authentication Flow

1. User signs up or logs in
2. Server sets `token` cookie with JWT
3. Client includes cookie in subsequent requests automatically
4. Protected routes verify token via `jwtMiddleware`

## Endpoints

### Authentication Endpoints

#### POST `/api/v1/signup`

Create a new user account.

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/v1/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "confirmPassword": "securePassword123"
  }'
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123",
  "solvedCtf": []
}
```

**Example Response (201 Created):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "numberOfSolvedCtf": 0,
  "solvedCtf": []
}
```

**Example Error Response (400 Bad Request):**
```json
{
  "message": "Email already used"
}
```

**Error Responses:**
- `400 Bad Request`: Missing fields, email already used, passwords don't match
- `500 Internal Server Error`: Server error

---

#### POST `/api/v1/login`

Authenticate user and receive JWT token.

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/v1/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Example Response (200 OK):**
```json
{
  "userWithoutPassword": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "numberOfSolvedCtf": 0,
    "solvedCtf": []
  }
}
```

**Note**: Token is set as HTTP-only cookie automatically. Use `-c cookies.txt` with curl to save cookies.

**Example Error Response (401 Unauthorized):**
```json
{
  "message": "Invalid credentials"
}
```

**Error Responses:**
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid credentials

---

#### POST `/api/v1/logout`

Logout user and clear authentication cookie.

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/v1/logout \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Example Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

---

### CTF Endpoints

#### GET `/api/v1/ctfs`

Get list of all available CTF challenges.

**Authentication**: Not required

**Example Request:**
```bash
curl -X GET http://localhost:3000/api/v1/ctfs
```

**Example Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "SSRF-RACE",
    "type": "WEB_EXPLOIT",
    "description": "Who said education has to be expensive? This platform seems to handle enrollment and pricing automatically. Still, nothing is ever as perfect as it looks.",
    "difficulty": "MID",
    "hints": [
      "Hint 1: The server talks to itself. What happens when you make it ask the right questions?",
      "Hint 2: Speed beats logic. Sometimes clicking faster than the server can think pays off."
    ],
    "resources": [],
    "withSite": true
  }
]
```

**Example Response (200 OK) - Empty:**
```json
[]
```

---

#### POST `/api/v1/ctfs/:id/instances`

Create a new CTF instance (launch containers for a challenge).

**Authentication**: Required

**URL Parameters:**
- `id`: CTF challenge ID

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/v1/ctfs/507f1f77bcf86cd799439011/instances \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Example Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439012",
  "ctfId": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439010",
  "status": "RUNNING",
  "url": "http://localhost:3500",
  "expiresAt": "2024-01-01T12:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: CTF has no site, validation error
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: CTF not found
- `409 Conflict`: CTF already solved, or another instance is active
- `500 Internal Server Error`: Docker error, port allocation failed, database error

**Business Rules:**
- User can only have one active instance at a time
- Cannot start instance for already-solved CTF
- If PENDING instance exists for same CTF, setup is resumed
- If RUNNING instance exists for same CTF, it is returned immediately

---

#### GET `/api/v1/ctfs/instances`

Get current user's active CTF instance (if any).

**Authentication**: Required

**Example Request:**
```bash
curl -X GET http://localhost:3000/api/v1/ctfs/instances \
  -b cookies.txt
```

**Example Response (200 OK) - Has Active Instance:**
```json
{
  "success": true,
  "instance": {
    "id": "507f1f77bcf86cd799439012",
    "ctfId": "507f1f77bcf86cd799439011",
    "status": "RUNNING",
    "url": "http://localhost:3500",
    "expiresAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Example Response (200 OK) - No Active Instance:**
```json
{
  "success": true,
  "instance": null
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

---

#### PATCH `/api/v1/ctfs/instances/:id`

Stop a running CTF instance.

**Authentication**: Required

**URL Parameters:**
- `id`: CTF instance ID

**Example Request:**
```bash
curl -X PATCH http://localhost:3000/api/v1/ctfs/instances/507f1f77bcf86cd799439012 \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "message": "CTF instance stopped successfully"
}
```

**Example Response (200 OK) - Already Stopped:**
```json
{
  "success": true,
  "message": "CTF instance already stopped"
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Instance not found or doesn't belong to user
- `500 Internal Server Error`: Server error

---

#### PATCH `/api/v1/ctfs/:id`

Submit a flag for a CTF challenge.

**Authentication**: Required

**URL Parameters:**
- `id`: CTF challenge ID

**Example Request:**
```bash
curl -X PATCH http://localhost:3000/api/v1/ctfs/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "flag": "CTF{flag_1_abc123}"
  }'
```

**Request Body:**
```json
{
  "flag": "CTF{flag_1_abc123}"
}
```

**Example Response (200 OK) - Correct Flag:**
```json
{
  "success": true,
  "message": "Congratulations! You solved this CTF"
}
```

**Example Response (200 OK) - Already Solved:**
```json
{
  "success": true,
  "message": "Congratulations! You already solved this CTF"
}
```

**Example Error Response (400 Bad Request):**
```json
{
  "message": "Wrong flag"
}
```

**Error Responses:**
- `400 Bad Request`: Missing flag, wrong flag
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: CTF not found
- `500 Internal Server Error`: Database error

**Note**: Token is automatically refreshed after successful flag submission to update `numberOfSolvedCtf` in the JWT payload.

---

## Error Response Format

All error responses follow this format:

```json
{
  "message": "Error message describing what went wrong"
}
```

For internal server errors (500), the message is always:
```json
{
  "message": "Internal Server"
}
```

## HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., already solved, active instance exists)
- `500 Internal Server Error`: Server error

## Rate Limiting

**Note**: Rate limiting is currently NOT implemented. This is a security concern that should be addressed before production deployment.

Recommended rate limits:
- Authentication endpoints: 5 requests per 15 minutes per IP
- CTF instance creation: 3 requests per hour per user
- Flag submission: 10 requests per minute per user
- General API: 100 requests per minute per IP

## CORS

**Note**: CORS (Cross-Origin Resource Sharing) is currently NOT configured. The frontend must be served from the same origin as the backend, or CORS middleware must be added.

Recommended CORS configuration:
```javascript
{
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}
```

