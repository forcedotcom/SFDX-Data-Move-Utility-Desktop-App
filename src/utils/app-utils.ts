
import fsExtra from 'fs-extra';
import * as path from 'path';
import { AppPathType, CONSTANTS } from '../common';

const platformFolders = require('platform-folders');


export class AppUtils {

    /**
     *  Get application absolute path for the given path type.
     * @param pathType  Path type to get
     * @param relativePath  Relative path to append to the path
     * @returns 
     */
    static getAppPath(pathType: AppPathType, relativePath?: string): string {

        relativePath ||= "";
        
        // Switch on the path type
        switch (pathType) {

            // Root app path
            case AppPathType.dataRootPath: {
                const absolutePath = path.resolve(
                    path.join(
                        global.appGlobal.packageJson.appConfig.appRoot || platformFolders.getDocumentsFolder(),
                        global.appGlobal.packageJson.appConfig.dataRoot,
                        relativePath
                    ));
                fsExtra.ensureDirSync(path.dirname(absolutePath));
                return absolutePath;
            }

            // Path to compiled js files
            case AppPathType.scriptPath:
                return AppUtils.getAppPath(AppPathType.appPath, path.join(CONSTANTS.APP_JS_PATH, relativePath));

            // Path to logs within the app data root
            case AppPathType.logsPath:
                return AppUtils.getAppPath(AppPathType.dataRootPath, path.join(CONSTANTS.APP_LOGS_PATH, relativePath));

            // Path to images within the root app path
            case AppPathType.imagesPath:
                return AppUtils.getAppPath(AppPathType.appPath, path.join(CONSTANTS.APP_IMAGES_PATH, relativePath));

            // Path to i18n within the root app path
            case AppPathType.i18nPath:
                return AppUtils.getAppPath(AppPathType.appPath, path.join(CONSTANTS.APP_I18N_PATH, relativePath));

            // Path to db backup within the app data root
            case AppPathType.dbBackupPath:
                return AppUtils.getAppPath(AppPathType.dataRootPath, path.join(CONSTANTS.APP_DB_BACKUP_PATH, relativePath));

            // Path to the root of the application
            default: {
                const p = path.resolve(path.normalize(path.join(CONSTANTS.APP_BASE_PATH, relativePath)));
                fsExtra.ensureDirSync(path.dirname(p));
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
    static isRtl(langCode: string): boolean {
        return ['he', 'ar'].includes(langCode);
    }


}