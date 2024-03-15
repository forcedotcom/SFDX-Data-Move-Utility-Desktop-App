"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptAddOnsController = void 0;
const services_1 = require("../../../services");
const common_1 = require("../../../common");
const utils_1 = require("../../../utils");
class ScriptAddOnsController {
    constructor($app, $scope) {
        this.$app = $app;
        this.$scope = $scope;
        this.FaIcon = common_1.FaIcon;
        this.scriptAddOnFormData = {};
        this.addOnsSelectedTabId = "";
        this.isAddOnsChanged = false;
    }
    async $onInit() {
        services_1.LogService.info('Initializing ScriptAddOnsController...');
        this.setup();
        this.$app.$broadcast.onAction('buildViewComponents', null, () => {
            this.setup();
        }, this.$scope);
    }
    setup() {
        if (global.appGlobal.wizardStep == ScriptAddOnsController.wizardStep) {
            utils_1.AngularUtils.$apply(this.$scope, () => {
                this.setupAddOnEditors();
            });
            this.setAddOnsTabsetTitles();
        }
    }
    handleAddOnsChange() {
        utils_1.AngularUtils.$apply(this.$scope, () => {
            this.isAddOnsChanged = true;
        });
    }
    handleSaveAddOns() {
        const config = services_1.DatabaseService.getConfig();
        const script = config.script;
        const ws = services_1.DatabaseService.getWorkspace();
        let isIncorrectJson = false;
        utils_1.AngularUtils.$apply(this.$scope, () => {
            Object.keys(this.scriptAddOnFormData).forEach(key => {
                try {
                    script[key] = this.scriptAddOnFormData[key] ? JSON.parse(this.scriptAddOnFormData[key]) : [];
                }
                catch (_a) {
                    isIncorrectJson = true;
                }
                this.scriptAddOnFormData[key] = JSON.stringify(script[key] || [], null, 2);
            });
            this.isAddOnsChanged = false;
        });
        this.setAddOnsTabsetTitles();
        services_1.DatabaseService.updateConfig(ws.id, config);
        if (!isIncorrectJson) {
            services_1.ToastService.showSuccess();
            services_1.LogService.info(`Add-ons for configuration ${config.name} updated.`);
        }
        else {
            services_1.ToastService.showWarn(this.$app.$translate.translate({ key: 'SAVED_INCORRECT_JSON' }));
            services_1.LogService.warn(`Some Add-ons for configuration ${config.name} were not saved due to incorrect JSON.`);
        }
    }
    handleRestoreAddOns() {
        const config = services_1.DatabaseService.getConfig();
        utils_1.AngularUtils.$apply(this.$scope, () => {
            this.setupAddOnEditors();
            services_1.ToastService.showSuccess();
            services_1.LogService.info(`Add-ons for configuration ${config.name} restored.`);
        });
    }
    setupAddOnEditors() {
        const script = services_1.DatabaseService.getConfig().script;
        this.scriptAddOnFormData = {
            afterAddons: JSON.stringify(script.afterAddons || [], null, 2),
            beforeAddons: JSON.stringify(script.beforeAddons || [], null, 2),
            dataRetrievedAddons: JSON.stringify(script.dataRetrievedAddons || [], null, 2),
        };
        this.isAddOnsChanged = false;
        this.addOnsSelectedTabId = "scriptOnBefore";
    }
    setAddOnsTabsetTitles() {
        this.$app.$timeout(() => {
            var _a, _b, _c;
            const $ctrl = utils_1.AngularUtils.$getController('#scriptAddOnsTabset');
            const script = services_1.DatabaseService.getConfig().script;
            if ($ctrl) {
                $ctrl.setTabTitle('scriptOnBefore', `${this.$app.$translate.translate({ key: 'ON_BEFORE_ADD_ONS' })} (${((_a = script.beforeAddons) === null || _a === void 0 ? void 0 : _a.length) || 0})`);
                $ctrl.setTabTitle('scriptOnAfter', `${this.$app.$translate.translate({ key: 'ON_AFTER_ADD_ONS' })} (${((_b = script.afterAddons) === null || _b === void 0 ? void 0 : _b.length) || 0})`);
                $ctrl.setTabTitle('scriptDataRetrieved', `${this.$app.$translate.translate({ key: 'ON_DATA_RETRIEVED_ADD_ONS' })} (${((_c = script.dataRetrievedAddons) === null || _c === void 0 ? void 0 : _c.length) || 0})`);
            }
        }, 600);
    }
}
exports.ScriptAddOnsController = ScriptAddOnsController;
// Define your DE here
ScriptAddOnsController.$inject = ['$app', '$scope'];
ScriptAddOnsController.wizardStep = common_1.WizardStepByView[common_1.View.configuration];
//# sourceMappingURL=scriptAddOns.controller.js.map