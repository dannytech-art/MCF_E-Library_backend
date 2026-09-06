require('dotenv').config();

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

app.use(express.json());

const port = process.env.PORT || 4784;

require('./config/db');

const userRouter = require('./modules/users/userRouter');
const facultyRouter = require('./modules/faculty/facultyRouter');

/**
 * @swagger
 * /:
 *   get:
 *     tags: [Health]
 *     summary: API welcome message
 *     responses:
 *       200:
 *         description: Service is running.
 */
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'MCF E-Library API',
        docs: '/api-docs',
        spec: '/api-docs.json'
    });
});

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: API is healthy.
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime()
    });
});

/**
 * @swagger
 * /api-docs.json:
 *   get:
 *     tags: [Health]
 *     summary: OpenAPI specification
 *     responses:
 *       200:
 *         description: Raw OpenAPI JSON.
 */
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'MCF E-Library API Docs',
    swaggerOptions: {
        persistAuthorization: true
    }
}));

app.use(facultyRouter);
app.use(userRouter);

app.use((req, res) => {
    res.status(404).json({
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
