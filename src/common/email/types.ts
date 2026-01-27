export type InitialTarget = 'profilis' | 'virtuve' | 'abu' | 'nezinau';

export interface SendEmailProps {
	templateId: string;
	email: string;
	initialTarget?: InitialTarget | '';
	token?: string;
	subject: string;
}
