"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FsUtils = void 0;
const fs = __importStar(require("fs"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
class FsUtils {
    /**
    * Retrieves the directories within the specified directory path.
    * @param dirPath - The directory path.
    * @param isRecursive - Specifies whether to search recursively.
    * @returns The directories within the specified directory path.
    */
    static getDirectories(dirPath, isRecursive = false) {
        let result = [];
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
    static modifyFolder(folderPath, modification, callback, maxDepth = 0) {
        const output = [];
        const dirs = [];
        /**
         * Recursively processes a directory and performs the specified modification action.
         *
         * @param {string} dir - The directory to be processed.
         * @param {number} currentDepth - The current depth level.
         */
        function processDir(dir, currentDepth = 0) {
            const fullPath = path.resolve(dir);
            const exists = fs_extra_1.default.pathExistsSync(fullPath);
            if (!exists) {
                return;
            }
            const callbackResult = callback(fullPath);
            if (callbackResult === true) {
                switch (modification) {
                    case 'delete':
                        fs_extra_1.default.removeSync(fullPath);
                        break;
                    case 'select':
                        output.push(fullPath);
                        break;
                    case 'move':
                        // noop - we need string return to move
                        break;
                }
            }
            else if (modification === 'move' && typeof callbackResult === 'string') {
                const newLocation = path.resolve(callbackResult);
                fs_extra_1.default.moveSync(fullPath, path.join(newLocation, path.basename(fullPath)));
            }
            if (maxDepth === 0 || currentDepth < maxDepth) {
                const items = fs_extra_1.default.readdirSync(fullPath);
                for (let i = 0; i < items.length; i++) {
                    const itemFullPath = path.join(fullPath, items[i]);
                    const stat = fs_extra_1.default.lstatSync(itemFullPath);
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
    static navigateToPathOrUrl(directoryPathOrUrl) {
        switch (process.platform) {
            case 'darwin':
                (0, child_process_1.exec)(`open ${directoryPathOrUrl}`);
                break;
            case 'win32':
                (0, child_process_1.exec)(`start ${directoryPathOrUrl}`);
                break;
            case 'linux':
                (0, child_process_1.exec)(`xdg-open ${directoryPathOrUrl}`);
                break;
        }
    }
}
exports.FsUtils = FsUtils;
//# sourceMappingURL=fs-utils.js.map