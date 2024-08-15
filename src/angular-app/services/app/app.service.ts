import angular from "angular";
import {
	IBottomToastService,
	IBroadcastService,
	IDialogEditService,
	IDisplayLogService,
	IMarkdownService,
	ISpinnerService,
	ITranslationService
} from "..";
import { CONSTANTS, ErrorSource, FaIcon, ProgressEventType, View, ViewByWizardStep, WizardStepByView } from "../../../common";
import { ConsoleEventType, IActionEventArgParam, IAlert, IDataResult, IMenuItem, IOption, IProgressInfo, IState, IStateChangeEvent, OrgDescribe, SObjectDescribe, Workspace } from "../../../models";
import { DatabaseService, LogService, SfdmuService, ToastService } from "../../../services";
import { CommonUtils } from "../../../utils";


/**
 * Represents the application service interface containing multiple utility services 
 * and methods to build main application components like menus and wizards.
 */
export interface IAppService {

	// ----------------------------------------------------------------------
	// Public Properties ---------------------------------------------------
	// ----------------------------------------------------------------------
	/**
	 * Contains descriptions of all objects from source and target orgs, including 'source' property of each object's description.
	 * Each field of each object also contains all available fields 
	 * from source and target orgs, including 'source' property of each field's description.
	 * This property built only once when source and target orgs are connected.
	 */
	orgDescribe: OrgDescribe;
	/**
	 * Whether the script is currently running.
	 */
	isScriptRunning: boolean;

	// ----------------------------------------------------------------------
	// Service Declarations ------------------------------------------------
	// ----------------------------------------------------------------------
	/** The state service of the application. */
	$state: angular.ui.IStateService;
	/** The root scope of the application. */
	$rootScope: angular.IRootScopeService;
	/** Broadcast service for event communication within the application. */
	$broadcast: IBroadcastService;
	/** Service for executing a function after a delay. */
	$timeout: angular.ITimeoutService;
	/** Service for handling text translations in the application. */
	$translate: ITranslationService;
	/** Service for processing and displaying markdown content. */
	$md: IMarkdownService;
	/** Service for handling edit dialogs in the application. */
	$edit: IDialogEditService;
	/** Service for managing and displaying spinner/loading indicators. */
	$spinner: ISpinnerService;
	/** Service for displaying toast notifications at the bottom of the screen. */
	$bottomToast: IBottomToastService;
	/** Service for displaying log messages in the application. */
	$displayLog: IDisplayLogService;

	// ----------------------------------------------------------------------
	// Builders ------------------------------------------------------------
	// ----------------------------------------------------------------------
	/** Builds all main application components like menus and wizards. */
	builAllApplicationMainComponents(): void;
	/** Builds all view components, like connection view, configuration view, etc 
	 * as well as  object manager toolbar, etc. */
	buildAllApplicationViewComponents(): void;
	/** Builds the main menu of the application.	 */
	buildMainMenu(): void;
	/** Builds the main toolbar of the application.	 */
	buildMainToolbar(): void;
	/** Builds the footer of the application. */
	buildFooter(): void;

	// ----------------------------------------------------------------------
	// Set UI --------------------------------------------------------------
	// ----------------------------------------------------------------------
	/**
	 *  Sets the error messages associated with the current view and the specified error source. 
	 * @param errorSource The error source.
	 * @param errorMessage The error message.
	*/
	setViewErrors(errorSource: ErrorSource, errors?: string[]): void;
	/** Clears the error message associated with the current view and the specified error source. */
	clearViewErrors(errorSource?: ErrorSource): void;
	/** Show all hidden quick tips. */
	showHiddenQuickTips(): void;

	// ----------------------------------------------------------------------
	// Utility Methods -----------------------------------------------------
	// ----------------------------------------------------------------------
	/**
	*  Describe the sobject in the orgs associated with the current workspace.
	* @param objectName  The name of the sobject to describe.
	* @returns  true if the sobject is described successfully, otherwise false.
	*/
	describeWorkspaceSObjectAsync(objectName: string): Promise<boolean>;

	/**
	 *  Updates the cli command data for the given workspace
	 * @param ws The workspace to update
	 * @param cli The  object to update the workspace cli command with
	 */
	updateCliCommand(ws: Workspace, cli: any): void;


}


