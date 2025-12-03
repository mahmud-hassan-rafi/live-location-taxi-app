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

- **POST** `/api/users/register`

  - Body: `{ "firstname", "lastname", "email", "password" }`
  - Response (201): `{ token, user }`
  - Notes: Password is hashed server-side.

- **POST** `/api/users/login`

  - Body: `{ "email", "password" }`
  - Response (200): `{ isPasswordMatched: true, token, user }` and sets `httpOnly` cookie `token`.

- **GET** `/api/users/profile`

  - Protected; requires cookie `token` or header `Authorization: Bearer <token>`.
  - Response (200): profile payload or message.

- **GET** `/api/users/logout`
  - Clears cookie on the server and creates a blacklist entry for the token. Response (200): `{ message: "Logout done" }`.

Example: using `Authorization` header

```http
GET /api/users/profile
Authorization: Bearer <token>
```

Cookie example (client in browser): the app sets `token` as `httpOnly` cookie on login.

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

If you'd like, I can also:

- Add a minimal `curl` or Postman collection for testing the auth flows ✅
- Harden cookie settings and update CORS to safer defaults for production ✅
