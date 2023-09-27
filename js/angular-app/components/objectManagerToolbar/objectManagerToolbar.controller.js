"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectManagerToolbarController = void 0;
const common_1 = require("../../../common");
const models_1 = require("../../../models");
const services_1 = require("../../../services");
const utils_1 = require("../../../utils");
class ObjectManagerToolbarController {
    constructor($app, $scope) {
        this.$app = $app;
        this.$scope = $scope;
        this.selectedObjects = [];
    }
    async $onInit() {
        services_1.LogService.info('Initializing ObjectManagerToolbarController...');
        this.setup();
        this.$app.$broadcast.onAction('buildViewComponents', null, () => {
            this.$app.$timeout(() => {
                this.setup();
            }, 500, false);
        }, this.$scope);
        this.$app.$broadcast.onAction('onChange', 'uiList', (args) => {
            if (args.componentId == 'objectsList') {
                this.setup();
            }
        }, this.$scope);
    }
    /**
     * Setup the component
     */
    setup() {
        if (global.appGlobal.wizardStep == ObjectManagerToolbarController.wizardStep) {
            const config = services_1.DatabaseService.getConfig();
            const uiListController = utils_1.AngularUtils.$getController('#objectsList');
            if (uiListController) {
                this.selectedObjects = uiListController.getSelectedItems().map(item => item.value);
            }
            utils_1.AngularUtils.$apply(this.$scope, () => {
                var _a, _b;
                this.objectManagerToolbarFormSetup = {
                    objectSetId: {
                        type: 'select',
                        label: this.$app.$translate.translate({ key: 'OBJECT_SET' }),
                        helpSearchWord: 'OBJECT_SET',
                        addHelpLinks: true,
                        required: true,
                        options: config.script.objectSets.map(os => ({ value: os.id, label: os.name })),
                        formClass: 'form-control-width'
                    },
                    moveObjectSetUp: {
                        type: 'button',
                        action: 'move-object-set-up',
                        popover: this.$app.$translate.translate({ key: 'MOVE_ITEM_UP' }),
                        buttonStyle: common_1.BsButtonStyle.outlinePrimary,
                        icon: common_1.FaIcon.arrowUp,
                        buttonSize: common_1.BsSize.sm,
                        disabled: !config.objectSetId || ((_a = config.script.objectSets[0]) === null || _a === void 0 ? void 0 : _a.id) == config.objectSetId
                    },
                    moveObjectSetDown: {
                        type: 'button',
                        action: 'move-object-set-down',
                        popover: this.$app.$translate.translate({ key: 'MOVE_ITEM_DOWN' }),
                        buttonStyle: common_1.BsButtonStyle.outlinePrimary,
                        icon: common_1.FaIcon.arrowDown,
                        buttonSize: common_1.BsSize.sm,
                        disabled: !config.objectSetId || ((_b = config.script.objectSets[config.script.objectSets.length - 1]) === null || _b === void 0 ? void 0 : _b.id) == config.objectSetId
                    },
                    div1: {
                        type: 'divider',
                    },
                    addObjectSet: {
                        type: 'button',
                        action: 'add-object-set',
                        popover: this.$app.$translate.translate({ key: 'ADD_NEW' }),
                        buttonStyle: common_1.BsButtonStyle.outlinePrimary,
                        icon: common_1.FaIcon.plus,
                        buttonSize: common_1.BsSize.sm
                    },
                    renameObjectSet: {
                        type: 'button',
                        action: 'rename-object-set',
                        popover: this.$app.$translate.translate({ key: 'RENAME_SELECTED' }),
                        buttonStyle: common_1.BsButtonStyle.outlinePrimary,
                        icon: common_1.FaIcon.edit,
                        buttonSize: common_1.BsSize.sm,
                        disabled: !config.objectSetId
                    },
                    removeObjectSet: {
                        type: 'button',
                        action: 'remove-object-set',
                        popover: this.$app.$translate.translate({ key: 'REMOVE_SELECTED' }),
                        buttonStyle: common_1.BsButtonStyle.outlineDanger,
                        icon: common_1.FaIcon.minus,
                        buttonSize: common_1.BsSize.sm,
                        disabled: !config.objectSetId
                    },
                    div2: {
                        type: 'divider',
                    },
                    addObjectsToObjectSet: {
                        type: 'button',
                        action: 'add-objects-to-object-set',
                        popover: this.$app.$translate.translate({ key: 'DIALOG.OBJECT_SET.ADD_OBJECTS_TITLE' }),
                        buttonStyle: common_1.BsButtonStyle.outlinePrimary,
                        icon: common_1.FaIcon.addItemToList,
                        buttonSize: common_1.BsSize.sm,
                        disabled: !config.objectSetId
                    },
                    removeObjectsFromObjectSet: {
                        type: 'button',
                        action: 'remove-objects-from-object-set',
                        popover: this.$app.$translate.translate({ key: 'DIALOG.OBJECT_SET.REMOVE_OBJECTS_TITLE' }),
                        buttonStyle: common_1.BsButtonStyle.outlineDanger,
                        icon: common_1.FaIcon.removeItemFromList,
                        buttonSize: common_1.BsSize.sm,
                        disabled: !config.objectSetId || !config.objectSet.objects.length || !this.selectedObjects.length
                    },
                    excludeSelectedSObjects: {
                        type: 'button',
                        action: 'exclude-selected-sobjects',
                        popover: this.$app.$translate.translate({ key: 'EXCLUDE_SELECTED_SOBJECTS' }),
                        buttonStyle: common_1.BsButtonStyle.outlineDanger,
                        icon: common_1.FaIcon.ban,
                        buttonSize: common_1.BsSize.sm,
                        disabled: !config.objectSetId || !this.selectedObjects.length
                    },
                    includeSelectedSObjects: {
                        type: 'button',
                        action: 'include-selected-sobjects',
                        popover: this.$app.$translate.translate({ key: 'INCLUDE_SELECTED_SOBJECTS' }),
                        buttonStyle: common_1.BsButtonStyle.outlinePrimary,
                        icon: common_1.FaIcon.check,
                        buttonSize: common_1.BsSize.sm,
                        disabled: !config.objectSetId || !this.selectedObjects.length
                    },
                };
                this.objectManagerToolbarFormJson = {
                    objectSetId: config.objectSetId,
                    moveObjectSetUp: true,
                    moveObjectSetDown: true,
                    div1: true,
                    addObjectSet: true,
                    renameObjectSet: true,
                    removeObjectSet: true,
                    div2: true,
                    addObjectsToObjectSet: true,
                    removeObjectsFromObjectSet: true,
                };
            });
        }
    }
    /**
     * Displays configuration errors
     */
    displayConfigurationErrors() {
        const config = services_1.DatabaseService.getConfig();
        // General errors in Object Sets
        if (!config.script.objectSets.flatBy('objects', models_1.ScriptObject).some(object => !object.excluded)) {
            this.$app.setViewErrors(common_1.ErrorSource.objectSets);
        }
        else {
            this.$app.clearViewErrors(common_1.ErrorSource.objectSets);
        }
    }
    /**
     * Makes all necessary final actions after the action is finished
     * @param showToast
     */
    actionFinish(showToast = true) {
        this.$app.clearViewErrors();
        this.displayConfigurationErrors();
        this.$app.buildAllApplicationViewComponents();
        this.$app.buildFooter();
        this.$app.buildMainToolbar();
        showToast && services_1.ToastService.showSuccess();
    }
    // Event handlers --------------------------------------------------
    /**
     * Handle object manager toolbar change
     * @param args  The event arguments
     */
    async handleObjectManagerToolbarChange(args) {
        var _a;
        const ws = services_1.DatabaseService.getWorkspace();
        const config = services_1.DatabaseService.getConfig();
        if (args.args && args.args[1]) {
            // Handle the button events ----------------------------------------------
            const buttonFormSetupOption = args.args[1];
            switch (buttonFormSetupOption.action) {
                case 'add-object-set':
                    {
                        const name = await this.$app.$edit.showDialogAsync({
                            dialogType: 'inputbox',
                            promptMessage: this.$app.$translate.translate({ key: 'DIALOG.OBJECT_SET.NEW' }),
                            title: this.$app.$translate.translate({ key: "DIALOG.OBJECT_SET.NEW_TITLE" }),
                            isRequired: true,
                        });
                        if (name) {
                            const objectSet = new models_1.ScriptObjectSet({
                                name: name,
                                id: utils_1.CommonUtils.randomString()
                            });
                            config.script.objectSets.push(objectSet);
                            config.objectSetId = objectSet.id;
                            services_1.DatabaseService.updateConfig(ws.id, config);
                            services_1.LogService.info(`Object set '${config.objectSet.name}' added.`);
                            this.actionFinish();
                        }
                    }
                    break;
                case 'remove-object-set':
                    {
                        const result = services_1.DialogService.showPromptDialog({
                            titleKey: "DIALOG.OBJECT_SET.DELETE_TITLE",
                            messageKey: "DIALOG.OBJECT_SET.DELETE",
                            dialogType: common_1.DialogType.warning,
                            params: {
                                OBJECT_SET_NAME: config.objectSet.name
                            }
                        });
                        if (result) {
                            const oldName = config.objectSet.name;
                            config.script.objectSets.removeByProps({ id: config.objectSetId });
                            config.objectSetId = ((_a = config.script.objectSets[0]) === null || _a === void 0 ? void 0 : _a.id) || '';
                            services_1.DatabaseService.updateConfig(ws.id, config);
                            services_1.LogService.info(`Object set '${oldName}' removed.`);
                            this.actionFinish();
                        }
                    }
                    break;
                case 'rename-object-set':
                    {
                        const name = await this.$app.$edit.showDialogAsync({
                            dialogType: 'inputbox',
                            promptMessage: this.$app.$translate.translate({ key: 'DIALOG.OBJECT_SET.RENAME' }),
                            title: this.$app.$translate.translate({ key: "DIALOG.OBJECT_SET.RENAME_TITLE" }),
                            isRequired: true,
                            defaultValue: config.objectSet.name
                        });
                        if (name && name !== config.objectSet.name) {
                            const oldName = config.name;
                            config.objectSet.name = name;
                            services_1.DatabaseService.updateConfig(ws.id, config);
                            services_1.LogService.info(`Object set renamed: ${oldName} -> ${name}`);
                            this.actionFinish();
                        }
                    }
                    break;
                case 'move-object-set-up':
                    {
                        const index = config.script.objectSets.findIndex(os => os.id == config.objectSetId);
                        if (index > 0) {
                            config.script.objectSets.move(index, index - 1);
                            services_1.DatabaseService.updateConfig(ws.id, config);
                            services_1.LogService.info(`Object set '${config.objectSet.name}' moved up.`);
                            this.actionFinish();
                        }
                    }
                    break;
                case 'move-object-set-down':
                    {
                        const index = config.script.objectSets.findIndex(os => os.id == config.objectSetId);
                        if (index < config.script.objectSets.length - 1) {
                            config.script.objectSets.move(index, index + 1);
                            services_1.DatabaseService.updateConfig(ws.id, config);
                            services_1.LogService.info(`Object set '${config.objectSet.name}' moved down.`);
                            this.actionFinish();
                        }
                    }
                    break;
                case 'add-objects-to-object-set':
                    {
                        const objects = await this.$app.$edit.showDialogAsync({
                            dialogType: 'multiselect',
                            title: this.$app.$translate.translate({ key: "DIALOG.OBJECT_SET.ADD_OBJECTS_TITLE" }),
                            promptMessage: this.$app.$translate.translate({ key: 'DIALOG.OBJECT_SET.ADD_OBJECTS' }),
                            selectBoxOptions: [...this.$app.orgDescribe.objectsMap.values()]
                                .filter(describe => describe.dataSource == common_1.DataSource.both)
                                .excludeBy(config.objectSet.objects, "name", "name")
                                .map(describe => ({
                                value: describe.name,
                                label: describe.label
                            }))
                                .sortBy('label'),
                            defaultValue: [],
                            isRequired: true
                        });
                        if (objects && objects.length) {
                            config.objectSet.objects.push(...objects.map(name => {
                                return new models_1.ScriptObject({
                                    name: name,
                                    id: utils_1.CommonUtils.randomString(),
                                    defaultExternalId: utils_1.SfdmuUtils.getDefaultExternalId(name, this.$app.orgDescribe),
                                    fields: ['Id'],
                                    where: '',
                                    query: `SELECT Id FROM ${name}`
                                });
                            }));
                            services_1.DatabaseService.updateConfig(ws.id, config);
                            services_1.LogService.info(`${objects.length} sobjects were added to object set '${config.objectSet.name}'`);
                            this.actionFinish();
                        }
                    }
                    break;
                case 'remove-objects-from-object-set':
                    {
                        if (this.selectedObjects.length) {
                            const result = services_1.DialogService.showPromptDialog({
                                titleKey: "DIALOG.OBJECT_SET.REMOVE_OBJECTS_TITLE",
                                messageKey: "DIALOG.OBJECT_SET.REMOVE_OBJECTS",
                                params: {
                                    OBJECT_SET_NAME: config.objectSet.name,
                                    OBJECTS_COUNT: this.selectedObjects.length
                                },
                                dialogType: common_1.DialogType.warning
                            });
                            if (result) {
                                if (this.selectedObjects.includes(config.sObject.name)) {
                                    config.sObjectId = '';
                                }
                                config.objectSet.objects.remove((object) => this.selectedObjects.includes(object.name));
                                services_1.DatabaseService.updateConfig(ws.id, config);
                                services_1.LogService.info(`${this.selectedObjects.length}  sobjects were removed from object set '${config.objectSet.name}'`);
                                this.actionFinish();
                            }
                        }
                    }
                    break;
                case 'exclude-selected-sobjects':
                    {
                        if (this.selectedObjects.length) {
                            config.objectSet.objects.forEach((object) => {
                                if (this.selectedObjects.includes(object.name)) {
                                    object.excluded = true;
                                }
                            });
                            services_1.DatabaseService.updateConfig(ws.id, config);
                            services_1.LogService.info(`${this.selectedObjects.length}  sobjects were excluded from object set '${config.objectSet.name}'`);
                            this.actionFinish();
                        }
                    }
                    break;
                case 'include-selected-sobjects':
                    {
                        if (this.selectedObjects.length) {
                            config.objectSet.objects.forEach((object) => {
                                if (this.selectedObjects.includes(object.name)) {
                                    object.excluded = false;
                                }
                            });
                            services_1.DatabaseService.updateConfig(ws.id, config);
                            services_1.LogService.info(`${this.selectedObjects.length}  sobjects were included in object set '${config.objectSet.name}'`);
                            this.actionFinish();
                        }
                    }
                    break;
            }
        }
        else if (args.args && !args.args[1]) {
            // Handle the config property change events ----------------------------------------------
            const updatedObject = args.args[0];
            if (updatedObject) {
                // Set config variables
                config.objectSetId = updatedObject.objectSetId;
                // Update config
                services_1.DatabaseService.updateConfig(ws.id, config);
                services_1.LogService.info(`Config  '${config.name}' has been updated.`);
                this.actionFinish(false);
            }
        }
    }
}
exports.ObjectManagerToolbarController = ObjectManagerToolbarController;
ObjectManagerToolbarController.$inject = ['$app', '$scope'];
ObjectManagerToolbarController.wizardStep = common_1.WizardStepByView[common_1.View.configuration];
//# sourceMappingURL=objectManagerToolbar.controller.js.map