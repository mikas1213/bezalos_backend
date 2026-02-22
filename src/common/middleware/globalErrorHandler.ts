import { Request, Response, NextFunction } from 'express';
import { logEvents } from './logger';

interface AppError extends Error {
	statusCode?: number;
	status?: 'fail' | 'error';
	isOperational?: boolean;
	errors?: Record<string, string[]>;
}

const sendErrorDev = (err: AppError, res: Response): Response => {
	console.error('ERROR-dev 💥', err);
	return res.status(err.statusCode ?? 500).json({
		errors: err.errors,
		message: err.message,
		stack: err.stack,
	});
};

const sendErrorProd = (err: AppError, res: Response): Response => {
	if (err.isOperational) {
		return res.status(err.statusCode ?? 500).json({
			message: err.message,
			...(err.errors && { errorr: err.errors }),
		});
	}

	console.error('ERROR-prod 💥', err);
	return res.status(500).json({
		status: 'error',
		message: 'Something went wrong!',
	});
};

export const globalErrorHandler = (
	err: AppError,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	err.statusCode = err.statusCode ?? 500;
	err.status = err.status ?? 'error';
	logEvents(`${err.name}: ${err.message}`, 'errors_log.txt');

	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, res);
	} else {
		sendErrorProd(err, res);
	}
};
