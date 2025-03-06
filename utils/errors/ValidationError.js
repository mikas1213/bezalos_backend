const AppError = require('./AppError');

/**
 * Validacijos klaidų klasė
 */
class ValidationError extends AppError {
    constructor(message) {
        super(message, 400, true);
        this.name = 'ValidationError';
    }
}

module.exports = ValidationError;