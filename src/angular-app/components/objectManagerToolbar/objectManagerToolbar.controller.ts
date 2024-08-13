
import { IScope } from 'angular';
import { BsButtonStyle, BsSize, DataSource, DialogType, ErrorSource, FaIcon, SetupFormOptions, View, WizardStepByView } from '../../../common';
import { IActionEventArgParam, ISetupFormOption, ScriptObject, ScriptObjectSet } from '../../../models';
import { DatabaseService, DialogService, LogService, ToastService } from '../../../services';
import { AngularUtils, CommonUtils, SfdmuUtils } from '../../../utils';
import { UiListController } from '../../directives';
import { IAppService } from '../../services';


export class ObjectManagerToolbarController {

	static $inject = ['$app', '$scope'];

	static wizardStep = WizardStepByView[View.configuration];

	constructor(private $app: IAppService, private $scope: IScope) { }

	objectManagerToolbarFormSetup: SetupFormOptions;
	objectManagerToolbarFormJson: any;

	selectedObjects: string[] = [];


	async $onInit() {

		LogService.info('Initializing ObjectManagerToolbarController...');

		this.setup();

		this.$app.$broadcast.onAction('buildViewComponents', null, () => {
			this.$app.$timeout(() => {
				this.setup();
			}, 500, false);
		}, this.$scope);

		this.$app.$broadcast.onAction('onChange', 'uiList', (args: IActionEventArgParam<any>) => {
			if (args.componentId == 'objectsList') {
				this.setup();
			}
		}, this.$scope);
	}

