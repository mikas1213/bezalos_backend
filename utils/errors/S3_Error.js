const AppError = require('./AppError');

class S3_Error extends AppError {
    constructor(message, originalError = null) {
        super(message, 500, true);
        this.name = 'S3_Error';
        this.originalError = originalError;
    }
}

module.exports = S3_Error;