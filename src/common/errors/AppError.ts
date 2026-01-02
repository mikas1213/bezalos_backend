export class AppError extends Error {
    public statusCode: number;
    public status: string;
    public isOperational: boolean;

    constructor(
        message: string, 
        statusCode: number = 500, 
        isOperational: boolean = true, 
        stack: string = ''
    ) {        
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}