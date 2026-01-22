export type AppErrorStatus = 'fail' | 'error';

export class AppError extends Error {
	public readonly statusCode: number;
	public readonly status: AppErrorStatus;
	public readonly isOperational: boolean;

	constructor(
		message: string,
		statusCode: number = 500,
		isOperational: boolean = true,
		stack?: string,
	) {
		super(message);

		this.statusCode = statusCode;
		this.isOperational = isOperational;
		this.status = statusCode.toString().startsWith('4') ? 'fail' : 'error';

		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}

	static badRequest(message: string = 'Bad request'): AppError {
		return new AppError(message, 400);
	}

	static unauthorized(message: string = 'Unauthorized'): AppError {
		return new AppError(message, 401);
	}

	static forbidden(message: string = 'Forbidden'): AppError {
		return new AppError(message, 403);
	}

	static notFound(message: string = 'Not found'): AppError {
		return new AppError(message, 404);
	}

	static conflict(message: string = 'Conflict'): AppError {
		return new AppError(message, 409);
	}

	static tooManyRequests(message: string = 'Too many requests'): AppError {
		return new AppError(message, 429);
	}

	static internal(message: string = 'Internal server error'): AppError {
		return new AppError(message, 500, false);
	}
}
