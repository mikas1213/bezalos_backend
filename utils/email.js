const sgMail = require('@sendgrid/mail');

module.exports = class Email {
    constructor(user, token) {
        this.to = user.email;
        this.token = token;
    }

    async sendEmail(template) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const message = {
            from: { email: process.env.SENDGRID_EMAIL_FROM },
            personalizations: [{ 
                to: [{ email: this.to }],
                dynamic_template_data: {
                    "token": this.token
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