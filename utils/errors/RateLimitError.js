const AppError = require('./AppError');

/**
 * Per dažnų užklausų klaidos klasė (Rate limiting)
 */
class RateLimitError extends AppError {
    constructor(message) {
        super(message, 429, true);
        this.name = 'RateLimitError';
    }
}

module.exports = RateLimitError; 