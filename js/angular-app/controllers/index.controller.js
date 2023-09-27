"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexController = void 0;
const common_1 = require("../../common");
const services_1 = require("../../services");
const utils_1 = require("../../utils");
class IndexController {
    constructor($app, $scope) {
        this.$app = $app;
        this.$scope = $scope;
    }
    // Lifecycle hooks ---------------------------------------------------------
    async $onInit() {
        services_1.LogService.info('Initializing IndexController...');
        // Handle menu events
        this.$app.$broadcast.onAction('onClick', 'uiMenu', async (args) => {
            switch (args.action) {
                // File Menu -----------------------------------------------------
                // ---------------------------------------------------------------
                case "File:OpenFolder":
                    {
                        const path = utils_1.AppUtils.getAppPath(common_1.AppPathType.dataRootPath);
                        utils_1.FsUtils.navigateToPathOrUrl(path);
                        services_1.LogService.info(`Opening folder: ${path}`);
                    }
                    break;
                case "File:CleanupApplicationFolder":
                    {
                        const result = services_1.DialogService.showPromptDialog({
                            titleKey: "DIALOG.APPLICATION.CLEANUP",
                            messageKey: "DIALOG.APPLICATION.CLEANUP_PROMPT",
                            dialogType: common_1.DialogType.warning
                        });
                        if (result) {
                            services_1.DatabaseService.applicationFolderCleanup();
                            services_1.LogService.info("The current Workspace was cleaned up");
                            services_1.ToastService.showSuccess();
                        }
                    }
                    break;
                case "File:OpenLogFile":
                    {
                        const logFile = services_1.LogService.getLogFilename();
                        utils_1.FsUtils.navigateToPathOrUrl(logFile);
                        services_1.LogService.info(`Opening log file: ${logFile}`);
                    }
                    break;
                case "File:ClearConsoleLog":
                    {
                        console.clear();
                        services_1.LogService.info("Console log was cleared");
                        services_1.ToastService.showSuccess();
                    }
                    break;
                case 'File:QuiteApp':
                    global.appGlobal.mainWindow.close();
                    break;
                // Workspace Menu ------------------------------------------------
                // ---------------------------------------------------------------
                case 'Workspace:New':
                    {
                        const name = await this.$app.$edit.showDialogAsync({
                            dialogType: 'inputbox',
                            promptMessage: this.$app.$translate.translate({ key: 'DIALOG.WORKSPACE.NEW' }),
                            title: this.$app.$translate.translate({ key: "MENU.NEW_WORKSPACE" }),
                            isRequired: true,
                        });
                        if (name) {
                            utils_1.AngularUtils.$apply(this.$app.$rootScope, () => {
                                services_1.DatabaseService.createWorkspace(name);
                                this.$app.buildAllApplicationViewComponents();
                                this.$app.builAllApplicationMainComponents();
                                services_1.LogService.info(`New workspace created: ${name}`);
                                services_1.ToastService.showSuccess();
                            });
                        }
                    }
                    break;
                case 'Workspace:Rename':
                    {
                        const ws = services_1.DatabaseService.getWorkspace();
                        const name = await this.$app.$edit.showDialogAsync({
                            dialogType: 'inputbox',
                            promptMessage: this.$app.$translate.translate({ key: 'DIALOG.WORKSPACE.RENAME' }),
                            title: this.$app.$translate.translate({ key: "MENU.RENAME_WORKSPACE" }),
                            isRequired: true,
                            defaultValue: ws.name
                        });
                        if (name && name !== ws.name) {
                            utils_1.AngularUtils.$apply(this.$app.$rootScope, () => {
                                const oldName = ws.name;
                                ws.name = name;
                                services_1.DatabaseService.updateWorkspace(ws);
                                this.$app.buildAllApplicationViewComponents();
                                this.$app.builAllApplicationMainComponents();
                                services_1.LogService.info(`Workspace renamed: ${oldName} -> ${name}`);
                                services_1.ToastService.showSuccess();
                            });
                        }
                    }
                    break;
                case 'Workspace:Delete':
                    {
                        const ws = services_1.DatabaseService.getWorkspace();
                        const result = services_1.DialogService.showPromptDialog({
                            titleKey: "MENU.DELETE_WORKSPACE",
                            messageKey: "DIALOG.WORKSPACE.DELETE",
                            dialogType: common_1.DialogType.warning,
                            params: {
                                WORKSPACE_NAME: ws.name
                            }
                        });
                        if (result) {
                            utils_1.AngularUtils.$apply(this.$app.$rootScope, () => {
                                services_1.DatabaseService.deleteWorkspace(ws.id);
                                this.$app.buildAllApplicationViewComponents();
                                this.$app.builAllApplicationMainComponents();
                                services_1.LogService.info(`Workspace deleted: ${ws.name}`);
                                services_1.ToastService.showSuccess();
                            });
                        }
                    }
                    break;
                case 'Workspace:Select':
                    {
                        const db = services_1.DatabaseService.getOrCreateAppDb();
                        const options = db.workspaces.map(ws => {
                            return {
                                value: ws.id,
                                label: ws.name
                            };
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
                            utils_1.AngularUtils.$apply(this.$app.$rootScope, () => {
                                services_1.DatabaseService.selectWorkspace(selectedOption);
                                this.$app.buildAllApplicationViewComponents();
                                this.$app.builAllApplicationMainComponents();
                                const ws = services_1.DatabaseService.getWorkspace();
                                services_1.LogService.info(`Workspace selected: ${ws.name}`);
                                services_1.ToastService.showSuccess();
                            });
                        }
                    }
                    break;
                case 'Workspace:OpenFolder':
                    {
                        const ws = services_1.DatabaseService.getWorkspace();
                        const path = services_1.DatabaseService.getWorkspacePath(ws);
                        utils_1.FsUtils.navigateToPathOrUrl(path);
                        services_1.LogService.info(`Opening folder: ${path}`);
                    }
                    break;
                case 'Workspace:CleanupWorkspaceFolder':
                    {
                        const ws = services_1.DatabaseService.getWorkspace();
                        const result = services_1.DialogService.showPromptDialog({
                            titleKey: "DIALOG.WORKSPACE.CLEANUP",
                            messageKey: "DIALOG.WORKSPACE.CLEANUP_PROMPT",
                            dialogType: common_1.DialogType.warning,
                            params: {
                                WORKSPACE_NAME: ws.name
                            }
                        });
                        if (result) {
                            services_1.DatabaseService.workspaceFolderCleanup(ws.id);
                            services_1.LogService.info(`Workspace folder cleaned up: ${ws.name}`);
                            services_1.ToastService.showSuccess();
                        }
                    }
                    break;
                // Connection Menu ------------------------------------------------
                // ---------------------------------------------------------------
                case 'Connection:Refresh':
                    {
                        const db = services_1.DatabaseService.getOrCreateAppDb();
                        this.$app.$spinner.showSpinner(this.$app.$translate.translate({ key: 'REFRESHING_CONNECTIONS' }));
                        services_1.LogService.info(`Refreshing connections...`);
                        const result = await services_1.DatabaseService.refreshConnectionsAsync();
                        this.$app.$spinner.hideSpinner();
                        if (result.isError) {
                            services_1.LogService.warn(`Error refreshing connections: ${result.errorMessage}`);
                            services_1.ToastService.showError(result.errorMessage);
                            return;
                        }
                        // No other orgs found besides csv org or the one-directional connection
                        if (db.connections.length <= 2) {
                            services_1.LogService.info(`No connections found`);
                            services_1.ToastService.showWarn(this.$app.$translate.translate({ key: 'NO_CONNECTIONS_FOUND' }));
                            return;
                        }
                        this.$app.buildAllApplicationViewComponents();
                        this.$app.builAllApplicationMainComponents();
                        services_1.LogService.info(`Connections refreshed. Found ${db.connections.length - 2} orgs`);
                        services_1.ToastService.showSuccess();
                    }
                    break;
                // Configuration Menu ---------------------------------------------
                // ---------------------------------------------------------------
                case 'Configuration:New':
                    {
                        const ws = services_1.DatabaseService.getWorkspace();
                        const name = await this.$app.$edit.showDialogAsync({
                            dialogType: 'inputbox',
                            promptMessage: this.$app.$translate.translate({ key: 'DIALOG.CONFIGURATION.NEW' }),
                            title: this.$app.$translate.translate({ key: "MENU.NEW_CONFIGURATION" }),
                            isRequired: true,
                        });
                        if (name) {
                            utils_1.AngularUtils.$apply(this.$app.$rootScope, () => {
                                services_1.DatabaseService.createConfig(ws.id, name);
                                this.$app.buildAllApplicationViewComponents();
                                this.$app.builAllApplicationMainComponents();
                                services_1.LogService.info(`New configuration created: ${name}`);
                                services_1.ToastService.showSuccess();
                            });
                        }
                    }
                    break;
                case 'Configuration:Rename':
                    {
                        const config = services_1.DatabaseService.getConfig();
                        const ws = services_1.DatabaseService.getWorkspace();
                        const name = await this.$app.$edit.showDialogAsync({
                            dialogType: 'inputbox',
                            promptMessage: this.$app.$translate.translate({ key: 'DIALOG.CONFIGURATION.RENAME' }),
                            title: this.$app.$translate.translate({ key: "MENU.RENAME_CONFIGURATION" }),
                            isRequired: true,
                            defaultValue: config.name
                        });
                        if (name && name !== config.name) {
                            utils_1.AngularUtils.$apply(this.$app.$rootScope, () => {
                                const oldName = config.name;
                                config.name = name;
                                services_1.DatabaseService.updateWorkspace(ws);
                                this.$app.buildAllApplicationViewComponents();
                                this.$app.builAllApplicationMainComponents();
                                services_1.LogService.info(`Configuration renamed: ${oldName} -> ${name}`);
                                services_1.ToastService.showSuccess();
                            });
                        }
                    }
                    break;
                case 'Configuration:Clone':
                    {
                        const config = services_1.DatabaseService.getConfig();
                        const ws = services_1.DatabaseService.getWorkspace();
                        const name = await this.$app.$edit.showDialogAsync({
                            dialogType: 'inputbox',
                            promptMessage: this.$app.$translate.translate({ key: 'DIALOG.CONFIGURATION.CLONE' }),
                            title: this.$app.$translate.translate({ key: "MENU.CLONE_CONFIGURATION" }),
                            isRequired: true,
                            defaultValue: config.name
                        });
                        if (name && name !== config.name) {
                            utils_1.AngularUtils.$apply(this.$app.$rootScope, () => {
                                services_1.DatabaseService.createConfig(ws.id, name, config);
                                this.$app.buildAllApplicationViewComponents();
                                this.$app.builAllApplicationMainComponents();
                                services_1.LogService.info(`Configuration cloned: ${config.name} -> ${name}`);
                                services_1.ToastService.showSuccess();
                            });
                        }
                    }
                    break;
                case 'Configuration:Delete':
                    {
                        const config = services_1.DatabaseService.getConfig();
                        const ws = services_1.DatabaseService.getWorkspace();
                        const result = services_1.DialogService.showPromptDialog({
                            titleKey: "MENU.DELETE_CONFIGURATION",
                            messageKey: "DIALOG.CONFIGURATION.DELETE",
                            dialogType: common_1.DialogType.warning,
                            params: {
                                CONFIGURATION_NAME: config.name
                            }
                        });
                        if (result) {
                            utils_1.AngularUtils.$apply(this.$app.$rootScope, () => {
                                services_1.DatabaseService.deleteConfig(ws.id, config.id);
                                this.$app.buildAllApplicationViewComponents();
                                this.$app.builAllApplicationMainComponents();
                                services_1.LogService.info(`Configuration deleted: ${config.name}`);
                                services_1.ToastService.showSuccess();
                            });
                        }
                    }
                    break;
                case 'Configuration:Select':
                    {
                        const ws = services_1.DatabaseService.getWorkspace();
                        const options = ws.configs.map(config => {
                            return {
                                value: config.id,
                                label: config.name
                            };
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
                            utils_1.AngularUtils.$apply(this.$app.$rootScope, () => {
                                services_1.DatabaseService.selectConfig(ws.id, selectedOption);
                                this.$app.buildAllApplicationViewComponents();
                                this.$app.builAllApplicationMainComponents();
                                const config = services_1.DatabaseService.getConfig();
                                services_1.LogService.info(`Configuration selected: ${config.name}`);
                                services_1.ToastService.showSuccess();
                            });
                        }
                    }
                    break;
                case 'Configuration:OpenFolder':
                    {
                        const config = services_1.DatabaseService.getConfig();
                        const path = services_1.DatabaseService.getConfigPath(config);
                        utils_1.FsUtils.navigateToPathOrUrl(path);
                        services_1.LogService.info(`Opening folder: ${path}`);
                    }
                    break;
                case 'Configuration:Import':
                    {
                        let ws = services_1.DatabaseService.getWorkspace();
                        const configId = services_1.DatabaseService.importConfig(ws.id);
                        if (configId) {
                            ws = services_1.DatabaseService.getWorkspace();
                            const config = services_1.DatabaseService.getConfig();
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
                                services_1.DatabaseService.deleteConfig(ws.id, configId);
                                services_1.ToastService.showInfo(this.$app.$translate.translate({
                                    key: 'CONFIGURATION_IMPORT_CANCELED'
                                }));
                                return;
                            }
                            utils_1.AngularUtils.$apply(this.$app.$rootScope, () => {
                                if (newConfigName && newConfigName !== config.name) {
                                    const oldName = config.name;
                                    config.name = newConfigName;
                                    services_1.DatabaseService.updateWorkspace(ws);
                                    services_1.LogService.info(`Configuration renamed: ${oldName} -> ${newConfigName}`);
                                }
                                else {
                                    newConfigName = config.name;
                                }
                                this.$app.buildAllApplicationViewComponents();
                                this.$app.builAllApplicationMainComponents();
                                services_1.LogService.info(`Configuration imported: ${newConfigName}`);
                                services_1.ToastService.showSuccess(this.$app.$translate.translate({
                                    key: 'CONFIGURATION_IMPORTED',
                                    params: { CONFIGURATION_NAME: newConfigName }
                                }));
                            });
                        }
                    }
                    break;
                case 'Configuration:Export':
                    {
                        const ws = services_1.DatabaseService.getWorkspace();
                        const success = services_1.DatabaseService.exportConfig(ws.id);
                        if (success) {
                            services_1.LogService.info(`Configuration exported: ${ws.config.name}`);
                            services_1.ToastService.showSuccess();
                        }
                    }
                    break;
                // Help Menu ------------------------------------------------
                // ---------------------------------------------------------------
                case 'Help:About':
                    {
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
                            autoSize: common_1.CONSTANTS.WINDOW_DEFAULT_SIZE,
                            title: this.$app.$translate.translate({
                                key: "ABOUT_PLUGIN",
                                params: {
                                    PLUGIN_NAME: global.appGlobal.packageJson.appConfig.pluginTitle
                                }
                            }),
                        });
                        services_1.LogService.info(`Opening about window`);
                    }
                    break;
                case "Help:Knowledgebase":
                    {
                        utils_1.FsUtils.navigateToPathOrUrl(global.appGlobal.packageJson.appConfig.knowledgebaseUrl);
                        services_1.LogService.info(`Opening knowledgebase: ${global.appGlobal.packageJson.appConfig.knowledgebaseUrl}`);
                    }
                    break;
                case "Help:ViewAppOnGithub":
                    {
                        utils_1.FsUtils.navigateToPathOrUrl(global.appGlobal.packageJson.appConfig.appGithubUrl);
                        services_1.LogService.info(`Opening app on github: ${global.appGlobal.packageJson.appConfig.appGithubUrl}`);
                    }
                    break;
                case "Help:GetHelp":
                    {
                        utils_1.FsUtils.navigateToPathOrUrl(global.appGlobal.packageJson.appConfig.getHelpUrl);
                        services_1.LogService.info(`Opening get help: ${global.appGlobal.packageJson.appConfig.getHelpUrl}`);
                    }
                    break;
            }
        }, this.$scope);
        // TEST:
        // this.$app.$timeout(async () => {
        //     // const db = DatabaseService.getOrCreateAppDb();
        //     // let test = await SfdmuService.queryBatchedAsync("SELECT Id, Name FROM Account LIMIT 1", db.workspace.sourceConnection);
        //     // console.log(test);
        //     // test = await SfdmuService.queryBatchedAsync("SELECT Id, Name, Phone FROM Account LIMIT 100", db.workspace.sourceConnection);
        //     // console.log(test);
        //     const ws = DatabaseService.getWorkspace();
        //     const describeResult = await SfdmuService.connectToOrgAsync(ws.sourceConnection);
        //     console.log(describeResult); 
        // }, 10000);
    }
}
exports.IndexController = IndexController;
IndexController.$inject = ['$app', '$scope'];
//# sourceMappingURL=index.controller.js.map