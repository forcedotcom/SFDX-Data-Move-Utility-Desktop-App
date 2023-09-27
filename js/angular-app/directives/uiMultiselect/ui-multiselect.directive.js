"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uiMultiselectDirectiveModule = void 0;
const angular_1 = __importDefault(require("angular"));
const common_1 = require("../../../common");
const utils_1 = require("../../../utils");
class UiMultiselectDirective {
    constructor($app) {
        this.$app = $app;
        this.restrict = 'E';
        this.scope = {
            action: '@',
            options: '=',
            selected: '=',
            placeholder: '@'
        };
        this.template = `
        <div class="dropdown ui-multiselect">
            
            <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" ng-click="toggleDropdown()">
                {{ selectedCount() > 0 ? selectedCount() + ' items selected' : placeholder || 'Select Options' }}
            </button>
            
            <div class="dropdown-menu" ng-class="{ 'show': isOpen }" aria-labelledby="dropdownMenuButton">
                <input type="search" 
                    class="form-control" 
                    ng-model="filterValue" 
                    ng-model-options="{ debounce: ${common_1.CONSTANTS.INPUT_DEBOUNCE_DELAY} }" 
                    placeholder="{{ 'SEARCH_PLACEHOLDER' | translate }}" 
                    ng-change="updateFilteredOptions()" 
                    style="width: calc(100% - 20px); margin: 10px;">

                <div class="btn-group" role="group" aria-label="Filter options" style="margin: 0 10px;">
                    <input type="radio" class="btn-check" name="btnFilter" id="{{id}}btnAll" ng-model="filterType" value="All" ng-change="updateFilteredOptions()" checked>
                    <label class="btn btn-outline-primary btn-sm" for="{{id}}btnAll">{{ 'ALL' | translate }}</label>

                    <input type="radio" class="btn-check" name="btnFilter" id="{{id}}btnSelected" ng-model="filterType" value="Selected" ng-change="updateFilteredOptions()">
                    <label class="btn btn-outline-primary btn-sm" for="{{id}}btnSelected">{{ 'SELECTED' | translate }}</label>

                    <input type="radio" class="btn-check" name="btnFilter" id="{{id}}btnDeselected" ng-model="filterType" value="Deselected" ng-change="updateFilteredOptions()">
                    <label class="btn btn-outline-primary btn-sm" for="{{id}}btnDeselected">{{ 'DESELECTED' | translate }}</label>
                </div>

                <button class="btn btn-sm btn-link mb-2" ng-click="selectAll()">{{ 'SELECT_ALL' | translate }}</button>
                <button class="btn btn-sm btn-link mb-2 ms-1" ng-click="deselectAll()">{{ 'DESELECT_ALL' | translate }}</button>                

                <div class="dropdown-divider"></div>
                
                <div style="max-height: 300px; overflow-y: auto;">
                    <button class="dropdown-item" ng-repeat="option in filteredOptions track by option.value" ng-click="toggleSelection(option.value)">
                        <input type="checkbox" ng-checked="isSelected(option.value)"> {{ option.label }}
                    </button>
                </div>

            </div>
        </div>
    `;
    }
    link($scope, $element, $attrs) {
        $scope.id = utils_1.AngularUtils.setElementId($scope, $attrs);
        const self = this;
        $scope.filterType = 'All'; // default filter type
        $scope.isOpen = false;
        $scope.toggleDropdown = function () {
            $scope.isOpen = !$scope.isOpen;
        };
        $scope.selectedCount = function () {
            $scope.selected = $scope.selected || [];
            return $scope.selected.length;
        };
        $scope.toggleSelection = function (value) {
            $scope.selected = $scope.selected || [];
            const index = $scope.selected.indexOf(value);
            if (index > -1) {
                $scope.selected.splice(index, 1);
            }
            else {
                $scope.selected.push(value);
            }
            $scope.updateFilteredOptions();
        };
        $scope.isSelected = function (value) {
            $scope.selected = $scope.selected || [];
            return $scope.selected.includes(value);
        };
        $scope.selectAll = function () {
            $scope.selected = $scope.filteredOptions.map(option => option.value);
        };
        $scope.deselectAll = function () {
            $scope.selected = [];
        };
        $scope.updateFilteredOptions = function () {
            var _a;
            const searchText = (_a = $scope.filterValue) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            const optionsToFilter = (function () {
                var _a, _b;
                switch ($scope.filterType) {
                    case 'All': return $scope.options;
                    case 'Selected': return ((_a = $scope.options) === null || _a === void 0 ? void 0 : _a.filter(o => $scope.selected.includes(o.value))) || [];
                    case 'Deselected': return ((_b = $scope.options) === null || _b === void 0 ? void 0 : _b.filter(o => !$scope.selected.includes(o.value))) || [];
                    default: return $scope.options;
                }
            })();
            $scope.filteredOptions = (searchText
                ? optionsToFilter.filter(o => o.label.toLowerCase().includes(searchText))
                : optionsToFilter) || [];
        };
        // Watch for options changes to refresh the items
        $scope.$watchCollection('options', $scope.updateFilteredOptions);
        $scope.$watchCollection('selected', () => {
            self.$app.$broadcast.broadcastAction('selectedChanged', 'uiMultiselect', {
                action: $scope.action,
                args: $scope.selected,
                componentId: $attrs.id
            });
            $scope.updateFilteredOptions();
        });
        this.$app.$broadcast.onAction('setSelected', 'uiMultiselect', (args) => {
            if (args.componentId != $attrs.id)
                return;
            utils_1.AngularUtils.$apply($scope, () => {
                $scope.selected = args.args;
            });
        }, $scope);
        this.$app.$broadcast.onAction('setOptions', 'uiMultiselect', (args) => {
            if (args.componentId != $attrs.id)
                return;
            utils_1.AngularUtils.$apply($scope, () => {
                $scope.options = args.args;
            });
        }, $scope);
    }
}
exports.uiMultiselectDirectiveModule = angular_1.default.module('uiMultiselectDirectiveModule', [])
    .directive('uiMultiselect', ['$app', ($app) => new UiMultiselectDirective($app)]);
//# sourceMappingURL=ui-multiselect.directive.js.map