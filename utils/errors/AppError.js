class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true, stack = '') {        
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    // static unauthorized(message = 'Neteisinga autentifikacija') {
    //     return new AppError(message, 401, true);
    // }
      
    // static forbidden(message = 'Prieiga uždrausta') {
    //     return new AppError(message, 403, true);
    // }
}

module.exports = AppError;