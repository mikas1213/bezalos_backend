const AppError = require('./AppError');

class UnauthorizedError extends AppError {
    constructor(message = 'Neteisinga autentifikacija') {
        super(message, 401, true);
        this.name = 'UnauthorizedError';
    }
}

module.exports = UnauthorizedError;