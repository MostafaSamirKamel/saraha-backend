const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db.config');
const userRouter = require('./modules/user/user.router');
const messageRouter = require('./modules/message/message.router');
const conversationRouter = require('./modules/conversation/conversation.router');
const { generalLimiter } = require('./middleware/rateLimit.middleware');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

// Trust proxy for Railway/Vercel (needed for rate-limiting and correct IP)
app.set('trust proxy', 1);

// Middlewares
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use((req, res, next) => {
    console.log(`>>> TRACING: ${req.method} ${req.url}`);
    next();
});
app.use(helmet());
app.use(morgan('dev'));
app.use(generalLimiter);

// Routes
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);
app.use('/api/conversations', conversationRouter);

// Public user lookup
const userController = require('./modules/user/user.controller');
app.get('/api/user/:username', userController.getUserByUsername);

// Error Handling Middleware
app.use(errorMiddleware);

// Root route
app.get('/', (req, res) => {
    res.send('Saraha API is running...');
});

// Database connection and server start
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    });
}

module.exports = app;
