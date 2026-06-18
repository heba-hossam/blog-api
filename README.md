# 📝 Personal Blogging Platform API

A secure, production-ready RESTful API for a personal blogging platform built with **Node.js**, **Express**, and **MongoDB**.

---

## ✨ Features

- 🔐 JWT-based authentication with token expiry
- 🔒 Password hashing with bcrypt (12 salt rounds)
- ✅ Request validation with **Zod**
- 📖 Interactive **Swagger / OpenAPI** documentation
- 🛡️ Security headers via **Helmet**
- 📄 Paginated post listing
- 👤 Ownership enforcement (users can only edit/delete their own posts)
- 🌐 CORS enabled
- 📋 Structured logging with **Morgan**
- ⚠️ Centralized error handling with meaningful HTTP status codes

---

## 🗄️ Database Choice: MongoDB (via Mongoose)

**Why MongoDB?**

| Factor | Reason |
|---|---|
| Flexible schema | Blog content naturally varies in structure |
| Embedded documents | Author info can be populated efficiently |
| Scalability | Horizontal scaling suits read-heavy blog traffic |
| Developer speed | JSON-native data model aligns with Node.js |
| Mongoose ODM | Clean schema validation and lifecycle hooks |

The **One-to-Many** relationship (User → Posts) is implemented via a `author` field in the Post schema, referencing the User's `_id` (MongoDB ObjectId).

---

## 🏗️ Project Structure

```
blog-api/
├── index.js                    # Entry point — app bootstrap & server start
├── .env.example                # Environment variable template
├── .gitignore
├── package.json
├── swagger/
│   └── openapi.yaml            # OpenAPI 3.0 spec
└── src/
    ├── config/
    │   └── db.js               # MongoDB connection
    ├── controllers/
    │   ├── authController.js   # Registration, login, profile
    │   └── postsController.js  # CRUD operations for posts
    ├── middlewares/
    │   ├── auth.js             # JWT verification middleware
    │   └── errorHandler.js     # Global error handler & 404
    ├── models/
    │   ├── User.js             # User schema (bcrypt hashing)
    │   └── Post.js             # Post schema (author reference)
    ├── routes/
    │   ├── auth.js             # /auth routes
    │   └── posts.js            # /posts routes
    └── validators/
        └── schemas.js          # Zod schemas + validate() middleware
```

---

## 🚀 Setup & Running Locally

### Prerequisites

- Node.js >= 16.0.0
- MongoDB running locally **or** a [MongoDB Atlas](https://www.mongodb.com/atlas) free cluster URI

### 1. Clone the repository

```bash
git clone https://github.com/your-username/blog-api.git
cd blog-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/blog_platform
JWT_SECRET=replace_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

> ⚠️ **Never commit your `.env` file.** It's already in `.gitignore`.

### 4. Start the server

```bash
# Development (auto-reload with nodemon)
npm run dev

# Production
npm start
```

The server starts at: **http://localhost:3000**

---

## 📚 API Documentation

Interactive Swagger UI is available at:

```
http://localhost:3000/api-docs
```

You can test all endpoints directly from the browser. After logging in, click **Authorize** and paste your JWT token.

---

## 📋 API Endpoints

### Auth Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/auth/register` | Public | Create a new user account |
| `POST` | `/auth/login` | Public | Log in and receive a JWT |
| `GET` | `/auth/me` | 🔒 Private | Get current user profile |

### Post Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/posts` | Public | Get all posts (paginated) |
| `GET` | `/posts/:id` | Public | Get a single post |
| `POST` | `/posts` | 🔒 Private | Create a new post |
| `PUT` | `/posts/:id` | 🔒 Private (Owner) | Update a post |
| `DELETE` | `/posts/:id` | 🔒 Private (Owner) | Delete a post |

**Pagination query params for `GET /posts`:**
- `?page=1` — page number (default: 1)
- `?limit=10` — items per page (default: 10, max: 50)

---

## 🔐 Authentication Flow

1. **Register** → `POST /auth/register` with `{ name, email, password }`
2. **Login** → `POST /auth/login` → receive `token`
3. **Use token** → Set header: `Authorization: Bearer <token>` on protected routes

---

## ✅ Validation Rules

| Field | Rules |
|---|---|
| `name` | Required, 2–50 characters |
| `email` | Required, valid email format |
| `password` | Required, min 8 chars, must contain uppercase + lowercase + number |
| `post.title` | Required, 3–200 characters |
| `post.content` | Required, min 10 characters |

---

## ⚠️ HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK — successful GET / DELETE |
| `201` | Created — successful POST |
| `400` | Bad Request — validation error |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — valid JWT but not the resource owner |
| `404` | Not Found — resource doesn't exist |
| `409` | Conflict — e.g., email already registered |
| `500` | Internal Server Error |

---

## 🧪 Quick Test with cURL

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"SecurePass1"}'

# Login (save the token)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"SecurePass1"}'

# Create a post (replace TOKEN with the JWT from login)
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Hello World","content":"This is my first blog post content here!"}'

# Get all posts
curl http://localhost:3000/posts
```

---

## 🛡️ Security Highlights

- Passwords hashed with **bcrypt** (12 salt rounds) — never stored in plain text
- JWT secrets stored in environment variables — never hardcoded
- `select: false` on password field — never accidentally returned in queries
- **Helmet** middleware sets 15+ secure HTTP response headers
- JSON body size limited to **10KB** to prevent payload flooding
- Ownership verified before any mutation (update/delete)

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT signing & verification |
| `zod` | Schema validation |
| `dotenv` | Environment variables |
| `helmet` | Security HTTP headers |
| `cors` | Cross-Origin Resource Sharing |
| `morgan` | HTTP request logging |
| `swagger-ui-express` | Swagger UI hosting |
| `yamljs` | Parse OpenAPI YAML spec |
