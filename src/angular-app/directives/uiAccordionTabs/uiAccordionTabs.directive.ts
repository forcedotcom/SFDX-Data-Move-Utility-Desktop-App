import angular from 'angular';
import { ITabItem } from '../../../models';
import { CommonUtils } from '../../../utils';

type UiAccordionTabsController = angular.IController & {
    addItem: (item: ITabItem) => void;
    selectItem: (item: ITabItem) => void;
};

interface IAccordionTabsScope extends angular.IScope {
    items: ITabItem[];
    allowMultipleOpenTabs: boolean;
}

export function uiAccordionTabs(): angular.IDirective {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            id: '@',
            selectedItem: '=',
            allowMultipleOpenTabs: '='
        },
        template: `
            <div class="accordion" ng-transclude>
                <!-- Accordion tabs placeholder -->
            </div>
        `,
        controller: function ($scope: IAccordionTabsScope) {

            $scope.items = [];
            $scope.id ||= CommonUtils.randomString();

            this.addItem = function (item: ITabItem) {
                $scope.items.push(item);
                if ($scope.items.length === 1 && !$scope.selectedItem) {
                    this.selectItem(item);
                } else if (!!$scope.selectedItem
                    && $scope.selectedItem === $scope.items.indexOf(item)) {
                    this.selectItem(item);
                }
            };

            let _supressSelectEvent = false;
            this.selectItem = function (item: ITabItem, supressNextEvent = true) {
                if (!item) return;
                angular.forEach($scope.items, (i) => {
                    i.active = $scope.allowMultipleOpenTabs ? i.active : false;
                });
                item.active = $scope.allowMultipleOpenTabs ? !item.active : true;
                if ($scope.selectedItem != undefined) {
                    $scope.selectedItem = $scope.items.indexOf(item);
                }
                _supressSelectEvent = supressNextEvent;
            };

            $scope.$watch('selectedItem', (newVal: number) => {
                if (_supressSelectEvent) {
                    _supressSelectEvent = false;
                    return;
                }
                this.selectItem($scope.items[newVal], false);
            });

        }
    };
}

export function uiAccordionTab(): angular.IDirective {
    return {
        restrict: 'E',
        transclude: true,
        require: '^uiAccordionTabs',
        scope: {
            title: '@',
            tabId: '@'
        },
        template: `
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button" type="button" ng-click="selectItem()"
                        ng-class="{'collapsed': !active}" aria-expanded="{{active}}">
                        {{title}}
                    </button>
                </h2>
                <div class="accordion-collapse collapse" ng-class="{'show': active}">
                    <div class="accordion-body" ng-transclude>
                        <!-- Accordion item content placeholder -->
                    </div>
                </div>
            </div>
        `,
        link: function ($scope: ITabItem, $elem, $attrs, $uiAccordionCtrl: UiAccordionTabsController) {

            $scope.tabId = $scope.tabId || CommonUtils.randomString();
            $uiAccordionCtrl.addItem($scope);

            $scope.selectItem = function () {
                $uiAccordionCtrl.selectItem($scope);
            };
        }
    };
}

export const uiAccordionDirectiveModule = angular.module('uiAccordionDirectiveModule', [])
    .directive('uiAccordionTabs', uiAccordionTabs)
    .directive('uiAccordionTab', uiAccordionTab);
