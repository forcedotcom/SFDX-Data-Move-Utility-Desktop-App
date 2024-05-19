import { AngularUtils } from "../../utils";
import { View, WizardStepByView } from "../../common";
import { DetachedConsoleService, DatabaseService, LogService } from "../../services";
import { IAppService } from "../services";

export class RunController {

    static $inject = ["$app", "$scope"];

    static wizardStep = WizardStepByView[View.run];
    executor: DetachedConsoleService;
    hasScriptError = false;

    get isScriptRunning() {
        return this.$app.isScriptRunning;
    }

    get cliCommand() {
        const ws = DatabaseService.getWorkspace();
        return ws.cli?.command || '';
    }


    constructor(private $app: IAppService, private $scope: angular.IScope) { }

    $onInit() {

        LogService.info('Initializing RunController...');

        this.setup();

        this.$app.$broadcast.onAction('buildViewComponents', null, () => {
            this.setup();
        }, this.$scope);

    }

    /**
     * Setup the component.
     */
    private setup() {
        if (global.appGlobal.wizardStep == RunController.wizardStep) {
        }
    }

    async handleRunScript() {
        const ws = DatabaseService.getWorkspace();
        const command = ws.cli.command;
        this.executor = new DetachedConsoleService();
        LogService.info(`Executing command ${command}`);
        try {
            this.hasScriptError = false;
            this.$app.isScriptRunning = true;
            this.$app.buildMainToolbar();
            this.$app.buildMainMenu();
            const exitCode = await this.executor.executeCommand(command);
            if (exitCode !== 0) {
                throw new Error(`Command ${command} exited with code ${exitCode}`);
            }
            LogService.info(`Command ${command} is finished`);

        } catch (ex) {
            LogService.warn(`Error executing command ${command}: ${ex.message}`);
            this.hasScriptError = true;
        }
        this.$app.isScriptRunning = false;
        this.executor = null;
        this.$app.buildMainToolbar();
        this.$app.buildMainMenu();
        AngularUtils.$apply(this.$scope);
    }



}