import angular, { IAugmentedJQuery } from 'angular';
import { CONSTANTS } from '../../../common';
import { IOption } from '../../../models';
import { AngularUtils, CommonUtils } from '../../../utils';
import { IAppService } from '../../services';

interface IUIMultiselectScope extends angular.IScope {

    action: string;
    options: IOption[];
    selected: string[];
    placeholder: string;
    id: string;
    filterType: 'All' | 'Selected' | 'Deselected';
    isOpen: boolean;
    filterValue: string;
    filteredOptions: IOption[];

    toggleDropdown(): void;
    selectedCount(): number;
    toggleSelection(value: string): void;
    isSelected(value: string): boolean;
    selectAll(): void;
    deselectAll(): void;
    updateFilteredOptions(): void;
}


class UiMultiselectDirective implements angular.IDirective {
    restrict = 'E';
    scope = {
        id: '@',
        action: '@',
        options: '=',
        selected: '=',
        placeholder: '@'
    };
    template = `
        <div class="dropdown ui-multiselect">
            
            <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" ng-click="toggleDropdown()">
                {{ selectedCount() > 0 ? selectedCount() + ' items selected' : placeholder || 'Select Options' }}
            </button>
            
            <div class="dropdown-menu" ng-class="{ 'show': isOpen }" aria-labelledby="dropdownMenuButton">
                <input type="search" 
                    class="form-control" 
                    ng-model="filterValue" 
                    ng-model-options="{ debounce: ${CONSTANTS.INPUT_DEBOUNCE_DELAY} }" 
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

    constructor(private $app: IAppService) { }

    link($scope: IUIMultiselectScope, $element: IAugmentedJQuery, $attrs: angular.IAttributes) {

        $scope.id ||= CommonUtils.randomString();

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

        $scope.toggleSelection = function (value: string) {
            $scope.selected = $scope.selected || [];
            const index = $scope.selected.indexOf(value);
            if (index > -1) {
                $scope.selected.splice(index, 1);
            } else {
                $scope.selected.push(value);
            }
            $scope.updateFilteredOptions();
        };

        $scope.isSelected = function (value: string) {
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

            const searchText = $scope.filterValue?.toLowerCase();
            const optionsToFilter = (function () {
                switch ($scope.filterType) {
                    case 'All': return $scope.options;
                    case 'Selected': return $scope.options?.filter(o => $scope.selected.includes(o.value)) || [];
                    case 'Deselected': return $scope.options?.filter(o => !$scope.selected.includes(o.value)) || [];
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
            if (args.componentId != $attrs.id) return;
            AngularUtils.$apply($scope, () => {
                $scope.selected = args.args;
            });
        }, $scope);

        this.$app.$broadcast.onAction('setOptions', 'uiMultiselect', (args) => {
            if (args.componentId != $attrs.id) return;
            AngularUtils.$apply($scope, () => {
                $scope.options = args.args;
            });
        }, $scope);


    }
}

export const uiMultiselectDirectiveModule = angular.module('uiMultiselectDirectiveModule', [])
    .directive('uiMultiselect', ['$app', ($app) => new UiMultiselectDirective($app)]);
