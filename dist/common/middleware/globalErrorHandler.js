"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const logger_1 = require("./logger");
const sendErrorDev = (err, res) => {
    console.error('ERROR 💥', err);
    return res.status(err.statusCode ?? 500).json({
        status: err.status ?? 'error',
        error: err,
        message: err.message,
        stack: err.stack
    });
};
const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        return res.status(err.statusCode ?? 500).json({
            status: err.status,
            message: err.message
        });
    }
    console.error('ERROR 💥', err);
    return res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
    });
};
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode ?? 500;
    err.status = err.status ?? 'error';
    (0, logger_1.logEvents)(`${err.name}: ${err.message}`, 'errors_log.txt');
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    }
    else {
        sendErrorProd(err, res);
    }
};
exports.globalErrorHandler = globalErrorHandler;
