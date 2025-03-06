const AppError = require('./AppError');

class PaymentRequiredError extends AppError {
    constructor(message = 'Norėdami tęsti, turite apmokėti paslaugą') {
        super(message, 402, true);
        this.name = 'PaymentRequiredError';
    }
}

module.exports = PaymentRequiredError; 