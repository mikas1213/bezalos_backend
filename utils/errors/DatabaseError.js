const AppError = require('./AppError');

/**
 * Duomenų bazės klaidų klasė
 */
class DatabaseError extends AppError {
    constructor(message, originalError = null) {
        super(message, 500, true);
        this.name = 'DatabaseError';
        this.originalError = originalError;
    }
}

module.exports = DatabaseError;