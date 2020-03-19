const { exec } = require('child_process');
const psTree = require('ps-tree');

var nodeUtils = (function() {

    let _childProcess;

    return {

        killSfdxInConsoleProcess() {

            if (_childProcess) {

                var kill = function(pid, signal, callback) {
                    signal = signal || 'SIGKILL';
                    callback = callback || function() {};
                    var killTree = true;
                    if (killTree) {
                        psTree(pid, function(err, children) {
                            [pid].concat(
                                children.map(function(p) {
                                    return p.PID;
                                })
                            ).forEach(function(tpid) {
                                try { process.kill(tpid, signal) } catch (ex) {}
                            });
                            callback();
                        });
                    } else {
                        try { process.kill(pid, signal) } catch (ex) {}
                        callback();
                    }
                };

                var isWin = /^win/.test(process.platform);

                if (!isWin) {
                    kill(_childProcess.pid, undefined, function() {
                        _childProcess = undefined;
                    });
                } else {
                    var cp = require('child_process');
                    cp.exec('taskkill /PID ' + _childProcess.pid + ' /T /F', function(error, stdout, stderr) {
                        _childProcess = undefined;
                    });
                }

            }
        },

        callSfdxInConsoleAsync: async function(command, $logSelector) {

            return new Promise((resolve, reject) => {

                let isExited = false;

                $($logSelector).html($($logSelector).html() + `<br/><b class='text-success'>${command}</b><br/>`);

                _childProcess = exec(command);

                _childProcess.stdout.on('data', function(data) {
                    $($logSelector).html($($logSelector).html() + data.toString().replace(/\n/g, '<br/>'));
                    $("html, body").animate({ scrollTop: $(document).height() }, 100);
                });

                _childProcess.stderr.on('data', function(data) {
                    $($logSelector).html($($logSelector).html() + "<span style='color:red'>" + data.toString().replace(/\n/g, '<br/>') + '</span>');
                    $("html, body").animate({ scrollTop: $(document).height() }, 100);
                });

                _childProcess.on('close', (code) => {
                    if (!isExited) {
                        isExited = true;
                        $($logSelector).html($($logSelector).html() + `<br/><br/>Executing finished with code ${code}`);
                        $("html, body").animate({ scrollTop: $(document).height() }, 100);
                        _childProcess = undefined;
                    }
                    resolve();
                });

                _childProcess.on('exit', (code) => {
                    if (!isExited) {
                        isExited = true;
                        $($logSelector).html($($logSelector).html() + `<br/><br/>Executing finished with code ${code}`);
                        $("html, body").animate({ scrollTop: $(document).height() }, 100);
                        _childProcess = undefined;
                    }
                    resolve();
                });

                _childProcess.on('error', (err) => {
                    if (!isExited) {
                        isExited = true;
                        $("html, body").animate({ scrollTop: $(document).height() }, 100);
                        nodeUtils.nodeUtils.killSfdxInConsoleProcess();
                    }
                    reject(err);
                });

            });
        }
    };

})();