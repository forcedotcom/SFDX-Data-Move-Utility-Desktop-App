import { View, WizardStepByView } from "../../common";
import { DatabaseService, LogService } from "../../services";
import { AngularUtils } from "../../utils";
import { IAppService } from "../services";

export class HomeController {

    static $inject = ["$app", "$scope"];

    static wizardStep = WizardStepByView[View.home];

    constructor(private $app: IAppService, private $scope: angular.IScope) { }

    isWorkspaceSelected: boolean;
    selectedWorkspaceMessage: string;

    $onInit() {

        LogService.info('Initializing HomeController...');

        this.setup();

        this.$app.$broadcast.onAction('buildViewComponents', null, () => {
            this.setup();
        }, this.$scope);

    }


    /**
     * Setup the component.
     */
    private setup() {

        if (global.appGlobal.wizardStep == HomeController.wizardStep) {

            const ws = DatabaseService.getWorkspace();

            AngularUtils.$apply(this.$scope, () => {
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