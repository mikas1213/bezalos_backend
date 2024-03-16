require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
// const xss = require("xss");

const { logger } = require('./middleware/logsMiddleware/logEvents');
const errorHandler = require('./middleware/logsMiddleware/errorHandler');

const corsOptions = require('./config/corsOptions');
const credentials = require('./middleware/credentials');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

app.use(logger);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cookieParser());
app.use(hpp());
// app.use(xss());

app.use(credentials);
app.use(cors(corsOptions));



app.use(errorHandler);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);

app.all('*', (req, res) => {
    res.status(404).json({
        status: 'not found'
    });
});

app.listen(process.env.PORT || 3003);