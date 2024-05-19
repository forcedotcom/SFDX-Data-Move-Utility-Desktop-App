import angular from 'angular';
import { ActionEvent, BsButtonStyle, BsSize, FaIcon, SetupFormOptions } from '../../../common';
import { IActionEventArgParam, IEditFormResult, IFormController } from '../../../models';
import { AngularUtils, CommonUtils } from '../../../utils';


interface IUiEditFormArrayScope extends angular.IScope {
	newItemEditorId: string;
	id: string;
}

export class UiEditFormArrayController implements angular.IController, IFormController {

	static $inject = ["$scope"];

	jsonArray: any[];

	setup: SetupFormOptions;
	arraySetup: SetupFormOptions;
	BsButtonStyle = BsButtonStyle;
	BsSize = BsSize;
	FaIcon = FaIcon;
	newObject: any = {};
	id: string;

	onChange: ActionEvent<any>;
	onEdit: ActionEvent<any>;
	onDelete: ActionEvent<any>;
	onNewChange: ActionEvent<any>;
	onNewAdd: ActionEvent<any>;

	constructor(private $scope: IUiEditFormArrayScope) {

	}

	// Initializes each property of a new object with the default value only for the first time if it is not defined
	initNewObject() {
		for (const key in this.setup) {
			this.newObject ||= {};
			this.newObject[key] =
				this.newObject[key] == undefined ? (this.setup[key].type == 'toggle' ? false : undefined)
					: this.newObject[key];
		}
		this.resetValidation();
	}

	setNewObject(newObject: any) {
		this.newObject = newObject;
		this.resetValidation();
	}

	addItem() {
		if (this.validate()) {
			const clonedObject = CommonUtils.deepClone(this.newObject);
			if (this.onNewAdd) {
				this.onNewAdd({
					args: {
						args: [clonedObject],
						componentId: this.id
					}
				});
			}
			this.jsonArray.push(clonedObject);
			this.handleChange('add');
			this.newObject = {};
			this.initNewObject();
		}
	}

	editItem(index: number) {
		if (this.onEdit) {
			const edited: IEditFormResult = this.onEdit({
				args: {
					args: [this.jsonArray[index]],
					componentId: this.id
				}
			});
			if (edited instanceof Promise) {
				edited.then((edited: IEditFormResult) => {
					if (edited.result) {
						Object.assign(this.jsonArray[index], edited.data);
						this.handleChange('edit');
					}
				});
				return;
			}
			if (edited.result) {
				Object.assign(this.jsonArray[index], edited.data);
				this.handleChange('edit');
			}
		}
	}

	moveItemUp(index: number) {
		const item = this.jsonArray[index];
		this.jsonArray.splice(index, 1);
		this.jsonArray.splice(index - 1, 0, item);
		this.handleChange('move-up');
	}

	moveItemDown(index: number) {
		const item = this.jsonArray[index];
		this.jsonArray.splice(index, 1);
		this.jsonArray.splice(index + 1, 0, item);
		this.handleChange('move-down');
	}

	deleteItem(index: number) {
		let allowDelete = true;
		if (this.onDelete) {
			allowDelete = !this.onDelete({
				args: {
					args: [this.jsonArray[index]],
					componentId: this.id
				}
			});
		}
		if (allowDelete) {
			this.jsonArray.splice(index, 1);
			this.handleChange('delete');
		}
	}

	validate() {
		const newObjectEditorController = AngularUtils.$getController<IFormController>(`#${this.$scope.newItemEditorId}`);
		return newObjectEditorController && newObjectEditorController.validate();
	}

	resetValidation(): void {
		const newObjectEditorController = AngularUtils.$getController<IFormController>(`#${this.$scope.newItemEditorId}`);
		newObjectEditorController && newObjectEditorController.resetValidation();
	}

	handleNewObjectChange(args: IActionEventArgParam<any>) {
		this.newObject = args.args[0];
		if (this.onNewChange) {
			this.onNewChange({
				args: {
					args: [this.newObject],
					componentId: this.id
				}
			});
		}
	}

	handleChange(action: string) {
		if (this.onChange) {
			this.onChange({
				args: {
					args: [this.jsonArray],
					componentId: this.id,
					action
				}
			});
		}
	}
}

export class UiEditFormArray implements angular.IDirective {
	restrict = 'E';
	controller = UiEditFormArrayController;
	controllerAs = '$ctrl';
	bindToController = true;
	scope = {
		id: '@',
		label: '@',

		setup: '<',
		arraySetup: '<',

		jsonArray: '=',
		newObject: '<',

		formClass: '@',
		itemsContainerClass: '@',
		itemsContainerStyle: '@',


		onNewChange: '&',
		onNewAdd: '&',
		onChange: '&',
		onEdit: '&',
		onDelete: '&',

		disabled: '=',
		allowEdit: '<',
		allowMoveUp: '<',
		allowMoveDown: '<',

		hidden: '<',
		hiddenNew: '<',
		hiddenJsonArray: '<',

		hiddenNewMessage: '@',
		hiddenJsonArrayMessage: '@',
		hiddenMessage: '@'

	};

