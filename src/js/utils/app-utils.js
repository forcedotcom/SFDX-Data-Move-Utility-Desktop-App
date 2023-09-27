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
exports.AppUtils = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path = __importStar(require("path"));
const common_1 = require("../common");
const platformFolders = require('platform-folders');
class AppUtils {
    /**
     *  Get application absolute path for the given path type.
     * @param pathType  Path type to get
     * @param relativePath  Relative path to append to the path
     * @returns
     */
    static getAppPath(pathType, relativePath) {
        relativePath || (relativePath = "");
        // Switch on the path type
        switch (pathType) {
            // Root app path
            case common_1.AppPathType.dataRootPath: {
                const absolutePath = path.resolve(path.join(global.appGlobal.packageJson.appConfig.appRoot || platformFolders.getDocumentsFolder(), global.appGlobal.packageJson.appConfig.dataRoot, relativePath));
                fs_extra_1.default.ensureDirSync(path.dirname(absolutePath));
                return absolutePath;
            }
            // Path to compiled js files
            case common_1.AppPathType.scriptPath:
                return AppUtils.getAppPath(common_1.AppPathType.appPath, path.join(common_1.CONSTANTS.APP_JS_PATH, relativePath));
            // Path to logs within the app data root
            case common_1.AppPathType.logsPath:
                return AppUtils.getAppPath(common_1.AppPathType.dataRootPath, path.join(common_1.CONSTANTS.APP_LOGS_PATH, relativePath));
            // Path to images within the root app path
            case common_1.AppPathType.imagesPath:
                return AppUtils.getAppPath(common_1.AppPathType.appPath, path.join(common_1.CONSTANTS.APP_IMAGES_PATH, relativePath));
            // Path to i18n within the root app path
            case common_1.AppPathType.i18nPath:
                return AppUtils.getAppPath(common_1.AppPathType.appPath, path.join(common_1.CONSTANTS.APP_I18N_PATH, relativePath));
            // Path to db backup within the app data root
            case common_1.AppPathType.dbBackupPath:
                return AppUtils.getAppPath(common_1.AppPathType.dataRootPath, path.join(common_1.CONSTANTS.APP_DB_BACKUP_PATH, relativePath));
            // Path to the root of the application
            default: {
                const p = path.resolve(path.normalize(path.join(common_1.CONSTANTS.APP_BASE_PATH, relativePath)));
                fs_extra_1.default.ensureDirSync(path.dirname(p));
                return p;
            }
        }
    }
    /**
     * Checks if a language code represents a right-to-left (RTL) language.
     *
     * @param {string} langCode - The language code to check.
     * @returns {boolean} - A boolean indicating if the language is RTL.
     */
    static isRtl(langCode) {
        return ['he', 'ar'].includes(langCode);
    }
}
exports.AppUtils = AppUtils;
//# sourceMappingURL=app-utils.js.map