import { Server } from 'socket.io';

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
		}
	}
}

export {};
