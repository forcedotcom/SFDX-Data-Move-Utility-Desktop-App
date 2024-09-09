import { instanceToPlain, plainToInstance } from 'class-transformer';
import fsExtra from 'fs-extra';
import * as path from 'path';
import 'reflect-metadata';
import { BackupService, DialogService, SfdmuService, TranslationService } from '.';
import { AppPathType, CONSTANTS, ConnectionType, Database } from '../common';
import { AppUtils, CommonUtils, FsUtils } from '../utils';

import {
    AppDb, Connection,
    IForceOrgListResult, Script, ScriptConfig, ScriptObject, ScriptObjectSet, ScriptOrg, Workspace
} from '../models';

export class DatabaseService {

    /* #region AppDb Service Methods */
    private static _database: Database;
    private static _db: AppDb;

    /**
     * Retrieves or creates the AppDb instance.
     * @returns The AppDb instance.
     */
    static getOrCreateAppDb(): AppDb {
        const getOrCreateAppDb = () => {
            if (!DatabaseService._db) {
                DatabaseService._db = DatabaseService._database.getById(
                    "db",
                    AppDb,
                    CONSTANTS.DATABASE.APP_DB_TRANSFORMATION_OPTION
                );
                DatabaseService._db.init();
            }
            return DatabaseService._db;
        };
        if (DatabaseService._database) {
            return getOrCreateAppDb();
        }
        const filename = DatabaseService.getAppDbFilename();
        DatabaseService._database = new Database(filename, 'utf-8');
        if (DatabaseService._database.all().length) {
            return getOrCreateAppDb();
        }
        DatabaseService._db = new AppDb();
        DatabaseService._database.create(
            DatabaseService._db,
            "db",
            CONSTANTS.DATABASE.APP_DB_TRANSFORMATION_OPTION
        );
        return getOrCreateAppDb();
    }

    /**
     * Saves the AppDb instance to the database.
     */
    static saveAppDb(): void {
        if (!DatabaseService._database) {
            return;
        }
        const db = DatabaseService.getOrCreateAppDb();
        DatabaseService._database.updateById("db", db, CONSTANTS.DATABASE.APP_DB_TRANSFORMATION_OPTION);
    }

    /**
     * Creates a backup of the AppDb file.
     */
    static backupAppDb(): void {
        const backup = new BackupService(
            AppUtils.getAppPath(AppPathType.dbBackupPath),
            DatabaseService.getAppDbFilename()
        );
        backup.backupFile();
    }

    static scheduleBackupAppDb(intervalInMinutes: number): void {
        const backup = new BackupService(
            AppUtils.getAppPath(AppPathType.dbBackupPath),
            DatabaseService.getAppDbFilename()
        );
        backup.scheduleBackupFile(intervalInMinutes);
    }

    /**
     * Retrieves the filename of the AppDb.
     * @returns The filename of the AppDb.
     */
    static getAppDbFilename(): string {
        return AppUtils.getAppPath(AppPathType.dataRootPath,
            global.appGlobal.packageJson.appConfig.databaseFilename || CONSTANTS.DEFAULT_DATABASE_FILENAME
        );
    }

