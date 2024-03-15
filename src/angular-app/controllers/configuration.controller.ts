import { View, WizardStepByView } from "../../common";
import { DatabaseService, LogService } from "../../services";
import { AngularUtils } from "../../utils";
import { IAppService } from "../services";

export class ConfigurationController {

    static $inject = ["$app", "$scope"];

    static wizardStep = WizardStepByView[View.configuration];

    constructor(private $app: IAppService, private $scope: angular.IScope) { }

    isConfigurationSelected = false;
    scriptTabsSelectedTabId = "";

    $onInit() {

        LogService.info('Initializing ConfigurationController...');

        this.setup();

        this.$app.$broadcast.onAction('buildViewComponents', null, () => {
            this.setup();
        }, this.$scope);

    }

    /**
     * Setup the component.
     */
    private setup() {
        if (global.appGlobal.wizardStep == ConfigurationController.wizardStep) {
            
            const config = DatabaseService.getConfig();

            AngularUtils.$apply(this.$scope, () => {
                this.isConfigurationSelected = config.isInitialized;
                this.scriptTabsSelectedTabId = "tabObjectManager";
            });

        }
    }

}