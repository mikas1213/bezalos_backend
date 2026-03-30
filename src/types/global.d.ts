import { Server } from 'socket.io';
export type VideoCategory = 'Kursai' | 'Nemokamas' | 'Pokalbis' | 'Trumpai' | 'Vebinaras';

declare global {
	namespace NodeJS {
		interface Global {
			io: Server;
		}
	}

	var io: Server;

	namespace Express {
		interface Request {
			user?: {
				id: string;
				role: number;
			};
			video?: {
				category: VideoCategory;
			};
			userHasCourse?: boolean;
			userHasSubscription?: boolean;
		}
	}
}

export {};
