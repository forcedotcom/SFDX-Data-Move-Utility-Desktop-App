"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const angular_1 = __importDefault(require("angular"));
const common_1 = require("../../../common");
const models_1 = require("../../../models");
const services_1 = require("../../../services");
const utils_1 = require("../../../utils");
/**
 * Represents the application service interface containing multiple utility services
 * and methods to build main application components like menus and wizards.
 */
class AppService {
    constructor($state, $rootScope, $broadcast, $timeout, $translate, $md, $edit, $spinner, $bottomToast, $displayLog) {
        this.$state = $state;
        this.$rootScope = $rootScope;
        this.$broadcast = $broadcast;
        this.$timeout = $timeout;
        this.$translate = $translate;
        this.$md = $md;
        this.$edit = $edit;
        this.$spinner = $spinner;
        this.$bottomToast = $bottomToast;
        this.$displayLog = $displayLog;
        /**
         * The model of the main toolbar of the application.
         */
        this.toolbarModel = {
            nextDisabled: true,
            previousDisabled: true,
            message: '',
        };
        this.orgDescribe = new models_1.OrgDescribe();
        this.viewErrorsMap = new Map();
        this.isScriptRunning = false;
        this.setup();
    }
    // Service Setup Methods ----------------------------------------------------------	
    /**
     * Setup the application service.
     */
    setup() {
        // Initialize root scope variables
        this.setupRootScopeVars();
        // Initialize navigation events
        this.setupNavigationEvents();
        // Iniaialize state change
        this.setupNavigationStateChange();
        // Initialize language change
        this.setupLanguageChange();
        // Initialize UI notification events
        this.setupUiNotificationEvent();
        // Initialize UI components
        this.$timeout(() => {
            // Build main application components
            this.builAllApplicationMainComponents();
            // Initialize side log display
            this.setupSideLogDisplay();
            // Initialize bottom toast display
            this.setupBottomToast();
            // Initialize spinner application exit event when long running process is running
            this.setupSpinnerExitEvent();
        }, 500);
    }
    setupSpinnerExitEvent() {
        this.$broadcast.onAction('onExit', 'SpinnerService', () => {
            global.appGlobal.mainWindow.close();
        });
    }
    setupBottomToast() {
        if (global.appGlobal.isOffline) {
            this.$bottomToast.showToast(this.$translate.translate({ key: "INTERNET_CONNECTION_LOST" }));
        }
        global.appGlobal.networkStatusService.on('connectionLost', () => {
            this.$bottomToast.showToast(this.$translate.translate({ key: "INTERNET_CONNECTION_LOST" }));
        });
        global.appGlobal.networkStatusService.on('connectionRestored', () => {
            this.$bottomToast.hideToast();
        });
    }
    setupSideLogDisplay() {
        this.$displayLog.initialize('#browser-logs', common_1.CONSTANTS.DISPLAY_LOG_DIV_HEIGHT);
        global.appGlobal.browserConsoleLogService.on(models_1.ConsoleEventType.log, (message) => {
            this.$displayLog.addRow(message, 'log');
        });
        global.appGlobal.browserConsoleLogService.on(models_1.ConsoleEventType.warn, (message) => {
            this.$displayLog.addRow(message, 'warn');
        });
        global.appGlobal.browserConsoleLogService.on(models_1.ConsoleEventType.error, (message) => {
            this.$displayLog.addRow(message, 'error');
        });
        global.appGlobal.browserConsoleLogService.on(models_1.ConsoleEventType.clear, () => {
            this.$displayLog.clear();
        });
    }
    setupUiNotificationEvent() {
        this.$broadcast.onAction(common_1.ProgressEventType.ui_notification, null, (args) => {
            const info = args.args[0];
            if (info.messageOrKey && this.$spinner.isSpinnerVisible()) {
                info.messageOrKey = this.$translate.translate({ key: info.messageOrKey });
                this.$spinner.showSpinner(info.messageOrKey);
            }
        });
    }
    setupLanguageChange() {
        this.$broadcast.onAction('onChange', 'uiLangSwitcher', () => {
            this.$state.go(common_1.View.home);
            this.$timeout(() => {
                window.location.reload();
            }, 100);
        });
    }
    setupNavigationStateChange() {
        const self = this;
        this.$rootScope.$on('$stateChangeStart', async (event, toState) => {
            if (!toState.name) {
                return;
            }
            if ([common_1.View.connection, common_1.View.configuration, common_1.View.preview].includes(common_1.View[toState.name])) {
                if (global.appGlobal.isOffline) {
                    services_1.ToastService.showError(this.$translate.translate({ key: "THIS_ACTION_REQUIRED_ACTIVE_INTERNET_CONNECTION" }));
                    _preventStateTransition(event);
                    return;
                }
            }
            const ws = services_1.DatabaseService.getWorkspace();
            const config = services_1.DatabaseService.getConfig();
            // Navigation from  connection to configuration
            if (toState.name == common_1.View.configuration && global.appGlobal.wizardStep == common_1.WizardStepByView[common_1.View.connection]) {
                this.$spinner.showSpinner();
                this.orgDescribe = new models_1.OrgDescribe();
                const sourceOrgDescribeResult = await services_1.SfdmuService.connectToOrgAsync(ws.sourceConnection);
                if (sourceOrgDescribeResult.isError) {
                    _handleConnectionFailed(sourceOrgDescribeResult);
                    return;
                }
                if (ws.targetConnectionId != ws.sourceConnectionId) {
                    const targetOrgDescribeResult = await services_1.SfdmuService.connectToOrgAsync(ws.targetConnection);
                    if (targetOrgDescribeResult.isError) {
                        _handleConnectionFailed(targetOrgDescribeResult);
                        return;
                    }
                }
                else {
                    ws.targetConnection.orgDescribe = ws.sourceConnection.orgDescribe;
                }
                this.orgDescribe = services_1.SfdmuService.createOrgDescribeFromConnections(ws.sourceConnection, ws.targetConnection);
            }
            // Navigation from configuration to preview
            if (toState.name == common_1.View.preview && global.appGlobal.wizardStep == common_1.WizardStepByView[common_1.View.configuration]) {
                const cliSourceConnection = ws.db.connections.find(connection => connection.userName == ws.cli.sourceusername);
                const cliTargetConnection = ws.db.connections.find(connection => connection.userName == ws.cli.targetusername);
                this.updateCliCommand(ws, {
                    sourceusername: !cliSourceConnection ? ws.sourceConnection.userName : ws.cli.sourceusername,
                    targetusername: !cliTargetConnection ? ws.targetConnection.userName : ws.cli.targetusername,
                    path: services_1.DatabaseService.getConfigPath(config)
                });
                services_1.DatabaseService.exportConfig(ws.id, null, true);
            }
            const wizardStepIndex = common_1.WizardStepByView[common_1.View[toState.name]];
            global.appGlobal.wizardStep = wizardStepIndex;
            this.$broadcast.broadcastAction('setCurrentStep', 'uiWizardStep', {
                args: [wizardStepIndex],
                componentId: 'mainWizard'
            });
            this.buildAllApplicationViewComponents();
            this.builAllApplicationMainComponents();
            this.$spinner.hideSpinner();
            services_1.LogService.info(`State change to: ${toState.name}`);
            function _handleConnectionFailed(orgDescribeResult) {
                self.$spinner.hideSpinner();
                services_1.LogService.warn(`Connection attempt failed: ${orgDescribeResult.errorMessage}`);
                services_1.ToastService.showError(orgDescribeResult.errorMessage);
                _preventStateTransition(event);
            }
            function _preventStateTransition(event) {
                event.preventDefault();
                const thisView = common_1.ViewByWizardStep[global.appGlobal.wizardStep];
                self.$state.go(thisView, null, { notify: false });
            }
        });
    }
    setupRootScopeVars() {
        this.$rootScope["global"] = global.appGlobal;
        this.$rootScope["github"] = global.appGlobal.githubRepoInfo;
        this.$rootScope["package"] = global.appGlobal.packageJson;
        this.$rootScope["config"] = global.appGlobal.packageJson.appConfig;
        this.$rootScope["toolbar"] = this.toolbarModel;
    }
    setupNavigationEvents() {
        this.$rootScope["goNextStep"] = () => {
            const nextView = common_1.ViewByWizardStep[global.appGlobal.wizardStep + 1];
            //this.$timeout(() => {
            this.$state.go(nextView, null, {
                reload: true
            });
            //});
        };
        this.$rootScope["goPreviousStep"] = () => {
            const previousView = common_1.ViewByWizardStep[global.appGlobal.wizardStep - 1];
            //this.$timeout(() => {
            this.$state.go(previousView, {
                reload: true
            });
            //});
        };
    }
    /**
     * Builds the main wizard of the application.
     */
    buildMainWizard() {
        // Build main wizard source
        const mainWizardSource = [
            { value: 'workspace', label: this.$translate.translate({ key: "WORKSPACE" }) },
            { value: 'connection', label: this.$translate.translate({ key: "CONNECTION" }) },
            { value: 'configuration', label: this.$translate.translate({ key: "CONFIGURATION" }) },
            { value: 'review', label: this.$translate.translate({ key: "REVIEW" }) },
            { value: 'run', label: this.$translate.translate({ key: "RUN" }) },
        ];
        // Broadcast main wizard source
        this.$broadcast.broadcastAction('setSteps', 'uiWizardStep', {
            eventSource: 'uiWizardStep',
            args: mainWizardSource,
            componentId: 'mainWizard'
        });
    }
    /**
     * Sets the main state alert box.
     * @param type The type of the alert box.
     * @param message The message of the alert box.
     * 					This message will be displayed as a body of the alert box.
     * 					Accepted as a markdown string.
     * @param description The description of the alert box. This description will be displayed as a tooltip.
     */
    setMainStateAlertBox(type, message, description) {
        const alertData = {
            message: message,
            iconTooltip: description,
            type: type == 'action-required' ? 'primary'
                : type == 'warning' ? 'warning'
                    : type == 'success' ? 'success' : 'info'
        };
        this.$broadcast.broadcastAction('setAlert', 'uiAlert', {
            componentId: 'mainStateAlertBox',
            args: [alertData]
        });
    }
    // Service Methods ----------------------------------------------------------
    builAllApplicationMainComponents() {
        this.buildMainMenu();
        this.buildMainWizard();
        this.clearViewErrors();
        this.buildMainToolbar();
        this.buildFooter();
    }
    buildAllApplicationViewComponents() {
        this.$broadcast.broadcastAction('buildViewComponents', null, {});
    }
    buildMainMenu() {
        const ws = services_1.DatabaseService.getWorkspace();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const db = services_1.DatabaseService.getOrCreateAppDb();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const config = services_1.DatabaseService.getConfig();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const objectSet = services_1.DatabaseService.getObjectSet();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const sObject = services_1.DatabaseService.getSObject();
        // Build main menu source
        const mainMenuSource = [
            {
                id: 'file',
                title: this.$translate.translate({ key: "FILE" }),
                disabled: this.isScriptRunning,
                action: 'Menu:File',
                children: [
                    {
                        action: 'File:OpenFolder',
                        title: this.$translate.translate({ key: "MENU.OPEN_APP_FOLDER_IN_EXPLORER" }),
                        icons: [{ icon: common_1.FaIcon.folderOpen }]
                    },
                    {
                        action: 'File:CleanupApplicationFolder',
                        title: this.$translate.translate({ key: "MENU.CLEANUP_APPLICATION_DIRECTORY" }),
                        icons: [{ icon: common_1.FaIcon.cleanup }]
                    },
                    {
                        itemType: 'divider'
                    },
                    {
                        action: "File:ClearConsoleLog",
                        title: this.$translate.translate({ key: "MENU.CLEAR_CONSOLE_LOG" }),
                        icons: [{ icon: common_1.FaIcon.eraser }]
                    },
                    {
                        action: "File:OpenLogFile",
                        title: this.$translate.translate({ key: "MENU.OPEN_LOG_FILE" }),
                        icons: [{ icon: common_1.FaIcon.file }]
                    },
                    {
                        itemType: 'divider'
                    },
                    {
                        id: 'quiteApp',
                        icons: [{ icon: common_1.FaIcon.faSignOutAlt, }],
                        title: this.$translate.translate({ key: "QUIT_APP" }),
                        action: 'File:QuiteApp',
                    }
                ]
            },
            {
                id: 'workspace',
                title: this.$translate.translate({ key: "WORKSPACE" }),
                action: 'Menu:Workspace',
                disabled: this.isScriptRunning,
                children: [
                    {
                        action: 'Workspace:New',
                        title: this.$translate.translate({ key: "MENU.NEW_WORKSPACE" }),
                        icons: [{ icon: common_1.FaIcon.folderPlus }],
                        disabled: global.appGlobal.wizardStep != common_1.WizardStepByView[common_1.View.home],
                    },
                    {
                        action: 'Workspace:Rename',
                        title: this.$translate.translate({ key: "MENU.RENAME_WORKSPACE" }),
                        icons: [{ icon: common_1.FaIcon.edit }],
                        disabled: !ws.isInitialized || global.appGlobal.wizardStep != common_1.WizardStepByView[common_1.View.home],
                    },
                    {
                        action: 'Workspace:Select',
                        title: this.$translate.translate({ key: "MENU.SELECT_WORKSPACE" }),
                        icons: [{ icon: common_1.FaIcon.folderTree }],
                        disabled: db.workspaces.length < 2 || global.appGlobal.wizardStep != common_1.WizardStepByView[common_1.View.home],
                    },
                    {
                        itemType: 'divider'
                    },
                    {
                        action: 'Workspace:OpenFolder',
                        title: this.$translate.translate({ key: "MENU.OPEN_WORKSPACE_FOLDER_IN_EXPLORER" }),
                        icons: [{ icon: common_1.FaIcon.folderOpen }],
                        disabled: !ws.isInitialized
                    },
                    {
                        action: 'Workspace:CleanupWorkspaceFolder',
                        title: this.$translate.translate({ key: "MENU.CLEANUP_WORKSPACE_DIRECTORY" }),
                        icons: [{ icon: common_1.FaIcon.cleanup }],
                        disabled: !ws.isInitialized
                    },
                    {
                        itemType: 'divider'
                    },
                    {
                        action: 'Workspace:Delete',
                        title: this.$translate.translate({ key: "MENU.DELETE_WORKSPACE" }),
                        icons: [{ icon: common_1.FaIcon.trash }],
                        disabled: !ws.isInitialized || global.appGlobal.wizardStep != common_1.WizardStepByView[common_1.View.home],
                    }
                ]
            },
            {
                id: 'connection',
                title: this.$translate.translate({ key: "CONNECTION" }),
                action: 'Menu:Connection',
                disabled: global.appGlobal.wizardStep != common_1.WizardStepByView[common_1.View.connection],
                children: [
                    {
                        action: 'Connection:Refresh',
                        title: this.$translate.translate({ key: "MENU.REFRESH_SFDX_CONNECTIONS" }),
                        icons: [{ icon: common_1.FaIcon.sync }]
                    },
                ]
            },
            {
                id: 'configuration',
                title: this.$translate.translate({ key: "CONFIGURATION" }),
                action: 'Menu:Configuration',
                disabled: global.appGlobal.wizardStep != common_1.WizardStepByView[common_1.View.configuration]
                    && global.appGlobal.wizardStep != common_1.WizardStepByView[common_1.View.preview]
                    && global.appGlobal.wizardStep != common_1.WizardStepByView[common_1.View.run]
                    || this.isScriptRunning,
                children: [
                    {
                        action: 'Configuration:New',
                        title: this.$translate.translate({ key: "MENU.NEW_CONFIGURATION" }),
                        icons: [{ icon: common_1.FaIcon.plus }],
                        disabled: global.appGlobal.wizardStep != common_1.WizardStepByView[common_1.View.configuration]
                    },
                    {
                        action: 'Configuration:Rename',
                        title: this.$translate.translate({ key: "MENU.RENAME_CONFIGURATION" }),
                        icons: [{ icon: common_1.FaIcon.edit }],
                        disabled: !ws.config.isInitialized || global.appGlobal.wizardStep != common_1.WizardStepByView[common_1.View.configuration]
                    },
                    {
                        action: 'Configuration:Clone',
                        title: this.$translate.translate({ key: "MENU.CLONE_CONFIGURATION" }),
                        icons: [{ icon: common_1.FaIcon.copy }],
                        disabled: !ws.config.isInitialized || global.appGlobal.wizardStep != common_1.WizardStepByView[common_1.View.configuration]
                    },
                    {
                        action: 'Configuration:Select',
                        title: this.$translate.translate({ key: "MENU.SELECT_CONFIGURATION" }),
                        icons: [{ icon: common_1.FaIcon.cog }],
                        disabled: ws.configs.length < 2 || global.appGlobal.wizardStep != common_1.WizardStepByView[common_1.View.configuration]
                    },
                    {
                        itemType: 'divider'
                    },
                    {
                        action: 'Configuration:OpenFolder',
                        title: this.$translate.translate({ key: "MENU.OPEN_CONFIGURATION_FOLDER_IN_EXPLORER" }),
                        icons: [{ icon: common_1.FaIcon.folderOpen }],
                        disabled: !ws.config.isInitialized
                    },
                    {
                        itemType: 'divider'
                    },
                    {
                        action: 'Configuration:Import',
                        title: this.$translate.translate({ key: "MENU.IMPORT_FROM_EXPORT_JSON_FILE" }),
                        icons: [{ icon: common_1.FaIcon.fileImport }],
                        disabled: global.appGlobal.wizardStep != common_1.WizardStepByView[common_1.View.configuration]
                    },
                    {
                        action: 'Configuration:Export',
                        title: this.$translate.translate({ key: "MENU.EXPORT_TO_EXPORT_JSON_FILE" }),
                        icons: [{ icon: common_1.FaIcon.fileExport }],
                        disabled: !ws.config.isInitialized
                    },
                    {
                        itemType: 'divider'
                    },
                    {
                        action: 'Configuration:Delete',
                        title: this.$translate.translate({ key: "MENU.DELETE_CONFIGURATION" }),
                        icons: [{ icon: common_1.FaIcon.trash }],
                        disabled: !ws.config.isInitialized || global.appGlobal.wizardStep != common_1.WizardStepByView[common_1.View.configuration]
                    }
                ]
            },
            {
                id: 'help',
                title: this.$translate.translate({ key: "HELP" }),
                action: 'Menu:Help',
                children: [
                    {
                        title: this.$translate.translate({ key: "MENU.SHOW_QUICK_TIPS" }),
                        icons: [{ icon: common_1.FaIcon.lightbulb }],
                        action: "Help:ShowQuickTips"
                    }, {
                        itemType: "divider"
                    },
                    {
                        title: this.$translate.translate({ key: "MENU.VIEW_APP_ON_GITHUB", params: { APP_NAME: global.appGlobal.packageJson.description } }),
                        icons: [{ icon: common_1.FaIcon.github }],
                        action: "Help:ViewAppOnGithub"
                    },
                    {
                        itemType: "divider"
                    },
                    {
                        title: this.$translate.translate({ key: "MENU.KNOWLEDGEBASE", params: { KNOWLEDGE_BASE_TITLE: global.appGlobal.packageJson.appConfig.knowledgebaseTitle } }),
                        icons: [{ icon: common_1.FaIcon.questionCircle }],
                        action: "Help:Knowledgebase"
                    },
                    {
                        title: this.$translate.translate({ key: "MENU.GET_HELP" }),
                        icons: [{ icon: common_1.FaIcon.headset }],
                        action: "Help:GetHelp"
                    },
                    {
                        itemType: "divider"
                    },
                    {
                        action: 'Help:About',
                        title: this.$translate.translate({
                            key: "MENU.ABOUT",
                            params: {
                                PLUGIN_NAME: global.appGlobal.packageJson.appConfig.pluginTitle
                            }
                        }),
                        icons: [{ icon: common_1.FaIcon.infoCircle }]
                    },
                ]
            }
        ];
        // Broadcast main menu source
        this.$broadcast.broadcastAction('setSource', 'uiMenu', {
            eventSource: 'uiMenu',
            args: mainMenuSource,
            componentId: 'mainMenu'
        });
    }
    buildMainToolbar() {
        const db = services_1.DatabaseService.getOrCreateAppDb();
        const ws = services_1.DatabaseService.getWorkspace();
        const notSetMessage = this.$translate.translate({ key: "NOT_SET" });
        const noConnectionMessage = this.$translate.translate({ key: "NO_CONNECTION" });
        const _setToolbarModel = (nextDisabled, previousDisabled, messageKey, params) => {
            this.toolbarModel.nextDisabled = nextDisabled;
            this.toolbarModel.previousDisabled = previousDisabled;
            this.toolbarModel.message = this.$translate.translate({
                key: messageKey,
                params: params
            });
        };
        const _setMainStateAlertBox = (type, messageKey, tooltipKey) => {
            this.setMainStateAlertBox(type, this.$translate.translate({ key: messageKey }), this.$translate.translate({ key: tooltipKey }));
        };
        const _handleHome = () => {
            _setToolbarModel(!ws.isInitialized, true, "SELECTED_WORKSPACE", { WORKSPACE_NAME: ws.name || notSetMessage });
            ws.isInitialized
                ? _setMainStateAlertBox('success', "ALERT.STEP_COMPLETED_MESSAGE", "ALERT.STEP_COMPLETED_TOOLTIP")
                : _setMainStateAlertBox('action-required', "ALERT.STEP_ACTION_REQUIRED_MESSAGE", "ALERT.STEP_CREATE_OR_SELECT_WORKSPACE");
        };
        const _handleConnection = () => {
            _setToolbarModel(!ws.sourceConnection.isInitialized || !ws.targetConnection.isInitialized, false, "CONNECTED_ORGS", {
                SOURCE_ORG_NAME: ws.sourceConnection.userName || noConnectionMessage,
                TARGET_ORG_NAME: ws.targetConnection.userName || noConnectionMessage,
                TOTAL_SFDX_ORGS: Math.max(0, db.orgConnections.length)
            });
            if (!db.connections.length) {
                _setMainStateAlertBox('action-required', "ALERT.STEP_ACTION_REQUIRED_MESSAGE", "ALERT.STEP_SCAN_FOR_SFDX_ORGS");
            }
            else if (!ws.sourceConnection.isInitialized || !ws.targetConnection.isInitialized) {
                _setMainStateAlertBox('action-required', "ALERT.STEP_ACTION_REQUIRED_MESSAGE", "ALERT.STEP_SELECT_SOURCE_AND_TARGET_ORGS");
            }
            else {
                _setMainStateAlertBox('success', "ALERT.STEP_COMPLETED_MESSAGE", "ALERT.STEP_COMPLETED_TOOLTIP");
            }
        };
        const _handleConfiguration = () => {
            const isConfigInitialized = ws.config.isInitialized;
            const objectsLength = ws.config.objectSet.objects.length;
            const objectSetsLength = ws.config.script.objectSets.length;
            const objectSetId = ws.config.objectSetId;
            _setToolbarModel(!isConfigInitialized || !objectSetId || !objectsLength || this.viewErrorsMap.size > 0, false, "SELECTED_CONFIGURATION", {
                CONFIGURATION_NAME: ws.config.name || notSetMessage,
                SOURCE_ORG_NAME: ws.sourceConnection.userName,
                TARGET_ORG_NAME: ws.targetConnection.userName
            });
            if (!isConfigInitialized) {
                _setMainStateAlertBox('action-required', "ALERT.STEP_ACTION_REQUIRED_MESSAGE", "ALERT.STEP_SELECT_CONFIGURATION");
            }
            else if (objectSetsLength === 0) {
                _setMainStateAlertBox('action-required', "ALERT.STEP_ACTION_REQUIRED_MESSAGE", "ALERT.STEP_ADD_OBJECT_SET_TO_CONFIGURATION");
            }
            else if (!objectSetId) {
                _setMainStateAlertBox('action-required', "ALERT.STEP_ACTION_REQUIRED_MESSAGE", "ALERT.STEP_SELECT_OBJECT_SET");
            }
            else if (objectsLength === 0) {
                _setMainStateAlertBox('action-required', "ALERT.STEP_ACTION_REQUIRED_MESSAGE", "ALERT.STEP_ADD_SOBJECTS_TO_OBJECT_SET");
            }
            else if (this.viewErrorsMap.size > 0) {
                _setMainStateAlertBox('warning', "ALERT.STEP_WARNING_MESSAGE", this.$md.render([...this.viewErrorsMap.values()].map(error => '⚠️ ' + error).join('<br />')));
            }
            else {
                _setMainStateAlertBox('success', "ALERT.STEP_COMPLETED_MESSAGE", "ALERT.STEP_COMPLETED_TOOLTIP");
            }
        };
        const _handlePreview = () => {
            _setToolbarModel(this.viewErrorsMap.size > 0, false, "PREVIEW_CONFIGURATION", {
                CONFIGURATION_NAME: ws.config.name,
                SOURCE_ORG_NAME: ws.cli.sourceusername || ws.cli.targetusername,
                TARGET_ORG_NAME: ws.cli.targetusername
            });
            this.viewErrorsMap.size > 0
                ? _setMainStateAlertBox('warning', "ALERT.STEP_WARNING_MESSAGE", this.$md.render([...this.viewErrorsMap.values()].map(error => '⚠️ ' + error).join('<br />')))
                : _setMainStateAlertBox('success', "ALERT.STEP_COMPLETED_MESSAGE", "ALERT.STEP_COMPLETED_TOOLTIP");
        };
        const _handleRun = () => {
            _setToolbarModel(true, this.isScriptRunning, "RUN_CONFIGURATION", {
                CONFIGURATION_NAME: ws.config.name,
                SOURCE_ORG_NAME: ws.cli.sourceusername || ws.cli.targetusername,
                TARGET_ORG_NAME: ws.cli.targetusername
            });
            _setMainStateAlertBox('success', "ALERT.WIZARD_COMPLETED_MESSAGE", "ALERT.WIZARD_COMPLETED_TOOLTIP");
        };
        switch (global.appGlobal.wizardStep) {
            case common_1.WizardStepByView[common_1.View.home]:
                _handleHome();
                break;
            case common_1.WizardStepByView[common_1.View.connection]:
                _handleConnection();
                break;
            case common_1.WizardStepByView[common_1.View.configuration]:
                _handleConfiguration();
                break;
            case common_1.WizardStepByView[common_1.View.preview]:
                _handlePreview();
                break;
            case common_1.WizardStepByView[common_1.View.run]:
                _handleRun();
                break;
        }
    }
    buildFooter() {
        const ws = services_1.DatabaseService.getWorkspace();
        const _setWorkspacePath = () => {
            const path = services_1.DatabaseService.getWorkspaceDisplayPath(global.appGlobal.wizardStep);
            const html = this.$translate.translate({
                key: "WORKSPACE_PATH",
                params: { WORKSPACE_PATH: path }
            });
            angular_1.default.element('#workspacePath').html(html);
        };
        const _setConnectedOrgs = () => {
            if (global.appGlobal.wizardStep >= common_1.WizardStepByView[common_1.View.connection]) {
                const html = this.$translate.translate({
                    key: "CONNECTED_ORGS_FOOTER",
                    params: {
                        SOURCE_ORG_NAME: ws.sourceConnection.userName,
                        TARGET_ORG_NAME: ws.targetConnection.userName,
                    }
                });
                angular_1.default.element('#connectedOrgs').html(html);
            }
            else {
                angular_1.default.element('#connectedOrgs').html('');
            }
        };
        _setWorkspacePath();
        _setConnectedOrgs();
    }
    setViewErrors(errorSource, errors = []) {
        const errorMessages = {
            [common_1.ErrorSource.objectSets]: 'CONFIGURATION_NO_OBJECT_SET_WITH_ACTIVE_SOBJECTS',
            [common_1.ErrorSource.objectFields]: 'CONFIGURATION_SOBJECTS_HAVE_ERRORS_IN_FIELDS',
            [common_1.ErrorSource.objectList]: 'CONFIGURATION_SOBJECTS_HAVE_ERRORS',
            [common_1.ErrorSource.objectSettings]: 'CONFIGURATION_SOBJECTS_HAVE_ERRORS_IN_SETTINGS',
            [common_1.ErrorSource.configurationSettings]: 'CONFIGURATION_HAS_ERRORS_IN_SETTINGS',
            [common_1.ErrorSource.cliSettings]: 'ERRORS_IN_CLI_STRING_SETTINGS'
        };
        const key = errorMessages[errorSource];
        const errorMessage = key && this.$translate.translate({ key });
        errors = errorMessage ? errors.concat(errorMessage) : errors;
        this.viewErrorsMap.set(errorSource, errors);
    }
    clearViewErrors(errorSource) {
        if (errorSource) {
            this.viewErrorsMap.delete(errorSource);
        }
        else {
            this.viewErrorsMap.clear();
        }
    }
    showHiddenQuickTips() {
        utils_1.CommonUtils.getAllLocalStorageItems().forEach((keyValuePair) => {
            const key = keyValuePair.key;
            if (key.startsWith('quickTip')) {
                localStorage.removeItem(key);
            }
        });
    }
    // SFDMU Service Methods ----------------------------------------------------	
    async describeWorkspaceSObjectAsync(objectName) {
        const ws = services_1.DatabaseService.getWorkspace();
        const describeSObject = async (connection) => {
            const sObjectDescribe = connection.orgDescribe.objectsMap.get(objectName) || new models_1.SObjectDescribe();
            if (sObjectDescribe.isInitialized && !sObjectDescribe.isDescribed) {
                const result = await services_1.SfdmuService.describeSObjectAsync(connection, objectName);
                if (result.isError) {
                    sObjectDescribe.fieldsMap.clear();
                    services_1.ToastService.showError(this.$translate.translate({
                        key: 'UNABLE_TO_DESCRIBE_SOBJECT',
                        params: {
                            OBJECT_NAME: objectName,
                            USER_NAME: connection.userName
                        }
                    }));
                    this.$spinner.hideSpinner();
                    throw new Error('Describe SObject Error');
                }
            }
            return sObjectDescribe;
        };
        this.$spinner.showSpinner();
        try {
            const sourceSObjectDescribe = await describeSObject(ws.sourceConnection);
            let targetSObjectDescribe;
            if (ws.sourceConnectionId != ws.targetConnectionId) {
                targetSObjectDescribe = await describeSObject(ws.targetConnection);
            }
            else {
                targetSObjectDescribe = sourceSObjectDescribe;
            }
            services_1.SfdmuService.createSObjectDescribeFromSObjects(this.orgDescribe, sourceSObjectDescribe, targetSObjectDescribe);
            this.$spinner.hideSpinner();
            return true;
        }
        catch (error) {
            this.$spinner.hideSpinner();
            return false;
        }
    }
    /**
     *  Set CLI JSON from CLI command string.
     * @param ws  The workspace to update the CLI JSON in.
     * @param cliString  The CLI command string to generate the JSON from.
     * @returns  The CLI JSON object.
     */
    updateCliCommand(ws, cli) {
        ws.cli = Object.assign({}, ws.cli, cli);
        ws.cli.command = services_1.SfdmuService.generateCLIString(ws.cli);
        services_1.DatabaseService.updateWorkspace(ws);
        services_1.LogService.info(`CLI string updated: ${ws.cli.command}`);
        return ws.cli;
    }
}
exports.AppService = AppService;
//# sourceMappingURL=app.service.js.map