	/**
	 * Setup the component
	 */
	private setup() {
		if (global.appGlobal.wizardStep == ObjectManagerToolbarController.wizardStep) {

			const config = DatabaseService.getConfig();
			const uiListController = AngularUtils.$getController<UiListController>('#objectsList');
			if (uiListController) {
				this.selectedObjects = uiListController.getSelectedItems().map(item => item.value);
			}

			AngularUtils.$apply(this.$scope, () => {
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
						buttonStyle: BsButtonStyle.outlinePrimary,
						icon: FaIcon.arrowUp,
						buttonSize: BsSize.sm,
						disabled: !config.objectSetId || config.script.objectSets[0]?.id == config.objectSetId
					},
					moveObjectSetDown: {
						type: 'button',
						action: 'move-object-set-down',
						popover: this.$app.$translate.translate({ key: 'MOVE_ITEM_DOWN' }),
						buttonStyle: BsButtonStyle.outlinePrimary,
						icon: FaIcon.arrowDown,
						buttonSize: BsSize.sm,
						disabled: !config.objectSetId || config.script.objectSets[config.script.objectSets.length - 1]?.id == config.objectSetId
					},
					div1: {
						type: 'divider',
					},
					addObjectSet: {
						type: 'button',
						action: 'add-object-set',
						popover: this.$app.$translate.translate({ key: 'ADD_NEW' }),
						buttonStyle: BsButtonStyle.outlinePrimary,
						icon: FaIcon.plus,
						buttonSize: BsSize.sm
					},
					cloneObjectSet: {
						type: 'button',
						action: 'clone-object-set',
						popover: this.$app.$translate.translate({ key: 'CLONE_SELECTED' }),
						buttonStyle: BsButtonStyle.outlinePrimary,
						icon: FaIcon.copy,
						buttonSize: BsSize.sm
					},
					renameObjectSet: {
						type: 'button',
						action: 'rename-object-set',
						popover: this.$app.$translate.translate({ key: 'RENAME_SELECTED' }),
						buttonStyle: BsButtonStyle.outlinePrimary,
						icon: FaIcon.edit,
						buttonSize: BsSize.sm,
						disabled: !config.objectSetId
					},
					removeObjectSet: {
						type: 'button',
						action: 'remove-object-set',
						popover: this.$app.$translate.translate({ key: 'REMOVE_SELECTED' }),
						buttonStyle: BsButtonStyle.outlineDanger,
						icon: FaIcon.minus,
						buttonSize: BsSize.sm,
						disabled: !config.objectSetId
					},
					div2: {
						type: 'divider',
					},
					addObjectsToObjectSet: {
						type: 'button',
						action: 'add-objects-to-object-set',
						popover: this.$app.$translate.translate({ key: 'DIALOG.OBJECT_SET.ADD_OBJECTS_TITLE' }),
						buttonStyle: BsButtonStyle.outlinePrimary,
						icon: FaIcon.addItemToList,
						buttonSize: BsSize.sm,
						disabled: !config.objectSetId
					},
					removeObjectsFromObjectSet: {
						type: 'button',
						action: 'remove-objects-from-object-set',
						popover: this.$app.$translate.translate({ key: 'DIALOG.OBJECT_SET.REMOVE_OBJECTS_TITLE' }),
						buttonStyle: BsButtonStyle.outlineDanger,
						icon: FaIcon.removeItemFromList,
						buttonSize: BsSize.sm,
						disabled: !config.objectSetId || !config.objectSet.objects.length || !this.selectedObjects.length
					},
					excludeSelectedSObjects: {
						type: 'button',
						action: 'exclude-selected-sobjects',
						popover: this.$app.$translate.translate({ key: 'EXCLUDE_SELECTED_SOBJECTS' }),
						buttonStyle: BsButtonStyle.outlineDanger,
						icon: FaIcon.ban,
						buttonSize: BsSize.sm,
						disabled: !config.objectSetId || !this.selectedObjects.length
					},
					includeSelectedSObjects: {
						type: 'button',
						action: 'include-selected-sobjects',
						popover: this.$app.$translate.translate({ key: 'INCLUDE_SELECTED_SOBJECTS' }),
						buttonStyle: BsButtonStyle.outlinePrimary,
						icon: FaIcon.check,
						buttonSize: BsSize.sm,
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
	private displayConfigurationErrors() {
		const config = DatabaseService.getConfig();

		// General errors in Object Sets
		if (!config.script.objectSets.flatBy('objects', ScriptObject).some(object => !object.excluded)) {
			this.$app.setViewErrors(ErrorSource.objectSets);
		} else {
			this.$app.clearViewErrors(ErrorSource.objectSets);
		}
	}

	/**
	 * Makes all necessary final actions after the action is finished
	 * @param showToast 
	 */
	private actionFinish(showToast = true) {
		this.$app.clearViewErrors();
		this.displayConfigurationErrors();
		this.$app.buildAllApplicationViewComponents();
		this.$app.buildFooter();
		this.$app.buildMainToolbar();
		showToast && ToastService.showSuccess();
	}

	// Event handlers --------------------------------------------------
	/**
	 * Handle object manager toolbar change
	 * @param args  The event arguments 
	 */
	async handleObjectManagerToolbarChange(args: IActionEventArgParam<any>) {

		const ws = DatabaseService.getWorkspace();
		const config = DatabaseService.getConfig();

		if (args.args && args.args[1]) {
			// Handle the button events ----------------------------------------------
			const buttonFormSetupOption = args.args[1] as ISetupFormOption;
			switch (buttonFormSetupOption.action) {

				case 'add-object-set': {
					const name = await this.$app.$edit.showDialogAsync({
						dialogType: 'inputbox',
						promptMessage: this.$app.$translate.translate({ key: 'DIALOG.OBJECT_SET.NEW' }),
						title: this.$app.$translate.translate({ key: "DIALOG.OBJECT_SET.NEW_TITLE" }),
						isRequired: true,
					});
					if (name) {
						const objectSet = new ScriptObjectSet({
							name: name as string,
							id: CommonUtils.randomString()
						});
						config.script.objectSets.push(objectSet);
						config.objectSetId = objectSet.id;
						DatabaseService.updateConfig(ws.id, config);
						LogService.info(`Object set '${config.objectSet.name}' added.`);
						this.actionFinish();
					}

				} break;

				case 'clone-object-set': {
					const name = await this.$app.$edit.showDialogAsync({
						dialogType: 'inputbox',
						promptMessage: this.$app.$translate.translate({ key: 'DIALOG.OBJECT_SET.NEW' }),
						title: this.$app.$translate.translate({ key: "DIALOG.OBJECT_SET.CLONE_TITLE" }),
						defaultValue: config.objectSet.name + '-copy',
						isRequired: true,
					});
					if (name) {
						DatabaseService.cloneObjectSet(config.objectSet.id, name as string);						
						DatabaseService.updateConfig(ws.id, config);
						LogService.info(`Object set cloned: '${config.objectSet.name}' -> '${name}'`);
						this.actionFinish();
					}

				} break;

				case 'remove-object-set': {
					const result = DialogService.showPromptDialog({
						titleKey: "DIALOG.OBJECT_SET.DELETE_TITLE",
						messageKey: "DIALOG.OBJECT_SET.DELETE",
						dialogType: DialogType.warning,
						params: {
							OBJECT_SET_NAME: config.objectSet.name
						}
					});
					if (result) {
						const oldName = config.objectSet.name;
						config.script.objectSets.removeByProps({ id: config.objectSetId });
						config.objectSetId = config.script.objectSets[0]?.id || '';
						DatabaseService.updateConfig(ws.id, config);
						LogService.info(`Object set '${oldName}' removed.`);
						this.actionFinish();
					}

				} break;

				case 'rename-object-set': {
					const name = await this.$app.$edit.showDialogAsync({
						dialogType: 'inputbox',
						promptMessage: this.$app.$translate.translate({ key: 'DIALOG.OBJECT_SET.RENAME' }),
						title: this.$app.$translate.translate({ key: "DIALOG.OBJECT_SET.RENAME_TITLE" }),
						isRequired: true,
						defaultValue: config.objectSet.name
					});
					if (name && name !== config.objectSet.name) {
						const oldName = config.name;
						config.objectSet.name = name as string;
						DatabaseService.updateConfig(ws.id, config);
						LogService.info(`Object set renamed: ${oldName} -> ${name}`);
						this.actionFinish();
					}
				} break;

				case 'move-object-set-up': {
					const index = config.script.objectSets.findIndex(os => os.id == config.objectSetId);
					if (index > 0) {
						config.script.objectSets.move(index, index - 1);
						DatabaseService.updateConfig(ws.id, config);
						LogService.info(`Object set '${config.objectSet.name}' moved up.`);
						this.actionFinish();
					}
				} break;

				case 'move-object-set-down': {
					const index = config.script.objectSets.findIndex(os => os.id == config.objectSetId);
					if (index < config.script.objectSets.length - 1) {
						config.script.objectSets.move(index, index + 1);
						DatabaseService.updateConfig(ws.id, config);
						LogService.info(`Object set '${config.objectSet.name}' moved down.`);
						this.actionFinish();
					}
				} break;

				case 'add-objects-to-object-set': {
					const objects = await this.$app.$edit.showDialogAsync({
						dialogType: 'multiselect',
						title: this.$app.$translate.translate({ key: "DIALOG.OBJECT_SET.ADD_OBJECTS_TITLE" }),
						promptMessage: this.$app.$translate.translate({ key: 'DIALOG.OBJECT_SET.ADD_OBJECTS' }),
						selectBoxOptions: [...this.$app.orgDescribe.objectsMap.values()]
							.filter(describe => describe.dataSource == DataSource.both)
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
						config.objectSet.objects.push(...(objects as string[]).map(name => {
							return new ScriptObject({
								name: name,
								id: CommonUtils.randomString(),
								defaultExternalId: SfdmuUtils.getDefaultExternalId(name, this.$app.orgDescribe),
								fields: ['Id'],
								where: '',
								query: `SELECT Id FROM ${name}`
							});
						}));
						DatabaseService.updateConfig(ws.id, config);
						LogService.info(`${objects.length} sobjects were added to object set '${config.objectSet.name}'`);
						this.actionFinish();
					}
				} break;

				case 'remove-objects-from-object-set': {
					if (this.selectedObjects.length) {
						const result = DialogService.showPromptDialog({
							titleKey: "DIALOG.OBJECT_SET.REMOVE_OBJECTS_TITLE",
							messageKey: "DIALOG.OBJECT_SET.REMOVE_OBJECTS",
							params: {
								OBJECT_SET_NAME: config.objectSet.name,
								OBJECTS_COUNT: this.selectedObjects.length
							},
							dialogType: DialogType.warning
						});
						if (result) {
							if (this.selectedObjects.includes(config.sObject.name)) {
								config.sObjectId = '';
							}
							config.objectSet.objects.remove((object: ScriptObject) => this.selectedObjects.includes(object.name));
							DatabaseService.updateConfig(ws.id, config);
							LogService.info(`${this.selectedObjects.length}  sobjects were removed from object set '${config.objectSet.name}'`);
							this.actionFinish();
						}
					}
				} break;

				case 'exclude-selected-sobjects': {
					if (this.selectedObjects.length) {
						config.objectSet.objects.forEach((object: ScriptObject) => {
							if (this.selectedObjects.includes(object.name)) {
								object.excluded = true;
							}
						});
						DatabaseService.updateConfig(ws.id, config);
						LogService.info(`${this.selectedObjects.length}  sobjects were excluded from object set '${config.objectSet.name}'`);
						this.actionFinish();
					}
				} break;

				case 'include-selected-sobjects': {
					if (this.selectedObjects.length) {
						config.objectSet.objects.forEach((object: ScriptObject) => {
							if (this.selectedObjects.includes(object.name)) {
								object.excluded = false;
							}
						});
						DatabaseService.updateConfig(ws.id, config);
						LogService.info(`${this.selectedObjects.length}  sobjects were included in object set '${config.objectSet.name}'`);
						this.actionFinish();
					}
				} break;
			}
		} else if (args.args && !args.args[1]) {

			// Handle the config property change events ----------------------------------------------
			const updatedObject = args.args[0];
			if (updatedObject) {

				// Set config variables
				config.objectSetId = updatedObject.objectSetId;

				// Update config
				DatabaseService.updateConfig(ws.id, config);
				LogService.info(`Config  '${config.name}' has been updated.`);
				this.actionFinish(false);
			}
		}

	}

}