require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/auth');
const postRoutes = require('./src/routes/posts');
const { errorHandler, notFound } = require('./src/middlewares/errorHandler');

const app = express();

// ──────────────────────────────────────────────
// Security & Utility Middleware
// ──────────────────────────────────────────────
app.use(helmet());                          // Sets secure HTTP headers
app.use(cors());                            // Enable CORS for all origins
app.use(express.json({ limit: '10kb' }));   // Parse JSON bodies (limit to prevent payload attacks)
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// ──────────────────────────────────────────────
// Swagger API Documentation
// ──────────────────────────────────────────────
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger/openapi.yaml'));
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'Blog Platform API Docs',
    swaggerOptions: { persistAuthorization: true },
  })
);

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '📝 Personal Blogging Platform API',
    version: '1.0.0',
    docs: '/api-docs',
    endpoints: {
      auth: { register: 'POST /auth/register', login: 'POST /auth/login', me: 'GET /auth/me' },
      posts: {
        getAll: 'GET /posts',
        getOne: 'GET /posts/:id',
        create: 'POST /posts (🔒)',
        update: 'PUT /posts/:id (🔒)',
        delete: 'DELETE /posts/:id (🔒)',
      },
    },
  });
});

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

// ──────────────────────────────────────────────
// Error Handling
// ──────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ──────────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API Docs available at http://localhost:${PORT}/api-docs`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();

module.exports = app;
