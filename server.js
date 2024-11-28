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

const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes');
const profileRoutes = require('./routes/profileRoutes');
const mailerRoutes = require('./routes/mailerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const customersRoutes = require('./routes/adminRoutes/customersRoutes');
const nutritionPlansRoutes = require('./routes/adminRoutes/nutritionPlansRouter');

// const limiter = rateLimit({
//     windowMs: 10 * 60 * 1000, 
//     max: 120,
//     message: 'Too many requests.'
// });

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

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/mailer', mailerRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin', [
    customersRoutes, 
    nutritionPlansRoutes
]);


app.all('*', (req, res) => {
    res.status(404).json({
        status: 'not found'
    });
});

app.listen(process.env.PORT || 3003, function() {
    console.log(`Server running on ${process.env.PORT }`)
});
