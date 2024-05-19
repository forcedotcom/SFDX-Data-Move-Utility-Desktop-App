import { AppPathType, CONSTANTS, DialogType } from "../../common";
import { IActionEventArgParam, IMenuItem, IOption } from "../../models";
import { DatabaseService, DialogService, LogService, ToastService } from "../../services";
import { AngularUtils, AppUtils, FsUtils } from "../../utils";
import { IAppService } from "../services";

export class IndexController {

    public static $inject = ['$app', '$scope'];

    constructor(private $app: IAppService, private $scope: angular.IScope) { }

    // Lifecycle hooks ---------------------------------------------------------
    async $onInit(): Promise<void> {

        LogService.info('Initializing IndexController...');

        // Handle menu events
        this.$app.$broadcast.onAction('onClick', 'uiMenu', async (args: IActionEventArgParam<IMenuItem>) => {
            switch (args.action) {

                // File Menu -----------------------------------------------------
                // ---------------------------------------------------------------
                case "File:OpenFolder": {
                    const path = AppUtils.getAppPath(AppPathType.dataRootPath);
                    FsUtils.navigateToPathOrUrl(path);
                    LogService.info(`Opening folder: ${path}`);
                } break;

                case "File:CleanupApplicationFolder": {
                    const result = DialogService.showPromptDialog({
                        titleKey: "DIALOG.APPLICATION.CLEANUP",
                        messageKey: "DIALOG.APPLICATION.CLEANUP_PROMPT",
                        dialogType: DialogType.warning
                    });
                    if (result) {
                        DatabaseService.applicationFolderCleanup();
                        LogService.info("The current Workspace was cleaned up");
                        ToastService.showSuccess();
                    }
                } break;

                case "File:OpenLogFile": {
                    const logFile = LogService.getLogFilename();
                    FsUtils.navigateToPathOrUrl(logFile);
                    LogService.info(`Opening log file: ${logFile}`);
                } break;

                case "File:ClearConsoleLog": {
                    console.clear();
                    LogService.info("Console log was cleared");
                    ToastService.showSuccess();
                } break;

                case 'File:QuiteApp':
                    global.appGlobal.mainWindow.close();
                    break;


                // Workspace Menu ------------------------------------------------
                // ---------------------------------------------------------------
                case 'Workspace:New': {
                    const name = await this.$app.$edit.showDialogAsync({
                        dialogType: 'inputbox',
                        promptMessage: this.$app.$translate.translate({ key: 'DIALOG.WORKSPACE.NEW' }),
                        title: this.$app.$translate.translate({ key: "MENU.NEW_WORKSPACE" }),
                        isRequired: true,
                    });
                    if (name) {
                        AngularUtils.$apply(this.$app.$rootScope, () => {
                            DatabaseService.createWorkspace(name as string);
                            this.$app.buildAllApplicationViewComponents();
                            this.$app.builAllApplicationMainComponents();
                            LogService.info(`New workspace created: ${name}`);
                            ToastService.showSuccess();
                        });
                    }
                } break;

                case 'Workspace:Rename': {
                    const ws = DatabaseService.getWorkspace();
                    const name = await this.$app.$edit.showDialogAsync({
                        dialogType: 'inputbox',
                        promptMessage: this.$app.$translate.translate({ key: 'DIALOG.WORKSPACE.RENAME' }),
                        title: this.$app.$translate.translate({ key: "MENU.RENAME_WORKSPACE" }),
                        isRequired: true,
                        defaultValue: ws.name
                    });
                    if (name && name !== ws.name) {
                        AngularUtils.$apply(this.$app.$rootScope, () => {
                            const oldName = ws.name;
                            ws.name = name as string;
                            DatabaseService.updateWorkspace(ws);
                            this.$app.buildAllApplicationViewComponents();
                            this.$app.builAllApplicationMainComponents();
                            LogService.info(`Workspace renamed: ${oldName} -> ${name}`);
                            ToastService.showSuccess();
                        });
                    }
                } break;

                case 'Workspace:Delete': {
                    const ws = DatabaseService.getWorkspace();
                    const result = DialogService.showPromptDialog({
                        titleKey: "MENU.DELETE_WORKSPACE",
                        messageKey: "DIALOG.WORKSPACE.DELETE",
                        dialogType: DialogType.warning,
                        params: {
                            WORKSPACE_NAME: ws.name
                        }
                    });
                    if (result) {
                        AngularUtils.$apply(this.$app.$rootScope, () => {
                            DatabaseService.deleteWorkspace(ws.id);
                            this.$app.buildAllApplicationViewComponents();
                            this.$app.builAllApplicationMainComponents();
                            LogService.info(`Workspace deleted: ${ws.name}`);
                            ToastService.showSuccess();
                        });
                    }
                } break;

                case 'Workspace:Select': {
                    const db = DatabaseService.getOrCreateAppDb();
                    const options: IOption[] = db.workspaces.map(ws => {
                        return {
                            value: ws.id,
                            label: ws.name
                        }
                    });
                    const selectedOption = await this.$app.$edit.showDialogAsync({
                        dialogType: 'selectbox',
                        promptMessage: this.$app.$translate.translate({ key: 'DIALOG.WORKSPACE.SELECT' }),
                        title: this.$app.$translate.translate({ key: "MENU.SELECT_WORKSPACE" }),
                        isRequired: true,
                        selectBoxOptions: options,
                        defaultValue: db.workspace.id
                    });
                    if (selectedOption && selectedOption !== db.workspace.id) {
                        AngularUtils.$apply(this.$app.$rootScope, () => {
                            DatabaseService.selectWorkspace(selectedOption as string);
                            this.$app.buildAllApplicationViewComponents();
                            this.$app.builAllApplicationMainComponents();
                            const ws = DatabaseService.getWorkspace();
                            LogService.info(`Workspace selected: ${ws.name}`);
                            ToastService.showSuccess();
                        });
                    }
                } break;

                case 'Workspace:OpenFolder': {
                    const ws = DatabaseService.getWorkspace();
                    const path = DatabaseService.getWorkspacePath(ws);
                    FsUtils.navigateToPathOrUrl(path);
                    LogService.info(`Opening folder: ${path}`);
                } break;

                case 'Workspace:CleanupWorkspaceFolder': {
                    const ws = DatabaseService.getWorkspace();
                    const result = DialogService.showPromptDialog({
                        titleKey: "DIALOG.WORKSPACE.CLEANUP",
                        messageKey: "DIALOG.WORKSPACE.CLEANUP_PROMPT",
                        dialogType: DialogType.warning,
                        params: {
                            WORKSPACE_NAME: ws.name
                        }
                    });
                    if (result) {
                        DatabaseService.workspaceFolderCleanup(ws.id);
                        LogService.info(`Workspace folder cleaned up: ${ws.name}`);
                        ToastService.showSuccess();
                    }
                } break;


                // Connection Menu ------------------------------------------------
                // ---------------------------------------------------------------
                case 'Connection:Refresh': {
                    const db = DatabaseService.getOrCreateAppDb();
                    this.$app.$spinner.showSpinner(this.$app.$translate.translate({ key: 'REFRESHING_CONNECTIONS' }));
                    LogService.info(`Refreshing connections...`);
                    const result = await DatabaseService.refreshConnectionsAsync();
                    this.$app.$spinner.hideSpinner();
                    if (result.isError) {
                        LogService.warn(`Error refreshing connections: ${result.errorMessage}`);
                        ToastService.showError(result.errorMessage);
                        return;
                    }
                    // No other orgs found besides csv org or the one-directional connection
                    if (db.connections.length <= 2) {
                        LogService.info(`No connections found`);
                        ToastService.showWarn(this.$app.$translate.translate({ key: 'NO_CONNECTIONS_FOUND' }));
                        return;
                    }
                    this.$app.buildAllApplicationViewComponents();
                    this.$app.builAllApplicationMainComponents();
                    LogService.info(`Connections refreshed. Found ${db.connections.length - 2} orgs`);
                    ToastService.showSuccess();
                } break;



                // Configuration Menu ---------------------------------------------
                // ---------------------------------------------------------------
                case 'Configuration:New': {
                    const ws = DatabaseService.getWorkspace();
                    const name = await this.$app.$edit.showDialogAsync({
                        dialogType: 'inputbox',
                        promptMessage: this.$app.$translate.translate({ key: 'DIALOG.CONFIGURATION.NEW' }),
                        title: this.$app.$translate.translate({ key: "MENU.NEW_CONFIGURATION" }),
                        isRequired: true,
                    });
                    if (name) {
                        AngularUtils.$apply(this.$app.$rootScope, () => {
                            DatabaseService.createConfig(ws.id, name as string);
                            this.$app.buildAllApplicationViewComponents();
                            this.$app.builAllApplicationMainComponents();
                            LogService.info(`New configuration created: ${name}`);
                            ToastService.showSuccess();
                        });
                    }
                } break;

                case 'Configuration:Rename': {
                    const config = DatabaseService.getConfig();
                    const ws = DatabaseService.getWorkspace();
                    const name = await this.$app.$edit.showDialogAsync({
                        dialogType: 'inputbox',
                        promptMessage: this.$app.$translate.translate({ key: 'DIALOG.CONFIGURATION.RENAME' }),
                        title: this.$app.$translate.translate({ key: "MENU.RENAME_CONFIGURATION" }),
                        isRequired: true,
                        defaultValue: config.name
                    });
                    if (name && name !== config.name) {
                        AngularUtils.$apply(this.$app.$rootScope, () => {
                            const oldName = config.name;
                            config.name = name as string;
                            DatabaseService.updateWorkspace(ws);
                            this.$app.buildAllApplicationViewComponents();
                            this.$app.builAllApplicationMainComponents();
                            LogService.info(`Configuration renamed: ${oldName} -> ${name}`);
                            ToastService.showSuccess();
                        });
                    }
                } break;

                case 'Configuration:Clone': {
                    const config = DatabaseService.getConfig();
                    const ws = DatabaseService.getWorkspace();
                    const name = await this.$app.$edit.showDialogAsync({
                        dialogType: 'inputbox',
                        promptMessage: this.$app.$translate.translate({ key: 'DIALOG.CONFIGURATION.CLONE' }),
                        title: this.$app.$translate.translate({ key: "MENU.CLONE_CONFIGURATION" }),
                        isRequired: true,
                        defaultValue: config.name
                    });
                    if (name && name !== config.name) {
                        AngularUtils.$apply(this.$app.$rootScope, () => {
                            DatabaseService.createConfig(ws.id, name as string, config);
                            this.$app.buildAllApplicationViewComponents();
                            this.$app.builAllApplicationMainComponents();
                            LogService.info(`Configuration cloned: ${config.name} -> ${name}`);
                            ToastService.showSuccess();
                        });
                    }
                } break;

                case 'Configuration:Delete': {
                    const config = DatabaseService.getConfig();
                    const ws = DatabaseService.getWorkspace();
                    const result = DialogService.showPromptDialog({
                        titleKey: "MENU.DELETE_CONFIGURATION",
                        messageKey: "DIALOG.CONFIGURATION.DELETE",
                        dialogType: DialogType.warning,
                        params: {
                            CONFIGURATION_NAME: config.name
                        }
                    });
                    if (result) {
                        AngularUtils.$apply(this.$app.$rootScope, () => {
                            DatabaseService.deleteConfig(ws.id, config.id);
                            this.$app.buildAllApplicationViewComponents();
                            this.$app.builAllApplicationMainComponents();
                            LogService.info(`Configuration deleted: ${config.name}`);
                            ToastService.showSuccess();
                        });
                    }
                } break;

                case 'Configuration:Select': {
                    const ws = DatabaseService.getWorkspace();
                    const options: IOption[] = ws.configs.map(config => {
                        return {
                            value: config.id,
                            label: config.name
                        }
                    });
                    const selectedOption = await this.$app.$edit.showDialogAsync({
                        dialogType: 'selectbox',
                        promptMessage: this.$app.$translate.translate({ key: 'DIALOG.CONFIGURATION.SELECT' }),
                        title: this.$app.$translate.translate({ key: "MENU.SELECT_CONFIGURATION" }),
                        isRequired: true,
                        selectBoxOptions: options,
                        defaultValue: ws.configId
                    });
                    if (selectedOption && selectedOption !== ws.configId) {
                        AngularUtils.$apply(this.$app.$rootScope, () => {
                            DatabaseService.selectConfig(ws.id, selectedOption as string);
                            this.$app.buildAllApplicationViewComponents();
                            this.$app.builAllApplicationMainComponents();
                            const config = DatabaseService.getConfig();
                            LogService.info(`Configuration selected: ${config.name}`);
                            ToastService.showSuccess();
                        });
                    }
                } break;

                case 'Configuration:OpenFolder': {
                    const config = DatabaseService.getConfig();
                    const path = DatabaseService.getConfigPath(config);
                    FsUtils.navigateToPathOrUrl(path);
                    LogService.info(`Opening folder: ${path}`);
                } break;


                case 'Configuration:Import': {
                    let ws = DatabaseService.getWorkspace();
                    const configId = DatabaseService.importConfig(ws.id);
                    if (configId) {
                        ws = DatabaseService.getWorkspace();
                        const config = DatabaseService.getConfig();
                        let newConfigName = await this.$app.$edit.showDialogAsync({
                            dialogType: 'inputbox',
                            promptMessage: this.$app.$translate.translate({
                                key: 'DIALOG.IMPORT_CONFIGURATION.RENAME',
                                params: {
                                    CONFIGURATION_NAME: config.name
                                }
                            }),
                            title: this.$app.$translate.translate({ key: "MENU.RENAME_CONFIGURATION" }),
                            isRequired: true,
                            defaultValue: config.name
                        });
                        if (!newConfigName) {
                            DatabaseService.deleteConfig(ws.id, configId);
                            ToastService.showInfo(this.$app.$translate.translate({
                                key: 'CONFIGURATION_IMPORT_CANCELED'
                            }));
                            return;
                        }
                        AngularUtils.$apply(this.$app.$rootScope, () => {
                            if (newConfigName && newConfigName !== config.name) {
                                const oldName = config.name;
                                config.name = newConfigName as string;
                                DatabaseService.updateWorkspace(ws);
                                LogService.info(`Configuration renamed: ${oldName} -> ${newConfigName}`);
                            } else {
                                newConfigName = config.name;
                            }
                            this.$app.buildAllApplicationViewComponents();
                            this.$app.builAllApplicationMainComponents();
                            LogService.info(`Configuration imported: ${newConfigName}`);
                            ToastService.showSuccess(this.$app.$translate.translate({
                                key: 'CONFIGURATION_IMPORTED',
                                params: { CONFIGURATION_NAME: newConfigName }
                            }));
                        });
                    }
                } break;


                case 'Configuration:Export': {
                    const ws = DatabaseService.getWorkspace();
                    const success = DatabaseService.exportConfig(ws.id);
                    if (success) {
                        LogService.info(`Configuration exported: ${ws.config.name}`);
                        ToastService.showSuccess();
                    }
                } break;


                // Help Menu ------------------------------------------------
                // ---------------------------------------------------------------
                case 'Help:About': {

                    global.appGlobal.windowService.show({
                        id: 'aboutWindow',
                        htmlFile: "about.html",
                        windowParameters: {
                            transparent: true,
                            webPreferences: {
                                contextIsolation: false,
                                nodeIntegration: true
                            }
                        },
                        autoSize: CONSTANTS.WINDOW_DEFAULT_SIZE,
                        title: this.$app.$translate.translate({
                            key: "ABOUT_PLUGIN",
                            params: {
                                PLUGIN_NAME: global.appGlobal.packageJson.appConfig.pluginTitle
                            }
                        }),
                    });

                    LogService.info(`Opening about window`);

                } break;

                case "Help:Knowledgebase": {
                    FsUtils.navigateToPathOrUrl(global.appGlobal.packageJson.appConfig.knowledgebaseUrl);
                    LogService.info(`Opening knowledgebase: ${global.appGlobal.packageJson.appConfig.knowledgebaseUrl}`);
                } break;

                case "Help:ViewAppOnGithub": {
                    FsUtils.navigateToPathOrUrl(global.appGlobal.packageJson.appConfig.appGithubUrl);
                    LogService.info(`Opening app on github: ${global.appGlobal.packageJson.appConfig.appGithubUrl}`);
                } break;

                case "Help:GetHelp": {
                    FsUtils.navigateToPathOrUrl(global.appGlobal.packageJson.appConfig.getHelpUrl);
                    LogService.info(`Opening get help: ${global.appGlobal.packageJson.appConfig.getHelpUrl}`);
                } break;

                case "Help:ShowQuickTips": {
                    this.$app.showHiddenQuickTips();
                    LogService.info(`Showing hidden quick tips`);
                    ToastService.showSuccess();
                } break;


            }
        }, this.$scope);

    }


}