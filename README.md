# Live Location Taxi App 🚕

A professional MERN (MongoDB, Express, React, Node) backend for a real-time taxi booking platform with dual authentication systems for both users and captains (drivers).

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [API Documentation](#api-documentation)
  - [User Authentication](#user-authentication)
  - [Captain Authentication](#captain-authentication)
- [Security](#security)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Future Roadmap](#future-roadmap)

## Project Overview

This backend handles secure user and captain authentication with JWT tokens, password hashing via bcrypt, and token blacklist management using MongoDB TTL indexes. It supports both cookie-based and Authorization header authentication for maximum flexibility across web and mobile clients.

## Key Features

✅ Dual authentication system (Users & Captains)  
✅ JWT-based secure authentication with 7-day expiration  
✅ Password hashing with bcrypt (10-round salt)  
✅ Token blacklist system for immediate logout invalidation  
✅ MongoDB TTL index for automatic blacklist cleanup  
✅ Protected routes with role-based middleware  
✅ Cookie and Authorization header support  
✅ Comprehensive input validation with express-validator  
✅ Duplicate detection (email & vehicle plate)  
✅ Structured error handling  

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Runtime | Node.js v16+ | JavaScript runtime |
| Framework | Express.js | Web framework |
| Database | MongoDB | NoSQL database |
| ODM | Mongoose | Database modeling |
| Authentication | JWT | Token-based auth |
| Password Security | bcrypt | Password hashing |
| Validation | express-validator | Input validation |
| Cookies | cookie-parser | Cookie handling |

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- MongoDB (Atlas cloud or local instance)
- Git

### Installation

```bash
# Clone and navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

Server will run on `http://localhost:5000` by default.

## Environment Setup

### .env Configuration

Create a `.env` file in the `backend/` directory:

```env
# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/taxi-app

# JWT Secret (use a long, random string)
JWT_SECRET=your_very_secure_random_secret_key_here_min_32_characters

# Server
PORT=5000
NODE_ENV=development
```

**Important**: Keep `JWT_SECRET` secure and rotate in production.

## API Authentication Flow 🔐

### Standard Flow

```
1. REGISTER → Validate → Hash Password → Store User → Issue JWT → Return Token
   ↓
2. LOGIN → Validate Credentials → Compare Password → Issue JWT → Set Cookie + Return Token
   ↓
3. PROTECTED ROUTES → Check Token (Cookie/Header) → Verify JWT → Check Blacklist → Allow Access
   ↓
4. LOGOUT → Clear Cookie → Add Token to Blacklist → Automatic Expiry (7 days)
```

### Token & Blacklist Lifecycle

- **Token Lifespan**: 7 days (604800 seconds)
- **Blacklist Mechanism**: Token stored with TTL index set to 7 days
- **Automatic Cleanup**: MongoDB automatically removes expired tokens
- **Purpose**: Immediate logout invalidation + automatic DB cleanup

## API Documentation

### HTTP Status Codes Reference

| Code | Meaning | Common Cause |
|------|---------|-------------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation failed or duplicate entry |
| 401 | Unauthorized | Missing, invalid, or blacklisted token |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Unexpected server error |

---

## User Authentication 👤

### Register User - POST `/api/users/register`

**Request:**

```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (201):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john@example.com",
    "socketID": null,
    "__v": 0
  }
}
```

**Error Response (400):**

```json
{
  "errors": [
    {
      "type": "field",
      "value": "john@",
      "msg": "Invalid email address",
      "path": "email",
      "location": "body"
    }
  ]
}
```

---

### Login User - POST `/api/users/login`

**Request:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**

```json
{
  "isPasswordMatched": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john@example.com",
    "socketID": null
  }
}
```

**Headers:**

```
Set-Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Max-Age=604800; Path=/
```

**Error Response (401):**

```json
{
  "message": "Invalid email or password"
}
```

---

### Get User Profile - GET `/api/users/profile`

**Authentication (choose one):**

```http
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

OR

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**

```json
{
  "message": "welcome to the profile"
}
```

**Error Response (401):**

```json
{
  "message": "Unauthorized"
}
```

---

### Logout User - GET `/api/users/logout`

**Authentication:**

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**

```json
{
  "message": "Logout done"
}
```

**Headers:**

```
Set-Cookie: token=; HttpOnly; Max-Age=0; Path=/
```

---

### cURL Examples (Users)

**Register:**

```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"firstname":"John","lastname":"Doe","email":"john@example.com","password":"securePassword123"}'
```

**Login:**

```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"securePassword123"}'
```

**Get Profile:**

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <your-token-here>"
```

**Logout:**

```bash
curl -X GET http://localhost:5000/api/users/logout \
  -H "Authorization: Bearer <your-token-here>"
```

---

## Captain Authentication 🚖

### Register Captain - POST `/api/captains/register`

**Request:**

```json
{
  "fullname": {
    "firstname": "mahmud",
    "lastname": "hassan"
  },
  "email": "mahmud@gmail.com",
  "password": "securePassword123",
  "vehicle": {
    "color": "red",
    "plate": "S8NXC91",
    "capacity": 5,
    "vehicleType": "car"
  }
}
```

**Validation Rules:**

- `vehicleType`: `motorcycle` | `car` | `auto`
- `capacity`: Minimum 1
- `plate`: Unique across all captains
- All fields required

**Success Response (201):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "captain": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "fullname": {
      "firstname": "mahmud",
      "lastname": "hassan"
    },
    "email": "mahmud@gmail.com",
    "captainStatus": "unavailable",
    "vehicle": {
      "color": "red",
      "plate": "S8NXC91",
      "capacity": 5,
      "vehicleType": "car"
    }
  }
}
```

**Error Response (400) - Duplicate Email:**

```json
{
  "success": false,
  "message": "email already exists"
}
```

**Error Response (400) - Duplicate Plate:**

```json
{
  "success": false,
  "message": "plate already exists"
}
```

---

### Login Captain - POST `/api/captains/login`

**Request:**

```json
{
  "email": "mahmud@gmail.com",
  "password": "securePassword123"
}
```

**Success Response (200):**

```json
{
  "isPasswordMatched": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "captain": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "fullname": {
      "firstname": "mahmud",
      "lastname": "hassan"
    },
    "email": "mahmud@gmail.com",
    "captainStatus": "unavailable",
    "vehicle": {
      "color": "red",
      "plate": "S8NXC91",
      "capacity": 5,
      "vehicleType": "car"
    }
  }
}
```

**Error Response (401):**

```json
{
  "message": "Invalid email or password"
}
```

---

### Get Captain Profile - GET `/api/captains/profile`

**Authentication (choose one):**

```http
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

