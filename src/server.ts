process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});


import dotenv, { DotenvConfigOptions } from 'dotenv';
import express from 'express';
import { logger } from './common/middleware/logger';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import { xss } from 'express-xss-sanitizer';
import { credentials } from './common/middleware/credentials';
import { corsOptions } from './common/config/corsOptions';
import cors from 'cors';
import { rateLimiter } from './common/middleware/rateLimiter';

/* R-O-U-T-E-S */
const sitemapRouter = require('../routes/sitemapRoutes');
const authRouter = require('../routes/authRoutes');
const videoRouter = require('../routes/videoRoutes');
const commentsRouter = require('../routes/commentsRoutes');
const profileRouter = require('../routes/profileRoutes');
const mailerRouter = require('../routes/mailerRoutes');
const paymentRouter = require('../routes/paymentRoutes');
const servicesRouter = require('../routes/servicesRoutes');
const promotionRouter = require('../routes/promotionRoutes');
const recipesRouter = require('../routes/recipesRoutes');
const likesRouter = require('../routes/likesRoutes');
const adminPromotionsRouter = require('../routes/adminRoutes/adminPromotionsRoutes');
const adminServicesRouter = require('../routes/adminRoutes/adminServicesRoutes');
const adminRecipesRouter = require('../routes/adminRoutes/adminRecipesRoutes');
const adminVideosRouter = require('../routes/adminRoutes/adminVideoRoutes');
const customersRouter = require('../routes/adminRoutes/customersRoutes');
const nutritionPlansRouter = require('../routes/adminRoutes/nutritionPlansRoutes');

import { globalErrorHandler } from './common/middleware/globalErrorHandler';
import { listApiEndpoints } from './common/utils/listApiEndPoints';
import { Server } from 'socket.io';
import { allowedOrigins } from './common/config/allowedOrigins';

const options: DotenvConfigOptions = {
    path: './.env_bezalos'
};
dotenv.config(options);

const app = express();
app.use(logger);
app.use(helmet());
app.use(compression());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(hpp());
app.use(cookieParser());
app.use(xss());
app.use(credentials);
app.use(cors(corsOptions));

app.use('/api', rateLimiter);
app.use('/sitemap.xml', sitemapRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/videos', videoRouter);
app.use('/api/v1/comments', commentsRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/mailer', mailerRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/services', servicesRouter);
app.use('/api/v1/promo', promotionRouter);
app.use('/api/v1/recipes', recipesRouter);
app.use('/api/v1/likes', likesRouter);
app.use('/api/v1/admin', [
    adminPromotionsRouter,
    adminServicesRouter,
    adminRecipesRouter,
    adminVideosRouter,
    customersRouter, 
    nutritionPlansRouter
]);
app.get('/api/v1/config', (req, res) => {
    res.json(process.env.SOCKET_URL);
});

app.all('*', (req, res) => {
    res.status(404).json({
        status: 'not found'
    });
});
app.use(globalErrorHandler);

const server = app.listen(process.env.PORT || 3003, function() {
    console.log(`Server running on ${process.env.PORT }`);
    if(process.env.NODE_ENV === 'development_') listApiEndpoints(app);
});

server.timeout = 1800000;           // 30.00 minutes (default: 120000 = 2 min)
server.keepAliveTimeout = 1810000;  // 30.16 minutes
server.headersTimeout = 1815000;    // 30.25 minutes

const io = new Server(server, {
    cors: {
        origin: allowedOrigins.filter(Boolean),
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    },
    allowEIO3: true,
    transports: ['websocket', 'polling'],
});


io.on('connection', (socket) => {
    console.log(`SERVER: Client connected: ${socket.id}`);
    
    socket.on('disconnect', (reason) => {
        console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });
});

global.io = io;


process.on('unhandledRejection', (err: unknown) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    if(err instanceof Error) {
        console.error(err.name, err.message);
    } else {
        console.error('Unknown rejection:', err);
    }
    server.close(() => {
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
        console.log('💥 Process terminated!');
        process.exit(1);
    });
});


process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down 📉 gracefully');
    server.close(() => {
        console.log('Process terminated!');
        process.exit(1);
    });
});