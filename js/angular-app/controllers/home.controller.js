"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeController = void 0;
const common_1 = require("../../common");
const services_1 = require("../../services");
const utils_1 = require("../../utils");
class HomeController {
    constructor($app, $scope) {
        this.$app = $app;
        this.$scope = $scope;
    }
    $onInit() {
        services_1.LogService.info('Initializing HomeController...');
        this.setup();
        this.$app.$broadcast.onAction('buildViewComponents', null, () => {
            this.setup();
        }, this.$scope);
    }
    /**
     * Setup the component.
     */
    setup() {
        if (global.appGlobal.wizardStep == HomeController.wizardStep) {
            const ws = services_1.DatabaseService.getWorkspace();
            utils_1.AngularUtils.$apply(this.$scope, () => {
                this.isWorkspaceSelected = ws.isInitialized;
                if (this.isWorkspaceSelected) {
                    this.selectedWorkspaceMessage = this.$app.$translate.translate({
                        key: 'SELECTED_WORKSPACE',
                        params: { WORKSPACE_NAME: ws.name }
                    });
                }
            });
        }
    }
}
exports.HomeController = HomeController;
HomeController.$inject = ["$app", "$scope"];
HomeController.wizardStep = common_1.WizardStepByView[common_1.View.home];
//# sourceMappingURL=home.controller.js.map