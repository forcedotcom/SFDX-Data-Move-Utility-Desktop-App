"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleService = void 0;
const ps_tree_1 = __importDefault(require("ps-tree"));
const _1 = require(".");
const common_1 = require("../common");
const { exec } = require('child_process');
class ConsoleService {
    /**
     * Checks if a command is currently running.
     * @returns True if a command is running, false otherwise.
     */
    static isCommandRunning() {
        return !!ConsoleService._childConsoleProcess;
    }
    /**
     * Aborts the currently running command.
     * @param exitMainProcess If true, exits the main process after aborting the command.
     */
    static abortCommand(exitMainProcess = false) {
        if (ConsoleService._childConsoleProcess) {
            const kill = function (pid, signal, callback) {
                signal = signal || 'SIGKILL';
                callback = callback || new Function();
                const killTree = true;
                if (killTree) {
                    (0, ps_tree_1.default)(pid, function (err, children) {
                        [pid]
                            .concat(children.map(function (p) {
                            return p.PID;
                        }))
                            .forEach(function (tpid) {
                            // eslint-disable-next-line no-empty
                            try {
                                process.kill(tpid, signal);
                            }
                            catch (ex) { }
                        });
                        callback();
                    });
                }
                else {
                    // eslint-disable-next-line no-empty
                    try {
                        process.kill(pid, signal);
                    }
                    catch (ex) { }
                    callback();
                }
            };
            const isWin = /^win/.test(process.platform);
            if (!isWin) {
                kill(ConsoleService._childConsoleProcess.pid, undefined, function () {
                    ConsoleService._childConsoleProcess = undefined;
                    if (exitMainProcess) {
                        process.exit();
                    }
                });
            }
            else {
                const cp = require('child_process');
                cp.exec('taskkill /PID ' + ConsoleService._childConsoleProcess.pid + ' /T /F', function () {
                    ConsoleService._childConsoleProcess = undefined;
                    if (exitMainProcess) {
                        process.exit();
                    }
                });
            }
        }
    }
    /**
     * Runs a command and provides progress updates through a callback.
     * @param command The command to execute.
       @param killProcessOnFirstConsoleOutput If true, kills the process as soon as the first console output is received.
     * @returns A promise that resolves with the exit code of the command.
     */
    static async runCommandAsync(command, killProcessOnFirstConsoleOutput) {
        return new Promise(resolve => {
            let isExited = false;
            let isAborted = false;
            let commandOutput = '';
            _1.BroadcastService.broadcastProgress(common_1.ProgressEventType.start, 'ConsoleService:runCommand', {
                type: common_1.ProgressEventType.start,
            });
            _1.LogService.info(`Command ${command} is starting to execute...`);
            ConsoleService._childConsoleProcess = exec(command);
            ConsoleService._childConsoleProcess.stdout.on('data', function (data) {
                commandOutput += data;
                const killProcess = _1.BroadcastService.broadcastProgress(common_1.ProgressEventType.stdOutData, 'ConsoleService:runCommand', {
                    data,
                    type: common_1.ProgressEventType.stdOutData,
                });
                if (killProcess && killProcess.length || killProcessOnFirstConsoleOutput) {
                    _1.LogService.info(`Command ${command} is finished`);
                    isAborted = true;
                    ConsoleService.abortCommand();
                }
            });
            ConsoleService._childConsoleProcess.stderr.on('data', function (error) {
                const killProcess = _1.BroadcastService.broadcastProgress(common_1.ProgressEventType.stdErrData, 'ConsoleService:runCommand', {
                    messageOrKey: error,
                    isError: true,
                    type: common_1.ProgressEventType.stdErrData,
                });
                if (killProcess && killProcess.length || killProcessOnFirstConsoleOutput) {
                    _1.LogService.info(`Command ${command} is finished`);
                    ConsoleService.abortCommand();
                }
            });
            ConsoleService._childConsoleProcess.on('close', (code) => {
                if (!isExited) {
                    isExited = true;
                    _1.BroadcastService.broadcastProgress(common_1.ProgressEventType.end, 'ConsoleService:runCommand', {
                        exitCode: code,
                        type: common_1.ProgressEventType.end,
                    });
                    ConsoleService._childConsoleProcess = undefined;
                    _1.LogService.info(`Command ${command} is closed with code ${code}`);
                    resolve({ commandOutput, isError: code !== 0 && !isAborted });
                }
            });
            ConsoleService._childConsoleProcess.on('exit', (code) => {
                if (!isExited) {
                    isExited = true;
                    _1.BroadcastService.broadcastProgress(common_1.ProgressEventType.end, 'ConsoleService:runCommand', {
                        exitCode: code,
                        type: common_1.ProgressEventType.end,
                    });
                    ConsoleService._childConsoleProcess = undefined;
                    _1.LogService.info(`Command ${command} is exited with code ${code}`);
                    resolve({ commandOutput, isError: code !== 0 && !isAborted });
                }
            });
            ConsoleService._childConsoleProcess.on('error', (error) => {
                if (!isExited) {
                    isExited = true;
                    _1.BroadcastService.broadcastProgress(common_1.ProgressEventType.error, 'ConsoleService:runCommand', {
                        messageOrKey: error,
                        isError: true,
                        type: common_1.ProgressEventType.error,
                    });
                    _1.BroadcastService.broadcastProgress(common_1.ProgressEventType.end, 'ConsoleService:runCommand', {
                        messageOrKey: error,
                        exitCode: 1,
                        isError: true,
                        type: common_1.ProgressEventType.end,
                    });
                    _1.LogService.warn(`Command ${command} failed with error: ${error}`);
                    resolve({ commandOutput, isError: true });
                }
            });
        });
    }
}
exports.ConsoleService = ConsoleService;
//# sourceMappingURL=console-service.js.map