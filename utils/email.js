// const fs = require('fs');
// const path = require('path');
// const { PDFDocument } = require('pdf-lib');
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
    }
}


    // if (fs.existsSync(path_to_pdf)) {
    //     console.log('Failas egzistuoja:', path_to_pdf);
    // } else {
    //     console.log('Failas neegzistuoja:', path_to_pdf);
    // }

module.exports = class Email {
    constructor(email, initial_target, token) {
        this.email = email;
        this.initial_target = initial_target;
        this.token = token;
    }

    async sendEmail(template, subject) {
        console.log('Meilas buvo išsiųstas:', template, subject);
        // const path_to_pdf = path.join(__dirname, '..', 'test.pdf');
        // const pdf_doc = await PDFDocument.load(path_to_pdf);
        // const encryptedBytes = await pdf_doc.save({
        //     password: 1234,
        //     permissions: {
        //         printing: 'highResolution',
        //         modifying: false,
        //         copying: false,
        //         annotating: false,
        //         fillingForms: false,
        //         contentAccessibility: true,
        //         documentAssembly: false,
        //     }
        // });
        // const pdf_content = Buffer.from(encryptedBytes).toString('base64');

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        const message = {
            from: { 
                email: process.env.SENDGRID_EMAIL_FROM,
                name: 'Sandra | Be žalos',
            },
            personalizations: [{ 
                to: [
                    { email: this.email },
                    // { email: 'mikas1213@yahoo.com', name: 'Grybas' }
                ],
                dynamic_template_data: {
                    'token': this.token,
                    'subject': subject,
                    'message': messages[this.initial_target]?.text,
                    'button': messages[this.initial_target]?.btn
                }
            }],
            template_id: template,
            // attachments: [
            //     {
            //         content: pdf_content,
            //         filename: 'dokumentas.pdf',
            //         type: 'application/pdf',
            //         disposition: 'attachment'
            //     }
            // ]
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
        await this.sendEmail(process.env.SENDGRID_TEMPLATE_COURSE || 'd-bae566213d914f589bf0e376b024fcb9', 'Labas, įsigyjai kursą!');
    }
}