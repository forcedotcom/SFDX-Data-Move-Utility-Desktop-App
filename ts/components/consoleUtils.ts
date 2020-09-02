/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */


const { exec } = require('child_process');
import psTree from 'ps-tree';
import { CONSOLE_COMMAND_EVENT_TYPE } from './statics';

export class ConsoleUtils {

    static _childConsoleProcess: any;

    public static hasRunningConsoleProcess() {
        return this._childConsoleProcess;
    }

    public static killRunningConsoleProcess(exitMainProcess: boolean = false) {

        if (ConsoleUtils._childConsoleProcess) {

            var kill = function (pid, signal, callback) {
                signal = signal || 'SIGKILL';
                callback = callback || function () { };
                var killTree = true;
                if (killTree) {
                    psTree(pid, function (err, children) {
                        [pid].concat(
                            children.map(function (p) {
                                return p.PID;
                            })
                        ).forEach(function (tpid) {
                            try { process.kill(tpid, signal) } catch (ex) { }
                        });
                        callback();
                    });
                } else {
                    try { process.kill(pid, signal) } catch (ex) { }
                    callback();
                }
            };

            var isWin = /^win/.test(process.platform);

            if (!isWin) {
                kill(ConsoleUtils._childConsoleProcess.pid, undefined, function () {
                    ConsoleUtils._childConsoleProcess = undefined;
                    if (exitMainProcess) {
                        process.exit();
                    }
                });
            } else {
                var cp = require('child_process');
                cp.exec('taskkill /PID ' + ConsoleUtils._childConsoleProcess.pid + ' /T /F', function (error, stdout, stderr) {
                    ConsoleUtils._childConsoleProcess = undefined;
                    if (exitMainProcess) {
                        process.exit();
                    }
                });
            }

        }
    }

    public static async callConsoleCommand(command : string,
        infoCallback: (data: {
            message: string,
            isError: boolean,
            exitCode: number,
            type: CONSOLE_COMMAND_EVENT_TYPE
        }) => boolean): Promise<number> {

        return new Promise((resolve, reject) => {

            let isExited = false;

            if (infoCallback) {
                infoCallback({
                    message: "",
                    exitCode: undefined,
                    isError: false,
                    type: CONSOLE_COMMAND_EVENT_TYPE.Start
                });
            }

            ConsoleUtils._childConsoleProcess = exec(command);

            ConsoleUtils._childConsoleProcess.stdout.on('data', function (data) {
                if (infoCallback) {
                    let killProcess = infoCallback({
                        message: data,
                        exitCode: undefined,
                        isError: false,
                        type: CONSOLE_COMMAND_EVENT_TYPE.StdOutData
                    });
                    if (killProcess) {
                        ConsoleUtils.killRunningConsoleProcess();
                    }
                }
            });

            ConsoleUtils._childConsoleProcess.stderr.on('data', function (error) {
                if (infoCallback) {
                    let killProcess = infoCallback({
                        message: error,
                        exitCode: undefined,
                        isError: true,
                        type: CONSOLE_COMMAND_EVENT_TYPE.StdErrData
                    });
                    if (killProcess) {
                        ConsoleUtils.killRunningConsoleProcess();
                    }
                }
            });

            ConsoleUtils._childConsoleProcess.on('close', (code) => {
                if (!isExited) {
                    isExited = true;
                    if (infoCallback) {
                        infoCallback({
                            message: undefined,
                            exitCode: code,
                            isError: false,
                            type: CONSOLE_COMMAND_EVENT_TYPE.Close
                        });
                    }
                    ConsoleUtils._childConsoleProcess = undefined;
                    resolve(code);
                }
            });

            ConsoleUtils._childConsoleProcess.on('exit', (code) => {
                if (!isExited) {
                    isExited = true;
                    if (infoCallback) {
                        infoCallback({
                            message: undefined,
                            exitCode: code,
                            isError: false,
                            type: CONSOLE_COMMAND_EVENT_TYPE.Exit
                        });
                    }
                    ConsoleUtils._childConsoleProcess = undefined;
                    resolve(code);
                }
            });

            ConsoleUtils._childConsoleProcess.on('error', (error) => {
                if (!isExited) {
                    isExited = true;
                    if (infoCallback) {
                        infoCallback({
                            message: error,
                            exitCode: 1,
                            isError: true,
                            type: CONSOLE_COMMAND_EVENT_TYPE.Error
                        });
                    }
                    reject(error);
                }
            });

        });
    }
}
