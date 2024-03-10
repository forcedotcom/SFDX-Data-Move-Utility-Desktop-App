import { CONSTANTS, ConnectionType, ErrorSource, FaIcon, SetupFormOptions, View, WizardStepByView } from "../../common";
import { IActionEventArgParam, IFormController } from "../../models";
import { DatabaseService, LogService, ToastService } from "../../services";
import { AngularUtils } from "../../utils";
import { IAppService } from "../services";

export class PreviewController {

    static $inject = ["$app", "$scope"];

    static wizardStep = WizardStepByView[View.preview];

    sfdmuCommandSetup: SetupFormOptions;
    sfdmuCommandJson: any = {};
    sfdmuCommandTitles: string[] = [];
    scriptPreview = '';

    FaIcon = FaIcon;


    constructor(private $app: IAppService, private $scope: angular.IScope) { }

    get cliCommand() {
        const ws = DatabaseService.getWorkspace();
        return ws.cli?.command || '';
    }

    $onInit() {

        LogService.info('Initializing PreviewController...');

        this.setup();

        this.$app.$broadcast.onAction('buildViewComponents', null, () => {
            this.setup();
        }, this.$scope);

    }

    /**
     * Setup the component.
     */
    private setup() {

        if (global.appGlobal.wizardStep == PreviewController.wizardStep) {

            const ws = DatabaseService.getWorkspace();
            const db = DatabaseService.getOrCreateAppDb();

            this.scriptPreview ||= DatabaseService.readExportJsonFile(ws.id);

            const selectedTargetConnection = db.connections.find(c => c.userName === ws.cli.targetusername);

            const targetConnectionOptions = db.connections.map(c => {
                return {
                    value: c.userName,
                    label: c.userName
                }
            });

            const sourceConnectionOptions = db.connections.map(c => {
                return {
                    value: c.userName,
                    label: c.userName
                }
            });


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
                canmodify: { type: 'toggle', label: 'canmodify', required: false, disabled: selectedTargetConnection?.type != ConnectionType.Org, widthOf12: 3 },
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

    handleSfdmuCommandFormChange(args: IActionEventArgParam<any>) {
        this._validate(args.args[0]);
    }

    async handleCopyCliCommandToClipboard() {
        const ws = DatabaseService.getWorkspace();
        if (await AngularUtils.copyTextToClipboardAsync(ws.cli.command)) {
            LogService.info(`CLI string copied to clipboard: ${ws.cli.command}`);
            ToastService.showSuccess(this.$app.$translate.translate({ key: 'COPIED' }));
        } else {
            LogService.warn(`Failed to copy CLI string to clipboard: ${ws.cli.command}`);
            ToastService.showError(this.$app.$translate.translate({ key: 'COPIED_ERROR' }));
        }
    }

    async handleCopyScriptPreviewToClipboard() {
        if (await AngularUtils.copyTextToClipboardAsync(this.scriptPreview)) {
            LogService.info(`Script preview copied to clipboard`);
            ToastService.showSuccess(this.$app.$translate.translate({ key: 'COPIED' }));
        } else {
            LogService.warn(`Failed to copy script preview to clipboard`);
            ToastService.showError(this.$app.$translate.translate({ key: 'COPIED_ERROR' }));
        }
    }

    /** Private/Helper Members --------------------------------------------------------------------------------------------- */
    private _validateCliCommandForm() {
        const scriptSettingsFormController = AngularUtils.$getController<IFormController>(`#sfdmuCommandSetupForm`);
        return scriptSettingsFormController && scriptSettingsFormController.validate();
    }

    private _validateCliCommand(cliCommand: any): string[] {
        const errors: string[] = [];
        if (cliCommand.sourceusername == cliCommand.targetusername
            && cliCommand.targetusername == CONSTANTS.SFDMU.CSV_FILE_OPTION_NAME) {
            errors.push(this.$app.$translate.translate({ key: 'SELECT_DIFFERENT_DATA_SOURCE_AND_TARGET' }));
        }
        return errors;
    }

    private _validate(cliCommand: any) {
        const ws = DatabaseService.getWorkspace();
        const isValidForm = this._validateCliCommandForm();
        const cliCommandErrors = this._validateCliCommand(cliCommand);
        if (isValidForm && !cliCommandErrors.length) {
            this.$app.updateCliCommand(ws, cliCommand);
            this.setup();
            this.$app.clearViewErrors();
        } else {
            this.$app.setViewErrors(!isValidForm && ErrorSource.cliSettings, cliCommandErrors);
        }
        this.$app.buildMainToolbar();
    }


}