import angular from 'angular';
import { IAppService } from '../../services';
import { DatabaseService, LogService, ToastService } from '../../../services';
import { FaIcon, View, WizardStepByView } from '../../../common';
import { AngularUtils } from '../../../utils';
import { UiTabsController } from '../../../angular-app/directives';


interface IScriptAddOnData {
    beforeAddons?: string;
    afterAddons?: string;
    dataRetrievedAddons?: string;
}


export class ScriptAddOnsController {

    // Define your DE here
    static $inject = ['$app', '$scope'];

    static wizardStep = WizardStepByView[View.configuration];

    FaIcon = FaIcon;
    scriptAddOnFormData: IScriptAddOnData = {};
    addOnsSelectedTabId = "";
    isAddOnsChanged = false;

    constructor(private $app: IAppService, private $scope: angular.IScope) { }

    async $onInit() {
        LogService.info('Initializing ScriptAddOnsController...');
        this.setup();

        this.$app.$broadcast.onAction('buildViewComponents', null, () => {
            this.setup();
        }, this.$scope);

    }

    setup() {
        if (global.appGlobal.wizardStep == ScriptAddOnsController.wizardStep) {
            AngularUtils.$apply(this.$scope, () => {
                this.setupAddOnEditors();
            });
            this.setAddOnsTabsetTitles();
        }
    }

    handleAddOnsChange() {
        AngularUtils.$apply(this.$scope, () => {
            this.isAddOnsChanged = true;
        });
    }

    handleSaveAddOns() {
        const config = DatabaseService.getConfig();
        const script = config.script;
        const ws = DatabaseService.getWorkspace();
        let isIncorrectJson = false;
        AngularUtils.$apply(this.$scope, () => {
            Object.keys(this.scriptAddOnFormData).forEach(key => {
                try {
                    script[key] = this.scriptAddOnFormData[key] ? JSON.parse(this.scriptAddOnFormData[key]) : [];
                } catch {
                    isIncorrectJson = true;
                }
                this.scriptAddOnFormData[key] = JSON.stringify(script[key] || [], null, 2);
            });
            this.isAddOnsChanged = false;
        });
        this.setAddOnsTabsetTitles();
        DatabaseService.updateConfig(ws.id, config);
        if (!isIncorrectJson) {
            ToastService.showSuccess();
            LogService.info(`Add-ons for configuration ${config.name} updated.`);
        } else {
            ToastService.showWarn(this.$app.$translate.translate({ key: 'SAVED_INCORRECT_JSON' }));
            LogService.warn(`Some Add-ons for configuration ${config.name} were not saved due to incorrect JSON.`);
        }
    }

    handleRestoreAddOns() {
        const config = DatabaseService.getConfig();
        AngularUtils.$apply(this.$scope, () => {
            this.setupAddOnEditors();
            ToastService.showSuccess();
            LogService.info(`Add-ons for configuration ${config.name} restored.`);
        });
    }

    private setupAddOnEditors() {
        const script = DatabaseService.getConfig().script;
        this.scriptAddOnFormData = {
            afterAddons: JSON.stringify(script.afterAddons || [], null, 2),
            beforeAddons: JSON.stringify(script.beforeAddons || [], null, 2),
            dataRetrievedAddons: JSON.stringify(script.dataRetrievedAddons || [], null, 2),
        };
        this.isAddOnsChanged = false;
        this.addOnsSelectedTabId = "scriptOnBefore";
    }

    private setAddOnsTabsetTitles() {
        this.$app.$timeout(() => {
            const $ctrl = AngularUtils.$getController<UiTabsController>('#scriptAddOnsTabset');
            const script = DatabaseService.getConfig().script;
            if ($ctrl) {
                $ctrl.setTabTitle('scriptOnBefore', `${this.$app.$translate.translate({ key: 'ON_BEFORE_ADD_ONS' })} (${script.beforeAddons?.length || 0})`);
                $ctrl.setTabTitle('scriptOnAfter', `${this.$app.$translate.translate({ key: 'ON_AFTER_ADD_ONS' })} (${script.afterAddons?.length || 0})`);
                $ctrl.setTabTitle('scriptDataRetrieved', `${this.$app.$translate.translate({ key: 'ON_DATA_RETRIEVED_ADD_ONS' })} (${script.dataRetrievedAddons?.length || 0})`);
            }
        }, 600);
    }
}