/**
 * Represents the application service interface containing multiple utility services 
 * and methods to build main application components like menus and wizards.
 */
export class AppService implements IAppService {

	constructor(
		public $state: angular.ui.IStateService,
		public $rootScope: angular.IRootScopeService,
		public $broadcast: IBroadcastService,
		public $timeout: angular.ITimeoutService,
		public $translate: ITranslationService,
		public $md: IMarkdownService,
		public $edit: IDialogEditService,
		public $spinner: ISpinnerService,
		public $bottomToast: IBottomToastService,
		public $displayLog: IDisplayLogService
	) {
		this.setup();
	}


	// ----------------------------------------------------------------------
	// Public Properties ---------------------------------------------------
	// ----------------------------------------------------------------------
	orgDescribe: OrgDescribe = new OrgDescribe();
	isScriptRunning = false;


	// ----------------------------------------------------------------------
	// Builders ------------------------------------------------------------
	// ----------------------------------------------------------------------
	builAllApplicationMainComponents() {
		this.buildMainMenu();
		this._setupMainWizard();

		this.clearViewErrors();
		this.buildMainToolbar();
		this.buildFooter();
	}

	buildAllApplicationViewComponents() {
		this.$broadcast.broadcastAction('buildViewComponents', null, {});
	}

	buildMainMenu() {

		const ws = DatabaseService.getWorkspace();

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const db = DatabaseService.getOrCreateAppDb();
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const config = DatabaseService.getConfig();
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const objectSet = DatabaseService.getObjectSet();
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const sObject = DatabaseService.getSObject();

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
						icons: [{ icon: FaIcon.folderOpen }]
					},
					{
						action: 'File:CleanupApplicationFolder',
						title: this.$translate.translate({ key: "MENU.CLEANUP_APPLICATION_DIRECTORY" }),
						icons: [{ icon: FaIcon.cleanup }]
					},
					{
						itemType: 'divider'
					},
					{
						action: "File:ClearConsoleLog",
						title: this.$translate.translate({ key: "MENU.CLEAR_CONSOLE_LOG" }),
						icons: [{ icon: FaIcon.eraser }]
					},
					{
						action: "File:OpenLogFile",
						title: this.$translate.translate({ key: "MENU.OPEN_LOG_FILE" }),
						icons: [{ icon: FaIcon.file }]
					},
					{
						itemType: 'divider'
					},
					{
						action: "File:Preferences",
						title: this.$translate.translate({ key: "MENU.PREFERENCES" }),
						icons: [{ icon: FaIcon.cog }]
					},
					{
						itemType: 'divider'
					},
					{
						id: 'quiteApp',
						icons: [{ icon: FaIcon.faSignOutAlt, }],
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
						icons: [{ icon: FaIcon.folderPlus }],
						disabled: global.appGlobal.wizardStep != WizardStepByView[View.home],
					},
					{
						action: 'Workspace:Rename',
						title: this.$translate.translate({ key: "MENU.RENAME_WORKSPACE" }),
						icons: [{ icon: FaIcon.edit }],
						disabled: !ws.isInitialized || global.appGlobal.wizardStep != WizardStepByView[View.home],
					},
					{
						action: 'Workspace:Select',
						title: this.$translate.translate({ key: "MENU.SELECT_WORKSPACE" }),
						icons: [{ icon: FaIcon.folderTree }],
						disabled: db.workspaces.length < 2 || global.appGlobal.wizardStep != WizardStepByView[View.home],
					},
					{
						itemType: 'divider'
					},
					{
						action: 'Workspace:OpenFolder',
						title: this.$translate.translate({ key: "MENU.OPEN_WORKSPACE_FOLDER_IN_EXPLORER" }),
						icons: [{ icon: FaIcon.folderOpen }],
						disabled: !ws.isInitialized
					},
					{
						action: 'Workspace:CleanupWorkspaceFolder',
						title: this.$translate.translate({ key: "MENU.CLEANUP_WORKSPACE_DIRECTORY" }),
						icons: [{ icon: FaIcon.cleanup }],
						disabled: !ws.isInitialized
					},
					{
						itemType: 'divider'
					},
					{
						action: 'Workspace:Delete',
						title: this.$translate.translate({ key: "MENU.DELETE_WORKSPACE" }),
						icons: [{ icon: FaIcon.trash }],
						disabled: !ws.isInitialized || global.appGlobal.wizardStep != WizardStepByView[View.home],
					}
				]

			},
			{
				id: 'connection',
				title: this.$translate.translate({ key: "CONNECTION" }),
				action: 'Menu:Connection',
				children: [
					{
						action: 'Connection:Refresh',
						title: this.$translate.translate({ key: "MENU.REFRESH_SFDX_CONNECTIONS" }),
						icons: [{ icon: FaIcon.sync }],
						disabled: global.appGlobal.wizardStep != WizardStepByView[View.connection],
					},
					{
						itemType: 'divider'
					},
					{
						action: 'Connection:NavigateToSourceOrg',
						title: this.$translate.translate({ key: "MENU.NAVIGATE_TO_SOURCE_ORG" }),
						icons: [{ icon: FaIcon.navigateToPage }],
						disabled: global.appGlobal.wizardStep == WizardStepByView[View.home] || global.appGlobal.wizardStep == WizardStepByView[View.connection]
					},
					{
						action: 'Connection:NavigateToTargetOrg',
						title: this.$translate.translate({ key: "MENU.NAVIGATE_TO_TARGET_ORG" }),
						icons: [{ icon: FaIcon.navigateToPage }],
						disabled: global.appGlobal.wizardStep == WizardStepByView[View.home] || global.appGlobal.wizardStep == WizardStepByView[View.connection]
					},
				]
			},
			{
				id: 'configuration',
				title: this.$translate.translate({ key: "CONFIGURATION" }),
				action: 'Menu:Configuration',
				disabled: global.appGlobal.wizardStep != WizardStepByView[View.configuration]
					&& global.appGlobal.wizardStep != WizardStepByView[View.preview]
					&& global.appGlobal.wizardStep != WizardStepByView[View.run]
					|| this.isScriptRunning,
				children: [
					{
						action: 'Configuration:New',
						title: this.$translate.translate({ key: "MENU.NEW_CONFIGURATION" }),
						icons: [{ icon: FaIcon.plus }],
						disabled: global.appGlobal.wizardStep != WizardStepByView[View.configuration]
					},
					{
						action: 'Configuration:Rename',
						title: this.$translate.translate({ key: "MENU.RENAME_CONFIGURATION" }),
						icons: [{ icon: FaIcon.edit }],
						disabled: !ws.config.isInitialized || global.appGlobal.wizardStep != WizardStepByView[View.configuration]
					},
					{
						action: 'Configuration:Clone',
						title: this.$translate.translate({ key: "MENU.CLONE_CONFIGURATION" }),
						icons: [{ icon: FaIcon.copy }],
						disabled: !ws.config.isInitialized || global.appGlobal.wizardStep != WizardStepByView[View.configuration]
					},
					{
						action: 'Configuration:Select',
						title: this.$translate.translate({ key: "MENU.SELECT_CONFIGURATION" }),
						icons: [{ icon: FaIcon.cog }],
						disabled: ws.configs.length < 2 || global.appGlobal.wizardStep != WizardStepByView[View.configuration]
					},
					{
						itemType: 'divider'
					},
					{
						action: 'Configuration:OpenFolder',
						title: this.$translate.translate({ key: "MENU.OPEN_CONFIGURATION_FOLDER_IN_EXPLORER" }),
						icons: [{ icon: FaIcon.folderOpen }],
						disabled: !ws.config.isInitialized
					},
					{
						itemType: 'divider'
					},
					{
						action: 'Configuration:Import',
						title: this.$translate.translate({ key: "MENU.IMPORT_FROM_EXPORT_JSON_FILE" }),
						icons: [{ icon: FaIcon.fileImport }],
						disabled: global.appGlobal.wizardStep != WizardStepByView[View.configuration]
					},
					{
						action: 'Configuration:Export',
						title: this.$translate.translate({ key: "MENU.EXPORT_TO_EXPORT_JSON_FILE" }),
						icons: [{ icon: FaIcon.fileExport }],
						disabled: !ws.config.isInitialized
					},
					{
						itemType: 'divider'
					},
					{
						action: 'Configuration:Delete',
						title: this.$translate.translate({ key: "MENU.DELETE_CONFIGURATION" }),
						icons: [{ icon: FaIcon.trash }],
						disabled: !ws.config.isInitialized || global.appGlobal.wizardStep != WizardStepByView[View.configuration]
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
						icons: [{ icon: FaIcon.lightbulb }],
						action: "Help:ShowQuickTips"
					}, {
						itemType: "divider"
					},
					{
						title: this.$translate.translate({ key: "MENU.VIEW_APP_ON_GITHUB", params: { APP_NAME: global.appGlobal.packageJson.description } }),
						icons: [{ icon: FaIcon.github }],
						action: "Help:ViewAppOnGithub"
					},
					{
						itemType: "divider"
					},
					{
						title: this.$translate.translate({ key: "MENU.KNOWLEDGEBASE", params: { KNOWLEDGE_BASE_TITLE: global.appGlobal.packageJson.appConfig.knowledgebaseTitle } }),
						icons: [{ icon: FaIcon.questionCircle }],
						action: "Help:Knowledgebase"
					},
					{
						title: this.$translate.translate({ key: "MENU.GET_HELP" }),
						icons: [{ icon: FaIcon.headset }],
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
						icons: [{ icon: FaIcon.infoCircle }]
					},

				]
			}
		] as IMenuItem[];

		// Broadcast main menu source
		this.$broadcast.broadcastAction('setSource', 'uiMenu', {
			eventSource: 'uiMenu',
			args: mainMenuSource,
			componentId: 'mainMenu'
		});
	}

	buildMainToolbar() {
		const db = DatabaseService.getOrCreateAppDb();
		const ws = DatabaseService.getWorkspace();

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
			this._setMainStateAlertBox(type,
				this.$translate.translate({ key: messageKey }),
				this.$translate.translate({ key: tooltipKey })
			);
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
			} else if (!ws.sourceConnection.isInitialized || !ws.targetConnection.isInitialized) {
				_setMainStateAlertBox('action-required', "ALERT.STEP_ACTION_REQUIRED_MESSAGE", "ALERT.STEP_SELECT_SOURCE_AND_TARGET_ORGS");
			} else {
				_setMainStateAlertBox('success', "ALERT.STEP_COMPLETED_MESSAGE", "ALERT.STEP_COMPLETED_TOOLTIP");
			}
		};

		const _handleConfiguration = () => {
			const isConfigInitialized = ws.config.isInitialized;
			const objectsLength = ws.config.objectSet.objects.length;
			const objectSetsLength = ws.config.script.objectSets.length;
			const objectSetId = ws.config.objectSetId;
			_setToolbarModel(!isConfigInitialized || !objectSetId || !objectsLength || this.viewErrorsMap.size > 0, false,
				"SELECTED_CONFIGURATION", {
				CONFIGURATION_NAME: ws.config.name || notSetMessage,
				SOURCE_ORG_NAME: ws.sourceConnection.userName,
				TARGET_ORG_NAME: ws.targetConnection.userName
			});

			if (!isConfigInitialized) {
				_setMainStateAlertBox('action-required', "ALERT.STEP_ACTION_REQUIRED_MESSAGE", "ALERT.STEP_SELECT_CONFIGURATION");
			} else if (objectSetsLength === 0) {
				_setMainStateAlertBox('action-required', "ALERT.STEP_ACTION_REQUIRED_MESSAGE", "ALERT.STEP_ADD_OBJECT_SET_TO_CONFIGURATION");
			} else if (!objectSetId) {
				_setMainStateAlertBox('action-required', "ALERT.STEP_ACTION_REQUIRED_MESSAGE", "ALERT.STEP_SELECT_OBJECT_SET");
			} else if (objectsLength === 0) {
				_setMainStateAlertBox('action-required', "ALERT.STEP_ACTION_REQUIRED_MESSAGE", "ALERT.STEP_ADD_SOBJECTS_TO_OBJECT_SET");
			} else if (this.viewErrorsMap.size > 0) {
				_setMainStateAlertBox('warning', "ALERT.STEP_WARNING_MESSAGE", this.$md.render([...this.viewErrorsMap.values()].map(error => '⚠️ ' + error).join('<br />')));
			} else {
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
			case WizardStepByView[View.home]:
				_handleHome();
				break;
			case WizardStepByView[View.connection]:
				_handleConnection();
				break;
			case WizardStepByView[View.configuration]:
				_handleConfiguration();
				break;
			case WizardStepByView[View.preview]:
				_handlePreview();
				break;
			case WizardStepByView[View.run]:
				_handleRun();
				break;
		}
	}

	buildFooter() {
		const ws = DatabaseService.getWorkspace();

		const _setWorkspacePath = () => {
			const path = DatabaseService.getWorkspaceDisplayPath(global.appGlobal.wizardStep);
			const html = this.$translate.translate({
				key: "WORKSPACE_PATH",
				params: { WORKSPACE_PATH: path }
			});
			angular.element('#workspacePath').html(html);
		};

		const _setConnectedOrgs = () => {
			if (global.appGlobal.wizardStep >= WizardStepByView[View.connection]) {
				const html = this.$translate.translate({
					key: "CONNECTED_ORGS_FOOTER",
					params: {
						SOURCE_ORG_NAME: ws.sourceConnection.userName,
						TARGET_ORG_NAME: ws.targetConnection.userName,
					}
				});
				angular.element('#connectedOrgs').html(html);
			} else {
				angular.element('#connectedOrgs').html('');
			}
		};

		_setWorkspacePath();
		_setConnectedOrgs();
	}


	// ----------------------------------------------------------------------
	// Set UI --------------------------------------------------------------
	// ----------------------------------------------------------------------
	setViewErrors(errorSource: ErrorSource, errors: string[] = []) {

		const errorMessages: Record<ErrorSource, string> = {
			[ErrorSource.objectSets]: 'CONFIGURATION_NO_OBJECT_SET_WITH_ACTIVE_SOBJECTS',
			[ErrorSource.objectFields]: 'CONFIGURATION_SOBJECTS_HAVE_ERRORS_IN_FIELDS',
			[ErrorSource.objectList]: 'CONFIGURATION_SOBJECTS_HAVE_ERRORS',
			[ErrorSource.objectSettings]: 'CONFIGURATION_SOBJECTS_HAVE_ERRORS_IN_SETTINGS',
			[ErrorSource.configurationSettings]: 'CONFIGURATION_HAS_ERRORS_IN_SETTINGS',
			[ErrorSource.cliSettings]: 'ERRORS_IN_CLI_STRING_SETTINGS'
		};

		const key = errorMessages[errorSource];
		const errorMessage = key && this.$translate.translate({ key });
		errors = errorMessage ? errors.concat(errorMessage) : errors;

		this.viewErrorsMap.set(errorSource, errors);
	}

	clearViewErrors(errorSource?: ErrorSource) {
		if (errorSource) {
			this.viewErrorsMap.delete(errorSource);
		} else {
			this.viewErrorsMap.clear();
		}
	}

	showHiddenQuickTips(): void {
		CommonUtils.getAllLocalStorageItems().forEach((keyValuePair) => {
			const key = keyValuePair.key;
			if (key.startsWith('quickTip')) {
				localStorage.removeItem(key);
			}
		});

	}


	// ----------------------------------------------------------------------
	// Utility Methods -----------------------------------------------------
	// ----------------------------------------------------------------------
	async describeWorkspaceSObjectAsync(objectName: string): Promise<boolean> {
		const ws = DatabaseService.getWorkspace();

		const describeSObject = async (connection: any) => {
			const sObjectDescribe = connection.orgDescribe.objectsMap.get(objectName) || new SObjectDescribe();
			if (sObjectDescribe.isInitialized && !sObjectDescribe.isDescribed) {
				const result = await SfdmuService.describeSObjectAsync(connection, objectName);
				if (result.isError) {
					sObjectDescribe.fieldsMap.clear();
					ToastService.showError(this.$translate.translate({
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
			} else {
				targetSObjectDescribe = sourceSObjectDescribe;
			}

			SfdmuService.createSObjectDescribeFromSObjects(this.orgDescribe, sourceSObjectDescribe, targetSObjectDescribe);
			this.$spinner.hideSpinner();
			return true;
		} catch (error) {
			this.$spinner.hideSpinner();
			return false;
		}
	}

	updateCliCommand(ws: Workspace, cli: any) {
		ws.cli = Object.assign({}, ws.cli, cli);
		ws.cli.command = SfdmuService.generateCLIString(ws.cli);
		DatabaseService.updateWorkspace(ws);
		LogService.info(`CLI string updated: ${ws.cli.command}`);
		return ws.cli;
	}




	// --------------------------------------------------------------------------
	// Private Properties ----------------------------------------------------------	
	// --------------------------------------------------------------------------
	/**
	 * The model of the main toolbar of the application.
	 */
	toolbarModel = {
		nextDisabled: true,
		previousDisabled: true,
		message: '',
	};
	viewErrorsMap: Map<ErrorSource, string[]> = new Map();


	// --------------------------------------------------------------------------
	// Private Methods ----------------------------------------------------------	
	// --------------------------------------------------------------------------
	/**
	 * Setup the application service.
	 */
	private setup() {

		// Initialize root scope variables
		this._setupRootScopeVars();

		// Initialize navigation events
		this._setupNavigationEvents();

		// Iniaialize state change
		this._setupNavigationStateChange();

		// Initialize language change
		this._setupLanguageChange();

		// Initialize UI notification events
		this._setupUiNotificationEvent();

		// Initialize UI components
		this.$timeout(() => {

			// Build main application components
			this.builAllApplicationMainComponents();

			// Initialize side log display
			this._setupSideLogDisplay();

			// Initialize bottom toast display
			this.setupBottomToast();

			// Initialize spinner application exit event when long running process is running
			this._setupSpinnerExitEvent();

		}, 500);

	}

	private _setupSpinnerExitEvent() {
		this.$broadcast.onAction('onExit', 'SpinnerService', () => {
			global.appGlobal.mainWindow.close();
		});
	}

	private setupBottomToast() {
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

	private _setupSideLogDisplay() {
		this.$displayLog.initialize('#browser-logs', CONSTANTS.DISPLAY_LOG_DIV_HEIGHT);
		global.appGlobal.browserConsoleLogService.on(ConsoleEventType.log, (message) => {
			this.$displayLog.addRow(message, 'log');
		});
		global.appGlobal.browserConsoleLogService.on(ConsoleEventType.warn, (message) => {
			this.$displayLog.addRow(message, 'warn');
		});
		global.appGlobal.browserConsoleLogService.on(ConsoleEventType.error, (message) => {
			this.$displayLog.addRow(message, 'error');
		});
		global.appGlobal.browserConsoleLogService.on(ConsoleEventType.clear, () => {
			this.$displayLog.clear();
		});
	}

	private _setupUiNotificationEvent() {
		this.$broadcast.onAction(ProgressEventType.ui_notification, null, (args: IActionEventArgParam<IProgressInfo>) => {
			const info = args.args[0];
			if (info.messageOrKey && this.$spinner.isSpinnerVisible()) {
				info.messageOrKey = this.$translate.translate({ key: info.messageOrKey });
				this.$spinner.showSpinner(info.messageOrKey);
			}
		});
	}

	private _setupLanguageChange() {
		this.$broadcast.onAction('onChange', 'uiLangSwitcher', this._reloadApp.bind(this));
	}

	private _setupNavigationStateChange() {
		const self = this;

		this.$rootScope.$on('$stateChangeStart', async (event: IStateChangeEvent, toState: IState) => {
			if (!toState.name) {
				return;
			}

			if ([View.connection, View.configuration, View.preview].includes(View[toState.name])) {
				if (global.appGlobal.isOffline) {
					ToastService.showError(this.$translate.translate({ key: "THIS_ACTION_REQUIRED_ACTIVE_INTERNET_CONNECTION" }));
					_preventStateTransition(event);
					return;
				}
			}

			const ws = DatabaseService.getWorkspace();
			const config = DatabaseService.getConfig();

			// Navigation from  connection to configuration
			if (toState.name == View.configuration && global.appGlobal.wizardStep == WizardStepByView[View.connection]) {
				this.$spinner.showSpinner();
				this.orgDescribe = new OrgDescribe();

				const sourceOrgDescribeResult = await SfdmuService.connectToOrgAsync(ws.sourceConnection);
				if (sourceOrgDescribeResult.isError) {
					_handleConnectionFailed(sourceOrgDescribeResult);
					return;
				}

				if (ws.targetConnectionId != ws.sourceConnectionId) {
					const targetOrgDescribeResult = await SfdmuService.connectToOrgAsync(ws.targetConnection);
					if (targetOrgDescribeResult.isError) {
						_handleConnectionFailed(targetOrgDescribeResult);
						return;
					}
				} else {
					ws.targetConnection.orgDescribe = ws.sourceConnection.orgDescribe;
				}

				this.orgDescribe = SfdmuService.createOrgDescribeFromConnections(ws.sourceConnection, ws.targetConnection);
			}

			// Navigation from configuration to preview
			if (toState.name == View.preview && global.appGlobal.wizardStep == WizardStepByView[View.configuration]) {

				const cliSourceConnection = ws.db.connections.find(connection => connection.userName == ws.cli.sourceusername);
				const cliTargetConnection = ws.db.connections.find(connection => connection.userName == ws.cli.targetusername);

				this.updateCliCommand(ws, {
					sourceusername: !cliSourceConnection ? ws.sourceConnection.userName : ws.cli.sourceusername,
					targetusername: !cliTargetConnection ? ws.targetConnection.userName : ws.cli.targetusername,
					path: DatabaseService.getConfigPath(config)
				});
				DatabaseService.exportConfig(ws.id, null, true);
			}

			const wizardStepIndex = WizardStepByView[View[toState.name]];
			global.appGlobal.wizardStep = wizardStepIndex;

			this.$broadcast.broadcastAction('setCurrentStep', 'uiWizardStep', {
				args: [wizardStepIndex],
				componentId: 'mainWizard'
			});

			this.buildAllApplicationViewComponents();
			this.builAllApplicationMainComponents();

			this.$spinner.hideSpinner();
			LogService.info(`State change to: ${toState.name}`);

			function _handleConnectionFailed(orgDescribeResult: Partial<IDataResult<OrgDescribe>>) {
				self.$spinner.hideSpinner();
				LogService.warn(`Connection attempt failed: ${orgDescribeResult.errorMessage}`);
				ToastService.showError(orgDescribeResult.errorMessage);
				_preventStateTransition(event);
			}
			function _preventStateTransition(event: IStateChangeEvent) {
				event.preventDefault();
				const thisView = ViewByWizardStep[global.appGlobal.wizardStep];
				self.$state.go(thisView, null, { notify: false });
			}
		});
	}

	private _setupRootScopeVars() {
		this.$rootScope["global"] = global.appGlobal;
		this.$rootScope["github"] = global.appGlobal.githubRepoInfo;
		this.$rootScope["package"] = global.appGlobal.packageJson;
		this.$rootScope["config"] = global.appGlobal.packageJson.appConfig;
		this.$rootScope["toolbar"] = this.toolbarModel;
	}

	private _setupNavigationEvents() {
		this.$rootScope["goNextStep"] = () => {
			const nextView: View = ViewByWizardStep[global.appGlobal.wizardStep + 1];
			this.$state.go(nextView, null, {
				reload: true
			});
		};

		this.$rootScope["goPreviousStep"] = () => {
			const previousView: View = ViewByWizardStep[global.appGlobal.wizardStep - 1];
			this.$state.go(previousView, {
				reload: true
			});
		};
	}

	private _setupMainWizard() {

		// Build main wizard source
		const mainWizardSource = [
			{ value: 'workspace', label: this.$translate.translate({ key: "WORKSPACE" }) },
			{ value: 'connection', label: this.$translate.translate({ key: "CONNECTION" }) },
			{ value: 'configuration', label: this.$translate.translate({ key: "CONFIGURATION" }) },
			{ value: 'review', label: this.$translate.translate({ key: "REVIEW" }) },
			{ value: 'run', label: this.$translate.translate({ key: "RUN" }) },
		] as IOption[];

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
	private _setMainStateAlertBox(type: 'action-required' | 'warning' | 'success', message: string, description: string) {

		const alertData: IAlert = {
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

	private _reloadApp() {
		this.$state.go(View.home);
		this.$timeout(() => {
			window.location.reload();
		}, 100);
	}

}