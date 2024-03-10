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
exports.DatabaseService = void 0;
const class_transformer_1 = require("class-transformer");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path = __importStar(require("path"));
require("reflect-metadata");
const _1 = require(".");
const common_1 = require("../common");
const utils_1 = require("../utils");
const models_1 = require("../models");
class DatabaseService {
    /**
     * Retrieves or creates the AppDb instance.
     * @returns The AppDb instance.
     */
    static getOrCreateAppDb() {
        const getOrCreateAppDb = () => {
            if (!DatabaseService._db) {
                DatabaseService._db = DatabaseService._database.getById("db", models_1.AppDb, common_1.CONSTANTS.DATABASE.APP_DB_TRANSFORMATION_OPTION);
                DatabaseService._db.init();
            }
            return DatabaseService._db;
        };
        if (DatabaseService._database) {
            return getOrCreateAppDb();
        }
        const filename = DatabaseService.getAppDbFilename();
        DatabaseService._database = new common_1.Database(filename, 'utf-8');
        if (DatabaseService._database.all().length) {
            return getOrCreateAppDb();
        }
        DatabaseService._db = new models_1.AppDb();
        DatabaseService._database.create(DatabaseService._db, "db", common_1.CONSTANTS.DATABASE.APP_DB_TRANSFORMATION_OPTION);
        return getOrCreateAppDb();
    }
    /**
     * Saves the AppDb instance to the database.
     */
    static saveAppDb() {
        if (!DatabaseService._database) {
            return;
        }
        const db = DatabaseService.getOrCreateAppDb();
        DatabaseService._database.updateById("db", db, common_1.CONSTANTS.DATABASE.APP_DB_TRANSFORMATION_OPTION);
    }
    /**
     * Creates a backup of the AppDb file.
     */
    static backupAppDb() {
        const backup = new _1.BackupService(utils_1.AppUtils.getAppPath(common_1.AppPathType.dbBackupPath), DatabaseService.getAppDbFilename());
        backup.backupFile();
    }
    static scheduleBackupAppDb(intervalInMinutes) {
        const backup = new _1.BackupService(utils_1.AppUtils.getAppPath(common_1.AppPathType.dbBackupPath), DatabaseService.getAppDbFilename());
        backup.scheduleBackupFile(intervalInMinutes);
    }
    /**
     * Retrieves the filename of the AppDb.
     * @returns The filename of the AppDb.
     */
    static getAppDbFilename() {
        return utils_1.AppUtils.getAppPath(common_1.AppPathType.dataRootPath, global.appGlobal.packageJson.appConfig.databaseFilename || common_1.CONSTANTS.DEFAULT_DATABASE_FILENAME);
    }
    /**
     * Validates the AppDb and saves it if was fixed and changed during the validation.
     */
    static validateAppDb() {
        const db = DatabaseService.getOrCreateAppDb();
        if (db.validate()) { //if the db was modified during the validation
            // we need to save it
            DatabaseService.saveAppDb();
        }
    }
    /* #endregion */
    /* #region Path Service Methods */
    /**
     * Retrieves the absolute path for a workspace.
     * @param workspace The workspace object.
     * @param relativePath The relative path within the workspace (optional).
     * @returns The absolute path for the workspace.
     */
    static getWorkspacePath(workspace, relativePath) {
        relativePath || (relativePath = "");
        return utils_1.AppUtils.getAppPath(common_1.AppPathType.dataRootPath, path.join(common_1.CONSTANTS.WORKSPACES_PATH, workspace.name.normalizeFilename(), relativePath));
    }
    /**
     * Retrieves the absolute path for a configuration within a workspace.
     * @param config The configuration object.
     * @param relativePath The relative path within the configuration (optional).
     * @returns The absolute path for the configuration.
     */
    static getConfigPath(config, relativePath) {
        relativePath || (relativePath = "");
        return DatabaseService.getWorkspacePath({ name: config.ws.name }, path.join(config.name.normalizeFilename(), relativePath));
    }
    /* #endregion */
    /* #region Application Folder Service Methods */
    /**
     * Cleans up the application folder by permanently deleting all workspace folders that are not present in the app database.
     */
    static applicationFolderCleanup() {
        const wsRootPath = utils_1.AppUtils.getAppPath(common_1.AppPathType.dataRootPath, common_1.CONSTANTS.WORKSPACES_PATH);
        utils_1.FsUtils.modifyFolder(wsRootPath, 'delete', (fullPath) => {
            if (fullPath !== wsRootPath) {
                const workspacePath = fullPath.split(path.sep).pop();
                const db = DatabaseService.getOrCreateAppDb();
                return !db.workspaces.some(ws => ws.name.normalizeFilename() === workspacePath);
            }
        }, 1);
    }
    /* #endregion */
    /* #region Workspace Service Methods */
    /**
     * Creates a new workspace.
     * @param name The name of the workspace to create.
     * @returns The ID of the created workspace.
     */
    static createWorkspace(name) {
        const db = DatabaseService.getOrCreateAppDb();
        name = (name || '').trim();
        const ws = new models_1.Workspace({
            id: utils_1.CommonUtils.randomString(),
            name
        });
        db.workspaces.push(ws);
        db.workspaceId = ws.id;
        if (!ws.sourceConnectionId) {
            ws.sourceConnectionId = db.orgConnections.length ? db.orgConnections[0].id : null;
        }
        if (!ws.targetConnectionId) {
            ws.targetConnectionId = db.orgConnections.length ? db.orgConnections[0].id : null;
        }
        db.init();
        DatabaseService.saveAppDb();
        const path = DatabaseService.getWorkspacePath(ws);
        fs_extra_1.default.ensureDirSync(path);
        return ws.id;
    }
    /**
     * Repalces the currently selected workspace with an updated one.
     * @param workspace The workspace to save instead of the existing one.
     * @returns The updated and newly saved workspace object.
     */
    static updateWorkspace(workspace) {
        const db = DatabaseService.getOrCreateAppDb();
        const ws = (0, class_transformer_1.plainToInstance)(models_1.Workspace, workspace, common_1.CONSTANTS.DATABASE.APP_DB_TRANSFORMATION_OPTION);
        const oldPath = db.workspace.isInitialized ? DatabaseService.getWorkspacePath(db.workspace) : null;
        db.workspaces = db.workspaces.replace(ws, (source, target) => source.id == target.id);
        db.init();
        workspace = db.workspaces.find((ws) => ws.id == workspace.id);
        if (ws.isInitialized) {
            const path = DatabaseService.getWorkspacePath(workspace);
            if (oldPath && path
                && oldPath != path
                && fs_extra_1.default.existsSync(oldPath)
                && !fs_extra_1.default.existsSync(path)) {
                fs_extra_1.default.moveSync(oldPath, path);
            }
            else {
                fs_extra_1.default.ensureDir(path);
            }
        }
        DatabaseService.saveAppDb();
        return workspace;
    }
    /**
     * Retrieves a workspace by ID.
     * @param id The ID of the workspace to retrieve.
     * @param getSafeObject Whether to return a safe object (JSON-parsed) or the raw object (optional).
     * @returns The workspace object.
     */
    static getWorkspace(id) {
        const db = DatabaseService.getOrCreateAppDb();
        id || (id = db.workspaceId);
        const ws = db.workspaces.find(ws => ws.id == id) || new models_1.Workspace();
        if (ws.isInitialized) {
            let path = DatabaseService.getWorkspacePath(ws);
            fs_extra_1.default.ensureDirSync(path);
            if (ws.config.isInitialized) {
                path = DatabaseService.getConfigPath(ws.config);
                fs_extra_1.default.ensureDirSync(path);
            }
        }
        return ws;
    }
    /**
     *  Retrieves the display path for the currently selected workspace.
     * @returns  The display path for the workspace.
     */
    static getWorkspaceDisplayPath(wizardStep) {
        const ws = DatabaseService.getWorkspace();
        const config = DatabaseService.getConfig();
        const objectSet = DatabaseService.getObjectSet();
        const sObject = DatabaseService.getSObject();
        if (!ws.isInitialized) {
            return _1.TranslationService.translate({ key: "NOT_SET" });
        }
        if (!config.isInitialized) {
            return ws.name;
        }
        if (!objectSet.isInitialized && wizardStep > 2) {
            return `${ws.name} / ${config.name}`;
        }
        if (!sObject.isInitialized && wizardStep > 2) {
            return `${ws.name} / ${config.name} / ${objectSet.name}`;
        }
        if (wizardStep > 2) {
            return `${ws.name} / ${config.name} / ${objectSet.name} / ${sObject.name}`;
        }
        return ws.name;
    }
    /**
     * Selects a workspace by ID making it the current workspace.
     * @param id The ID of the workspace to make current.
     */
    static selectWorkspace(id) {
        const db = DatabaseService.getOrCreateAppDb();
        db.workspaceId = id || db.workspaceId;
        const ws = db.workspaces.find(ws => ws.id == db.workspaceId) || new models_1.Workspace();
        if (ws.isInitialized) {
            const path = DatabaseService.getWorkspacePath(ws);
            fs_extra_1.default.ensureDirSync(path);
        }
        DatabaseService.saveAppDb();
    }
    /**
     * Deletes a workspace by ID.
     * @param id The ID of the workspace to delete.
     */
    static deleteWorkspace(id) {
        const db = DatabaseService.getOrCreateAppDb();
        id || (id = db.workspaceId);
        db.workspaces.removeByProps({ id });
        if (db.workspaceId === id) {
            db.workspaceId = db.workspaces.length ? db.workspaces[0].id : '';
        }
        DatabaseService.saveAppDb();
    }
    /**
     * Cleans up the Workspace directory by permanently deleting all folders that are not associated with any of the existing configurations in the Workspace.
     * @param id - Optional. The ID of the Workspace. If not provided, the ID of the current Workspace from the app database will be used.
     */
    static workspaceFolderCleanup(id) {
        const db = DatabaseService.getOrCreateAppDb();
        id || (id = db.workspaceId);
        const ws = db.workspaces.find(ws => ws.id == id) || new models_1.Workspace();
        if (ws.isInitialized) {
            const p = DatabaseService.getWorkspacePath(ws);
            fs_extra_1.default.ensureDirSync(p);
            utils_1.FsUtils.modifyFolder(p, 'delete', (fullPath) => {
                if (fullPath != p) {
                    const configPath = fullPath.split(path.sep).pop();
                    if (!ws.configs.some(cfg => cfg.name.normalizeFilename() == configPath)) {
                        return true;
                    }
                }
            }, 1);
        }
    }
    /* #endregion */
    /* #region Configuration Service Methods */
    /**
     * Creates a new configuration within a workspace.
     * @param workspaceId The ID of the workspace.
     * @param name The name of the configuration.
     */
    static createConfig(workspaceId, name, configtoCloneFrom) {
        let ws = DatabaseService.getWorkspace(workspaceId);
        if (!ws) {
            return "";
        }
        let config = new models_1.ScriptConfig({
            name: name,
            id: utils_1.CommonUtils.randomString()
        });
        if (configtoCloneFrom) {
            config = utils_1.CommonUtils.cloneClassInstance(configtoCloneFrom, models_1.ScriptConfig, common_1.CONSTANTS.DATABASE.APP_DB_TRANSFORMATION_OPTION);
            config.init();
            config.resetId();
            config.name = name;
            config.sObjectId = '';
            config.objectSetId = config.script.objectSets.length ? config.script.objectSets[0].id : "";
        }
        ws.configId = config.id;
        ws.configs.push(config);
        ws = DatabaseService.updateWorkspace(ws);
        config = ws.configs.find((cfg) => cfg.id == config.id);
        const path = DatabaseService.getConfigPath(config);
        fs_extra_1.default.ensureDirSync(path);
    }
    /**
     * Updates a configuration within a workspace.
     * @param workspaceId The ID of the workspace.
     * @param config The updated configuration object.
     */
    static updateConfig(workspaceId, config) {
        let ws = DatabaseService.getWorkspace(workspaceId);
        if (!ws) {
            return;
        }
        const oldPath = ws.config.isInitialized && DatabaseService.getConfigPath(ws.config);
        config = (0, class_transformer_1.plainToInstance)(models_1.ScriptConfig, config, common_1.CONSTANTS.DATABASE.APP_DB_TRANSFORMATION_OPTION);
        ws.configs = ws.configs.replace(config, (source, target) => source.id == target.id);
        ws = DatabaseService.updateWorkspace(ws);
        config = ws.configs.find((cfg) => cfg.id == config.id);
        if (config.isInitialized) {
            const path = DatabaseService.getConfigPath(config);
            if (oldPath && path
                && oldPath != path
                && fs_extra_1.default.existsSync(oldPath)
                && !fs_extra_1.default.existsSync(path)) {
                fs_extra_1.default.moveSync(oldPath, path);
            }
            else {
                fs_extra_1.default.ensureDirSync(path);
            }
        }
    }
    /**
    *  Retrieves the currently selected workspace.
    * @returns  The workspace object.
    */
    static getConfig() {
        const ws = DatabaseService.getWorkspace();
        return ws.config;
    }
    /**
     * Selects a configuration within a workspace.
     * @param workspaceId The ID of the workspace.
     * @param id The ID of the configuration to select.
     */
    static selectConfig(workspaceId, id) {
        const ws = DatabaseService.getWorkspace(workspaceId);
        if (!ws) {
            return;
        }
        ws.configId = id;
        DatabaseService.saveAppDb();
        const cfg = ws.configs.find(config => config.id == id);
        if (cfg.isInitialized) {
            const path = DatabaseService.getConfigPath(cfg);
            fs_extra_1.default.ensureDirSync(path);
        }
    }
    /**
     * Deletes a configuration within a workspace.
     * @param workspaceId The ID of the workspace.
     * @param id The ID of the configuration to delete.
     */
    static deleteConfig(workspaceId, id) {
        const ws = DatabaseService.getWorkspace(workspaceId);
        if (!ws) {
            return;
        }
        id || (id = ws.configId);
        ws.configs.removeByProps({ id });
        if (ws.configId === id) {
            ws.configId = ws.configs.length ? ws.configs[0].id : '';
        }
        DatabaseService.saveAppDb();
    }
    /**
     * Exports a configuration to export.json file.
     * @param workspaceId The ID of the workspace.
     * @param id The ID of the configuration to export.
     * @param silentExport Whether to show the export dialog or not.
     * @returns `true` if the export was successful, `false` otherwise.
     */
    static exportConfig(workspaceId, id, silentExport = false) {
        const ws = DatabaseService.getWorkspace(workspaceId);
        if (!ws) {
            return;
        }
        id || (id = ws.configId);
        const config = ws.configs.find(config => config.id == id);
        if (!config) {
            return;
        }
        let exportPath = DatabaseService.getConfigPath(config, common_1.CONSTANTS.EXPORT_JSON_FILENAME);
        const exportWithOrgs = silentExport ? false : _1.DialogService.showPromptDialog({
            messageKey: "DIALOG.EXPORT_TO_EXPORT_JSON.WITH_ORGS_PROMPT",
            titleKey: "DIALOG.EXPORT_TO_EXPORT_JSON.TITLE"
        });
        exportPath = silentExport ? exportPath : _1.DialogService.showSaveFileDialog(_1.TranslationService.translate({ key: "DIALOG.EXPORT_TO_EXPORT_JSON.TITLE" }), exportPath);
        if (!exportPath) {
            return false;
        }
        // Clone config since we don't want to modify the original config
        const configClone = utils_1.CommonUtils.cloneClassInstance(config, models_1.ScriptConfig, common_1.CONSTANTS.DATABASE.APP_DB_TRANSFORMATION_OPTION);
        configClone.init();
        // Polymorphic fields        
        configClone.script.objectSets.flatBy("objects", models_1.ScriptObject).forEach(obj => obj.includePolymorphicFields());
        // Orgs section
        if (exportWithOrgs) {
            const sourceConnection = DatabaseService.getConnection(ws.sourceConnectionId);
            const targetConnection = DatabaseService.getConnection(ws.targetConnectionId);
            if (sourceConnection.isOrg) {
                configClone.script.orgs.push(new models_1.ScriptOrg({
                    accessToken: sourceConnection.accessToken,
                    instanceUrl: sourceConnection.instanceUrl,
                    orgUserName: sourceConnection.name,
                    name: sourceConnection.userName,
                }));
            }
            if (targetConnection.isOrg) {
                configClone.script.orgs.push(new models_1.ScriptOrg({
                    accessToken: targetConnection.accessToken,
                    instanceUrl: targetConnection.instanceUrl,
                    orgUserName: targetConnection.name,
                    name: targetConnection.userName,
                }));
            }
        }
        const jsonObject = (0, class_transformer_1.instanceToPlain)(configClone.script, exportWithOrgs ? common_1.CONSTANTS.DATABASE.EXPORT_JSON_ORGS_TRANSFORMATION_OPTION
            : common_1.CONSTANTS.DATABASE.EXPORT_JSON_TRANSFORMATION_OPTION);
        // If there is only one object set in the configuration, and no objects in the main script objects array,
        //  we move all objects into the main script objects array and remove this object set
        if (jsonObject.objectSets.length == 1 && !jsonObject.objects.length) {
            jsonObject.objects = jsonObject.objectSets[0].objects;
            delete jsonObject.objectSets;
        }
        fs_extra_1.default.writeJsonSync(exportPath, jsonObject, { spaces: 4 });
        return true;
    }
    /**
     * Imports a configuration from export.json file.
     * @param workspaceId The ID of the workspace.
     * @returns The ID of the imported configuration.
     */
    static importConfig(workspaceId) {
        const ws = DatabaseService.getWorkspace(workspaceId);
        if (!ws) {
            return "";
        }
        const files = _1.DialogService.showOpenFileDialog(_1.TranslationService.translate({ key: 'DIALOG.IMPORT_FROM_EXPORT_JSON.TITLE' }));
        if (!files.length) {
            return "";
        }
        const p = files[0];
        if (!fs_extra_1.default.existsSync(p)) {
            return "";
        }
        const json = fs_extra_1.default.readJsonSync(p);
        if (!json) {
            return "";
        }
        try {
            const script = (0, class_transformer_1.plainToInstance)(models_1.Script, json, common_1.CONSTANTS.DATABASE.EXPORT_JSON_TRANSFORMATION_OPTION);
            const filename = path.basename(p, path.extname(p));
            const config = new models_1.ScriptConfig({
                id: utils_1.CommonUtils.randomString(),
                name: filename,
                script
            });
            config.init();
            // Polymorphic fields
            config.script.objectSets.flatBy("objects", models_1.ScriptObject).forEach(obj => obj.extractPolymorphicFields());
            ws.configId = config.id;
            ws.configs.push(config);
            config.objectSetId = config.script.objectSets.length ? config.script.objectSets[0].id : "";
            DatabaseService.updateWorkspace(ws);
            return config.id;
        }
        catch (error) {
            return "";
        }
    }
    /**
     *  Reads the export.json file for a configuration.
     * @param workspaceId The ID of the workspace.
     * @param id The ID of the configuration.
     * @returns The formatted JSON string of the export.json file.
     */
    static readExportJsonFile(workspaceId, id) {
        const ws = DatabaseService.getWorkspace(workspaceId);
        if (!ws) {
            return "";
        }
        id || (id = ws.configId);
        const config = ws.configs.find(config => config.id == id);
        if (!config) {
            return "";
        }
        const exportPath = DatabaseService.getConfigPath(config, common_1.CONSTANTS.EXPORT_JSON_FILENAME);
        if (!fs_extra_1.default.existsSync(exportPath)) {
            return "";
        }
        const json = fs_extra_1.default.readJsonSync(exportPath);
        if (!json) {
            return "";
        }
        return JSON.stringify(json, null, 4);
    }
    /* #endregion */
    /* #region Object Set Methods */
    /**
     *  Retrieves the currently selected object set within the current workspace.
     * @returns  The object set object.
     */
    static getObjectSet() {
        const config = DatabaseService.getConfig();
        return config.objectSet;
    }
    /* #endregion */
    /* #region Objects Methods */
    /**
     * Retrieves the currently selected sObject within the current config.
     * @returns The sObject object.
     */
    static getSObject(objectName) {
        const config = DatabaseService.getConfig();
        if (!objectName) {
            return config.sObject;
        }
        const objectSet = DatabaseService.getObjectSet();
        return objectSet.objects.find(obj => obj.name == objectName) || new models_1.ScriptObject();
    }
    /* #endregion */
    /* #region Connection Service Methods */
    /**
     * Refreshes the list of connections from Salesforce CLI.
     * @returns A promise that resolves to the result of the refresh.
     */
    static async refreshConnectionsAsync() {
        if (global.appGlobal.isOffline) {
            return {
                orgs: [],
                isError: true,
                errorMessage: _1.TranslationService.translate({ key: "THIS_ACTION_REQUIRED_ACTIVE_INTERNET_CONNECTION" })
            };
        }
        const result = await _1.SfdmuService.execForceOrgListAsync();
        if (result.isError) {
            return result;
        }
        const db = DatabaseService.getOrCreateAppDb();
        let newConnections = result.orgs.filter(org => org.isConnected).map(org => {
            const oldConnection = db.connections.find(conn => conn.orgId == org.orgId);
            return new models_1.Connection({
                accessToken: org.accessToken,
                alias: org.alias,
                apiVersion: org.instanceApiVersion || common_1.CONSTANTS.SFDMU.DEFAULT_API_VERSION,
                type: common_1.ConnectionType.Org,
                id: (oldConnection === null || oldConnection === void 0 ? void 0 : oldConnection.id) || utils_1.CommonUtils.randomString(),
                instanceUrl: org.instanceUrl,
                name: org.username,
                orgId: org.orgId,
                description: oldConnection === null || oldConnection === void 0 ? void 0 : oldConnection.description
            });
        });
        if (!newConnections.some(conn => conn.id == "csvfile")) {
            newConnections.push(new models_1.Connection({
                type: common_1.ConnectionType.File,
                orgId: common_1.CONSTANTS.SFDMU.CSV_FILE_ORG_NAME,
                name: common_1.CONSTANTS.SFDMU.CSV_FILE_OPTION_NAME,
                id: utils_1.CommonUtils.randomString()
            }));
        }
        newConnections = newConnections.sortByKey('userName', "asc", [
            common_1.CONSTANTS.SFDMU.CSV_FILE_OPTION_NAME
        ]);
        const connectionIDsToRemove = db.connections.excludeBy(newConnections, "id", "id").map(conn => conn.id);
        db.connections = newConnections;
        db.workspaces.forEach(ws => {
            if (connectionIDsToRemove.includes(ws.sourceConnectionId)) {
                ws.sourceConnectionId = null;
            }
            if (connectionIDsToRemove.includes(ws.targetConnectionId)) {
                ws.targetConnectionId = null;
            }
            if (!ws.sourceConnectionId) {
                ws.sourceConnectionId = db.orgConnections.length ? db.orgConnections[0].id : null;
            }
            if (!ws.targetConnectionId) {
                ws.targetConnectionId = db.orgConnections.length ? db.orgConnections[0].id : null;
            }
        });
        DatabaseService.saveAppDb();
        return result;
    }
    /**
     * Retrieves a connection by ID.
     * @param id The ID of the connection to retrieve.
     * @returns The connection object.
     */
    static getConnection(id) {
        const db = DatabaseService.getOrCreateAppDb();
        return db.connections.find(conn => conn.id == id) || new models_1.Connection();
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=database-service.js.map