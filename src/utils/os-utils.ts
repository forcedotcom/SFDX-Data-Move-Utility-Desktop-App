import os from 'os';

/**
 *  Utils class for operating system related operations.
 */
export class OsUtils {

    /**
     *  Gets the details of the operating system. 
     * @returns 
     */
    static getOSDetails(): Record<string, any> {
        return {
            platform: os.platform(), // Operating system platform (e.g., 'darwin', 'win32', 'linux')
            release: os.release(), // Operating system release
            type: os.type(), // Name of the operating system as returned by uname(3) or similar. For example, 'Linux' on Linux, 'Darwin' on macOS, 'Windows_NT' on Windows.
            arch: os.arch(), // CPU architecture for which the Node.js binary was compiled
            cpuCoreCount: os.cpus().length, // Number of CPU cores
            totalMemory: os.totalmem(), // Total system memory in bytes
            freeMemory: os.freemem(), // Free system memory in bytes
            uptime: os.uptime() // System uptime in seconds
        };
    }
}