OR

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**

```json
{
  "message": "welcome to the captain profile"
}
```

---

### Logout Captain - GET `/api/captains/logout`

**Authentication:**

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**

```json
{
  "message": "Logout done"
}
```

---

### Captain Features

| Feature | Details |
|---------|---------|
| Status | `available` or `unavailable` (default: unavailable) |
| Vehicle Info | Color, plate, capacity, type |
| JWT Payload | `{ _id, email, role: "captain" }` |
| Plate Uniqueness | Enforced at database level |
| Blacklist | Same 7-day TTL as users |

### cURL Examples (Captains)

**Register:**

```bash
curl -X POST http://localhost:5000/api/captains/register \
  -H "Content-Type: application/json" \
  -d '{"fullname":{"firstname":"mahmud","lastname":"hassan"},"email":"mahmud@gmail.com","password":"securePassword123","vehicle":{"color":"red","plate":"S8NXC91","capacity":5,"vehicleType":"car"}}'
```

**Login:**

```bash
curl -X POST http://localhost:5000/api/captains/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mahmud@gmail.com","password":"securePassword123"}'
```

**Get Profile:**

```bash
curl -X GET http://localhost:5000/api/captains/profile \
  -H "Authorization: Bearer <your-token-here>"
```

---

## Security 🔒

### Best Practices Implemented

