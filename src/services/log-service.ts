import * as path from 'path';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import DailyRotateFile from 'winston-daily-rotate-file';
import { AppPathType, CONSTANTS, DialogType, MessageType } from '../common';
import { CallerInfo } from '../models';
import { AppUtils, CommonUtils } from '../utils';
import { DialogService } from './dialog-service';


/** LogService class for logging messages to the console and log file. */
export class LogService {


    /**
     * Creates a Winston logger instance with daily rotation file transport.
     * @returns The created Winston logger instance.
     */
    static createWinstonLogger(): winston.Logger {

        const transport = new CustomDailyRotateFile(Object.assign({
            filename: LogService._getFilename(),
        }, CONSTANTS.LOGGER.Config));

        return winston.createLogger({
            transports: [
                transport
            ],
            format: winston.format.combine(
                winston.format.timestamp(CONSTANTS.LOGGER.WinstonFormatTimestamp),
                winston.format.printf((info) => {
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
    static info(message: string, caller?: CallerInfo): CallerInfo {
        caller ||= CommonUtils.getFunctionCaller();
        LogService._logger.info(LogService._formatMessage(caller, message));
        return caller;
    }

    /**
     * Logs a warning-level message.
     * @param message - The log message.
     * @param caller - The caller information.
     * @returns The caller information.
     */
    static warn(message: string, caller?: CallerInfo): CallerInfo {
        caller ||= CommonUtils.getFunctionCaller();
        LogService._logger.warn(LogService._formatMessage(caller, message, MessageType.warning));
        return caller;
    }

    /**
     * Logs an error-level message.
     * @param message - The log message.
     * @param caller - The caller information.
     * @returns The caller information.
     */
    static error(message: string, caller?: CallerInfo): CallerInfo {
        caller ||= CommonUtils.getFunctionCaller();
        LogService._logger.error(LogService._formatMessage(caller, message, MessageType.error));
        return caller;
    }

    /**
     * Logs an error object with caller information.
     * @param ex - The error object.
     * @param caller - The caller information.
     * @returns The caller information.
     */
    static errorEx(ex: Error, caller?: CallerInfo): CallerInfo {
        caller ||= CommonUtils.getFunctionCaller(ex);
        LogService._logger.error(LogService._formatMessage(caller, `\n${caller.fullStackTrace}`, MessageType.error));
        return caller
    }

    /**
     * Logs an unhandled exception with caller information.
     * @param ex - The unhandled exception.
     * @param caller - The caller information.
     * @returns The caller information.
     */
    static unhandledExeption(ex: Error, caller?: CallerInfo): CallerInfo {
        LogService.errorEx(ex, caller);
        global.appGlobal.hasUnhandledError = true;
        DialogService.showDialog(
            CONSTANTS.LOGGER.UnhandledErrorMessagePattern(ex.message),
            DialogType.danger
        );
        return caller;
    }



    /* #region Private */

    /** The singleton instance of the LogService. */
    private static _winston: winston.Logger;

    /**
     * Gets the logger instance.
     */
    private static get _logger(): winston.Logger {
        return LogService._winston || (LogService._winston = LogService.createWinstonLogger());
    }

    /**
     * Formats the log message based on caller information.
     * @param caller - The caller information.
     * @param message - The log message.
     * @returns The formatted log message.
     */
    private static _formatMessage(caller: CallerInfo, message: string, messageType = MessageType.info): string {

        if (message && !message.endsWith('.') && !message.startsWith('#')) {
            message += '.';
        }

        let formattedFileMessage = '';

        if (message && message.startsWith('#')) {
            formattedFileMessage = CONSTANTS.LOGGER.UnformattedFileLogMessagePattern(caller.functionName, caller.lineNumber, message);
        } else {
            formattedFileMessage = CONSTANTS.LOGGER.FileLogMessagePattern(caller.functionName, caller.lineNumber, message);
        }

        const formattedConsoleMessage = CONSTANTS.LOGGER.ConsoleLogMessagePattern(formattedFileMessage, messageType);

        switch (messageType) {
            default:
                console.log(formattedConsoleMessage);
                break;
            case MessageType.warning:
                console.warn(formattedConsoleMessage);
                break;
            case MessageType.error:
                console.error(formattedConsoleMessage);
                break;

        }

        return formattedFileMessage;
    }

    /**
     *  Gets the current log full file name.
     * @returns The log full file name.
     */
    static getLogFilename(): string {
        const filename = (LogService._logger.transports[0] as CustomDailyRotateFile).getFilename();
        return filename;
    }

    /**
     * Gets the log file name.
     * @returns The log file name.
     */
    private static _getFilename(): string {
        return AppUtils.getAppPath(AppPathType.logsPath, CONSTANTS.LOG_FILENAME_TEMPLATE);
    }

    /* #endregion */

}


/* #region Helper Classes */
/**
 * CustomDailyRotateFile class adds custom functionality to the DailyRotateFile class.
 */
class CustomDailyRotateFile extends DailyRotateFile {
    /**
     * The private variable to store the current log filename.
     * @private
     */
    private _filename?: string;

    /**
     * The private variable to store the current filename specific to this instance.
     * @private
     */
    private _thisFilename?: string;

    /**
     * Constructs a new instance of the CustomDailyRotateFile class.
     * @param {DailyRotateFile.DailyRotateFileTransportOptions} options - Options for the transport.
     */
    constructor(options: DailyRotateFile.DailyRotateFileTransportOptions) {
        super(options);

        /**
         * Event listener for the 'new' event emitted by the parent class.
         * Sets the value of _thisFilename when a new log file is created.
         * @param {string} newFilename - The new log filename.
         * @private
         */
        this.on('new', (newFilename: string) => {
            this._thisFilename = newFilename;
        });
    }

    /**
     * Retrieves the current log filename using the parent class's _getFile() method.
     * Emits a 'new' event if the filename has changed.
     * @returns {string} - The current log filename.
     * @private
     */
    _getFile(): string {
        const filename: string = super['_getFile']();

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
    getFilename(): string {
        return this._thisFilename || '';
    }
}

/* #endregion */
