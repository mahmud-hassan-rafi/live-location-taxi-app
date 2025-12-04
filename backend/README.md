# Live Location Taxi App 🚕

**Project Overview**

This project is a MERN (MongoDB, Express, React, Node) backend for a live-location taxi application. It focuses on secure user authentication using JWTs, supporting both cookie and Authorization header authentication, password hashing with bcrypt, and a token blacklist for logout handling.

**Key Features**

- User Authentication with JWT ✅
- Secure Register / Login flows ✅
- Password hashing using `bcrypt` ✅
- Token Blacklist system for logout ✅
- Token expiration using MongoDB TTL indexes ✅
- Protected routes via middleware ✅
- Supports `Cookie` and `Authorization` header ✅

**Tech Stack**

- **Node.js** + **Express** (backend)
- **MongoDB** (database, TTL index for blacklist)
- **Mongoose** (ODM)
- **bcrypt** (password hashing)
- **jsonwebtoken (JWT)** (token issuance & verification)
- **cookie-parser**, **express-validator** and other middleware

**API Authentication Flow** 🔐

1. Register: client sends `email`, `password`, `firstname`, `lastname` to `/api/users/register`.
   - Password is hashed with `bcrypt` before storing.
2. Login: client sends `email` + `password` to `/api/users/login`.
   - On success the server issues a JWT (expires in 7 days) and sets it as an `httpOnly` cookie (`token`). The token is also returned in the JSON response so clients using mobile apps or SPAs can store it in memory and send it in the `Authorization: Bearer <token>` header.
3. Protected routes (e.g. `/api/users/profile`) require the JWT. The `isAuthenticated` middleware checks:
   - `req.cookies.token` or `Authorization` header (`Bearer <token>`)
   - If token is in the blacklist, requests are rejected (logout invalidation)
   - Otherwise token is verified with `JWT_SECRET` and request proceeds

**Logout with Blacklist (TTL explained)** 🔁

- When a user logs out, the backend clears the cookie and stores the token in a `Blacklist` collection.
- The `Blacklist` model includes a `createdAt` field with a TTL index (`expires: 7 * 86400`) so entries automatically expire after 7 days. This means blacklist entries are retained only while the token could still be valid — allowing the server to reject blacklisted tokens until they would have naturally expired.

**Setup & Installation** 🛠️

Prerequisites:

- Node.js (v16+ recommended)
- npm or yarn
- A MongoDB instance (Atlas or local)

Quick start (backend):

```bash
# from project root
cd backend
npm install

# create a .env file (see below)
npm run dev   # or `npm start` depending on scripts in `backend/package.json`
```

**Environment Variables** (.env)

Create a `backend/.env` file with the following values:

```
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/your-db
JWT_SECRET=yourVeryStrongSecretHere
PORT=5000
NODE_ENV=development
```

**API Endpoints (Auth)** 🌐

#### 1. Register User

**POST** `/api/users/register`

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
    },
    {
      "type": "field",
      "value": "123",
      "msg": "Firstname must be at least 3 characters",
      "path": "firstname",
      "location": "body"
    }
  ]
}
```

---

#### 2. Login User

**POST** `/api/users/login`

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

**Also sets httpOnly cookie:**

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

#### 3. Get User Profile

**GET** `/api/users/profile`

**Headers (choose one):**

Option A - Cookie:

```http
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Option B - Authorization Header:

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

_(returned if token is missing, invalid, or blacklisted)_

---

#### 4. Logout User

**GET** `/api/users/logout`

**Headers:**

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

OR cookie (set during login)

**Success Response (200):**

```json
{
  "message": "Logout done"
}
```

**Also clears httpOnly cookie:**

```
Set-Cookie: token=; HttpOnly; Max-Age=0; Path=/
```

_Token is added to the blacklist collection and will be rejected for 7 days (TTL expiry)._

---

**Quick Test Commands (cURL):**

Register:

```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"firstname":"John","lastname":"Doe","email":"john@example.com","password":"securePassword123"}'
```

Login:

```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"securePassword123"}'
```

Get Profile (with Authorization header):

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <your-token-here>"
```

Get Profile (with cookie):

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Cookie: token=<your-token-here>"
```

Logout:

```bash
curl -X GET http://localhost:5000/api/users/logout \
  -H "Authorization: Bearer <your-token-here>"
```

---

## Captain Authentication 🚖

Captains (drivers) have a separate authentication flow with similar JWT-based security but additional vehicle information.

**Captain API Endpoints** 🌐

