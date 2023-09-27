import * as fs from 'fs';
import fsExtra from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';

export class FsUtils {

    /**
    * Retrieves the directories within the specified directory path.
    * @param dirPath - The directory path.
    * @param isRecursive - Specifies whether to search recursively.
    * @returns The directories within the specified directory path.
    */
    static getDirectories(dirPath: string, isRecursive = false): string[] {
        let result: string[] = [];

        fs.readdirSync(dirPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .forEach(dirent => {
                const fullPath = path.join(dirPath, dirent.name);
                result.push(fullPath);

                if (isRecursive) {
                    result = result.concat(FsUtils.getDirectories(fullPath, isRecursive));
                }
            });

        return result.map(directory => path.relative(dirPath, directory));
    }


    /**
     * Modifies a folder based on the specified modification action.
     *
     * @param {string} folderPath - The path to the folder to be modified.
     * @param {'delete' | 'select' | 'move'} modification - The modification action to be performed ('delete', 'select', or 'move').
     * @param {function} callback - The callback function that accepts the full path of each item in the folder and returns a result.
     * @param {number} maxDepth - The maximum level to scan. If 0, it scans directories for unlimited levels down.
     * @returns {string[]} - An array of strings representing the modified items' paths.
     */
    static modifyFolder(folderPath: string, modification: 'delete' | 'select' | 'move', callback: (fullPath: string) => any, maxDepth = 0): string[] {
        const output = [];
        const dirs = [];

        /**
         * Recursively processes a directory and performs the specified modification action.
         *
         * @param {string} dir - The directory to be processed.
         * @param {number} currentDepth - The current depth level.
         */
        function processDir(dir: string, currentDepth = 0) {
            const fullPath = path.resolve(dir);
            const exists = fsExtra.pathExistsSync(fullPath);
            if (!exists) {
                return;
            }

            const callbackResult = callback(fullPath);
            if (callbackResult === true) {
                switch (modification) {
                    case 'delete':
                        fsExtra.removeSync(fullPath);
                        break;
                    case 'select':
                        output.push(fullPath);
                        break;
                    case 'move':
                        // noop - we need string return to move
                        break;
                }
            } else if (modification === 'move' && typeof callbackResult === 'string') {
                const newLocation = path.resolve(callbackResult);
                fsExtra.moveSync(fullPath, path.join(newLocation, path.basename(fullPath)));
            }

            if (maxDepth === 0 || currentDepth < maxDepth) {
                const items = fsExtra.readdirSync(fullPath);
                for (let i = 0; i < items.length; i++) {
                    const itemFullPath = path.join(fullPath, items[i]);
                    const stat = fsExtra.lstatSync(itemFullPath);
                    if (stat.isDirectory()) {
                        dirs.push({ path: itemFullPath, depth: currentDepth + 1 });
                    }
                }
            }
        }

        dirs.push({ path: folderPath, depth: 0 });
        while (dirs.length > 0) {
            const { path, depth } = dirs.shift();
            processDir(path, depth);
        }

        return output;
    }

    /**
     * Opens the file explorer to the specified directory path or URL.
     * @param directoryPathOrUrl - The directory path or URL.
     */
    static navigateToPathOrUrl(directoryPathOrUrl: string) {
        switch (process.platform) {
            case 'darwin':
                exec(`open ${directoryPathOrUrl}`);
                break;
            case 'win32':
                exec(`start ${directoryPathOrUrl}`);
                break;
            case 'linux':
                exec(`xdg-open ${directoryPathOrUrl}`);
                break;

        }
    }


}