	template = `		
		<label class="form-label fw-bold" ng-if="$ctrl.label">{{ $ctrl.label }}</label>

		<div ng-if="!$ctrl.hidden">	
			
			<!-- Json Array -->
			<div ng-if="!$ctrl.hiddenJsonArray" class="{{ $ctrl.itemsContainerClass }} overflow-y-auto  card p-2" style="{{ $ctrl.itemsContainerStyle }}">
				<div ng-if="$ctrl.jsonArray.length > 0" ng-repeat="item in $ctrl.jsonArray track by $index" class="d-flex align-items-end mb-2">
					<ui-json-editor 
						disabled="true" 
						hide-labels="true"
						setup="$ctrl.arraySetup" 
						json="item"
						class="d-flex align-items-end" form-class="me-1 {{ $ctrl.formClass }}">
					</ui-json-editor>
					<ui-button button-style="{{ $ctrl.BsButtonStyle.danger }}" class="pe-1" size="{{ $ctrl.BsSize.sm }}" icon="{{ $ctrl.FaIcon.trash }}" tooltip="{{ 'DELETE' | translate }}" ng-click="$ctrl.deleteItem($index)">
					</ui-button>
					<ui-button ng-if="$ctrl.allowEdit" class="pe-1" button-style="{{ $ctrl.BsButtonStyle.primary }}" size="{{ $ctrl.BsSize.sm }}" icon="{{ $ctrl.FaIcon.edit }}" tooltip="{{ 'EDIT' | translate }}" ng-click="$ctrl.editItem($index)">
					</ui-button>
					<ui-button ng-if="$ctrl.allowMoveUp && $index > 0" class="pe-1" button-style="{{ $ctrl.BsButtonStyle.secondary }}" size="{{ $ctrl.BsSize.sm }}" icon="{{ $ctrl.FaIcon.arrowUp }}"  ng-click="$ctrl.moveItemUp($index)">
					</ui-button>
					<ui-button ng-if="$ctrl.allowMoveDown &&  $index < $ctrl.jsonArray.length - 1" button-style="{{ $ctrl.BsButtonStyle.secondary }}" size="{{ $ctrl.BsSize.sm }}" icon="{{ $ctrl.FaIcon.arrowDown }}"  ng-click="$ctrl.moveItemDown($index)">
					</ui-button>
				</div>
				<div ng-if="$ctrl.jsonArray.length == 0">
					{{ 'NO_ITEMS' | translate }}
				</div>
			</div>
			<!-- Hidden Json Array Message -->
			<div ng-if="$ctrl.hiddenJsonArray && !$ctrl.hiddenNew" class="alert alert-info mt-2" ng-bind-html="$ctrl.hiddenJsonArrayMessage"></div>

			<div ng-if="!$ctrl.hiddenNew" class="d-flex align-items-end">
				<ui-json-editor 
					disabled="$ctrl.disabled"
					class="d-flex align-items-end" form-class="me-1 {{ $ctrl.formClass }}"
					id="{{ newItemEditorId }}" 
					setup="$ctrl.setup" 
					json="$ctrl.newObject" 
					on-change="$ctrl.handleNewObjectChange(args)">
				</ui-json-editor>
				<ui-button button-style="{{ $ctrl.BsButtonStyle.primary }}" size="{{ $ctrl.BsSize.sm }}" icon="{{ $ctrl.FaIcon.plus }}" tooltip="{{ 'ADD' | translate }}" ng-click="$ctrl.addItem()">
			</div>
			<div ng-if="$ctrl.hiddenNew && !$ctrl.hiddenJsonArray" class="alert alert-info mt-2" ng-bind-html="$ctrl.hiddenNewMessage"></div>

		</div>

		<div ng-if="$ctrl.hidden"  class="alert alert-info mt-2" ng-bind-html="$ctrl.hiddenMessage"></div>
    `;

	link = ($scope: IUiEditFormArrayScope, $element: angular.IAugmentedJQuery, $attrs: angular.IAttributes, $ctrl: UiEditFormArrayController) => {
		$scope.id ||= CommonUtils.randomString();
		$scope.newItemEditorId = 'newItem-' + $scope.id;

		$scope.$watch(() => $ctrl.setup, () => {
			$ctrl.initNewObject();
		});

	}
}

