"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptAddOnsController = void 0;
const common_1 = require("../../../common");
const configurations_1 = require("../../../configurations");
const services_1 = require("../../../services");
const utils_1 = require("../../../utils");
class ScriptAddOnsController {
    constructor($app, $scope, $jsonEditModal) {
        this.$app = $app;
        this.$scope = $scope;
        this.$jsonEditModal = $jsonEditModal;
        // Common
        this.FaIcon = common_1.FaIcon;
        //  Add-Ons tab
        this.isAddOnsChanged = false;
        this.addOnFormData = {};
        this.addOnsSelectedTabId = "";
        // Add-Ons Visual Editor
        this.addOnSelectedTabs = [];
        this.addOnFormArraySetup = {};
        this.addOnFormSetup = {};
        this.addOnFormNewObject = {};
    }
    async $onInit() {
        services_1.LogService.info('Initializing ScriptAddOnsController...');
        this.setup();
        this.$app.$broadcast.onAction('buildViewComponents', null, () => {
            this.setup();
        }, this.$scope);
        this.$app.$broadcast.onAction('tabSelected', 'uiTabs', (args) => {
            if (args.componentId == 'scriptTabs') {
                this.setup();
            }
        }, this.$scope);
    }
    // -----------------------------------------------------------------------
    // ----- Event Handlers --------------------------------------------------
    // -----------------------------------------------------------------------    
    handleTabChange(args) {
        const tab = args.args[0];
        if (tab.tabId == "addOnVisualEditor") {
            const addOnEvent = this.addOnsSelectedTabId.replace('script-', '');
            if (this.isAddOnsChanged) {
                const result = services_1.DialogService.showPromptDialog({
                    titleKey: "DIALOG.ADD_ON_VISUAL_EDITOR.TITLE",
                    messageKey: "DIALOG.ADD_ON_VISUAL_EDITOR.MESSAGE_WHEN_SWITCH_TO_VISUAL_TAB_WITH_UNSAVED_CHANGES",
                    dialogType: common_1.DialogType.warning
                });
                if (!result) {
                    return true; // Cancel tab switch
                }
                else {
                    this.handleAddOnsSave();
                }
            }
            this.setupAddOnVisualEditor(addOnEvent);
            utils_1.AngularUtils.$apply(this.$scope);
        }
        else {
            //this.$app.$timeout(() => {
            this.resetAddOnTab();
            //});
        }
    }
    handleAddOnsChange() {
        utils_1.AngularUtils.$apply(this.$scope, () => {
            this.isAddOnsChanged = true;
        });
    }
    handleAddOnsSave(args, showToastSuccess = true) {
        const config = services_1.DatabaseService.getConfig();
        const script = config.script;
        const ws = services_1.DatabaseService.getWorkspace();
        let isIncorrectJson = false;
        utils_1.AngularUtils.$apply(this.$scope, () => {
            Object.keys(this.addOnFormData).forEach(key => {
                try {
                    script[key] = this.addOnFormData[key] ? JSON.parse(this.addOnFormData[key]) : [];
                }
                catch (_a) {
                    isIncorrectJson = true;
                }
                this.addOnFormData[key] = JSON.stringify(script[key] || [], null, 2);
            });
            this.isAddOnsChanged = false;
        });
        this.setAddOnsTabsetTitles();
        services_1.DatabaseService.updateConfig(ws.id, config);
        if (!isIncorrectJson && showToastSuccess) {
            services_1.ToastService.showSuccess();
            services_1.LogService.info(`Add-ons for configuration ${config.name} updated.`);
        }
        else if (isIncorrectJson) {
            services_1.ToastService.showWarn(this.$app.$translate.translate({ key: 'SAVED_INCORRECT_ADDON_JSON', }));
            services_1.LogService.warn(`Some Add-ons for configuration ${config.name} were not saved due to incorrect JSON.`);
        }
    }
    handleAddOnsRestore() {
        const config = services_1.DatabaseService.getConfig();
        utils_1.AngularUtils.$apply(this.$scope, () => {
            this.setupAddOnJsonEditors();
            services_1.ToastService.showSuccess();
            services_1.LogService.info(`Add-ons for configuration ${config.name} restored.`);
        });
    }
    // Add-On Visual Editor ----------------------------
    /**
     *  Handle the add-ons visual editor delete event.
     */
    handleAddOnsEditorDelete() {
        const allowDelete = services_1.DialogService.showPromptDialog({
            titleKey: "DIALOG.ADD_ON_VISUAL_EDITOR.TITLE",
            messageKey: "DIALOG.ADD_ON_VISUAL_EDITOR.MESSAGE_WHEN_DELETE",
            dialogType: common_1.DialogType.warning
        });
        return !allowDelete;
    }
    /**
     *  Handle the add-ons visual editor change event.
     * @param args  The event arguments.
     */
    handleAddOnsEditorChange(args) {
        const addOnEvent = args.componentId.replace('scriptAddOnsForm-', '');
        this.addOnFormData[addOnEvent] = JSON.stringify(args.args[0], null, 2);
        services_1.LogService.info(`Action '${args.action}' performed for Add-On configuration of the '${addOnEvent}' global event.`);
        this.handleAddOnsSave(undefined, false);
    }
    /**
     * Handle the add-ons visual editor new object change event.
     * @param args  The event arguments.
     */
    handleAddOnsEditorAdd(args) {
        const module = args.args[0].module;
        Object.assign(args.args[0], configurations_1.addOnsDefaultFormConfig[module]);
    }
    /**
     *  Handle the add-ons visual editor edit event.
     * @param args  The event arguments.
     */
    async handleAddOnsEditorShow(args) {
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
        const jsonSchema = utils_1.CommonUtils.deepClone(configurations_1.addOnsJsonSchemaConfig[moduleConfig]);
        jsonSchema.title = `${module}${moduleConfig == module ? '' : ` (${moduleConfig})`} ${jsonSchema.title}`.trim();
        services_1.LogService.info(`The Visual Add-On Editor was activated for global event '${addOnEvent}', and module '${module}'.`);
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
    setup() {
        if (global.appGlobal.wizardStep == ScriptAddOnsController.wizardStep) {
            utils_1.AngularUtils.$apply(this.$scope, () => {
                this.setupAddOnJsonEditors();
                this.resetAddOnTab();
                this.addOnsSelectedTabId = "script-beforeAddons";
            });
            this.setAddOnsTabsetTitles();
        }
    }
    setupAddOnJsonEditors() {
        const script = services_1.DatabaseService.getConfig().script;
        this.addOnFormData = Object.keys(script)
            .filter(property => property.endsWith('Addons'))
            .reduce((acc, property) => {
            acc[property] = JSON.stringify(script[property] || [], null, 2);
            return acc;
        }, {});
        this.isAddOnsChanged = false;
    }
    setAddOnsTabsetTitles() {
        this.$app.$timeout(() => {
            var _a, _b, _c;
            const $ctrl = utils_1.AngularUtils.$getController('#scriptAddOnsTabset');
            const script = services_1.DatabaseService.getConfig().script;
            if ($ctrl) {
                $ctrl.setTabTitle('script-beforeAddons', `${this.$app.$translate.translate({ key: 'ON_BEFORE_ADD_ONS' })} (${((_a = script.beforeAddons) === null || _a === void 0 ? void 0 : _a.length) || 0})`);
                $ctrl.setTabTitle('script-afterAddons', `${this.$app.$translate.translate({ key: 'ON_AFTER_ADD_ONS' })} (${((_b = script.afterAddons) === null || _b === void 0 ? void 0 : _b.length) || 0})`);
                $ctrl.setTabTitle('script-dataRetrievedAddons', `${this.$app.$translate.translate({ key: 'ON_DATA_RETRIEVED_ADD_ONS' })} (${((_c = script.dataRetrievedAddons) === null || _c === void 0 ? void 0 : _c.length) || 0})`);
            }
        }, 600);
    }
    setupAddOnVisualEditor(addOnEvent) {
        const availableModules = [];
        const script = services_1.DatabaseService.getConfig().script;
        // Available modules
        availableModules.push(...configurations_1.availableCoreAddOnModules.script[addOnEvent]);
        const moduleDeclarations = script[addOnEvent] || [];
        // Hidden messages
        if (!availableModules.length) {
            if (moduleDeclarations.length) {
                this.addOnFormHiddenNew = true;
                this.addOnFormHidden = false;
            }
            else {
                this.addOnFormHidden = true;
            }
        }
        else {
            this.addOnFormHiddenNew = false;
            this.addOnFormHidden = false;
        }
        // Form setups
        const availableAddOnOptions = availableModules.map(option => {
            return {
                value: option.value,
                label: option.label
            };
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
        };
        // Array assignment
        this.addOnFormJsonArray = moduleDeclarations;
        this.addOnFormNewObject = configurations_1.addOnsDefaultFormConfig[addOnEvent];
    }
    resetAddOnTab(addOnEvent) {
        if (addOnEvent) {
            this.addOnSelectedTabs[addOnEvent] = 'addOnEditJson';
            return;
        }
        Object.keys(this.addOnSelectedTabs).forEach(addOnEvent => {
            this.addOnSelectedTabs[addOnEvent] = 'addOnEditJson';
        });
    }
}
exports.ScriptAddOnsController = ScriptAddOnsController;
// Define your DE here
ScriptAddOnsController.$inject = ['$app', '$scope', '$jsonEditModal'];
ScriptAddOnsController.wizardStep = common_1.WizardStepByView[common_1.View.configuration];
//# sourceMappingURL=scriptAddOns.controller.js.map