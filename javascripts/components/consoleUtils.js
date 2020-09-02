"use strict";
/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleUtils = void 0;
const { exec } = require('child_process');
const ps_tree_1 = __importDefault(require("ps-tree"));
const statics_1 = require("./statics");
class ConsoleUtils {
    static hasRunningConsoleProcess() {
        return this._childConsoleProcess;
    }
    static killRunningConsoleProcess(exitMainProcess = false) {
        if (ConsoleUtils._childConsoleProcess) {
            var kill = function (pid, signal, callback) {
                signal = signal || 'SIGKILL';
                callback = callback || function () { };
                var killTree = true;
                if (killTree) {
                    ps_tree_1.default(pid, function (err, children) {
                        [pid].concat(children.map(function (p) {
                            return p.PID;
                        })).forEach(function (tpid) {
                            try {
                                process.kill(tpid, signal);
                            }
                            catch (ex) { }
                        });
                        callback();
                    });
                }
                else {
                    try {
                        process.kill(pid, signal);
                    }
                    catch (ex) { }
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
            }
            else {
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
    static callConsoleCommand(command, infoCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let isExited = false;
                if (infoCallback) {
                    infoCallback({
                        message: "",
                        exitCode: undefined,
                        isError: false,
                        type: statics_1.CONSOLE_COMMAND_EVENT_TYPE.Start
                    });
                }
                ConsoleUtils._childConsoleProcess = exec(command);
                ConsoleUtils._childConsoleProcess.stdout.on('data', function (data) {
                    if (infoCallback) {
                        let killProcess = infoCallback({
                            message: data,
                            exitCode: undefined,
                            isError: false,
                            type: statics_1.CONSOLE_COMMAND_EVENT_TYPE.StdOutData
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
                            type: statics_1.CONSOLE_COMMAND_EVENT_TYPE.StdErrData
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
                                type: statics_1.CONSOLE_COMMAND_EVENT_TYPE.Close
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
                                type: statics_1.CONSOLE_COMMAND_EVENT_TYPE.Exit
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
                                type: statics_1.CONSOLE_COMMAND_EVENT_TYPE.Error
                            });
                        }
                        reject(error);
                    }
                });
            });
        });
    }
}
exports.ConsoleUtils = ConsoleUtils;
//# sourceMappingURL=consoleUtils.js.map