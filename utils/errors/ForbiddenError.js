const AppError = require('./AppError');

class ForbiddenError extends AppError {
    constructor(message = 'Prieiga uždrausta') {
        super(message, 403, true);
        this.name = 'ForbiddenError';
    }
}

module.exports = ForbiddenError;