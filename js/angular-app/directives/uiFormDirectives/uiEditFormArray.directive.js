"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiEditFormArray = exports.UiEditFormArrayController = void 0;
const common_1 = require("../../../common");
const utils_1 = require("../../../utils");
class UiEditFormArrayController {
    constructor($scope) {
        this.$scope = $scope;
        this.BsButtonStyle = common_1.BsButtonStyle;
        this.BsSize = common_1.BsSize;
        this.FaIcon = common_1.FaIcon;
        this.newObject = {};
    }
    // Initializes each property of a new object with the default value only for the first time if it is not defined
    initNewObject() {
        for (const key in this.setup) {
            this.newObject || (this.newObject = {});
            this.newObject[key] =
                this.newObject[key] == undefined ? (this.setup[key].type == 'toggle' ? false : undefined)
                    : this.newObject[key];
        }
        this.resetValidation();
    }
    setNewObject(newObject) {
        this.newObject = newObject;
        this.resetValidation();
    }
    addItem() {
        if (this.validate()) {
            const clonedObject = utils_1.CommonUtils.deepClone(this.newObject);
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
    editItem(index) {
        if (this.onEdit) {
            const edited = this.onEdit({
                args: {
                    args: [this.jsonArray[index]],
                    componentId: this.id
                }
            });
            if (edited instanceof Promise) {
                edited.then((edited) => {
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
    moveItemUp(index) {
        const item = this.jsonArray[index];
        this.jsonArray.splice(index, 1);
        this.jsonArray.splice(index - 1, 0, item);
        this.handleChange('move-up');
    }
    moveItemDown(index) {
        const item = this.jsonArray[index];
        this.jsonArray.splice(index, 1);
        this.jsonArray.splice(index + 1, 0, item);
        this.handleChange('move-down');
    }
    deleteItem(index) {
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
        const newObjectEditorController = utils_1.AngularUtils.$getController(`#${this.$scope.newItemEditorId}`);
        return newObjectEditorController && newObjectEditorController.validate();
    }
    resetValidation() {
        const newObjectEditorController = utils_1.AngularUtils.$getController(`#${this.$scope.newItemEditorId}`);
        newObjectEditorController && newObjectEditorController.resetValidation();
    }
    handleNewObjectChange(args) {
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
    handleChange(action) {
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
exports.UiEditFormArrayController = UiEditFormArrayController;
UiEditFormArrayController.$inject = ["$scope"];
class UiEditFormArray {
    constructor() {
        this.restrict = 'E';
        this.controller = UiEditFormArrayController;
        this.controllerAs = '$ctrl';
        this.bindToController = true;
        this.scope = {
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
        this.template = `		
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
        this.link = ($scope, $element, $attrs, $ctrl) => {
            $scope.id || ($scope.id = utils_1.CommonUtils.randomString());
            $scope.newItemEditorId = 'newItem-' + $scope.id;
            $scope.$watch(() => $ctrl.setup, () => {
                $ctrl.initNewObject();
            });
        };
    }
}
exports.UiEditFormArray = UiEditFormArray;
//# sourceMappingURL=uiEditFormArray.directive.js.map