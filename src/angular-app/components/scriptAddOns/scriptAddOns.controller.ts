import angular from 'angular';
import { UiTabsController } from '../../../angular-app/directives';
import { DialogType, FaIcon, SetupFormOptions, View, WizardStepByView } from '../../../common';
import { addOnsDefaultFormConfig, addOnsJsonSchemaConfig, availableCoreAddOnModules } from '../../../configurations';
import { IActionEventArgParam, IEditFormResult, IOption, ITabItem } from '../../../models';
import { DatabaseService, DialogService, LogService, ToastService } from '../../../services';
import { AngularUtils, CommonUtils } from '../../../utils';
import { IAppService, IJsonEditModalService } from '../../services';


interface IScriptAddOnData {
    beforeAddons?: string;
    afterAddons?: string;
    dataRetrievedAddons?: string;
}


export class ScriptAddOnsController {

    // Define your DE here
    static $inject = ['$app', '$scope', '$jsonEditModal'];

    static wizardStep = WizardStepByView[View.configuration];

    // Common
    FaIcon = FaIcon;

    //  Add-Ons tab
    isAddOnsChanged = false;
    addOnFormData: IScriptAddOnData = {};
    addOnsSelectedTabId = "";

    // Add-Ons Visual Editor
    addOnSelectedTabs: string[] = [];

    addOnFormArraySetup: SetupFormOptions = {};
    addOnFormSetup: SetupFormOptions = {};
    addOnFormJsonArray: any[];
    addOnFormNewObject: any = {};

    addOnFormHidden: boolean;
    addOnFormHiddenNew: boolean;

    constructor(private $app: IAppService, private $scope: angular.IScope, private $jsonEditModal: IJsonEditModalService) { }

    async $onInit() {
        LogService.info('Initializing ScriptAddOnsController...');
        this.setup();

        this.$app.$broadcast.onAction('buildViewComponents', null, () => {
            this.setup();
        }, this.$scope);

		this.$app.$broadcast.onAction('tabSelected', 'uiTabs', (args: IActionEventArgParam<ITabItem>) => {
            if (args.componentId == 'scriptTabs') {
                this.setup();
            }
		}, this.$scope);

    }


    // -----------------------------------------------------------------------
    // ----- Event Handlers --------------------------------------------------
    // -----------------------------------------------------------------------    
    handleTabChange(args: IActionEventArgParam<ITabItem>) {

        const tab = args.args[0];

        if (tab.tabId == "addOnVisualEditor") {
            const addOnEvent = this.addOnsSelectedTabId.replace('script-', '');

            if (this.isAddOnsChanged) {
                const result = DialogService.showPromptDialog({
                    titleKey: "DIALOG.ADD_ON_VISUAL_EDITOR.TITLE",
                    messageKey: "DIALOG.ADD_ON_VISUAL_EDITOR.MESSAGE_WHEN_SWITCH_TO_VISUAL_TAB_WITH_UNSAVED_CHANGES",
                    dialogType: DialogType.warning
                });
                if (!result) {
                    return true; // Cancel tab switch
                } else {
                    this.handleAddOnsSave();
                }
            }
            this.setupAddOnVisualEditor(addOnEvent);
            AngularUtils.$apply(this.$scope);
        } else {
            //this.$app.$timeout(() => {
                this.resetAddOnTab();
            //});
        }
    }

    handleAddOnsChange() {
        AngularUtils.$apply(this.$scope, () => {
            this.isAddOnsChanged = true;
        });
    }

    handleAddOnsSave(args?: IActionEventArgParam<void>, showToastSuccess = true) {
        const config = DatabaseService.getConfig();
        const script = config.script;
        const ws = DatabaseService.getWorkspace();
        let isIncorrectJson = false;
        AngularUtils.$apply(this.$scope, () => {
            Object.keys(this.addOnFormData).forEach(key => {
                try {
                    script[key] = this.addOnFormData[key] ? JSON.parse(this.addOnFormData[key]) : [];
                } catch {
                    isIncorrectJson = true;
                }
                this.addOnFormData[key] = JSON.stringify(script[key] || [], null, 2);
            });
            this.isAddOnsChanged = false;
        });
        this.setAddOnsTabsetTitles();
        DatabaseService.updateConfig(ws.id, config);
        if (!isIncorrectJson && showToastSuccess) {
            ToastService.showSuccess();
            LogService.info(`Add-ons for configuration ${config.name} updated.`);
        } else if (isIncorrectJson) {
            ToastService.showWarn(this.$app.$translate.translate({ key: 'SAVED_INCORRECT_ADDON_JSON', }));
            LogService.warn(`Some Add-ons for configuration ${config.name} were not saved due to incorrect JSON.`);
        }
    }

    handleAddOnsRestore() {
        const config = DatabaseService.getConfig();
        AngularUtils.$apply(this.$scope, () => {
            this.setupAddOnJsonEditors();
            ToastService.showSuccess();
            LogService.info(`Add-ons for configuration ${config.name} restored.`);
        });
    }


    // Add-On Visual Editor ----------------------------
    /**
     *  Handle the add-ons visual editor delete event.
     */
    handleAddOnsEditorDelete() {
        const allowDelete = DialogService.showPromptDialog({
            titleKey: "DIALOG.ADD_ON_VISUAL_EDITOR.TITLE",
            messageKey: "DIALOG.ADD_ON_VISUAL_EDITOR.MESSAGE_WHEN_DELETE",
            dialogType: DialogType.warning
        });

        return !allowDelete;
    }

