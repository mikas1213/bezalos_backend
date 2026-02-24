const AppError = require('./AppError');

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400, true);
        this.name = 'ValidationError';
    }
}

module.exports = ValidationError;