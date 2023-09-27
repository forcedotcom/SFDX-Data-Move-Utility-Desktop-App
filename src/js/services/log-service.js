"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogService = void 0;
const path = __importStar(require("path"));
const winston = __importStar(require("winston"));
require("winston-daily-rotate-file");
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const common_1 = require("../common");
const utils_1 = require("../utils");
const dialog_service_1 = require("./dialog-service");
/** LogService class for logging messages to the console and log file. */
class LogService {
    /**
     * Creates a Winston logger instance with daily rotation file transport.
     * @returns The created Winston logger instance.
     */
    static createWinstonLogger() {
        const transport = new CustomDailyRotateFile(Object.assign({
            filename: LogService._getFilename(),
        }, common_1.CONSTANTS.LOGGER.Config));
        return winston.createLogger({
            transports: [
                transport
            ],
            format: winston.format.combine(winston.format.timestamp(common_1.CONSTANTS.LOGGER.WinstonFormatTimestamp), winston.format.printf((info) => {
                if (info.message && info.message.startsWith('#')) {
                    return `${info.message.slice(1)}`;
                }
                return `[${info.timestamp}][${info.level.toUpperCase()}] ${info.message}`;
            })),
        });
    }
    /**
     * Logs an info-level message.
     * @param message - The log message.
     * @param caller - The caller information.
     * @returns The caller information.
     */
    static info(message, caller) {
        caller || (caller = utils_1.CommonUtils.getFunctionCaller());
        LogService._logger.info(LogService._formatMessage(caller, message));
        return caller;
    }
    /**
     * Logs a warning-level message.
     * @param message - The log message.
     * @param caller - The caller information.
     * @returns The caller information.
     */
    static warn(message, caller) {
        caller || (caller = utils_1.CommonUtils.getFunctionCaller());
        LogService._logger.warn(LogService._formatMessage(caller, message, common_1.MessageType.warning));
        return caller;
    }
    /**
     * Logs an error-level message.
     * @param message - The log message.
     * @param caller - The caller information.
     * @returns The caller information.
     */
    static error(message, caller) {
        caller || (caller = utils_1.CommonUtils.getFunctionCaller());
        LogService._logger.error(LogService._formatMessage(caller, message, common_1.MessageType.error));
        return caller;
    }
    /**
     * Logs an error object with caller information.
     * @param ex - The error object.
     * @param caller - The caller information.
     * @returns The caller information.
     */
    static errorEx(ex, caller) {
        caller || (caller = utils_1.CommonUtils.getFunctionCaller(ex));
        LogService._logger.error(LogService._formatMessage(caller, `\n${caller.fullStackTrace}`, common_1.MessageType.error));
        return caller;
    }
    /**
     * Logs an unhandled exception with caller information.
     * @param ex - The unhandled exception.
     * @param caller - The caller information.
     * @returns The caller information.
     */
    static unhandledExeption(ex, caller) {
        LogService.errorEx(ex, caller);
        global.appGlobal.hasUnhandledError = true;
        dialog_service_1.DialogService.showDialog(common_1.CONSTANTS.LOGGER.UnhandledErrorMessagePattern(ex.message), common_1.DialogType.danger);
        return caller;
    }
    /**
     * Gets the logger instance.
     */
    static get _logger() {
        return LogService._winston || (LogService._winston = LogService.createWinstonLogger());
    }
    /**
     * Formats the log message based on caller information.
     * @param caller - The caller information.
     * @param message - The log message.
     * @returns The formatted log message.
     */
    static _formatMessage(caller, message, messageType = common_1.MessageType.info) {
        if (message && !message.endsWith('.') && !message.startsWith('#')) {
            message += '.';
        }
        let formattedFileMessage = '';
        if (message && message.startsWith('#')) {
            formattedFileMessage = common_1.CONSTANTS.LOGGER.UnformattedFileLogMessagePattern(caller.functionName, caller.lineNumber, message);
        }
        else {
            formattedFileMessage = common_1.CONSTANTS.LOGGER.FileLogMessagePattern(caller.functionName, caller.lineNumber, message);
        }
        const formattedConsoleMessage = common_1.CONSTANTS.LOGGER.ConsoleLogMessagePattern(formattedFileMessage, messageType);
        switch (messageType) {
            default:
                console.log(formattedConsoleMessage);
                break;
            case common_1.MessageType.warning:
                console.warn(formattedConsoleMessage);
                break;
            case common_1.MessageType.error:
                console.error(formattedConsoleMessage);
                break;
        }
        return formattedFileMessage;
    }
    /**
     *  Gets the current log full file name.
     * @returns The log full file name.
     */
    static getLogFilename() {
        const filename = LogService._logger.transports[0].getFilename();
        return filename;
    }
    /**
     * Gets the log file name.
     * @returns The log file name.
     */
    static _getFilename() {
        return utils_1.AppUtils.getAppPath(common_1.AppPathType.logsPath, common_1.CONSTANTS.LOG_FILENAME_TEMPLATE);
    }
}
exports.LogService = LogService;
/* #region Helper Classes */
/**
 * CustomDailyRotateFile class adds custom functionality to the DailyRotateFile class.
 */
class CustomDailyRotateFile extends winston_daily_rotate_file_1.default {
    /**
     * Constructs a new instance of the CustomDailyRotateFile class.
     * @param {DailyRotateFile.DailyRotateFileTransportOptions} options - Options for the transport.
     */
    constructor(options) {
        super(options);
        /**
         * Event listener for the 'new' event emitted by the parent class.
         * Sets the value of _thisFilename when a new log file is created.
         * @param {string} newFilename - The new log filename.
         * @private
         */
        this.on('new', (newFilename) => {
            this._thisFilename = newFilename;
        });
    }
    /**
     * Retrieves the current log filename using the parent class's _getFile() method.
     * Emits a 'new' event if the filename has changed.
     * @returns {string} - The current log filename.
     * @private
     */
    _getFile() {
        const filename = super['_getFile']();
        if (filename !== this._filename) {
            this._filename = filename;
            this.emit('new', path.join(this.dirname, this._filename));
        }
        return filename;
    }
    /**
     * Retrieves the current log filename specific to this instance.
     * @returns {string} - The current log filename.
     */
    getFilename() {
        return this._thisFilename || '';
    }
}
/* #endregion */
//# sourceMappingURL=log-service.js.map