    /**
     *  Handle the add-ons visual editor change event.
     * @param args  The event arguments.
     */
    handleAddOnsEditorChange(args: IActionEventArgParam<any>) {
        const addOnEvent = args.componentId.replace('scriptAddOnsForm-', '');
        this.addOnFormData[addOnEvent] = JSON.stringify(args.args[0], null, 2);
        LogService.info(`Action '${args.action}' performed for Add-On configuration of the '${addOnEvent}' global event.`);
        this.handleAddOnsSave(undefined, false);
    }

    /**
     * Handle the add-ons visual editor new object change event.
     * @param args  The event arguments.
     */
    handleAddOnsEditorAdd(args: IActionEventArgParam<any>) {
        const module = args.args[0].module;
        Object.assign(args.args[0], addOnsDefaultFormConfig[module]);
    }

    /**
     *  Handle the add-ons visual editor edit event.
     * @param args  The event arguments.
     */
    async handleAddOnsEditorShow(args: IActionEventArgParam<any>): Promise<IEditFormResult> {
        const addOnEvent = args.componentId.replace('scriptAddOnsForm-', '');
        const module = args.args[0].module;
        // Exceptional modules
        // TODO: Implement module exceptions here.
        // Replace 'const' to 'let' to allow variable modifications.
        const moduleConfig = module;
        switch (module) {
            // case "core:RecordsFilter":
            //     moduleConfig = args.args[0]?.args?.filterType || module;
            //     break;
        }
        const json = args.args[0];
        const jsonSchema = CommonUtils.deepClone(addOnsJsonSchemaConfig[moduleConfig]);
        jsonSchema.title = `${module}${moduleConfig == module ? '' : ` (${moduleConfig})`} ${jsonSchema.title}`.trim();
        LogService.info(`The Visual Add-On Editor was activated for global event '${addOnEvent}', and module '${module}'.`);
        const result = await this.$jsonEditModal.editJsonAsync(json, jsonSchema, null, this.$app.$translate.translate({
            key: 'FIX_ERRORS_BEFORE_SAVING_CONFIGURATION'
        }));
        return {
            data: result.data,
            result: result.result
        };
    }
    // --- ----------------------------



    // -----------------------------------------------------------------------
    // ----- Private Methods -------------------------------------------------
    // -----------------------------------------------------------------------    
    private setup() {
        if (global.appGlobal.wizardStep == ScriptAddOnsController.wizardStep) {
            AngularUtils.$apply(this.$scope, () => {
                this.setupAddOnJsonEditors();
                this.resetAddOnTab();
                this.addOnsSelectedTabId = "script-beforeAddons";
            });
            this.setAddOnsTabsetTitles();
        }
    }

    private setupAddOnJsonEditors() {
        const script = DatabaseService.getConfig().script;
        this.addOnFormData = Object.keys(script)
            .filter(property => property.endsWith('Addons'))
            .reduce((acc: any, property: string) => {
                acc[property] = JSON.stringify(script[property] || [], null, 2);
                return acc;
            }, {})
        this.isAddOnsChanged = false;
    }

    private setAddOnsTabsetTitles() {
        this.$app.$timeout(() => {
            const $ctrl = AngularUtils.$getController<UiTabsController>('#scriptAddOnsTabset');
            const script = DatabaseService.getConfig().script;
            if ($ctrl) {
                $ctrl.setTabTitle('script-beforeAddons', `${this.$app.$translate.translate({ key: 'ON_BEFORE_ADD_ONS' })} (${script.beforeAddons?.length || 0})`);
                $ctrl.setTabTitle('script-afterAddons', `${this.$app.$translate.translate({ key: 'ON_AFTER_ADD_ONS' })} (${script.afterAddons?.length || 0})`);
                $ctrl.setTabTitle('script-dataRetrievedAddons', `${this.$app.$translate.translate({ key: 'ON_DATA_RETRIEVED_ADD_ONS' })} (${script.dataRetrievedAddons?.length || 0})`);
            }
        }, 600);
    }

    private setupAddOnVisualEditor(addOnEvent: string) {

        const availableModules: IOption[] = [];
        const script = DatabaseService.getConfig().script;

        // Available modules
        availableModules.push(...availableCoreAddOnModules.script[addOnEvent]);
        const moduleDeclarations = script[addOnEvent] || [];

        // Hidden messages
        if (!availableModules.length) {
            if (moduleDeclarations.length) {
                this.addOnFormHiddenNew = true;
                this.addOnFormHidden = false;
            } else {
                this.addOnFormHidden = true;
            }
        } else {
            this.addOnFormHiddenNew = false;
            this.addOnFormHidden = false;
        }

        // Form setups
        const availableAddOnOptions = availableModules.map(option => {
            return {
                value: option.value,
                label: option.label
            }
        });

        this.addOnFormArraySetup = {
            module: {
                type: 'input'
            },
            description: {
                type: 'input'
            },
        };

        this.addOnFormSetup = {
            module: {
                type: 'select',
                required: true,
                label: this.$app.$translate.translate({ key: 'MODULE' }),
                options: availableAddOnOptions
            },
            description: {
                type: 'input',
                required: false,
                label: this.$app.$translate.translate({ key: 'DESCRIPTION' })
            },
        }

        // Array assignment
        this.addOnFormJsonArray = moduleDeclarations;

        this.addOnFormNewObject = addOnsDefaultFormConfig[addOnEvent];
    }

    private resetAddOnTab(addOnEvent?: string) {
        if (addOnEvent) {
            this.addOnSelectedTabs[addOnEvent] = 'addOnEditJson';
            return;
        }
        Object.keys(this.addOnSelectedTabs).forEach(addOnEvent => {
            this.addOnSelectedTabs[addOnEvent] = 'addOnEditJson';
        });
    }

}
