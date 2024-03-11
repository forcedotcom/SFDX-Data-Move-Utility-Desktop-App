import { spawn } from "child_process";

/**
 * Class representing a  service that executes a command in a new terminal window.
 * @class
 */
export class DetachedConsoleService {
    /**
     * The child process created by executing a command.
     * @private
     * @type {?object}
     */
    private process?: any;

    /**
     * Executes the given command in a new terminal window.
     *
     * @param {string} command - The command to execute.
     * @returns {Promise<number>} The exit code of the executed command.
     * @throws Will reject the promise if an error occurs while executing the command.
     * @async
     */
    async executeCommand(command: string): Promise<number> {
        return new Promise((resolve, reject) => {
            // Split the command and arguments for spawn
            const [cmd, ...args] = command.split(' ');

            // Determine the platform and execute the command accordingly
            if (process.platform === "win32") {
                this.process = spawn(`cmd.exe`, ['/c', cmd, ...args], { detached: false, shell: true });
            } else if (process.platform === "darwin") {
                this.process = spawn(`open`, ['-a', 'Terminal', cmd, ...args], { detached: false, shell: true });
            } else {
                this.process = spawn(`gnome-terminal`, ['--', cmd, ...args], { detached: false, shell: true });
            }

            // Listen for the close event to get the exit code
            this.process.on('close', (code: number) => {
                resolve(code);
            });

            // Handle errors
            this.process.on('error', (err: Error) => {
                reject(err);
            });
        });
    }

    /**
     * Cancels the execution of the command by terminating the child process.
     */
    cancel() {
        if (this.process && this.process.pid) {
            if (process.platform === "win32") {
                // Attempt to use a Windows Command Prompt command to forcefully kill the process.
                spawn("cmd.exe", ["/c", "taskkill", "/F", "/PID", this.process.pid.toString()], { shell: true });
            } else {
                // For Unix-like systems.
                this.process.kill(-this.process.pid);
            }
        }
    }
}
