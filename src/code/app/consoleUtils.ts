const { exec } = require('child_process');
const psTree = require('ps-tree');

export class consoleUtils {

    static _childConsoleProcess: any;

    public static hasRunningConsoleProcess() {
        return this._childConsoleProcess;
    }

    public static killRunningConsoleProcess(exitMainProcess: boolean = false) {

        if (consoleUtils._childConsoleProcess) {

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
                kill(consoleUtils._childConsoleProcess.pid, undefined, function () {
                    consoleUtils._childConsoleProcess = undefined;
                    if (exitMainProcess) {
                        process.exit();
                    }
                });
            } else {
                var cp = require('child_process');
                cp.exec('taskkill /PID ' + consoleUtils._childConsoleProcess.pid + ' /T /F', function (error, stdout, stderr) {
                    consoleUtils._childConsoleProcess = undefined;
                    if (exitMainProcess) {
                        process.exit();
                    }
                });
            }

        }
    }



    public static async callConsoleCommand(command,
        infoCallback: (data: {
            message: string,
            isError: boolean,
            exitCode: number
        }) => boolean): Promise<number> {

        return new Promise((resolve, reject) => {

            let isExited = false;

            consoleUtils._childConsoleProcess = exec(command);

            consoleUtils._childConsoleProcess.stdout.on('data', function (data) {
                if (infoCallback) {
                    let killProcess = infoCallback({
                        message: data,
                        exitCode: undefined,
                        isError: false
                    });
                    if (killProcess) {
                        consoleUtils.killRunningConsoleProcess();
                    }
                }
            });

            consoleUtils._childConsoleProcess.stderr.on('data', function (error) {
                if (infoCallback) {
                    let killProcess = infoCallback({
                        message: error,
                        exitCode: undefined,
                        isError: true
                    });
                    if (killProcess) {
                        consoleUtils.killRunningConsoleProcess();
                    }
                }
            });

            consoleUtils._childConsoleProcess.on('close', (code) => {
                if (!isExited) {
                    isExited = true;
                    if (infoCallback) {
                        infoCallback({
                            message: undefined,
                            exitCode: code,
                            isError: false
                        });
                    }
                    consoleUtils._childConsoleProcess = undefined;
                    resolve(code);
                }
            });

            consoleUtils._childConsoleProcess.on('exit', (code) => {
                if (!isExited) {
                    isExited = true;
                    if (infoCallback) {
                        infoCallback({
                            message: undefined,
                            exitCode: code,
                            isError: false
                        });
                    }
                    consoleUtils._childConsoleProcess = undefined;
                    resolve(code);
                }
            });

            consoleUtils._childConsoleProcess.on('error', (error) => {
                if (!isExited) {
                    isExited = true;
                    if (infoCallback) {
                        infoCallback({
                            message: error,
                            exitCode: 1,
                            isError: true
                        });
                    }
                    reject(error);
                }
            });

        });
    }


}
