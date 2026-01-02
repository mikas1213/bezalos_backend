"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const logger_1 = require("./common/middleware/logger");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const hpp_1 = __importDefault(require("hpp"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_xss_sanitizer_1 = require("express-xss-sanitizer");
const credentials_1 = require("./common/middleware/credentials");
const corsOptions_1 = require("./common/config/corsOptions");
const cors_1 = __importDefault(require("cors"));
const rateLimiter_1 = require("./common/middleware/rateLimiter");
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
const globalErrorHandler_1 = require("./common/middleware/globalErrorHandler");
const listApiEndPoints_1 = require("./common/utils/listApiEndPoints");
const socket_io_1 = require("socket.io");
const allowedOrigins_1 = require("./common/config/allowedOrigins");
const options = {
    path: './.env_bezalos'
};
dotenv_1.default.config(options);
const app = (0, express_1.default)();
app.use(logger_1.logger);
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
app.use((0, hpp_1.default)());
app.use((0, cookie_parser_1.default)());
app.use((0, express_xss_sanitizer_1.xss)());
app.use(credentials_1.credentials);
app.use((0, cors_1.default)(corsOptions_1.corsOptions));
app.use('/api', rateLimiter_1.rateLimiter);
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
app.use(globalErrorHandler_1.globalErrorHandler);
const server = app.listen(process.env.PORT || 3003, function () {
    console.log(`Server running on ${process.env.PORT}`);
    if (process.env.NODE_ENV === 'development_')
        (0, listApiEndPoints_1.listApiEndpoints)(app);
});
server.timeout = 1800000; // 30.00 minutes (default: 120000 = 2 min)
server.keepAliveTimeout = 1810000; // 30.16 minutes
server.headersTimeout = 1815000; // 30.25 minutes
const io = new socket_io_1.Server(server, {
    cors: {
        origin: allowedOrigins_1.allowedOrigins.filter(Boolean),
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
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    if (err instanceof Error) {
        console.error(err.name, err.message);
    }
    else {
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
