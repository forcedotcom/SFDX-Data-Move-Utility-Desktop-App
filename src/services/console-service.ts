import psTree from 'ps-tree';
import { BroadcastService, LogService } from '.';
import { ProgressEventType } from '../common';


const { exec } = require('child_process');

export class ConsoleService {
    private static _childConsoleProcess: any;

    /**
     * Checks if a command is currently running.
     * @returns True if a command is running, false otherwise.
     */
    static isCommandRunning(): boolean {
        return !!ConsoleService._childConsoleProcess;
    }

    /**
     * Aborts the currently running command.
     * @param exitMainProcess If true, exits the main process after aborting the command.
     */
    static abortCommand(exitMainProcess = false): void {

        if (ConsoleService._childConsoleProcess) {
            const kill = function (pid: any, signal: string, callback: any) {
                signal = signal || 'SIGKILL';
                callback = callback || new Function();
                const killTree = true;
                if (killTree) {
                    psTree(pid, function (err: any, children: any[]) {
                        [pid]
                            .concat(children.map(function (p: { PID: any }) {
                                return p.PID;
                            }))
                            .forEach(function (tpid) {
                                // eslint-disable-next-line no-empty
                                try {
                                    process.kill(tpid, signal);
                                } catch (ex) { }
                            });
                        callback();
                    });
                } else {
                    // eslint-disable-next-line no-empty
                    try {
                        process.kill(pid, signal);
                    } catch (ex) { }
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
            } else {
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
    static async runCommandAsync(command: string, killProcessOnFirstConsoleOutput?: boolean): Promise<{ commandOutput: string, isError: boolean }> {

        return new Promise(resolve => {
            let isExited = false;
            let isAborted = false;
            let commandOutput = '';

            BroadcastService.broadcastProgress(ProgressEventType.start, 'ConsoleService:runCommand', {
                type: ProgressEventType.start,
            });

            LogService.info(`Command ${command} is starting to execute...`);
            ConsoleService._childConsoleProcess = exec(command);

            ConsoleService._childConsoleProcess.stdout.on('data', function (data: any) {

                commandOutput += data;

                const killProcess = BroadcastService.broadcastProgress(ProgressEventType.stdOutData, 'ConsoleService:runCommand', {
                    data,
                    type: ProgressEventType.stdOutData,
                });

                if (killProcess && killProcess.length || killProcessOnFirstConsoleOutput) {
                    LogService.info(`Command ${command} is finished`);
                    isAborted = true;
                    ConsoleService.abortCommand();
                }
            });

            ConsoleService._childConsoleProcess.stderr.on('data', function (error: any) {
                const killProcess = BroadcastService.broadcastProgress(ProgressEventType.stdErrData, 'ConsoleService:runCommand', {
                    messageOrKey: error,
                    isError: true,
                    type: ProgressEventType.stdErrData,
                });

                if (killProcess && killProcess.length || killProcessOnFirstConsoleOutput) {
                    LogService.info(`Command ${command} is finished`);
                    ConsoleService.abortCommand();
                }
            });

            ConsoleService._childConsoleProcess.on('close', (code: number) => {
                if (!isExited) {
                    isExited = true;
                    BroadcastService.broadcastProgress(ProgressEventType.end, 'ConsoleService:runCommand', {
                        exitCode: code,
                        type: ProgressEventType.end,
                    });

                    ConsoleService._childConsoleProcess = undefined;
                    LogService.info(`Command ${command} is closed with code ${code}`);
                    resolve({ commandOutput, isError: code !== 0 && !isAborted });
                }
            });

            ConsoleService._childConsoleProcess.on('exit', (code: number) => {
                if (!isExited) {
                    isExited = true;
                    BroadcastService.broadcastProgress(ProgressEventType.end, 'ConsoleService:runCommand', {
                        exitCode: code,
                        type: ProgressEventType.end,
                    });
                    ConsoleService._childConsoleProcess = undefined;
                    LogService.info(`Command ${command} is exited with code ${code}`);
                    resolve({ commandOutput, isError: code !== 0 && !isAborted });
                }
            });

            ConsoleService._childConsoleProcess.on('error', (error: any) => {
                if (!isExited) {
                    isExited = true;
                    BroadcastService.broadcastProgress(ProgressEventType.error, 'ConsoleService:runCommand', {
                        messageOrKey: error,
                        isError: true,
                        type: ProgressEventType.error,
                    });
                    BroadcastService.broadcastProgress(ProgressEventType.end, 'ConsoleService:runCommand', {
                        messageOrKey: error,
                        exitCode: 1,
                        isError: true,
                        type: ProgressEventType.end,
                    });
                    LogService.warn(`Command ${command} failed with error: ${error}`);
                    resolve({ commandOutput, isError: true });
                }
            });
        });
    }
}
