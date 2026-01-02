"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.logEvents = void 0;
const date_fns_1 = require("date-fns");
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const logEvents = async (message, logName) => {
    const dateTime = `${(0, date_fns_1.format)(new Date(), 'yyyy-MM-dd\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${message}\n`;
    try {
        if (!fs_1.default.existsSync(path_1.default.join(__dirname, '..', '..', 'logs'))) {
            await promises_1.default.mkdir(path_1.default.join(__dirname, '..', '..', 'logs'));
        }
        await promises_1.default.appendFile(path_1.default.join(__dirname, '..', '..', 'logs', logName), logItem);
    }
    catch (err) {
        console.log(err);
    }
};
exports.logEvents = logEvents;
const logger = (req, res, next) => {
    (0, exports.logEvents)(`${req.method}\t${req.headers.origin}\t${req.url}`, 'req_log.txt');
    next();
};
exports.logger = logger;
