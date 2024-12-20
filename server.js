require('dotenv').config({path: './.env_bezalos'});

const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

const cors = require('cors');
const rateLimit = require('express-rate-limit')
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const helmet = require('helmet');

const { logger } = require('./middleware/logsMiddleware/logEvents');
const errorHandler = require('./middleware/logsMiddleware/errorHandler');

const corsOptions = require('./config/corsOptions');
const credentials = require('./middleware/credentials');

const authRouter = require('./routes/authRoutes');
const videoRouter = require('./routes/videoRoutes');
const profileRouter = require('./routes/profileRoutes');
const mailerRouter = require('./routes/mailerRoutes');
const paymentRouter = require('./routes/paymentRoutes');
const customersRouter = require('./routes/adminRoutes/customersRoutes');
const nutritionPlansRouter = require('./routes/adminRoutes/nutritionPlansRoutes');
const servicesRouter = require('./routes/servicesRoutes');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes

    max: function(req) {
        let limit = (req.path.indexOf('auth/refresh') > -1 || req.path.indexOf('/videos') > -1) ? 500 : 150;
        return limit;
    },

    message: req => {
        return {
            status: 429,
            message: `Too many requests.`
        };
    },
    skip: (req) => req.path.indexOf('/admin') > -1
});

app.use(logger);
app.use(helmet());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cookieParser());
app.use(hpp());
app.use(require('sanitize').middleware);

app.use(credentials);
app.use(cors(corsOptions));
app.use(errorHandler);
app.use(limiter);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/videos', videoRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/mailer', mailerRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/services', servicesRouter);
app.use('/api/v1/admin', [
    customersRouter, 
    nutritionPlansRouter
]);


app.all('*', (req, res) => {
    res.status(404).json({
        status: 'not found'
    });
});

app.listen(process.env.PORT || 3003, function() {
    console.log(`Server running on ${process.env.PORT }`)
});
