import { SetupFormOptions, View, WizardStepByView } from "../../common";
import { IActionEventArgParam } from "../../models";
import { DatabaseService, LogService, SfdmuService } from "../../services";
import { AngularUtils, CommonUtils } from "../../utils";
import { IAppService } from "../services";

interface IConnectionJson {
    sourceConnectionId: string,
    targetConnectionId: string
}

export class ConnectionController {

    static $inject = ["$app", "$scope"];

    static wizardStep = WizardStepByView[View.connection];

    constructor(private $app: IAppService, private $scope: angular.IScope) { }

    orgsConnectionSelectorFormSetup: SetupFormOptions;
    orgsConnectionSelectorFormJson: any;

    orgConnectionSelectorIsVisible: boolean;

    $onInit() {

        LogService.info('Initializing ConnectionController...');

        this.setup();

        this.$app.$broadcast.onAction('buildViewComponents', null, () => {
            this.setup();
        }, this.$scope);

    }

    /**
     * Setup the component.
     */
    private setup() {
        if (global.appGlobal.wizardStep == ConnectionController.wizardStep) {

            const db = DatabaseService.getOrCreateAppDb();
            const ws = DatabaseService.getWorkspace();

            AngularUtils.$apply(this.$scope, () => {

                this.orgConnectionSelectorIsVisible = db.orgConnections.length > 0;

                this.orgsConnectionSelectorFormSetup = {
                    sourceConnectionId: {
                        type: 'select',
                        label: this.$app.$translate.translate({ key: 'SOURCE_CONNECTION' }),
                        required: true,
                        options: db.orgConnections.map(c => ({ value: c.id, label: c.userName }))
                    },
                    targetConnectionId: {
                        type: 'select',
                        label: this.$app.$translate.translate({ key: 'TARGET_CONNECTION' }),
                        required: true,
                        options: db.orgConnections.map(c => ({ value: c.id, label: c.userName }))
                    }
                };

                this.orgsConnectionSelectorFormJson = {
                    sourceConnectionId: ws.sourceConnectionId,
                    targetConnectionId: ws.targetConnectionId
                } as IConnectionJson;
            });
        }
    }


    // Event handlers --
    handleJsonEditorChange = (args: IActionEventArgParam<IConnectionJson>) => {
        if (args.args && args.args[0]) {
            if (CommonUtils.deepEquals(args.args[0], this.orgsConnectionSelectorFormJson)) return;
            const ws = DatabaseService.getWorkspace();
            ws.sourceConnectionId = args.args[0].sourceConnectionId;
            ws.targetConnectionId = args.args[0].targetConnectionId;
            DatabaseService.saveAppDb();
            this.$app.buildAllApplicationViewComponents();
            this.$app.buildMainToolbar();
            this.$app.buildFooter();
            LogService.info(`Connection switched: ${ws.sourceConnection.name} -> ${ws.targetConnection.name}`);
        }
    }

}