const AppError = require('./AppError');

/**
 * Objekto neradimo klaidos klasė
 */
class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404, true);
        this.name = 'NotFoundError';
    }
}

module.exports = NotFoundError;