import angular from 'angular';
import { ActionEvent, SetupFormOptions } from '../../../common';
import { IActionEventArgParam, IFormController } from '../../../models';
import { AngularUtils, CommonUtils } from '../../../utils';


interface IUiEditFormArrayScope extends angular.IScope {

	setup: SetupFormOptions;
	arraySetup: SetupFormOptions;

	jsonArray: any[];
	onChange: ActionEvent<any>;
	onNewObjectChange: ActionEvent<any>;

	newItemEditorId: string;
}

export class UiEditFormArrayController implements angular.IController, IFormController {

	static $inject = ["$scope"];

	jsonArray: any[];

	setup: SetupFormOptions;
	arraySetup: SetupFormOptions;

	onChange: ActionEvent<any>;
	onNewObjectChange: ActionEvent<any>;

	newObject: any = {};

	constructor(private $scope: IUiEditFormArrayScope) { }

	// Initializes each property of a new object with the default value only for the first time if it is not defined
	initNewObject() {
		for (const key in this.setup) {
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
			this.jsonArray.push(clonedObject);
			this.handleChange();
			this.newObject = {};
			this.initNewObject();
		}
	}

	deleteItem(index: number) {
		this.jsonArray.splice(index, 1);
		this.handleChange();
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
		if (this.onNewObjectChange) {
			this.onNewObjectChange({
				args: {
					args: [this.newObject]
				}
			});
		}
	}

	handleChange() {
		if (this.onChange) {
			this.onChange({
				args: {
					args: [this.jsonArray]
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
		setup: '=',
		arraySetup: '=',
		jsonArray: '=',
		onChange: '&',
		formClass: '@',
		onNewObjectChange: '&',
		itemsContainerClass: '@',
		itemsContainerStyle: '@',
		label: '@',
		disabled: '='
	};

	template = `
		<label class="form-label fw-bold" ng-if="$ctrl.label">{{ $ctrl.label }}</label>
		<div class="{{ $ctrl.itemsContainerClass }} overflow-y-auto" style="{{ $ctrl.itemsContainerStyle }}">
			<div ng-if="$ctrl.jsonArray.length > 0" ng-repeat="item in $ctrl.jsonArray track by $index" class="d-flex">
				<ui-json-editor 
					disabled="true" 
					hide-labels="true"
					setup="$ctrl.arraySetup" 
					json="item"
					class="d-flex align-items-end" form-class="ms-3 {{ $ctrl.formClass }}">
				</ui-json-editor>
				<button class="btn btn-link text-danger ms-2 mt-2" ng-click="$ctrl.deleteItem($index)">
					{{ 'DELETE' | translate }}
				</button>
			</div>
			<div ng-if="$ctrl.jsonArray.length == 0">
				{{ 'NO_ITEMS_SELECTED' | translate }}
			</div>
		</div>
		<hr />
		<div class="d-flex">
			<ui-json-editor 
				disabled="$ctrl.disabled"
				class="d-flex align-items-end" form-class="ms-3 {{ $ctrl.formClass }}"
				id="{{ newItemEditorId }}" 
				setup="$ctrl.setup" 
				json="$ctrl.newObject" 
				on-change="$ctrl.handleNewObjectChange(args)">
			</ui-json-editor>
			<button class="btn btn-link text-primary ms-2 mt-2" ng-click="$ctrl.addItem()">
				{{ 'ADD' | translate }}
			</button>
		</div>
    `;

	link = ($scope: IUiEditFormArrayScope, $element: angular.IAugmentedJQuery, $attrs: angular.IAttributes, $ctrl: UiEditFormArrayController) => {

		$scope.newItemEditorId = 'newItem-' + AngularUtils.setElementId($scope, $attrs);

		$scope.$watch(() => $ctrl.setup, () => {
			$ctrl.initNewObject();
		});

	}
}

