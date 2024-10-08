"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviewController = void 0;
const common_1 = require("../../common");
const services_1 = require("../../services");
const utils_1 = require("../../utils");
class PreviewController {
    constructor($app, $scope) {
        this.$app = $app;
        this.$scope = $scope;
        this.sfdmuCommandJson = {};
        this.sfdmuCommandTitles = [];
        this.scriptPreview = '';
        this.FaIcon = common_1.FaIcon;
    }
    get cliCommand() {
        var _a;
        const ws = services_1.DatabaseService.getWorkspace();
        return ((_a = ws.cli) === null || _a === void 0 ? void 0 : _a.command) || '';
    }
    $onInit() {
        services_1.LogService.info('Initializing PreviewController...');
        this.setup();
        this.$app.$broadcast.onAction('buildViewComponents', null, () => {
            this.setup();
        }, this.$scope);
    }
    /**
     * Setup the component.
     */
    setup() {
        if (global.appGlobal.wizardStep == PreviewController.wizardStep) {
            const ws = services_1.DatabaseService.getWorkspace();
            const db = services_1.DatabaseService.getOrCreateAppDb();
            this.scriptPreview || (this.scriptPreview = services_1.DatabaseService.readExportJsonFile(ws.id));
            const selectedTargetConnection = db.connections.find(c => c.userName === ws.cli.targetusername);
            const targetConnectionOptions = db.connections.map(c => {
                return {
                    value: c.userName,
                    label: c.userName
                };
            });
            const sourceConnectionOptions = db.connections.map(c => {
                return {
                    value: c.userName,
                    label: c.userName
                };
            });
            this.sfdmuCommandSetup = {
                // AUTHENTICATION
                // row 1
                sourceusername: {
                    type: 'select',
                    label: '--sourceusername, -s',
                    options: sourceConnectionOptions,
                    required: false,
                    widthOf12: 6,
                    helpSearchWord: 'SOURCE_USERNAME',
                    addHelpLinks: true
                },
                targetusername: {
                    type: 'select',
                    label: '--targetusername, -t',
                    options: targetConnectionOptions,
                    required: true,
                    widthOf12: 6,
                    helpSearchWord: 'TARGET_USERNAME',
                    addHelpLinks: true
                },
                // FILE AND PATH_SETTINGS
                // row 2
                path: {
                    type: 'input',
                    label: '--path, -p',
                    disabled: true,
                    required: false,
                    widthOf12: 12,
                    helpSearchWord: 'PATH_PARAMETER',
                    addHelpLinks: true
                },
                // LOGGING_SETTINGS
                // row 3
                quiet: {
                    type: 'toggle',
                    label: '--quiet',
                    widthOf12: 3,
                    disabled: ws.cli.silent || ws.cli.concise || ws.cli.verbose,
                    helpSearchWord: 'QUIET',
                    addHelpLinks: true
                },
                silent: {
                    type: 'toggle',
                    label: '--silent',
                    widthOf12: 3,
                    disabled: ws.cli.quiet || ws.cli.concise || ws.cli.verbose,
                    helpSearchWord: 'SILENT',
                    addHelpLinks: true
                },
                concise: {
                    type: 'toggle',
                    label: '--concise',
                    widthOf12: 3,
                    disabled: ws.cli.quiet || ws.cli.silent || ws.cli.verbose,
                    helpSearchWord: 'CONCISE',
                    addHelpLinks: true
                },
                verbose: {
                    type: 'toggle',
                    label: '--verbose',
                    widthOf12: 3,
                    disabled: ws.cli.quiet || ws.cli.silent || ws.cli.concise,
                    helpSearchWord: 'VERBOSE',
                    addHelpLinks: true
                },
                // row 4
                filelog: {
                    type: 'select',
                    label: '--filelog, -l',
                    options: [
                        { value: '0', label: 'Off' },
                        { value: '1', label: 'On' }
                    ],
                    widthOf12: 3,
                    helpSearchWord: 'FILE_LOG',
                    addHelpLinks: true
                },
                loglevel: {
                    type: 'select',
                    label: '--loglevel',
                    options: [
                        { value: 'TRACE', label: 'TRACE' },
                        { value: 'DEBUG', label: 'DEBUG' },
                        { value: 'WARN', label: 'WARN' },
                        { value: 'ERROR', label: 'ERROR' },
                        { value: 'FATAL', label: 'FATAL' }
                    ],
                    widthOf12: 3,
                    helpSearchWord: "LOG_LEVEL",
                    addHelpLinks: true
                },
                logfullquery: {
                    type: 'toggle',
                    label: '--logfullquery',
                    widthOf12: 6,
                    helpSearchWord: 'LOG_FULL_QUERY',
                    addHelpLinks: true
                },
                // OTHER_SETTINGS
                // row 5
                json: {
                    type: 'toggle',
                    label: '--json',
                    widthOf12: 3,
                    helpSearchWord: 'JSON_FORMAT',
                    addHelpLinks: true
                },
                noprompt: {
                    type: 'toggle',
                    label: '--noprompt, -n',
                    widthOf12: 3,
                    helpSearchWord: 'NO_PROMPT',
                    addHelpLinks: true
                },
                nowarnings: {
                    type: 'toggle',
                    label: '--nowarnings, -w',
                    widthOf12: 3,
                    helpSearchWord: 'NO_WARNINGS',
                    addHelpLinks: true
                },
                canmodify: {
                    type: 'toggle',
                    label: '--canmodify, -c',
                    required: false,
                    disabled: (selectedTargetConnection === null || selectedTargetConnection === void 0 ? void 0 : selectedTargetConnection.type) != common_1.ConnectionType.Org,
                    widthOf12: 3,
                    helpSearchWord: 'CAN_MODIFY',
                    addHelpLinks: true
                },
                // row 6
                apiversion: {
                    type: 'input',
                    label: '--apiversion',
                    required: false,
                    widthOf12: 3,
                    helpSearchWord: 'CLI_API_VERSION',
                    addHelpLinks: true
                },
                usesf: {
                    type: 'select',
                    label: '--usesf',
                    widthOf12: 3,
                    helpSearchWord: 'USE_SF',
                    addHelpLinks: true,
                    options: [
                        { value: 'true', label: 'true' },
                        { value: 'false', label: 'false' }
                    ],
                }
            };
            this.sfdmuCommandJson = { ...ws.cli };
            this.sfdmuCommandTitles = [
                // AUTHENTICATION_SETTINGS
                this.$app.$translate.translate({ key: 'AUTHENTICATION_SETTINGS' }),
                // FILE_AND_PATH_SETTINGS
                this.$app.$translate.translate({ key: 'FILE_AND_PATH_SETTINGS' }),
                // LOGGING_SETTINGS
                this.$app.$translate.translate({ key: 'LOGGING_SETTINGS' }),
                '',
                // OTHER_SETTINGS
                this.$app.$translate.translate({ key: 'OTHER_SETTINGS' }),
                '',
            ];
        }
    }
    handleSfdmuCommandFormChange(args) {
        this._validate(args.args[0]);
    }
    async handleCopyCliCommandToClipboard() {
        const ws = services_1.DatabaseService.getWorkspace();
        if (await utils_1.AngularUtils.copyTextToClipboardAsync(ws.cli.command)) {
            services_1.LogService.info(`CLI string copied to clipboard: ${ws.cli.command}`);
            services_1.ToastService.showSuccess(this.$app.$translate.translate({ key: 'COPIED' }));
        }
        else {
            services_1.LogService.warn(`Failed to copy CLI string to clipboard: ${ws.cli.command}`);
            services_1.ToastService.showError(this.$app.$translate.translate({ key: 'COPIED_ERROR' }));
        }
    }
    async handleCopyScriptPreviewToClipboard() {
        if (await utils_1.AngularUtils.copyTextToClipboardAsync(this.scriptPreview)) {
            services_1.LogService.info(`Script preview copied to clipboard`);
            services_1.ToastService.showSuccess(this.$app.$translate.translate({ key: 'COPIED' }));
        }
        else {
            services_1.LogService.warn(`Failed to copy script preview to clipboard`);
            services_1.ToastService.showError(this.$app.$translate.translate({ key: 'COPIED_ERROR' }));
        }
    }
    /** Private/Helper Members --------------------------------------------------------------------------------------------- */
    _validateCliCommandForm() {
        const scriptSettingsFormController = utils_1.AngularUtils.$getController(`#sfdmuCommandSetupForm`);
        return scriptSettingsFormController && scriptSettingsFormController.validate();
    }
    _validateCliCommand(cliCommand) {
        const errors = [];
        if (cliCommand.sourceusername == cliCommand.targetusername
            && cliCommand.targetusername == common_1.CONSTANTS.SFDMU.CSV_FILE_OPTION_NAME) {
            errors.push(this.$app.$translate.translate({ key: 'SELECT_DIFFERENT_DATA_SOURCE_AND_TARGET' }));
        }
        return errors;
    }
    _validate(cliCommand) {
        const ws = services_1.DatabaseService.getWorkspace();
        const isValidForm = this._validateCliCommandForm();
        const cliCommandErrors = this._validateCliCommand(cliCommand);
        if (isValidForm && !cliCommandErrors.length) {
            this.$app.updateCliCommand(ws, cliCommand);
            this.setup();
            this.$app.clearViewErrors();
        }
        else {
            this.$app.setViewErrors(!isValidForm && common_1.ErrorSource.cliSettings, cliCommandErrors);
        }
        this.$app.buildMainToolbar();
    }
}
exports.PreviewController = PreviewController;
PreviewController.$inject = ["$app", "$scope"];
PreviewController.wizardStep = common_1.WizardStepByView[common_1.View.preview];
//# sourceMappingURL=preview.controller.js.map