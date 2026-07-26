const sgMail = require('@sendgrid/mail');

const messages = {
    profilis: {
        text: 'Jungiantis į bendruomenę pasirinkai, kad tave domina sveikas svorio metimas, šį tikslą lengviausiai tau padės pasiekti narystė "Profilis"', 
        btn: 'Narystė'
    },
    virtuve: {
        text: 'Jungiantis į bendruomenę pasirinkai, kad tave domina išmokti sveikatai palankios mitybos pagrindų, šį tikslą lengviausiai tau padės pasiekti narystė Valgau be žalos | Virtuvėje',
        btn: 'Į Virtuvę'
    },
    abu: {
        text: 'Jungiantis į bendruomenę pasirinkai, kad tave domina išmokti sveikatai palankios mitybos pagrindų bei sveikai sumažinti savo kūno svorį, šį tikslą lengviausiai tau padės pasiekti narystė "Virtuvė"',
        btn: 'Narystė'        
    },
    nezinau: {
        text: 'Jungiantis į bendruomenę pasirinkai, kad dar nežinai kas tave šiame projekte domina, tad kviečiu pasižvalgyti',
        btn: 'Pasižvalgyti'
    },
    offer: {
        text: '',
        btn: 'ŽIŪRĖTI ĮRAŠĄ'
    },
    course: {
        text: 'Sveikiname prisijungus prie kurso',
        btn: 'Į kursą'
    },
    lekstes: {
        text: '',
        btn: '',
    }
}

module.exports = class Email {
    constructor(email, initial_target, token) {
        this.email = email;
        this.initial_target = initial_target;
        this.token = token;
    }

    async sendEmail(template, subject) {    

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        const message = {
            from: { 
                email: process.env.SENDGRID_EMAIL_FROM,
                name: 'Sandra | Be žalos',
            },
            personalizations: [{ 
                to: [
                    { email: this.email },
                ],
                dynamic_template_data: {
                    'token': this.token,
                    'subject': subject,
                    'message': messages[this.initial_target]?.text,
                    'button': messages[this.initial_target]?.btn
                }
            }],
            template_id: template,
        };
        await sgMail.send(message);
    }

    async sendWelcome() {
        await this.sendEmail(process.env.SENDGRID_TEMPLATE_WELCOME, 'Tavo registracija sėkminga 🥳');
    }

    async sendNewsletter() {
        await this.sendEmail(process.env.SENDGRID_TEMPLATE_NEWSLETTER, 'Tavo prenumerata sėkminga 💌');
    }

    async sendForgotPassword() {
        await this.sendEmail(process.env.SENDGRID_TEMPLATE_FORGOT_PASSWORD, 'Tavo slaptadžodis jau čia 👀');
    }

    async sendOffer() {
        await this.sendEmail(process.env.SENDGRID_TEMPLATE_OFFER, 'Nieko nevalgau, o auga svoris. Pažįstama?');
    }

    async sendCourse() {
        await this.sendEmail(process.env.SENDGRID_TEMPLATE_COURSE || 'd-bae566213d914f589bf0e376b024fcb9', '📩 Tavo kursas jau paruoštas!');
    }

    async send25Lekstes() {
        await this.sendEmail(process.env.SENDGRID_TEMPLATE_25LEKSTES, 'Valgau be žalos | 25 lėkštės be kaltės');
    }
}