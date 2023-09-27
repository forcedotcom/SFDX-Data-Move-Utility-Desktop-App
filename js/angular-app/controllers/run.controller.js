"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunController = void 0;
const utils_1 = require("../../utils");
const common_1 = require("../../common");
const services_1 = require("../../services");
class RunController {
    get isScriptRunning() {
        return this.$app.isScriptRunning;
    }
    get cliCommand() {
        var _a;
        const ws = services_1.DatabaseService.getWorkspace();
        return ((_a = ws.cli) === null || _a === void 0 ? void 0 : _a.command) || '';
    }
    constructor($app, $scope) {
        this.$app = $app;
        this.$scope = $scope;
        this.hasScriptError = false;
    }
    $onInit() {
        services_1.LogService.info('Initializing RunController...');
        this.setup();
        this.$app.$broadcast.onAction('buildViewComponents', null, () => {
            this.setup();
        }, this.$scope);
    }
    /**
     * Setup the component.
     */
    setup() {
        if (global.appGlobal.wizardStep == RunController.wizardStep) {
        }
    }
    async handleRunScript() {
        const ws = services_1.DatabaseService.getWorkspace();
        const command = ws.cli.command;
        this.executor = new services_1.DetachedConsoleService();
        services_1.LogService.info(`Executing command ${command}`);
        try {
            this.hasScriptError = false;
            this.$app.isScriptRunning = true;
            this.$app.buildMainToolbar();
            this.$app.buildMainMenu();
            const exitCode = await this.executor.executeCommand(command);
            if (exitCode !== 0) {
                throw new Error(`Command ${command} exited with code ${exitCode}`);
            }
            services_1.LogService.info(`Command ${command} is finished`);
        }
        catch (ex) {
            services_1.LogService.warn(`Error executing command ${command}: ${ex.message}`);
            this.hasScriptError = true;
        }
        this.$app.isScriptRunning = false;
        this.executor = null;
        this.$app.buildMainToolbar();
        this.$app.buildMainMenu();
        utils_1.AngularUtils.$apply(this.$scope);
    }
}
exports.RunController = RunController;
RunController.$inject = ["$app", "$scope"];
RunController.wizardStep = common_1.WizardStepByView[common_1.View.run];
//# sourceMappingURL=run.controller.js.map