const { logEvents } = require('./logsMiddleware/logEvents');

/**
 * Centralizuotas klaidų apdorojimas
 */

// Klaidos formatavimas į atsakymą klientui
const sendErrorDev = (err, res) => {
    console.error('ERROR 💥', err);
    
    return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

// Klaidos formatavimas produkcijos aplinkai (mažiau detalių)
const sendErrorProd = (err, res) => {
  // Operacinė klaida: patikima, galima siųsti klientui
    if (err.isOperational) {
        return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
        });
    }
    
    // Programavimo ar nežinoma klaida: nerodome detalių klientui
    console.error('ERROR 💥', err);
    return res.status(500).json({
        status: 'error',
        message: 'Kažkas nutiko ne taip!'
    });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    logEvents(`${err.name}: ${err.message}`, 'errors_log.txt');
    
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        sendErrorProd(err, res);
    }
};