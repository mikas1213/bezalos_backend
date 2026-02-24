import { Request, Response, NextFunction } from 'express';
import { format } from 'date-fns';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

export const logEvents = async (message: string, logName: string): Promise<void> => {
    const dateTime = `${format(new Date(), 'yyyy-MM-dd\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${message}\n`;

    try {
        if (!fs.existsSync(path.join(__dirname, '..', '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', '..', 'logs'));
        }

        await fsPromises.appendFile(path.join(__dirname, '..', '..', 'logs', logName), logItem);
    } catch (err) {
        console.log(err);
    }
}

export const logger = (req: Request, res: Response, next: NextFunction) => {
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'req_log.txt');
    next();
}