import sgMail from '@sendgrid/mail';
import type { MailDataRequired } from '@sendgrid/mail';
import { AppError } from '../errors/AppError';
import { messages } from './constants';
import type { InitialTarget, SendEmailProps } from './types';

export class EmailService {
	private readonly apiKey: string;
	private readonly emailFrom: string;
	private readonly templateWelcomeId: string;
	private readonly templateForgotPasswordId: string;
	private readonly templateNewsletterId: string;
	private readonly templateOfferId: string;
	private readonly templateCourseId: string;

	constructor() {
		this.apiKey = this.requireEnv('SENDGRID_API_KEY');
		this.emailFrom = this.requireEnv('SENDGRID_EMAIL_FROM');
		this.templateWelcomeId = this.requireEnv('SENDGRID_TEMPLATE_WELCOME');
		this.templateForgotPasswordId = this.requireEnv('SENDGRID_TEMPLATE_FORGOT_PASSWORD');
		this.templateNewsletterId = this.requireEnv('SENDGRID_TEMPLATE_NEWSLETTER');
		this.templateOfferId = this.requireEnv('SENDGRID_TEMPLATE_OFFER');
		this.templateCourseId = this.requireEnv('SENDGRID_TEMPLATE_COURSE');
		sgMail.setApiKey(this.apiKey);
	}

	private requireEnv(name: string): string {
		const value = process.env[name];
		if (!value) {
			throw AppError.internal(`Missing env variable: ${name}`);
		}
		return value;
	}

	async sendEmail({ templateId, email, initialTarget = '', token = '', subject }: SendEmailProps): Promise<void> {
		const message: MailDataRequired = {
			from: {
				email: this.emailFrom,
				name: 'Sandra | Be žalos',
			},
			personalizations: [
				{
					to: [{ email }],
					dynamicTemplateData: {
						token,
						subject,
						message: messages[initialTarget as InitialTarget]?.text,
						button: messages[initialTarget as InitialTarget]?.btn,
					},
				},
			],
			templateId,
		};
		await sgMail.send(message);
	}

	async sendWelcome(email: string, initialTarget: InitialTarget): Promise<void> {
		await this.sendEmail({
			templateId: this.templateWelcomeId,
			email,
			initialTarget,
			subject: 'Tavo registracija sėkminga 🥳',
		});
	}

	async sendPasswordReset(email: string, token: string): Promise<void> {
		await this.sendEmail({ templateId: this.templateForgotPasswordId, email, token, subject: 'Tavo slaptadžodis jau čia 👀' });
	}

	// async sendNewsletter(email: string) {
	// 	await this.sendEmail({ templateId: this.templateNewsletterId, email, subject: 'Tavo prenumerata sėkminga 💌' });
	// }

	// async sendOffer() {
	// 	const templateId: string | undefined = process.env.SENDGRID_TEMPLATE_OFFER;
	// 	if (!templateId) {
	// 		throw AppError.internal('SENDGRID TEMPLATE OFFER ID is missing');
	// 	}
	// 	await this.sendEmail(templateId, 'Nieko nevalgau, o auga svoris. Pažįstama?');
	// }

	// async sendCourse() {
	// 	const templateId: string | undefined = process.env.SENDGRID_TEMPLATE_COURSE;
	// 	if (!templateId) {
	// 		throw AppError.internal('SENDGRID TEMPLATE COURSE ID is missing');
	// 	}
	// 	await this.sendEmail(templateId, '📩 Tavo kursas jau paruoštas!');
	// }
}