    /**
     * Validates the AppDb and saves it if was fixed and changed during the validation.
     */
    static validateAppDb(): void {
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
    static getWorkspacePath(workspace: Partial<Workspace>, relativePath?: string): string {
        relativePath ||= "";
        return AppUtils.getAppPath(AppPathType.dataRootPath,
            path.join(
                CONSTANTS.WORKSPACES_PATH,
                workspace.name.normalizeFilename(),
                relativePath
            )
        );
    }

    /**
     * Retrieves the absolute path for a configuration within a workspace.
     * @param config The configuration object.
     * @param relativePath The relative path within the configuration (optional).
     * @returns The absolute path for the configuration.
     */
    static getConfigPath(config: Partial<ScriptConfig>, relativePath?: string): string {
        relativePath ||= "";
        return DatabaseService.getWorkspacePath(
            { name: config.ws.name },
            path.join(config.name.normalizeFilename(), relativePath)
        );
    }

    /* #endregion */

    /* #region Application Folder Service Methods */
    /**
     * Cleans up the application folder by permanently deleting all workspace folders that are not present in the app database.
     */
    static applicationFolderCleanup(): void {
        const wsRootPath = AppUtils.getAppPath(AppPathType.dataRootPath, CONSTANTS.WORKSPACES_PATH);
        FsUtils.modifyFolder(wsRootPath, 'delete', (fullPath) => {
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
    static createWorkspace(name: string): string {
        const db = DatabaseService.getOrCreateAppDb();
        name = (name || '').trim();
        const ws = new Workspace({
            id: CommonUtils.randomString(),
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
        fsExtra.ensureDirSync(path);
        return ws.id;
    }

    /**
     * Repalces the currently selected workspace with an updated one.
     * @param workspace The workspace to save instead of the existing one.
     * @returns The updated and newly saved workspace object.
     */
    static updateWorkspace(workspace: any): Workspace {
        const db = DatabaseService.getOrCreateAppDb();
        const ws = plainToInstance(
            Workspace,
            workspace,
            CONSTANTS.DATABASE.APP_DB_TRANSFORMATION_OPTION
        ) as any as Workspace;

        const oldPath = db.workspace.isInitialized ? DatabaseService.getWorkspacePath(db.workspace) : null;

        db.workspaces = db.workspaces.replace(ws, (source, target) => source.id == target.id);
        db.init();

        workspace = db.workspaces.find((ws: { id: string; }) => ws.id == workspace.id);

        if (ws.isInitialized) {
            const path = DatabaseService.getWorkspacePath(workspace);
            if (oldPath && path
                && oldPath != path
                && fsExtra.existsSync(oldPath)
                && !fsExtra.existsSync(path)) {
                fsExtra.moveSync(oldPath, path);
            } else {
                fsExtra.ensureDir(path);
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
    static getWorkspace(id?: string): Workspace {
        const db = DatabaseService.getOrCreateAppDb();
        id ||= db.workspaceId;
        const ws = db.workspaces.find(ws => ws.id == id) || new Workspace();
        if (ws.isInitialized) {
            let path = DatabaseService.getWorkspacePath(ws);
            fsExtra.ensureDirSync(path);
            if (ws.config.isInitialized) {
                path = DatabaseService.getConfigPath(ws.config);
                fsExtra.ensureDirSync(path);
            }
        }
        return ws;
    }

    /**
     *  Retrieves the display path for the currently selected workspace.
     * @returns  The display path for the workspace.
     */
    static getWorkspaceDisplayPath(wizardStep: number): string {

        const ws = DatabaseService.getWorkspace();
        const config = DatabaseService.getConfig();
        const objectSet = DatabaseService.getObjectSet();
        const sObject = DatabaseService.getSObject();

        if (!ws.isInitialized) {
            return TranslationService.translate({ key: "NOT_SET" });
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
    static selectWorkspace(id: string): void {
        const db = DatabaseService.getOrCreateAppDb();
        db.workspaceId = id || db.workspaceId;
        const ws = db.workspaces.find(ws => ws.id == db.workspaceId) || new Workspace();
        if (ws.isInitialized) {
            const path = DatabaseService.getWorkspacePath(ws);
            fsExtra.ensureDirSync(path);
        }
        DatabaseService.saveAppDb();
    }

    /**
     * Deletes a workspace by ID.
     * @param id The ID of the workspace to delete.
     */
    static deleteWorkspace(id?: string): void {
        const db = DatabaseService.getOrCreateAppDb();
        id ||= db.workspaceId;
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
    static workspaceFolderCleanup(id?: string): void {
        const db = DatabaseService.getOrCreateAppDb();
        id ||= db.workspaceId;
        const ws = db.workspaces.find(ws => ws.id == id) || new Workspace();

        if (ws.isInitialized) {
            const p = DatabaseService.getWorkspacePath(ws);
            fsExtra.ensureDirSync(p);
            FsUtils.modifyFolder(p, 'delete', (fullPath) => {
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
    static createConfig(workspaceId: string, name: string, configtoCloneFrom?: ScriptConfig): string {
        let ws = DatabaseService.getWorkspace(workspaceId);
        if (!ws) {
            return "";
        }
        let config = new ScriptConfig({
            name: name as string,
            id: CommonUtils.randomString()
        });
        if (configtoCloneFrom) {
            config = CommonUtils.cloneClassInstance(configtoCloneFrom, ScriptConfig, CONSTANTS.DATABASE.APP_DB_TRANSFORMATION_OPTION);
            config.init();
            config.resetId();
            config.name = name as string;
            config.sObjectId = '';
            config.objectSetId = config.script.objectSets.length ? config.script.objectSets[0].id : "";
        }

        ws.configId = config.id;
        ws.configs.push(config);

        ws = DatabaseService.updateWorkspace(ws);
        config = ws.configs.find((cfg: { id: string; }) => cfg.id == config.id);

        const path = DatabaseService.getConfigPath(config);
        fsExtra.ensureDirSync(path);
    }

    /**
     * Updates a configuration within a workspace.
     * @param workspaceId The ID of the workspace.
     * @param config The updated configuration object.
     */
    static updateConfig(workspaceId: string, config: any): void {
        let ws = DatabaseService.getWorkspace(workspaceId);
        if (!ws) {
            return;
        }
        const oldPath = ws.config.isInitialized && DatabaseService.getConfigPath(ws.config);

        config = plainToInstance(
            ScriptConfig,
            config,
            CONSTANTS.DATABASE.APP_DB_TRANSFORMATION_OPTION
        ) as any as ScriptConfig;
        ws.configs = ws.configs.replace(config, (source, target) => source.id == target.id);

        ws = DatabaseService.updateWorkspace(ws);
        config = ws.configs.find((cfg: { id: string; }) => cfg.id == config.id);

        if (config.isInitialized) {
            const path = DatabaseService.getConfigPath(config);
            if (oldPath && path
                && oldPath != path
                && fsExtra.existsSync(oldPath)
                && !fsExtra.existsSync(path)) {
                fsExtra.moveSync(oldPath, path);
            } else {
                fsExtra.ensureDirSync(path);
            }
        }
    }

    /**
    *  Retrieves the currently selected workspace.
    * @returns  The workspace object.
    */
    static getConfig(): ScriptConfig {
        const ws = DatabaseService.getWorkspace();
        return ws.config;
    }

    /**
     * Selects a configuration within a workspace.
     * @param workspaceId The ID of the workspace.
     * @param id The ID of the configuration to select.
     */
    static selectConfig(workspaceId: string, id: string): void {
        const ws = DatabaseService.getWorkspace(workspaceId);
        if (!ws) {
            return;
        }

        ws.configId = id;
        DatabaseService.saveAppDb();

        const cfg = ws.configs.find(config => config.id == id);
        if (cfg.isInitialized) {
            const path = DatabaseService.getConfigPath(cfg);
            fsExtra.ensureDirSync(path);
        }
    }

    /**
     * Deletes a configuration within a workspace.
     * @param workspaceId The ID of the workspace.
     * @param id The ID of the configuration to delete.
     */
    static deleteConfig(workspaceId: string, id?: string): void {
        const ws = DatabaseService.getWorkspace(workspaceId);
        if (!ws) {
            return;
        }
        id ||= ws.configId;
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
    static exportConfig(workspaceId: string, id?: string, silentExport = false): boolean {
        const ws = DatabaseService.getWorkspace(workspaceId);
        if (!ws) {
            return;
        }
        id ||= ws.configId;
        const config = ws.configs.find(config => config.id == id);
        if (!config) {
            return;
        }
        let exportPath = DatabaseService.getConfigPath(config, CONSTANTS.EXPORT_JSON_FILENAME);
        const exportWithOrgs = silentExport ? false : DialogService.showPromptDialog({
            messageKey: "DIALOG.EXPORT_TO_EXPORT_JSON.WITH_ORGS_PROMPT",
            titleKey: "DIALOG.EXPORT_TO_EXPORT_JSON.TITLE"
        });

        exportPath = silentExport ? exportPath : DialogService.showSaveFileDialog(TranslationService.translate({ key: "DIALOG.EXPORT_TO_EXPORT_JSON.TITLE" }), exportPath);
        if (!exportPath) {
            return false;
        }

        // Clone config since we don't want to modify the original config
        const configClone = CommonUtils.cloneClassInstance(config, ScriptConfig, CONSTANTS.DATABASE.APP_DB_TRANSFORMATION_OPTION);
        configClone.init();

        // Polymorphic fields        
        configClone.script.objectSets.flatBy("objects", ScriptObject).forEach(obj => obj.includePolymorphicFields());

        // Orgs section
        if (exportWithOrgs) {
            const sourceConnection = DatabaseService.getConnection(ws.sourceConnectionId);
            const targetConnection = DatabaseService.getConnection(ws.targetConnectionId);
            if (sourceConnection.isOrg) {
                configClone.script.orgs.push(new ScriptOrg({
                    accessToken: sourceConnection.accessToken,
                    instanceUrl: sourceConnection.instanceUrl,
                    orgUserName: sourceConnection.name,
                    name: sourceConnection.userName,
                }));
            }
            if (targetConnection.isOrg) {
                configClone.script.orgs.push(new ScriptOrg({
                    accessToken: targetConnection.accessToken,
                    instanceUrl: targetConnection.instanceUrl,
                    orgUserName: targetConnection.name,
                    name: targetConnection.userName,
                }));
            }
        }

        const jsonObject = instanceToPlain(configClone.script,
            exportWithOrgs ? CONSTANTS.DATABASE.EXPORT_JSON_ORGS_TRANSFORMATION_OPTION
                : CONSTANTS.DATABASE.EXPORT_JSON_TRANSFORMATION_OPTION) as Script;

        // If there is only one object set in the configuration, and no objects in the main script objects array,
        //  we move all objects into the main script objects array and remove this object set
        if (jsonObject.objectSets.length == 1 && !jsonObject.objects.length) {
            jsonObject.objects = jsonObject.objectSets[0].objects;
            delete jsonObject.objectSets;
        }

        fsExtra.writeJsonSync(exportPath, jsonObject, { spaces: 4 });
        return true;
    }

    /**
     * Imports a configuration from export.json file.
     * @param workspaceId The ID of the workspace.
     * @returns The ID of the imported configuration.
     */
    static importConfig(workspaceId: string): string {
        const ws = DatabaseService.getWorkspace(workspaceId);
        if (!ws) {
            return "";
        }
        const files = DialogService.showOpenFileDialog(TranslationService.translate({ key: 'DIALOG.IMPORT_FROM_EXPORT_JSON.TITLE' }));
        if (!files.length) {
            return "";
        }
        const p = files[0];
        if (!fsExtra.existsSync(p)) {
            return "";
        }
        const json = fsExtra.readJsonSync(p);
        if (!json) {
            return "";
        }
        try {
            const script = plainToInstance(Script, json, CONSTANTS.DATABASE.EXPORT_JSON_TRANSFORMATION_OPTION) as any as Script;
            const filename = path.basename(p, path.extname(p));
            const config = new ScriptConfig({
                id: CommonUtils.randomString(),
                name: filename,
                script
            });
            config.init();
            // Polymorphic fields
            config.script.objectSets.flatBy("objects", ScriptObject).forEach(obj => obj.extractPolymorphicFields());

            ws.configId = config.id;
            ws.configs.push(config);
            config.objectSetId = config.script.objectSets.length ? config.script.objectSets[0].id : "";
            DatabaseService.updateWorkspace(ws);
            return config.id;

        } catch (error) {
            return "";
        }

    }

    /**
     *  Reads the export.json file for a configuration.
     * @param workspaceId The ID of the workspace.
     * @param id The ID of the configuration.
     * @returns The formatted JSON string of the export.json file.
     */
    static readExportJsonFile(workspaceId: string, id?: string): string {
        const ws = DatabaseService.getWorkspace(workspaceId);
        if (!ws) {
            return "";
        }
        id ||= ws.configId;
        const config = ws.configs.find(config => config.id == id);
        if (!config) {
            return "";
        }
        const exportPath = DatabaseService.getConfigPath(config, CONSTANTS.EXPORT_JSON_FILENAME);
        if (!fsExtra.existsSync(exportPath)) {
            return "";
        }
        const json = fsExtra.readJsonSync(exportPath);
        if (!json) {
            return "";
        }
        return JSON.stringify(json, null, 4);
    }

    /* #endregion */


    /* #region Object Set Methods */

    /**
     *  Creates a new ObjectSet
     * @param name  The name of the new object set.
     */
    static createObjectSet(name: string) {
        const config = DatabaseService.getConfig();
        const ws = DatabaseService.getWorkspace();
        const objectSet = new ScriptObjectSet({
            name: name as string,
            id: CommonUtils.randomString()
        });
        config.script.objectSets.push(objectSet);
        config.objectSetId = objectSet.id;
        DatabaseService.updateConfig(ws.id, config);
    }


    /**
     *  Clones the current Object Set and adds it to the current configuration.
     * @param id  The ID of the object set to clone.
     * @param name  The name of the new object set.
     */
    static cloneObjectSet(id: string, name: string) {
        const config = DatabaseService.getConfig();
        const ws = DatabaseService.getWorkspace();
        const sourceObjectSet = config.script.objectSets.find(objSet => objSet.id == id);
        const objectSet = CommonUtils.cloneClassInstance(sourceObjectSet, ScriptObjectSet, CONSTANTS.DATABASE.APP_DB_TRANSFORMATION_OPTION);
        objectSet.id = CommonUtils.randomString();
        objectSet.init();
        objectSet.resetId();
        config.objectSetId = objectSet.id;
        config.script.objectSets.push(objectSet);
        objectSet.name = name as string;
        DatabaseService.updateConfig(ws.id, config);
    }

    /**
     *  Retrieves the currently selected object set within the current workspace.
     * @returns  The object set object.
     */
    static getObjectSet(): ScriptObjectSet {
        const config = DatabaseService.getConfig();
        return config.objectSet;
    }
    /* #endregion */


    /* #region Objects Methods */
    /**
     * Retrieves the currently selected sObject within the current config.
     * @returns The sObject object.
     */
    static getSObject(objectName?: string): ScriptObject {
        const config = DatabaseService.getConfig();
        if (!objectName) {
            return config.sObject;
        }
        const objectSet = DatabaseService.getObjectSet();
        return objectSet.objects.find(obj => obj.name == objectName) || new ScriptObject();
    }
    /* #endregion */


    /* #region Connection Service Methods */
    /**
     * Refreshes the list of connections from Salesforce CLI.
     * @returns A promise that resolves to the result of the refresh.
     */
    static async refreshConnectionsAsync(): Promise<IForceOrgListResult> {
        if (global.appGlobal.isOffline) {
            return {
                orgs: [],
                isError: true,
                errorMessage: TranslationService.translate({ key: "THIS_ACTION_REQUIRED_ACTIVE_INTERNET_CONNECTION" })
            };
        }
        const result = await SfdmuService.execForceOrgListAsync();
        if (result.isError) {
            return result;
        }
        const db = DatabaseService.getOrCreateAppDb();
        let newConnections = result.orgs.filter(org => org.isConnected).map(org => {
            const oldConnection = db.connections.find(conn => conn.orgId == org.orgId);
            return new Connection({
                accessToken: org.accessToken,
                alias: org.alias,
                apiVersion: org.instanceApiVersion || CONSTANTS.SFDMU.DEFAULT_API_VERSION,
                type: ConnectionType.Org,
                id: oldConnection?.id || CommonUtils.randomString(),
                instanceUrl: org.instanceUrl,
                name: org.username,
                orgId: org.orgId,
                description: oldConnection?.description
            });
        });
        if (!newConnections.some(conn => conn.id == "csvfile")) {
            newConnections.push(new Connection({
                type: ConnectionType.File,
                orgId: CONSTANTS.SFDMU.CSV_FILE_ORG_NAME,
                name: CONSTANTS.SFDMU.CSV_FILE_OPTION_NAME,
                id: CommonUtils.randomString()
            }));
        }
        newConnections = newConnections.sortByKey('userName', "asc", [
            CONSTANTS.SFDMU.CSV_FILE_OPTION_NAME
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
    static getConnection(id: string): Connection {
        const db = DatabaseService.getOrCreateAppDb();
        return db.connections.find(conn => conn.id == id) || new Connection();
    }
    /* #endregion */


}