#### 1. Register Captain

**POST** `/api/captains/register`

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

**Request Notes:**

- `vehicleType` must be one of: `motorcycle`, `car`, `auto`
- `capacity` must be at least 1
- `plate` must be unique (no two captains can have the same vehicle plate)
- All vehicle fields are required

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
    },
    "__v": 0
  }
}
```

**Error Response (400) - Validation Error:**

```json
{
  "errors": [
    {
      "type": "field",
      "value": "ab",
      "msg": "Firstname must be at least 3 characters",
      "path": "fullname.firstname",
      "location": "body"
    },
    {
      "type": "field",
      "value": "red",
      "msg": "Plate must be at least 3 characters",
      "path": "vehicle.plate",
      "location": "body"
    }
  ]
}
```

**Error Response (400) - Captain Already Exists:**

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

#### 2. Login Captain

**POST** `/api/captains/login`

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

**Also sets httpOnly cookie:**

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

#### 3. Get Captain Profile

**GET** `/api/captains/profile`

**Headers (choose one):**

Option A - Cookie:

```http
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Option B - Authorization Header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**

```json
{
  "message": "welcome to the captain profile"
}
```

**Error Response (401):**

```json
{
  "message": "Unauthorized"
}
```

_(returned if token is missing, invalid, or blacklisted)_

---

#### 4. Logout Captain

**GET** `/api/captains/logout`

**Headers:**

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

OR cookie (set during login)

**Success Response (200):**

```json
{
  "message": "Logout done"
}
```

**Also clears httpOnly cookie:**

```
Set-Cookie: token=; HttpOnly; Max-Age=0; Path=/
```

_Token is added to the blacklist collection and will be rejected for 7 days (TTL expiry)._

---

**Quick Test Commands (cURL):**

Register Captain:

```bash
curl -X POST http://localhost:5000/api/captains/register \
  -H "Content-Type: application/json" \
  -d '{"fullname":{"firstname":"mahmud","lastname":"hassan"},"email":"mahmud@gmail.com","password":"securePassword123","vehicle":{"color":"red","plate":"S8NXC91","capacity":5,"vehicleType":"car"}}'
```

Login Captain:

```bash
curl -X POST http://localhost:5000/api/captains/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mahmud@gmail.com","password":"securePassword123"}'
```

Get Captain Profile (with Authorization header):

```bash
curl -X GET http://localhost:5000/api/captains/profile \
  -H "Authorization: Bearer <your-token-here>"
```

Get Captain Profile (with cookie):

```bash
curl -X GET http://localhost:5000/api/captains/profile \
  -H "Cookie: token=<your-token-here>"
```

Logout Captain:

```bash
curl -X GET http://localhost:5000/api/captains/logout \
  -H "Authorization: Bearer <your-token-here>"
```

---

**Captain Features:**

- Status tracking: `available` or `unavailable` (default: `unavailable`)
- Vehicle information: color, plate, capacity, type (motorcycle/car/auto)
- JWT token includes role identifier: `{ _id, email, role: "captain" }`
- Unique plate enforcement to prevent duplicate vehicle registrations
- Same blacklist system as users for logout invalidation

**Security Best Practices** 🔒

- Use HTTPS in production and set the cookie `secure: true`.
- Keep `JWT_SECRET` long and random; rotate if compromised.
- Use `httpOnly` cookies to reduce XSS exposure for stored tokens.
- Use short-lived access tokens and (optionally) rotate refresh tokens.
- Validate and sanitize all incoming data (`express-validator` used for examples).
- Rate limit authentication endpoints to mitigate brute force attacks.
- Use tools like `helmet` to set secure HTTP headers.
- Limit CORS to trusted origins in production (avoid `origin: '*'`).
- Store blacklist in an in-memory store (Redis) if you need faster lookups and multi-instance scaling.

**Future Improvements / Roadmap** 🚀

- Add refresh tokens with secure storage and rotation.
- Email verification and password reset flows.
- Role-based access control (RBAC) or permissions.
- Move blacklist to Redis for better performance and multi-server support.
- Add logging, monitoring, and structured error handling.
- Add end-to-end tests and CI configuration.

**Files of interest**

- `backend/src/middlewares/Auth.middleware.js` — token extraction & verification + blacklist check
- `backend/src/models/Blacklist.model.js` — blacklist schema with TTL
- `backend/src/models/user.models.js` — user schema, password hash helpers, token generation
- `backend/src/controllers/user.controller.js` — register, login, logout handlers
