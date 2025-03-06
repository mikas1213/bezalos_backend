const AppError = require('./AppError');
const ValidationError = require('./ValidationError');
const NotFoundError = require('./NotFoundError');
const DatabaseError = require('./DatabaseError');
const RateLimitError = require('./RateLimitError');
const ForbiddenError = require('./ForbiddenError');
const UnauthorizedError = require('./UnauthorizedError');
const PaymentRequiredError = require('./PaymentRequiredError');

// class ForbiddenError extends AppError {
//     constructor(message = 'Prieiga uždrausta') {
//         super(message, 403, true);
//         this.name = 'ForbiddenError';
//     }
// }

module.exports = {
    AppError,
    ValidationError,
    NotFoundError,
    DatabaseError,
    RateLimitError,
    ForbiddenError,
    UnauthorizedError,
    PaymentRequiredError
};