require('dotenv').config({path: './.env_bezalos'});

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});

const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const helmet = require('helmet');
const compression = require('compression');

const { logger } = require('./middleware/logsMiddleware/logEvents');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const corsOptions = require('./config/corsOptions');
const credentials = require('./middleware/credentials');

const sitemapRouter = require('./routes/sitemapRoutes');
const authRouter = require('./routes/authRoutes');
const videoRouter = require('./routes/videoRoutes');
const commentsRouter = require('./routes/commentsRoutes');
const profileRouter = require('./routes/profileRoutes');
const mailerRouter = require('./routes/mailerRoutes');
const paymentRouter = require('./routes/paymentRoutes');
const customersRouter = require('./routes/adminRoutes/customersRoutes');
const nutritionPlansRouter = require('./routes/adminRoutes/nutritionPlansRoutes');
const servicesRouter = require('./routes/servicesRoutes');
const recipesRouter = require('./routes/recipesRoutes');
const promotionRouter = require('./routes/promotionRoutes');
const likesRouter = require('./routes/likesRoutes');

const adminRecipesRouter = require('./routes/adminRoutes/adminRecipesRoutes');
const adminServicesRouter = require('./routes/adminRoutes/adminServicesRoutes');
const adminPromotionsRouter = require('./routes/adminRoutes/adminPromotionsRoutes');
const adminVideosRouter = require('./routes/adminRoutes/adminVideoRoutes');

// const anthropicRoutes = require('./routes/adminRoutes/anthropicRoutes');

app.use(logger);
app.use(helmet());
app.use(compression());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cookieParser());
app.use(hpp());
app.use(require('sanitize').middleware);

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

// app.use('/api/v1/anthropic', anthropicRoutes);

app.all('*', (req, res) => {
    res.status(404).json({
        status: 'not found'
    });
});

app.use(errorHandler);
const server = app.listen(process.env.PORT || 3003, function() {
    console.log(`Server running on ${process.env.PORT }`)
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
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