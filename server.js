require('dotenv').config({path: './.env_bezalos'});

const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
// const xss = require("xss");

const corsOptions = require('./config/corsOptions');
const credentials = require('./middleware/credentials');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cookieParser());
app.use(hpp());
// app.use(xss());

app.use(credentials);
app.use(cors(corsOptions));

const viewRoutes = require('./routes/viewRoutes');
app.use('/api', viewRoutes);







app.listen(process.env.PORT || 3003);