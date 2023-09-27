"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionController = void 0;
const common_1 = require("../../common");
const services_1 = require("../../services");
const utils_1 = require("../../utils");
class ConnectionController {
    constructor($app, $scope) {
        this.$app = $app;
        this.$scope = $scope;
        // Event handlers --
        this.handleJsonEditorChange = (args) => {
            if (args.args && args.args[0]) {
                if (utils_1.CommonUtils.deepEquals(args.args[0], this.orgsConnectionSelectorFormJson))
                    return;
                const ws = services_1.DatabaseService.getWorkspace();
                ws.sourceConnectionId = args.args[0].sourceConnectionId;
                ws.targetConnectionId = args.args[0].targetConnectionId;
                services_1.DatabaseService.saveAppDb();
                this.$app.buildAllApplicationViewComponents();
                this.$app.buildMainToolbar();
                this.$app.buildFooter();
                services_1.LogService.info(`Connection switched: ${ws.sourceConnection.name} -> ${ws.targetConnection.name}`);
            }
        };
    }
    $onInit() {
        services_1.LogService.info('Initializing ConnectionController...');
        this.setup();
        this.$app.$broadcast.onAction('buildViewComponents', null, () => {
            this.setup();
        }, this.$scope);
    }
    /**
     * Setup the component.
     */
    setup() {
        if (global.appGlobal.wizardStep == ConnectionController.wizardStep) {
            const db = services_1.DatabaseService.getOrCreateAppDb();
            const ws = services_1.DatabaseService.getWorkspace();
            utils_1.AngularUtils.$apply(this.$scope, () => {
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
                };
            });
        }
    }
}
exports.ConnectionController = ConnectionController;
ConnectionController.$inject = ["$app", "$scope"];
ConnectionController.wizardStep = common_1.WizardStepByView[common_1.View.connection];
//# sourceMappingURL=connection.controller.js.map