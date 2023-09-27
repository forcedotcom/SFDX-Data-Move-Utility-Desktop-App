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
            const selectedSourceConnection = db.connections.find(c => c.userName === ws.cli.sourceusername);
            const selectedTargetConnection = db.connections.find(c => c.userName === ws.cli.targetusername);
            let targetConnectionOptions = [];
            let sourceConnectionOptions = [];
            if ((selectedSourceConnection === null || selectedSourceConnection === void 0 ? void 0 : selectedSourceConnection.type) === common_1.ConnectionType.File) {
                targetConnectionOptions = db.connections.filter(c => c.type === common_1.ConnectionType.Org)
                    .map(c => {
                    return {
                        value: c.userName,
                        label: c.userName
                    };
                });
            }
            else {
                targetConnectionOptions = db.connections.map(c => {
                    return {
                        value: c.userName,
                        label: c.userName
                    };
                });
            }
            if ((selectedTargetConnection === null || selectedTargetConnection === void 0 ? void 0 : selectedTargetConnection.type) === common_1.ConnectionType.File) {
                sourceConnectionOptions = db.connections.filter(c => c.type === common_1.ConnectionType.Org)
                    .map(c => {
                    return {
                        value: c.userName,
                        label: c.userName
                    };
                });
            }
            else {
                sourceConnectionOptions = db.connections.map(c => {
                    return {
                        value: c.userName,
                        label: c.userName
                    };
                });
            }
            this.sfdmuCommandSetup = {
                // AUTHENTICATION
                // row 1
                sourceusername: { type: 'select', label: 'sourceusername', options: sourceConnectionOptions, required: false, widthOf12: 6 },
                targetusername: { type: 'select', label: 'targetusername', options: targetConnectionOptions, required: true, widthOf12: 6 },
                // FILE AND PATH_SETTINGS
                // row 2
                path: { type: 'input', label: 'path', disabled: true, required: false, widthOf12: 12 },
                // LOGGING_SETTINGS
                // row 3
                quiet: { type: 'toggle', label: 'quiet', widthOf12: 3, disabled: ws.cli.silent || ws.cli.concise || ws.cli.verbose },
                silent: { type: 'toggle', label: 'silent', widthOf12: 3, disabled: ws.cli.quiet || ws.cli.concise || ws.cli.verbose },
                concise: { type: 'toggle', label: 'concise', widthOf12: 3, disabled: ws.cli.quiet || ws.cli.silent || ws.cli.verbose },
                verbose: { type: 'toggle', label: 'verbose', widthOf12: 3, disabled: ws.cli.quiet || ws.cli.silent || ws.cli.concise },
                // row 4
                filelog: { type: 'select', label: 'filelog', options: [{ value: '0', label: 'Off' }, { value: '1', label: 'On' }], widthOf12: 4 },
                loglevel: { type: 'select', label: 'loglevel', options: [{ value: 'TRACE', label: 'TRACE' }, { value: 'DEBUG', label: 'DEBUG' }, { value: 'WARN', label: 'WARN' }, { value: 'ERROR', label: 'ERROR' }, { value: 'FATAL', label: 'FATAL' }], widthOf12: 4 },
                logfullquery: { type: 'toggle', label: 'logfullquery', widthOf12: 4 },
                // OTHER_SETTINGS
                // row 5
                json: { type: 'toggle', label: 'json', widthOf12: 3 },
                noprompt: { type: 'toggle', label: 'noprompt', widthOf12: 3 },
                nowarnings: { type: 'toggle', label: 'nowarnings', widthOf12: 3 },
                // row 6
                canmodify: { type: 'toggle', label: 'canmodify', required: false, disabled: (selectedTargetConnection === null || selectedTargetConnection === void 0 ? void 0 : selectedTargetConnection.type) != common_1.ConnectionType.Org, widthOf12: 3 },
                apiversion: { type: 'input', label: 'apiversion', required: false, widthOf12: 3 },
                usesf: { type: 'toggle', label: 'usesf', widthOf12: 6 }
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
        const ws = services_1.DatabaseService.getWorkspace();
        if (this.validateSfdmuCommandForm()) {
            this.$app.updateCliCommand(ws, args.args[0]);
            this.setup();
            this.$app.clearViewErrors();
        }
        else {
            this.$app.setViewErrors(common_1.ErrorSource.cliSettings);
        }
        this.$app.buildMainToolbar();
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
    validateSfdmuCommandForm() {
        const scriptSettingsFormController = utils_1.AngularUtils.$getController(`#scriptSettingsForm`);
        return scriptSettingsFormController && scriptSettingsFormController.validate();
    }
}
exports.PreviewController = PreviewController;
PreviewController.$inject = ["$app", "$scope"];
PreviewController.wizardStep = common_1.WizardStepByView[common_1.View.preview];
//# sourceMappingURL=preview.controller.js.map