✅ **HTTPS Only** - Set `secure: true` on cookies in production  
✅ **httpOnly Cookies** - Prevents XSS token theft  
✅ **Password Hashing** - bcrypt with 10-round salt  
✅ **JWT Expiration** - 7-day token lifespan  
✅ **Input Validation** - express-validator on all inputs  
✅ **Token Blacklist** - TTL-based automatic cleanup  
✅ **Unique Constraints** - Email and plate uniqueness  
✅ **Role-Based Access** - JWT includes role identifier  

### Recommended Improvements for Production

🔧 Rate limiting on auth endpoints (prevent brute force)  
🔧 Helmet.js for secure HTTP headers  
🔧 CORS restricted to trusted origins only  
🔧 Refresh token rotation mechanism  
🔧 Email verification flow  
🔧 Password reset via email  
🔧 Redis for faster blacklist lookups (multi-instance)  
🔧 Activity logging and monitoring  
🔧 Two-factor authentication (2FA)  

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── user.controller.js    # User auth handlers
│   │   └── captain.controller.js # Captain auth handlers
│   ├── middlewares/
│   │   └── Auth.middleware.js    # JWT verification & blacklist check
│   ├── models/
│   │   ├── user.models.js        # User schema with JWT methods
│   │   ├── captain.models.js     # Captain schema with vehicle info
│   │   └── Blacklist.model.js    # Token blacklist with TTL
│   ├── routes/
│   │   ├── user.routes.js        # User endpoints
│   │   └── captain.routes.js     # Captain endpoints
│   ├── services/
│   │   ├── user.service.js       # User creation logic
│   │   └── captain.service.js    # Captain creation logic
│   ├── app.js                     # Express app configuration
│   └── server.js                  # Server entry point
├── .env                            # Environment variables
├── package.json                    # Dependencies
└── README.md                        # Documentation
```

### Key Files Reference

| File | Purpose |
|------|---------|
| `Auth.middleware.js` | Token extraction, JWT verification, blacklist validation |
| `Blacklist.model.js` | TTL schema for token invalidation |
| `user.models.js` | User schema with `generateAuthToken()`, `comparePassword()` |
| `captain.models.js` | Captain schema with vehicle info & authentication methods |
| `user.controller.js` | Register, login, profile, logout endpoints for users |
| `captain.controller.js` | Register, login, profile, logout endpoints for captains |

## Troubleshooting

### Issue: "All fields are required"

**Cause**: Missing or mismatched request body structure  
**Solution**: Verify request JSON matches the documented structure exactly

### Issue: "Invalid email or password" on login

**Cause**: Either email doesn't exist or password is incorrect  
**Debug**:
- Check if user/captain was registered with exact email
- Ensure password is sent as plain text (hashing happens server-side)

### Issue: "Unauthorized" on protected routes

**Causes**:
1. Token is missing from cookie or Authorization header
2. Token is invalid or expired
3. Token has been blacklisted (logged out)

**Solution**: Re-login to get fresh token

### Issue: "plate already exists" or "email already exists"

**Cause**: Attempting to register with duplicate email or vehicle plate  
**Solution**: Use a unique value or delete the existing record from MongoDB

## Future Roadmap 🚀

**Phase 1 (Next):**
- [ ] Refresh token system with rotation
- [ ] Rate limiting on authentication endpoints
- [ ] Email verification workflow
- [ ] Password reset via email link

**Phase 2:**
- [ ] Role-based access control (RBAC)
- [ ] Redis integration for blacklist optimization
- [ ] Real-time location tracking with WebSockets
- [ ] Trip history and ratings system

**Phase 3:**
- [ ] Two-factor authentication (2FA)
- [ ] Payment gateway integration
- [ ] Admin dashboard and analytics
- [ ] Push notifications

---

## Contributing

When adding new features:
1. Follow existing code structure and naming conventions
2. Add appropriate validation using express-validator
3. Update this README with new endpoints
4. Test with both Postman and cURL
5. Ensure proper error handling

## License

MIT License - See LICENSE file for details
