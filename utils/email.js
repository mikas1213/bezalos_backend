const sgMail = require('@sendgrid/mail');

const messages = {
    profilis: 'Jungiantis į bendruomenę pasirinkai, kad tave domina sveikas svorio metimas, šį tikslą lengviausiai tau padės pasiekti narystė "MINI"'
}

module.exports = class Email {
    constructor(user, initial_target, token) {
        console.log('TEST r: ', initial_target)
        this.email = user.email;
        this.initial_target = initial_target;
        this.token = token;
    }

    async sendEmail(template) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const message = {
            from: { email: process.env.SENDGRID_EMAIL_FROM },
            personalizations: [{ 
                to: [{ email: this.email }],
                dynamic_template_data: {
                    "token": this.token,
                    "message": messages[this.initial_target]
                }
            }],
            template_id: template
        };
        await sgMail.send(message);
    }

    async welcome() {
        await this.sendEmail(process.env.SENDGRID_WELCOME_TEMPLATE_ID);
    }

    async resetPassword() {
        await this.sendEmail(process.env.SENDGRID_RESET_PSW_TEMPLATE_ID);
    }

    
}