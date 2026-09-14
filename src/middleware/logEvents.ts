
import type { RequestHandler } from "express";
import path from 'path';
import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import fs from 'fs';


const fsPromises = fs.promises;

const logEvents = async (message: string, logName: string): Promise<void> => {
    const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;
    try {
        if (!fs.existsSync(path.join(import.meta.dirname, '../../logs'))) {
            await fsPromises.mkdir(path.join(import.meta.dirname, '../../logs'));
        }
        await fsPromises.appendFile(path.join(import.meta.dirname, '../../logs', logName), logItem);
    } catch (err) { 
        console.log(err);
    }      
}; 


const logger: RequestHandler = (req, res, next) => {
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.txt');
    console.log(`${req.method} ${req.path}`);
    next();
}

const registerLog: RequestHandler = (req, res, next) => {
    logEvents(`user: ${req.body.username}\tpass: ${req.body.password}`, 'registerLog.txt');
    console.log(`${req.body.username}pass: ${req.body.password}`);
    next();
}

export { logger, logEvents, registerLog }