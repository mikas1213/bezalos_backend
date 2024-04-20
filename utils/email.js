const sgMail = require('@sendgrid/mail');

const messages = {
    profilis: {
        text: 'Jungiantis į bendruomenę pasirinkai, kad tave domina sveikas svorio metimas, šį tikslą lengviausiai tau padės pasiekti narystė "MINI"', 
        btn: 'Narystė'
    },
    virtuve: {
        text: 'Jungiantis į bendruomenę pasirinkai, kad tave domina išmokti sveikatai palankios mitybos pagrindų, šį tikslą lengviausiai tau padės pasiekti narystė Valgau be žalos | Virtuvėje',
        btn: 'Į Virtuvę'
    },
    abu: {
        text: 'Jungiantis į bendruomenę pasirinkai, kad tave domina išmokti sveikatai palankios mitybos pagrindų bei sveikai sumažinti savo kūno svorį, šį tikslą lengviausiai tau padės pasiekti narystė "MAXI"',
        btn: 'Narystė'        
    },
    nezinau: {
        text: 'Jungiantis į bendruomenę pasirinkai, kad dar nežinai kas tave šiame projekte domina, tad kviečiu pasižvalgyti',
        btn: 'Pasižvalgyti'
    }
}

module.exports = class Email {
    constructor(email, initial_target, token) {
        this.email = email;
        this.initial_target = initial_target;
        this.token = token;
    }

    async sendEmail(template) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const message = {
            from: { 
                email: process.env.SENDGRID_EMAIL_FROM,
                name: "Sandra | Valgau be žalos",
            },
            personalizations: [{ 
                to: [{ email: this.email }],
                dynamic_template_data: {
                    "token": this.token,
                    "subject": "Tavo registracija sėkminga 🥳",
                    "message": messages[this.initial_target]?.text,
                    "button": messages[this.initial_target]?.btn
                }
            }],
            template_id: template
        };
        await sgMail.send(message);
    }

    async sendWelcome() {
        await this.sendEmail('d-87d1d111a55d4f3597d8cca5f7b9b406');
    }

    async sendForgotPassword() {
        await this.sendEmail(process.env.SENDGRID_RESET_PSW_TEMPLATE_ID);
    }
}