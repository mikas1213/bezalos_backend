import { Request, Response, NextFunction } from 'express';
import { logEvents } from './logger';

interface AppError extends Error {
	statusCode?: number;
	status?: 'fail' | 'error';
	isOperational?: boolean;
	errors?: Record<string, string[]>;
}
console.log('asf');
const sendErrorDev = (err: AppError, res: Response): Response => {
	console.error('ERROR 💥', err);
	console.log('DEV-err.errors:', err.errors); // ← pridėk
	console.log('DEV-err.isOperational:', err.isOperational);
	return res.status(err.statusCode ?? 500).json({
		status: err.status ?? 'error',
		error: err,
		message: err.message,
		stack: err.stack,
	});
};

const sendErrorProd = (err: AppError, res: Response): Response => {
	console.log('PROD-err.errors:', err.errors); // ← pridėk
	console.log('PROD-err.isOperational:', err.isOperational);
	if (err.isOperational) {
		return res.status(err.statusCode ?? 500).json({
			status: err.status,
			message: err.message,
			error: err,
			// ...(err.errors && { errors: err.errors }),
		});
	}

	console.error('ERROR 💥', err);
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
